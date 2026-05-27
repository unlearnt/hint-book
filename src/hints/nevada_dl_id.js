const NEVADA_DL_ID={
  "id": "nevada_dl_id",
  "title": "Nevada Driver's License / ID",
  "color": "#0033A0",
  "subtitle": "Gen 2017 · Gen 2021 · Gen 2023",
  "sources": [
    "Nevada DMV Official Website (dmv.nv.gov)",
    "AAMVA DL/ID Card Design Standard (2020)",
    "REAL ID Act of 2005 regulations",
    "Nevada Revised Statutes Chapter 483",
    "IDScan.net Nevada DL reference",
    "Edmunds GovTech Nevada Driver License Guide"
  ],
  "sections": [
    {
      "id": "A",
      "title": "Generation & Layout Identification",
      "hints": [
        [
          "A.1",
          "Is the card material polycarbonate (not Teslin/laminated) with a matte finish and slightly flexible feel?",
          "Gen 2021+ transitioned to 100% polycarbonate body. Gen 2017 used a polycarbonate overlay on a Teslin core.",
          "CONTEXT"
        ],
        [
          "A.2",
          "Does the card display a REAL ID compliant gold circle with a star cutout in the upper-right corner?",
          "Mandatory for Gen 2017+ REAL ID compliant cards. Non-REAL ID cards will lack this star. Absence of star AND absence of 'NOT FOR REAL ID PURPOSES' or 'FEDERAL LIMITS APPLY' text is a red flag.",
          "CONTEXT"
        ],
        [
          "A.3",
          "If a non-REAL ID card, does it clearly state 'NOT FOR REAL ID PURPOSES' in a prominent location (top right or under DL#)?",
          "Gen 2017-2020 non-REAL ID cards used a gold circle without a star. Gen 2021+ non-REAL ID cards use 'NOT FOR REAL ID PURPOSES'. Coexistence of a star and this text is a critical error.",
          "YES"
        ],
        [
          "A.4",
          "Is the card layout horizontal for a Driver's License and vertical for an Identification Card or Instruction Permit?",
          "Nevada strictly uses vertical format for IDs and permits issued to all ages. A horizontal ID card or a vertical standard DL is a design violation.",
          "YES"
        ],
        [
          "A.5",
          "Is the background a 4-color guilloché incorporating the state shape (three corners) and a blue/white/gold motif, not a photographic scene?",
          "Gen 2021+ uses a complex, multi-layered guilloché background. Gen 2017 used a more prominent silhouette of the state in blue.",
          "CONTEXT"
        ],
        [
          "A.6",
          "Does the card have a laser-engraved 'NV' in the bottom-left corner of the photo area that appears three-dimensional?",
          "A tactile security feature introduced in Gen 2021. Gen 2017 cards have a flat, printed 'NV'.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "B",
      "title": "Header, Labels & State Symbolism",
      "hints": [
        [
          "B.1",
          "Does the header read 'DRIVER LICENSE' (not 'DRIVER'S LICENSE') or 'IDENTIFICATION CARD' in bold, blue serif font?",
          "'DRIVER LICENSE' is the official AAMVA-compliant header. The possessive 'DRIVER'S' is a common template error on fakes.",
          "YES"
        ],
        [
          "B.2",
          "Is the word 'NEVADA' arched across the top in large, blue capital letters, centered over the state map outline?",
          "The font is a modified serif. Forgeries often use a generic block font or incorrect kerning.",
          "YES"
        ],
        [
          "B.3",
          "Are field labels (e.g., 'LN' for Last Name, 'FN' for First Name, 'DOB') written in English only, left-aligned, and in small blue uppercase text?",
          "Newer Gen cards use two-letter abbreviations. Older cards (pre-2017) may use full words, but all current valid cards use abbreviations.",
          "YES"
        ],
        [
          "B.4",
          "Does the state seal appear twice: once as a large multi-color background element (typically behind photo/DL#) and once as a smaller laser-engraved version?",
          "The dual-seal feature is specific to Gen 2021+. Absence of the laser-engraved seal is a generation mismatch for post-2021 cards.",
          "CONTEXT"
        ],
        [
          "B.5",
          "Is the 'Battle Born' icon/stamp present in a stylized banner near the issue date or on the back?",
          "A distinctive Nevada feature. Forgeries often omit this or render it poorly as a generic clip-art star.",
          "YES"
        ]
      ]
    },
    {
      "id": "C",
      "title": "Document Number (DL/ID #) Format",
      "hints": [
        [
          "C.1",
          "Is the Document Number exactly 10 numeric digits (e.g., 0123456789)?",
          "Nevada DL/ID numbers are exclusively 10 numeric digits. No letters. No hyphens. An alphanumeric format or a different length is invalid.",
          "YES"
        ],
        [
          "C.2",
          "Is the Soundex code (first letter of last name + 3 digits) NOT the prefix of the document number?",
          "Unlike states like California, Nevada does NOT base the document number on the Soundex of the name. A DL number starting with a letter is a critical failure.",
          "YES"
        ],
        [
          "C.3",
          "Does the document number on the front match the number encoded in the back barcode (PDF417, element ID: DAQ)?",
          "A fundamental cross-check. Data mismatches between human-readable and machine-readable zones are a classic indicator of data layer tampering.",
          "YES"
        ],
        [
          "C.4",
          "Is the check digit algorithm applied to the full 10-digit string valid per AAMVA masking specifications (if decodable from barcode)?",
          "While not visually calculable, an LLM analyzing barcode data can verify this. A non-compliant check digit confirms a generated fake number.",
          "CONTEXT"
        ],
        [
          "C.5",
          "Is the 10-digit number unique and not a known sequential 'sample' number (e.g., 1234567890, 1111111111)?",
          "Forgery mills often reuse template strings or simple sequences. Obvious patterns indicate counterfeit manufacturing.",
          "YES"
        ]
      ]
    },
    {
      "id": "D",
      "title": "Personal Data & Name Format",
      "hints": [
        [
          "D.1",
          "Is the Last Name (LN) printed in full capital letters with correct case (uppercase) matching the DL system?",
          "Standardized AAMVA formatting. Mixed case or lowercase indicates an uncalibrated forgery template.",
          "YES"
        ],
        [
          "D.2",
          "Is the First Name (FN) and Middle Name (MN) printed in full capital letters?",
          "All name fields are capitalized in NV DL barcodes and typically on the physical card front.",
          "YES"
        ],
        [
          "D.3",
          "Does the name order follow 'LN' (Last Name), 'FN' (First Name), 'MI' (Middle Initial/Name) on the front?",
          "Field order is strictly LN, FN, DOB, etc. A shuffled layout suggests a non-spec foreign template.",
          "YES"
        ],
        [
          "D.4",
          "If a suffix is present (JR, SR, III), is it appended after the Middle Name or in a dedicated suffix field, not combined with the First Name?",
          "Incorrect concatenation (e.g., 'JOHNSR' in the FN field) is a common data parsing artifact in fake IDs.",
          "YES"
        ],
        [
          "D.5",
          "Are diacritical marks (accented characters) present if applicable, or are they replaced with the nearest ASCII equivalent?",
          "Nevada DMV strictly uses the US ASCII character set for machine readability. Non-ASCII characters suggest a custom-printed fantasy ID.",
          "YES"
        ]
      ]
    },
    {
      "id": "E",
      "title": "Photograph & Physical Identifiers",
      "hints": [
        [
          "E.1",
          "Is the primary portrait a grayscale, laser-engraved image with no pixelation, fused into the polycarbonate body?",
          "Gen 2021+ cards use laser engraving directly into the plastic, not a printed photo beneath a laminate. Zooming in should reveal smooth dot-free grain and a 3D embossed feel.",
          "YES"
        ],
        [
          "E.2",
          "Does a secondary smaller 'ghost' image or transparent laser perforation of the cardholder appear to the right or bottom of the main photo?",
          "Gen 2021+ features a transparent TLI (Tactile Laser Image) or a secondary ghost photo laser-etched in the bottom right quadrant.",
          "CONTEXT"
        ],
        [
          "E.3",
          "Does the shadow box behind the portrait contain a repeating microprinted 'STATE OF NEVADA' pattern visible under magnification?",
          "This microtext feature is a key anti-photocopy measure. Absence suggests a photo-paper or inkjet reproduction.",
          "YES"
        ],
        [
          "E.4",
          "Is the physical sex marker printed as a single character ('M' or 'F') only?",
          "Nevada DMV issues binary sex markers only. An 'X' marker is not currently implemented, and its presence indicates a fantasy/template forgery.",
          "YES"
        ],
        [
          "E.5",
          "Is the height printed in feet and inches with a single quote and double quote format (e.g., 5'-08\"), not metric?",
          "Nevada uses Imperial measurements (feet/inches) for height. A height in centimeters is immediately suspect for a US document.",
          "YES"
        ],
        [
          "E.6",
          "Is the Eye Color noted using a 3-letter abbreviation (e.g., 'BRO' for Brown, 'BLU' for Blue, 'GRN' for Green, 'HAZ' for Hazel)?",
          "Standard AAMVA 3-letter code. Full-word spellings or German abbreviations ('braun') indicate a non-US template.",
          "YES"
        ]
      ]
    },
    {
      "id": "F",
      "title": "Date Fields, Validity & Age Markers",
      "hints": [
        [
          "F.1",
          "Are all dates (DOB, ISS, EXP) formatted exactly as MM/DD/YYYY?",
          "Standard US date format. Slashes must be forward. A European DD.MM.YYYY or Asian YYYY/MM/DD format is a clear forgery indicator.",
          "YES"
        ],
        [
          "F.2",
          "Is the expiration date exactly 8 years from the issue date for a standard adult license, and does it fall on the birthdate (EXP month/day = DOB month/day)?",
          "NV licenses expire on the holder's birthday. Non-matching month/day is a major logical error often missed in fake templates.",
          "YES"
        ],
        [
          "F.3",
          "For a driver under 21 at the time of issuance, is a red vertical bar and a bold red text box reading 'AGE 21 IN <YEAR>' present on the right side of the portrait?",
          "The year in '<YEAR>' must equal DOB Year + 21. A mismatch between the printed year and the DOB is a critical cross-field failure.",
          "YES"
        ],
        [
          "F.4",
          "If the cardholder is 21 or older, is the under-21 red bar and text completely absent?",
          "Remnant under-21 markers on an adult ID (or vice versa) indicate a template 'cut and paste' error from a donor image.",
          "YES"
        ],
        [
          "F.5",
          "Is the Issue Date logically consistent with the birth date (i.e., not issued before the person was eligible for a license)?",
          "Trivial check but often failed. An issue date earlier than the birth date + 16 years is legally impossible.",
          "YES"
        ]
      ]
    },
    {
      "id": "G",
      "title": "Back of Card: Barcodes & Labeling",
      "hints": [
        [
          "G.1",
          "Is there a single 2D PDF417 barcode on the back, bottom-half, with a quiet zone of at least 4 modules?",
          "The PDF417 is the standardized vehicle for AAMVA data. A 1D barcode, or a QR code, is not compliant.",
          "YES"
        ],
        [
          "G.2",
          "Does the back contain a machine-readable 1D barcode (Code 39 or Code 128) in addition to the PDF417?",
          "Gen 2021+ cards DO NOT contain the legacy 1D barcode. Gen 2017 cards often do. Coexistence of both on a 2023+ issue date is a generation anomaly.",
          "CONTEXT"
        ],
        [
          "G.3",
          "Is the scanned string from the 1D barcode exactly the same as the 10-digit Document Number on the front?",
          "Gen 2017 cards used this mini 1D barcode as a print log/reference number. Data mismatch indicates a replacement front laminate.",
          "CONTEXT"
        ],
        [
          "G.4",
          "Does the back text include 'CLASS' restrictions, endorsements, and a legend explaining the codes?",
          "The back layout is text-heavy. Absence of legal legend text ('RESTRICTIONS: A=WITH CORRECTIVE LENSES...') suggests a low-effort forgery.",
          "YES"
        ],
        [
          "G.5",
          "Is the magnetic stripe present on the back but fully compliant with the AAMVA track 2/3 layout (if data can be decoded)?",
          "The stripe is functional. If a swipe provides garbled or non-standard track data, the data encoding is likely fabricated without encoding software.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "H",
      "title": "Holographic & Microtext Features (Front)",
      "hints": [
        [
          "H.1",
          "When tilted, does the laminate hologram (Gen 2017) or embedded DOVID (Gen 2021+) show shifting 'Battle Born' stars and a multi-directional sagebrush motif?",
          "The specific sagebrush and star pattern is a Nevada-specific OVD. Static rainbow 'wallpaper' patterns are generic forgery foils.",
          "CONTEXT"
        ],
        [
          "H.2",
          "Does the microtext line (often bordering the state silhouette) read 'NEVADADEPARTMENTOFMOTORVEHICLES' continuously, with no spelling errors or broken characters?",
          "The unique spelling and concatenation is a forensic signature. Common forgery attempts misspell 'DEPARTMENT' or add spaces.",
          "YES"
        ],
        [
          "H.3",
          "Is the state flower (Sagebrush) visible as a UV or ghost image, blended with the cardholder's portrait or background?",
          "Sagebrush is a recurring motif. Generic floral patterns or US flags are not valid NV security features.",
          "YES"
        ],
        [
          "H.4",
          "Is there a transparent laser perforation image of the state outline with 'NV' inside it, visible when held up to light?",
          "Gen 2023 cards feature an intricate laser-perf state shape. A blurry or misaligned perf suggests a punch-out forgery attempt.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "I",
      "title": "UV (Ultraviolet) Features",
      "hints": [
        [
          "I.1",
          "Under UV light, does a large, blue-fluorescing outline of the state of Nevada appear, overlapping the primary portrait?",
          "The 'ghost state' UV overlay is a classic NV feature. A static, multi-color fluorescent splatter is a cheap imitation.",
          "YES"
        ],
        [
          "I.2",
          "Does the back of the Gen 2021+ card reveal an intricate UV moiré pattern or geometric waves, not just a blank field or a random copy of the front's UV?",
          "The back UV should be distinct and complex. A blank back under UV indicates a forged substrate.",
          "CONTEXT"
        ],
        [
          "I.3",
          "Are fine-line UV rainbow fibers (red, blue, green) embedded randomly in the card stock, visible only under UV light?",
          "These fibers are akin to currency paper. Printed-on UV 'dots' or stripes indicate an inkjet-applied layer, not genuine paper.",
          "YES"
        ],
        [
          "I.4",
          "Does the UV ink transition smoothly (not pixelated) along the edges of the state outline, and is the fluorescence a crisp cobalt/purple blue?",
          "Forgery UV often appears as bright, neon cyan or has jagged 'stair-step' edges indicative of low-resolution digital masks.",
          "YES"
        ]
      ]
    },
    {
      "id": "J",
      "title": "Cross-Field Consistency (Critical Forensics)",
      "hints": [
        [
          "J.1",
          "Does the Document Number on the front match the DAQ element in the PDF417 barcode exactly?",
          "Data-layer piggybacking fraud: Altering the front photo/DOB but forgetting to recode the barcode.",
          "YES"
        ],
        [
          "J.2",
          "Does the First+Middle+Last Name combination in the front text match the 'DCS' (Full Surname) and 'DAC' (First Name) elements in the PDF417?",
          "Name mismatches are the most frequent error in altered genuine cards.",
          "YES"
        ],
        [
          "J.3",
          "Does the 'EXP' (Expiry) date printed on the front match the 'DBA' element in the barcode (format: MM/DD/YYYY)?",
          "Altered front dates often don't correspond to the barcode, which keeps the original (valid) expiry.",
          "YES"
        ],
        [
          "J.4",
          "Does the printed Under-21 indicator (red bar, 'AGE 21 IN YYYY') self-verify: Is YYYY exactly equal to DOB Year + 21?",
          "Catches template cut-and-paste. A DOB of 2000 with an 'AGE 21 IN 2024' is a math error (should be 2021).",
          "YES"
        ],
        [
          "J.5",
          "Does the physical description (Sex, Height, Eye Color) perfectly overlap between the printed card, the barcode (DBC, DAU, DAY), and the visible photo of the cardholder?",
          "A robust AI should cross-verify gender and approximate height in the photo against the encoded data string.",
          "YES"
        ],
        [
          "J.6",
          "Does the license class printed on the front (e.g., 'D') match the class restrictions/endorsements encoded in the barcode and printed on the back legend?",
          "A Class A Commercial License (CDL) with zero endorsements and a standard back template is a red flag.",
          "CONTEXT"
        ],
        [
          "J.7",
          "For Gen 2021+ cards, does the laser-engraved secondary portrait match the primary portrait and the person presenting the document exactly?",
          "Laser-engraved images are factory-hardcoded. A mismatch indicates the primary photo laminate was peeled and replaced on a stolen blank.",
          "YES"
        ]
      ]
    }
  ]
};

export default NEVADA_DL_ID;
