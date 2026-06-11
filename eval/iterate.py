#!/usr/bin/env python3
"""Cluster failures from the latest run and ask a meta-prompter to propose new variants.

Writes eval/prompts/v{n}_<slug>.py — does NOT auto-run them.

The latest baseline run is expected to be multi-state (the runner sweeps all
configured states by default). Proposals are constrained to be DOCUMENT-AGNOSTIC:
the meta-prompter only revises the SYSTEM prompt, and per-state expert text
continues to be auto-injected via GUIDANCE at runtime.

Usage:
    python eval/iterate.py --base v0_baseline --proposals 3
    python eval/iterate.py --base v0_baseline --proposals 2 \\
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
    p.add_argument("--base", required=True, help="baseline variant name to revise from")
    p.add_argument("--proposals", type=int, default=3)
    p.add_argument("--model", default=DEFAULT_META_MODEL, help="meta-prompter model")
    return p.parse_args()


def find_latest_report(variant: str) -> tuple[str, dict]:
    runs_dir = EVAL_DIR / "runs"
    if not runs_dir.is_dir():
        raise FileNotFoundError("no runs/ directory")
    needle = f"__{variant}__"
    matching = sorted(d.name for d in runs_dir.iterdir() if d.is_dir() and needle in d.name)
    if not matching:
        raise FileNotFoundError(f"no runs for variant={variant}")
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


def build_meta_prompt(*, base, report: dict, proposals: int) -> str:
    o = report["overall"]

    def pct(x):
        return "n/a" if x is None else f"{x * 100:.1f}%"

    states = report.get("states") or []
    by_state = report.get("by_state") or {}
    state_lines = []
    for st in states:
        s = by_state.get(st["page"], {})
        state_lines.append(
            f"  - {st['page']:<26} "
            f"acc={pct(s.get('per_check_accuracy'))}  "
            f"tRecall={pct(s.get('tamper_recall'))}  "
            f"tPrec={pct(s.get('tamper_precision'))}  "
            f"verdict={pct(s.get('verdict_accuracy'))}  "
            f"unver={pct(s.get('unverifiable_rate'))}  "
            f"({len(st['examples'])} examples)"
        )
    states_text = "\n".join(state_lines) or "  (no per-state breakdown)"

    clusters_lines = []
    for c in report.get("failure_clusters", []):
        page = c.get("page", "?")
        clusters_lines.append(
            f"- [{page}] Section {c['sectionId']}: expected {c['expected']} but model "
            f"answered {c['predicted']}  (×{c['count']})"
        )
        for ex in c.get("examples", []):
            finding = f' — model said: "{ex["finding"]}"' if ex.get("finding") else ""
            clusters_lines.append(
                f"    · {ex['checkId']} on {ex['example']} ({ex['model']}){finding}"
            )
    clusters_text = "\n".join(clusters_lines) or "(none)"

    return dedent(
        f"""\
        You are an expert prompt engineer optimising the SYSTEM prompt for a multi-jurisdiction
        document-fraud detection system.

        The system feeds a vision LLM an identity document image plus a per-document-type checklist
        of binary forensic questions ("hint page"). The model answers each check
        YES / NO / WARN / UNVERIFIABLE / CONTEXT. We score the model against ground-truth labels.

        IMPORTANT: the SAME system prompt is used for every supported document type
        (currently {len(states)} US-state driver-license hint pages). Per-document expert
        guidance (state-specific format anchors, generation differences, etc.) is loaded
        separately from `src/hints/thinking/<page_id>.txt` and injected into the USER
        message at runtime — you do NOT control it and MUST NOT try to replicate it.

        STATES INCLUDED IN THIS EVAL:
        {states_text}

        CURRENT BASELINE — variant "{base.NAME}":

        --- SYSTEM PROMPT (this is what you revise) ---
        {base.SYSTEM}

        AGGREGATED EVAL RESULTS (across all states above):
        - per-check accuracy:  {pct(o['per_check_accuracy'])}
        - tamper recall:       {pct(o['tamper_recall'])}
        - tamper precision:    {pct(o['tamper_precision'])}
        - verdict accuracy:    {pct(o['verdict_accuracy'])}
        - unverifiable rate:   {pct(o['unverifiable_rate'])}

        TOP FAILURE CLUSTERS (tagged with the state they came from, sorted by frequency):
        {clusters_text}

        YOUR TASK:
        Propose exactly {proposals} revised SYSTEM prompts. Each one should target failure
        patterns that recur ACROSS multiple states (not quirks of a single state) with a
        clear hypothesis. Do NOT just shuffle wording — change the prompt in a way that
        should measurably move a specific aggregated metric.

        HARD CONSTRAINTS (proposals that violate these will be discarded):
        - The SYSTEM prompt MUST be document-type-agnostic. Do NOT mention any specific
          US state, document type, generation year, security feature, check ID
          (e.g. "S6.1", "A.4", "M.9"), or section name.
        - Do NOT reference the words "California", "Arizona", "Nevada", "Texas",
          "DL", "ID", "Real ID", "MRZ", etc. as if you know the document is one of those.
        - Frame instructions in terms of generic forensic primitives: "format checks",
          "cross-field consistency", "expected colour vs observed", "presence/absence of
          named features", etc. The per-document checklist supplies all jurisdiction
          specifics.

        Common levers (apply at the document-agnostic level):
        - Tighten the rubric for when to answer UNVERIFIABLE vs WARN vs guessing.
        - Add a general decision procedure for cross-field consistency checks
          ("when a question asks whether field X matches field Y, locate both, then…").
        - Add chain-of-thought scaffolding triggered by the question text (e.g. when a
          check mentions "format", first restate the expected format from the question).
        - Calibrate against false positives by stating decision boundaries explicitly.

        Return ONLY valid JSON in this exact shape, no fences, no preamble:
        {{
          "proposals": [
            {{
              "slug": "short_kebab_name_of_change",
              "hypothesis": "1-2 sentence claim about which aggregated metric this should move and why",
              "targetClusters": ["S6 :: YES → NO", "M.9 :: NO → YES"],
              "system": "FULL revised system prompt (document-type-agnostic)"
            }}
          ]
        }}"""
    )


PROMPT_FILE_TEMPLATE = '''\
"""Auto-generated by eval/iterate.py — document-type-agnostic SYSTEM prompt.

Hypothesis: {hypothesis}
Targets:    {targets}

Per-page expert text is auto-loaded from ../../src/hints/thinking/<page_id>.txt
at runtime (same behavior as v0_baseline). This file only owns SYSTEM.
"""

from __future__ import annotations

from pathlib import Path

NAME = {name!r}

SYSTEM = {system!r}

GUIDANCE: str | None = None  # None = auto-load per-page from src/hints/thinking/<id>.txt

_THINKING_DIR = Path(__file__).resolve().parents[2] / "src" / "hints" / "thinking"


def _load_guidance(page_id: str) -> str:
    f = _THINKING_DIR / f"{{page_id}}.txt"
    try:
        return f.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def build_user_text(*, page: dict, guidance: str | None, image_count: int) -> str:
    g = guidance if guidance is not None else _load_guidance(page["id"])
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

    base = load_variant(args.base)
    run, report = find_latest_report(args.base)
    print(f"Using run {run} as failure source.")
    print(f"Meta-prompter: {args.model}")

    prompt = build_meta_prompt(base=base, report=report, proposals=args.proposals)
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
    print(f"Next: python eval/runner.py --variant {written[0]['name']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
