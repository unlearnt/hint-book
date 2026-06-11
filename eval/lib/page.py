"""Load hint pages directly from src/hints/*.js (no Node needed).

The hint files are pure data shaped as `const NAME={...};\\n\\nexport default NAME;`.
We strip the `const NAME=` prefix and `export default NAME;` suffix, then parse the
remaining JS object literal with json5 (which tolerates unquoted keys, trailing commas,
and single quotes — the dialect used in the hint files).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import json5

HINTS_DIR = Path(__file__).resolve().parents[2] / "src" / "hints"
_HINTS_SEARCH = (HINTS_DIR, HINTS_DIR / "thinking")


def load_hint_page(page_id: str) -> dict[str, Any]:
    path = next((d / f"{page_id}.js" for d in _HINTS_SEARCH if (d / f"{page_id}.js").is_file()), None)
    if path is None:
        raise FileNotFoundError(
            f"hint page {page_id}.js not found in any of: {[str(d) for d in _HINTS_SEARCH]}"
        )
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"\s*const\s+\w+\s*=\s*", raw)
    if not m:
        raise ValueError(f"{path}: expected `const NAME = {{...}}`")
    body = raw[m.end():]
    body = body.rsplit("export default", 1)[0].rstrip().rstrip(";").rstrip()
    page = json5.loads(body)
    if not isinstance(page, dict) or "id" not in page or "sections" not in page:
        raise ValueError(f"{path}: missing id or sections")
    return page


def tally(page: dict, sections: list[dict] | None) -> dict[str, int]:
    """Mirror the JS tallySections logic from HintBook.jsx."""
    sections = sections or []
    critical_fails = warnings = passes = unverifiable = 0
    for sec in page["sections"]:
        rs = next((r for r in sections if r.get("id") == sec["id"]), None)
        for h in sec["hints"]:
            chk = None
            if rs:
                chk = next((c for c in (rs.get("checks") or []) if c.get("id") == h[0]), None)
            if chk is None:
                unverifiable += 1
                continue
            exp, ans = h[3], chk.get("answer")
            if exp == "CONTEXT":
                if ans == "UNVERIFIABLE":
                    unverifiable += 1
                elif ans == "WARN":
                    warnings += 1
                else:
                    passes += 1
            else:
                is_crit = (exp == "YES" and ans == "NO") or (exp == "NO" and ans == "YES")
                if is_crit:
                    critical_fails += 1
                elif ans == "WARN":
                    warnings += 1
                elif ans in ("UNVERIFIABLE", "CONTEXT"):
                    unverifiable += 1
                else:
                    passes += 1
    return {
        "criticalFails": critical_fails,
        "warnings": warnings,
        "passes": passes,
        "unverifiable": unverifiable,
    }


def derive_verdict(c: int, w: int, p: int, u: int, total: int) -> str:
    if c >= 2:
        return "HIGHLY_SUSPICIOUS"
    if c == 1 or w >= 3:
        return "SUSPICIOUS"
    if (p + w) < total * 0.4:
        return "CANNOT_DETERMINE"
    return "APPEARS_LEGITIMATE"


def total_hints(page: dict) -> int:
    return sum(len(s["hints"]) for s in page["sections"])
