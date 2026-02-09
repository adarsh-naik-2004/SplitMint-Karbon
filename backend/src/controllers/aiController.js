import OpenAI from 'openai';

export async function parseExpense(req, res) {
  const { text } = req.body;
  if (!process.env.OPENAI_API_KEY) {
    return res.json({ draft: { description: text, amount: 0, category: 'uncategorized' }, note: 'OPENAI_API_KEY not configured' });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: 'Extract structured expense JSON with fields: description, amount, date, category.' },
      { role: 'user', content: text }
    ],
    response_format: { type: 'json_object' }
  });

  const draft = JSON.parse(completion.choices[0].message.content);
  res.json({ draft });
}
