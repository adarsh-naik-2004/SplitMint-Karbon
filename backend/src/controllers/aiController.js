function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Unable to parse JSON from model response');
  }
}

export async function parseExpense(req, res) {
  const { text } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      draft: { description: text, amount: 0, category: 'uncategorized' },
      note: 'GEMINI_API_KEY not configured'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `Extract structured expense JSON with fields: description (string), amount (number), date (YYYY-MM-DD when possible), category (string). Return ONLY valid JSON.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nInput: ${text}` }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    return res.status(502).json({ error: `Gemini API error: ${errText}` });
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return res.status(502).json({ error: 'Gemini returned empty response' });

  const draft = extractJson(raw);
  res.json({ draft });
}
