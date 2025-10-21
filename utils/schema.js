import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

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
