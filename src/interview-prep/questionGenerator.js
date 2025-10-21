// src/interview-prep/questionGenerator.js

import { generateContent } from './geminiClient';

export const generateInterviewQuestions = async ({
  jobRole,
  experience = 'Mid-Level',
  techStack = [],
  questionCount = 5
}) => {
  const techStackString = techStack.length > 0 
    ? techStack.join(', ') 
    : 'general programming';

  const prompt = `Generate ${questionCount} technical interview questions for a ${experience} level ${jobRole} position.

Tech stack: ${techStackString}

For each question provide:
1. Question text
2. Detailed answer
3. Category (Technical/Behavioral/Problem-Solving)
4. Difficulty (Easy/Medium/Hard)

Format as JSON array:
[
  {
    "question": "question text",
    "answer": "detailed answer",
    "category": "Technical",
    "difficulty": "Medium"
  }
]

Return ONLY valid JSON, no markdown.`;

  const aiResponse = await generateContent(prompt);
  
  const cleanedResponse = aiResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const questionsData = JSON.parse(cleanedResponse);

  return questionsData.map((q, index) => ({
    id: `${Date.now()}-${index}`,
    question: q.question,
    answer: q.answer,
    category: q.category || 'General',
    difficulty: q.difficulty || 'Medium',
    isPinned: false,
    createdAt: new Date().toISOString(),
  }));
};

export const explainConcept = async (concept, context = 'software development') => {
  const prompt = `Explain "${concept}" in the context of ${context}.
  
Include:
1. Brief definition
2. Key features
3. Practical example
4. Common pitfalls

Keep under 300 words.`;

  return await generateContent(prompt);
};
