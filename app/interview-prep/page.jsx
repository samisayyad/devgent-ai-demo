// app/interview-prep/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { generateInterviewQuestions } from '@/lib/interview/questionGenerator';
import { saveInterviewSession, getUserSessions, deleteSession } from '@/lib/interview/db';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Eye, Calendar, Briefcase } from 'lucide-react';

export default function InterviewPrepPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    jobRole: '',
    experience: 'Mid-Level',
    techStack: '',
    questionCount: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedSessions, setSavedSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const experienceLevels = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

  // Load user's previous sessions
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const result = await getUserSessions(user.primaryEmailAddress.emailAddress);
      if (result.success) {
        setSavedSessions(result.data);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Please sign in to generate questions');
      setLoading(false);
      return;
    }

    try {
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      // Generate questions
      const generated = await generateInterviewQuestions({
        jobRole: formData.jobRole,
        experience: formData.experience,
        techStack: techStackArray,
        questionCount: parseInt(formData.questionCount),
      });

      // Save to database
      const sessionId = uuidv4();
      const saveResult = await saveInterviewSession({
        sessionId,
        userId: user.id,
        userEmail: user.primaryEmailAddress.emailAddress,
        jobRole: formData.jobRole,
        experience: formData.experience,
        techStack: techStackArray,
        questionCount: formData.questionCount,
        questionsData: generated,
      });

      if (saveResult.success) {
        // Redirect to session view
        router.push(`/interview-prep/${sessionId}`);
      } else {
        setError('Generated questions but failed to save session');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate questions');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const result = await deleteSession(sessionId, user.primaryEmailAddress.emailAddress);
      if (result.success) {
        // Reload sessions
        loadSessions();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleViewSession = (sessionId) => {
    router.push(`/interview-prep/${sessionId}`);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
             AI Interview Question Generator
          </h1>
          <p className="text-gray-600">
            Generate personalized interview questions and save them for later practice
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Create New Session</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Job Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience *
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    placeholder="React, Node.js, MongoDB"
                    value={formData.techStack}
                    onChange={(e) =>
                      setFormData({ ...formData, techStack: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.questionCount}
                    onChange={(e) =>
                      setFormData({ ...formData, questionCount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Generating...
                    </span>
                  ) : (
                    '✨ Generate & Save'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Saved Sessions (2/3) */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Interview Sessions ({savedSessions.length})
              </h2>
            </div>

            {loadingSessions ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : savedSessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Sessions Yet
                </h3>
                <p className="text-gray-500">
                  Create your first interview session to get started!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onView={() => handleViewSession(session.sessionId)}
                    onDelete={(e) => handleDeleteSession(session.sessionId, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Session Card Component
function SessionCard({ session, onView, onDelete }) {
  const questionsData = JSON.parse(session.questionsData);
  const techStack = session.techStack.split(', ').filter(t => t);
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={onView}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {session.jobRole}
            </h3>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Experience:</span> {session.experience}
            </p>
            
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-600">
              <span className="font-medium">{questionsData.length}</span> Questions Generated
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-4 h-4" />
            {new Date(session.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={onView}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            title="View Session"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            title="Delete Session"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
