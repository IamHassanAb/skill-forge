export function buildDiagnosticPrompt(text) {
  return `Analyse this written response and generate a Situated Performance Fingerprint (SPF). Respond ONLY in raw JSON, no markdown, no backticks: { "strengths": ["..."], "growth_areas": ["..."], "patterns": ["..."], "recommended_focus": ["..."] }

Response: "${text}"`;
}

export function buildStudyPlanPrompt(areas, ctx, diagnostics) {
  const diagnosticContext = diagnostics
    ? `\nDiagnostic findings — strengths: ${diagnostics.strengths?.join(', ')}; growth areas: ${diagnostics.growth_areas?.join(', ')}; recommended focus: ${diagnostics.recommended_focus?.join(', ')}. Personalise stage titles and sequencing based on these findings.`
    : '';
  return `Generate a 5-stage communication and public speaking study plan for someone whose focus areas are: ${areas.join(', ')} and context is ${ctx}.${diagnosticContext} Strictly follow the format: Respond ONLY in raw JSON, no markdown, no backticks: { "stages": [{ "id": 1, "title": "...", "description": "..." }] }`;
}
