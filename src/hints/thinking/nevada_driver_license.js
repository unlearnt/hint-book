const NEVADA_DRIVER_LICENSE = {
  "id": "nevada_driver_license",
  "title": "Nevada Driver License",
  "color": "#0033A0",
  "subtitle": "Gen 2014 · Gen 2021 (all currently valid generations)",
  "sources": [
    "Nevada DMV — Driver's License Designs (dmv.nv.gov/dldesign.htm)",
    "Nevada DMV — Comparison of 2021 and 2014 Nevada Driver Licenses (NV-DL-OldvsNew.pdf)",
    "Nevada DMV — REAL ID page (dmv.nv.gov/realid.htm) and License/ID renewal pages",
    "AAMVA DL/ID Card Design Standard (2020 / 2025), Annex D — PDF417 barcode",
    "AAMVA Issuer Identification Numbers (IIN) directory — Nevada IIN 636049",
    "Nevada Revised Statutes ch. 483 (driver license issuance, validity, minor restrictions)"
  ],
  "sections": [
    {
      "id": "A",
      "title": "Generation identification",
      "hints": [
        [
          "A.1",
          "Is the card one of the two currently-valid designs — Gen 2014 'Bighorn Sheep & State Capitol' (issued 11/12/2014-07/2021) or Gen 2021 'Battle Born' (issued 07/2021-present)?",
          "Nevada DMV lists these as the in-circulation designs (older pre-2014 cards are expired). A design that matches neither, or mismatches its issue date, is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "A.2",
          "On a Gen 2021 'Battle Born' card, are the Battle Born insignia, statehood year '1864', the Sierra Nevada Mountains and the Las Vegas skyline present on the front?",
          "These are the defining Gen 2021 front motifs per Nevada DMV. Their absence on a claimed-2021 card is suspicious.",
          "CONTEXT"
        ],
        [
          "A.3",
          "On a Gen 2021 card, does the back show the Carson City skyline and the Black Rock Desert playa?",
          "Defining Gen 2021 reverse artwork. A blank or generic reverse on a 2021-design card is a red flag.",
          "CONTEXT"
        ],
        [
          "A.4",
          "On a Gen 2014 card, are the bighorn sheep and the State Capitol building present in the design?",
          "Defining Gen 2014 motifs. Gen 2014 cards remain valid until expiry and circulate through ~2029.",
          "CONTEXT"
        ],
        [
          "A.5",
          "Does the REAL ID marker style match the generation — gold CIRCLE/star (Gen 2014) vs gold NEVADA OUTLINE with a star cut-out (Gen 2021)?",
          "Nevada changed the REAL ID marker from a gold circle to the Nevada-shaped outline with the 2021 redesign. A Nevada-outline marker on a 2014 design (or vice-versa) is a generation contradiction.",
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
          "Does the card read 'Nevada' with 'DRIVER LICENSE' (note: 'DRIVER LICENSE', not 'DRIVER'S LICENSE')?",
          "Nevada titles the document 'Driver License'. Apostrophe-S wording is a common forger error.",
          "YES"
        ],
        [
          "B.2",
          "Is Nevada state iconography (Battle Born insignia / state outline / '1864' statehood year) integrated into genuine artwork rather than flat-pasted?",
          null,
          "YES"
        ],
        [
          "B.3",
          "Are field labels in English using DMV conventions (DOB, EXP, ISS, DD, CLASS, END, REST, SEX, HGT, EYES)?",
          null,
          "YES"
        ],
        [
          "B.4",
          "Is there NO passport-style national header block ('USA' / 'United States of America' sovereign title) — US DLs are state documents?",
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
          "Are names printed in uppercase Latin characters in the standard DMV order (family name then given/middle)?",
          "Cross-check ordering and spelling against the PDF417 barcode (see M).",
          "YES"
        ],
        [
          "C.2",
          "Is the printed name free of diacritics/non-ASCII unless reflecting the legal name (Nevada transliterates per AAMVA)?",
          null,
          "CONTEXT"
        ],
        [
          "C.3",
          "Does the name stay within the print area with consistent font and no overlap into adjacent fields?",
          "Font substitution or overflow indicates digital tampering.",
          "YES"
        ],
        [
          "C.4",
          "Does the laser-engraved ghost photo's overprinted initials/birth-year match the cardholder's actual initials and DOB year?",
          "Gen 2021 laser-engraves the holder's initials and birth year over the photo. A mismatch indicates altered stock.",
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
          "Is the driver license number a 10-digit ALL-NUMERIC string (since 1998: a 2-digit issuing-office code followed by 8 digits)?",
          "Modern Nevada DL numbers are 10 numeric digits. A leading alpha character (CA-style A1234567) is wrong for current Nevada issuance.",
          "YES"
        ],
        [
          "D.2",
          "Is the DL number free of letters, spaces, hyphens, or other separators?",
          null,
          "YES"
        ],
        [
          "D.3",
          "Does the number avoid being a short 7-digit or alpha-prefixed string typical of other states' schemes?",
          "Off-length or alpha-led numbers are forgery indicators for current Nevada cards.",
          "NO"
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
      "title": "Date fields & validity",
      "hints": [
        [
          "E.1",
          "Are all dates in US format MM/DD/YYYY with a 4-digit year?",
          "Nevada uses MM/DD/YYYY. ISO (YYYY-MM-DD) or European (DD.MM.YYYY) formatting is a forgery indicator.",
          "YES"
        ],
        [
          "E.2",
          "Does the expiration fall on the cardholder's BIRTHDAY (month/day of expiry matches month/day of DOB)?",
          "Nevada expires DLs on the holder's birthday. An expiry ignoring the birthday is structurally wrong.",
          "YES"
        ],
        [
          "E.3",
          "For a driver under 65 at issue, is the validity term ~8 years (issue-to-expiry span ≈ 8 years)?",
          "Nevada issues 8-year licenses to most drivers under 65. A 4-year term on a young adult is suspect.",
          "CONTEXT"
        ],
        [
          "E.4",
          "For a driver 65 or older at issue, is the term shortened to ~4 years?",
          "Nevada shortens terms for seniors 65+. A full 8-year term issued at 70 is inconsistent.",
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
          "If 'Limited Term' appears, is the expiration tied to a (shorter) lawful-presence end date rather than a full 8-year span?",
          "Immigration-based cards carry shorter validity matched to immigration documents.",
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
          "Nevada uses imperial height. A metric cm height is a non-US forgery tell.",
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
          "Is the portrait laser-engraved/fused into the card with neutral studio lighting and no raised/glued photo edge?",
          "A tactile raised photo edge or visible substrate seam = photo substitution.",
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
          "Is the CLASS a valid Nevada value (A, B, C for license classes; M for motorcycle)?",
          "An out-of-set class letter is invalid for Nevada.",
          "YES"
        ],
        [
          "G.2",
          "If motorcycle operation is implied, is a Class M / motorcycle authorization actually present?",
          null,
          "CONTEXT"
        ],
        [
          "G.3",
          "Are restriction (REST) and endorsement (END) codes drawn from Nevada's published code set rather than invented or borrowed from another state?",
          "Cross-check against the Nevada DMV restriction/endorsement list.",
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
      "title": "Orientation & minor / under-21 features",
      "hints": [
        [
          "H.1",
          "Is the card ORIENTATION correct for age — HORIZONTAL for 21+, VERTICAL (portrait) for all under-21 holders?",
          "Nevada issues vertical cards to under-21 holders. A horizontal card for an under-21 DOB is a critical mismatch.",
          "CONTEXT"
        ],
        [
          "H.2",
          "If issued under 18, is a red 'Under 18 Until [date]' banner present with the date equal to DOB + 18 years?",
          "Nevada minor cards under 18 carry this red banner; the date must equal DOB+18. A mismatched year exposes an altered DOB.",
          "CONTEXT"
        ],
        [
          "H.3",
          "If issued at 18-20, is the card vertical but WITHOUT the red under-18 banner (an 'Under 21 Until [date]' notation may appear instead)?",
          "Nevada issues vertical cards without the red banner to 18-20 year-olds.",
          "CONTEXT"
        ],
        [
          "H.4",
          "For an adult (21+) card, are the under-21 / under-18 banners ABSENT?",
          "An 'Under 18/21' banner on a card whose DOB shows 30+ is a red flag.",
          "CONTEXT"
        ],
        [
          "H.5",
          "Is any 'Under 21 Until [date]' notation equal to DOB + 21 years exactly?",
          null,
          "CONTEXT"
        ]
      ]
    },
    {
      "id": "I",
      "title": "REAL ID & card-type status markers",
      "hints": [
        [
          "I.1",
          "On a REAL-ID-compliant Gen 2021 card, is the gold NEVADA-SHAPED OUTLINE with a star cut-out present in the upper-right corner?",
          "Nevada DMV: REAL ID cards show a gold Nevada outline with a star cut-out. Absence on a compliant card, or a generic gold star on a 2021 design, is a forgery indicator.",
          "CONTEXT"
        ],
        [
          "I.2",
          "On a standard (non-compliant) card, is it marked 'NOT FOR REAL ID PURPOSES'?",
          "Required wording on Nevada non-compliant credentials. A non-compliant card lacking this text, or a card carrying both the marking AND a REAL ID star, is contradictory.",
          "CONTEXT"
        ],
        [
          "I.3",
          "On a Driver Authorization Card (DAC), is it marked 'NOT VALID FOR ID' and free of any REAL ID star?",
          "Nevada DACs must carry this marking and can never be REAL ID compliant.",
          "CONTEXT"
        ],
        [
          "I.4",
          "If the card is based on immigration documents, is 'Limited Term' printed below the REAL ID indicator?",
          "Nevada marks lawful-presence/temporary cards 'Limited Term'. This must coexist with a shortened validity term (see E.6).",
          "CONTEXT"
        ],
        [
          "I.5",
          "Is the organ-donor / veteran identifier, if present, rendered in the standard Nevada form (and not a pasted-on graphic)?",
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
          "Is the date of birth RAISED (tactile) where Nevada places a raised-DOB feature on current cards?",
          "Nevada DMV lists a raised date of birth for tactile verification. A perfectly flat DOB on a current card lacks an expected security element.",
          "YES"
        ],
        [
          "J.2",
          "Is a laser-engraved ghost/secondary photo present that matches the primary portrait?",
          "Nevada DMV lists a ghost photo for identity protection. A ghost image differing from the main photo indicates altered stock.",
          "YES"
        ],
        [
          "J.3",
          "Are the laser-engraved/ablated initials and birth-year visible over the photograph, matching the cardholder?",
          "Gen 2021 laser-ablates the holder's initials and birth year over the photo. Absence or mismatch is a red flag.",
          "YES"
        ],
        [
          "J.4",
          "Does tilting reveal optically variable / holographic imagery (state motifs shifting) rather than a flat printed rainbow patch?",
          "Genuine OVD shifts with angle; a static printed 'hologram' is a forgery tell.",
          "YES"
        ],
        [
          "J.5",
          "Is microprinting present and crisp (not blurred to a gray line) where genuine cards place fine-line/microtext?",
          "Counterfeits cannot resolve microtext; it blurs under magnification.",
          "YES"
        ],
        [
          "J.6",
          "Is the card body rigid polycarbonate-style stock with no peelable laminate overlay or delamination at the edges?",
          "A peelable pouch laminate or delaminating edge indicates a counterfeit.",
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
          "Under UV light, do Nevada UV-reactive design elements fluoresce while the rest of the card stays dark (no all-over blue glow)?",
          "An all-over bright blue fluorescence indicates consumer paper/PVC stock rather than genuine substrate.",
          "YES"
        ],
        [
          "K.2",
          "Are UV state symbols (Battle Born / Nevada motifs) sharply defined rather than smudged or hand-applied?",
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
          "Is the UV response consistent with the card's generation (genuine UV imagery matching the claimed 2014 or 2021 design)?",
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
          "Does the PDF417 header decode to ANSI with Nevada Issuer Identification Number 636049?",
          "Nevada IIN is 636049 per the AAMVA directory. A different IIN in a 'Nevada' barcode means cloned/wrong stock.",
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
          "Is the DAQ (license number) in the barcode the same 10-digit numeric value printed on the front?",
          "A barcode DAQ that is non-numeric, off-length, or differs from the front is data-layer tampering.",
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
          "Are reverse-side artwork (Carson City / Black Rock Desert on Gen 2021) and back data fields consistent with the front and free of overprint artifacts?",
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
          "Does the barcode DL number (DAQ) match the printed 10-digit DL number?",
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
          "Does the 'Under 18 Until' / 'Under 21 Until' date equal DOB plus 18 / plus 21 exactly?",
          "An age-marker year that doesn't equal DOB+18/+21 exposes a doctored birth year.",
          "CONTEXT"
        ],
        [
          "M.9",
          "Does the REAL ID marker style agree with the generation (gold circle on Gen 2014, gold Nevada-outline-with-star on Gen 2021)?",
          "A marker style that doesn't match the design era is a sophisticated-fake catch.",
          "CONTEXT"
        ],
        [
          "M.10",
          "Do status markers stay mutually exclusive — a card is NOT simultaneously REAL ID compliant AND marked 'NOT FOR REAL ID PURPOSES' or 'NOT VALID FOR ID'?",
          "These markings are mutually exclusive; coexistence proves fabrication.",
          "CONTEXT"
        ],
        [
          "M.11",
          "Do generation-specific features coexist correctly (e.g. Battle Born artwork + laser-engraved initials + Nevada-outline REAL ID marker all on one Gen 2021 card)?",
          "Genuine cards never mix features across design eras.",
          "CONTEXT"
        ]
      ]
    }
  ]
};

export default NEVADA_DRIVER_LICENSE;
