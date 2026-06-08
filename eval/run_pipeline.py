#!/usr/bin/env python3
"""End-to-end runner for the eval pipeline: baseline -> score -> propose -> A/B -> compare.

Usage (run from repo root, inside the .venv):
    python eval/run_pipeline.py
    python eval/run_pipeline.py --page ca_dl --proposals 3
    python eval/run_pipeline.py --base v1_some_winner --proposals 2
    python eval/run_pipeline.py --skip-baseline       # only iterate + A/B + compare
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

EVAL_DIR = Path(__file__).resolve().parent
PROMPTS_DIR = EVAL_DIR / "prompts"


def banner(n: int, title: str) -> None:
    bar = "=" * 72
    print(f"\n{bar}\n  Step {n}: {title}\n{bar}", flush=True)


def run(cmd: list[str]) -> None:
    print(f"  $ {' '.join(cmd)}\n", flush=True)
    subprocess.run(cmd, check=True)


def snapshot_variants() -> set[str]:
    return {p.stem for p in PROMPTS_DIR.glob("v*.py")}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--page", default="ca_dl")
    ap.add_argument("--base", default="v0_baseline")
    ap.add_argument("--proposals", type=int, default=3)
    ap.add_argument(
        "--skip-baseline",
        action="store_true",
        help="Skip steps 1+2 (assume baseline already has report.json). Use when iterating on an existing winner.",
    )
    args = ap.parse_args()

    py = sys.executable

    if not args.skip_baseline:
        banner(1, f"Baseline run  ·  variant={args.base}  ·  page={args.page}")
        run([py, str(EVAL_DIR / "runner.py"), "--page", args.page, "--variant", args.base])

        banner(2, "Score baseline run")
        run([py, str(EVAL_DIR / "metrics.py")])

    banner(3, f"Generate {args.proposals} prompt proposal(s) from failure clusters")
    before = snapshot_variants()
    run(
        [
            py,
            str(EVAL_DIR / "iterate.py"),
            "--page",
            args.page,
            "--base",
            args.base,
            "--proposals",
            str(args.proposals),
        ]
    )
    new_variants = sorted(snapshot_variants() - before)

    if not new_variants:
        print("\n  iterate.py wrote no new prompt files. Stopping before A/B.", flush=True)
        return 1
    print(f"\n  New variant(s): {', '.join(new_variants)}", flush=True)

    banner(4, f"A/B each new proposal vs {args.base}")
    for v in new_variants:
        print(f"\n  --- variant: {v} ---", flush=True)
        run([py, str(EVAL_DIR / "runner.py"), "--page", args.page, "--variant", v])

    banner(5, "Side-by-side comparison across all runs")
    run([py, str(EVAL_DIR / "metrics.py"), "--all"])

    print(
        "\n  Done. Promote the winner with:"
        "\n    python eval/run_pipeline.py --base v<n>_<slug> --skip-baseline",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
