// lib/actions/aiInterview.actions.js
'use server';

import { db } from '@/utils/db';
import {
  VoiceInterviewSessions,
  BodyLanguageSessions,
  CombinedFeedback,
  InterviewSessions
} from '@/utils/schema';
import { eq, desc } from 'drizzle-orm';
import { generateContent } from '@/lib/interview/geminiClient';

/**
 * Save voice interview session
 */
export async function saveVoiceInterviewSession({
  sessionId,
  interviewId,
  userId,
  userEmail,
  transcript,
  voiceFeedback,
  voiceScore,
  communicationScore,
  technicalScore,
  confidenceScore
}) {
  try {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = day + '-' + month + '-' + year;

    console.log('💾 Saving voice session:', sessionId);

    const result = await db
      .insert(VoiceInterviewSessions)
      .values({
        sessionId,
        interviewId,
        userId,
        userEmail,
        transcript: JSON.stringify(transcript),
        voiceFeedback,
        voiceScore: voiceScore || 0,
        communicationScore: communicationScore || 0,
        technicalScore: technicalScore || 0,
        confidenceScore: confidenceScore || 0,
        createdAt: formattedDate
      })
      .returning();

    console.log('✅ Voice session saved:', sessionId);
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('❌ Failed to save voice session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save body language session
 */
export async function saveBodyLanguageSession({
  sessionId,
  interviewId,
  userId,
  userEmail,
  handDetectionCount,
  handDetectionDuration,
  eyeContactLossCount,
  eyeContactLossDuration,
  badPostureCount,
  badPostureDuration,
  bodyLanguageFeedback,
  bodyLanguageScore,
  postureScore,
  eyeContactScore,
  gestureScore
}) {
  try {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = day + '-' + month + '-' + year;

    console.log('💾 Saving body language session:', sessionId);

    const result = await db
      .insert(BodyLanguageSessions)
      .values({
        sessionId,
        interviewId,
        userId,
        userEmail,
        handDetectionCount: handDetectionCount || 0,
        handDetectionDuration: (handDetectionDuration || 0).toString(),
        eyeContactLossCount: eyeContactLossCount || 0,
        eyeContactLossDuration: (eyeContactLossDuration || 0).toString(),
        badPostureCount: badPostureCount || 0,
        badPostureDuration: (badPostureDuration || 0).toString(),
        bodyLanguageFeedback,
        bodyLanguageScore: bodyLanguageScore || 0,
        postureScore: postureScore || 0,
        eyeContactScore: eyeContactScore || 0,
        gestureScore: gestureScore || 0,
        createdAt: formattedDate
      })
      .returning();

    console.log('✅ Body language session saved:', sessionId);
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('❌ Failed to save body language session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean markdown from Gemini response
 */
function cleanMarkdownFromJSON(response) {
    try {
      let cleaned = String(response);
  
      // ✅ Remove code blocks and markdown indicators safely
      cleaned = cleaned.split('```').join('');
      cleaned = cleaned.split('```javascript').join('');
      cleaned = cleaned.split('```json').join('');
  
      // ✅ Remove extra whitespace
      cleaned = cleaned.trim();
  
      // ✅ Extract only the JSON portion between { and }
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
  
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
  
      return cleaned;
    } catch (error) {
      console.error('Error cleaning markdown:', error);
      return response;
    }
  }
  

/**
 * Generate voice feedback using Gemini - ENHANCED VERSION
 */
export async function generateVoiceFeedback(transcript) {
  try {
    console.log('🤖 Generating voice feedback...');
    console.log('📝 Transcript length:', transcript?.length || 0);

    if (!transcript || transcript.length === 0) {
      console.warn('⚠️ No transcript data available');
      return {
        voiceScore: 50,
        communicationScore: 50,
        technicalScore: 50,
        confidenceScore: 50,
        strengths: ['Participated in the interview session'],
        weaknesses: ['No conversation data available for detailed analysis'],
        assessment:
          'Interview session was initiated but no conversation was recorded. Please ensure microphone permissions are granted and speak clearly during the interview.'
      };
    }

    const conversationText = transcript
      .map(msg => {
        const speaker = msg.role === 'user' ? 'Candidate' : 'Interviewer';
        return speaker + ': ' + msg.content;
      })
      .join('\n\n');

    console.log('📋 Conversation length:', conversationText.length);

    const prompt = `You are an expert senior technical recruiter and interview coach with 15+ years of experience. Analyze this mock interview conversation in extreme detail.

CONVERSATION TRANSCRIPT:
${conversationText}

YOUR TASK:
Provide a comprehensive, detailed analysis of the candidate's verbal performance. Be specific, actionable, and constructive.

EVALUATION CRITERIA (Score each 0-100):

1. COMMUNICATION SKILLS:
   - Clarity: Is the candidate easy to understand? Do they articulate thoughts clearly?
   - Structure: Do they organize responses logically? Do they use frameworks like STAR (Situation, Task, Action, Result)?
   - Conciseness: Do they answer directly without rambling?
   - Language: Appropriate vocabulary and grammar?
   - Active listening: Do they address the question asked?

2. TECHNICAL KNOWLEDGE:
   - Depth: How deep is their understanding of concepts?
   - Accuracy: Are their technical explanations correct?
   - Problem-solving: Do they demonstrate analytical thinking?
   - Examples: Do they provide relevant, concrete examples?
   - Current knowledge: Are they aware of modern practices and technologies?

3. CONFIDENCE & DELIVERY:
   - Tone: Professional, enthusiastic, and engaging?
   - Pace: Speaking speed appropriate (not too fast or slow)?
   - Handling pressure: How do they respond to difficult questions?
   - Assertiveness: Do they confidently defend their views?
   - Professionalism: Maintaining composure throughout?

REQUIRED OUTPUT (STRICT JSON FORMAT):
{
  "voiceScore": 85,
  "communicationScore": 90,
  "technicalScore": 80,
  "confidenceScore": 85,
  "strengths": [
    "Used STAR method effectively in behavioral questions, providing clear situation context before explaining actions",
    "Demonstrated deep technical knowledge by explaining complex concepts with practical examples from previous projects",
    "Maintained excellent pace and clarity throughout, making responses easy to follow",
    "Showed confidence by proactively asking clarifying questions when needed",
    "Provided specific metrics and outcomes when discussing past achievements"
  ],
  "weaknesses": [
    "Could elaborate more on error handling and edge cases in technical solutions",
    "Some responses were slightly lengthy - aim for more concise 2-3 minute answers",
    "Missed opportunity to discuss scalability considerations in system design question",
    "Could demonstrate more enthusiasm when discussing company culture fit",
    "Would benefit from pausing briefly before answering to organize thoughts"
  ],
  "assessment": "Overall, this was a strong interview performance demonstrating solid technical knowledge and professional communication skills. The candidate effectively used structured approaches to answer questions and provided concrete examples from their experience. Their clear articulation and logical flow of thoughts made it easy to follow their reasoning. To improve further, focus on being more concise in responses and always address scalability and edge cases in technical discussions. The confidence level was appropriate, showing expertise without arrogance. With minor refinements in response structure and depth of technical discussions, this candidate would excel in senior-level interviews."
}

CRITICAL RULES:
- Return ONLY valid JSON (no markdown, no code blocks, no extra text)
- Be extremely specific in strengths and weaknesses (mention exact examples from the conversation)
- Each strength/weakness should be a complete sentence with actionable details
- Provide 5 strengths and 5 weaknesses minimum
- Assessment should be 4-5 sentences minimum
- Scores must reflect actual performance based on the conversation
- Be constructive but honest - don't inflate scores
- Focus on actionable feedback the candidate can implement`;

    console.log('📡 Sending to Gemini API...');
    const response = await generateContent(prompt);
    console.log('✅ Received response from Gemini');

    const cleanedResponse = cleanMarkdownFromJSON(response);
    console.log('🧹 Cleaned response preview:', cleanedResponse.substring(0, 200));

    const parsed = JSON.parse(cleanedResponse);

    const validated = {
      voiceScore: Number(parsed.voiceScore) || 70,
      communicationScore: Number(parsed.communicationScore) || 70,
      technicalScore: Number(parsed.technicalScore) || 70,
      confidenceScore: Number(parsed.confidenceScore) || 70,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths
        : ['Participated actively in the interview conversation'],
      weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
        ? parsed.weaknesses
        : ['Could provide more detailed responses with specific examples'],
      assessment: parsed.assessment || 'Interview completed successfully. Continue practicing to improve communication and technical articulation.'
    };

    console.log('✅ Voice feedback validated:', validated);
    return validated;
  } catch (error) {
    console.error('❌ Error generating voice feedback:', error);
    console.error('Error stack:', error.stack);

    const hasContent = transcript && transcript.length > 2;

    return {
      voiceScore: hasContent ? 75 : 60,
      communicationScore: hasContent ? 75 : 60,
      technicalScore: hasContent ? 70 : 60,
      confidenceScore: hasContent ? 75 : 65,
      strengths: hasContent
        ? [
            'Successfully engaged in conversation with the AI interviewer',
            'Demonstrated willingness to participate in the mock interview',
            'Completed the interview session from start to finish',
            'Responded to questions asked by the interviewer',
            'Maintained communication throughout the session'
          ]
        : [
            'Initiated the interview process showing interest in practice',
            'Showed up for the scheduled interview session'
          ],
      weaknesses: hasContent
        ? [
            'Could provide more detailed technical explanations with specific examples',
            'Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions',
            'More specific examples from past experience would strengthen responses',
            'Could elaborate more on problem-solving approaches and methodologies',
            'Would benefit from discussing metrics and measurable outcomes'
          ]
        : [
            'Limited conversation data available for comprehensive analysis',
            'Ensure microphone permissions are properly enabled',
            'Practice speaking more during interviews to demonstrate communication skills',
            'Engage more actively with interviewer questions',
            'Provide longer, more detailed responses'
          ],
      assessment: hasContent
        ? 'You participated in the interview and provided responses to the questions asked. To significantly improve your interview performance, focus on giving more detailed answers with specific examples from your professional experience. Practice articulating technical concepts clearly using real-world scenarios. Use structured approaches like the STAR method for behavioral questions to ensure your responses are complete and impactful. Work on balancing technical depth with clarity - explain concepts thoroughly but in terms the interviewer can easily understand.'
        : 'The interview session was very brief with limited conversation captured. For comprehensive feedback and to improve your interview skills, engage more actively with the AI interviewer and provide detailed, thoughtful responses to each question. Ensure your microphone is working properly and speak clearly. Practice giving 2-3 minute responses that include specific examples, outcomes, and lessons learned. Remember, interviews are conversations - show enthusiasm and take time to fully answer each question.'
    };
  }
}

/**
 * Generate body language feedback using Gemini - ENHANCED VERSION
 */
export async function generateBodyLanguageFeedback(metrics) {
  try {
    console.log('🤖 Generating body language feedback...');
    console.log('📊 Metrics:', metrics);

    const {
      handDetectionCount = 0,
      handDetectionDuration = 0,
      eyeContactLossCount = 0,
      eyeContactLossDuration = 0,
      badPostureCount = 0,
      badPostureDuration = 0,
      totalDuration = 1
    } = metrics;

    const handGesturePercent = ((handDetectionDuration / totalDuration) * 100).toFixed(1);
    const eyeContactLossPercent = ((eyeContactLossDuration / totalDuration) * 100).toFixed(1);
    const badPosturePercent = ((badPostureDuration / totalDuration) * 100).toFixed(1);

    const prompt = `You are a professional body language expert and non-verbal communication coach specializing in interview performance. Analyze this candidate's body language during their interview.

BODY LANGUAGE METRICS CAPTURED:
- Hand gestures detected: ${handDetectionCount} times (${handDetectionDuration.toFixed(2)} seconds total = ${handGesturePercent}% of interview)
- Eye contact breaks: ${eyeContactLossCount} times (${eyeContactLossDuration.toFixed(2)} seconds total = ${eyeContactLossPercent}% of interview)
- Poor posture detected: ${badPostureCount} times (${badPostureDuration.toFixed(2)} seconds total = ${badPosturePercent}% of interview)
- Total interview duration: ${totalDuration.toFixed(2)} seconds (${(totalDuration / 60).toFixed(1)} minutes)

EVALUATION FRAMEWORK:

1. POSTURE ANALYSIS (Score 0-100):
   - Ideal: Upright posture maintained 85%+ of the time
   - Good: Poor posture detected less than 15% of interview time
   - Concerns: Slouching, leaning too far, inconsistent positioning

2. EYE CONTACT ANALYSIS (Score 0-100):
   - Ideal: Maintain eye contact with camera 80%+ of the time
   - Good: Brief breaks for thought are natural (under 20% loss)
   - Concerns: Frequent looking away, avoiding camera, distraction

3. GESTURE ANALYSIS (Score 0-100):
   - Ideal: Natural hand gestures 20-40% of time to emphasize points
   - Too much: Constant hand movement (over 50%) appears nervous
   - Too little: No gestures (under 10%) appears stiff or disengaged

REQUIRED OUTPUT (STRICT JSON FORMAT):
{
  "bodyLanguageScore": 78,
  "postureScore": 75,
  "eyeContactScore": 82,
  "gestureScore": 77,
  "strengths": [
    "Maintained excellent eye contact with the camera throughout most of the interview, demonstrating engagement and confidence",
    "Posture remained consistently upright during the first half of the interview, projecting professionalism",
    "Hand gestures were used naturally to emphasize key points without being distracting",
    "Overall body language conveyed confidence and attentiveness to the interviewer",
    "Minimal fidgeting or nervous movements observed"
  ],
  "weaknesses": [
    "Posture deteriorated slightly in the second half - slouching was detected ${badPosturePercent}% of the time",
    "Eye contact broke ${eyeContactLossCount} times, particularly when discussing technical concepts - maintain camera focus even when thinking",
    "Hand gestures could be used more strategically - only ${handGesturePercent}% gesture usage is below the ideal 25-35% range",
    "Some instances of looking down or away during responses which may appear uncertain",
    "Posture shifts suggest possible discomfort - ensure proper seating setup for future interviews"
  ],
  "assessment": "Your body language showed strong initial presence with good eye contact and upright posture. However, there's room for improvement in maintaining consistent posture throughout the interview and using more purposeful hand gestures to emphasize key points. The eye contact breaks, while not excessive, occurred at moments when you were explaining technical concepts - practice maintaining camera focus even while thinking. Your overall non-verbal communication projected confidence but would benefit from more conscious awareness of posture as the interview progresses. Consider recording practice sessions to become more aware of these patterns."
}

CRITICAL RULES:
- Return ONLY valid JSON (no markdown, no code blocks)
- Be specific about percentages and timing in strengths/weaknesses
- Provide 5 strengths and 5 weaknesses minimum
- Assessment should be 4-5 sentences minimum
- Relate feedback to actual metrics provided
- Be constructive and actionable`;

    console.log('📡 Sending to Gemini API...');
    const response = await generateContent(prompt);
    console.log('✅ Received response from Gemini');

    const cleanedResponse = cleanMarkdownFromJSON(response);
    const parsed = JSON.parse(cleanedResponse);

    const validated = {
      bodyLanguageScore: Number(parsed.bodyLanguageScore) || 75,
      postureScore: Number(parsed.postureScore) || 75,
      eyeContactScore: Number(parsed.eyeContactScore) || 75,
      gestureScore: Number(parsed.gestureScore) || 75,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths
        : ['Maintained presence during interview', 'Engaged with camera'],
      weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
        ? parsed.weaknesses
        : ['Could improve posture consistency', 'Practice maintaining steady eye contact'],
      assessment: parsed.assessment || 'Body language metrics were recorded. Continue practicing good posture, steady eye contact, and natural hand gestures during interviews.'
    };

    console.log('✅ Body language feedback validated:', validated);
    return validated;
  } catch (error) {
    console.error('❌ Error generating body language feedback:', error);
    return {
      bodyLanguageScore: 75,
      postureScore: 75,
      eyeContactScore: 75,
      gestureScore: 75,
      strengths: [
        'Maintained presence during interview session',
        'Engaged with camera throughout the conversation',
        'Body language analysis successfully captured',
        'Demonstrated willingness to participate in video interview'
      ],
      weaknesses: [
        'Analysis could not be completed with full detail',
        'Work on maintaining consistent upright posture throughout',
        'Practice steady eye contact with camera',
        'Use natural hand gestures to emphasize important points'
      ],
      assessment:
        'Body language metrics were recorded during your interview. To improve, focus on maintaining an upright posture throughout the entire interview, not just at the beginning. Practice looking directly at the camera lens as if making eye contact with a person. Use natural hand gestures to emphasize key points in your responses, but avoid excessive movement that may appear nervous. Record yourself in practice interviews to become more aware of your body language patterns.'
    };
  }
}

/**
 * Generate combined feedback - ENHANCED VERSION
 */
export async function generateCombinedFeedback({
  voiceFeedback,
  bodyLanguageFeedback,
  voiceScore,
  bodyLanguageScore
}) {
  try {
    console.log('🤖 Generating combined feedback...');

    const overallScore = Math.round(voiceScore * 0.6 + bodyLanguageScore * 0.4);

    const voiceFeedbackText = typeof voiceFeedback === 'string' 
      ? voiceFeedback 
      : JSON.stringify(voiceFeedback);
    
    const bodyFeedbackText = typeof bodyLanguageFeedback === 'string'
      ? bodyLanguageFeedback
      : JSON.stringify(bodyLanguageFeedback);

    const prompt = `You are a senior interview coach providing comprehensive, actionable feedback combining both verbal and non-verbal performance.

VERBAL PERFORMANCE ANALYSIS:
Score: ${voiceScore}/100
${voiceFeedbackText}

BODY LANGUAGE PERFORMANCE ANALYSIS:
Score: ${bodyLanguageScore}/100
${bodyFeedbackText}

OVERALL COMBINED SCORE: ${overallScore}/100 (60% verbal + 40% body language)

YOUR TASK:
Synthesize the verbal and non-verbal feedback into a comprehensive analysis. Identify patterns, provide specific actionable recommendations, and create a development plan.

REQUIRED OUTPUT (STRICT JSON FORMAT):
{
  "strengths": [
    "Demonstrated strong technical knowledge with clear, structured explanations that were reinforced by confident body language",
    "Maintained excellent eye contact which enhanced the credibility of verbal responses",
    "Used natural hand gestures effectively to emphasize technical points, making complex concepts easier to follow",
    "Professional tone and upright posture throughout projected confidence and competence",
    "Communication skills were well-balanced: clear articulation paired with engaged non-verbal cues",
    "Successfully used STAR method in responses while maintaining positive body language",
    "Technical depth in answers was complemented by confident delivery and steady eye contact"
  ],
  "weaknesses": [
    "While verbal responses were strong, occasional posture slumping may have undermined the confident tone",
    "Some lengthy responses could be more concise; the extra time also led to more fidgeting",
    "Eye contact broke during technical explanations precisely when maintaining it would reinforce expertise",
    "Hand gestures were underutilized - more purposeful gestures could emphasize key points in responses",
    "Body language showed decreasing energy as interview progressed, not matching the consistent verbal quality",
    "Missed opportunities to use non-verbal affirmation (nodding) when acknowledging interviewer questions",
    "Could improve synchronization between verbal pauses and thoughtful gestures"
  ],
  "recommendations": [
    "Practice 2-minute responses in front of a mirror to optimize both content and body language simultaneously",
    "Record mock interviews weekly and review for alignment between verbal confidence and non-verbal cues",
    "Before interviews, do power poses for 2 minutes to boost confidence (research shows this improves both verbal and non-verbal performance)",
    "Create a pre-interview checklist: camera positioning at eye level, proper lighting, ergonomic chair for sustained good posture",
    "When explaining technical concepts, practice maintaining eye contact with camera while organizing thoughts - use brief pauses instead of looking away",
    "Develop a habit of using intentional hand gestures for emphasis: use your hands to show relationships, scale, or progression when discussing systems or timelines",
    "Set up practice interviews with peers and specifically request feedback on body language energy levels throughout the conversation",
    "Work on maintaining consistent energy and posture for 45-60 minute sessions - this is a stamina issue that improves with practice",
    "Study successful TED talks or technical presentations to see how experts synchronize verbal content with non-verbal delivery",
    "Consider standing interviews or standing desk setup for higher-energy positions - your verbal performance may improve with better posture"
  ],
  "finalAssessment": "This was a solid interview performance that demonstrated genuine technical capability and professional communication skills. Your verbal performance was stronger than body language, suggesting you have the knowledge and communication ability but could enhance impact through more conscious non-verbal communication. The key opportunity is maintaining consistent energy and posture throughout the interview - you started strong but some metrics declined over time. This is common and highly trainable. Your technical explanations were clear and well-structured, which is the hardest skill to develop. Now focus on the presentation layer: sustained eye contact, purposeful gestures, and upright posture throughout. These refinements will elevate you from a competent candidate to a memorable one. Interviews are performances, and you have strong material - now polish the delivery. With focused practice on the specific recommendations provided, you can easily improve your overall score by 10-15 points. Your foundation is strong; these are the finishing touches that separate good candidates from great ones."
}

CRITICAL RULES:
- Return ONLY valid JSON (no markdown, no code blocks)
- Provide 7 strengths minimum (show how verbal and body language reinforced each other)
- Provide 7 weaknesses minimum (identify misalignments between verbal and body language)
- Provide 10 actionable recommendations minimum (specific, measurable, achievable)
- Final assessment should be 6-8 sentences minimum
- Be specific, constructive, and actionable
- Focus on the synergy (or lack thereof) between verbal and non-verbal communication`;

    console.log('📡 Sending to Gemini API...');
    const response = await generateContent(prompt);
    console.log('✅ Received response from Gemini');

    const cleanedResponse = cleanMarkdownFromJSON(response);
    const parsed = JSON.parse(cleanedResponse);

    const validated = {
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths
        : [
            'Completed the full interview session demonstrating commitment',
            'Engaged with AI interviewer showing interest in improvement',
            'Demonstrated willingness to participate in practice interviews'
          ],
      weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
        ? parsed.weaknesses
        : [
            'Could provide more detailed and structured responses',
            'Body language awareness and consistency needs improvement',
            'Practice maintaining energy levels throughout longer interviews'
          ],
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
        ? parsed.recommendations
        : [
            'Practice answering common interview questions using the STAR method',
            'Record yourself in mock interviews to review both verbal and non-verbal communication',
            'Work on maintaining good posture throughout 30-45 minute sessions',
            'Focus on clear, concise responses with specific examples from experience',
            'Practice with friends or mentors to get real-time feedback',
            'Set up proper interview environment with good lighting and camera positioning',
            'Review successful interview techniques through online resources',
            'Develop pre-interview routine to boost confidence',
            'Work on synchronizing confident verbal responses with positive body language'
          ],
      finalAssessment: parsed.finalAssessment ||
        'You completed the AI-powered interview successfully, demonstrating initiative in improving your interview skills. Your performance shows potential, and with focused practice on the specific areas identified, you can significantly enhance both your verbal communication and body language. The key is consistency - maintain the same energy, posture, and engagement level throughout the entire interview. Focus on providing detailed, structured responses with concrete examples from your experience. Practice regularly, record your sessions, and actively work on the recommendations provided. Remember that interviews are learned skills; every practice session builds your confidence and competence. Continue practicing to improve both verbal communication and body language presentation, and you will see measurable improvement in your overall interview performance.'
    };

    console.log('✅ Combined feedback validated:', validated);
    return validated;
  } catch (error) {
    console.error('❌ Error generating combined feedback:', error);
    return {
      strengths: [
        'Completed the AI-powered interview session',
        'Engaged with the AI interviewer demonstrating interest',
        'Demonstrated willingness to practice interview skills'
      ],
      weaknesses: [
        'More detailed responses with specific examples would strengthen answers',
        'Body language awareness and consistency could be improved',
        'Consider practicing structured response methods like STAR'
      ],
      recommendations: [
        'Practice answering common interview questions out loud daily',
        'Record mock interviews and review your performance critically',
        'Work on maintaining good posture for 30+ minute periods',
        'Focus on providing specific examples with measurable outcomes',
        'Practice with friends, mentors, or professional coaches',
        'Set up a professional interview environment at home',
        'Study successful interview techniques and body language',
        'Develop a pre-interview routine to manage nerves',
        'Work on speaking clearly and at an appropriate pace'
      ],
      finalAssessment:
        'You completed the AI-powered interview successfully, showing initiative in improving your interview skills. While we encountered some technical limitations in generating the full detailed analysis, your participation demonstrates commitment to professional development. Continue practicing regularly, focusing on both verbal communication and body language. Record your practice sessions to identify patterns and areas for improvement. Work on providing detailed, structured responses using frameworks like STAR. Most importantly, maintain consistent energy and professional presence throughout the entire interview. With dedicated practice and attention to the feedback provided, you will see significant improvement in your interview performance.'
    };
  }
}

/**
 * Save combined feedback
 */
export async function saveCombinedFeedback({
    sessionId,
    interviewId,
    voiceSessionId,
    bodyLanguageSessionId,
    userId,
    userEmail,
    overallScore,
    strengths,
    weaknesses,
    recommendations,
    finalAssessment
  }) {
    try {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const formattedDate = day + '-' + month + '-' + year;
  
      console.log('💾 Saving combined feedback:', sessionId);
  
      const result = await db
        .insert(CombinedFeedback)
        .values({
          sessionId,
          interviewId,
          voiceSessionId: voiceSessionId || null,
          bodyLanguageSessionId: bodyLanguageSessionId || null,
          userId,
          userEmail,
          overallScore: overallScore || 0,
          strengths: JSON.stringify(strengths || []),
          weaknesses: JSON.stringify(weaknesses || []),
          recommendations: JSON.stringify(recommendations || []),
          finalAssessment: finalAssessment || '',
          createdAt: formattedDate
        })
        .returning();
  
      console.log('✅ Combined feedback saved successfully');
      console.log('✅ Result:', result[0]);
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('❌ Failed to save combined feedback:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get combined feedback by interview ID - FIXED
   */
  export async function getCombinedFeedback(interviewId) {
    try {
      console.log('🔍 Fetching combined feedback for:', interviewId);
  
      const result = await db
        .select()
        .from(CombinedFeedback)
        .where(eq(CombinedFeedback.interviewId, interviewId))
        .limit(1);
  
      console.log('📋 Query result:', result);
      console.log('📋 Result length:', result.length);
  
      if (result.length === 0) {
        console.log('❌ Feedback not found for:', interviewId);
        return { success: false, error: 'Feedback not found' };
      }
  
      // FIX: Get first element from array
      const feedback = result[0];
      
      console.log('📋 Raw feedback object:', feedback);
  
      // FIX: Parse the JSON fields correctly
      const parsedFeedback = {
        id: feedback.id,
        sessionId: feedback.sessionId,
        interviewId: feedback.interviewId,
        voiceSessionId: feedback.voiceSessionId,
        bodyLanguageSessionId: feedback.bodyLanguageSessionId,
        userId: feedback.userId,
        userEmail: feedback.userEmail,
        overallScore: feedback.overallScore,
        strengths: feedback.strengths ? JSON.parse(feedback.strengths) : [],
        weaknesses: feedback.weaknesses ? JSON.parse(feedback.weaknesses) : [],
        recommendations: feedback.recommendations ? JSON.parse(feedback.recommendations) : [],
        finalAssessment: feedback.finalAssessment || '',
        createdAt: feedback.createdAt
      };
  
      console.log('✅ Parsed feedback:', parsedFeedback);
      console.log('✅ Strengths:', parsedFeedback.strengths);
      console.log('✅ Weaknesses:', parsedFeedback.weaknesses);
      
      return {
        success: true,
        data: parsedFeedback
      };
    } catch (error) {
      console.error('❌ Failed to get combined feedback:', error);
      console.error('❌ Error stack:', error.stack);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get users completed AI interviews with feedback scores
   */
  export async function getUserCompletedInterviews(userId) {
    try {
      console.log('🔍 Fetching completed interviews for user:', userId);
  
      const sessions = await db
        .select()
        .from(InterviewSessions)
        .where(eq(InterviewSessions.userId, userId))
        .orderBy(desc(InterviewSessions.id));
  
      const interviewsWithFeedback = await Promise.all(
        sessions.map(async function(session) {
          try {
            const feedbackResult = await db
              .select()
              .from(CombinedFeedback)
              .where(eq(CombinedFeedback.interviewId, session.sessionId))
              .limit(1);
  
            // FIX: Get first element if exists
            const feedback = feedbackResult.length > 0 ? feedbackResult[0] : null;
  
            return {
              id: session.id,
              sessionId: session.sessionId,
              jobRole: session.jobRole,
              experience: session.experience,
              techStack: session.techStack ? session.techStack.split(', ') : [],
              createdAt: session.createdAt,
              overallScore: feedback ? feedback.overallScore : null,
              hasFeedback: feedback !== null
            };
          } catch (error) {
            console.error('Error fetching feedback for session:', session.sessionId, error);
            return {
              id: session.id,
              sessionId: session.sessionId,
              jobRole: session.jobRole,
              experience: session.experience,
              techStack: session.techStack ? session.techStack.split(', ') : [],
              createdAt: session.createdAt,
              overallScore: null,
              hasFeedback: false
            };
          }
        })
      );
  
      const recentAndCompleted = interviewsWithFeedback.filter(function(interview) {
        return interview.hasFeedback || isRecent(interview.createdAt);
      });
  
      console.log('✅ Found', recentAndCompleted.length, 'interviews');
      return { success: true, data: recentAndCompleted };
    } catch (error) {
      console.error('❌ Error fetching completed interviews:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  /**
   * Helper: Check if interview is recent (within 24 hours)
   */
  function isRecent(dateString) {
    try {
      const parts = dateString.split('-');
      if (parts.length !== 3) return false;
      
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      const interviewDate = new Date(year + '-' + month + '-' + day);
      const now = new Date(); 
      const diffHours = (now - interviewDate) / (1000 * 60 * 60);
      return diffHours < 24;
    } catch (error) {
      return false;
    }
  }