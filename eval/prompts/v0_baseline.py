"""Baseline prompt — mirrors src/HintBook.jsx::runAssessment.

Per-page expert guidance is auto-loaded from ../../src/hints/thinking/<page_id>.txt
when `guidance` is None. Pass an explicit string to override.
"""

from __future__ import annotations

from pathlib import Path

NAME = "v0_baseline"

SYSTEM = """You are an expert document forensics examiner. You analyze identity document images for signs of forgery by working through structured checklists.

Answer each check with exactly one of:
- YES — feature confirmed present as described
- NO — feature absent, wrong, or anomalous (potential red flag)
- WARN — borderline, degraded, or ambiguous; warrants closer inspection
- UNVERIFIABLE — cannot determine from the image (resolution, glare, crop, missing side, etc.)
- CONTEXT — generation-dependent or descriptive question; describe what you observe

Be rigorous and independent. Do not assume the document is genuine. If a check's precondition does not apply to this document (e.g. "if under 21…" on a 30-year-old's card), answer UNVERIFIABLE. If you cannot tell from the image, answer UNVERIFIABLE rather than guess.

Return ONLY valid JSON in the exact schema requested, with no markdown fences, no commentary, no preamble."""

GUIDANCE: str | None = None  # None = load per-page from src/hints/thinking/<id>.txt

_THINKING_DIR = Path(__file__).resolve().parents[2] / "src" / "hints" / "thinking"


def _load_guidance(page_id: str) -> str:
    f = _THINKING_DIR / f"{page_id}.txt"
    try:
        return f.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def build_user_text(*, page: dict, guidance: str | None, image_count: int) -> str:
    checklist = "\n\n".join(
        f"[{s['id']}] {s['title']}\n"
        + "\n".join(
            f"  {h[0]}: {h[1]}" + (f" [{h[2]}]" if h[2] else "")
            for h in s["hints"]
        )
        for s in page["sections"]
    )
    img_list = ", ".join(
        f"{i}={'front' if i == 0 else 'back' if i == 1 else f'image {i+1}'}"
        for i in range(image_count)
    )
    g = guidance if guidance is not None else _load_guidance(page["id"])
    guidance_block = f"\nEXPERT FORENSIC GUIDANCE (applies to whole document):\n{g}\n" if g else ""
    return f"""Document type: {page['title']}
{guidance_block}
Work through the following checklist against the attached document image(s). Provide a 1-sentence finding per check that names what you actually observed.

REGION ANNOTATION:
- For checks where answer is NO or WARN, include a "bbox" with normalized 0–1 coordinates [x1, y1, x2, y2] (left, top, right, bottom as fractions of image dimensions) of the region your finding refers to, plus "imgIdx" ({img_list}).
- For YES, UNVERIFIABLE, or CONTEXT answers — and for absence-based checks where no specific region applies — OMIT the bbox and imgIdx fields entirely. Do not invent regions.
- bbox example: [0.12, 0.34, 0.28, 0.41] = a box from 12% across, 34% down, to 28% across, 41% down.

CHECKLIST:
{checklist}

Return JSON in exactly this shape (do not include verdict/counts — those are computed downstream):
{{"summary":"2-3 sentence assessment naming specific anomalies, or confirming the document looks consistent","sections":[{{"id":"","title":"","checks":[{{"id":"","answer":"YES|NO|WARN|UNVERIFIABLE|CONTEXT","finding":"1 sentence","bbox":[0,0,0,0],"imgIdx":0}}]}}]}}"""
