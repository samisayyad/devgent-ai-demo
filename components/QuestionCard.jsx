// components/QuestionCard.jsx
'use client';

import { useState } from 'react';

const QuestionCard = ({ question, onPin, onExplain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }

    setLoading(true);
    try {
      const result = await onExplain(question.question);
      setExplanation(result);
      setShowExplanation(true);
    } catch (error) {
      alert('Failed to get explanation');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div 
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
            {question.category}
          </span>
          {question.isPinned && <span className="text-yellow-500 text-lg">📌</span>}
        </div>
        <h3 className="font-semibold text-lg text-gray-900">
          {question.question}
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          {isOpen ? '▼ Click to collapse' : '▶ Click to expand'}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Answer:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {question.answer}
            </p>
          </div>

          {showExplanation && explanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                💡 AI Explanation:
              </h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                {explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin(question.id);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                question.isPinned
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {question.isPinned ? '📌 Unpin' : '📌 Pin'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExplain();
              }}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Loading...' : showExplanation ? '👁️ Hide Explanation' : '💡 Explain'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`Q: ${question.question}\n\nA: ${question.answer}`);
                alert('Copied to clipboard!');
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              📋 Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
