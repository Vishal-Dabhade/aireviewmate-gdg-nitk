// services/llmService.js
require('dotenv').config();
// Uncomment these when you want to use real Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

let useDummy = false // set to false when you want real Gemini to run

// Uncomment for real Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function reviewCodeWithAI(code, language = 'javascript') {
  if (useDummy) {
    // Dummy response for testing
    return {
      originalCode: code,
      improvedCode: `${code}\n// Fixed by AI ✨`,
      explanation: 'This is a test improvement',
      category: 'Best Practices',
      language
    };
  }

  // Real Gemini API call
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
; // or gemini-1.5-turbo depending on availability

const prompt = `
You are an expert code reviewer.

1) If the provided text clearly looks like source code, detect the correct language and review it.
2) If the text does NOT look like code, do NOT convert it into code and do NOT fix it.
   Instead, reply exactly in JSON form:
   { "error": "No valid code detected" }

Expected JSON response structure when code is valid:
{
  "improvedCode": "...",
  "explanation": "...",
  "category": "Best Practices|Better Performance|Bug Fix"
}

Here is the input:

\`\`\`
${code}
\`\`\`
`;


    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Remove markdown if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const parsed = JSON.parse(responseText);

    // Validate parsed response
    const validCategories = ['Best Practices', 'Better Performance', 'Bug Fix'];
    if (!validCategories.includes(parsed.category)) parsed.category = 'Best Practices';

    return {
      originalCode: code,
      improvedCode: parsed.improvedCode,
      explanation: parsed.explanation,
      category: parsed.category,
      language
    };

  } catch (error) {
    console.error('Gemini AI error:', error.message);
    throw new Error(error.message.includes('JSON') ? 'Failed to parse AI response' : `AI review failed: ${error.message}`);
  }
}

module.exports = {
  reviewCodeWithAI,
  reviewCode: reviewCodeWithAI // for backward compatibility
};
