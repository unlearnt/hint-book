"""OpenAI-compatible chat client supporting DeepInfra and OpenRouter, plus a loose JSON parser."""

import json
import re
import time
from typing import Any

import httpx

# provider name → (chat-completions URL, env var holding the API key)
PROVIDERS: dict[str, tuple[str, str]] = {
    "deepinfra":  ("https://api.deepinfra.com/v1/openai/chat/completions", "DEEPINFRA_API_KEY"),
    "openrouter": ("https://openrouter.ai/api/v1/chat/completions",        "OPENROUTER_API_KEY"),
}


def chat(
    *,
    model: str,
    messages: list[dict[str, Any]],
    api_key: str,
    provider: str = "deepinfra",
    thinking: bool = False,
    think_budget: int = 8192,
    temperature: float = 0.1,
    max_tokens: int = 16384,
    timeout: float = 300.0,
) -> dict[str, Any]:
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider {provider!r}; expected one of {list(PROVIDERS)}")
    url, _ = PROVIDERS[provider]

    body: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    # OpenRouter requires an explicit reasoning budget on thinking models; DeepInfra
    # thinking models reason transparently without extra config.
    if provider == "openrouter" and thinking:
        body["reasoning"] = {"max_tokens": think_budget}

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    if provider == "openrouter":
        # OpenRouter recommends a referer + app title for attribution / rate-limit tiering.
        headers["HTTP-Referer"] = "https://hintbook.app"
        headers["X-Title"] = "HintBook eval"

    t0 = time.time()
    with httpx.Client(timeout=timeout) as client:
        resp = client.post(url, headers=headers, json=body)
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
