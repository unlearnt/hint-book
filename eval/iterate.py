#!/usr/bin/env python3
"""Cluster failures from the latest run and ask a meta-prompter to propose new variants.

Writes eval/prompts/v{n}_<slug>.py — does NOT auto-run them.

Usage:
    python eval/iterate.py --page ca_dl --base v0_baseline --proposals 3
    python eval/iterate.py --page ca_dl --base v0_baseline --proposals 2 \\
        --model deepseek-ai/DeepSeek-V4-Pro
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import sys
from pathlib import Path
from textwrap import dedent

from dotenv import load_dotenv

EVAL_DIR = Path(__file__).resolve().parent
ROOT = EVAL_DIR.parent
sys.path.insert(0, str(EVAL_DIR))

from lib.api import chat, parse_json_loose  # noqa: E402
from lib.page import load_hint_page  # noqa: E402

load_dotenv(ROOT / ".env", override=True)

DEFAULT_META_MODEL = "anthropic/claude-opus-4-7"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--page", required=True)
    p.add_argument("--base", required=True, help="baseline variant name to revise from")
    p.add_argument("--proposals", type=int, default=3)
    p.add_argument("--model", default=DEFAULT_META_MODEL, help="meta-prompter model")
    return p.parse_args()


def find_latest_report(page_id: str, variant: str) -> tuple[str, dict]:
    runs_dir = EVAL_DIR / "runs"
    if not runs_dir.is_dir():
        raise FileNotFoundError("no runs/ directory")
    matching = sorted(
        d.name for d in runs_dir.iterdir() if d.is_dir() and d.name.endswith(f"__{variant}__{page_id}")
    )
    if not matching:
        raise FileNotFoundError(f"no runs for variant={variant} page={page_id}")
    latest = matching[-1]
    report_path = runs_dir / latest / "report.json"
    if not report_path.is_file():
        raise FileNotFoundError(
            f"run {latest} has no report.json — run `python eval/metrics.py --run {latest}` first"
        )
    return latest, json.loads(report_path.read_text(encoding="utf-8"))


def load_variant(name: str):
    file = EVAL_DIR / "prompts" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(f"prompts.{name}", file)
    if spec is None or spec.loader is None:
        raise FileNotFoundError(file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def build_meta_prompt(*, page: dict, base, report: dict, proposals: int) -> str:
    o = report["overall"]

    def pct(x):
        return "n/a" if x is None else f"{x * 100:.1f}%"

    clusters_lines = []
    for c in report.get("failure_clusters", []):
        clusters_lines.append(
            f"- Section {c['sectionId']}: expected {c['expected']} but model answered "
            f"{c['predicted']}  (×{c['count']})"
        )
        for ex in c.get("examples", []):
            finding = f' — model said: "{ex["finding"]}"' if ex.get("finding") else ""
            clusters_lines.append(
                f"    · {ex['checkId']} on {ex['example']} ({ex['model']}){finding}"
            )
    clusters_text = "\n".join(clusters_lines) or "(none)"

    section_lines = "\n".join(
        f"  [{s['id']}] {s['title']} — {len(s['hints'])} checks" for s in page["sections"]
    )
    base_guidance = getattr(base, "GUIDANCE", None) or "(loaded per-page from src/hints/thinking/)"

    return dedent(
        f"""\
        You are an expert prompt engineer optimising prompts for a document-fraud detection system.

        The system feeds a vision LLM an identity document image plus a checklist of binary forensic questions ("hint page"). The model answers each check YES/NO/WARN/UNVERIFIABLE/CONTEXT. We score the model against ground-truth labels.

        DOCUMENT TYPE: {page['title']} ({page['id']})
        SECTIONS IN THIS HINT PAGE:
        {section_lines}

        CURRENT BASELINE — variant "{base.NAME}":

        --- SYSTEM PROMPT ---
        {base.SYSTEM}

        --- EXPERT GUIDANCE (injected into user message) ---
        {base_guidance}

        LATEST EVAL RESULTS:
        - per-check accuracy:  {pct(o['per_check_accuracy'])}
        - tamper recall:       {pct(o['tamper_recall'])}
        - tamper precision:    {pct(o['tamper_precision'])}
        - verdict accuracy:    {pct(o['verdict_accuracy'])}
        - unverifiable rate:   {pct(o['unverifiable_rate'])}

        TOP FAILURE CLUSTERS (sorted by frequency):
        {clusters_text}

        YOUR TASK:
        Propose exactly {proposals} revised prompt variants. Each variant should target one or more of the failure clusters above with a clear hypothesis. Do NOT just shuffle wording — change the prompt in a way that should measurably move a specific metric.

        Common levers:
        - Tighten the rubric for when to answer UNVERIFIABLE vs WARN vs guessing (reduces dodge rate).
        - Add concrete forensic anchors to expert guidance (e.g., "DL number is exactly 1 letter + 7 digits") — improves accuracy on format checks.
        - Add chain-of-thought scaffolding for hard sections (e.g., MRZ parsing) — improves recall on subtle tampering.
        - Calibrate against false positives by stating decision boundaries explicitly.

        Return ONLY valid JSON in this exact shape, no fences, no preamble:
        {{
          "proposals": [
            {{
              "slug": "short_kebab_name_of_change",
              "hypothesis": "1-2 sentence claim about which metric this should move and why",
              "targetClusters": ["S6 :: YES → NO", "S14 :: YES → MISSING"],
              "system": "FULL revised system prompt",
              "guidance": "FULL revised expert guidance (or empty string)"
            }}
          ]
        }}"""
    )


PROMPT_FILE_TEMPLATE = '''\
"""Auto-generated by eval/iterate.py.

Hypothesis: {hypothesis}
Targets:    {targets}
"""

from __future__ import annotations

NAME = {name!r}

SYSTEM = {system!r}

GUIDANCE = {guidance!r}


def build_user_text(*, page: dict, guidance: str | None, image_count: int) -> str:
    g = guidance if guidance is not None else GUIDANCE
    checklist = "\\n\\n".join(
        f"[{{s['id']}}] {{s['title']}}\\n"
        + "\\n".join(
            f"  {{h[0]}}: {{h[1]}}" + (f" [{{h[2]}}]" if h[2] else "")
            for h in s["hints"]
        )
        for s in page["sections"]
    )
    img_list = ", ".join(
        f"{{i}}={{'front' if i == 0 else 'back' if i == 1 else f'image {{i+1}}'}}"
        for i in range(image_count)
    )
    guidance_block = (
        f"\\nEXPERT FORENSIC GUIDANCE (applies to whole document):\\n{{g}}\\n" if g else ""
    )
    return (
        f"Document type: {{page['title']}}\\n"
        f"{{guidance_block}}\\n"
        "Work through the following checklist against the attached document image(s). "
        "Provide a 1-sentence finding per check.\\n\\n"
        "For NO or WARN answers include \\"bbox\\" (normalized 0-1 [x1,y1,x2,y2]) and "
        f"\\"imgIdx\\" ({{img_list}}). Omit both otherwise.\\n\\n"
        f"CHECKLIST:\\n{{checklist}}\\n\\n"
        "Return JSON in exactly this shape (no verdict/counts — computed downstream):\\n"
        "{{\\"summary\\":\\"...\\",\\"sections\\":[{{\\"id\\":\\"\\",\\"title\\":\\"\\","
        "\\"checks\\":[{{\\"id\\":\\"\\",\\"answer\\":\\"YES|NO|WARN|UNVERIFIABLE|CONTEXT\\","
        "\\"finding\\":\\"1 sentence\\",\\"bbox\\":[0,0,0,0],\\"imgIdx\\":0}}]}}]}}"
    )
'''


def next_version_number() -> int:
    files = (EVAL_DIR / "prompts").glob("*.py")
    mx = 0
    for f in files:
        m = re.match(r"^v(\d+)_", f.stem)
        if m:
            mx = max(mx, int(m.group(1)))
    return mx + 1


def main() -> int:
    args = parse_args()
    api_key = (os.environ.get("DEEPINFRA_API_KEY") or "").strip()
    if not api_key:
        print("DEEPINFRA_API_KEY not set", file=sys.stderr)
        return 1

    page = load_hint_page(args.page)
    base = load_variant(args.base)
    run, report = find_latest_report(args.page, args.base)
    print(f"Using run {run} as failure source.")
    print(f"Meta-prompter: {args.model}")

    prompt = build_meta_prompt(page=page, base=base, report=report, proposals=args.proposals)
    r = chat(
        model=args.model,
        messages=[{"role": "user", "content": prompt}],
        api_key=api_key,
        temperature=0.6,
        max_tokens=16384,
    )
    try:
        parsed = parse_json_loose(r["content"])
    except Exception:
        print("Meta-prompter returned non-JSON. Raw output:\n", r["content"], file=sys.stderr)
        raise

    proposals = parsed.get("proposals") or []
    if not proposals:
        raise RuntimeError("Meta-prompter returned no proposals.")

    n = next_version_number()
    written = []
    for p in proposals:
        slug = re.sub(r"[^a-z0-9_-]+", "_", (p.get("slug") or "proposal"), flags=re.IGNORECASE).lower()
        name = f"v{n}_{slug}"
        file = EVAL_DIR / "prompts" / f"{name}.py"
        body = PROMPT_FILE_TEMPLATE.format(
            hypothesis=p.get("hypothesis", "(none)"),
            targets=", ".join(p.get("targetClusters", [])) or "(unspecified)",
            name=name,
            system=p.get("system", ""),
            guidance=p.get("guidance", ""),
        )
        file.write_text(body, encoding="utf-8")
        written.append({"name": name, "file": file, "hypothesis": p.get("hypothesis"),
                        "targets": p.get("targetClusters", [])})
        n += 1

    print(f"\nWrote {len(written)} proposal(s):\n")
    for w in written:
        print(f"  {w['name']}  →  {w['file'].relative_to(ROOT)}")
        print(f"    hypothesis: {w['hypothesis']}")
        if w["targets"]:
            print(f"    targets: {', '.join(w['targets'])}")
        print()
    print(f"Next: python eval/runner.py --page {args.page} --variant {written[0]['name']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
