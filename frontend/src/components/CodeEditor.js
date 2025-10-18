import React from 'react';
import { Code, Loader2, Sparkles, Cpu } from 'lucide-react';

const CodeEditor = ({ code, setCode, language, setLanguage, onReview, loading }) => {
  return (
    <div className="relative group">
      {/* Gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>

      <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/50 to-transparent gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Code Editor</h2>
              <p className="text-xs sm:text-sm text-gray-500">Paste or write your code here</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Language Dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-cyan-500/30 rounded-lg text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900 text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="kotlin">Kotlin</option>
              <option value="dart">Dart</option>
              <option value="swift">Swift</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="sql">SQL</option>
            </select>

            {/* Clear Button */}
            {code.trim() && (
              <button
                onClick={() => setCode('')}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="p-4 sm:p-6">
          <div className="relative">
            {/* Traffic light indicators */}
            <div className="absolute top-3 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Start typing or paste your code here..."
              className="w-full h-72 sm:h-96 md:h-[28rem] p-4 sm:p-6 pt-12 bg-slate-900/50 border border-slate-800 rounded-xl font-mono text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none text-green-400 placeholder-slate-600"
              style={{
                caretColor: '#22d3ee',
                lineHeight: '1.6',
              }}
            />
          </div>

          {/* Review Button */}
          <button
            onClick={onReview}
            disabled={loading || !code.trim()}
            className="w-full mt-4 sm:mt-6 relative group/btn overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            
            <div className="relative px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 text-white font-bold text-sm sm:text-base disabled:opacity-50">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Analyze with AI</span>
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
