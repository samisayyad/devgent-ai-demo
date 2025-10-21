// lib/interview/geminiClient.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

console.log('🔑 API Key loaded:', API_KEY ? 'YES' : 'NO');

if (!API_KEY) {
  console.error('⚠️ NEXT_PUBLIC_GEMINI_API_KEY not found in .env.local');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateContent = async (prompt) => {
  // ✅ Use EXACT model names that work
  const modelsToTry = [
    'gemini-2.5-flash',    // Recommended - fastest
    'gemini-2.5-pro',      // More capable
    'models/gemini-1.5-flash',  // Alternative format
    'models/gemini-1.5-pro'     // Alternative format
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Trying model: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({
        model: modelName
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Success with model: ${modelName}`);
      return text;
      
    } catch (error) {
      console.warn(`❌ Model ${modelName} failed:`, error.message);
      lastError = error;
      continue; // Try next model
    }
  }

  // If all models failed
  console.error('❌ All models failed. Last error:', lastError);
  throw new Error(`Gemini API failed: ${lastError?.message || 'Unknown error'}`);
};
