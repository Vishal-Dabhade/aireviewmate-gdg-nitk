import React from 'react';
import { Code, History, Terminal, Github, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; // adjust the path if your context is somewhere else

const useAuth = () => React.useContext(AuthContext);

const Header = ({ activeTab, setActiveTab }) => {
  const { user, login, logout } = useAuth();

  return (
    <header className="bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-50 shadow-2xl">
      {/* Subtle gradient background layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          
          {/* ---------- Left: Logo + Tabs ---------- */}
          <div className="flex items-center gap-8">
            
            {/* Logo */}
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

            {/* Navigation Tabs */}
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

          {/* ---------- Right: User Info / GitHub Login ---------- */}
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
                  <span className="text-sm font-semibold text-gray-300">
                    {user.login}
                  </span>
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

export default Header;
