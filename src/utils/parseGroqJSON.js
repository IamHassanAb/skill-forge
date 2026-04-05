export default function parseGroqJSON(text) {
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(clean); }
  catch { console.error('Failed to parse Groq JSON:', text); return null; }
}
