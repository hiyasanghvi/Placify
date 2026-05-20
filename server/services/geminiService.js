import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ==============================
   MODEL LOADER WITH FALLBACK
============================== */
const getModel = () => {
  try {
    // ✅ Primary model (best balance)
    return genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
  } catch (err1) {
    console.error("Flash model failed, switching to pro...");

    try {
      // 🔁 Backup model
      return genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });
    } catch (err2) {
      console.error("All Gemini models failed!");
      throw new Error("No Gemini model available");
    }
  }
};

const model = getModel();

/* ==============================
   MAIN FUNCTION
============================== */
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

    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    // ✅ SAFE FALLBACK (NEVER BREAK FRONTEND)
    return `
1. Tell me about your projects
2. What technologies do you use?
3. Explain a challenge you solved
4. How do you handle APIs?
5. Why should we hire you?
`;
  }
};
