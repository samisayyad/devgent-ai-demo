import { pgTable, serial, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

// Existing tables remain the same
export const MockInterview = pgTable('mockInterview', {
  id: serial('id').primaryKey(),
  jsonMockResp: text('jsonMockResp').notNull(),
  jobPosition: varchar('jobPosition').notNull(),
  jobDesc: varchar('jobDesc').notNull(),
  jobExperience: varchar('jobExperience').notNull(),
  createdBy: varchar('createdBy').notNull(),
  createdAt: varchar('createdAt'),
  mockId: varchar('mockId').notNull(),
});

export const Question = pgTable('question', {
  id: serial('id').primaryKey(),
  MockQuestionJsonResp: text('MockQuestionJsonResp').notNull(),
  jobPosition: varchar('jobPosition').notNull(),
  jobDesc: varchar('jobDesc').notNull(),
  jobExperience: varchar('jobExperience').notNull(),
  typeQuestion: varchar('typeQuestion').notNull(),
  company: varchar('company').notNull(),
  createdBy: varchar('createdBy').notNull(),
  createdAt: varchar('createdAt'),
  mockId: varchar('mockId').notNull(),
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockId').notNull(),
  question: varchar('question').notNull(),
  correctAns: text('correctAns'),
  userAns: text('userAns'),
  feedback: text('feedback'),
  rating: varchar('rating'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt'),
});

export const Newsletter = pgTable('newsletter', {
  id: serial('id').primaryKey(),
  newName: varchar('newName'),
  newEmail: varchar('newEmail'),
  newMessage: text('newMessage'),
  createdAt: varchar('createdAt'),
});

export const InterviewSessions = pgTable('interviewSessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('sessionId').notNull().unique(),
  userId: varchar('userId').notNull(),
  userEmail: varchar('userEmail').notNull(),
  jobRole: varchar('jobRole').notNull(),
  experience: varchar('experience').notNull(),
  techStack: text('techStack'),
  questionCount: varchar('questionCount'),
  questionsData: text('questionsData').notNull(),
  createdAt: varchar('createdAt'),
});

// NEW TABLES FOR VOICE AND BODY LANGUAGE

export const VoiceInterviewSessions = pgTable('voiceInterviewSessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('sessionId', { length: 255 }).notNull().unique(),
  interviewId: varchar('interviewId', { length: 255 }).notNull(),
  userId: varchar('userId', { length: 255 }).notNull(),
  userEmail: varchar('userEmail', { length: 255 }).notNull(),
  transcript: text('transcript'),
  voiceFeedback: text('voiceFeedback'),
  voiceScore: integer('voiceScore'),
  communicationScore: integer('communicationScore'),
  technicalScore: integer('technicalScore'),
  confidenceScore: integer('confidenceScore'),
  createdAt: varchar('createdAt', { length: 50 }),
});

// Body Language Sessions
export const BodyLanguageSessions = pgTable('bodyLanguageSessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('sessionId', { length: 255 }).notNull().unique(),
  interviewId: varchar('interviewId', { length: 255 }).notNull(),
  userId: varchar('userId', { length: 255 }).notNull(),
  userEmail: varchar('userEmail', { length: 255 }).notNull(),
  handDetectionCount: integer('handDetectionCount').default(0),
  handDetectionDuration: varchar('handDetectionDuration', { length: 50 }).default('0'),
  eyeContactLossCount: integer('eyeContactLossCount').default(0),
  eyeContactLossDuration: varchar('eyeContactLossDuration', { length: 50 }).default('0'),
  badPostureCount: integer('badPostureCount').default(0),
  badPostureDuration: varchar('badPostureDuration', { length: 50 }).default('0'),
  bodyLanguageFeedback: text('bodyLanguageFeedback'),
  bodyLanguageScore: integer('bodyLanguageScore'),
  postureScore: integer('postureScore'),
  eyeContactScore: integer('eyeContactScore'),
  gestureScore: integer('gestureScore'),
  createdAt: varchar('createdAt', { length: 50 }),
});

// Combined Feedback
export const CombinedFeedback = pgTable('combinedFeedback', {
  id: serial('id').primaryKey(),
  sessionId: varchar('sessionId', { length: 255 }).notNull().unique(),
  interviewId: varchar('interviewId', { length: 255 }).notNull(),
  voiceSessionId: varchar('voiceSessionId', { length: 255 }),
  bodyLanguageSessionId: varchar('bodyLanguageSessionId', { length: 255 }),
  userId: varchar('userId', { length: 255 }).notNull(),
  userEmail: varchar('userEmail', { length: 255 }).notNull(),
  overallScore: integer('overallScore'),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  recommendations: text('recommendations'),
  finalAssessment: text('finalAssessment'),
  createdAt: varchar('createdAt', { length: 50 }),
});