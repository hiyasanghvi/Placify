import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try using "gemini-1.5-flash-latest" instead of just "gemini-1.5-flash"
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest", 
});

export const generateQuestions = async (resumeText, role) => {
  try {
    const prompt = `
You are a technical interviewer.

Generate 8 diverse interview questions for:

Role: ${role}

Resume:
${resumeText}

Rules:
- Only numbered list
- Mix technical + HR + projects + problem solving
`;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (err) {
    console.log("❌ GEMINI ERROR:", err.message);
    return null;
  }
};
