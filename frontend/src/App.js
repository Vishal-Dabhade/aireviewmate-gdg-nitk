import React, { useState, useEffect } from 'react';
import { Code, Github, Sparkles, LogOut, CheckCircle, AlertCircle, Loader2, Zap, History, BarChart3, Download, Trash2, MessageSquare, TrendingUp, FileText, Clock, Terminal, Cpu, Layers } from 'lucide-react';

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
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('github_token') || null;
    }
    return null;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('github_token', urlToken);
      }
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
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('github_token');
    }
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
    <header className="bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-50 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Terminal className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                  CodeReview.ai
                </h1>
                <p className="text-xs text-gray-500 font-medium">Powered by Gemini</p>
              </div>
            </div>
            
            <nav className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('review')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'review'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Code className="w-4 h-4" />
                Review
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <History className="w-4 h-4" />
                History
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                  {user.avatar_url && (
                    <img 
                      src={user.avatar_url} 
                      alt={user.login} 
                      className="w-9 h-9 rounded-lg border-2 border-cyan-400/50 shadow-lg" 
                    />
                  )}
                  <span className="text-sm font-semibold text-gray-300">{user.login}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="text-gray-400 hover:text-white transition-colors p-2.5 rounded-lg hover:bg-slate-900/50"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={login} 
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 transition-all text-sm font-semibold"
              >
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
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <Code className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">Paste or write your code here</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border border-cyan-500/30 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900 text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
<option value="python">Python</option>
<option value="java">Java</option>
<option value="cpp">C Plus Plus (C++)</option>
<option value="c">C</option>
<option value="csharp">C Sharp (C#)</option>
<option value="go">Go (Golang)</option>
<option value="rust">Rust</option>
<option value="typescript">TypeScript</option>
<option value="kotlin">Kotlin</option>
<option value="dart">Dart</option>
<option value="swift">Swift</option>
<option value="php">PHP</option>
<option value="ruby">Ruby</option>
<option value="sql">SQL</option>

          </select>
        </div>
        
        <div className="p-6">
          <div className="relative">
            <div className="absolute top-3 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Start typing or paste your code here..."
              className="w-full h-96 p-6 pt-12 bg-slate-900/50 border border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none text-green-400 placeholder-slate-600"
              style={{ 
                caretColor: '#22d3ee',
                lineHeight: '1.6'
              }}
            />
          </div>
          
          <button
            onClick={onReview}
            disabled={loading || !code.trim()}
            className="w-full mt-6 relative group/btn overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-white font-bold text-base disabled:opacity-50">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze with AI</span>
                  <Cpu className="w-5 h-5" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-400 font-medium">{message}</p>
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const colors = {
    'Bug Fix': 'from-red-500 to-orange-500 shadow-red-500/30',
    'Better Performance': 'from-blue-500 to-cyan-500 shadow-blue-500/30',
    'Best Practices': 'from-green-500 to-emerald-500 shadow-green-500/30'
  };
  const gradient = colors[category] || 'from-cyan-500 to-blue-500 shadow-cyan-500/30';
  
  return (
    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${gradient} text-white shadow-lg font-semibold text-sm`}>
      <CheckCircle className="w-4 h-4" />
      <span>{category}</span>
    </div>
  );
};

const MetricsDashboard = ({ metrics }) => {
  if (!metrics) return null;

  const getRatingColor = (rating) => {
    if (rating.startsWith('A')) return 'from-green-500 to-emerald-500';
    if (rating.startsWith('B')) return 'from-blue-500 to-cyan-500';
    if (rating.startsWith('C')) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
      <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Code Metrics</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center hover:border-cyan-500/30 transition-colors">
            <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
            <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {metrics.linesOfCode}
            </div>
            <div className="text-xs text-gray-500 font-semibold mt-1">Lines of Code</div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center hover:border-blue-500/30 transition-colors">
            <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {metrics.complexityScore}/10
            </div>
            <div className="text-xs text-gray-500 font-semibold mt-1">Complexity</div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center hover:border-green-500/30 transition-colors">
            <div className={`text-4xl font-black mx-auto mb-3 bg-gradient-to-r ${getRatingColor(metrics.qualityRating)} bg-clip-text text-transparent`}>
              {metrics.qualityRating}
            </div>
            <div className="text-xs text-gray-500 font-semibold mt-1">Quality Rating</div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center hover:border-purple-500/30 transition-colors">
            <AlertCircle className="w-6 h-6 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {metrics.issuesFound}
            </div>
            <div className="text-xs text-gray-500 font-semibold mt-1">Issues Found</div>
          </div>
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
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 transition-all text-sm font-semibold"
    >
      <Download className="w-4 h-4" />
      Export Report
    </button>
  );
};

const FullScreenReviewModal = ({ review, onClose }) => {
  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900/50 to-transparent">
          <div className="flex items-center gap-4">
            <CategoryBadge category={review.category} />
            <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/30">
              {review.language}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton review={review} />
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center transition-all text-gray-400 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <MetricsDashboard metrics={review.metrics} />

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Layers className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Code Comparison</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-semibold text-gray-400">Original Code</span>
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 text-gray-300 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed" style={{ minHeight: '500px', maxHeight: '600px' }}>
                    <code>{review.originalCode}</code>
                  </pre>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-gray-400">Improved Code</span>
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 text-green-400 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed" style={{ minHeight: '500px', maxHeight: '600px' }}>
                    <code>{review.improvedCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Explanation</h3>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-400 leading-relaxed text-base">{review.explanation}</p>
              </div>
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
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 rounded-2xl"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
              <Zap className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Review</h3>
            <p className="text-gray-400">Paste your code and get instant AI-powered improvements</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-2xl blur opacity-30 animate-pulse"></div>
      <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-cyan-500/5 rounded-2xl"></div>
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Review Complete!</h3>
          <p className="text-gray-400 mb-8">Your code has been analyzed successfully</p>
          
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {review.metrics?.linesOfCode || 0}
              </div>
              <div className="text-xs text-gray-500 font-semibold">Lines</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {review.metrics?.complexityScore || 0}/10
              </div>
              <div className="text-xs text-gray-500 font-semibold">Complexity</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {review.metrics?.qualityRating || 'A'}
              </div>
              <div className="text-xs text-gray-500 font-semibold">Quality</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-8">Press ESC or click outside to close</p>
        </div>
      </div>
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
              <div className="flex items-center gap-3">
                <CategoryBadge category={item.category} />
                <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                  {item.language}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                {token && (
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    className="text-red-400 hover:text-red-300 ml-2 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {activeTab === 'review' ? (
          <>
            <div className="relative mb-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black mb-3">Advanced AI Code Analyzer</h2>
                    <p className="text-cyan-100 leading-relaxed">
                      Get comprehensive code analysis with detailed metrics, side-by-side comparison, and exportable reports powered by Gemini AI. 
                      Improve your code quality instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
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
        <FullScreenReviewModal review={review} onClose={closeModal} />
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,0.03)_50%)] bg-[size:100%_4px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <Dashboard />
        </div>
      </div>
    </AuthProvider>
  );
}