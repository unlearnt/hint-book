#!/usr/bin/env python3
"""End-to-end runner for the eval pipeline: baseline -> (score -> propose -> A/B -> pick winner) × N.

Every step sweeps every configured state (eval/runner.py::TARGETS) and aggregates
the resulting metrics into a single report — so the prompt proposals generated
by iterate.py are tuned for the cross-state average, not any one jurisdiction.

By default the propose → A/B → pick-winner loop runs 3 rounds. After each round,
the variant with the highest aggregated `per_check_accuracy` (including the
current base in the pool, so we never regress) becomes the base for the next
round. The final winner is reported at the end.

Usage (run from repo root, inside the .venv):
    python eval/run_pipeline.py
    python eval/run_pipeline.py --rounds 5 --proposals 2
    python eval/run_pipeline.py --base v1_some_winner --skip-baseline
    python eval/run_pipeline.py --metric tamper_recall    # optimise a different metric
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

EVAL_DIR = Path(__file__).resolve().parent
PROMPTS_DIR = EVAL_DIR / "prompts"
RUNS_DIR = EVAL_DIR / "runs"

# Metrics where smaller = better; everything else is treated as larger = better.
LOWER_IS_BETTER = {"unverifiable_rate", "latency_ms_p50", "api_fails", "parse_fails"}


def banner(title: str) -> None:
    bar = "=" * 72
    print(f"\n{bar}\n  {title}\n{bar}", flush=True)


def step(round_idx: int, n: int, title: str) -> None:
    print(f"\n── round {round_idx} · step {n}: {title} ──", flush=True)


def run(cmd: list[str]) -> None:
    print(f"  $ {' '.join(cmd)}\n", flush=True)
    subprocess.run(cmd, check=True)


def snapshot_variants() -> set[str]:
    return {p.stem for p in PROMPTS_DIR.glob("v*.py")}


def find_latest_report(variant: str) -> dict | None:
    if not RUNS_DIR.is_dir():
        return None
    needle = f"__{variant}__"
    matching = sorted(d.name for d in RUNS_DIR.iterdir() if d.is_dir() and needle in d.name)
    if not matching:
        return None
    rp = RUNS_DIR / matching[-1] / "report.json"
    if not rp.is_file():
        return None
    return json.loads(rp.read_text(encoding="utf-8"))


def score_of(variant: str, metric: str) -> float | None:
    rep = find_latest_report(variant)
    if not rep:
        return None
    return (rep.get("overall") or {}).get(metric)


def better(a: float, b: float, metric: str) -> bool:
    return a < b if metric in LOWER_IS_BETTER else a > b


def fmt(v: float | None) -> str:
    if v is None:
        return "—"
    return f"{v * 100:.2f}%" if 0 <= v <= 1 else f"{v:.2f}"


def pick_winner(
    candidates: list[str], metric: str
) -> tuple[str, float | None, list[tuple[str, float | None]]]:
    """Return (winner, winner_score, all_scores). Falls back to first candidate on full tie/None."""
    scored = [(v, score_of(v, metric)) for v in candidates]
    valid = [(v, s) for v, s in scored if s is not None]
    if not valid:
        return candidates[0], None, scored
    winner, winner_score = valid[0]
    for v, s in valid[1:]:
        if better(s, winner_score, metric):
            winner, winner_score = v, s
    return winner, winner_score, scored


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="v0_baseline", help="starting variant for round 1")
    ap.add_argument("--proposals", type=int, default=1, help="proposals generated per round")
    ap.add_argument("--rounds", type=int, default=3, help="number of propose → A/B → pick rounds")
    ap.add_argument(
        "--metric",
        default="per_check_accuracy",
        help=(
            "overall.<metric> used to pick each round's winner. Lower-is-better "
            f"metrics: {sorted(LOWER_IS_BETTER)}; everything else is higher-is-better."
        ),
    )
    ap.add_argument(
        "--skip-baseline",
        action="store_true",
        help="Skip the initial baseline run+score (assume --base already has report.json).",
    )
    args = ap.parse_args()

    if args.rounds < 1:
        print("--rounds must be >= 1", file=sys.stderr)
        return 2

    py = sys.executable
    current_base = args.base

    if not args.skip_baseline:
        banner(f"Baseline · variant={current_base} · all configured states")
        run([py, str(EVAL_DIR / "runner.py"), "--variant", current_base])
        banner("Score baseline (aggregated across states)")
        run([py, str(EVAL_DIR / "metrics.py")])

    history: list[dict] = [
        {"round": 0, "base": current_base, "score": score_of(current_base, args.metric)}
    ]

    for r in range(1, args.rounds + 1):
        banner(
            f"ROUND {r}/{args.rounds}  ·  base={current_base}  "
            f"·  {args.metric}={fmt(score_of(current_base, args.metric))}"
        )

        step(r, 1, f"Generate {args.proposals} document-agnostic proposal(s)")
        before = snapshot_variants()
        run(
            [
                py,
                str(EVAL_DIR / "iterate.py"),
                "--base",
                current_base,
                "--proposals",
                str(args.proposals),
            ]
        )
        new_variants = sorted(snapshot_variants() - before)

        if not new_variants:
            print(
                f"\n  iterate.py wrote no new prompts in round {r}. Stopping early.",
                flush=True,
            )
            break
        print(f"\n  New variant(s) this round: {', '.join(new_variants)}", flush=True)

        step(r, 2, f"A/B each proposal vs {current_base} (across all states)")
        for v in new_variants:
            print(f"\n  --- variant: {v} ---", flush=True)
            run([py, str(EVAL_DIR / "runner.py"), "--variant", v])

        step(r, 3, "Score every run (writes report.json for the new variants)")
        run([py, str(EVAL_DIR / "metrics.py"), "--all"])

        step(r, 4, f"Pick winner by overall.{args.metric}")
        candidates = [current_base] + new_variants
        winner, winner_score, scored = pick_winner(candidates, args.metric)
        print("\n  Candidates:")
        for v, s in scored:
            tag = "  ← winner" if v == winner else ""
            origin = "(base)" if v == current_base else "(new) "
            print(f"    {origin} {v:<48} {args.metric}={fmt(s)}{tag}")

        history.append(
            {
                "round": r,
                "base": current_base,
                "proposals": new_variants,
                "winner": winner,
                "score": winner_score,
            }
        )

        if winner == current_base:
            print(
                f"\n  No proposal beat the current base on {args.metric}. "
                f"Keeping {current_base} for round {r + 1}.",
                flush=True,
            )
        else:
            print(f"\n  Promoting {winner} → base for next round.", flush=True)
        current_base = winner

    banner(f"DONE · final winner = {current_base}")
    print(f"  Optimised metric: overall.{args.metric}\n")
    print(f"  {'round':<6} {'base':<48} {'score':<10}")
    print(f"  {'-' * 6} {'-' * 48} {'-' * 10}")
    for h in history:
        label = h.get("winner") or h["base"]
        print(f"  {h['round']:<6} {label:<48} {fmt(h.get('score')):<10}")

    baseline_score = history[0].get("score")
    final_score = history[-1].get("score")
    if baseline_score is not None and final_score is not None:
        delta = final_score - baseline_score
        sign = "+" if delta >= 0 else ""
        print(f"\n  Δ vs starting baseline: {sign}{delta * 100:.2f} pp")

    print(
        f"\n  Final prompt file: eval/prompts/{current_base}.py"
        f"\n  Re-run on its own with: python eval/run_pipeline.py --base {current_base} --skip-baseline",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
