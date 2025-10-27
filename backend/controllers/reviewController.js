const { reviewCodeWithAI } = require('../services/llmService');
const Review = require('../models/Review');

const ALLOWED_LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 
  'typescript', 'kotlin', 'dart', 'swift', 'php', 'ruby', 'sql'
];

// Simple metrics calculation
// Enhanced metrics calculation for multi-language support

function calculateMetrics(code, detectedLanguage = 'javascript') {
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const linesOfCode = nonEmptyLines.length;

  // Calculate cyclomatic complexity
  const complexityScore = calculateCyclomaticComplexity(code, detectedLanguage);
  
  // Calculate cognitive complexity (how hard to understand)
  const cognitiveComplexity = calculateCognitiveComplexity(code, detectedLanguage);
  
  // Detect code smells and issues
  const issuesFound = detectIssues(code, detectedLanguage, linesOfCode);
  
  // Calculate quality rating
  const qualityRating = calculateQualityRating(
    linesOfCode, 
    complexityScore, 
    cognitiveComplexity, 
    issuesFound
  );
  
  // Calculate maintainability index (0-100)
  const maintainabilityIndex = calculateMaintainability(
    linesOfCode, 
    complexityScore, 
    issuesFound
  );

  return {
    linesOfCode,
    complexityScore,
    cognitiveComplexity,
    qualityRating,
    issuesFound,
    maintainabilityIndex
  };
}

// Cyclomatic Complexity: Measures number of independent paths
function calculateCyclomaticComplexity(code, language) {
  let complexity = 1; // Base complexity

  // Control flow keywords (language-agnostic)
  const patterns = {
    branches: /\b(if|elif|else if|elsif|unless|case|when|catch|rescue|except)\b/gi,
    loops: /\b(for|while|do|foreach|until|loop|each)\b/gi,
    logicalOps: /(\&\&|\|\||and|or|\?)/g,
    ternary: /\?.*:/g,
    nullCoalescing: /(\?\?|\?\.)/g
  };

  // Language-specific patterns
  if (language === 'python') {
    const listComprehensions = (code.match(/\[.*for.*in.*\]/g) || []).length;
    complexity += listComprehensions;
  } else if (language === 'javascript' || language === 'typescript') {
    const arrowFunctions = (code.match(/=>/g) || []).length;
    const promises = (code.match(/\.(then|catch)\(/g) || []).length;
    complexity += Math.floor(arrowFunctions / 3); // Don't penalize too much
    complexity += promises;
  } else if (language === 'java' || language === 'csharp') {
    const switchCases = (code.match(/\bcase\b/gi) || []).length;
    complexity += switchCases;
  }

  // Count all patterns
  Object.values(patterns).forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length;
  });

  // Nesting penalty (deeply nested code is more complex)
  const nestingDepth = calculateNestingDepth(code);
  if (nestingDepth > 4) complexity += (nestingDepth - 4) * 2;

  return Math.min(complexity, 50); // Cap at 50
}

// Cognitive Complexity: Measures how hard code is to understand
function calculateCognitiveComplexity(code, language) {
  let cognitive = 0;
  const lines = code.split('\n');

  // Nested structures increase cognitive load
  let currentNesting = 0;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Track nesting level
    const openBraces = (line.match(/[\{|\(|\[]/g) || []).length;
    const closeBraces = (line.match(/[\}|\)|\]]/g) || []).length;
    currentNesting += openBraces - closeBraces;

    // Cognitive load factors
    if (/\b(if|else if|elif|elsif)\b/.test(trimmed)) {
      cognitive += (1 + currentNesting);
    }
    if (/\b(for|while|foreach)\b/.test(trimmed)) {
      cognitive += (2 + currentNesting); // Loops are harder
    }
    if (/(\&\&|\|\|)/.test(trimmed)) {
      const logicalOps = (trimmed.match(/(\&\&|\|\|)/g) || []).length;
      cognitive += logicalOps;
    }
    if (/\b(switch|try|catch)\b/.test(trimmed)) {
      cognitive += 2;
    }
    if (/\bcontinue\b|\bbreak\b|\breturn\b/.test(trimmed)) {
      cognitive += 1; // Jumping around adds cognitive load
    }
  });

  return Math.min(cognitive, 50);
}

// Calculate nesting depth
function calculateNestingDepth(code) {
  let maxDepth = 0;
  let currentDepth = 0;
  
  // Handle different bracket types
  for (let char of code) {
    if (char === '{' || char === '(' || char === '[') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === '}' || char === ')' || char === ']') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  
  return maxDepth;
}

// Detect language-specific issues
function detectIssues(code, language, linesOfCode) {
  let issues = 0;

  // Universal issues
  const longLineCount = code.split('\n').filter(line => line.length > 120).length;
  if (longLineCount > linesOfCode * 0.3) issues++; // 30% of lines too long

  const functionCount = countFunctions(code, language);
  const avgLinesPerFunction = functionCount > 0 ? linesOfCode / functionCount : linesOfCode;
  if (avgLinesPerFunction > 50) issues++; // Functions too long

  // Language-specific issues
  switch(language) {
    case 'javascript':
    case 'typescript':
      if (code.includes('var ')) issues++;
      if (code.includes('eval(')) issues++;
      if (code.includes('==') && !code.includes('===')) issues++;
      if (!/\bconst\b|\blet\b/.test(code) && code.length > 50) issues++;
      if ((code.match(/function\s*\(/g) || []).length > 5 && !code.includes('async')) {
        issues++; // Many functions but no async/await
      }
      break;

    case 'python':
      if (!/^import |^from /m.test(code) && linesOfCode > 20) issues++;
      if (code.includes('exec(')) issues++;
      if (!code.includes('def ') && linesOfCode > 30) issues++;
      const pythonNaming = /[A-Z][a-z]+[A-Z]/.test(code); // camelCase in Python
      if (pythonNaming) issues++;
      break;

    case 'java':
    case 'csharp':
      if (!/\bpublic\b|\bprivate\b|\bprotected\b/.test(code) && linesOfCode > 20) {
        issues++; // No access modifiers
      }
      if (!/\bclass\b/.test(code) && linesOfCode > 30) issues++;
      if ((code.match(/\bnew\b/g) || []).length > 10) issues++; // Too many object creations
      break;

    case 'cpp':
    case 'c':
      if (code.includes('malloc') && !code.includes('free')) issues++;
      if (!code.includes('#include') && linesOfCode > 10) issues++;
      if (code.includes('goto')) issues += 2;
      break;

    case 'go':
      if (!code.includes('package ') && linesOfCode > 10) issues++;
      if (code.includes('panic(') && !code.includes('recover()')) issues++;
      break;

    case 'rust':
      if (!code.includes('fn ') && linesOfCode > 20) issues++;
      if (code.includes('unsafe') && !code.includes('// SAFETY:')) issues += 2;
      break;

    case 'php':
      if (!code.includes('<?php')) issues++;
      if (code.includes('mysql_') && !code.includes('mysqli_')) issues += 2; // Deprecated
      if (code.includes('eval(')) issues += 2;
      break;

    case 'ruby':
      if (!code.includes('def ') && linesOfCode > 20) issues++;
      if (code.includes('eval(')) issues++;
      break;

    case 'sql':
      if (!/\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(code)) issues++;
      if (/'\s*\+\s*/.test(code)) issues += 2; // SQL injection risk
      break;

    default:
      // Generic checks for unknown languages
      if (linesOfCode > 100 && countFunctions(code, language) === 0) issues++;
  }

  // Check for duplicated code patterns
  const duplicates = detectDuplication(code);
  issues += duplicates;

  return issues;
}

// Count functions in code
function countFunctions(code, language) {
  const patterns = {
    javascript: /\bfunction\b|\b\w+\s*=\s*\(/g,
    typescript: /\bfunction\b|\b\w+\s*=\s*\(|=>/g,
    python: /\bdef\s+\w+\s*\(/g,
    java: /\b(public|private|protected|static)?\s*(void|int|String|boolean|\w+)\s+\w+\s*\(/g,
    csharp: /\b(public|private|protected|internal|static)?\s*(void|int|string|bool|\w+)\s+\w+\s*\(/g,
    cpp: /\b(\w+)\s+\w+\s*\([^)]*\)\s*{/g,
    c: /\b(\w+)\s+\w+\s*\([^)]*\)\s*{/g,
    go: /\bfunc\s+\w+\s*\(/g,
    rust: /\bfn\s+\w+\s*\(/g,
    php: /\bfunction\s+\w+\s*\(/g,
    ruby: /\bdef\s+\w+/g,
    swift: /\bfunc\s+\w+\s*\(/g,
    kotlin: /\bfun\s+\w+\s*\(/g
  };

  const pattern = patterns[language] || /\bfunction\b|\bdef\b|\bfn\b|\bfunc\b/g;
  return (code.match(pattern) || []).length;
}

// Detect code duplication
function detectDuplication(code) {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 10);
  const lineFrequency = {};
  
  lines.forEach(line => {
    lineFrequency[line] = (lineFrequency[line] || 0) + 1;
  });

  let duplicates = 0;
  Object.values(lineFrequency).forEach(count => {
    if (count > 2) duplicates++; // Same line appears 3+ times
  });

  return Math.min(duplicates, 5); // Cap duplication penalty
}

// Calculate quality rating
function calculateQualityRating(linesOfCode, complexity, cognitive, issues) {
  let score = 100;

  // Deduct points
  score -= Math.min(complexity * 2, 40);       // Max -40 for complexity
  score -= Math.min(cognitive * 1.5, 30);      // Max -30 for cognitive
  score -= Math.min(issues * 8, 30);           // Max -30 for issues

  // Penalize very long code
  if (linesOfCode > 500) score -= 10;
  if (linesOfCode > 1000) score -= 20;

  // Convert score to letter grade
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// Calculate maintainability index (Microsoft formula simplified)
function calculateMaintainability(linesOfCode, complexity, issues) {
  const volume = Math.log2(linesOfCode + 1) * 10;
  const complexityFactor = complexity * 0.23;
  const issuesFactor = issues * 5;

  let index = 171 - (volume * 0.165) - complexityFactor - issuesFactor;
  
  // Normalize to 0-100
  index = Math.max(0, Math.min(100, index));
  
  return Math.round(index);
}


// ✅ Review code endpoint
exports.reviewCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user?.githubId;

    console.log('📥 Review request:', { 
      codeLength: code?.length, 
      language, 
      userId: userId || 'anonymous' 
    });

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Code is required' });
    }

    if (code.length > 50000) {
      return res.status(400).json({ success: false, error: 'Code too long (max 50,000 chars)' });
    }

    
    let languageToPass = undefined;
    if (language && language !== "auto" && ALLOWED_LANGUAGES.includes(language)) {
      languageToPass = language;
    }

    console.log('🤖 Calling Gemini with language:', languageToPass || 'auto-detect');

    // Call AI
    let reviewResult;
    try {
      reviewResult = await reviewCodeWithAI(code, languageToPass);
    } catch (error) {
      console.error('❌ AI Review Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to analyze code with AI' });
    }

    if (!reviewResult || !reviewResult.improvedCode || !reviewResult.explanation) {
      console.error('⚠️ Invalid AI response:', reviewResult);
      return res.status(500).json({ success: false, error: 'Invalid AI response' });
    }

    const metrics = calculateMetrics(code);

    // Save review only if user is logged in
    let savedReview = null;
    if (userId) {
      const review = new Review({
        userId: String(userId),
        originalCode: code,
        improvedCode: reviewResult.improvedCode,
        explanation: reviewResult.explanation,
        category: reviewResult.category,
        language: reviewResult.detectedLanguage || 'unknown',
        metrics,
        createdAt: new Date()
      });
      savedReview = await review.save();
    }

    console.log('✅ Review complete:', { 
      detectedLanguage: reviewResult.detectedLanguage,
      framework: reviewResult.framework 
    });

    res.json({
      success: true,
      data: {
        ...reviewResult,
        metrics,
        _id: savedReview?._id || null,
        originalCode: code,
        language: reviewResult.detectedLanguage || 'auto-detected',
        detectedLanguage: reviewResult.detectedLanguage,
        framework: reviewResult.framework,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('💥 Server Error:', error);
    next(error);
  }
};

// ✅ Get review history
exports.getReviewHistory = async (req, res, next) => {
  try {
    const userId = req.user?.githubId;

    if (!userId) return res.json({ success: true, data: [] }); // anonymous

    const reviews = await Review.find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v');

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.githubId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Must be logged in to delete reviews' });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (String(review.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ✅ Get review by ID
exports.getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.githubId;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (review.userId && String(review.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};