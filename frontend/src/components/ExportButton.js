import React from 'react';
import { Download } from 'lucide-react';

const ExportButton = ({ review }) => {
  const exportToPDF = () => {
    if (!review) return;

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

    // Cleanup
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToPDF}
      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 transition-all text-xs sm:text-sm font-semibold truncate"
    >
      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="truncate">Export Report</span>
    </button>
  );
};

export default ExportButton;
