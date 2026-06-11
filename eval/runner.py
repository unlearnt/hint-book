#!/usr/bin/env python3
"""Run a matrix of (prompt variant × model × state × example) and save raw results.

By default the runner sweeps every state in TARGETS so a single proposal is judged
against all available labeled datasets. Pass --page <id> to restrict to one state
(useful for debugging a single dataset).

Usage:
    python eval/runner.py                                    # all states
    python eval/runner.py --variant v0_baseline              # all states, one variant
    python eval/runner.py --page ca_dl                       # single state
    python eval/runner.py --models anthropic/claude-sonnet-4-6,Qwen/Qwen3-VL-235B-A22B-Instruct
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

import json5  # noqa: E402

from lib.api import PROVIDERS, chat, parse_json_loose  # noqa: E402
from lib.image import discover_images, load_image_as_data_url  # noqa: E402
from lib.page import derive_verdict, load_hint_page, tally, total_hints  # noqa: E402

load_dotenv(ROOT / ".env", override=True)

# Single source of truth for the model UNIVERSE: src/assessment/models.js::ASSESS_MODELS.
# Each entry: {"id": str, "label": str, "provider": "deepinfra"|"openrouter", "thinking"?: bool, "toolCapable"?: bool}
_ASSESS_MODELS_FILE = ROOT / "src" / "assessment" / "models.js"

# === EDIT HERE to pick which models the eval pipeline uses ===
# - Set to [] (empty list) to run EVERY model in ASSESS_MODELS that has its API key set.
# - Add IDs (exactly as they appear in src/assessment/models.js) to restrict.
# - Order is preserved; OpenRouter models are auto-skipped if OPENROUTER_API_KEY is missing.
# Overridden by `runner.py --models <comma,separated,list>` on the CLI.
DEFAULT_MODELS: list[str] = [
    "Qwen/Qwen3-VL-30B-A3B-Instruct",
    "Qwen/Qwen3-VL-235B-A22B-Instruct",
    "Qwen/Qwen3.6-35B-A3B",
    "google/gemma-4-31B-it",
    "qwen/qwen3.7-plus",
    "qwen/qwen3-vl-8b-thinking",
    "qwen/qwen3-vl-30b-a3b-thinking",
    "qwen/qwen3-vl-235b-a22b-thinking",
    "meta-llama/llama-4-scout",
    "anthropic/claude-opus-4-7"
]


def load_assess_models() -> list[dict]:
    raw = _ASSESS_MODELS_FILE.read_text(encoding="utf-8")
    m = re.search(r"export\s+const\s+ASSESS_MODELS\s*=\s*(\[.*?\])\s*;", raw, re.DOTALL)
    if not m:
        raise ValueError(f"{_ASSESS_MODELS_FILE}: ASSESS_MODELS array not found")
    return json5.loads(m.group(1))


def resolve_models(only_ids: list[str] | None) -> list[dict]:
    """Return models filtered to those whose API key is available.

    Resolution order:
      1. CLI `--models foo,bar` (`only_ids`)         — wins if non-empty
      2. DEFAULT_MODELS constant in this file        — wins if non-empty
      3. Every model in ASSESS_MODELS                — final fallback

    Model IDs are looked up in ASSESS_MODELS for their provider/thinking config;
    unknown IDs default to {provider: "deepinfra"}.
    """
    all_models = load_assess_models()
    by_id = {m["id"]: m for m in all_models}

    ids = only_ids or DEFAULT_MODELS or None
    if ids:
        picked = [by_id.get(mid, {"id": mid, "provider": "deepinfra"}) for mid in ids]
    else:
        picked = all_models

    keys_set = {p for p, (_, env) in PROVIDERS.items() if (os.environ.get(env) or "").strip()}
    kept: list[dict] = []
    for m in picked:
        provider = m.get("provider", "deepinfra")
        if provider not in keys_set:
            print(f"  skip {m['id']} ({provider}: no API key set)")
            continue
        kept.append(m)
    return kept

# (dataset_dir, page_id, image_dir): one entry per state we score against.
# image_dir is usually the same as dataset_dir. page_id is the hint-book id used
# to score answers (Arizona's dataset dir is "arizona_driving_license" but the
# hint page is "arizona_driver_license").
TARGETS: list[tuple[str, str, str]] = [
    ("ca_dl",                   "ca_dl",                   "ca_dl"),
    ("arizona_driving_license", "arizona_driver_license",  "arizona_driving_license"),
    ("nevada_driver_license",   "nevada_driver_license",   "nevada_driver_license"),
    ("texas_driver_license",    "texas_driver_license",    "texas_driver_license"),
]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--page", help="restrict to one page id (default: all states in TARGETS)")
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


def load_examples(
    dataset_dir: str, image_dir: str, only: list[str] | None
) -> list[dict]:
    """Load examples; labels/meta live under dataset_dir, images under image_dir.

    For most states dataset_dir == image_dir; the Arizona pair splits them.
    Examples are matched by name across the two directories.

    Missing dirs return [] (with a warning) so one absent state doesn't kill
    the whole pipeline — main() will skip any state with no usable examples.
    """
    label_root = EVAL_DIR / "datasets" / dataset_dir
    image_root = EVAL_DIR / "datasets" / image_dir
    if not label_root.is_dir():
        print(f"  warning: dataset dir missing — skipping {dataset_dir} ({label_root})")
        return []
    if not image_root.is_dir():
        print(f"  warning: image dir missing — skipping {dataset_dir} (expected at {image_root})")
        return []
    names = sorted(d.name for d in label_root.iterdir() if d.is_dir())
    if only:
        names = [n for n in names if n in only]
    out = []
    for name in names:
        lbl_dir = label_root / name
        img_dir = image_root / name
        try:
            images = discover_images(img_dir)
        except FileNotFoundError:
            print(f"  skip {dataset_dir}/{name}: no images at {img_dir}")
            continue
        meta = _read_json(lbl_dir / "meta.json", {"category": "unknown"})
        labels = _read_json(lbl_dir / "labels.json", {})
        out.append({
            "id": name,
            "dataset_dir": dataset_dir,
            "label_dir": lbl_dir,
            "image_dir": img_dir,
            "images": images,
            "meta": meta,
            "labels": labels,
        })
    if not out:
        print(f"  warning: no usable examples in dataset_dir={dataset_dir} image_dir={image_dir}")
    return out


def _read_json(p: Path, fallback):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return fallback


def run_one(*, page, dataset_dir, variant, model_cfg, example, keys_by_provider) -> dict:
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
    model_id = model_cfg["id"]
    provider = model_cfg.get("provider", "deepinfra")
    thinking = bool(model_cfg.get("thinking"))
    api_key = keys_by_provider.get(provider, "")
    base = {
        "variant": variant.NAME,
        "model": model_id,
        "provider": provider,
        "page": page["id"],
        "dataset_dir": dataset_dir,
        "example": example["id"],
    }
    try:
        r = chat(
            model=model_id,
            messages=messages,
            api_key=api_key,
            provider=provider,
            thinking=thinking,
        )
    except Exception as e:
        return {**base, "ok": False, "error": f"api: {e}"}

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
        **base,
        "ok": True,
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


def resolve_targets(only_page: str | None) -> list[tuple[str, str, str]]:
    if only_page:
        matches = [t for t in TARGETS if t[1] == only_page or t[0] == only_page]
        if not matches:
            raise SystemExit(
                f"--page {only_page!r} does not match any entry in TARGETS "
                f"(known: {[t[1] for t in TARGETS]})"
            )
        return matches
    return list(TARGETS)


def main() -> int:
    args = parse_args()
    keys_by_provider = {
        p: (os.environ.get(env) or "").strip()
        for p, (_, env) in PROVIDERS.items()
    }
    keys_by_provider = {p: k for p, k in keys_by_provider.items() if k}
    if "deepinfra" not in keys_by_provider:
        print("DEEPINFRA_API_KEY not set in .env (required for most models)", file=sys.stderr)
        return 1
    if "openrouter" not in keys_by_provider:
        print("  note: OPENROUTER_API_KEY not set — OpenRouter models will be skipped")

    targets = resolve_targets(args.page)
    variants = [load_variant(args.variant)] if args.variant else load_all_variants()
    only_ids = [m.strip() for m in (args.models or "").split(",") if m.strip()] or None
    models = resolve_models(only_ids)
    if not models:
        print("\nNo usable models — every entry was filtered out for a missing API key.", file=sys.stderr)
        return 1
    examples_only = [e.strip() for e in (args.examples or "").split(",") if e.strip()] or None

    # Load every state's hint page + examples up front so the per-variant loop is cheap.
    loaded: list[dict] = []
    for dataset_dir, page_id, image_dir in targets:
        page = load_hint_page(page_id)
        examples = load_examples(dataset_dir, image_dir, examples_only)
        if not examples:
            continue
        loaded.append(
            {
                "dataset_dir": dataset_dir,
                "page": page,
                "image_dir": image_dir,
                "examples": examples,
            }
        )

    if not loaded:
        print(
            "\nNo usable states found. Check that eval/datasets/<state>/<example>/ "
            "contains both labels.json AND front.{jpg,png} files.",
            file=sys.stderr,
        )
        return 1

    total_cells = sum(len(models) * len(t["examples"]) for t in loaded) * len(variants)
    print(f"variants={','.join(v.NAME for v in variants)}")
    print(f"models={','.join(m['id'] for m in models)}  (providers: " + ",".join(sorted(keys_by_provider)) + ")")
    for t in loaded:
        ex_ids = ",".join(e["id"] for e in t["examples"]) or "(none)"
        print(
            f"  state {t['page']['id']:<26} dataset={t['dataset_dir']:<26} "
            f"examples=[{ex_ids}] ({len(t['examples'])})"
        )
    print(f"matrix size = {total_cells}")
    if args.dry_run:
        return 0

    multi_state = len(loaded) > 1
    page_tag = "multi" if multi_state else loaded[0]["page"]["id"]

    for variant in variants:
        stamp = dt.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
        run_dir = EVAL_DIR / "runs" / f"{stamp}__{safe_slug(variant.NAME)}__{page_tag}"
        (run_dir / "raw").mkdir(parents=True, exist_ok=True)
        (run_dir / "manifest.json").write_text(
            json.dumps(
                {
                    "stamp": stamp,
                    "page": page_tag,
                    "variant": variant.NAME,
                    "models": [m["id"] for m in models],
                    "model_configs": models,
                    "states": [
                        {
                            "page": t["page"]["id"],
                            "dataset_dir": t["dataset_dir"],
                            "image_dir": t["image_dir"],
                            "examples": [e["id"] for e in t["examples"]],
                        }
                        for t in loaded
                    ],
                    "system_prompt": variant.SYSTEM,
                    "guidance": getattr(variant, "GUIDANCE", None) or "",
                },
                indent=2,
            )
        )

        cells: list[tuple[dict, dict, dict]] = [
            (t, m, e) for t in loaded for m in models for e in t["examples"]
        ]
        results = []
        done = 0
        with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as pool:
            futures = {
                pool.submit(
                    run_one,
                    page=t["page"],
                    dataset_dir=t["dataset_dir"],
                    variant=variant,
                    model_cfg=m,
                    example=e,
                    keys_by_provider=keys_by_provider,
                ): (t, m, e)
                for t, m, e in cells
            }
            for fut in as_completed(futures):
                t, m, e = futures[fut]
                tag = f"[{variant.NAME}] {t['page']['id']}/{e['id']} × {m['id']}"
                try:
                    r = fut.result()
                except Exception as ex:
                    r = {
                        "ok": False,
                        "error": f"throw: {ex}",
                        "variant": variant.NAME,
                        "model": m["id"],
                        "provider": m.get("provider", "deepinfra"),
                        "page": t["page"]["id"],
                        "dataset_dir": t["dataset_dir"],
                        "example": e["id"],
                    }
                fp = run_dir / "raw" / f"{t['page']['id']}__{e['id']}__{safe_slug(m['id'])}.json"
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
