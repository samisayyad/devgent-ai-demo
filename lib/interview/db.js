// lib/interview/db.js
import { db } from '@/utils/db';
import { InterviewSessions } from '@/utils/schema';
import { eq, desc } from 'drizzle-orm';

export async function saveInterviewSession({
  sessionId,
  userId,
  userEmail,
  jobRole,
  experience,
  techStack,
  questionCount,
  questionsData
}) {
  try {
    // Create formatted date string (DD-MM-YYYY format)
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const result = await db.insert(InterviewSessions).values({
      sessionId,
      userId,
      userEmail,
      jobRole,
      experience,
      techStack: techStack.join(', '),
      questionCount: questionCount.toString(),
      questionsData: JSON.stringify(questionsData),
      createdAt: formattedDate,
    }).returning();

    console.log('✅ Session saved successfully:', result[0]?.sessionId || sessionId);
    return { success: true, data: result[0] };
    
  } catch (error) {
    console.error('❌ Failed to save session:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserSessions(userEmail) {
  try {
    const sessions = await db
      .select()
      .from(InterviewSessions)
      .where(eq(InterviewSessions.userEmail, userEmail))
      .orderBy(desc(InterviewSessions.id));

    return { success: true, data: sessions };
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return { success: false, error: error.message };
  }
}

export async function getSessionById(sessionId) {
  try {
    const session = await db
      .select()
      .from(InterviewSessions)
      .where(eq(InterviewSessions.sessionId, sessionId))
      .limit(1);

    if (session.length === 0) {
      return { success: false, error: 'Session not found' };
    }

    // ✅ FIX: Check if data exists before parsing
    const sessionData = session[0];
    
    // Parse questions data only if it exists
    const parsedSession = {
      ...sessionData,
      questionsData: sessionData.questionsData 
        ? JSON.parse(sessionData.questionsData) 
        : [],
      techStack: sessionData.techStack 
        ? sessionData.techStack.split(', ').filter(t => t) 
        : []
    };

    return { success: true, data: parsedSession };
  } catch (error) {
    console.error('Failed to get session:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSession(sessionId) {
  try {
    await db
      .delete(InterviewSessions)
      .where(eq(InterviewSessions.sessionId, sessionId));

    return { success: true };
  } catch (error) {
    console.error('Failed to delete session:', error);
    return { success: false, error: error.message };
  }
}
