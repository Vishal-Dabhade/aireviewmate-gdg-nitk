import React, { useState, useEffect } from 'react';
import Header from './Header';
import CodeEditor from './CodeEditor';
import ErrorAlert from './ErrorAlert';
import ReviewResults from './ReviewResults';
import HistoryTab from './HistoryTab';
import FullScreenReviewModal from './FullScreenReviewModal';
import { Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { token, user, login, logout } = useAuth();
   
  const handleReviewCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setLoading(true);
    setError('');
    setReview(null);

    try {
      const data = await api.reviewCode(code, language, token);
      setReview(data.data);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Failed to review code');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Full-width header with auth props */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
        login={login}
        logout={logout}
      />
      
      {/* Main content WITH padding and max-width constraint */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-8 py-8 sm:py-12">
        {activeTab === 'review' ? (
          <>
            {/* Intro Card */}
            <div className="relative mb-6 sm:mb-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3">Advanced AI Code Analyzer</h2>
                    <p className="text-cyan-100 text-sm sm:text-base leading-relaxed">
                      Get comprehensive code analysis with detailed metrics, side-by-side comparison, and exportable reports powered by Gemini AI. Improve your code quality instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Editor + Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-4">
                <CodeEditor 
                  code={code} 
                  setCode={setCode} 
                  language={language} 
                  setLanguage={setLanguage} 
                  onReview={handleReviewCode} 
                  loading={loading} 
                />
                <ErrorAlert message={error} />
              </div>
              <div>
                <ReviewResults review={review} />
              </div>
            </div>
          </>
        ) : (
          <HistoryTab />
        )}
      </main>
      
      {showModal && review && (
        <FullScreenReviewModal 
          review={review} 
          onClose={closeModal}
          token={token}
        />
      )}
    </>
  );
};

export default Dashboard;