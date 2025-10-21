// src/services/api.js
// ✅ Base URL of your backend API
const API_BASE = process.env.REACT_APP_API_BASE_URL;

/**
 * Common helper to handle all API responses
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Something went wrong';
    throw new Error(errorMessage);
  }
  return data;
};

/**
 * 🌐 Centralized API service
 * Handles all backend calls in one place
 */
const api = {
  /**
   * 🔹 GitHub Login - starts OAuth process
   */
  githubLogin: async () => {
    const response = await fetch(`${API_BASE}/github/login`);
    return handleResponse(response);
  },

  /**
   * 🔹 Get user info by GitHub username or ID
   * @param {string} username - GitHub username
   */
  getUserInfo: async (username) => {
    const response = await fetch(`${API_BASE}/github?username=${username}`);
    return handleResponse(response);
  },

  /**
   * 🔹 Review code by sending it to backend
   * @param {string} code - user's code
   * @param {string} language - code language (e.g., 'cpp', 'python', etc.)
   * @param {string} token - JWT token for authentication
   * @param {AbortSignal} signal - ✅ NEW: Abort signal for request cancellation
   */
  reviewCode: async (code, language, token, signal = null) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ code, language }),
    };

    // ✅ NEW: Add abort signal if provided
    if (signal) {
      options.signal = signal;
    }

    const response = await fetch(`${API_BASE}/review`, options);
    return handleResponse(response);
  },

  /**
   * 🔹 Get all previous code reviews (history)
   * @param {string} token - JWT token for authentication
   */
  getReviewHistory: async (token) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/review/history`, {
      headers
    });
    return handleResponse(response);
  },

  /**
   * 🔹 Delete a specific review using its ID
   * @param {string} id - review ID
   * @param {string} token - JWT token for authentication
   */
  deleteReview: async (id, token) => {
    const response = await fetch(`${API_BASE}/review/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * 🔹 Get user's GitHub repositories
   * @param {string} token - JWT token for authentication
   */
  getRepositories: async (token) => {
    const response = await fetch(`${API_BASE}/pr/repositories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  /**
   * 🔹 Create a Pull Request with AI-improved code
   * @param {object} data - { reviewId, owner, repo, filePath, baseBranch }
   * @param {string} token - JWT token for authentication
   */
  createPullRequest: async (data, token) => {
    const response = await fetch(`${API_BASE}/pr/create-pr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
};

export default api;