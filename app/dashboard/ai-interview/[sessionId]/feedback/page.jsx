'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCombinedFeedback } from '@/lib/actions/aiInterview.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  Award,
  ArrowLeft,
  Download,
  Loader2,
  RefreshCcw
} from 'lucide-react';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching feedback for session:', params.sessionId);
        
        // Add a small delay before first fetch
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const result = await getCombinedFeedback(params.sessionId);
        
        console.log('📋 Feedback result:', result);
        
        if (result.success) {
          setFeedback(result.data);
          console.log('✅ Feedback loaded successfully');
        } else {
          console.log('❌ Feedback not found:', result.error);
          
          // Retry up to 3 times with increasing delays
          if (retryCount < 3) {
            console.log(`⏳ Retrying in ${(retryCount + 1) * 2} seconds... (Attempt ${retryCount + 1}/3)`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, (retryCount + 1) * 2000);
          } else {
            setError(result.error || 'Feedback not found');
          }
        }
      } catch (err) {
        console.error('❌ Error fetching feedback:', err);
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [params.sessionId, retryCount]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 mb-2">Loading your feedback...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500">
              Retry attempt {retryCount}/3
            </p>
          )}
        </div>
      </div>
    );
  }
  
  if (error || !feedback) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">{error || 'Feedback not found'}</p>
            <p className="text-sm text-gray-600">
              The feedback may still be processing. Please wait a moment and try again.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setRetryCount(0);
                  setError(null);
                }}
                className="flex-1"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', className: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', className: 'bg-yellow-500' };
    return { label: 'Needs Improvement', className: 'bg-red-500' };
  };
  
  const scoreBadge = getScoreBadge(feedback.overallScore || 0);
  
  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
            <p className="text-gray-600">
              Comprehensive analysis of your interview performance
            </p>
          </div>
        </div>
      </div>
      
      {/* Overall Score Card */}
      <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-2">Overall Interview Score</h2>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(feedback.overallScore)}`}>
              {feedback.overallScore}
              <span className="text-3xl">/100</span>
            </div>
            <Badge className={scoreBadge.className}>
              {scoreBadge.label}
            </Badge>
            <div className="mt-4 max-w-2xl mx-auto">
              <Progress value={feedback.overallScore} className="h-3" />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Completed on {feedback.createdAt}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Feedback Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Final Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Final Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {feedback.finalAssessment || 'No assessment available.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Strengths Tab */}
        <TabsContent value="strengths">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Your Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.strengths && feedback.strengths.length > 0 ? (
                  feedback.strengths.map((strength, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-800">{strength}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No strengths data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Improvements Tab */}
        <TabsContent value="improvements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.weaknesses && feedback.weaknesses.length > 0 ? (
                  feedback.weaknesses.map((weakness, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-800">{weakness}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No improvement areas identified.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                Actionable Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.recommendations && feedback.recommendations.length > 0 ? (
                  feedback.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {idx + 1}
                      </div>
                      <p className="text-gray-800 pt-1">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No recommendations available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="outline"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/ai-interview`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Take Another Interview
        </Button>
      </div>
    </div>
  );
}
