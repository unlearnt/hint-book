// ── Answer type definitions ──────────────────────────────────────────────────
export const ANSWER_TYPES = `Answer each check with exactly one of:
- YES          — feature confirmed present as described
- NO           — feature absent, wrong, or anomalous (red flag)
- WARN         — borderline, degraded, or ambiguous; warrants closer inspection
- UNVERIFIABLE — cannot determine from the image (resolution, glare, crop, missing side)
- CONTEXT      — generation-dependent or descriptive; describe what you observe`;

// ── System prompt ────────────────────────────────────────────────────────────
export const buildSystemPrompt = (hasTools = false) => `\
You are an expert document forensics examiner. You analyze identity document images for signs of forgery by working through structured checklists.

${ANSWER_TYPES}

Be rigorous and independent. Do not assume the document is genuine. If a check's precondition does not apply (e.g. "if under 21…" on a 30-year-old's card), answer UNVERIFIABLE. If you cannot tell from the image, answer UNVERIFIABLE rather than guess.
${hasTools ? `
You have access to specialized forensic tools. Use them whenever you need precise data that you cannot reliably determine visually — especially for barcodes, fine text, MRZ lines, and integrity analysis. Call tools before completing sections that depend on machine-readable data.
` : ""}
Return ONLY valid JSON in the exact schema requested. No markdown fences, no commentary, no preamble.`;

// ── Checklist serialization ──────────────────────────────────────────────────
export const buildChecklist = (pg) =>
  pg.sections
    .map(s =>
      `[${s.id}] ${s.title}\n` +
      s.hints.map(h => `  ${h[0]}: ${h[1]}${h[2] ? ` [${h[2]}]` : ""}`).join("\n")
    )
    .join("\n\n");

// ── JSON output schema ───────────────────────────────────────────────────────
export const ASSESSMENT_SCHEMA = `{\
"summary":"2-3 sentence assessment naming specific anomalies, or confirming the document looks consistent",\
"sections":[{"id":"","title":"","checks":[{"id":"","answer":"YES|NO|WARN|UNVERIFIABLE|CONTEXT","finding":"1 sentence"}]}]}`;

export const RETRY_SCHEMA = `{\
"answer":"YES|NO|WARN|UNVERIFIABLE|CONTEXT","finding":"1 sentence naming what you observed",\
"bbox":[x1,y1,x2,y2],"imgIdx":0}`;

// ── Image list annotation ────────────────────────────────────────────────────
export const imgListLabel = (imgs) =>
  imgs.map((_, i) => `${i}=${i === 0 ? "front" : i === 1 ? "back" : `image ${i + 1}`}`).join(", ");

// ── Bbox annotation instructions ─────────────────────────────────────────────
export const BBOX_INSTRUCTIONS = (imgs) => `\
REGION ANNOTATION:
- For NO or WARN answers, include "bbox": [x1,y1,x2,y2] (normalized 0–1 coordinates, left/top/right/bottom) and "imgIdx": N (${imgListLabel(imgs)}).
- For YES, UNVERIFIABLE, or CONTEXT — and absence-based checks — OMIT bbox and imgIdx entirely.`;

// ── Full assessment user message ─────────────────────────────────────────────
export const buildUserContent = ({ pg, imgs, guidance, hasTools = false }) => {
  const parts = [
    `Document type: ${pg.title}`,
    guidance ? `\nEXPERT FORENSIC GUIDANCE (applies to whole document):\n${guidance}` : "",
    hasTools
      ? "\nWork through the checklist. Use tools for any check requiring machine-readable data (barcodes, MRZ, fine text) before answering those sections."
      : "\nWork through the following checklist against the attached image(s). Provide a 1-sentence finding per check naming what you actually observed.",
    `\n${BBOX_INSTRUCTIONS(imgs)}`,
    `\nCHECKLIST:\n${buildChecklist(pg)}`,
    `\nReturn JSON in exactly this shape:\n${ASSESSMENT_SCHEMA}`,
  ].filter(Boolean);

  return [
    { type: "text", text: parts.join("\n") },
    ...imgs.map(img => ({ type: "image_url", image_url: { url: img.preview } })),
  ];
};

// ── Single-check retry user message ─────────────────────────────────────────
export const buildRetryContent = ({ pg, sec, hint, imgs, guidance }) => {
  const parts = [
    `Document type: ${pg.title}`,
    guidance ? `\nEXPERT FORENSIC GUIDANCE:\n${guidance}` : "",
    `\nRe-examine ONE check carefully:\n\n[${sec.id}] ${sec.title}\n${hint[0]}: ${hint[1]}${hint[2] ? ` [${hint[2]}]` : ""}`,
    `\n${BBOX_INSTRUCTIONS(imgs)}`,
    `\nReturn JSON in exactly this shape:\n${RETRY_SCHEMA}`,
  ].filter(Boolean);

  return [
    { type: "text", text: parts.join("\n") },
    ...imgs.map(img => ({ type: "image_url", image_url: { url: img.preview } })),
  ];
};
