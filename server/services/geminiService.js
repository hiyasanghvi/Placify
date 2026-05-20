import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});

export const generateQuestions = async (resumeText, role) => {
  try {
    const prompt = `
You are a technical interviewer.

Generate 5 interview questions based on this resume.

Focus on:
- projects
- technologies
- ${role} role

Return ONLY numbered questions.

Resume:
${resumeText}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return `
1. Tell me about your projects
2. What technologies do you use?
3. Explain a challenge you solved
4. How do you handle APIs?
5. Why should we hire you?
`;
  }
};
