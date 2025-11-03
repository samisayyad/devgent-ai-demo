// components/ai-interview/VoiceInterviewSection.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getVapiClient, vapiAssistantConfig } from '@/lib/vapi/vapiClient';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function VoiceInterviewSection({
  questions,
  isActive,
  onTranscriptUpdate,
  onVapiStatusChange
}) {
  const [callStatus, setCallStatus] = useState('inactive'); // inactive, connecting, active, ended
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState(null);
  
  const vapiRef = useRef(null);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = getVapiClient();
    }
    
    const vapi = vapiRef.current;
    
    // Event handlers
    const handleCallStart = () => {
      console.log('📞 Call started');
      setCallStatus('active');
      onVapiStatusChange(true);
    };
    
    const handleCallEnd = () => {
      console.log('📞 Call ended');
      setCallStatus('ended');
      onVapiStatusChange(false);
    };
    
    const handleSpeechStart = () => {
      console.log('🎤 AI speaking...');
      setIsSpeaking(true);
    };
    
    const handleSpeechEnd = () => {
      console.log('🎤 AI stopped speaking');
      setIsSpeaking(false);
    };
    
    const handleMessage = (message) => {
      console.log('💬 Message received:', message);
      
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = {
          role: message.role,
          content: message.transcript,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMessage]);
        onTranscriptUpdate(newMessage);
      }
      
      if (message.type === 'function-call') {
        console.log('🔧 Function call:', message);
      }
    };
    
    const handleError = (error) => {
      console.error('❌ Vapi error:', error);
      setError(error.message || 'An error occurred with the voice assistant');
      setCallStatus('inactive');
      onVapiStatusChange(false);
    };
    
    // Register event listeners
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);
    
    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('message', handleMessage);
      vapi.off('error', handleError);
    };
  }, [onTranscriptUpdate, onVapiStatusChange]);
  
  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const startVoiceInterview = async () => {
    try {
      setCallStatus('connecting');
      setError(null);
      
      const vapi = vapiRef.current;
      
      // Format questions for the AI
      const formattedQuestions = questions
        .map((q, idx) => `Question ${idx + 1}: ${q.question}`)
        .join('\n');
      
      // Create assistant config with questions
      const assistantConfig = {
        ...vapiAssistantConfig,
        model: {
          ...vapiAssistantConfig.model,
          messages: [
            {
              role: 'system',
              content: `${vapiAssistantConfig.model.systemPrompt}

Here are the interview questions to ask:
${formattedQuestions}

Ask these questions one by one. Wait for the candidate's complete response before moving to the next question. Provide brief acknowledgments and ask follow-up questions when appropriate.`
            }
          ]
        }
      };
      
      await vapi.start(assistantConfig);
      
    } catch (err) {
      console.error('Failed to start voice interview:', err);
      setError('Failed to start voice interview. Please try again.');
      setCallStatus('inactive');
    }
  };
  
  const stopVoiceInterview = () => {
    const vapi = vapiRef.current;
    vapi.stop();
    setCallStatus('ended');
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Voice Interview</CardTitle>
            <Badge
              variant={callStatus === 'active' ? 'default' : 'secondary'}
              className={
                callStatus === 'active'
                  ? 'bg-green-500 hover:bg-green-600'
                  : callStatus === 'connecting'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-500'
              }
            >
              {callStatus === 'active' && '● Live'}
              {callStatus === 'connecting' && '● Connecting...'}
              {callStatus === 'inactive' && '○ Ready'}
              {callStatus === 'ended' && '○ Ended'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Interviewer Avatar */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Interviewer - Alloy</h3>
              <p className="text-sm text-gray-600">
                {callStatus === 'active' && isSpeaking && 'Speaking...'}
                {callStatus === 'active' && !isSpeaking && 'Listening...'}
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'inactive' && 'Ready to start'}
                {callStatus === 'ended' && 'Interview completed'}
              </p>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {/* Interview Controls */}
          <div className="flex gap-2">
            {callStatus === 'inactive' && isActive && (
              <Button
                onClick={startVoiceInterview}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Voice Interview
              </Button>
            )}
            
            {callStatus === 'connecting' && (
              <Button disabled className="flex-1">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </Button>
            )}
            
            {callStatus === 'active' && (
              <Button
                onClick={stopVoiceInterview}
                variant="destructive"
                className="flex-1"
              >
                <MicOff className="w-4 h-4 mr-2" />
                End Voice Interview
              </Button>
            )}
          </div>
          
          {/* Transcript */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-semibold text-sm">Conversation Transcript</h4>
            </div>
            <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Transcript will appear here during the interview</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                        </p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Question Progress */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Interview Progress</span>
              <span className="text-xs text-gray-600">
                {Math.min(currentQuestion + 1, questions.length)} / {questions.length} questions
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`
                }}
              />
            </div>
          </div>
          
          {/* Current Question Preview */}
          {questions && questions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-purple-800 mb-2">
                Question {Math.min(currentQuestion + 1, questions.length)}:
              </p>
              <p className="text-sm text-purple-900">
                {questions[Math.min(currentQuestion, questions.length - 1)]?.question}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
