// ── Verdict derivation ───────────────────────────────────────────────────────
export const deriveVerdict = (criticalFails, warnings, passes, unverifiable, total) => {
  if (criticalFails >= 2) return "HIGHLY_SUSPICIOUS";
  if (criticalFails === 1 || warnings >= 3) return "SUSPICIOUS";
  if (passes + warnings < total * 0.4) return "CANNOT_DETERMINE";
  return "APPEARS_LEGITIMATE";
};

// ── Section tallying ─────────────────────────────────────────────────────────
export const tallySections = (pg, sections) => {
  let criticalFails = 0, warnings = 0, passes = 0, unverifiable = 0;
  const flagged = [];

  for (const sec of pg.sections) {
    const rs = sections?.find(r => r.id === sec.id);
    for (const h of sec.hints) {
      const chk = rs?.checks?.find(c => c.id === h[0]);
      if (!chk) { unverifiable++; continue; }

      const exp = h[3], ans = chk.answer;
      if (exp === "CONTEXT") {
        if (ans === "UNVERIFIABLE") unverifiable++;
        else if (ans === "WARN") { warnings++; if (chk.finding) flagged.push(chk.finding); }
        else passes++;
      } else {
        const isCrit = (exp === "YES" && ans === "NO") || (exp === "NO" && ans === "YES");
        if (isCrit) { criticalFails++; if (chk.finding) flagged.push(chk.finding); }
        else if (ans === "WARN") { warnings++; if (chk.finding) flagged.push(chk.finding); }
        else if (ans === "UNVERIFIABLE") unverifiable++;
        else passes++;
      }
    }
  }

  return { criticalFails, warnings, passes, unverifiable, flagged };
};

// ── Raw JSON extraction ──────────────────────────────────────────────────────
export const extractJSON = (raw) => {
  const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No JSON object found in response");
  return raw.slice(s, e + 1).replace(/,(\s*[}\]])/g, "$1");
};

// ── Full parse + tally ───────────────────────────────────────────────────────
export const parseAssessment = (raw, pg) => {
  let parsed;
  try {
    parsed = JSON.parse(extractJSON(raw));
  } catch (e) {
    throw new Error(`JSON parse error: ${e.message}`);
  }

  const { criticalFails, warnings, passes, unverifiable, flagged } = tallySections(pg, parsed.sections);
  const total = pg.sections.reduce((a, s) => a + s.hints.length, 0);
  const verdict = deriveVerdict(criticalFails, warnings, passes, unverifiable, total);
  const summary = parsed.summary || (
    criticalFails === 0 && warnings === 0
      ? `All ${total} checks passed without anomalies.`
      : `${criticalFails} critical fail${criticalFails !== 1 ? "s" : ""}, ${warnings} warning${warnings !== 1 ? "s" : ""}, ${unverifiable} unverifiable across ${total} checks.${flagged.length ? " " + flagged.slice(0, 2).join(" ") : ""}`
  );

  return { verdict, summary, criticalFails, warnings, passes, unverifiable, sections: parsed.sections ?? [] };
};
