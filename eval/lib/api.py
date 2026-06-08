"""DeepInfra OpenAI-compatible chat client + loose JSON parser."""

import json
import re
import time
from typing import Any

import httpx

API_BASE = "https://api.deepinfra.com/v1/openai"


def chat(
    *,
    model: str,
    messages: list[dict[str, Any]],
    api_key: str,
    temperature: float = 0.1,
    max_tokens: int = 16384,
    timeout: float = 300.0,
) -> dict[str, Any]:
    t0 = time.time()
    with httpx.Client(timeout=timeout) as client:
        resp = client.post(
            f"{API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False,
            },
        )
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:500]}")
    data = resp.json()
    usage = data.get("usage", {}) or {}
    return {
        "content": (data.get("choices") or [{}])[0].get("message", {}).get("content", ""),
        "latency_ms": int((time.time() - t0) * 1000),
        "tokens": {
            "prompt": usage.get("prompt_tokens"),
            "completion": usage.get("completion_tokens"),
            "total": usage.get("total_tokens"),
        },
    }


def parse_json_loose(raw: str) -> dict[str, Any]:
    """Strip <think>…</think>, ```json fences, and trailing commas, then parse the outer object."""
    s = raw
    think_end = s.find("</think>")
    if s.lstrip().startswith("<think>") and think_end != -1:
        s = s[think_end + len("</think>") :]
    s = re.sub(r"```(?:json)?\s*", "", s, flags=re.IGNORECASE).replace("```", "")
    start = s.find("{")
    end = s.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in response")
    slice_ = s[start : end + 1]
    try:
        return json.loads(slice_)
    except json.JSONDecodeError:
        # Strip trailing commas before } or ]
        repaired = re.sub(r",(\s*[}\]])", r"\1", slice_)
        return json.loads(repaired)
