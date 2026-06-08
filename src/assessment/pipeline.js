import { getModelCfg, getEndpoint } from "./models.js";
import { buildSystemPrompt, buildUserContent, buildRetryContent } from "./prompt.js";
import { getToolSchemas, executeTool, ALL_TOOL_NAMES } from "./tools/registry.js";
import { parseAssessment, extractJSON } from "./parse.js";

const MAX_TOOL_ROUNDS = 8;

// ── Low-level: stream one conversation round ─────────────────────────────────
// Returns: { content, thinking, toolCalls, finishReason }
async function streamRound({ endpoint, body, onThink, onContent, signal }) {
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  });

  if (!resp.ok) {
    if (resp.status === 401) { window.__hbLogout?.(); throw new Error("__auth__"); }
    const e = await resp.json().catch(() => ({}));
    throw new Error(e.error?.message || `HTTP ${resp.status}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let fullContent = "";
  let fullThink = "";
  let finishReason = null;
  const toolCallsMap = {};   // index → partial tool call object

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const d = line.slice(6).trim();
      if (d === "[DONE]") continue;
      try {
        const chunk = JSON.parse(d);
        const choice = chunk.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        const delta = choice.delta;
        if (!delta) continue;

        // Thinking content (reasoning_content = DeepInfra/Kimi, reasoning = OpenRouter)
        const thinkDelta = delta.reasoning_content || delta.reasoning;
        if (thinkDelta) { fullThink += thinkDelta; onThink?.(fullThink); }

        // Regular content — handle <think> tags (DeepSeek R1 style)
        if (delta.content) {
          fullContent += delta.content;
          const te = fullContent.indexOf("</think>");
          if (fullContent.startsWith("<think>")) {
            if (te !== -1) { onThink?.(fullContent.slice(7, te)); onContent?.(fullContent.slice(te + 8)); }
            else { onThink?.(fullContent.slice(7)); }
          } else {
            onContent?.(fullContent);
          }
        }

        // Tool call deltas — assemble by index
        for (const tc of delta.tool_calls ?? []) {
          const idx = tc.index ?? 0;
          if (!toolCallsMap[idx]) toolCallsMap[idx] = { id: "", type: "function", function: { name: "", arguments: "" } };
          if (tc.id) toolCallsMap[idx].id = tc.id;
          if (tc.function?.name) toolCallsMap[idx].function.name += tc.function.name;
          if (tc.function?.arguments) toolCallsMap[idx].function.arguments += tc.function.arguments;
        }
      } catch { /* malformed chunk — skip */ }
    }
  }

  // Strip <think> block from returned content so JSON parsing isn't confused
  let returnContent = fullContent;
  const te = fullContent.indexOf("</think>");
  if (fullContent.startsWith("<think>") && te !== -1) returnContent = fullContent.slice(te + 8);

  const toolCalls = Object.values(toolCallsMap).filter(tc => tc.function.name);

  return {
    content: returnContent,
    thinking: fullThink,
    toolCalls,
    finishReason: finishReason ?? (toolCalls.length ? "tool_calls" : "stop"),
  };
}

// ── Main assessment loop ─────────────────────────────────────────────────────
export async function runAssessment({
  model,
  imgs,
  pg,
  guidance = "",
  temperature,
  maxTokens,
  thinkBudget,
  enabledTools = ALL_TOOL_NAMES,   // pass [] to disable tool calling
  onThink,
  onContent,
  onToolCall,
  onToolResult,
  signal,
}) {
  const modelCfg = getModelCfg(model);
  const provider = modelCfg.provider ?? "deepinfra";
  const endpoint = getEndpoint(provider);

  // Only pass tool schemas if the model is flagged as tool-capable
  const toolSchemas = modelCfg.toolCapable ? getToolSchemas(enabledTools) : [];
  const hasTools = toolSchemas.length > 0;

  const extraBody = {
    ...(provider === "openrouter" && modelCfg.thinking ? { reasoning: { max_tokens: thinkBudget } } : {}),
    ...(hasTools ? { tools: toolSchemas, tool_choice: "auto" } : {}),
  };

  const messages = [
    { role: "system", content: buildSystemPrompt(hasTools) },
    { role: "user",   content: buildUserContent({ pg, imgs, guidance, hasTools }) },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await streamRound({
      endpoint,
      body: { model, temperature, max_tokens: maxTokens, ...extraBody, messages },
      onThink:   round === 0 ? onThink   : undefined,
      onContent: round === 0 ? onContent : undefined,
      signal,
    });

    if (response.finishReason === "tool_calls" && response.toolCalls.length) {
      // Append assistant's tool call request to conversation
      messages.push({
        role: "assistant",
        content: response.content || null,
        tool_calls: response.toolCalls,
      });

      // Execute each tool and append results
      for (const call of response.toolCalls) {
        const args = (() => { try { return JSON.parse(call.function.arguments || "{}"); } catch { return {}; } })();
        onToolCall?.(call.function.name, args);
        const result = await executeTool(call.function.name, args, { imgs });
        onToolResult?.(call.function.name, result);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      continue; // next round with tool results
    }

    // Model finished — parse the assessment JSON
    return parseAssessment(response.content, pg);
  }

  throw new Error("Assessment exceeded maximum tool call rounds");
}

// ── Single-check retry ───────────────────────────────────────────────────────
export async function retryCheck({
  model,
  imgs,
  pg,
  sec,
  hint,
  guidance = "",
  temperature,
  signal,
}) {
  const modelCfg = getModelCfg(model);
  const provider = modelCfg.provider ?? "deepinfra";
  const endpoint = getEndpoint(provider);

  const { content } = await streamRound({
    endpoint,
    body: {
      model,
      temperature,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: "You are an expert document forensics examiner. Re-examine a single check on the document image(s). Be rigorous — do not assume the document is genuine. Return ONLY valid JSON.",
        },
        { role: "user", content: buildRetryContent({ pg, sec, hint, imgs, guidance }) },
      ],
    },
    signal,
  });

  let parsed;
  try { parsed = JSON.parse(extractJSON(content)); }
  catch (e) { throw new Error(`JSON parse error: ${e.message}`); }
  if (!parsed.answer) throw new Error("Response missing answer field");
  return parsed;
}
