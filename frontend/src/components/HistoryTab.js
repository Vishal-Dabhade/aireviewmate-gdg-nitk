import React, { useState, useEffect } from 'react';
import { Loader2, History, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CategoryBadge from './CategoryBadge';

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token,user } = useAuth();
    

  useEffect(() => {
    loadHistory();
  }, [token]);

 const loadHistory = async () => {
    try {
      const data = await api.getReviewHistory(token);
      setHistory(data.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log('🔍 Deleting review ID:', id);
      console.log('🔑 Token exists:', !!token);
      console.log('👤 Current user:', user);
      
      await api.deleteReview(id, token);
      setHistory(history.filter(item => item._id !== id));
      
      alert('✅ Review deleted successfully!');
    } catch (err) {
      console.error('❌ Delete error:', err.message);
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
        <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-12 text-center">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Review History</h3>
          <p className="text-gray-400 text-sm">Your code reviews will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-black text-white mb-6">Review History</h2>
      {history.map((item) => (
        <div key={item._id} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <CategoryBadge category={item.category} />
                <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                  {item.language}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleDelete(item._id)} 
                  className="text-red-400 hover:text-red-300 ml-2 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Original
                </div>
                <pre className="bg-slate-900 border border-slate-800 text-gray-400 p-4 rounded-xl overflow-x-auto text-xs font-mono h-32">
                  <code>{item.originalCode.substring(0, 200)}...</code>
                </pre>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Improved
                </div>
                <pre className="bg-slate-900 border border-slate-800 text-green-400 p-4 rounded-xl overflow-x-auto text-xs font-mono h-32">
                  <code>{item.improvedCode.substring(0, 200)}...</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;