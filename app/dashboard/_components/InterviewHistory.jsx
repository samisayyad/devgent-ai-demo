'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  TrendingUp, 
  Eye, 
  Loader2,
  Video,
  Mic,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { getUserCompletedInterviews } from '@/lib/actions/aiInterview.actions';

export default function InterviewHistory() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) return;
      
      try {
        const result = await getUserCompletedInterviews(user.id);
        if (result.success) {
          setInterviews(result.data);
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, [user]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            AI Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (interviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            AI Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4 text-gray-400">
              <Video className="w-12 h-12" />
              <Mic className="w-12 h-12" />
            </div>
            <p className="text-gray-600 mb-4">No completed AI interviews yet</p>
            <Link href="/dashboard/ai-interview">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Start Your First AI Interview
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };
  
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          AI Interview History
          <Badge variant="secondary" className="ml-auto">
            {interviews.length} {interviews.length === 1 ? 'Interview' : 'Interviews'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card 
              key={interview.id} 
              className="border-2 hover:border-blue-300 transition-all hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {interview.jobRole}
                      </h3>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{interview.createdAt}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Experience: {interview.experience}</span>
                      </div>
                      
                      {interview.techStack && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {interview.techStack.slice(0, 3).map((tech, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {interview.techStack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{interview.techStack.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side - Score & Action */}
                  <div className="text-center">
                    {interview.overallScore !== null && interview.overallScore !== undefined ? (
                      <>
                        <div className={`px-4 py-2 rounded-lg border-2 ${getScoreColor(interview.overallScore)}`}>
                          <div className="text-2xl font-bold">
                            {interview.overallScore}
                          </div>
                          <div className="text-xs">
                            {getScoreLabel(interview.overallScore)}
                          </div>
                        </div>
                        
                        <Link href={`/dashboard/ai-interview/${interview.sessionId}/feedback`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Feedback
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <div className="text-center">
                        <Badge variant="secondary" className="mb-2">
                          Processing...
                        </Badge>
                        <Link href={`/dashboard/ai-interview/${interview.sessionId}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                          >
                            Continue
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* View All Button */}
        {interviews.length >= 5 && (
          <div className="mt-4 text-center">
            <Link href="/dashboard/ai-interview/history">
              <Button variant="outline" className="w-full">
                View All Interviews
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
