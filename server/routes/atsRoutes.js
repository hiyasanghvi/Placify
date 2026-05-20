import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import pdfParse from "pdf-parse-debugging-disabled";
import { generateQuestions } from "../services/geminiService.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ==============================
   KEYWORDS DATABASE
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
router.post(
  "/analyze",
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("========== ATS ROUTE HIT ==========");

      const { role } = req.body;
      const file = req.file;

      console.log("ROLE:", role);

      if (!file) {
        return res
          .status(400)
          .json({ message: "No file uploaded" });
      }

      console.log("FILE RECEIVED:", file.originalname);
      console.log("FILE TYPE:", file.mimetype);

      if (
        !role ||
        !jobKeywords[role.toLowerCase()]
      ) {
        return res.status(400).json({
          message:
            "Invalid or unsupported role selected",
        });
      }

      let text = "";

      /* ==============================
         TEXT EXTRACTION
      ============================== */

      if (file.mimetype === "application/pdf") {
        console.log("Parsing PDF...");
        const data = await pdfParse(file.buffer);
        text = data.text;
      } else {
        console.log("Parsing DOCX...");
        const result =
          await mammoth.extractRawText({
            buffer: file.buffer,
          });

        text = result.value;
      }

      console.log(
        "EXTRACTED TEXT LENGTH:",
        text.length
      );

      const resumeText = text.toLowerCase();

      /* ==============================
         GEMINI CALL
      ============================== */

      console.log("Calling Gemini...");

      const aiQuestionsRaw =
        await generateQuestions(text, role);

      console.log(
        "GEMINI RAW RESPONSE:",
        aiQuestionsRaw
      );

      const aiQuestions = [
  "Tell me about yourself",
  "Explain your project",
  "Why this role?"
];

      console.log(
        "AI QUESTIONS COUNT:",
        aiQuestions.length
      );

      const keywords =
        jobKeywords[role.toLowerCase()];

      /* ===================================
         1️⃣ KEYWORD SCORE (40%)
      =================================== */

      let matched = [];
      let missing = [];

      keywords.forEach((keyword) => {
        if (resumeText.includes(keyword))
          matched.push(keyword);
        else missing.push(keyword);
      });

      const keywordScore = Math.round(
        (matched.length / keywords.length) * 40
      );

      /* ===================================
         2️⃣ SMART SECTION DETECTION (20%)
      =================================== */

      const sectionPatterns = {
        summary: /summary|profile|objective/i,
        experience: /experience|work history/i,
        education: /education|qualification/i,
        skills: /skills|technical skills/i,
        projects: /projects|portfolio/i,
      };

      const foundSections =
        Object.keys(sectionPatterns).filter(
          (key) =>
            sectionPatterns[key].test(text)
        );

      const structureScore = Math.round(
        (foundSections.length /
          Object.keys(sectionPatterns).length) *
          20
      );

      /* ===================================
         3️⃣ IMPACT & METRICS (20%)
      =================================== */

      const metricsMatches =
        text.match(/\d+%|\d+\+?|\$\d+/g) || [];

      let impactScore =
        metricsMatches.length >= 5
          ? 20
          : metricsMatches.length * 4;

      /* ===================================
         4️⃣ FORMATTING & LENGTH (10%)
      =================================== */

      const wordCount =
        text.split(/\s+/).length;

      let formattingScore = 0;

      if (
        wordCount >= 300 &&
        wordCount <= 800
      ) {
        formattingScore = 10;
      } else if (wordCount >= 200) {
        formattingScore = 6;
      } else {
        formattingScore = 3;
      }

      /* ===================================
         5️⃣ CONTACT INFO (10%)
      =================================== */

      const emailRegex = /\S+@\S+\.\S+/;
      const phoneRegex = /\d{10}/;

      let contactScore = 0;

      if (emailRegex.test(text))
        contactScore += 5;

      if (phoneRegex.test(text))
        contactScore += 5;

      /* ===================================
         TOTAL SCORE
      =================================== */

      const overallScore =
        keywordScore +
        structureScore +
        impactScore +
        formattingScore +
        contactScore;

      /* ===================================
         ADVANCED ISSUE DETECTION
      =================================== */

      const issues = [];
      const improvements = [];

      if (foundSections.length < 4) {
        issues.push(
          "Important resume sections missing"
        );

        improvements.push({
          title: "Add Missing Sections",
          solution:
            "Ensure your resume includes Summary, Experience, Education, Skills, and Projects.",
        });
      }

      if (metricsMatches.length < 3) {
        issues.push(
          "Lack of measurable achievements"
        );

        improvements.push({
          title: "Add Metrics",
          solution:
            "Add numbers like 'Improved performance by 30%' or 'Reduced costs by 20%'.",
        });
      }

      const weakWords = [
        "responsible for",
        "worked on",
        "helped",
        "assisted",
        "handled",
      ];

      const weakMatches = weakWords.filter(
        (word) => resumeText.includes(word)
      );

      if (weakMatches.length > 0) {
        issues.push(
          "Weak action verbs detected"
        );

        improvements.push({
          title: "Use Strong Action Verbs",
          solution:
            "Replace weak phrases with strong verbs like Developed, Led, Optimized, Engineered.",
        });
      }

      const genericWords = [
        "hardworking",
        "team player",
        "quick learner",
        "dedicated",
      ];

      const genericMatches =
        genericWords.filter((word) =>
          resumeText.includes(word)
        );

      if (genericMatches.length > 0) {
        issues.push(
          "Generic buzzwords detected"
        );

        improvements.push({
          title: "Avoid Generic Words",
          solution:
            "Instead of saying 'hardworking', prove it using achievements and results.",
        });
      }

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 20);

      const lineFrequency = {};

      lines.forEach((line) => {
        lineFrequency[line] =
          (lineFrequency[line] || 0) + 1;
      });

      const duplicateLines = Object.keys(
        lineFrequency
      ).filter(
        (line) => lineFrequency[line] > 1
      );

      if (duplicateLines.length > 0) {
        issues.push("Duplicate content found");

        improvements.push({
          title: "Remove Duplicate Content",
          solution:
            "Avoid repeating the same responsibilities across multiple experiences.",
        });
      }

      let level = "Poor";

      if (overallScore >= 80)
        level = "Excellent";
      else if (overallScore >= 65)
        level = "Good";
      else if (overallScore >= 50)
        level = "Average";

      console.log("ATS SUCCESS");

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

      console.log(
        "========== ATS ERROR =========="
      );

      console.log(error);

      console.log(
        "ERROR MESSAGE:",
        error.message
      );

      if (error.response) {
        console.log(
          "ERROR RESPONSE:",
          error.response.data
        );
      }

      console.log(
        "================================"
      );

      res.status(500).json({
        message: "ATS analysis failed",
        error: error.message,
      });
    }
  }
);

export default router;
