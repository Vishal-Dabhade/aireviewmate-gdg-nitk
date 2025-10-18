// Service to manage anonymous reviews in localStorage
// These reviews are session-based and disappear on browser close/refresh

const STORAGE_KEY = 'anonymous_reviews';

const anonymousReviewService = {
  /**
   * Get all anonymous reviews from localStorage
   */
  getReviews: () => {
    try {
      const reviews = localStorage.getItem(STORAGE_KEY);
      return reviews ? JSON.parse(reviews) : [];
    } catch (error) {
      console.error('Error reading anonymous reviews:', error);
      return [];
    }
  },

  /**
   * Save a review to localStorage
   */
  saveReview: (review) => {
    try {
      const reviews = anonymousReviewService.getReviews();
      const newReview = {
        ...review,
        _id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        createdAt: new Date().toISOString(),
        isAnonymous: true
      };
      reviews.unshift(newReview); // Add to beginning
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
      return newReview;
    } catch (error) {
      console.error('Error saving anonymous review:', error);
      return null;
    }
  },

  /**
   * Delete a review by ID
   */
  deleteReview: (id) => {
    try {
      const reviews = anonymousReviewService.getReviews();
      const filtered = reviews.filter(r => r._id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting anonymous review:', error);
      return false;
    }
  },

  /**
   * Clear all anonymous reviews (called on login)
   */
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing anonymous reviews:', error);
      return false;
    }
  }
};

export default anonymousReviewService;