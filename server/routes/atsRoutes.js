import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import pdfParse from "pdf-parse-debugging-disabled";
import { generateQuestions } from "../services/geminiService.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ==============================
   JOB KEYWORDS DATABASE
============================== */
const jobKeywords = {
  "frontend developer": [
    "react",
    "javascript",
    "html",
    "css",
    "redux",
    "typescript",
    "api",
    "responsive",
    "git",
  ],
  "backend developer": [
    "node",
    "express",
    "mongodb",
    "api",
    "jwt",
    "database",
    "server",
    "authentication",
  ],
  "full stack developer": [
    "react",
    "node",
    "mongodb",
    "api",
    "express",
    "javascript",
  ],
  "data analyst": [
    "python",
    "sql",
    "excel",
    "power bi",
    "statistics",
    "data visualization",
  ],
  "java developer": [
    "java",
    "spring",
    "hibernate",
    "microservices",
    "maven",
  ],
  "devops engineer": [
    "docker",
    "kubernetes",
    "aws",
    "ci/cd",
    "jenkins",
    "linux",
  ],
};

/* ==============================
   ATS ANALYZE ROUTE
============================== */
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    console.log("========== ATS ROUTE HIT ==========");

    const { role } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!role || !jobKeywords[role.toLowerCase()]) {
      return res.status(400).json({
        message: "Invalid or unsupported role selected",
      });
    }

    /* ==============================
       TEXT EXTRACTION
    ============================== */
    let text = "";

    if (file.mimetype === "application/pdf") {
      const data = await pdfParse(file.buffer);
      text = data.text || "";
    } else {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      text = result.value || "";
    }

    const resumeText = text.toLowerCase();

    /* ==============================
       AI QUESTIONS (GEMINI)
    ============================== */
    let aiQuestions = [];

    try {
      const raw = await generateQuestions(text, role);

      if (raw) {
        aiQuestions = raw
          .split("\n")
          .map((q) => q.replace(/^\d+\.\s*/, "").trim())
          .filter((q) => q.length > 5);
      }
    } catch (err) {
      console.log("AI ERROR:", err.message);
    }

    if (aiQuestions.length < 5) {
      aiQuestions = [
        "Tell me about your project architecture",
        "What technologies did you use?",
        "What challenges did you face?",
        "How do you optimize APIs?",
        "Explain your role in team projects",
        "How do you handle debugging?",
        "What is your strongest project?",
        "Why should we hire you?",
      ];
    }

    /* ==============================
       1. KEYWORD SCORE (40%)
    ============================== */
    const keywords = jobKeywords[role.toLowerCase()];

    let matched = [];
    let missing = [];

    keywords.forEach((k) => {
      if (resumeText.includes(k)) matched.push(k);
      else missing.push(k);
    });

    const keywordScore = Math.round(
      (matched.length / keywords.length) * 40
    );

    /* ==============================
       2. STRUCTURE SCORE (20%)
    ============================== */
    const sections = {
      summary: /summary|profile|objective/i,
      experience: /experience|work history/i,
      education: /education|qualification/i,
      skills: /skills|technical skills/i,
      projects: /projects|portfolio/i,
    };

    const foundSections = Object.keys(sections).filter((k) =>
      sections[k].test(text)
    );

    const structureScore = Math.round(
      (foundSections.length / Object.keys(sections).length) * 20
    );

    /* ==============================
       3. IMPACT SCORE (20%)
    ============================== */
    const metrics = text.match(/\d+%|\d+\+?|\$\d+/g) || [];

    const impactScore =
      metrics.length >= 5 ? 20 : metrics.length * 4;

    /* ==============================
       4. FORMATTING SCORE (10%)
    ============================== */
    const wordCount = text.split(/\s+/).length;

    let formattingScore = 3;

    if (wordCount >= 300 && wordCount <= 800) formattingScore = 10;
    else if (wordCount >= 200) formattingScore = 6;

    /* ==============================
       5. CONTACT SCORE (10%)
    ============================== */
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /\d{10}/;

    let contactScore = 0;
    if (emailRegex.test(text)) contactScore += 5;
    if (phoneRegex.test(text)) contactScore += 5;

    /* ==============================
       TOTAL SCORE
    ============================== */
    const overallScore =
      keywordScore +
      structureScore +
      impactScore +
      formattingScore +
      contactScore;

    /* ==============================
       ISSUES + IMPROVEMENTS
    ============================== */
    const issues = [];
    const improvements = [];

    if (foundSections.length < 4) {
      issues.push("Missing important resume sections");
      improvements.push({
        title: "Improve Resume Structure",
        solution:
          "Add Summary, Experience, Education, Skills, and Projects sections.",
      });
    }

    if (metrics.length < 3) {
      issues.push("Lack of measurable achievements");
      improvements.push({
        title: "Add Quantifiable Metrics",
        solution:
          "Add numbers like 'Improved performance by 30%' or 'Reduced cost by 20%'.",
      });
    }

    const weakWords = ["responsible for", "worked on", "helped", "handled"];
    if (weakWords.some((w) => resumeText.includes(w))) {
      issues.push("Weak action verbs detected");
      improvements.push({
        title: "Use Strong Action Verbs",
        solution:
          "Use words like Developed, Designed, Optimized, Led, Engineered.",
      });
    }

    const genericWords = ["hardworking", "team player", "quick learner"];
    if (genericWords.some((w) => resumeText.includes(w))) {
      issues.push("Generic buzzwords detected");
      improvements.push({
        title: "Avoid Generic Words",
        solution:
          "Replace buzzwords with real achievements and measurable results.",
      });
    }

    /* ==============================
       ATS LEVEL
    ============================== */
    let level = "Poor";

    if (overallScore >= 80) level = "Excellent";
    else if (overallScore >= 65) level = "Good";
    else if (overallScore >= 50) level = "Average";

    console.log("ATS SUCCESS");

    /* ==============================
       FINAL RESPONSE (UI READY)
    ============================== */
    res.json({
      success: true,

      summary: {
        overallScore,
        level,
        wordCount,
      },

      breakdown: {
        keywords: keywordScore,
        structure: structureScore,
        impact: impactScore,
        formatting: formattingScore,
        contactInfo: contactScore,
      },

      keywords: {
        matched,
        missing,
      },

      issues: issues.map((i, index) => ({
        id: index + 1,
        title: i,
      })),

      improvements: improvements.map((i, index) => ({
        id: index + 1,
        title: i.title,
        description: i.solution,
        priority:
          i.title.includes("Structure") ||
          i.title.includes("Metrics")
            ? "High"
            : "Medium",
      })),

      aiQuestions,
    });
  } catch (error) {
    console.log("========== ATS ERROR ==========");
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "ATS analysis failed",
      error: error.message,
    });
  }
});

export default router;
