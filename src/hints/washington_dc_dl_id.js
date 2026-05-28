const WASHINGTON_DC_DL_ID={
  "id": "washington_dc_dl_id",
  "title": "Washington, DC DL / ID",
  "color": "#C8102E",
  "subtitle": "Gen 2014 · Gen 2017 · Gen 2024",
  "sources": [
    "AAMVA DL/ID Card Design Standard (2020)",
    "DC DMV REAL ID Documentation Guide",
    "DC Superior Court Forensic Evidence Reference",
    "REAL ID Act of 2005 regulations (DHS/6 CFR Part 37)",
    "DC Official Code Title 50 § 1401.01 (Driver License/ID Issuance)",
    "AAMVA DL/ID Barcode Specification (PDF417)"
  ],
  "sections": [
    {
      "id": "A",
      "title": "Generation Identification",
      "hints": [
        [
          "A.1",
          "Is there a polycarbonate body with a 'recessed window' on the right side?",
          "Gen 2024 only. Gen 2014 and Gen 2017 do not have a recessed window.",
          "CONTEXT"
        ],
        [
          "A.2",
          "Is the Capitol dome ghost image in the lower right corner printed in grayscale (black/white) rather than full color?",
          "Gen 2014 only. Gen 2017 and Gen 2024 use a full color secondary portrait.",
          "CONTEXT"
        ],
        [
          "A.3",
          "Does the card back have a large 2D barcode (PDF417) that spans nearly the full width?",
          "Gen 2014 and Gen 2017 have a large PDF417 back barcode. Gen 2024 has a smaller, repositioned 2D barcode or multiple barcodes.",
          "CONTEXT"
        ],
        [
          "A.4",
          "Is there a gold star in a gold circle in the upper right corner of the front?",
          "Must be present on Gen 2017 and Gen 2024 REAL ID-compliant cards. Indicates REAL ID compliance per 6 CFR Part 37.",
          "YES"
        ],
        [
          "A.5",
          "Is the word 'WASHINGTON, DC' in a serif font (specifically Times New Roman or similar) centered at the top?",
          "Gen 2014 uses a serif font for the jurisdiction header. Gen 2017 and Gen 2024 use a sans-serif, bold, wider-spaced font.",
          "CONTEXT"
        ],
        [
          "A.6",
          "Does the card backlist 'FEDERAL LIMITS APPLY' in a prominent banner or text block?",
          "Mutually exclusive with the gold star. Non-REAL ID compliant DC cards bear this language. If both gold star and 'FEDERAL LIMITS APPLY' appear, it is a forged card.",
          "CONTEXT"
        ],
        [
          "A.7",
          "Is the UV pattern on the front a repeating 'DC' and scaled star motif in a zigzag layout?",
          "Gen 2014 has a simpler interlocking ring UV pattern. Gen 2017/2024 use the specific scaled star and 'DC' zigzag pattern.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "B",
      "title": "Header, Labels & National Symbols",
      "hints": [
        [
          "B.1",
          "Does the red top header bar say 'GOVERNMENT OF THE DISTRICT OF COLUMBIA' in small white sans-serif text immediately above 'WASHINGTON, DC'?",
          "Gen 2017 and Gen 2024 feature this. Gen 2014 does not have the red header bar government name text.",
          "CONTEXT"
        ],
        [
          "B.2",
          "Does the DC flag (three red stars above two horizontal red bars on a white field) appear in color to the left of the header text?",
          "All generations include a color flag. A missing or monochrome flag, or one where the stars are not five-pointed, indicates a forgery.",
          "YES"
        ],
        [
          "B.3",
          "Is the document title 'DRIVER LICENSE' or 'REAL ID DRIVER LICENSE' (or 'IDENTIFICATION CARD') spelled correctly and centered?",
          "Look for typos: 'LICENSE' misspelled as 'LISENCE' or 'LICENCE' is common on early fakes. REAL ID variants explicitly state 'REAL ID'.",
          "YES"
        ],
        [
          "B.4",
          "Is the 'ORGAN DONOR' indicator a red heart symbol with white text inside, located near the center right?",
          "Red heart with white text is the standard AAMVA organ donor indicator. No other color or icon is used on a genuine DC card.",
          "YES"
        ],
        [
          "B.5",
          "Is the DHS 'REAL ID' gold star perfectly centered within its white circular border, with clean edges?",
          "Screen-printed fakes often show star misalignment, pixelated edges, or a solid gold circle without the transparent star cutout.",
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
          "Are the labels '1. FAMILY NAME' and '2. GIVEN NAME(S)' in all caps, with the numbers and periods exactly as shown?",
          "The numeric prefix and period before the field label is mandatory. Missing numbers (e.g., 'FAMILY NAME' without '1.') is a forgery indicator.",
          "YES"
        ],
        [
          "C.2",
          "Is the family name printed in all caps directly below the '1. FAMILY NAME' label?",
          "All DC licenses print the family name in uppercase. Mixed case in this field indicates a counterfeit card.",
          "YES"
        ],
        [
          "C.3",
          "Is the given name printed in all caps directly below the '2. GIVEN NAME(S)' label?",
          "Middle names or initials, if present, are also in uppercase. Genuine cards never use lowercase letters in these fields.",
          "YES"
        ],
        [
          "C.4",
          "Are there any suffix fields (e.g., JR, SR, III) printed on a separate line below the given name, or appended after a comma?",
          "DC typically appends suffixes separated by a comma after the given name (e.g., 'JOHN, JR'). A dedicated suffix field label is not present on DC cards.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "D",
      "title": "Document/ID Number Format",
      "hints": [
        [
          "D.1",
          "Is the document number exactly 9 characters long?",
          "DC driver license and ID numbers are 9 characters in length. A longer or shorter number is an immediate forgery indicator.",
          "YES"
        ],
        [
          "D.2",
          "Does the document number consist of exactly one letter followed by eight digits (e.g. A12345678)?",
          "This is the standard format for Gen 2014 and Gen 2017. The letter is usually 'A', 'B', or 'S'.",
          "CONTEXT"
        ],
        [
          "D.3",
          "If Gen 2024, does the document number follow the format 'DC' followed by seven digits (e.g., DC1234567)?",
          "Gen 2024 introduced a new numbering scheme starting with the jurisdiction abbreviation 'DC'. The older single-letter format is invalid for this generation.",
          "CONTEXT"
        ],
        [
          "D.4",
          "Does the check digit calculation (ISO/IEC 7812-1 or custom algorithm where applicable) on the document number validate correctly against the printed number?",
          "While algorithm details are restricted, AAMVA barcode data (element ID DAB, element ID DCS) must contain the exact printed number and a verified checksum.",
          "YES"
        ],
        [
          "D.5",
          "Is the document number printed in a monospace or fixed-width font, where each character lines up vertically with the ones above and below?",
          "Forged cards often use a proportionally spaced font, causing the document number characters to not align under each other when compared to a reference.",
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
          "Are all dates on the front formatted as MM/DD/YYYY with slashes?",
          "The US date format MM/DD/YYYY is standard on DC licenses. The European DD.MM.YYYY format is a strong indicator of a counterfeit.",
          "YES"
        ],
        [
          "E.2",
          "Is the license valid for exactly 8 years from the date of issue, unless the holder is 65 or older?",
          "Standard DC DL validity is 8 years. DC ID cards for persons 65+ are valid for 8 years as well, but standard IDs were 8 years. Any deviation without Legal Presence documentation = suspicious. The expiry date should be exactly 8 years from the issue date.",
          "YES"
        ],
        [
          "E.3",
          "If the issue date is less than 8 years before the holder's 21st birthday, is the card orientation vertical (portrait)?",
          "Under-21 cards are vertical. A horizontal under-21 card is a forgery. The 'UNDER 21 UNTIL MM-DD-YYYY' banner must be present.",
          "YES"
        ],
        [
          "E.4",
          "Is the 'UNDER 21 UNTIL' date exactly the 21st birthday of the cardholder?",
          "The date in the 'UNDER 21 UNTIL' block must be DOB + 21 years. A mismatch is a critical cross-field error.",
          "CONTEXT"
        ],
        [
          "E.5",
          "If the issue date is after the cardholder's 21st birthday, is the card horizontal (landscape) and completely lacks the 'UNDER 21' banner?",
          "An over-21 horizontal card must not have any under-21 restrictions or a red 'AGE 21 IN' banner.",
          "YES"
        ],
        [
          "E.6",
          "Is the card's expiration date a real calendar date, and not on a weekend or federal holiday?",
          "DMV issuance systems typically avoid expiry on non-business days, though this is not absolute. Expiry on February 29 in a non-leap year indicates a manually generated fake.",
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
          "Is the height printed in the format 'FT' IN'' (e.g., '5' 08'')?",
          "DC uses feet and inches (US customary). Metric height ('175 cm') is a crucial sign of a foreign-produced counterfeit.",
          "CONTEXT"
        ],
        [
          "F.2",
          "Is the weight printed as a whole number followed by 'LB' (e.g., '165 LB')?",
          "Weight is required on DC licenses (field 10). Kilograms ('KG') indicate a non-genuine card.",
          "YES"
        ],
        [
          "F.3",
          "Is the eye color field value one of the standard US abbreviations? (e.g., 'BRO', 'BLU', 'GRN', 'HAZ', 'BLK')?",
          "Values like 'BRN', 'BROWN', 'GREY', or foreign language equivalents ('MARRONE', 'BLAU') are not used on standard US DMV systems.",
          "YES"
        ],
        [
          "F.4",
          "Is the sex field marker a single character: 'M' or 'F'?",
          "DC currently uses the binary 'M'/'F' designation per Federal REAL ID regulation. 'X' is not yet implemented on DC DMV cards as of the last published standards.",
          "YES"
        ]
      ]
    },
    {
      "id": "G",
      "title": "Address & Restrictions",
      "hints": [
        [
          "G.1",
          "Is the address on the front formatted with the street number and name on the first line, and 'WASHINGTON, DC 200XX' on the second line?",
          "The address is always printed in all caps. The city must be 'WASHINGTON' not 'D.C.' or 'District of Columbia'. The ZIP code must start with '200' or '202' and be 5 digits.",
          "YES"
        ],
        [
          "G.2",
          "Is the 'DD' (Document Discriminator) field present on the front, directly above or near the expiration date?",
          "The DD is an internal inventory control number. Its absence from Gen 2017+ cards is a red flag.",
          "YES"
        ],
        [
          "G.3",
          "If present, does the 'RESTRICTIONS' field use numeric AAMVA standard codes (e.g., 'A', 'B', 'C') and not free-text descriptions?",
          "DC uses standard AAMVA restriction codes. Prose like 'CORRECTIVE LENSES' instead of code 'B' indicates a fake.",
          "CONTEXT"
        ],
        [
          "G.4",
          "Is there a '9. CLASS' field, and does it contain 'D' for standard operator, or 'DM' for motorcycle also?",
          "The class letter must be standard DMV class codes. Made-up class codes are common on forgeries.",
          "YES"
        ]
      ]
    },
    {
      "id": "H",
      "title": "Signature & Markings",
      "hints": [
        [
          "H.1",
          "Does the signature appear directly below the main portrait on the front of a landscape card?",
          "Gen 2014 and 2017 features a scanned signature in black ink. A missing signature or a generic script font indicates a forgery.",
          "YES"
        ],
        [
          "H.2",
          "Is the red 'DISTRICT OF COLUMBIA' microtext line running horizontally across the middle of the card unbroken and sharp under magnification?",
          "This microtext is a primary security feature. If it is a solid red line without lettering, the card is a screen-printed fake.",
          "YES"
        ],
        [
          "H.3",
          "Does the card surface have a tactile feel with raised printing detectable over the primary portrait?",
          "Genuine DC licenses (Gen 2017+) use laser-engraved personalization on polycarbonate, creating raised text and tactile surface patterns. A perfectly smooth plastic laminate surface suggests a PVC fake.",
          "YES"
        ]
      ]
    },
    {
      "id": "I",
      "title": "Back of Document & Barcodes",
      "hints": [
        [
          "I.1",
          "Does the back contain a 1D barcode (Code 128 or similar) in the lower left or middle?",
          "A 1D barcode encoding the DL number is present on all generations. Missing barcode or a static, non-unique barcode printed from a fake template is a forgery.",
          "YES"
        ],
        [
          "I.2",
          "Is the PDF417 2D barcode densely packed with data (appearing as a solid black block) adhering to AAMVA standards?",
          "A sparse or perfectly uniform PDF417 barcode suggests dummy data or a copied barcode. It must conform to AAMVA DL/ID Card Design Standard data strings.",
          "YES"
        ],
        [
          "I.3",
          "When scanning the PDF417 barcode, does the 'DC' header in the raw compliance string correctly parse as 'ANSI '636026080102...'?",
          "The AAMVA Issuer Identification Number (IIN) for DC is '636026'. Any other IIN indicates a mis-mapped out-of-state barcode or a complete forgery.",
          "YES"
        ],
        [
          "I.4",
          "Does the back of Gen 2024 feature a 'tactile canting' or complex embossing pattern alongside the 2D barcode?",
          "Gen 2024 incorporated a tactile feature on the back for authentication. Its absence on a Gen 2024 specimen indicates a counterfeit.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "J",
      "title": "UV / Ultraviolet Features",
      "hints": [
        [
          "J.1",
          "Under UV light, does the front display a repeating pattern of 'DC' and five-pointed stars in a zigzag, linked-chain layout?",
          "Gen 2017 and Gen 2024 use this specific pattern. Gen 2014 uses a fine-line interlocking circular pattern like a chain-link fence.",
          "CONTEXT"
        ],
        [
          "J.2",
          "Does the back of a Gen 2017+ card reveal a large, intricate multi-colored floral or compass-rose UV design overprinting the barcode area?",
          "This complex back UV design is difficult to replicate. A blank back under UV or a simple monochrome UV pattern indicates a fraudulent card.",
          "YES"
        ],
        [
          "J.3",
          "Is there a ghost image of the cardholder's portrait visible only under UV light on the front right side?",
          "This is a clamshell-style UV portrait feature present on Gen 2024 cards. It should match the primary portrait.",
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "K",
      "title": "Cross-Field Consistency",
      "hints": [
        [
          "K.1",
          "Does the sex field 'M' reconcile with the first given name and facial appearance? (e.g., 'BELINDA' + Sex 'M' is an immediate critical flag).",
          "Cross-field gender mismatch is a common mistake in fabricated identities where photos are swapped but text is not fully corrected.",
          "YES"
        ],
        [
          "K.2",
          "Does the 'UNDER 21 UNTIL' date exactly equal the date of birth + 21 years?",
          "The date must be mathematically precise. Off by even a day suggests a manual template editor creating the fake.",
          "YES"
        ],
        [
          "K.3",
          "Does the issue date logically fall after the date of birth, and the expiration date strictly 8 years after the issue date?",
          "A 5-year or 2-year validity on a standard license/permit is incorrect for DC. Validate the exact interval between issue and expiry.",
          "YES"
        ],
        [
          "K.4",
          "Does the printed document number (front) match the parsed document number element (DAQ) within the PDF417 barcode?",
          "If the barcode contains a different number than printed on the card, the physical card is likely a re-printed overlay on a stolen or different barcode-enabled blank.",
          "YES"
        ],
        [
          "K.5",
          "Does the full name, DOB, and sex printed on the front exactly match the parsed data from the PDF417 barcode?",
          "Data mismatches are the most definitive sign of data-layer tampering. Check every AAMVA element (DAC, DAD, DBB, DBC, DBD).",
          "YES"
        ],
        [
          "K.6",
          "If the card is vertical, is the issue date earlier than the cardholder's 21st birthday?",
          "If the issue date is after the 21st birthday, a vertical card is invalid. The DMV reissues a horizontal license upon request and fee payment.",
          "YES"
        ],
        [
          "K.7",
          "Is the city and ZIP code on the front mutually consistent? (e.g., '20001' always corresponds to 'WASHINGTON').",
          "Using a ZIP code lookup table to verify city matches the specific ZIP code on the card is a powerful check for manually assembled fake identities.",
          "YES"
        ],
        [
          "K.8",
          "If a 'REAL ID' gold star is present, is the card otherwise compliant with all Gen 2017/2024 security features?",
          "A fabricated gold star on a Gen 2014 template (serif font, old ghost image) is a known counterfeit pattern.",
          "YES"
        ]
      ]
    }
  ]
};

export default WASHINGTON_DC_DL_ID;
