import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, History, Clock, Trash2, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CategoryBadge from './CategoryBadge';

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user, login } = useAuth();
  
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getReviewHistory(token);
      setHistory(data.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.deleteReview(id, token);
      setHistory(prev => prev.filter(item => item._id !== id));
      console.log('✅ Review deleted successfully');
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert(`Failed to delete: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 sm:p-12 text-center">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Review History</h3>
          <p className="text-gray-400 text-sm">Your code reviews will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Review History
        </h2>
        
        {/* Login prompt for non-authenticated users */}
        {!token && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div className="text-sm">
                <p className="text-white font-semibold">Want to save your reviews?</p>
                <p className="text-gray-400 text-xs">Sign in to keep your history</p>
              </div>
              <button onClick={login} className="ml-2">
                <LogIn className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition-colors" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review list */}
      {history.map((item) => {
        // Check if current user owns this review
        const isOwner = !!(token && user && item.userId && 
    String(item.userId) === String(user.githubId));
     console.log('🔍 Review Item Debug:', {
    reviewId: item._id,
    itemUserId: item.userId,
    itemUserIdType: typeof item.userId,
    userGithubId: user?.githubId,
    userGithubIdType: typeof user?.githubId,
    hasToken: !!token,
    hasUser: !!user,
    stringComparison: String(item.userId) === String(user?.githubId),
    isOwner: isOwner
  });
        
        return (
          <div key={item._id} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-4 sm:p-6 hover:border-cyan-500/30 transition-all">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <CategoryBadge category={item.category} />
                  <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                    {item.language}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0 flex-wrap">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  
                  {/* Delete button - only show for review owner */}
                  {isOwner && (
                    <button 
                      onClick={() => handleDelete(item._id)} 
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Code Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Code */}
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Original
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 text-gray-400 p-3 sm:p-4 rounded-xl overflow-x-auto text-xs font-mono h-32">
                    <code>{item.originalCode}</code>
                  </pre>
                </div>

                {/* Improved Code */}
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Improved
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 text-green-400 p-3 sm:p-4 rounded-xl overflow-x-auto text-xs font-mono h-32">
                    <code>{item.improvedCode}</code>
                  </pre>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryTab;