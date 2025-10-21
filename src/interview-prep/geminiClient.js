// src/interview-prep/geminiClient.js (or your path)

import { GoogleGenerativeAI } from '@google/generative-ai';

// Try VITE_ prefix first, fallback to REACT_APP_
const API_KEY = import.meta.env.local.VITE_GEMINI_API_KEY || 
                process.env.local.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ Gemini API key not found! Check your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateContent = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest' 
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate content');
  }
};
