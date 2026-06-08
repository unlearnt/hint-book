const TEXAS_DRIVER_LICENSE = {
  "id": "texas_driver_license",
  "title": "Texas Driver License",
  "color": "#002868",
  "subtitle": "Gen 2009 · Gen 2020 · Gen 2025 (all currently valid generations)",
  "sources": [
    "Texas DPS — Texas DL/ID Card Designs (dps.texas.gov, updated Jan 2026)",
    "Texas DPS — DL-73 'Meet the Redesigned Texas Driver License and ID Card' (Rev. 8/2025)",
    "Texas DPS — Federal REAL ID Act page",
    "AAMVA DL/ID Card Design Standard (2020 / 2025), Annex D — PDF417 barcode",
    "AAMVA Issuer Identification Numbers (IIN) directory — Texas IIN 636015",
    "Texas Transportation Code §521 (license issuance, validity, minor restrictions)"
  ],
  "sections": [
    {
      "id": "A",
      "title": "Generation identification",
      "hints": [
        [
          "A.1",
          "Is the card one of exactly three currently-valid generations — Gen 2009 (issued 04/2009-02/23/2020), Gen 2020 (issued 02/24/2020-08/31/2025), or Gen 2025 (issued from 08/18/2025)?",
          "Texas DPS lists exactly these three design eras. A card whose design does not match its stated issue date is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "A.2",
          "If issued on or after 08/18/2025, is the card polycarbonate with LASER ENGRAVING (not inkjet/dye-sublimation print)?",
          "Gen 2025 introduced laser-engraved personalization. Glossy inkjet-looking print on a post-Aug-2025 card = red flag.",
          "CONTEXT"
        ],
        [
          "A.3",
          "Does the REAL ID star color match the generation — GOLD on Gen 2016-2025 cards, BLACK (laser-engraved) on Gen 2025 cards?",
          "DL-73 (Rev 8/2025): the new star is laser engraved and appears black. A black star on a pre-2025 card, or a gold star on a 2025 design, is a generation contradiction.",
          "CONTEXT"
        ],
        [
          "A.4",
          "If the oldest Gen 2009 design, is the issue date plausibly still in circulation (6-yr terms out by 02/24/2026; 8-yr terms expiring through ~2028)?",
          "Per DPS, oldest 6-year cards should be out of circulation by 02/24/2026. A freshly-issued card in the 2009 design = forgery.",
          "CONTEXT"
        ],
        [
          "A.5",
          "Does the card carry the Dynamic Look-Through Element (window with optically variable material) characteristic of Gen 2025?",
          "Gen 2025 feature per DL-73. Absence on a claimed-2025 card is suspicious; presence on a claimed-2009 card is impossible.",
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
          "Does the top of the card read 'TEXAS' with 'DRIVER LICENSE' (note: NO apostrophe-S — it is 'DRIVER LICENSE', not 'DRIVER'S LICENSE')?",
          "Texas officially titles the document 'Driver License'. 'Driver's License' wording is a common forger error.",
          "YES"
        ],
        [
          "B.2",
          "Is the State of Texas seal or the Texas star/silhouette present as a design element?",
          "Genuine cards carry Texas state iconography (Lone Star / state outline) integrated into the artwork.",
          "YES"
        ],
        [
          "B.3",
          "Are field labels in English using Texas conventions (DOB, EXP, DD, CLASS, END, REST, SEX, HGT, EYES, DLN/no.)?",
          null,
          "YES"
        ],
        [
          "B.4",
          "Is 'USA' or 'United States of America' absent as a sovereign header (US sub-national IDs do NOT print a national title block like passports)?",
          "Driver licenses are state documents; a passport-style nation header is a red flag.",
          "NO"
        ],
        [
          "B.5",
          "Does the card avoid any MRZ-style country code such as 'IDUSA' on the front (US DLs have no MRZ)?",
          "US driver licenses do not carry an ICAO MRZ. Any 3-line OCR-B machine-readable zone is fabricated.",
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
          "Are names printed in the order family name then given/middle, in uppercase Latin characters?",
          "Texas prints surname first. Verify casing and ordering against the barcode (see M).",
          "YES"
        ],
        [
          "C.2",
          "Is the printed name free of diacritics/non-ASCII unless reflecting a legal name (Texas truncates/transliterates per AAMVA)?",
          null,
          "CONTEXT"
        ],
        [
          "C.3",
          "Does the name field length stay within the card's print area without overflow, overlap, or font substitution?",
          "Mismatched fonts or characters running into adjacent fields indicate digital tampering.",
          "YES"
        ],
        [
          "C.4",
          "Does the printed cardholder name exactly match the ghost/secondary portrait's overprinted name (if a name overprint is present on the ghost image)?",
          "A ghost-image name that differs from the main name indicates altered card stock.",
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
          "Is the driver license number exactly 8 digits, ALL NUMERIC (e.g. 12345678) with no letters?",
          "Texas DL numbers are 8 numeric digits. A leading letter or any alpha character (DMV-style A1234567) is wrong for Texas.",
          "YES"
        ],
        [
          "D.2",
          "Is the DL number free of separators, spaces, or hyphens within the 8-digit string?",
          null,
          "YES"
        ],
        [
          "D.3",
          "Does the DL number length differ from 7 or 9 digits (those lengths belong to other states' schemes)?",
          "Adjacent-state schemes use different lengths; an off-length number is a forgery indicator.",
          "NO"
        ],
        [
          "D.4",
          "Is a separate Audit/Document Discriminator (DD) string present and distinct from the DL number?",
          "Texas prints a DD/audit string; reusing the DL number as the DD is a fabrication tell.",
          "YES"
        ]
      ]
    },
    {
      "id": "E",
      "title": "Date fields & validity",
      "hints": [
        [
          "E.1",
          "Are all dates in US format MM/DD/YYYY with a 4-digit year?",
          "Texas uses MM/DD/YYYY. ISO (YYYY-MM-DD) or DD.MM.YYYY (European) formatting is a forgery indicator.",
          "YES"
        ],
        [
          "E.2",
          "Does the expiration fall on the cardholder's BIRTHDAY (month/day of expiry = month/day of DOB)?",
          "Texas expires DLs on the holder's birthday. An expiry that ignores the birthday is structurally wrong.",
          "YES"
        ],
        [
          "E.3",
          "Is the standard adult validity term ~8 years from issue (issue-to-expiry span ≈ 8 years)?",
          "Texas adult DLs are valid up to 8 years. A 4- or 10-year span on an ordinary adult card is suspect.",
          "CONTEXT"
        ],
        [
          "E.4",
          "For drivers age 85+ at issue, is the term shortened to 2 years?",
          "Texas shortens terms for the most senior drivers; a full 8-year term issued at 86 is inconsistent.",
          "CONTEXT"
        ],
        [
          "E.5",
          "Is the issue date (DD/audit or 'ISS') chronologically before the expiration date and not in the future?",
          null,
          "YES"
        ],
        [
          "E.6",
          "If 'LIMITED TERM' appears, is the expiration tied to lawful-presence end (often a shorter, non-8-year term)?",
          "Limited-term cards for temporary lawful presence carry shorter validity matched to immigration documents.",
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
          "Is height (HGT) in IMPERIAL units feet-inches (e.g. 5'-10\") and NOT centimeters?",
          "Texas uses imperial height. A metric height in cm is a non-US forgery tell.",
          "YES"
        ],
        [
          "F.2",
          "Is eye color (EYES) a 3-letter AAMVA code (BRO, BLU, GRN, HAZ, GRY, BLK, etc.) in English?",
          "Foreign-language eye-color terms (e.g. German 'braun') indicate a copied non-Texas template.",
          "YES"
        ],
        [
          "F.3",
          "Is the SEX field a single AAMVA value (M, F, or X)?",
          "Texas supports M/F and X. Spelled-out 'MALE' or numeric 1/2 in the printed field is atypical for the card face.",
          "YES"
        ],
        [
          "F.4",
          "Is weight (WGT), if shown, in pounds (lb) rather than kilograms?",
          null,
          "CONTEXT"
        ],
        [
          "F.5",
          "Does the portrait have neutral studio lighting, correct skin-tone rendering, and edges fused into the polycarbonate (no raised/glued photo)?",
          "A photo with a tactile raised edge or visible substrate seam = photo substitution.",
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
          "Is the CLASS a valid Texas value (A, B, C, or M)?",
          "Texas non-CDL/CDL classes are A/B/C plus M for motorcycle. An out-of-set class letter is invalid.",
          "YES"
        ],
        [
          "G.2",
          "If motorcycle operation is implied, is Class M or an 'M' authorization actually present?",
          null,
          "CONTEXT"
        ],
        [
          "G.3",
          "Are restriction (REST) and endorsement (END) codes drawn from Texas's published code set?",
          "Invented codes, or codes from another state's table, are a red flag; cross-check against the DPS restriction/endorsement list.",
          "CONTEXT"
        ],
        [
          "G.4",
          "If a corrective-lens restriction is shown, is it consistent across the printed field and barcode?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "H",
      "title": "Orientation & minor / under-21 features",
      "hints": [
        [
          "H.1",
          "Is the card ORIENTATION correct for age — HORIZONTAL (landscape) for 21+, VERTICAL (portrait) for under-21?",
          "Texas issues vertical cards to under-21 holders. A landscape card for someone under 21 (by DOB) is a critical mismatch.",
          "CONTEXT"
        ],
        [
          "H.2",
          "If under 21, is an 'UNDER 21 UNTIL MM/DD/YYYY' notation present and equal to DOB + 21 years?",
          "The under-21 date must equal date of birth plus 21. A mismatched year exposes an altered DOB.",
          "CONTEXT"
        ],
        [
          "H.3",
          "If under 18, is an 'UNDER 18 UNTIL MM/DD/YYYY' notation present and equal to DOB + 18 years?",
          null,
          "CONTEXT"
        ],
        [
          "H.4",
          "For an adult (21+) card, are the under-21/under-18 notations ABSENT?",
          "Presence of an 'UNDER 21' banner on a card whose DOB shows 30+ is a red flag.",
          "CONTEXT"
        ],
        [
          "H.5",
          "For a minor card, is provisional/teen wording consistent with the vertical layout and DOB?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "I",
      "title": "REAL ID & status markers",
      "hints": [
        [
          "I.1",
          "If issued on/after 10/10/2016 as REAL-ID compliant, is a star inside a circle present in the UPPER-RIGHT corner?",
          "Texas REAL ID compliant cards carry the circle-with-inset-star top right. Absence on a compliant card is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "I.2",
          "Is the star's appearance consistent with generation — gold (2016-2025) vs laser-engraved black (2025+)?",
          "See A.3. Color must match the design era.",
          "CONTEXT"
        ],
        [
          "I.3",
          "For a non-compliant card, is the star ABSENT (and not a fabricated star added to imply compliance)?",
          "Not all valid Texas cards are REAL ID; but a star must never appear on a non-compliant issuance.",
          "CONTEXT"
        ],
        [
          "I.4",
          "Are the organ-donor (heart) and veteran / disabled-veteran identifiers, if present, rendered as the standard Texas markers?",
          "DL-73 confirms organ donor and veteran identifiers carry over unchanged into Gen 2025.",
          "CONTEXT"
        ],
        [
          "I.5",
          "Is the Communication Impediment / Deaf-or-Hard-of-Hearing identifier, if present, in the standard Texas form?",
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
          "Is the card body POLYCARBONATE (rigid, single fused body) rather than laminated PVC with a peelable overlay?",
          "All current Texas generations are polycarbonate per DPS. A delaminating/laminate-pouch feel indicates a counterfeit.",
          "YES"
        ],
        [
          "J.2",
          "Does tilting reveal optically variable / holographic imagery (e.g. Texas star/state motifs shifting) rather than a flat printed 'hologram'?",
          "Genuine OVD shifts with angle; a static printed rainbow patch is a forgery tell.",
          "YES"
        ],
        [
          "J.3",
          "On Gen 2025, is the Dynamic Look-Through window with optically variable material visible when held to light?",
          "DL-73 lists a dynamic look-through element with OVM (and UV). Absence on a 2025 card is suspicious.",
          "CONTEXT"
        ],
        [
          "J.4",
          "Is a tactile (raised) surface feature detectable where DL-73 specifies one on Gen 2025 cards?",
          "Gen 2025 has a tactile surface feature; a perfectly flat 2025 card lacks an expected security element.",
          "CONTEXT"
        ],
        [
          "J.5",
          "Is there a secondary ghost / mini portrait that matches the primary photo and is laser-engraved into the substrate?",
          "DL-73 notes a mini portrait. A ghost image that differs from the main photo indicates altered stock.",
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
          "Under UV light, do UV-reactive Texas design elements fluoresce while the rest of the card stays dark (no overall blue glow)?",
          "Genuine polycarbonate stays inert; an all-over bright blue fluorescence indicates consumer paper/PVC stock.",
          "YES"
        ],
        [
          "K.2",
          "On Gen 2025, does the optically variable look-through element show its UV-reactive component as described in DL-73?",
          "DL-73 pairs the look-through element with UV. Missing UV response is a red flag on a 2025 card.",
          "CONTEXT"
        ],
        [
          "K.3",
          "Are UV state symbols (star/Texas motifs) sharply defined rather than smudged or hand-applied?",
          null,
          "YES"
        ],
        [
          "K.4",
          "Is the UV pattern free of misregistration relative to the visible-light print (UV should align to design)?",
          null,
          "YES"
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
          "Absence of a readable PDF417 barcode on the back is a primary forgery indicator for any US DL.",
          "YES"
        ],
        [
          "L.2",
          "Does the PDF417 header decode to ANSI with Texas Issuer Identification Number 636015?",
          "Texas IIN is 636015 per the AAMVA directory. A different IIN in a 'Texas' barcode means cloned/wrong stock.",
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
          "Is the DAQ (license number) in the barcode exactly the 8-digit numeric value matching the front?",
          "See cross-checks in M. A barcode DAQ that is non-numeric or differs from the front is data-layer tampering.",
          "YES"
        ],
        [
          "L.5",
          "Does the barcode 1D/2D quality scan cleanly (no missing rows, no copy-of-a-copy degradation, correct error correction)?",
          null,
          "YES"
        ],
        [
          "L.6",
          "Are back-of-card data fields (donor, restrictions, audit info) consistent with the front and free of overprint artifacts?",
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
          "Catches data-layer tampering invisible to a glance: altered front text over an unchanged barcode.",
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
          "A name/sex or printed/barcode sex contradiction is a strong fabrication signal.",
          "YES"
        ],
        [
          "M.4",
          "Does the barcode EXPIRATION (DBA) and ISSUE date match the printed dates?",
          null,
          "YES"
        ],
        [
          "M.5",
          "Does the barcode DL number (DAQ) match the printed 8-digit DL number?",
          null,
          "YES"
        ],
        [
          "M.6",
          "Does the barcode HEIGHT (DAU) and EYE color (DAY) match the printed HGT/EYES?",
          null,
          "YES"
        ],
        [
          "M.7",
          "Is the card ORIENTATION (vertical vs horizontal) consistent with age computed from DOB (under-21 → vertical)?",
          "Links H.1 to the DOB: an under-21 DOB on a horizontal card is contradictory.",
          "CONTEXT"
        ],
        [
          "M.8",
          "Does the 'UNDER 21 UNTIL' / 'UNDER 18 UNTIL' date equal DOB plus 21 / plus 18 exactly?",
          "An age-marker year that doesn't equal DOB+21 exposes a doctored birth year.",
          "CONTEXT"
        ],
        [
          "M.9",
          "Does the REAL ID star's presence/color agree with the issue date and design generation (gold ≤2025, black ≥2025)?",
          "Combines I.1-I.2 with A.3 — a generation/marker mismatch is a sophisticated-fake catch.",
          "CONTEXT"
        ],
        [
          "M.10",
          "Do all generation-specific features coexist correctly (e.g. laser engraving + black star + look-through element all on a Gen 2025 card, none on a Gen 2009 card)?",
          "Genuine cards never mix features across eras; a 2009-style body with a 2025 black star is impossible.",
          "CONTEXT"
        ]
      ]
    }
  ]
};

export default TEXAS_DRIVER_LICENSE;
