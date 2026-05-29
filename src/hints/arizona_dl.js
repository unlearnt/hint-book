const ARIZONA_DRIVING_LICENSE={
  "id": "arizona_driving_license",
  "title": "Arizona Driving License",
  "color": "#CE5C17",
  "subtitle": "Gen 2015 · Gen 2020 · Gen 2023",
  "sources": [
    "Arizona Department of Transportation (ADOT) Motor Vehicle Division",
    "AAMVA DL/ID Card Design Standard (2020)",
    "REAL ID Act of 2005 & DHS regulations",
    "ADOT MVD Driver License Handbook",
    "AAMVA DL/ID Card Design Standard Annex F (Barcode)"
  ],
  "sections": [
    {
      "id": "A",
      "title": "Generation Identification",
      "hints": [
        [
          "A.1",
          "Does the card feature a saguaro cactus and mountain range background in a southwestern color palette (orange/purple/teal sunset)?",
          "Gen 2015+ feature. Gen 2023 retains this but with updated layout.",
          "CONTEXT"
        ],
        [
          "A.2",
          "Is the card material polycarbonate (rigid, clacks when dropped) rather than Teslin/PVC composite?",
          "Gen 2020+ transitioned to 100% polycarbonate. Earlier gens used composite materials.",
          "CONTEXT"
        ],
        [
          "A.3",
          "Does the card have a large golden star in a circle in the upper-right corner (REAL ID compliant)?",
          "Post-Oct 2020 all new AZ DLs are REAL ID compliant. Pre-2020 may lack star.",
          "CONTEXT"
        ],
        [
          "A.4",
          "Does the back of the card feature a 2D barcode (PDF417) AND a 1D barcode (Code 39) stacked vertically?",
          "Gen 2023+ feature. Earlier gens had only PDF417.",
          "CONTEXT"
        ],
        [
          "A.5",
          "Is the ghost image positioned to the right of the primary photo, overlapping the background design?",
          "Gen 2020+ layout. Gen 2015 had ghost image in a different position.",
          "CONTEXT"
        ],
        [
          "A.6",
          "Does the card number (top right) follow the format 'D' followed by 8 digits?",
          "Gen 2023+ format. Earlier gens used 1 letter + 8 digits (letter could be A-Y).",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "B",
      "title": "Header, Labels & State Symbols",
      "hints": [
        [
          "B.1",
          "Does the header read 'DRIVER LICENSE' (not 'DRIVER'S LICENSE' or 'DRIVERS LICENSE')?",
          "Arizona uses 'DRIVER LICENSE' without possessive apostrophe. Apostrophe variants are forgery indicators.",
          "YES"
        ],
        [
          "B.2",
          "Is 'ARIZONA' printed in large white serif letters across the top on a dark header bar?",
          "Consistent across all current valid generations.",
          "YES"
        ],
        [
          "B.3",
          "Does the state seal appear in the center of the card as a faint background element (not a prominent overlay)?",
          "The state seal is a subtle background security feature, not a bold printed element.",
          "YES"
        ],
        [
          "B.4",
          "Is the state outline shape visible as a faint background element or guilloche pattern?",
          "Arizona state outline is incorporated into the background design on genuine cards.",
          "YES"
        ],
        [
          "B.5",
          "Does the card display 'USA' in small text near the header or state name?",
          "REAL ID compliant cards include 'USA' designation. Absence on post-2020 card = suspicious.",
          "YES"
        ],
        [
          "B.6",
          "Are all field labels in English only, in small uppercase text (e.g., 'LAST NAME', 'FIRST NAME', 'DOB')?",
          "Arizona DLs use English-only labels. Bilingual labels (e.g., Spanish) = forgery indicator.",
          "YES"
        ]
      ]
    },
    {
      "id": "C",
      "title": "Name Fields",
      "hints": [
        [
          "C.1",
          "Is the last name printed in ALL CAPS on the line labeled 'LN' or 'LAST NAME'?",
          "Standard AAMVA format: family name in uppercase.",
          "YES"
        ],
        [
          "C.2",
          "Is the first name and middle name printed in ALL CAPS on the line labeled 'FN' or 'FIRST NAME'?",
          "Given names appear in uppercase. Mixed case = suspicious.",
          "YES"
        ],
        [
          "C.3",
          "Does the name order follow: Last Name, First Name, Middle Name (as labeled fields, not a single line)?",
          "Arizona uses separate labeled fields for LN/FN/MN, not a single concatenated name line.",
          "YES"
        ],
        [
          "C.4",
          "If a suffix (JR, SR, III) is present, does it appear appended to the last name field (e.g., 'SMITH JR')?",
          "Suffix appears in the LN field, not as a separate field. Separate suffix field = non-standard.",
          "YES"
        ],
        [
          "C.5",
          "Are diacritical marks (accent marks, ñ, umlauts) absent from the printed name?",
          "AAMVA standard restricts names to A-Z, space, hyphen, apostrophe only. Diacritics = encoding error or forgery.",
          "YES"
        ]
      ]
    },
    {
      "id": "D",
      "title": "Document Number Format",
      "hints": [
        [
          "D.1",
          "Does the document number (field 4d on front, top right) begin with a single uppercase letter?",
          "All valid AZ DL numbers start with one letter. All-numeric numbers = forgery.",
          "YES"
        ],
        [
          "D.2",
          "For Gen 2023+: is the format exactly 'D' followed by 8 digits (e.g., D12345678)?",
          "Gen 2023+ uses D+8 digits. Letter other than D or wrong digit count = suspicious.",
          "CONTEXT"
        ],
        [
          "D.3",
          "For Gen 2015-2020: is the format 1 letter (A-Y, excluding some letters) + 8 digits?",
          "Older format: letter from restricted set + 8 digits. Letter Z or digit count ≠ 8 = red flag.",
          "CONTEXT"
        ],
        [
          "D.4",
          "Does the document number on the front match the document number encoded in the PDF417 barcode (field DAQ or equivalent)?",
          "Cross-check: front-printed number must match barcode data exactly. Mismatch = tampering.",
          "YES"
        ],
        [
          "D.5",
          "Is the document number printed in a consistent font weight and size, without signs of alteration (misalignment, different font, smudging)?",
          "Physical alteration of document number is common fraud tactic. Check for font consistency.",
          "YES"
        ]
      ]
    },
    {
      "id": "E",
      "title": "Date Fields & Validity",
      "hints": [
        [
          "E.1",
          "Is the date of birth (DOB) in MM/DD/YYYY format?",
          "US standard date format. DD/MM/YYYY or YYYY-MM-DD = foreign format, suspicious on US DL.",
          "YES"
        ],
        [
          "E.2",
          "Is the issue date (ISS or 4a) in MM/DD/YYYY format?",
          "All dates on AZ DL use MM/DD/YYYY format consistently.",
          "YES"
        ],
        [
          "E.3",
          "Is the expiration date (EXP or 4b) in MM/DD/YYYY format?",
          "Consistent US date format across all date fields.",
          "YES"
        ],
        [
          "E.4",
          "Is the validity period approximately 8 years from date of issue (for standard adult license, age 16-64)?",
          "AZ standard DL validity is 8 years. Significant deviation (e.g., 23 months, 5 years) = suspicious unless age-related.",
          "CONTEXT"
        ],
        [
          "E.5",
          "If the cardholder is age 65 or older at time of issue, is the validity period 5 years (expiration on 65th birthday or 5 years, whichever is longer)?",
          "AZ law: age 65+ licenses valid for 5 years. 8-year validity for 65+ = structural contradiction.",
          "YES"
        ],
        [
          "E.6",
          "Does the expiration date always fall on the cardholder's birthday (month and day match DOB)?",
          "AZ DLs expire on the cardholder's birthday. Expiration date not matching DOB month/day = forgery.",
          "YES"
        ],
        [
          "E.7",
          "Is the year in all date fields expressed as 4 digits (e.g., 2026 not 26)?",
          "AAMVA standard requires 4-digit years. 2-digit years = non-compliant or forged.",
          "YES"
        ]
      ]
    },
    {
      "id": "F",
      "title": "Physical Descriptors",
      "hints": [
        [
          "F.1",
          "Is height expressed in feet and inches (e.g., '5-10' or '5' 10'') not in centimeters?",
          "US DLs use imperial units. Height in cm (e.g., '178 cm') = foreign format, red flag.",
          "YES"
        ],
        [
          "F.2",
          "Does the height format follow FEET-INCHES with a hyphen (e.g., '5-10') or FEET' INCHES'' (e.g., '5' 10'')?",
          "Standard US height notation. Metric-only height = suspicious.",
          "YES"
        ],
        [
          "F.3",
          "Is weight expressed in pounds (lbs), not kilograms?",
          "US standard. Weight in kg = foreign format indicator.",
          "YES"
        ],
        [
          "F.4",
          "Is eye color one of the standard AAMVA codes: BLK, BLU, BRO, GRY, GRN, HAZ, MAR, PNK, DIC (dichromatic)?",
          "AAMVA standard eye color abbreviations. Non-standard terms (e.g., 'BLUE' spelled out, 'AUBURN') = suspicious.",
          "YES"
        ],
        [
          "F.5",
          "Is sex designated as 'M' or 'F' only (not 'X' or other characters)?",
          "Arizona currently uses binary M/F only. 'X' marker = not currently valid for AZ DL.",
          "YES"
        ]
      ]
    },
    {
      "id": "G",
      "title": "Address Field",
      "hints": [
        [
          "G.1",
          "Does the address field (labeled 'ADDRESS' or '8') show a complete Arizona street address with city, state, and ZIP code?",
          "Genuine AZ DLs show full in-state address. Out-of-state address on AZ DL = red flag.",
          "YES"
        ],
        [
          "G.2",
          "Is the state in the address listed as 'AZ' (not 'Arizona' spelled out, not 'AZ.' with period)?",
          "Standard USPS two-letter abbreviation without period.",
          "YES"
        ],
        [
          "G.3",
          "Is the ZIP code exactly 5 digits (or 5+4 format: 12345-6789)?",
          "US ZIP code format. Non-standard ZIP (e.g., 6 digits, letters) = forgery indicator.",
          "YES"
        ],
        [
          "G.4",
          "Is the city name a recognized Arizona municipality (Phoenix, Tucson, Mesa, Chandler, etc.)?",
          "Fictitious or out-of-state city names on AZ DL = red flag. Cross-check against known AZ cities.",
          "YES"
        ]
      ]
    },
    {
      "id": "H",
      "title": "Under-21 & Minor Indicators",
      "hints": [
        [
          "H.1",
          "If the cardholder is under 21, does the card display 'UNDER 21 UNTIL [DATE]' in red text on the photo or adjacent area?",
          "AZ uses red 'UNDER 21 UNTIL' marker. The date must equal DOB + 21 years exactly.",
          "YES"
        ],
        [
          "H.2",
          "If the cardholder is under 18, does the card display 'UNDER 18 UNTIL [DATE]' in red text?",
          "Minor indicator for under-18. Date must equal DOB + 18 years exactly.",
          "YES"
        ],
        [
          "H.3",
          "Is the orientation of an under-21 card vertical (portrait) rather than horizontal (landscape)?",
          "AZ issues vertical licenses for under-21 cardholders. Horizontal orientation for under-21 = forgery.",
          "YES"
        ],
        [
          "H.4",
          "Does the 'UNDER 21 UNTIL' date exactly match DOB + 21 years (month, day, and year)?",
          "Critical cross-check: marker date must be precisely DOB + 21. Off by even one day = tampering.",
          "YES"
        ]
      ]
    },
    {
      "id": "I",
      "title": "Security Features - Visual",
      "hints": [
        [
          "I.1",
          "Does the card feature a laser-engraved primary photo (grayscale, high resolution, embedded in polycarbonate)?",
          "Gen 2020+ uses laser engraving on polycarbonate. Inkjet-printed photo on surface = forgery.",
          "YES"
        ],
        [
          "I.2",
          "Is there a ghost image (secondary, smaller, semi-transparent photo) to the right of the primary photo?",
          "Standard AAMVA security feature. Ghost image must match primary photo subject.",
          "YES"
        ],
        [
          "I.3",
          "Does the ghost image have a distinct pattern or text (e.g., 'AZ' or state outline) visible within it under magnification?",
          "Ghost image often contains embedded microtext or pattern. Blank ghost image = suspicious.",
          "YES"
        ],
        [
          "I.4",
          "When tilted, does the card show an optically variable ink (OVI) element that shifts color (e.g., copper to green)?",
          "OVI is used on AZ DLs, often on the state outline or a specific design element.",
          "YES"
        ],
        [
          "I.5",
          "Is microtext visible under magnification along a line or border, reading 'ARIZONA' or 'GRAND CANYON STATE'?",
          "Microtext is a standard security feature. Absence or blurry/unreadable microtext = red flag.",
          "YES"
        ],
        [
          "I.6",
          "Does the card have a raised tactile feature (e.g., the state outline or a symbol) that can be felt by touch?",
          "Tactile feature is part of polycarbonate construction. Flat surface without texture = suspicious.",
          "YES"
        ],
        [
          "I.7",
          "Is there a clear window or transparent element incorporated into the card body (Gen 2023+)?",
          "Gen 2023 introduced a clear window as an advanced security feature.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "J",
      "title": "Security Features - UV",
      "hints": [
        [
          "J.1",
          "Under UV light, does the card reveal fluorescent fibers embedded in the substrate (random red, blue, green fibers)?",
          "UV fibers are standard in polycarbonate card body. Absence = wrong substrate.",
          "YES"
        ],
        [
          "J.2",
          "Under UV light, does the state seal or state outline fluoresce in a specific color (typically blue or green)?",
          "UV-reactive state symbols are a key security feature. Non-reactive or wrong color = forgery.",
          "YES"
        ],
        [
          "J.3",
          "Under UV light, is the ghost image or a secondary portrait visible in fluorescence?",
          "UV ghost image is a common feature. Absence on Gen 2020+ = suspicious.",
          "YES"
        ],
        [
          "J.4",
          "Under UV light, does the card show a repeating 'ARIZONA' or 'AZ' pattern in fluorescent ink across the surface?",
          "UV overprint pattern is standard. Blank under UV = red flag.",
          "YES"
        ]
      ]
    },
    {
      "id": "K",
      "title": "Back of Document",
      "hints": [
        [
          "K.1",
          "Does the back contain a 2D barcode (PDF417) that is clearly printed and not smudged or pixelated?",
          "PDF417 barcode is mandatory. Poor quality barcode = possible reprint or forgery.",
          "YES"
        ],
        [
          "K.2",
          "Does the back contain a 1D barcode (Code 39) in addition to the PDF417 (Gen 2023+)?",
          "Dual barcode format on Gen 2023+. Single barcode on older gens.",
          "CONTEXT"
        ],
        [
          "K.3",
          "Is the magnetic stripe (if present on older gens) at the top of the back, with consistent color and no signs of peeling?",
          "Magstripe on older composite cards. Peeling or misaligned stripe = tampering.",
          "CONTEXT"
        ],
        [
          "K.4",
          "Does the back include a scannable area or text block with the cardholder's information repeated (name, DOB, DL number)?",
          "Back typically includes encoded data block for law enforcement scanning.",
          "YES"
        ],
        [
          "K.5",
          "Is there an inventory control number (small text, often beginning with 'AZ') printed on the back?",
          "Inventory control number is present on genuine cards for tracking card stock.",
          "YES"
        ],
        [
          "K.6",
          "Does the back design include a continuation of the southwestern landscape theme (saguaro silhouettes, mountain outlines)?",
          "Back design is consistent with front theming. Generic or blank back = suspicious.",
          "YES"
        ]
      ]
    },
    {
      "id": "L",
      "title": "Barcode Data Cross-Checks",
      "hints": [
        [
          "L.1",
          "Does the PDF417 barcode decode successfully (not scrambled, encrypted beyond AAMVA spec, or unreadable)?",
          "Genuine barcode decodes to AAMVA-compliant data. Corrupted or non-standard encoding = red flag.",
          "YES"
        ],
        [
          "L.2",
          "Does the decoded barcode contain the standard AAMVA header 'ANSI ' followed by version and data elements?",
          "AAMVA standard header. Non-standard header = forged or foreign barcode.",
          "YES"
        ],
        [
          "L.3",
          "Does the last name in the barcode (field DCS or DAB) match the printed last name exactly?",
          "Barcode-to-print cross-check. Mismatch = data tampering or card swapping.",
          "YES"
        ],
        [
          "L.4",
          "Does the first name in the barcode (field DAC or DAD) match the printed first name exactly?",
          "Given name cross-check. Any discrepancy = red flag.",
          "YES"
        ],
        [
          "L.5",
          "Does the date of birth in the barcode (field DBB) match the printed DOB exactly (including century)?",
          "DOB cross-check. 8-digit date in barcode (CCYYMMDD) must match printed MM/DD/YYYY.",
          "YES"
        ],
        [
          "L.6",
          "Does the document number in the barcode (field DAQ) match the printed DL number exactly?",
          "DL number cross-check. Mismatch = altered or counterfeit card.",
          "YES"
        ],
        [
          "L.7",
          "Does the sex field in the barcode (field DBC) match the printed sex (M or F)?",
          "Sex cross-check. Mismatch = data inconsistency.",
          "YES"
        ],
        [
          "L.8",
          "Does the height in the barcode (field DAU) match the printed height (converted to inches or feet-inches)?",
          "Height cross-check. Barcode stores height in inches; must match printed imperial height.",
          "YES"
        ],
        [
          "L.9",
          "Does the eye color code in the barcode (field DAY) match the printed eye color abbreviation?",
          "Eye color cross-check. Must use same AAMVA code.",
          "YES"
        ],
        [
          "L.10",
          "Does the expiration date in the barcode (field DBA) match the printed expiration date exactly?",
          "Expiry cross-check. Mismatch = tampering or re-encoded barcode.",
          "YES"
        ]
      ]
    },
    {
      "id": "M",
      "title": "Cross-Field Consistency",
      "hints": [
        [
          "M.1",
          "Does the expiration year minus the issue year equal the standard validity period for the cardholder's age (8 years for 16-64, 5 years for 65+)?",
          "Validity period must match age-based rule. Wrong period = structural forgery.",
          "YES"
        ],
        [
          "M.2",
          "Does the 'UNDER 21 UNTIL' date (if present) equal DOB + exactly 21 years?",
          "Under-21 marker cross-check. Off by any amount = tampering.",
          "YES"
        ],
        [
          "M.3",
          "Does the 'UNDER 18 UNTIL' date (if present) equal DOB + exactly 18 years?",
          "Minor marker cross-check.",
          "YES"
        ],
        [
          "M.4",
          "If the card is vertical (portrait) orientation, is the cardholder under 21 at time of issue?",
          "Vertical format = under-21. Horizontal card for under-21 = forgery.",
          "YES"
        ],
        [
          "M.5",
          "If the card has a REAL ID gold star, is the card issued after October 1, 2020 (or is it a renewal/reissue of a pre-2020 REAL ID)?",
          "REAL ID star on pre-2020 issue date without 'FEDERAL LIMITS APPLY' = anachronism.",
          "YES"
        ],
        [
          "M.6",
          "Does the primary photo subject match the ghost image subject (same person, same pose, same lighting)?",
          "Photo-to-ghost image match. Different person or different photo session = photo substitution.",
          "YES"
        ],
        [
          "M.7",
          "Is the cardholder's apparent age in the photo consistent with the date of birth (e.g., not a 20-year-old photo on a card issued last month)?",
          "Age/photo consistency check. Significant discrepancy = photo from stolen identity.",
          "YES"
        ],
        [
          "M.8",
          "If the card has 'FEDERAL LIMITS APPLY' text, does it lack the REAL ID gold star?",
          "Non-REAL ID cards say 'FEDERAL LIMITS APPLY' and have no star. Having both = contradictory.",
          "YES"
        ],
        [
          "M.9",
          "Does the name on the front match the name encoded in the barcode (first, middle, last, suffix)?",
          "Comprehensive name cross-check between visual and digital layers.",
          "YES"
        ],
        [
          "M.10",
          "Are all generation-specific features internally consistent (e.g., Gen 2023 clear window + D+8 digit DL number + dual barcodes)?",
          "Mixed-generation features (e.g., Gen 2023 window with Gen 2015 DL number format) = Frankenstein forgery.",
          "YES"
        ]
      ]
    }
  ]
};

export default ARIZONA_DRIVING_LICENSE;
