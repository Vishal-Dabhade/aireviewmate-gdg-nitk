const { reviewCodeWithAI } = require('../services/llmService');
const Review = require('../models/Review');

const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'typescript', 'kotlin', 'dart', 'swift', 'php', 'ruby', 'sql'];

function calculateMetrics(code) {
  const lines = code.split('\n').filter(line => line.trim() !== '');
  const linesOfCode = lines.length;
  
  let complexityScore = 0;
  if (code.includes('if')) complexityScore += 2;
  if (code.includes('for') || code.includes('while')) complexityScore += 3;
  if (code.includes('switch')) complexityScore += 2;
  complexityScore = Math.min(complexityScore, 10);
  
  let qualityRating = 'A+';
  if (linesOfCode > 100) qualityRating = 'B+';
  if (complexityScore > 7) qualityRating = 'B';
  if (linesOfCode > 200 && complexityScore > 5) qualityRating = 'C';
  
  let issuesFound = 0;
  if (!code.includes('return')) issuesFound++;
  if (code.includes('var ')) issuesFound++;
  if (!code.includes('//') && !code.includes('/*')) issuesFound++;
  
  return {
    linesOfCode,
    complexityScore,
    qualityRating,
    issuesFound
  };
}

exports.reviewCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const userId = req.user?.githubId;
    
    if (!code || code.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Code is required' });
    }
    
    if (code.length > 50000) {
      return res.status(400).json({ success: false, error: 'Code too long (max 50,000 chars)' });
    }
    
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({ success: false, error: `Unsupported language. Allowed: ${ALLOWED_LANGUAGES.join(', ')}` });
    }
    
    let reviewResult;
    try {
      reviewResult = await reviewCodeWithAI(code, language);
    } catch (error) {
      console.error('AI Review Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to analyze code with AI' });
    }
    
    if (!reviewResult || !reviewResult.improvedCode || !reviewResult.explanation) {
      return res.status(500).json({ success: false, error: 'Invalid AI response' });
    }
    
    const metrics = calculateMetrics(code);
    
    // ✅ CHANGED: Only save to database if user is logged in
    let savedReview = null;
    if (userId) {
      const review = new Review({
        userId: String(userId),
        originalCode: code,
        improvedCode: reviewResult.improvedCode,
        explanation: reviewResult.explanation,
        category: reviewResult.category,
        language: language,
        metrics: metrics,
        createdAt: new Date()
      });
      
      savedReview = await review.save();
    }
    
    // ✅ Return review data (with or without _id)
    res.json({
      success: true,
      data: {
        ...reviewResult,
        metrics,
        _id: savedReview?._id || null, // null for anonymous
        originalCode: code,
        language: language,
        createdAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReviewHistory = async (req, res, next) => {
  try {
    const userId = req.user?.githubId;
    
    if (!userId) {
      // ✅ CHANGED: Anonymous users get empty array (they manage their own in localStorage)
      return res.json({ success: true, data: [] });
    }
    
    // ✅ CHANGED: Logged-in users only see their own reviews
    const reviews = await Review.find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v');
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.githubId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Must be logged in to delete reviews from database' 
      });
    }
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    if (String(review.userId) !== String(userId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only delete your own reviews' 
      });
    }
    
    await Review.findByIdAndDelete(id);
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.githubId;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    if (review.userId && String(review.userId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};