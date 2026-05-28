# Thinking Traces

Expert forensic guidance files that get injected into the assessment prompt for each hint page. Generated externally using an LLM with extended thinking, then committed here as static files.

## File naming

Each file must be named after the hint page's `id` field:

```
thinking/
  ca_dl.txt          → id: "ca_dl"
  deu_id.txt         → id: "deu_id"
  us_greencard.txt   → id: "us_greencard"
  nevada_dl_id.txt   → id: "nevada_dl_id"
```

For dynamically generated pages, thinking must be added manually after generation.

## File format

Plain `.txt` file using minimal markdown — `##` section headers, `**bold**` for exact values, `-` bullets. No tables, no code blocks:

```
## Highest-signal checks
Any mismatch between the printed name and barcode field DCS is **near-certain tampering**.

## Common forgery patterns
- DL number wrong: forgers use all-numeric strings like **58754758** instead of **A1234567**
- Label reads 'DRIVER'S LICENSE' — correct is **DRIVER LICENSE** (no apostrophe)

## Cross-field consistency traps
The age bar year must equal DOB year + 21. A one-year-off error is the most common mistake.
```

## How it works

When you run an assessment, if a thinking file exists for the active page:
1. The content is injected into the prompt under **EXPERT FORENSIC GUIDANCE** before the checklist
2. A purple **"Expert guidance loaded"** badge appears in the hint page header
3. Every assessment model (Qwen, Gemma, Kimi, MiMo, Claude) benefits from the guidance — no per-model changes needed

## Writing good thinking traces

Keep it **under ~600 tokens** — long traces eat into `max_tokens` budget.

Focus on:
- **Forgery patterns you've actually seen** — specific wrong values, not generic advice
- **Cross-field traps** — checks where forgers fix one field but miss another
- **Format rules with exact values** — character counts, forbidden chars, exact label text
- **Generation-specific pitfalls** — features that changed between generations and trip up models

Avoid:
- Repeating what's already in the hint questions or notes
- Generic advice like "examine carefully" or "look for inconsistencies"
- Restating the checklist structure

---

## Prompt to generate a thinking trace

Use this with Claude (extended thinking enabled, `budget_tokens` ≥ 8000) or any strong reasoning model. Replace the hint page JSON with your actual page content.

**Do not include a document image when generating.** The thinking trace must be general knowledge about the document *type*, not observations about one specific card. If you include an image the model anchors to that example — wrong generation, wrong print variant, wrong for every other card you'll ever assess. The hint page JSON plus the model's training knowledge is sufficient.

---

```
You are a senior document forensics examiner with 15+ years of experience detecting forged identity documents. You are building expert guidance that will be injected into an AI assessment prompt to help a multimodal LLM more accurately detect fraud.

I will give you a structured hint page — a checklist of binary forensic checks for a specific document type. Your task is to write a concise expert briefing that a vision model should read BEFORE working through the checklist.

The briefing should capture:
1. The highest-signal checks — which ones, if failed, are near-certain indicators of fraud
2. Specific forgery patterns for this document type — exact wrong values, common mistakes forgers make
3. Cross-field consistency traps — checks where forgers fix the visible field but miss a linked field (barcode, MRZ, back of card)
4. Generation-specific pitfalls — features that changed between generations and commonly confuse models
5. Visual assessment tips — what to actually look for in an image for the trickiest checks

CONSTRAINTS:
- Maximum 500 tokens. Every sentence must earn its place.
- Do not restate what is already obvious from the hint questions.
- Be specific: exact character counts, exact label text, exact field positions if known.
- Focus on what separates a good forgery from a genuine document — not basic errors.

OUTPUT FORMAT:
Use minimal markdown for structure:
- ## for section headers (use 3–5 sections max)
- **bold** for exact values, field names, and critical rules
- - bullet points within sections where listing makes sense
- Plain prose for everything else
No tables. No code blocks. No nested bullets.
Return only the briefing. No preamble, no "here is your briefing".

HINT PAGE:
[paste your hint page JSON here]
```

---

After generating, save the output as a `.txt` file in this folder — no wrapping needed, just the raw text.
