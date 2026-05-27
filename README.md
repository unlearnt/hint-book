# HintBook — AI Document Fraud Detection

A browser-based tool that uses multimodal LLMs to assess identity documents against structured forensic checklists ("hint pages"). Upload a document image, select the document type, and the model works through every check and returns a verdict.

---

## How it works

### 1. Hint pages

Each document type (e.g. California DL, US Green Card, German Personalausweis) is represented as a **hint page** — a structured checklist of binary forensic questions organised into sections.

Each hint is a 4-tuple:

```
[id, question, note, expect]
```

| Field | Description |
|-------|-------------|
| `id` | Unique check ID, e.g. `S6.1` |
| `question` | A binary question answerable from a document image |
| `note` | Forensic context, source citation, or generation note (nullable) |
| `expect` | `YES`, `NO`, or `CONTEXT` — what a genuine document should show |

Three hint pages are built in (CA DL, US Green Card, German ID). Additional pages can be generated at runtime by the LLM (see §4).

---

### 2. Assessment flow

When the user clicks **Assess**:

1. **Image prep** — uploaded images are resized to a max 1024px longest side on a canvas element and converted to base64 data URLs (`resizeToBase64`).

2. **Prompt construction** — all hints from the selected page are serialised into a numbered checklist string, with each item showing the check ID, question, note, and expected answer.

3. **LLM call** — a request is sent to DeepInfra via `/api/llm/chat/completions` (proxied by Vite):
   - Model: `Qwen/Qwen3-VL-235B-A22B-Instruct` (vision model)
   - Images are attached as `image_url` content blocks (OpenAI vision format)
   - The prompt instructs the model to answer each check and return **only** a JSON object

4. **Response parsing** — the raw model response is stripped of any accidental markdown fences and parsed as JSON. The expected shape is:

```json
{
  "verdict": "HIGHLY_SUSPICIOUS | SUSPICIOUS | APPEARS_LEGITIMATE | CANNOT_DETERMINE",
  "summary": "2-3 sentence assessment",
  "criticalFails": 0,
  "warnings": 0,
  "passes": 0,
  "unverifiable": 0,
  "sections": [
    {
      "id": "S6",
      "title": "License / ID number format",
      "checks": [
        { "id": "S6.1", "answer": "YES", "finding": "One-sentence observation" }
      ]
    }
  ]
}
```

5. **Results display** — the verdict banner, score counters (passed / critical fails / warnings / unverifiable), and per-section check results are rendered in the right panel. Each check answer is colour-coded (green = YES, red = NO, amber = WARN, blue = CONTEXT, grey = UNVERIFIABLE).

---

### 3. Layout

The UI is a fixed three-panel layout:

```
┌─────────────┬──────────────────────┬──────────────────────┐
│  Left nav   │   Centre: hint page  │  Right: assessment   │
│  (doc type  │   (checklist view,   │  (upload, results,   │
│   selector) │    collapsible)      │   verdict)           │
└─────────────┴──────────────────────┴──────────────────────┘
```

The divider between centre and right panels is draggable (`mousedown`/`mousemove` handlers, `centerW` state).

---

### 4. Dynamic hint page generation

Users can type any document type (e.g. "UK Passport", "Texas DL") into the **+ Add Hint Page** input. This triggers a separate LLM call using a different model:

- Model: `deepseek-ai/DeepSeek-V4-Pro` (text model, via DeepInfra)
- A detailed meta-prompt (`HINTBOOK_PROMPT`) instructs the model to produce a complete hint page JSON following the same schema as the built-in pages
- On success, the new page is added to `dynPages` state, marked with a **`GEN`** badge in the nav, and selected automatically

Generated pages live in React state only and are lost on refresh. To persist one permanently:

1. Click the **download icon** on the generated page in the left nav — this exports a ready-to-use `.js` file
2. Move the file into `src/hints/`
3. Add the import and entry to `src/hints/index.js`

---

### 5. Models

| Task | Model | Endpoint |
|------|-------|----------|
| Document assessment | `Qwen/Qwen3-VL-235B-A22B-Instruct` | `/api/llm` → DeepInfra |
| Hint page generation | `deepseek-ai/DeepSeek-V4-Pro` | `/api/llm` → DeepInfra |

Both routes share the same DeepInfra proxy and API key. The PayPal CosmosAI proxy (`/api/cosmos`) is configured in `vite.config.js` but unused outside the corporate network.

---

### 6. API proxy

All LLM calls go through Vite's dev server proxy, which injects the API key server-side so it is never exposed to the browser.

```
/api/llm  →  https://api.deepinfra.com/v1/openai
/api/cosmos  →  https://aiplatform.dev51.cbf.dev.paypalinc.com/cosmosai/llm/v1  (corp network only)
```

---

## Project structure

```
hintbook-app/
├── src/
│   ├── main.jsx              # React entry point
│   ├── HintBook.jsx          # UI, state, API calls
│   └── hints/
│       ├── index.js          # Combines all built-in pages, exports PAGES
│       ├── ca_dl.js          # California DL / ID
│       ├── us_greencard.js   # US Green Card (I-551)
│       └── deu_id.js         # German Personalausweis
├── index.html
├── vite.config.js            # Dev server + API proxy config
├── package.json
└── .env                      # API keys (not committed)
```

### Adding a new built-in hint page

1. Create `src/hints/{id}.js` — export a default object matching the hint page schema
2. Import it in `src/hints/index.js` and add it to the `PAGES` object

---

## Setup

```bash
pnpm install
```

Create `.env`:

```
DEEPINFRA_API_KEY=your_key_here
COSMOS_API_KEY=your_key_here   # optional, corp network only
```

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Answer types

| Answer | Meaning |
|--------|---------|
| `YES` | Feature confirmed present — as expected on a genuine document |
| `NO` | Feature absent or wrong — anomaly / red flag |
| `WARN` | Borderline or degraded — warrants closer inspection |
| `CONTEXT` | Generation-dependent — model describes what it observes |
| `UNVERIFIABLE` | Cannot be determined from the image |

**Critical fails** = checks where `expect=YES` but model answered `NO`, or `expect=NO` but model answered `YES`. These drive the overall verdict.
