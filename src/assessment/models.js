export const ASSESS_MODELS = [
  { id: "Qwen/Qwen3-VL-30B-A3B-Instruct",          label: "Qwen3-VL-30B-A3B-Instruct",       provider: "deepinfra" },
  { id: "Qwen/Qwen3-VL-235B-A22B-Instruct",         label: "Qwen3-VL-235B-A22B-Instruct",     provider: "deepinfra" },
  { id: "Qwen/Qwen3.6-35B-A3B",                     label: "Qwen3.6-35B-A3B ✦",               provider: "deepinfra",    thinking: true },
  { id: "google/gemma-4-31B-it",                    label: "Gemma 4 31B",                     provider: "deepinfra" },
  { id: "moonshotai/Kimi-K2.6",                     label: "Kimi K2.6 ✦",                     provider: "deepinfra",    thinking: true, toolCapable: true },
  { id: "XiaomiMiMo/MiMo-V2.5",                    label: "MiMo V2.5 ✦",                     provider: "deepinfra",    thinking: true },
  { id: "qwen/qwen3.7-plus",                        label: "Qwen3.7-Plus ✦ [OR]",             provider: "openrouter",   thinking: true, toolCapable: true },
  { id: "qwen/qwen3-vl-8b-thinking",                label: "Qwen3-VL-8B-Thinking ✦ [OR]",    provider: "openrouter",   thinking: true },
  { id: "qwen/qwen3-vl-30b-a3b-thinking",           label: "Qwen3-VL-30B-Thinking ✦ [OR]",   provider: "openrouter",   thinking: true, toolCapable: true },
  { id: "qwen/qwen3-vl-235b-a22b-thinking",         label: "Qwen3-VL-235B-Thinking ✦ [OR]",  provider: "openrouter",   thinking: true, toolCapable: true },
  { id: "meta-llama/llama-4-scout",                 label: "Llama 4 Scout [OR]",              provider: "openrouter",   toolCapable: true },
  { id: "anthropic/claude-opus-4-7",               label: "Claude Opus 4.7",                 provider: "deepinfra" },
  { id: "anthropic/claude-sonnet-4-6",             label: "Claude Sonnet 4.6",               provider: "deepinfra" },
  { id: "anthropic/claude-haiku-4-5",              label: "Claude Haiku 4.5",                provider: "deepinfra" },
];

export const GEN_MODELS = [
  { id: "deepseek-ai/DeepSeek-V4-Pro", label: "DeepSeek V4 Pro" },
  { id: "deepseek-ai/DeepSeek-R1",     label: "DeepSeek R1" },
  { id: "Qwen/Qwen3-235B-A22B",        label: "Qwen3-235B-A22B" },
];

export const ENDPOINTS = {
  deepinfra:   "/api/llm/chat/completions",
  openrouter:  "/api/openrouter/chat/completions",
};

export const getModelCfg = (id) =>
  ASSESS_MODELS.find(m => m.id === id) ?? {};

export const getEndpoint = (provider) =>
  ENDPOINTS[provider] ?? ENDPOINTS.deepinfra;
