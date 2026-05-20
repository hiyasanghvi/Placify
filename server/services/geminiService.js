import { GoogleGenerativeAI }
from "@google/generative-ai";
console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

const model =
  genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

export const generateQuestions =
async (resumeText, role) => {

  const prompt = `
You are a technical interviewer.

Generate 5 personalized interview questions
based on this resume.

Focus on:
- projects
- technologies
- practical implementation
- ${role} role

Return ONLY questions as numbered list.

Resume:
${resumeText}
`;

  const result =
    await model.generateContent(prompt);

  return result.response.text();
};