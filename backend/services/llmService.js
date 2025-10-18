// services/llmService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

let useDummy = false; // set to false when you want real Gemini to run

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function reviewCodeWithAI(code, language = 'auto') {
  if (useDummy) {
    return {
      originalCode: code,
      improvedCode: `${code}\n// Fixed by AI ✨`,
      explanation: 'This is a test improvement',
      category: 'Best Practices',
      language: language || 'auto-detected'
    };
  }

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `You are an expert code reviewer and software engineer specializing in code quality, performance optimization, and best practices across multiple programming languages.

TASK: Analyze the provided code snippet and provide comprehensive feedback.

IMPORTANT RULES:
1. First, verify if the input is valid source code. If it is NOT code (e.g., plain text, documentation, or random text), respond with: {"error": "No valid code detected"}
2. If it IS code, automatically detect the programming language${language !== 'auto' ? ` (user indicated: ${language})` : ''}
3. Provide a corrected/improved version of the code
4. Focus on: code quality, readability, performance, security, and best practices
5. Always respond with valid JSON only (no markdown formatting)

RESPONSE FORMAT (when code is valid):
{
  "detectedLanguage": "javascript|python|java|cpp|c|csharp|go|rust|typescript|kotlin|dart|swift|php|ruby|sql|other",
  "improvedCode": "improved code here with comments explaining changes",
  "explanation": "detailed explanation of improvements (2-3 sentences)",
  "improvements": [
    "improvement 1",
    "improvement 2",
    "improvement 3"
  ],
  "category": "Best Practices|Better Performance|Bug Fix|Security|Code Style",
  "severity": "minor|moderate|major"
}

CODE TO REVIEW:
\`\`\`
${code}
\`\`\`

Remember: Respond ONLY with valid JSON. No extra text, no markdown code blocks.`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Remove markdown if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const parsed = JSON.parse(responseText);

    // Handle error case
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    // Validate and set defaults
    const validCategories = ['Best Practices', 'Better Performance', 'Bug Fix', 'Security', 'Code Style'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Best Practices';
    }

    return {
      originalCode: code,
      improvedCode: parsed.improvedCode,
      explanation: parsed.explanation,
      improvements: parsed.improvements || [],
      category: parsed.category,
      severity: parsed.severity || 'minor',
      detectedLanguage: parsed.detectedLanguage,
      language: parsed.detectedLanguage
    };
  } catch (error) {
    console.error('Gemini AI error:', error.message);
    throw new Error(
      error.message.includes('JSON')
        ? 'Failed to parse AI response'
        : `AI review failed: ${error.message}`
    );
  }
}

module.exports = {
  reviewCodeWithAI,
  reviewCode: reviewCodeWithAI
};