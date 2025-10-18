import React from 'react';
import { Zap, CheckCircle } from 'lucide-react';

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
            {/* Lines of Code */}
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {review.metrics?.linesOfCode || 0}
              </div>
              <div className="text-xs text-gray-500 font-semibold">Lines</div>
            </div>
            
            {/* Complexity */}
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {review.metrics?.complexityScore || 0}/10
              </div>
              <div className="text-xs text-gray-500 font-semibold">Complexity</div>
            </div>
            
            {/* Quality */}
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

export default ReviewResults;
