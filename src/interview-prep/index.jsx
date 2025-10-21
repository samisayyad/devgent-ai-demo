// src/interview-prep/index.jsx

import { useState } from 'react';
import { generateInterviewQuestions, explainConcept } from './questionGenerator';
import QuestionCard from './QuestionCard';

const InterviewPrep = () => {
  const [formData, setFormData] = useState({
    jobRole: '',
    experience: 'Mid-Level',
    techStack: '',
    questionCount: 5,
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const generated = await generateInterviewQuestions({
        jobRole: formData.jobRole,
        experience: formData.experience,
        techStack: techStackArray,
        questionCount: parseInt(formData.questionCount),
      });

      setQuestions(generated);
    } catch (err) {
      setError('Failed to generate questions. Check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePinQuestion = (questionId) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, isPinned: !q.isPinned } : q
      ).sort((a, b) => b.isPinned - a.isPinned)
    );
  };

  const handleExplainConcept = async (questionText) => {
    return await explainConcept(questionText, formData.jobRole);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🤖 AI Interview Question Generator
      </h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Role *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Full Stack Developer"
              value={formData.jobRole}
              onChange={(e) =>
                setFormData({ ...formData, jobRole: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Experience Level
            </label>
            <select
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option>Entry Level</option>
              <option>Junior</option>
              <option>Mid-Level</option>
              <option>Senior</option>
              <option>Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              placeholder="React, Node.js, MongoDB"
              value={formData.techStack}
              onChange={(e) =>
                setFormData({ ...formData, techStack: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.questionCount}
              onChange={(e) =>
                setFormData({ ...formData, questionCount: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : '✨ Generate Questions'}
          </button>
        </form>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Generated Questions ({questions.length})
          </h2>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onPin={handlePinQuestion}
              onExplain={handleExplainConcept}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
