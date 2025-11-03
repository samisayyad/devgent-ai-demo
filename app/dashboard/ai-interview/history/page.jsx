'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserCompletedInterviews } from '@/lib/actions/aiInterview.actions';
import { ArrowLeft, Loader2, Eye, Calendar, Award } from 'lucide-react';
import Link from 'next/link';

export default function InterviewHistoryPage() {
  const { user } = useUser();
  const router = useRouter();
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <h1 className="text-3xl font-bold mb-8">AI Interview History</h1>
      
      {interviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No interviews found</p>
            <Link href="/dashboard/ai-interview">
              <Button>Start Your First Interview</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">
                      {interview.jobRole}
                    </CardTitle>
                    <Badge variant="outline">{interview.experience}</Badge>
                  </div>
                  {interview.overallScore !== null && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {interview.overallScore}
                      </div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {interview.createdAt}
                  </div>
                  
                  {interview.techStack && interview.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {interview.techStack.slice(0, 3).map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Link href={`/dashboard/ai-interview/${interview.sessionId}/feedback`}>
                    <Button className="w-full mt-4">
                      <Eye className="w-4 h-4 mr-2" />
                      View Feedback
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
