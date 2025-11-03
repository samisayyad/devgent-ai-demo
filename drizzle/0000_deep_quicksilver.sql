CREATE TABLE IF NOT EXISTS "bodyLanguageSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar NOT NULL,
	"interviewId" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"userEmail" varchar NOT NULL,
	"handDetectionCount" integer DEFAULT 0,
	"handDetectionDuration" varchar DEFAULT '0',
	"eyeContactLossCount" integer DEFAULT 0,
	"eyeContactLossDuration" varchar DEFAULT '0',
	"badPostureCount" integer DEFAULT 0,
	"badPostureDuration" varchar DEFAULT '0',
	"bodyLanguageFeedback" text,
	"bodyLanguageScore" integer,
	"postureScore" integer,
	"eyeContactScore" integer,
	"gestureScore" integer,
	"createdAt" varchar,
	CONSTRAINT "bodyLanguageSessions_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "combinedFeedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar NOT NULL,
	"interviewId" varchar NOT NULL,
	"voiceSessionId" varchar,
	"bodyLanguageSessionId" varchar,
	"userId" varchar NOT NULL,
	"userEmail" varchar NOT NULL,
	"overallScore" integer,
	"strengths" text,
	"weaknesses" text,
	"recommendations" text,
	"finalAssessment" text,
	"createdAt" varchar,
	CONSTRAINT "combinedFeedback_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interviewSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"userEmail" varchar NOT NULL,
	"jobRole" varchar NOT NULL,
	"experience" varchar NOT NULL,
	"techStack" text,
	"questionCount" varchar,
	"questionsData" text NOT NULL,
	"createdAt" varchar,
	CONSTRAINT "interviewSessions_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mockInterview" (
	"id" serial PRIMARY KEY NOT NULL,
	"jsonMockResp" text NOT NULL,
	"jobPosition" varchar NOT NULL,
	"jobDesc" varchar NOT NULL,
	"jobExperience" varchar NOT NULL,
	"createdBy" varchar NOT NULL,
	"createdAt" varchar,
	"mockId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter" (
	"id" serial PRIMARY KEY NOT NULL,
	"newName" varchar,
	"newEmail" varchar,
	"newMessage" text,
	"createdAt" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question" (
	"id" serial PRIMARY KEY NOT NULL,
	"MockQuestionJsonResp" text NOT NULL,
	"jobPosition" varchar NOT NULL,
	"jobDesc" varchar NOT NULL,
	"jobExperience" varchar NOT NULL,
	"typeQuestion" varchar NOT NULL,
	"company" varchar NOT NULL,
	"createdBy" varchar NOT NULL,
	"createdAt" varchar,
	"mockId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userAnswer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mockId" varchar NOT NULL,
	"question" varchar NOT NULL,
	"correctAns" text,
	"userAns" text,
	"feedback" text,
	"rating" varchar,
	"userEmail" varchar,
	"createdAt" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voiceInterviewSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar NOT NULL,
	"interviewId" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"userEmail" varchar NOT NULL,
	"transcript" text,
	"voiceFeedback" text,
	"voiceScore" integer,
	"communicationScore" integer,
	"technicalScore" integer,
	"confidenceScore" integer,
	"createdAt" varchar,
	CONSTRAINT "voiceInterviewSessions_sessionId_unique" UNIQUE("sessionId")
);
