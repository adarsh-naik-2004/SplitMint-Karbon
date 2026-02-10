import { GoogleGenAI, Type } from "@google/genai";
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

/**
 * Parse natural language expense using Gemini AI
 */
export const parseExpense = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!ai) {
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

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const prompt = `You are an expense parsing assistant. Extract structured expense information from the user's natural language input.

Task: Parse the following expense description and extract key details.

Input: "${text}"

Examples for reference:
- "Lunch at pizza place $25" → description: "Lunch at pizza place", amount: 25, date: "${today}", category: "food"
- "Taxi to airport yesterday 45 dollars" → description: "Taxi to airport", amount: 45, date: "${yesterday}", category: "transport"
- "Spent 1200 on dinner at Olive Garden" → description: "Dinner at Olive Garden", amount: 1200, date: "${today}", category: "food"

Extract:
- description: Clear description of the expense (string)
- amount: Numeric amount (number, 0 if not specified)
- date: Date in YYYY-MM-DD format (today's date if not specified: ${today})
- category: One of: food, transport, entertainment, utilities, shopping, healthcare, other, uncategorized

Provide a strict JSON output.`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["description", "amount", "date", "category"]
        }
      }
    });

    const draft = JSON.parse(result.text);

    // Validate and sanitize the draft
    const sanitized = {
      description: String(draft.description || text).slice(0, 200),
      amount: Number(draft.amount) || 0,
      date: draft.date || today,
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
    logger.error('Error parsing expense with AI:', error);

    // Return fallback response
    res.json({
      draft: {
        description: text,
        amount: 0,
        category: 'uncategorized',
        date: today
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

  if (!ai) {
    throw new ApiError(503, 'AI service is not configured');
  }

  if (!expenses || expenses.length === 0) {
    return res.json({
      summary: 'No expenses to summarize.'
    });
  }

  const expensesText = expenses
    .map((exp) => `- ${exp.description}: ₹${exp.amount} (${exp.date}) [${exp.category}]`)
    .join('\n');

  const prompt = `Generate a brief, friendly summary (2-3 sentences) of the following expenses for group "${groupName}":

${expensesText}

Focus on:
- Total spending
- Main categories
- Any notable patterns or insights

Keep it conversational and helpful.`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    });

    const summary = result.text;

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