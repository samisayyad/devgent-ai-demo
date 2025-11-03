// lib/interview/feedbackProcessor.js
import { v4 as uuidv4 } from 'uuid';
import {
  saveVoiceInterviewSession,
  saveBodyLanguageSession,
  saveCombinedFeedback,
  generateVoiceFeedback,
  generateBodyLanguageFeedback,
  generateCombinedFeedback
} from '@/lib/actions/aiInterview.actions';

/**
 * Process and save complete interview feedback
 */
export async function processInterviewFeedback({
  interviewId,
  userId,
  userEmail,
  transcript,
  bodyMetrics,
  startTime,
  endTime
}) {
  try {
    console.log('🔄 Starting feedback processing...');
    console.log('Interview ID:', interviewId);
    console.log('User ID:', userId);
    console.log('Transcript length:', transcript?.length || 0);
    console.log('Body metrics:', bodyMetrics);
    
    const totalDuration = (endTime - startTime) / 1000; // seconds
    console.log('Total duration:', totalDuration, 'seconds');
    
    // Generate Voice Feedback
    console.log('🎤 Step 1: Generating voice feedback...');
    const voiceFeedbackData = await generateVoiceFeedback(transcript);
    console.log('Voice feedback data:', voiceFeedbackData);
    
    // Save Voice Session
    const voiceSessionId = uuidv4();
    console.log('💾 Step 2: Saving voice session:', voiceSessionId);
    
    const voiceResult = await saveVoiceInterviewSession({
      sessionId: voiceSessionId,
      interviewId,
      userId,
      userEmail,
      transcript,
      voiceFeedback: JSON.stringify(voiceFeedbackData),
      voiceScore: voiceFeedbackData.voiceScore,
      communicationScore: voiceFeedbackData.communicationScore,
      technicalScore: voiceFeedbackData.technicalScore,
      confidenceScore: voiceFeedbackData.confidenceScore
    });
    
    if (!voiceResult.success) {
      console.error('Voice session save failed:', voiceResult.error);
      throw new Error('Failed to save voice session: ' + voiceResult.error);
    }
    console.log('✅ Voice feedback saved');
    
    // Generate Body Language Feedback
    console.log('👁️ Step 3: Generating body language feedback...');
    const bodyFeedbackData = await generateBodyLanguageFeedback({
      ...bodyMetrics,
      totalDuration
    });
    console.log('Body language feedback data:', bodyFeedbackData);
    
    // Save Body Language Session
    const bodySessionId = uuidv4();
    console.log('💾 Step 4: Saving body language session:', bodySessionId);
    
    const bodyResult = await saveBodyLanguageSession({
      sessionId: bodySessionId,
      interviewId,
      userId,
      userEmail,
      handDetectionCount: bodyMetrics.handDetectionCount || 0,
      handDetectionDuration: bodyMetrics.handDetectionDuration || 0,
      eyeContactLossCount: bodyMetrics.eyeContactLossCount || 0,
      eyeContactLossDuration: bodyMetrics.eyeContactLossDuration || 0,
      badPostureCount: bodyMetrics.badPostureCount || 0,
      badPostureDuration: bodyMetrics.badPostureDuration || 0,
      bodyLanguageFeedback: JSON.stringify(bodyFeedbackData),
      bodyLanguageScore: bodyFeedbackData.bodyLanguageScore,
      postureScore: bodyFeedbackData.postureScore,
      eyeContactScore: bodyFeedbackData.eyeContactScore,
      gestureScore: bodyFeedbackData.gestureScore
    });
    
    if (!bodyResult.success) {
      console.error('Body language session save failed:', bodyResult.error);
      throw new Error('Failed to save body language session: ' + bodyResult.error);
    }
    console.log('✅ Body language feedback saved');
    
    // Generate Combined Feedback
    console.log('🔀 Step 5: Generating combined feedback...');
    const combinedData = await generateCombinedFeedback({
      voiceFeedback: voiceFeedbackData.assessment,
      bodyLanguageFeedback: bodyFeedbackData.assessment,
      voiceScore: voiceFeedbackData.voiceScore,
      bodyLanguageScore: bodyFeedbackData.bodyLanguageScore
    });
    console.log('Combined feedback data:', combinedData);
    
    const overallScore = Math.round(
      (voiceFeedbackData.voiceScore * 0.6) + 
      (bodyFeedbackData.bodyLanguageScore * 0.4)
    );
    console.log('Overall score:', overallScore);
    
    // Save Combined Feedback
    const combinedSessionId = uuidv4();
    console.log('💾 Step 6: Saving combined feedback:', combinedSessionId);
    
    const combinedResult = await saveCombinedFeedback({
      sessionId: combinedSessionId,
      interviewId,
      voiceSessionId,
      bodyLanguageSessionId: bodySessionId,
      userId,
      userEmail,
      overallScore,
      strengths: combinedData.strengths,
      weaknesses: combinedData.weaknesses,
      recommendations: combinedData.recommendations,
      finalAssessment: combinedData.finalAssessment
    });
    
    if (!combinedResult.success) {
      console.error('Combined feedback save failed:', combinedResult.error);
      throw new Error('Failed to save combined feedback: ' + combinedResult.error);
    }
    console.log('✅ Combined feedback saved');
    
    console.log('🎉 Feedback processing completed successfully!');
    
    return {
      success: true,
      data: {
        combinedSessionId,
        voiceSessionId,
        bodySessionId,
        overallScore,
        voiceScore: voiceFeedbackData.voiceScore,
        bodyLanguageScore: bodyFeedbackData.bodyLanguageScore
      }
    };
    
  } catch (error) {
    console.error('❌ Error processing interview feedback:', error);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}
