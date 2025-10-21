// src/interview-prep/QuestionCard.jsx

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
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div 
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {question.category}
          </span>
          {question.isPinned && <span className="text-yellow-500">📌</span>}
        </div>
        <h3 className="font-semibold text-lg">{question.question}</h3>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="mt-4 space-y-3">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {question.answer}
            </p>
          </div>

          {showExplanation && explanation && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-900 whitespace-pre-wrap">
                💡 {explanation}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin(question.id);
              }}
              className={`px-3 py-1 text-sm rounded ${
                question.isPinned
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {question.isPinned ? 'Unpin' : 'Pin'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExplain();
              }}
              disabled={loading}
              className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : showExplanation ? 'Hide' : 'Explain'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
