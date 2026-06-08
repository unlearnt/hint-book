// Tool registry — each entry has:
//   schema   : OpenAI function-calling schema sent to the LLM
//   execute  : async (args, context) => result object
//
// context = { imgs }  where imgs[i] = { preview, base64, mtype }
// Stubs return { status: "not_implemented" } until the tool is built.

const stub = (name) => async () => ({
  status: "not_implemented",
  tool: name,
  note: "This tool is defined but not yet implemented.",
});

export const TOOLS = {

  // ── Barcode decoder ────────────────────────────────────────────────────────
  read_barcode: {
    schema: {
      type: "function",
      function: {
        name: "read_barcode",
        description:
          "Decode a barcode (PDF417, QR, Code39, etc.) from a document image. " +
          "Use this to get ground-truth machine-readable data for cross-field consistency checks. " +
          "For AAMVA driver licences the returned object will contain named fields (name, DOB, DL number, address, etc.).",
        parameters: {
          type: "object",
          properties: {
            imgIdx: {
              type: "integer",
              description: "Which image to scan. 0 = front, 1 = back. Use back for PDF417 barcodes.",
            },
          },
          required: ["imgIdx"],
        },
      },
    },
    execute: stub("read_barcode"),
  },

  // ── OCR region ────────────────────────────────────────────────────────────
  ocr_region: {
    schema: {
      type: "function",
      function: {
        name: "ocr_region",
        description:
          "Run optical character recognition on a specific region of the document image. " +
          "Use this when you need to read fine text (DL number, DOB, expiry, MRZ lines) that may be too small to read reliably from the full image.",
        parameters: {
          type: "object",
          properties: {
            imgIdx: { type: "integer", description: "0 = front, 1 = back." },
            bbox: {
              type: "array",
              items: { type: "number" },
              minItems: 4,
              maxItems: 4,
              description: "Normalized [x1, y1, x2, y2] coordinates (0–1) of the region to read.",
            },
            hint: {
              type: "string",
              description: "Optional: what you expect to find (e.g. 'DL number', 'expiry date') to guide OCR.",
            },
          },
          required: ["imgIdx", "bbox"],
        },
      },
    },
    execute: stub("ocr_region"),
  },

  // ── MRZ validator ─────────────────────────────────────────────────────────
  validate_mrz: {
    schema: {
      type: "function",
      function: {
        name: "validate_mrz",
        description:
          "Parse and mathematically validate a Machine Readable Zone (MRZ). " +
          "Verifies all check digits per ICAO Doc 9303. " +
          "Pass the raw MRZ text you can see in the image; the tool will correct OCR errors where possible and flag check digit failures.",
        parameters: {
          type: "object",
          properties: {
            line1: { type: "string", description: "First MRZ line exactly as read from the image." },
            line2: { type: "string", description: "Second MRZ line." },
            line3: { type: "string", description: "Third MRZ line (TD1 format only, optional)." },
          },
          required: ["line1", "line2"],
        },
      },
    },
    execute: stub("validate_mrz"),
  },

  // ── ELA (Error Level Analysis) ────────────────────────────────────────────
  ela_analysis: {
    schema: {
      type: "function",
      function: {
        name: "ela_analysis",
        description:
          "Run Error Level Analysis on a region of the document image. " +
          "ELA detects digital tampering by identifying regions that were re-saved at a different JPEG compression level. " +
          "Elevated ELA in a field area (name, photo, DL number) is a strong tampering indicator. " +
          "Use this when a field looks visually inconsistent or when you suspect digital alteration.",
        parameters: {
          type: "object",
          properties: {
            imgIdx: { type: "integer", description: "0 = front, 1 = back." },
            bbox: {
              type: "array",
              items: { type: "number" },
              minItems: 4,
              maxItems: 4,
              description: "Region to analyse [x1,y1,x2,y2] (0–1). Omit to analyse the full image.",
            },
          },
          required: ["imgIdx"],
        },
      },
    },
    execute: stub("ela_analysis"),
  },

  // ── Zoom region ───────────────────────────────────────────────────────────
  zoom_region: {
    schema: {
      type: "function",
      function: {
        name: "zoom_region",
        description:
          "Crop and return a high-resolution sub-image of a specific region for closer visual inspection. " +
          "Use this before making a determination on small security features (microprinting, ghost photo, perforations, hologram text) " +
          "that may not be clearly visible in the full document image.",
        parameters: {
          type: "object",
          properties: {
            imgIdx: { type: "integer", description: "0 = front, 1 = back." },
            bbox: {
              type: "array",
              items: { type: "number" },
              minItems: 4,
              maxItems: 4,
              description: "Region to zoom into [x1,y1,x2,y2] (0–1 normalized coordinates).",
            },
          },
          required: ["imgIdx", "bbox"],
        },
      },
    },
    execute: stub("zoom_region"),
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export const ALL_TOOL_NAMES = Object.keys(TOOLS);

export const getToolSchemas = (names = ALL_TOOL_NAMES) =>
  names.map(n => TOOLS[n]?.schema).filter(Boolean);

export const executeTool = async (name, args, context) => {
  const tool = TOOLS[name];
  if (!tool) return { error: `Unknown tool: ${name}` };
  try {
    return await tool.execute(args, context);
  } catch (e) {
    return { error: e.message };
  }
};
