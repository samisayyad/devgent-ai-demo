// app/interview-prep/[sessionId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSessionById } from '@/lib/interview/db';
import { explainConcept } from '@/lib/interview/questionGenerator';
import QuestionCard from '@/components/QuestionCard';
import { ArrowLeft, Calendar, Briefcase } from 'lucide-react';

export default function SessionViewPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadSession();
  }, [params.sessionId]);

  const loadSession = async () => {
    try {
      const result = await getSessionById(params.sessionId);
      
      if (result.success) {
        setSession(result.data);
        setQuestions(result.data.questionsData);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load session');
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
    return await explainConcept(questionText, session.jobRole);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => router.push('/interview-prep')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/interview-prep')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Sessions
        </button>

        {/* Session Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {session.jobRole}
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Experience:</span>
              <span className="ml-2 text-gray-600">{session.experience}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {new Date(session.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {session.techStack.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700 mr-2">Tech Stack:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {session.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Questions ({questions.length})
          </h2>
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onPin={handlePinQuestion}
                onExplain={handleExplainConcept}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
