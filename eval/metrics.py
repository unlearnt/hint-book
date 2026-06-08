#!/usr/bin/env python3
"""Score raw run output and write report.json + summary.md.

Usage:
    python eval/metrics.py                    # latest run
    python eval/metrics.py --run <dir_name>   # specific run
    python eval/metrics.py --all              # side-by-side table for every run
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from statistics import median

EVAL_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(EVAL_DIR))

from lib.page import load_hint_page  # noqa: E402

RUNS_DIR = EVAL_DIR / "runs"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--run", help="run directory name (defaults to latest)")
    p.add_argument("--all", action="store_true", help="report on every run")
    return p.parse_args()


def list_runs() -> list[str]:
    if not RUNS_DIR.is_dir():
        return []
    return sorted(d.name for d in RUNS_DIR.iterdir() if d.is_dir())


def load_run(name: str) -> dict:
    dir_ = RUNS_DIR / name
    manifest = json.loads((dir_ / "manifest.json").read_text(encoding="utf-8"))
    raw_files = sorted((dir_ / "raw").glob("*.json"))
    results = [json.loads(f.read_text(encoding="utf-8")) for f in raw_files]
    return {"dir": dir_, "name": name, "manifest": manifest, "results": results}


def index_page(page: dict) -> dict[str, dict]:
    out = {}
    for sec in page["sections"]:
        for h in sec["hints"]:
            out[h[0]] = {
                "sectionId": sec["id"],
                "sectionTitle": sec["title"],
                "question": h[1],
                "expect": h[3],
            }
    return out


def verdict_bucket(v: str | None) -> str:
    if v == "APPEARS_LEGITIMATE":
        return "genuine"
    if v in ("HIGHLY_SUSPICIOUS", "SUSPICIOUS"):
        return "forged"
    return "unknown"


def safe_div(a: int, b: int) -> float | None:
    return None if b == 0 else a / b


def fmt_pct(x: float | None) -> str:
    return "  —  " if x is None else f"{x * 100:.1f}%"


def fmt_n(x) -> str:
    return "—" if x is None else str(x)


def score_cell(*, page_idx: dict, raw_cell: dict, example: dict) -> dict:
    labeled = []
    sections = (raw_cell.get("result") or {}).get("sections") or []
    by_check = {}
    for sec in sections:
        for chk in sec.get("checks") or []:
            by_check[chk.get("id")] = chk
    tampered = set(example["meta"].get("tampered") or [])

    for check_id, expected in (example["labels"] or {}).items():
        chk = by_check.get(check_id)
        predicted = chk.get("answer") if chk else "MISSING"
        meta = page_idx.get(check_id, {})
        labeled.append({
            "checkId": check_id,
            "sectionId": meta.get("sectionId", "?"),
            "expected": expected,
            "predicted": predicted,
            "correct": predicted == expected,
            "isTamperedTruth": check_id in tampered,
            "finding": chk.get("finding") if chk else None,
        })

    correct = sum(1 for x in labeled if x["correct"])
    tamper_labeled = [x for x in labeled if x["isTamperedTruth"]]
    tamper_hit = sum(1 for x in tamper_labeled if x["predicted"] in ("NO", "WARN"))
    flagged_no = [x for x in labeled if x["predicted"] == "NO"]
    flagged_no_true = sum(1 for x in flagged_no if x["isTamperedTruth"])
    unver = sum(1 for x in labeled if x["predicted"] == "UNVERIFIABLE")

    return {
        "cell": {
            "variant": raw_cell.get("variant"),
            "model": raw_cell.get("model"),
            "example": raw_cell.get("example"),
        },
        "ok": bool(raw_cell.get("ok")) and not raw_cell.get("parse_error"),
        "parse_error": raw_cell.get("parse_error"),
        "error": raw_cell.get("error"),
        "latency_ms": raw_cell.get("latency_ms"),
        "tokens": raw_cell.get("tokens"),
        "verdict": (raw_cell.get("result") or {}).get("verdict"),
        "verdict_bucket": verdict_bucket((raw_cell.get("result") or {}).get("verdict")),
        "truth_bucket": example["meta"].get("category", "unknown"),
        "counts": {
            "labeled": len(labeled),
            "correct": correct,
            "tamper_labeled": len(tamper_labeled),
            "tamper_hit": tamper_hit,
            "flagged_no": len(flagged_no),
            "flagged_no_true": flagged_no_true,
            "unver": unver,
        },
        "labeled": labeled,
    }


def aggregate(cell_scores: list[dict]) -> dict:
    labeled = correct = tamper_t = tamper_hit = 0
    flagged_no = flagged_no_true = unver = 0
    verdict_matches = verdict_comparable = 0
    latencies: list[int] = []
    token_totals: list[int] = []
    ok_cells = parse_fails = api_fails = 0

    for c in cell_scores:
        if c.get("error"):
            api_fails += 1
            continue
        if c.get("parse_error"):
            parse_fails += 1
        if c.get("ok"):
            ok_cells += 1
        counts = c["counts"]
        labeled += counts["labeled"]
        correct += counts["correct"]
        tamper_t += counts["tamper_labeled"]
        tamper_hit += counts["tamper_hit"]
        flagged_no += counts["flagged_no"]
        flagged_no_true += counts["flagged_no_true"]
        unver += counts["unver"]
        if c["verdict_bucket"] != "unknown" and c["truth_bucket"] != "unknown":
            verdict_comparable += 1
            if c["verdict_bucket"] == c["truth_bucket"]:
                verdict_matches += 1
        if c.get("latency_ms") is not None:
            latencies.append(c["latency_ms"])
        if (c.get("tokens") or {}).get("total") is not None:
            token_totals.append(c["tokens"]["total"])

    return {
        "cells": len(cell_scores),
        "ok_cells": ok_cells,
        "parse_fails": parse_fails,
        "api_fails": api_fails,
        "per_check_accuracy": safe_div(correct, labeled),
        "tamper_recall": safe_div(tamper_hit, tamper_t),
        "tamper_precision": safe_div(flagged_no_true, flagged_no),
        "verdict_accuracy": safe_div(verdict_matches, verdict_comparable),
        "unverifiable_rate": safe_div(unver, labeled),
        "latency_ms_p50": int(median(latencies)) if latencies else None,
        "tokens_total_sum": sum(token_totals),
    }


def failure_clusters(cell_scores: list[dict], top_k: int = 12) -> list[dict]:
    buckets: dict[str, dict] = defaultdict(lambda: {"count": 0, "examples": []})
    for c in cell_scores:
        for lbl in c["labeled"]:
            if lbl["correct"]:
                continue
            key = f"{lbl['sectionId']} :: {lbl['expected']} → {lbl['predicted']}"
            b = buckets[key]
            b["sectionId"] = lbl["sectionId"]
            b["expected"] = lbl["expected"]
            b["predicted"] = lbl["predicted"]
            b["count"] += 1
            if len(b["examples"]) < 4:
                b["examples"].append({
                    "example": c["cell"]["example"],
                    "model": c["cell"]["model"],
                    "checkId": lbl["checkId"],
                    "finding": lbl["finding"],
                })
    return sorted(buckets.values(), key=lambda b: -b["count"])[:top_k]


def report_one(name: str) -> dict:
    run = load_run(name)
    manifest = run["manifest"]
    page = load_hint_page(manifest["page"])
    page_idx = index_page(page)

    dataset_dir = EVAL_DIR / "datasets" / manifest["page"]
    example_map: dict[str, dict] = {}
    for ex_id in manifest["examples"]:
        meta_p = dataset_dir / ex_id / "meta.json"
        labels_p = dataset_dir / ex_id / "labels.json"
        meta = json.loads(meta_p.read_text(encoding="utf-8")) if meta_p.is_file() else {}
        labels = json.loads(labels_p.read_text(encoding="utf-8")) if labels_p.is_file() else {}
        example_map[ex_id] = {"id": ex_id, "meta": meta, "labels": labels}

    cell_scores = []
    for r in run["results"]:
        ex = example_map.get(r.get("example"))
        if not ex:
            continue
        cell_scores.append(score_cell(page_idx=page_idx, raw_cell=r, example=ex))

    overall = aggregate(cell_scores)
    by_model = {
        m: aggregate([c for c in cell_scores if c["cell"]["model"] == m])
        for m in sorted({c["cell"]["model"] for c in cell_scores})
    }
    clusters = failure_clusters(cell_scores)

    report = {
        "run": name,
        "page": manifest["page"],
        "variant": manifest["variant"],
        "models": manifest["models"],
        "examples": manifest["examples"],
        "overall": overall,
        "by_model": by_model,
        "failure_clusters": clusters,
    }
    (run["dir"] / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (run["dir"] / "summary.md").write_text(render_md(report), encoding="utf-8")
    return report


def render_md(rep: dict) -> str:
    o = rep["overall"]
    lines = [
        f"# {rep['run']}",
        f"page=`{rep['page']}` · variant=`{rep['variant']}` · examples={len(rep['examples'])}",
        "",
        "## Overall",
        "| metric | value |",
        "|---|---|",
        f"| per-check accuracy | {fmt_pct(o['per_check_accuracy'])} |",
        f"| tamper recall      | {fmt_pct(o['tamper_recall'])} |",
        f"| tamper precision   | {fmt_pct(o['tamper_precision'])} |",
        f"| verdict accuracy   | {fmt_pct(o['verdict_accuracy'])} |",
        f"| unverifiable rate  | {fmt_pct(o['unverifiable_rate'])} |",
        f"| latency P50        | {fmt_n(o['latency_ms_p50'])} ms |",
        f"| tokens (sum)       | {fmt_n(o['tokens_total_sum'])} |",
        f"| cells              | {o['ok_cells']}/{o['cells']} ok · {o['parse_fails']} parse fail · {o['api_fails']} api fail |",
        "",
        "## By model",
        "| model | acc | tRecall | tPrec | verdict | unver | p50 ms |",
        "|---|---|---|---|---|---|---|",
    ]
    for m, s in rep["by_model"].items():
        lines.append(
            f"| {m} | {fmt_pct(s['per_check_accuracy'])} | {fmt_pct(s['tamper_recall'])} | "
            f"{fmt_pct(s['tamper_precision'])} | {fmt_pct(s['verdict_accuracy'])} | "
            f"{fmt_pct(s['unverifiable_rate'])} | {fmt_n(s['latency_ms_p50'])} |"
        )
    lines += ["", "## Top failure clusters"]
    if not rep["failure_clusters"]:
        lines.append("_none — every labeled check matched_")
    for c in rep["failure_clusters"]:
        lines.append(f"- **{c['sectionId']}**  {c['expected']} → {c['predicted']}  ×{c['count']}")
        for ex in c["examples"]:
            extra = f": {ex['finding']}" if ex.get("finding") else ""
            lines.append(f"  - `{ex['checkId']}` {ex['example']} ({ex['model']}){extra}")
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    runs = list_runs()
    if not runs:
        print("No runs in eval/runs/. Run `python eval/runner.py --page <id>` first.", file=sys.stderr)
        return 1
    targets = runs if args.all else [args.run] if args.run else [runs[-1]]

    reports = []
    for t in targets:
        print(f"\n── {t} ──")
        rep = report_one(t)
        reports.append(rep)
        print((RUNS_DIR / t / "summary.md").read_text(encoding="utf-8"))

    if len(reports) > 1:
        print("\n── side-by-side ──")
        header = "run".ljust(52) + " | acc    | tRecall | tPrec  | verdict | unver  "
        print(header)
        print("-" * len(header))
        for r in reports:
            o = r["overall"]
            print(
                r["run"].ljust(52)
                + f" | {fmt_pct(o['per_check_accuracy'])} | {fmt_pct(o['tamper_recall'])} | "
                f"{fmt_pct(o['tamper_precision'])} | {fmt_pct(o['verdict_accuracy'])} | "
                f"{fmt_pct(o['unverifiable_rate'])}"
            )
    return 0


if __name__ == "__main__":
    sys.exit(main())
