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
       GEMINI QUESTIONS (AI)
    ============================== */
    let aiQuestions = [];

    try {
      const aiQuestionsRaw = await generateQuestions(text, role);

      if (aiQuestionsRaw) {
        aiQuestions = aiQuestionsRaw
          .split("\n")
          .map((q) => q.replace(/^\d+\.\s*/, "").trim())
          .filter((q) => q.length > 5);
      }
    } catch (err) {
      console.log("AI ERROR:", err.message);
    }

    // fallback AI questions
    if (aiQuestions.length < 5) {
      aiQuestions = [
        "Tell me about your project architecture",
        "What technologies did you use?",
        "What challenges did you face?",
        "How do you optimize APIs?",
        "Explain your role in team projects",
        "How do you handle debugging issues?",
        "What is your strongest project?",
        "Why should we hire you?",
      ];
    }

    /* ==============================
       1️⃣ KEYWORD SCORE (40%)
    ============================== */
    const keywords = jobKeywords[role.toLowerCase()];

    let matched = [];
    let missing = [];

    keywords.forEach((keyword) => {
      if (resumeText.includes(keyword)) matched.push(keyword);
      else missing.push(keyword);
    });

    const keywordScore = Math.round(
      (matched.length / keywords.length) * 40
    );

    /* ==============================
       2️⃣ STRUCTURE SCORE (20%)
    ============================== */
    const sectionPatterns = {
      summary: /summary|profile|objective/i,
      experience: /experience|work history/i,
      education: /education|qualification/i,
      skills: /skills|technical skills/i,
      projects: /projects|portfolio/i,
    };

    const foundSections = Object.keys(sectionPatterns).filter((key) =>
      sectionPatterns[key].test(text)
    );

    const structureScore = Math.round(
      (foundSections.length / Object.keys(sectionPatterns).length) * 20
    );

    /* ==============================
       3️⃣ IMPACT SCORE (20%)
    ============================== */
    const metricsMatches = text.match(/\d+%|\d+\+?|\$\d+/g) || [];

    let impactScore = 0;

    if (metricsMatches.length >= 5) {
      impactScore = 20;
    } else {
      impactScore = metricsMatches.length * 4;
    }

    /* ==============================
       4️⃣ FORMATTING SCORE (10%)
    ============================== */
    const wordCount = text.split(/\s+/).length;

    let formattingScore = 3;

    if (wordCount >= 300 && wordCount <= 800) {
      formattingScore = 10;
    } else if (wordCount >= 200) {
      formattingScore = 6;
    }

    /* ==============================
       5️⃣ CONTACT SCORE (10%)
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
       ISSUE DETECTION + IMPROVEMENTS
    ============================== */
    const issues = [];
    const improvements = [];

    // missing sections
    if (foundSections.length < 4) {
      issues.push("Important resume sections missing");
      improvements.push({
        title: "Improve Resume Structure",
        solution:
          "Add Summary, Experience, Education, Skills, and Projects sections.",
      });
    }

    // metrics
    if (metricsMatches.length < 3) {
      issues.push("Lack of measurable achievements");
      improvements.push({
        title: "Add Quantifiable Results",
        solution:
          "Add metrics like 'Improved performance by 30%' or 'Reduced latency by 40%'.",
      });
    }

    // weak verbs
    const weakWords = ["responsible for", "worked on", "helped", "handled"];

    const weakMatches = weakWords.filter((w) =>
      resumeText.includes(w)
    );

    if (weakMatches.length > 0) {
      issues.push("Weak action verbs detected");
      improvements.push({
        title: "Use Strong Action Verbs",
        solution:
          "Replace weak phrases with: Developed, Designed, Optimized, Led, Engineered.",
      });
    }

    // generic words
    const genericWords = [
      "hardworking",
      "team player",
      "quick learner",
      "dedicated",
    ];

    const genericMatches = genericWords.filter((w) =>
      resumeText.includes(w)
    );

    if (genericMatches.length > 0) {
      issues.push("Generic buzzwords detected");
      improvements.push({
        title: "Avoid Generic Words",
        solution:
          "Show skills through achievements instead of buzzwords like 'hardworking'.",
      });
    }

    // duplicates
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 20);

    const freq = {};

    lines.forEach((line) => {
      freq[line] = (freq[line] || 0) + 1;
    });

    const duplicateLines = Object.keys(freq).filter(
      (l) => freq[l] > 1
    );

    if (duplicateLines.length > 0) {
      issues.push("Duplicate content found");
      improvements.push({
        title: "Remove Repetition",
        solution:
          "Avoid repeating same responsibilities in multiple sections.",
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
       RESPONSE
    ============================== */
    res.json({
      overallScore,
      level,
      aiQuestions,

      breakdown: {
        keywords: keywordScore,
        structure: structureScore,
        impact: impactScore,
        formatting: formattingScore,
        contactInfo: contactScore,
      },

      matchedKeywords: matched,
      missingKeywords: missing,

      issues,
      improvements,

      wordCount,
    });
  } catch (error) {
    console.log("========== ATS ERROR ==========");
    console.log(error.message);

    res.status(500).json({
      message: "ATS analysis failed",
      error: error.message,
    });
  }
});

export default router;
