import React, { useState } from 'react';
import { Layers, MessageSquare, Github } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import ExportButton from './ExportButton';
import MetricsDashboard from './MetricsDashboard';
import PRModal from './PRModal';

const FullScreenReviewModal = ({ review, onClose, token }) => {
  const [showPRModal, setShowPRModal] = useState(false);

  if (!review) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900/50 to-transparent">
            <div className="flex items-center gap-4">
              <CategoryBadge category={review.category} />
              <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/30">
                {review.language}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ExportButton review={review} />
              
              {/* Create PR Button */}
              <button
                onClick={() => setShowPRModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all text-sm font-semibold"
              >
                <Github className="w-4 h-4" />
                Create PR
              </button>
              
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center transition-all text-gray-400 hover:text-white"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Metrics */}
            <MetricsDashboard metrics={review.metrics} />

            {/* Code Comparison */}
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
                  {/* Original Code */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-semibold text-gray-400">Original Code</span>
                    </div>
                    <pre className="bg-slate-900 border border-slate-800 text-gray-300 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed" style={{ minHeight: '500px', maxHeight: '600px' }}>
                      <code>{review.originalCode}</code>
                    </pre>
                  </div>
                  
                  {/* Improved Code */}
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

            {/* AI Explanation */}
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

      {/* PR Modal */}
      {showPRModal && (
        <PRModal 
          review={review} 
          onClose={() => setShowPRModal(false)} 
          token={token}
        />
      )}
    </>
  );
};

export default FullScreenReviewModal;