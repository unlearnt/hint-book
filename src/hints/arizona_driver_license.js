const ARIZONA_DRIVER_LICENSE = {
  "id": "arizona_driver_license",
  "title": "Arizona Driver License",
  "color": "#CE1126",
  "subtitle": "Gen 2016 · Gen 2023 (all currently valid generations)",
  "sources": [
    "Arizona DOT/MVD — 'Arizona License and ID cards are getting an updated look' (Feb 27, 2023 press release)",
    "Arizona DOT/MVD — License Features & Arizona Travel ID pages (azdot.gov)",
    "Arizona DOT/MVD — Under 21 Driver License & Driver License Classes pages",
    "AAMVA DL/ID Card Design Standard (2020 / 2025), Annex D — PDF417 barcode",
    "AAMVA Issuer Identification Numbers (IIN) directory — Arizona IIN 636026",
    "Arizona Revised Statutes Title 28 (driver license issuance, age-65 expiration, minor restrictions)"
  ],
  "sections": [
    {
      "id": "A",
      "title": "Generation identification",
      "hints": [
        [
          "A.1",
          "Is the card one of the two currently-valid designs — Gen 2016 (pre-2023 Travel ID-era design, issued through 02/28/2023) or Gen 2023 (Thales redesign, issued from mid-March 2023)?",
          "MVD issued the prior design through Feb 28, 2023; it remains valid until expiry. Because standard AZ licenses run until age 65, older designs circulate unusually long. A design matching neither era is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "A.2",
          "On a Gen 2023 card, are saguaro cactus and ponderosa pine images present in the artwork?",
          "These motifs were chosen for the 2023 Thales redesign. Their absence on a claimed-2023 card is suspicious.",
          "CONTEXT"
        ],
        [
          "A.3",
          "On a Gen 2023 card, is the personalization LASER-ENGRAVED with a BLACK-AND-WHITE (grayscale) photo rather than a color dye-sublimation photo?",
          "The 2023 design uses laser engraving and a grayscale portrait. A glossy color inkjet photo on a 2023-design card is a red flag.",
          "CONTEXT"
        ],
        [
          "A.4",
          "Does the Travel ID star color match the generation — GOLD star (Gen 2016) vs laser-engraved BLACK star (Gen 2023)?",
          "Arizona moved from a gold star to a black laser-engraved star with the 2023 redesign. A black star on a pre-2023 design (or gold on a 2023 design) is a generation contradiction.",
          "CONTEXT"
        ],
        [
          "A.5",
          "On a Gen 2023 card, is the 'Dynaprint' dual-image element (two high-resolution images appearing by viewing angle) present?",
          "Dynaprint is a defining Gen 2023 security feature. Absence on a claimed-2023 card is suspicious; it cannot appear on a Gen 2016 card.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "B",
      "title": "Header, labels & state symbols",
      "hints": [
        [
          "B.1",
          "Does the card read 'Arizona' with 'DRIVER LICENSE' (note: 'DRIVER LICENSE', not 'DRIVER'S LICENSE')?",
          "Arizona titles the document 'Driver License'. Apostrophe-S wording is a common forger error.",
          "YES"
        ],
        [
          "B.2",
          "Is Arizona state iconography (state seal / saguaro / Arizona sunset palette) integrated into genuine artwork rather than flat-pasted?",
          null,
          "YES"
        ],
        [
          "B.3",
          "Are field labels in English using MVD conventions (DOB, EXP, ISS, DD, CLASS, END, REST, SEX, HGT, EYES, WGT)?",
          null,
          "YES"
        ],
        [
          "B.4",
          "Is there NO passport-style sovereign national header ('United States of America' title block) — US DLs are state documents?",
          "A passport-style nation header is a red flag on a state-issued DL.",
          "NO"
        ],
        [
          "B.5",
          "Is there NO ICAO MRZ on the front (US driver licenses carry no machine-readable zone, only a PDF417 barcode on the back)?",
          "Any OCR-B 3-line MRZ on a US DL is fabricated.",
          "NO"
        ]
      ]
    },
    {
      "id": "C",
      "title": "Name fields",
      "hints": [
        [
          "C.1",
          "Are names printed in uppercase Latin characters in MVD order (family name then given/middle)?",
          "Cross-check ordering/spelling against the PDF417 barcode (see M).",
          "YES"
        ],
        [
          "C.2",
          "Is the printed name free of diacritics/non-ASCII unless reflecting the legal name (Arizona transliterates per AAMVA)?",
          null,
          "CONTEXT"
        ],
        [
          "C.3",
          "Does the name stay within the print area with consistent laser-engraved font and no overlap into adjacent fields?",
          "Font substitution or overflow indicates digital tampering.",
          "YES"
        ],
        [
          "C.4",
          "Does any ghost/secondary portrait match the primary photo, with no mismatched overprint?",
          "A ghost image differing from the main photo indicates altered stock.",
          "YES"
        ]
      ]
    },
    {
      "id": "D",
      "title": "DL number format",
      "hints": [
        [
          "D.1",
          "Is the driver license number 1 ALPHA letter followed by 8 NUMERIC digits (9 characters total, e.g. B12345678)?",
          "The standard modern Arizona DL number is 1 letter + 8 digits. An all-numeric or differently-structured number on a current card is suspect.",
          "YES"
        ],
        [
          "D.2",
          "Is the leading character a single letter (A-Z) and the remaining 8 characters all digits with no other letters embedded?",
          "Letters appearing after the first position are a red flag for the modern AZ format.",
          "YES"
        ],
        [
          "D.3",
          "If the number is all-numeric (legacy 9-digit SSN-style), is that consistent with a much older issuance only?",
          "Arizona historically issued 9-digit numeric (SSN-based) numbers; on a current-design card an all-numeric DL number is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "D.4",
          "Is a separate DD (audit / document discriminator) string present and distinct from the DL number?",
          "Reusing the DL number as the DD is a fabrication tell.",
          "YES"
        ]
      ]
    },
    {
      "id": "E",
      "title": "Date fields & validity (Arizona age-65 rule)",
      "hints": [
        [
          "E.1",
          "Are all dates in US format MM/DD/YYYY with a 4-digit year?",
          "Arizona uses MM/DD/YYYY. ISO (YYYY-MM-DD) or European (DD.MM.YYYY) formatting is a forgery indicator.",
          "YES"
        ],
        [
          "E.2",
          "On a STANDARD (non-Travel-ID) driver license, does the expiration fall on the holder's 65th BIRTHDAY (often decades after issue)?",
          "Arizona standard licenses are valid until age 65 — a hallmark quirk. A standard AZ DL showing a short ~5- or ~8-year expiry is a strong forgery indicator (forgers apply a normal expiry).",
          "CONTEXT"
        ],
        [
          "E.3",
          "On a TRAVEL ID (REAL ID) card, is the validity ~8 years for under-65 holders (or ~5 years for 65+)?",
          "Travel IDs expire every 8 years (under 65) / 5 years (65+) per the federal REAL ID rule, unlike the age-65 standard license.",
          "CONTEXT"
        ],
        [
          "E.4",
          "For a holder 65 or older, is the term ~5 years (standard renewals move to a 5-year cycle at 65+)?",
          "Arizona switches to 5-year in-person renewals at 65. A 40-year expiry issued at 70 is impossible.",
          "CONTEXT"
        ],
        [
          "E.5",
          "Is the issue date before the expiration date and not set in the future?",
          null,
          "YES"
        ],
        [
          "E.6",
          "If 'Limited Term' / temporary-lawful-presence wording appears, is the expiration shortened to match immigration documents (not the age-65 date)?",
          "Lawful-presence cards carry shorter validity, overriding the age-65 rule.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "F",
      "title": "Physical descriptors",
      "hints": [
        [
          "F.1",
          "Is height (HGT) in IMPERIAL feet-inches (e.g. 5'-10\") and NOT centimeters?",
          "Arizona uses imperial height. A metric cm height is a non-US forgery tell.",
          "YES"
        ],
        [
          "F.2",
          "Is eye color (EYES) a 3-letter AAMVA code (BRO, BLU, GRN, HAZ, GRY, BLK, etc.) in English?",
          "Foreign-language eye-color terms indicate a copied non-US template.",
          "YES"
        ],
        [
          "F.3",
          "Is the SEX field a single AAMVA value (M, F, or X)?",
          "Spelled-out 'MALE' or numeric values on the printed face are atypical.",
          "YES"
        ],
        [
          "F.4",
          "Is weight (WGT), if shown, in pounds rather than kilograms?",
          null,
          "CONTEXT"
        ],
        [
          "F.5",
          "Is the portrait a laser-engraved grayscale image fused into the polycarbonate with no raised/glued photo edge?",
          "On Gen 2023 the photo is grayscale and laser-engraved; a glued color photo with a tactile edge = photo substitution.",
          "YES"
        ]
      ]
    },
    {
      "id": "G",
      "title": "Class, endorsements & restrictions",
      "hints": [
        [
          "G.1",
          "Is the CLASS a valid Arizona value (A, B, C for commercial; D operator; G graduated/under-18; M motorcycle)?",
          "Arizona uses Class D (regular operator) and Class G (graduated, for under-18) — codes absent in many other states. An out-of-set class letter is invalid.",
          "YES"
        ],
        [
          "G.2",
          "If the holder is under 18, is the class a graduated Class G consistent with the minor restrictions?",
          "Arizona issues Class G to under-18 drivers. A standard Class D for a 16-year-old is inconsistent.",
          "CONTEXT"
        ],
        [
          "G.3",
          "Are restriction (REST) and endorsement (END) codes drawn from Arizona's published code set rather than invented or borrowed from another state?",
          "Cross-check against the MVD restriction/endorsement list.",
          "CONTEXT"
        ],
        [
          "G.4",
          "If a corrective-lens restriction is shown, is it consistent between the printed field and the barcode?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "H",
      "title": "Orientation & under-21 features",
      "hints": [
        [
          "H.1",
          "Is the card ORIENTATION correct for age — HORIZONTAL for 21+, VERTICAL (portrait) for under-21 holders?",
          "Arizona issues vertical cards to under-21 holders. A horizontal card for an under-21 DOB is a critical mismatch.",
          "CONTEXT"
        ],
        [
          "H.2",
          "On an under-21 card, is the 'Under 21' status indicated next to the photo with the date the holder reaches age 21?",
          "MVD prints the under-21 status and the age-21 date beside the photo on vertical cards.",
          "CONTEXT"
        ],
        [
          "H.3",
          "Does the displayed age-21 date equal DOB + 21 years exactly?",
          "A date that doesn't equal DOB+21 exposes an altered birth year.",
          "CONTEXT"
        ],
        [
          "H.4",
          "For an adult (21+) card, are the under-21 status notations ABSENT?",
          "An 'Under 21' marker on a card whose DOB shows 30+ is a red flag.",
          "CONTEXT"
        ],
        [
          "H.5",
          "If the holder is under 18, is a corresponding under-18 indication / graduated-license marking present?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "I",
      "title": "Travel ID / REAL ID & status markers",
      "hints": [
        [
          "I.1",
          "On a Travel ID (REAL ID), is a star present in the UPPER-RIGHT corner (gold on Gen 2016, black laser-engraved on Gen 2023)?",
          "Arizona's REAL-ID-compliant credential is the Travel ID, marked with a star top right. Absence on a Travel ID is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "I.2",
          "On a STANDARD (non-compliant) license, is it marked 'Not for federal identification' and free of any Travel ID star?",
          "Arizona standard cards carry 'Not for federal identification'. A standard card lacking this text, or one carrying BOTH the marking and a star, is contradictory.",
          "CONTEXT"
        ],
        [
          "I.3",
          "Is the star's style consistent with the generation per A.4 (gold ≤2023, black laser-engraved ≥2023)?",
          "Marker style must match the design era.",
          "CONTEXT"
        ],
        [
          "I.4",
          "Does the validity logic agree with the card type — standard = age-65 expiry, Travel ID = 8/5-year expiry (see E.2-E.3)?",
          "A 'standard' card with an 8-year expiry, or a 'Travel ID' running to age 65, is a structural contradiction.",
          "CONTEXT"
        ],
        [
          "I.5",
          "Is the organ-donor / veteran identifier, if present, rendered in the standard Arizona form (not a pasted graphic)?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "J",
      "title": "Security features — visual",
      "hints": [
        [
          "J.1",
          "Is the card body 100% polycarbonate (rigid, multi-layer fused body) with no peelable laminate overlay or edge delamination?",
          "The 2023 design is fused polycarbonate with no adhesives. A peelable pouch laminate or delaminating edge indicates a counterfeit.",
          "YES"
        ],
        [
          "J.2",
          "Is the 'Dynaprint' dual-image feature visible — two distinct high-resolution images appearing depending on the viewing angle?",
          "Gen 2023 Dynaprint. A single static image, or a flat printed 'hologram', is a forgery tell.",
          "CONTEXT"
        ],
        [
          "J.3",
          "Is the 'Secure Surface' tactile (slightly raised) area detectable where the 2023 design places it?",
          "Gen 2023 Secure Surface raised feature. A perfectly flat 2023 card lacks an expected security element.",
          "CONTEXT"
        ],
        [
          "J.4",
          "Is the personalization laser-engraved (data and grayscale photo etched into the substrate) rather than surface-printed?",
          "Surface-printed data that scratches/smears indicates non-genuine stock on a 2023 card.",
          "CONTEXT"
        ],
        [
          "J.5",
          "Does tilting reveal optically variable / holographic imagery (Arizona state motifs shifting) rather than a static printed patch?",
          "Genuine OVD shifts with angle; a static rainbow patch is a forgery tell.",
          "YES"
        ],
        [
          "J.6",
          "Is microprinting present and crisp (not blurred to a gray line) where genuine cards place fine-line/microtext?",
          "Counterfeits cannot resolve microtext; it blurs under magnification.",
          "YES"
        ]
      ]
    },
    {
      "id": "K",
      "title": "UV / ultraviolet features",
      "hints": [
        [
          "K.1",
          "Under UV light, do Arizona UV-reactive design elements fluoresce while the rest of the card stays dark (no all-over blue glow)?",
          "An all-over bright blue fluorescence indicates consumer paper/PVC stock rather than genuine polycarbonate.",
          "YES"
        ],
        [
          "K.2",
          "Are UV state symbols (Arizona motifs / state outline) sharply defined rather than smudged or hand-applied?",
          null,
          "YES"
        ],
        [
          "K.3",
          "Is the UV pattern correctly registered to the visible-light print (UV aligns to design, not offset)?",
          null,
          "YES"
        ],
        [
          "K.4",
          "Is the UV response consistent with the card's generation (UV imagery matching a genuine Gen 2016 or Gen 2023 design)?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "L",
      "title": "Back of card & PDF417 barcode",
      "hints": [
        [
          "L.1",
          "Is a PDF417 2D barcode present on the BACK (US DLs encode data in PDF417, not an MRZ)?",
          "Absence of a readable PDF417 barcode is a primary forgery indicator for any US DL.",
          "YES"
        ],
        [
          "L.2",
          "Does the PDF417 header decode to ANSI with Arizona Issuer Identification Number 636026?",
          "Arizona IIN is 636026 per the AAMVA directory. A different IIN in an 'Arizona' barcode means cloned/wrong stock.",
          "YES"
        ],
        [
          "L.3",
          "Does the barcode contain the AAMVA mandatory subfile elements — DCS (family name), DAC (first name), DBB (DOB), DBA (expiry), DAQ (DL number), DAG (address)?",
          "Missing mandatory AAMVA Annex D elements indicates a hand-built or partial barcode.",
          "YES"
        ],
        [
          "L.4",
          "Is the DAQ (license number) in the barcode the same 1-letter + 8-digit value printed on the front?",
          "A barcode DAQ that is all-numeric or differs from the front is data-layer tampering.",
          "YES"
        ],
        [
          "L.5",
          "Does the barcode scan cleanly (no missing rows, no copy-of-a-copy degradation, correct error correction)?",
          null,
          "YES"
        ],
        [
          "L.6",
          "Are back-of-card data fields and any duplicate data consistent with the front and free of overprint artifacts?",
          null,
          "YES"
        ]
      ]
    },
    {
      "id": "M",
      "title": "Cross-field consistency",
      "hints": [
        [
          "M.1",
          "Does the PDF417 barcode NAME (DCS/DAC/DAD) exactly match the printed name?",
          "Catches data-layer tampering: altered front text over an unchanged barcode.",
          "YES"
        ],
        [
          "M.2",
          "Does the barcode DATE OF BIRTH (DBB) exactly match the printed DOB?",
          "A DOB altered on the front to fake age 21 will mismatch the barcode.",
          "YES"
        ],
        [
          "M.3",
          "Does the barcode SEX (DBC) match the printed SEX field?",
          "A printed/barcode sex contradiction (or name/sex inconsistency) is a strong fabrication signal.",
          "YES"
        ],
        [
          "M.4",
          "Do the barcode EXPIRATION (DBA) and ISSUE dates match the printed dates?",
          null,
          "YES"
        ],
        [
          "M.5",
          "Does the barcode DL number (DAQ) match the printed 1-letter + 8-digit DL number?",
          null,
          "YES"
        ],
        [
          "M.6",
          "Do the barcode HEIGHT (DAU) and EYE color (DAY) match the printed HGT/EYES?",
          null,
          "YES"
        ],
        [
          "M.7",
          "Is the card ORIENTATION (vertical vs horizontal) consistent with age computed from DOB (under-21 → vertical)?",
          "An under-21 DOB on a horizontal card is contradictory.",
          "CONTEXT"
        ],
        [
          "M.8",
          "Does the printed age-21 date equal DOB + 21 years exactly?",
          "An age-marker year that doesn't equal DOB+21 exposes a doctored birth year.",
          "CONTEXT"
        ],
        [
          "M.9",
          "Does the EXPIRATION agree with the card type — standard license expiring on the 65th birthday, Travel ID on an 8/5-year cycle?",
          "The most important Arizona-specific catch: validity logic must match the standard vs Travel ID type and the holder's DOB.",
          "CONTEXT"
        ],
        [
          "M.10",
          "Are the status markers mutually exclusive — a card is NOT simultaneously a Travel ID (star) AND marked 'Not for federal identification'?",
          "These are mutually exclusive; coexistence proves fabrication.",
          "CONTEXT"
        ],
        [
          "M.11",
          "Do generation-specific features coexist correctly (e.g. saguaro/ponderosa artwork + Dynaprint + Secure Surface + black star all on one Gen 2023 card; gold star + no Dynaprint on Gen 2016)?",
          "Genuine cards never mix features across design eras.",
          "CONTEXT"
        ]
      ]
    }
  ]
};

export default ARIZONA_DRIVER_LICENSE;
