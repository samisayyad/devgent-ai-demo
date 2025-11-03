'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { saveInterviewSession } from '@/lib/interview/db';
import { generateInterviewQuestions } from '@/lib/interview/questionGenerator';
import { v4 as uuidv4 } from 'uuid';
import { Video, Mic, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useCallback } from 'react'; // Add this import at top


export default function AIInterviewSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    jobRole: 'Software Developer',
    experience: 'Mid-Level',
    techStack: 'JavaScript, React, Node.js',
    questionCount: '10'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartAIInterview = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Generate session ID
      const sessionId = uuidv4();
      
      // Parse tech stack
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech);
      
      // Generate questions
      const questions = await generateInterviewQuestions({
        jobRole: formData.jobRole,
        experience: formData.experience,
        techStack: techStackArray,
        questionCount: parseInt(formData.questionCount)
      });
      
      // Save session to database
      await saveInterviewSession({
        sessionId,
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        jobRole: formData.jobRole,
        experience: formData.experience,
        techStack: techStackArray,
        questionCount: parseInt(formData.questionCount),
        questionsData: questions
      });
      
      // Redirect to AI interview page
      router.push(`/dashboard/ai-interview/${sessionId}`);
      
    } catch (error) {
      console.error('Error creating AI interview session:', error);
      alert('Failed to create interview session. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleBodyMetricsUpdate = useCallback((newMetrics) => {
    setBodyMetrics(newMetrics);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Video className="w-10 h-10 text-blue-600" />
          <Mic className="w-10 h-10 text-purple-600" />
          <Sparkles className="w-10 h-10 text-pink-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">AI-Powered Interview</h1>
        <p className="text-gray-600 text-lg">
          Experience a realistic interview with AI voice assistant and body language analysis
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Mic className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">Voice AI Interviewer</h3>
            </div>
            <p className="text-sm text-gray-600">
              Natural conversation with AI that asks follow-up questions
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold">Body Language Analysis</h3>
            </div>
            <p className="text-sm text-gray-600">
              Real-time tracking of posture, eye contact, and gestures
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold">AI-Generated Feedback</h3>
            </div>
            <p className="text-sm text-gray-600">
              Comprehensive analysis of both verbal and non-verbal performance
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRight className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold">Actionable Insights</h3>
            </div>
            <p className="text-sm text-gray-600">
              Detailed recommendations to improve your interview skills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStartAIInterview} className="space-y-6">
            {/* Job Role */}
            <div className="space-y-2">
              <Label htmlFor="jobRole">Job Role *</Label>
              <Input
                id="jobRole"
                placeholder="e.g., Software Developer, Product Manager"
                value={formData.jobRole}
                onChange={(e) => handleChange('jobRole', e.target.value)}
                required
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level *</Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => handleChange('experience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry-Level">Entry-Level (0-2 years)</SelectItem>
                  <SelectItem value="Mid-Level">Mid-Level (2-5 years)</SelectItem>
                  <SelectItem value="Senior">Senior (5-10 years)</SelectItem>
                  <SelectItem value="Lead">Lead/Principal (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack / Skills *</Label>
              <Input
                id="techStack"
                placeholder="e.g., JavaScript, React, Node.js, Python"
                value={formData.techStack}
                onChange={(e) => handleChange('techStack', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Separate multiple skills with commas</p>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="questionCount">Number of Questions *</Label>
              <Select
                value={formData.questionCount}
                onValueChange={(value) => handleChange('questionCount', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions (~15 minutes)</SelectItem>
                  <SelectItem value="10">10 Questions (~30 minutes)</SelectItem>
                  <SelectItem value="15">15 Questions (~45 minutes)</SelectItem>
                  <SelectItem value="20">20 Questions (~60 minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Before You Start:</h4>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>✓ Ensure camera and microphone permissions are enabled</li>
                <li>✓ Use a quiet environment with good lighting</li>
                <li>✓ Sit in an upright position facing the camera</li>
                <li>✓ Have a stable internet connection</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Interview Session...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Start AI Interview
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
