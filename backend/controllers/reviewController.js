const { reviewCodeWithAI } = require('../services/llmService');
const Review = require('../models/Review');

// Allowed programming languages
const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'typescript', 'kotlin', 'dart', 'swift', 'php', 'ruby', 'sql'];

// Helper function to calculate metrics
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
    
    // Validate code
    if (!code || code.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Code is required' });
    }
    
    if (code.length > 50000) {
      return res.status(400).json({ success: false, error: 'Code too long (max 50,000 chars)' });
    }
    
    // Validate language
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({ success: false, error: `Unsupported language. Allowed: ${ALLOWED_LANGUAGES.join(', ')}` });
    }
    
    // Get AI review
    let reviewResult;
    try {
      reviewResult = await reviewCodeWithAI(code, language);
    } catch (error) {
      console.error('AI Review Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to analyze code with AI' });
    }
    
    // Validate AI response
    if (!reviewResult || !reviewResult.improvedCode || !reviewResult.explanation) {
      return res.status(500).json({ success: false, error: 'Invalid AI response' });
    }
    
    // Calculate metrics
    const metrics = calculateMetrics(code);
    
    // Save to database
    const review = new Review({
      userId: req.user?.githubId ? String(req.user.githubId) : null, // ✅ CHANGED THIS LINE
      originalCode: code,
      improvedCode: reviewResult.improvedCode,
      explanation: reviewResult.explanation,
      category: reviewResult.category,
      language: language,
      metrics: metrics,
      createdAt: new Date()
    });
    
    await review.save();
    
    res.json({
      success: true,
      data: {
        ...reviewResult,
        metrics,
        _id: review._id
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReviewHistory = async (req, res, next) => {
  try {
    const userId = req.user?.githubId;
    
    // ✅ Logged in: Show their reviews + anonymous reviews
    // ✅ Logged out: Show only anonymous reviews (last 20)
    const query = userId 
      ? { $or: [{ userId: String(userId) }, { userId: null }] }
      : { userId: null };
    
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
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
    
    console.log('🔍 Delete attempt:');
    console.log('   Review ID:', id);
    console.log('   User githubId:', userId, '(type:', typeof userId, ')');
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    console.log('   Review userId:', review.userId, '(type:', typeof review.userId, ')');
    console.log('   String comparison:', `"${String(review.userId)}" === "${String(userId)}"`);
    console.log('   Match result:', String(review.userId) === String(userId));
    
    if (review.userId) {
      if (!userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'This review belongs to a logged-in user. Please sign in to delete it.' 
        });
      }
      
      if (String(review.userId) !== String(userId)) {
        console.log('❌ MISMATCH!');
        return res.status(403).json({ 
          success: false, 
          error: 'You can only delete your own reviews' 
        });
      }
    }
    
    await Review.findByIdAndDelete(id);
    console.log('✅ Review deleted successfully');
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
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
    
    // Check ownership (only user can see their own review, or allow public access)
    if (review.userId && review.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

