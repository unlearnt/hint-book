#!/usr/bin/env python3
"""Run a matrix of (prompt variant × model × example) and save raw results.

Usage:
    python eval/runner.py --page ca_dl
    python eval/runner.py --page ca_dl --variant v0_baseline \\
        --models anthropic/claude-sonnet-4-6,Qwen/Qwen3-VL-235B-A22B-Instruct
    python eval/runner.py --page ca_dl --examples genuine_001,forged_002 --concurrency 4
"""

from __future__ import annotations

import argparse
import datetime as dt
import importlib.util
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from types import ModuleType

from dotenv import load_dotenv

EVAL_DIR = Path(__file__).resolve().parent
ROOT = EVAL_DIR.parent
sys.path.insert(0, str(EVAL_DIR))

from lib.api import chat, parse_json_loose  # noqa: E402
from lib.image import discover_images, load_image_as_data_url  # noqa: E402
from lib.page import derive_verdict, load_hint_page, tally, total_hints  # noqa: E402

load_dotenv(ROOT / ".env", override=True)

DEFAULT_MODELS = [
    "Qwen/Qwen3-VL-30B-A3B-Instruct",
    "Qwen/Qwen3-VL-235B-A22B-Instruct",
    "google/gemma-4-31B-it",
    "moonshotai/Kimi-K2.6",
    "XiaomiMiMo/MiMo-V2.5",
    "anthropic/claude-opus-4-7",
    "anthropic/claude-sonnet-4-6",
    "anthropic/claude-haiku-4-5",
]

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--page", required=True, help="hint page id (e.g. ca_dl)")
    p.add_argument("--variant", help="prompt variant name; runs all in prompts/ if omitted")
    p.add_argument("--models", help="comma-separated model ids; overrides default pair")
    p.add_argument("--examples", help="comma-separated example ids; defaults to all in dataset")
    p.add_argument("--concurrency", type=int, default=3)
    p.add_argument("--dry-run", action="store_true")
    return p.parse_args()


def load_variant(name: str) -> ModuleType:
    file = EVAL_DIR / "prompts" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(f"prompts.{name}", file)
    if spec is None or spec.loader is None:
        raise FileNotFoundError(file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for attr in ("NAME", "SYSTEM", "build_user_text"):
        if not hasattr(mod, attr):
            raise AttributeError(f"variant {name}.py missing {attr}")
    return mod


def load_all_variants() -> list[ModuleType]:
    files = sorted((EVAL_DIR / "prompts").glob("*.py"))
    return [load_variant(f.stem) for f in files if f.stem != "__init__"]


def load_examples(page_id: str, only: list[str] | None) -> list[dict]:
    dir_ = EVAL_DIR / "datasets" / page_id
    if not dir_.is_dir():
        raise FileNotFoundError(f"No dataset at {dir_}")
    names = sorted(d.name for d in dir_.iterdir() if d.is_dir())
    if only:
        names = [n for n in names if n in only]
    out = []
    for name in names:
        ex_dir = dir_ / name
        try:
            images = discover_images(ex_dir)
        except FileNotFoundError:
            print(f"  skip {name}: no images")
            continue
        meta = _read_json(ex_dir / "meta.json", {"category": "unknown"})
        labels = _read_json(ex_dir / "labels.json", {})
        out.append({"id": name, "dir": ex_dir, "images": images, "meta": meta, "labels": labels})
    if not out:
        raise RuntimeError(f"No usable examples found in {dir_}")
    return out


def _read_json(p: Path, fallback):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return fallback


def run_one(*, page, variant, model, example, api_key) -> dict:
    imgs = [load_image_as_data_url(p) for p in example["images"]]
    user_text = variant.build_user_text(
        page=page,
        guidance=getattr(variant, "GUIDANCE", None),
        image_count=len(imgs),
    )
    messages = [
        {"role": "system", "content": variant.SYSTEM},
        {
            "role": "user",
            "content": [{"type": "text", "text": user_text}]
            + [{"type": "image_url", "image_url": {"url": i["data_url"]}} for i in imgs],
        },
    ]
    try:
        r = chat(model=model, messages=messages, api_key=api_key)
    except Exception as e:
        return {
            "ok": False,
            "error": f"api: {e}",
            "variant": variant.NAME,
            "model": model,
            "example": example["id"],
        }

    content = r["content"]
    parsed, parse_error = None, None
    try:
        parsed = parse_json_loose(content)
    except Exception as e:
        parse_error = str(e)

    sections = (parsed or {}).get("sections", []) or []
    counts = tally(page, sections)
    total = total_hints(page)
    verdict = derive_verdict(
        counts["criticalFails"], counts["warnings"], counts["passes"], counts["unverifiable"], total
    )
    return {
        "ok": True,
        "variant": variant.NAME,
        "model": model,
        "example": example["id"],
        "latency_ms": r["latency_ms"],
        "tokens": r["tokens"],
        "parse_error": parse_error,
        "raw": content,
        "result": {
            "verdict": verdict,
            "summary": (parsed or {}).get("summary", ""),
            **counts,
            "sections": sections,
        },
    }


def safe_slug(s: str) -> str:
    return re.sub(r"[^a-z0-9_-]+", "_", s, flags=re.IGNORECASE)


def main() -> int:
    args = parse_args()
    api_key = (os.environ.get("DEEPINFRA_API_KEY") or "").strip()
    if not api_key:
        print("DEEPINFRA_API_KEY not set in .env", file=sys.stderr)
        return 1

    page = load_hint_page(args.page)
    variants = [load_variant(args.variant)] if args.variant else load_all_variants()
    models = [m.strip() for m in (args.models or "").split(",") if m.strip()] or DEFAULT_MODELS
    examples_only = [e.strip() for e in (args.examples or "").split(",") if e.strip()] or None
    examples = load_examples(args.page, examples_only)

    print(f"page={page['id']}  variants={','.join(v.NAME for v in variants)}")
    print(f"models={','.join(models)}")
    print(f"examples={','.join(e['id'] for e in examples)}  ({len(examples)})")
    print(f"matrix size = {len(variants) * len(models) * len(examples)}")
    if args.dry_run:
        return 0

    for variant in variants:
        stamp = dt.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
        run_dir = EVAL_DIR / "runs" / f"{stamp}__{safe_slug(variant.NAME)}__{page['id']}"
        (run_dir / "raw").mkdir(parents=True, exist_ok=True)
        (run_dir / "manifest.json").write_text(
            json.dumps(
                {
                    "stamp": stamp,
                    "page": page["id"],
                    "variant": variant.NAME,
                    "models": models,
                    "examples": [e["id"] for e in examples],
                    "system_prompt": variant.SYSTEM,
                    "guidance": getattr(variant, "GUIDANCE", None) or "",
                },
                indent=2,
            )
        )

        cells = [(m, e) for m in models for e in examples]
        results = []
        done = 0
        with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as pool:
            futures = {
                pool.submit(
                    run_one, page=page, variant=variant, model=m, example=e, api_key=api_key
                ): (m, e)
                for m, e in cells
            }
            for fut in as_completed(futures):
                m, e = futures[fut]
                tag = f"[{variant.NAME}] {e['id']} × {m}"
                try:
                    r = fut.result()
                except Exception as ex:
                    r = {
                        "ok": False,
                        "error": f"throw: {ex}",
                        "variant": variant.NAME,
                        "model": m,
                        "example": e["id"],
                    }
                fp = run_dir / "raw" / f"{e['id']}__{safe_slug(m)}.json"
                fp.write_text(json.dumps(r, indent=2))
                results.append(r)
                done += 1
                if r.get("ok"):
                    extra = f"{r['latency_ms']}ms, {r['tokens'].get('total', '?')} tok"
                    if r.get("parse_error"):
                        extra += ", PARSE FAIL"
                    print(f"  {done}/{len(cells)}  {tag}  ok ({extra})")
                else:
                    print(f"  {done}/{len(cells)}  {tag}  FAIL {r.get('error')}")

        (run_dir / "results.json").write_text(json.dumps(results, indent=2))
        print(f"\n→ wrote {run_dir}")
        print(f"  next: python eval/metrics.py --run {run_dir.name}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
