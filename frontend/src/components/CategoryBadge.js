import React from 'react';
import { CheckCircle } from 'lucide-react';

const CategoryBadge = ({ category }) => {
  // Define color gradients for different categories
  const colors = {
    'Bug Fix': 'from-red-500 to-orange-500 shadow-red-500/30',
    'Better Performance': 'from-blue-500 to-cyan-500 shadow-blue-500/30',
    'Best Practices': 'from-green-500 to-emerald-500 shadow-green-500/30',
  };

  // Fallback gradient if category doesn’t match
  const gradient =
    colors[category] || 'from-cyan-500 to-blue-500 shadow-cyan-500/30';

  return (
    <div
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${gradient} text-white shadow-lg font-semibold text-sm`}
    >
      <CheckCircle className="w-4 h-4" />
      <span>{category}</span>
    </div>
  );
};

export default CategoryBadge;
