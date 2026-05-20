import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config'; // Loads your GEMINI_API_KEY from .env file

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 🔍 DIAGNOSTIC CHECK: 
 * This function logs the exact model names your API key is allowed to use.
 * Look at your terminal/console output when you run the app.
 */
const checkModels = async () => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();
    
    if (data.models) {
      console.log("✅ CONNECTION SUCCESSFUL");
      console.log("📋 YOUR AVAILABLE MODELS:", data.models.map(m => m.name.replace('models/', '')));
    } else {
      console.log("❌ CONNECTION FAILED: Check your API Key in the .env file.");
      console.log("RAW RESPONSE:", data);
    }
  } catch (err) {
    console.log("❌ DIAGNOSTIC ERROR:", err.message);
  }
};

// Run the check immediately
checkModels();

/**
 * 🚀 GENERATION FUNCTION:
 * Uses 'gemini-1.5-flash' which is the current stable standard.
 */
export const generateQuestions = async (resumeText, role) => {
  try {
    // We use "gemini-1.5-flash" because "gemini-pro" is deprecated
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", 
    });

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

    // Added a small safety check for the API key
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from your environment variables.");
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
        throw new Error("Received empty response from Gemini.");
    }

    return text;

  } catch (err) {
    // This will now show you the specific reason for failure
    console.log("❌ GEMINI ERROR:", err.message);
    
    // If it's a 404, it means the model name is still not matching your region/account
    if (err.message.includes("404")) {
        console.log("👉 Suggestion: Look at the 'AVAILABLE MODELS' list above and replace 'gemini-1.5-flash' with one of those strings.");
    }
    
    return null;
  }
};
