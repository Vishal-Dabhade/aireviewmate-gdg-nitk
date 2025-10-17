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

    const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide improvements.
Respond ONLY with JSON:
{
 "improvedCode": "...",
 "explanation": "...",
 "category": "Best Practices|Better Performance|Bug Fix"
}
Code:
\`\`\`${language}
${code}
\`\`\``;

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
