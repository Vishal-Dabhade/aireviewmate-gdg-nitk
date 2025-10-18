import React, { useState, useEffect } from 'react';
import { Code, Github, Sparkles, LogOut, CheckCircle, AlertCircle, Loader2, Zap, History, BarChart3, Download, Trash2, MessageSquare, TrendingUp, FileText, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const api = {
  githubLogin: async () => {
    const response = await fetch(`${API_BASE}/github/login`);
    return response.json();
  },
  getUserInfo: async (githubId) => {
    const response = await fetch(`${API_BASE}/github?username=${githubId}`);
    return response.json();
  },
  reviewCode: async (code, language) => {
    const response = await fetch(`${API_BASE}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Review failed');
    return data;
  },
  getReviewHistory: async () => {
    const response = await fetch(`${API_BASE}/review/history`);
    const data = await response.json();
    return data.data || [];
  },
  deleteReview: async (id, token) => {
    const response = await fetch(`${API_BASE}/review/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('github_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('github_token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, '/');
    }
    if (token) fetchUser();
  }, [token]);

  const fetchUser = async () => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userData = await api.getUserInfo(decoded.githubId);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const login = async () => {
    const data = await api.githubLogin();
    window.location.href = data.redirectUri;
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

const Header = ({ activeTab, setActiveTab }) => {
  const { user, login, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Code Reviewer</h1>
            </div>
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('review')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'review'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Review
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                History
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.avatar_url && (
                    <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full border-2 border-purple-200" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.login}</span>
                </div>
                <button onClick={logout} className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={login} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium">
                <Github className="w-4 h-4" />
                Connect GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const CodeEditor = ({ code, setCode, language, setLanguage, onReview, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-600" />
          Your Code
        </h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="typescript">TypeScript</option>
        </select>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-gray-50"
      />
      <button
        onClick={onReview}
        disabled={loading || !code.trim()}
        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Review with AI
          </>
        )}
      </button>
    </div>
  );
};

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const colors = {
    'Bug Fix': 'text-red-600 bg-red-50 border-red-200',
    'Better Performance': 'text-blue-600 bg-blue-50 border-blue-200',
    'Best Practices': 'text-green-600 bg-green-50 border-green-200'
  };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${colors[category] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
      <CheckCircle className="w-4 h-4" />
      <span className="text-sm font-semibold">{category}</span>
    </div>
  );
};

const MetricsDashboard = ({ metrics }) => {
  if (!metrics) return null;

  const getRatingColor = (rating) => {
    if (rating.startsWith('A')) return 'text-green-600 bg-green-50';
    if (rating.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (rating.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        Code Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.linesOfCode}</div>
          <div className="text-xs text-gray-600">Lines of Code</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.complexityScore}/10</div>
          <div className="text-xs text-gray-600">Complexity</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 ${getRatingColor(metrics.qualityRating)}`}>
            {metrics.qualityRating}
          </div>
          <div className="text-xs text-gray-600">Quality Rating</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <AlertCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.issuesFound}</div>
          <div className="text-xs text-gray-600">Issues Found</div>
        </div>
      </div>
    </div>
  );
};

const DiffViewer = ({ original, improved, language }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Code className="w-5 h-5 text-purple-600" />
        Side-by-Side Comparison
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Original Code
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm h-80">
            <code>{original}</code>
          </pre>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Improved Code
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm h-80">
            <code>{improved}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const ExportButton = ({ review }) => {
  const exportToPDF = () => {
    const content = `
AI CODE REVIEW REPORT
=====================

Language: ${review.language}
Category: ${review.category}
Date: ${new Date().toLocaleDateString()}

ORIGINAL CODE:
${review.originalCode}

IMPROVED CODE:
${review.improvedCode}

EXPLANATION:
${review.explanation}

METRICS:
- Lines of Code: ${review.metrics?.linesOfCode || 'N/A'}
- Complexity Score: ${review.metrics?.complexityScore || 'N/A'}/10
- Quality Rating: ${review.metrics?.qualityRating || 'N/A'}
- Issues Found: ${review.metrics?.issuesFound || 'N/A'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${Date.now()}.txt`;
    a.click();
  };

  return (
    <button
      onClick={exportToPDF}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Export Report
    </button>
  );
};

const FullScreenReviewModal = ({ review, onClose }) => {
  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] h-[90vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-4">
            <CategoryBadge category={review.category} />
            <span className="text-sm font-medium text-gray-600">{review.language}</span>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton review={review} />
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <span className="text-2xl text-gray-600">×</span>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metrics Dashboard */}
          <MetricsDashboard metrics={review.metrics} />

          {/* Side-by-Side Comparison - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-600" />
              Code Comparison
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Original Code
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm" style={{ minHeight: '400px', maxHeight: '600px' }}>
                  <code>{review.originalCode}</code>
                </pre>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Improved Code
                </div>
                <pre className="bg-gray-900 text-green-50 p-4 rounded-lg overflow-x-auto text-sm" style={{ minHeight: '400px', maxHeight: '600px' }}>
                  <code>{review.improvedCode}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              AI Explanation
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">{review.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewResults = ({ review }) => {
  if (!review) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Review</h3>
        <p className="text-gray-600 text-sm">Paste your code and get instant AI-powered improvements</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Review Complete!</h3>
      <p className="text-gray-600 mb-6">Your code has been analyzed successfully</p>
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{review.metrics?.linesOfCode || 0}</div>
          <div className="text-xs text-gray-600">Lines</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{review.metrics?.complexityScore || 0}/10</div>
          <div className="text-xs text-gray-600">Complexity</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{review.metrics?.qualityRating || 'A'}</div>
          <div className="text-xs text-gray-600">Quality</div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-6">Click anywhere outside or press ESC to close</p>
    </div>
  );
};

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getReviewHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      await api.deleteReview(id, token);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Review History</h3>
        <p className="text-gray-600 text-sm">Your code reviews will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Review History</h2>
      {history.map((item) => (
        <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CategoryBadge category={item.category} />
              <span className="text-sm text-gray-600">{item.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</span>
              {token && (
                <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-700 ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Original</div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs h-32">
                <code>{item.originalCode.substring(0, 200)}...</code>
              </pre>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Improved</div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs h-32">
                <code>{item.improvedCode.substring(0, 200)}...</code>
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleReviewCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }
    setLoading(true);
    setError('');
    setReview(null);
    try {
      const data = await api.reviewCode(code, language);
      setReview(data.data);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Failed to review code');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'review' ? (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Advanced AI Code Reviewer</h2>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    Get comprehensive code analysis with metrics, side-by-side comparison, and exportable reports powered by Gemini AI.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <CodeEditor code={code} setCode={setCode} language={language} setLanguage={setLanguage} onReview={handleReviewCode} loading={loading} />
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
      
      {/* Full Screen Modal */}
      {showModal && review && (
        <FullScreenReviewModal review={review} onClose={closeModal} />
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        <Dashboard />
      </div>
    </AuthProvider>
  );
}