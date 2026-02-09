import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Extract JSON from text response
 */
function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        throw new Error('Unable to parse JSON from response');
      }
    }
    throw new Error('No JSON found in response');
  }
}

/**
 * Parse natural language expense using Gemini AI
 */
export const parseExpense = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not configured, returning fallback response');
    return res.json({
      draft: {
        description: text,
        amount: 0,
        category: 'uncategorized',
        date: new Date().toISOString().split('T')[0]
      },
      note: 'AI parsing is not configured. Please enter expense details manually.'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `You are an expense parsing assistant. Extract structured expense information from the user's natural language input.

Return ONLY valid JSON with these fields:
- description (string): A clear description of the expense
- amount (number): The expense amount (extract from text or 0 if not specified)
- date (string): Date in YYYY-MM-DD format (extract from text or use today's date)
- category (string): One of: food, transport, entertainment, utilities, shopping, healthcare, other, uncategorized

Examples:
Input: "Lunch at pizza place $25"
Output: {"description":"Lunch at pizza place","amount":25,"date":"${new Date().toISOString().split('T')[0]}","category":"food"}

Input: "Taxi to airport yesterday 45 dollars"
Output: {"description":"Taxi to airport","amount":45,"date":"${new Date(Date.now() - 86400000).toISOString().split('T')[0]}","category":"transport"}

Now parse this expense:`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${prompt}\n\nInput: ${text}` }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Gemini API error:', errorText);
      throw new ApiError(502, `AI service error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      logger.error('Empty response from Gemini API');
      throw new ApiError(502, 'AI service returned empty response');
    }

    const draft = extractJson(rawText);

    // Validate and sanitize the draft
    const sanitized = {
      description: String(draft.description || text).slice(0, 200),
      amount: Number(draft.amount) || 0,
      date: draft.date || new Date().toISOString().split('T')[0],
      category: ['food', 'transport', 'entertainment', 'utilities', 'shopping', 'healthcare', 'other', 'uncategorized'].includes(
        draft.category
      )
        ? draft.category
        : 'uncategorized'
    };

    logger.info(`AI parsed expense: "${text}" -> ${JSON.stringify(sanitized)}`);

    res.json({
      draft: sanitized,
      confidence: 'high'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error('Error parsing expense with AI:', error);

    // Return fallback response
    res.json({
      draft: {
        description: text,
        amount: 0,
        category: 'uncategorized',
        date: new Date().toISOString().split('T')[0]
      },
      note: 'AI parsing failed. Please enter details manually.',
      confidence: 'low'
    });
  }
});

/**
 * Generate expense summary for a group
 */
export const generateSummary = asyncHandler(async (req, res) => {
  const { expenses, groupName } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(503, 'AI service is not configured');
  }

  if (!expenses || expenses.length === 0) {
    return res.json({
      summary: 'No expenses to summarize.'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const expensesText = expenses
    .map((exp) => `- ${exp.description}: $${exp.amount} (${exp.date}) [${exp.category}]`)
    .join('\n');

  const prompt = `Generate a brief, friendly summary (2-3 sentences) of the following expenses for group "${groupName}":

${expensesText}

Focus on:
- Total spending
- Main categories
- Any notable patterns or insights

Keep it conversational and helpful.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      })
    });

    if (!response.ok) {
      throw new ApiError(502, 'AI service error');
    }

    const data = await response.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      throw new ApiError(502, 'AI service returned empty response');
    }

    logger.info(`Generated summary for group ${groupName}`);

    res.json({ summary: summary.trim() });
  } catch (error) {
    logger.error('Error generating summary:', error);
    throw new ApiError(502, 'Failed to generate summary');
  }
});