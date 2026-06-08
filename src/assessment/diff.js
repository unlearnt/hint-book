const SEV_RANK = { critical: 0, medium: 1, minor: 2 };

export const computeDiff = (pg, rA, rB) => {
  let agreements = 0;
  const disagreements = [];
  let total = 0;

  for (const sec of pg.sections) {
    const rsA = rA.sections?.find(r => r.id === sec.id);
    const rsB = rB.sections?.find(r => r.id === sec.id);
    for (const h of sec.hints) {
      total++;
      const chkA = rsA?.checks?.find(c => c.id === h[0]);
      const chkB = rsB?.checks?.find(c => c.id === h[0]);
      const ansA = chkA?.answer || "MISSING";
      const ansB = chkB?.answer || "MISSING";
      if (ansA === ansB) { agreements++; continue; }

      const exp = h[3];
      const isCritA = (exp === "YES" && ansA === "NO") || (exp === "NO" && ansA === "YES");
      const isCritB = (exp === "YES" && ansB === "NO") || (exp === "NO" && ansB === "YES");
      let severity = "minor";
      if (isCritA !== isCritB) severity = "critical";
      else if (ansA === "WARN" || ansB === "WARN") severity = "medium";

      disagreements.push({
        sectionId: sec.id, sectionTitle: sec.title,
        checkId: h[0], question: h[1], expect: exp,
        answerA: ansA, findingA: chkA?.finding || "",
        answerB: ansB, findingB: chkB?.finding || "",
        severity,
      });
    }
  }

  disagreements.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);

  return {
    total, agreements,
    agreementPct: total > 0 ? agreements / total : 0,
    verdictMatch: rA.verdict === rB.verdict,
    verdictA: rA.verdict, verdictB: rB.verdict,
    countsA: { criticalFails: rA.criticalFails, warnings: rA.warnings, passes: rA.passes, unverifiable: rA.unverifiable },
    countsB: { criticalFails: rB.criticalFails, warnings: rB.warnings, passes: rB.passes, unverifiable: rB.unverifiable },
    disagreements,
  };
};
