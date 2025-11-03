// components/ai-interview/InterviewControls.jsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StopCircle, AlertTriangle } from 'lucide-react';

export default function InterviewControls({ onEndInterview, isVapiActive }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleEndInterview = () => {
    setIsDialogOpen(false);
    onEndInterview();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Interview in Progress</span>
          </div>
          {isVapiActive && (
            <span className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded">
              Voice Active
            </span>
          )}
        </div>
        
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg">
              <StopCircle className="w-5 h-5 mr-2" />
              End Interview
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                End Interview?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end this interview? This action cannot be undone.
                Your performance will be analyzed and feedback will be generated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Interview</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEndInterview}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, End Interview
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
