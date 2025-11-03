// lib/vapi/vapiClient.js
import Vapi from "@vapi-ai/web";

let vapiInstance = null;

export const getVapiClient = () => {
  if (!vapiInstance) {
    vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);
  }
  return vapiInstance;
};

export const vapiAssistantConfig = {
  name: "AI Interview Coach",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: `You are a professional AI interviewer named Alloy conducting a mock interview. 
Your role is to:
1. Ask the provided interview questions one by one
2. Listen carefully to the candidate's responses
3. Ask relevant follow-up questions to dive deeper
4. Maintain a professional yet friendly tone
5. Keep responses concise and focused

Remember:
- Don't use markdown, bullet points, or special characters
- Speak naturally as a human interviewer would
- Encourage the candidate and make them feel comfortable
- Evaluate both technical knowledge and communication skills

Let's begin the interview professionally.`
  },
  voice: {
    provider: "openai",
    voiceId: "alloy"
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en"
  }
};
