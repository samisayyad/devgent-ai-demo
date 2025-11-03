'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import CameraSection from '@/components/ai-interview/CameraSection';
import VoiceInterviewSection from '@/components/ai-interview/VoiceInterviewSection';
import InterviewControls from '@/components/ai-interview/InterviewControls';
import { getSessionById } from '@/lib/interview/db';
import { processInterviewFeedback } from '@/lib/interview/feedbackProcessor';
import { Loader2 } from 'lucide-react';

export default function AIInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [processingFeedback, setProcessingFeedback] = useState(false);
  
  const [voiceSessionId] = useState(() => uuidv4());
  const [bodyLanguageSessionId] = useState(() => uuidv4());
  const [combinedSessionId] = useState(() => uuidv4());
  
  const [transcript, setTranscript] = useState([]);
  const [isVapiActive, setIsVapiActive] = useState(false);
  
  const [bodyMetrics, setBodyMetrics] = useState({
    handDetectionCount: 0,
    handDetectionDuration: 0,
    eyeContactLossCount: 0,
    eyeContactLossDuration: 0,
    badPostureCount: 0,
    badPostureDuration: 0
  });
  
  const [startTime, setStartTime] = useState(null);
  
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const result = await getSessionById(params.sessionId);
        if (result.success) {
          setSession(result.data);
        } else {
          console.error('Session not found');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [params.sessionId, router]);
  
  const handleStartInterview = () => {
    setInterviewStarted(true);
    setStartTime(Date.now());
    console.log('🎬 Interview started at:', Date.now());
  };
  
  const handleEndInterview = useCallback(async () => {
    if (interviewEnded || processingFeedback) {
      console.log('⚠️ Already processing, skipping...');
      return;
    }
    
    setInterviewEnded(true);
    setProcessingFeedback(true);
    
    const endTime = Date.now();
    console.log('🛑 Interview ended at:', endTime);
    console.log('📊 Final transcript length:', transcript.length);
    console.log('📊 Final body metrics:', bodyMetrics);
    
    try {
      // Small delay to ensure all data is collected
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔄 Starting feedback processing...');
      
      const result = await processInterviewFeedback({
        interviewId: params.sessionId,
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
        transcript: transcript.length > 0 ? transcript : [
          { role: 'assistant', content: 'Hello! How are you today?' },
          { role: 'user', content: 'I am doing well, thank you!' }
        ],
        bodyMetrics,
        startTime: startTime || endTime - 300000, // Default to 5 min if no start time
        endTime
      });
      
      console.log('📋 Feedback processing result:', result);
      
      if (result.success) {
        console.log('✅ Redirecting to feedback page...');
        // Use replace instead of push to prevent back navigation
        router.replace(`/dashboard/ai-interview/${params.sessionId}/feedback`);
      } else {
        console.error('❌ Failed to process feedback:', result.error);
        alert(`Failed to generate feedback: ${result.error}\n\nRedirecting to dashboard...`);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('❌ Error in handleEndInterview:', error);
      alert(`An error occurred: ${error.message}\n\nRedirecting to dashboard...`);
      router.push('/dashboard');
    } finally {
      setProcessingFeedback(false);
    }
  }, [interviewEnded, processingFeedback, params.sessionId, router, user, transcript, bodyMetrics, startTime]);
  
  const handleTranscriptUpdate = useCallback((newMessage) => {
    console.log('💬 New message:', newMessage);
    setTranscript(prev => [...prev, newMessage]);
  }, []);
  
  const handleBodyMetricsUpdate = useCallback((newMetrics) => {
    setBodyMetrics(newMetrics);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interview session...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Session not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          AI-Powered Interview: {session.jobRole}
        </h1>
        <p className="text-gray-600">
          Experience: {session.experience} | Tech Stack: {session.techStack?.join(', ')}
        </p>
      </div>
      
      {!interviewStarted ? (
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Before You Begin</h2>
            <ul className="text-left space-y-2">
              <li>✓ Ensure your camera and microphone are working</li>
              <li>✓ Find a quiet, well-lit environment</li>
              <li>✓ Sit upright with good posture</li>
              <li>✓ Maintain eye contact with the camera</li>
              <li>✓ Speak clearly and confidently</li>
            </ul>
          </div>
          
          <button
            onClick={handleStartInterview}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Start Interview
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CameraSection
            isActive={interviewStarted && !interviewEnded}
            onMetricsUpdate={handleBodyMetricsUpdate}
          />
          
          <VoiceInterviewSection
            questions={session.questionsData}
            isActive={interviewStarted && !interviewEnded}
            onTranscriptUpdate={handleTranscriptUpdate}
            onVapiStatusChange={setIsVapiActive}
          />
        </div>
      )}
      
      {interviewStarted && !interviewEnded && (
        <InterviewControls
          onEndInterview={handleEndInterview}
          isVapiActive={isVapiActive}
        />
      )}
      
      {processingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2 text-center">Processing Your Interview</h3>
            <p className="text-gray-600 text-center mb-4">
              Generating comprehensive feedback...
            </p>
            <div className="text-sm text-gray-500 text-center">
              <p>✓ Analyzing voice responses</p>
              <p>✓ Evaluating body language</p>
              <p>✓ Creating recommendations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
