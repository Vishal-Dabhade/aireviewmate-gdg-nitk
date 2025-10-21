// services/llmService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

let useDummy = false;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function reviewCodeWithAI(code, language = 'auto') {
  if (useDummy) {
    return {
      originalCode: code,
      improvedCode: code,
      explanation: 'This is a test improvement',
      category: 'Best Practices',
      language: language || 'auto-detected',
      detectedLanguage: 'javascript',
      framework: 'None'
    };
  }

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `You are an expert code reviewer. Analyze the provided code and return an improved version.

CRITICAL RULE: Return ONLY improved code with ZERO comments, ZERO documentation blocks, ZERO explanations in the code. Just clean working code.

If the input is NOT valid code, respond with: {"error": "No valid code detected"}

RESPONSE FORMAT (ONLY JSON):
{
  "detectedLanguage": "javascript|python|java|cpp|c|csharp|go|rust|typescript|kotlin|dart|swift|php|ruby|sql|html|css|xml|json|other",
  "framework": "React|Vue|Angular|Next.js|Express|Django|Flask|FastAPI|Spring|Laravel|Rails|None|Other",
  "improvedCode": "CLEAN CODE HERE - NO COMMENTS AT ALL - NO DOCUMENTATION - JUST CODE",
  "explanation": "Detailed explanation of improvements (put ALL explanations here, not in code)",
  "improvements": [
    "Specific improvement 1",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "category": "Best Practices|Better Performance|Bug Fix|Security|Code Style",
  "severity": "minor|moderate|major"
}

CODE TO REVIEW:
\`\`\`
${code}
\`\`\`

DETECTION RULES:
1. Detect base language (javascript, python, etc.)
2. Detect framework if present (React, Django, Express, etc.)
3. If no framework detected, set framework to "None"
4. Look for: imports (React, Vue, Django), JSX syntax, decorators, etc.

CODE RULES:
1. improvedCode must be 100% clean - NO COMMENTS
2. improvedCode must be 100% clean - NO DOCUMENTATION
3. improvedCode must be 100% clean - NO EXPLANATIONS
4. ALL explanations go in the "explanation" field
5. Return ONLY valid JSON with no markdown or extra text`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up markdown formatting
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsed = JSON.parse(responseText);
    
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    // Validate category
    const validCategories = ['Best Practices', 'Better Performance', 'Bug Fix', 'Security', 'Code Style'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Best Practices';
    }

    return {
      improvedCode: parsed.improvedCode,
      originalCode: code,
      explanation: parsed.explanation,
      improvements: parsed.improvements || [],
      category: parsed.category,
      severity: parsed.severity || 'minor',
      detectedLanguage: parsed.detectedLanguage,
      framework: parsed.framework || 'None', // ✅ NEW
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