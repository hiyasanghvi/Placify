import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ USE STABLE MODEL
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

export const generateQuestions = async (resumeText, role) => {
  try {
    const prompt = `
You are a technical interviewer.

Generate 8 UNIQUE interview questions for:

Role: ${role}

Resume:
${resumeText}

Rules:
- Return ONLY numbered list
- Mix:
  1. Technical
  2. Projects
  3. Problem solving
  4. Real-world scenarios
- No repetition
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text;
  } catch (error) {
    console.log("❌ GEMINI ERROR:", error.message);

    return null; // IMPORTANT: let fallback handle it
  }
};
