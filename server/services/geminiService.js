import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ GEMINI API KEY NOT FOUND");
}

const genAI = new GoogleGenerativeAI(apiKey);

// IMPORTANT: correct model (latest stable)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generateQuestions = async (resumeText, role) => {
  try {
    const prompt = `
You are a technical interviewer.

Generate 8 DIFFERENT interview questions (IMPORTANT: not 3, not repetitive).

Role: ${role}

Resume:
${resumeText}

Rules:
- Return ONLY numbered list
- Make questions diverse:
  * technical
  * project-based
  * problem solving
  * real-world scenarios
- No duplicates
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text;

  } catch (error) {
    console.log("❌ GEMINI ERROR:", error.message);

    // FINAL FALLBACK (never fails)
    return `
1. Explain your project architecture
2. What tech stack did you use?
3. What challenges did you face?
4. How do you optimize APIs?
5. Explain your role in team projects
6. How do you handle debugging?
7. What is your strongest project?
8. Why should we hire you?
`;
  }
};
