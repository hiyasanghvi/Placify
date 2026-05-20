import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import pdfParse from "pdf-parse-debugging-disabled";
import { generateQuestions } from "../services/geminiService.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   ROLE KEYWORDS
========================= */
const jobKeywords = {
  "frontend developer": ["react", "javascript", "html", "css", "redux", "typescript", "api", "responsive", "git"],
  "backend developer": ["node", "express", "mongodb", "api", "jwt", "database", "server", "authentication"],
  "full stack developer": ["react", "node", "mongodb", "api", "express", "javascript"],
  "data analyst": ["python", "sql", "excel", "power bi", "statistics", "data visualization"],
  "java developer": ["java", "spring", "hibernate", "microservices", "maven"],
  "devops engineer": ["docker", "kubernetes", "aws", "ci/cd", "jenkins", "linux"],
};

/* =========================
   FALLBACK QUESTIONS
========================= */
const fallbackQuestions = [
  "Tell me about yourself and your projects",
  "What technologies have you worked with?",
  "Explain a challenging problem you solved",
  "How do you design and build APIs?",
  "How do you debug production issues?",
  "Why should we hire you?",
  "Explain a system you built end-to-end",
  "What is your strongest technical skill?",
];

/* =========================
   ROUTE
========================= */
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    console.log("========== ATS ROUTE HIT ==========");

    const { role } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const roleKey = role?.toLowerCase();
    const keywords = jobKeywords[roleKey];

    if (!roleKey || !keywords) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    /* =========================
       TEXT EXTRACTION
    ========================= */
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

    /* =========================
       GEMINI CALL (SAFE)
    ========================= */
    let aiQuestionsRaw = "";

    try {
      aiQuestionsRaw = await generateQuestions(text, role);
    } catch (err) {
      console.log("Gemini failed → fallback used");
    }

    /* =========================
       CLEAN QUESTIONS
    ========================= */
    let aiQuestions = [];

    if (aiQuestionsRaw) {
      aiQuestions = aiQuestionsRaw
        .split("\n")
        .map(q => q.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter(q => q.length > 3);
    }

    // remove duplicates
    aiQuestions = [...new Set(aiQuestions)];

    // ensure minimum 8 questions
    if (aiQuestions.length < 8) {
      aiQuestions = fallbackQuestions;
    }

    /* =========================
       KEYWORD SCORE
    ========================= */
    let matched = [];
    let missing = [];

    keywords.forEach(k => {
      if (resumeText.includes(k)) matched.push(k);
      else missing.push(k);
    });

    const keywordScore = Math.round((matched.length / keywords.length) * 40);

    /* =========================
       STRUCTURE SCORE
    ========================= */
    const sections = {
      summary: /summary|profile|objective/i,
      experience: /experience|work/i,
      education: /education|qualification/i,
      skills: /skills/i,
      projects: /projects/i,
    };

    const foundSections = Object.keys(sections).filter(k => sections[k].test(text));

    const structureScore = Math.round(
      (foundSections.length / Object.keys(sections).length) * 20
    );

    /* =========================
       IMPACT SCORE
    ========================= */
    const metrics = text.match(/\d+%|\d+\+|\$\d+/g) || [];
    const impactScore = metrics.length >= 5 ? 20 : metrics.length * 4;

    /* =========================
       FORMATTING SCORE
    ========================= */
    const words = text.split(/\s+/).length;
    const formattingScore = words >= 300 ? 10 : words >= 200 ? 6 : 3;

    /* =========================
       CONTACT SCORE
    ========================= */
    const contactScore =
      (/\S+@\S+\.\S+/.test(text) ? 5 : 0) +
      (/\d{10}/.test(text) ? 5 : 0);

    const overallScore =
      keywordScore +
      structureScore +
      impactScore +
      formattingScore +
      contactScore;

    /* =========================
       ISSUES
    ========================= */
    const issues = [];
    const improvements = [];

    if (foundSections.length < 4) {
      issues.push("Missing sections");
      improvements.push({
        title: "Improve Structure",
        solution: "Add Summary, Experience, Education, Skills, Projects",
      });
    }

    if (metrics.length < 3) {
      issues.push("Low measurable impact");
      improvements.push({
        title: "Add Metrics",
        solution: "Use numbers like 30% improvement, 2x performance, etc.",
      });
    }

    let level = "Poor";
    if (overallScore >= 80) level = "Excellent";
    else if (overallScore >= 65) level = "Good";
    else if (overallScore >= 50) level = "Average";

    console.log("ATS SUCCESS");

    return res.json({
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
      wordCount: words,
    });

  } catch (error) {
    console.log("========== ATS ERROR ==========");
    console.log(error.message);

    return res.status(500).json({
      message: "ATS analysis failed",
      error: error.message,
    });
  }
});

export default router;
