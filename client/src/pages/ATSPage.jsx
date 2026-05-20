import { useState } from "react";
import axios from "axios";

const ATSPage = () => {

  const [file, setFile] = useState(null);

  const [role, setRole] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!file || !role) {
      alert(
        "Please upload resume and select role"
      );
      return;
    }

    const formData = new FormData();

    formData.append("resume", file);

    formData.append("role", role);

    try {

      setLoading(true);

      const res = await axios.post(
        "https://placify-ooic.onrender.com/api/ats/analyze",
        formData
      );

      setResult(res.data);

    } catch (err) {

      console.error(err);

      alert("Error analyzing resume");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="ats-container">

      <h1>
        📄 Resume ATS Analyzer
      </h1>

      <div className="ats-card">

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
        >

          <option value="">
            Select Target Role
          </option>

          <option value="frontend developer">
            Frontend Developer
          </option>

          <option value="backend developer">
            Backend Developer
          </option>

          <option value="full stack developer">
            Full Stack Developer
          </option>

          <option value="data analyst">
            Data Analyst
          </option>

          <option value="java developer">
            Java Developer
          </option>

          <option value="devops engineer">
            DevOps Engineer
          </option>

        </select>

        <button
          onClick={handleSubmit}
          disabled={
            !file ||
            !role ||
            loading
          }
        >

          {
            loading
              ? "Analyzing..."
              : "Analyze Resume"
          }

        </button>

      </div>

      {result && (

        <div className="ats-result">

          <h2>
            ATS Score:
            {" "}
            {result.overallScore || 0}%
          </h2>

          <h3>
            Resume Level:
            {" "}
            {result.level}
          </h3>

          {/* =========================
              MATCHED SKILLS
          ========================= */}

          <div className="matched">

            <h3>
              ✅ Matched Skills
            </h3>

            {
              (
                result.matchedKeywords || []
              ).map((skill, i) => (

                <span
                  key={i}
                  className="tag success"
                >
                  {skill}
                </span>

              ))
            }

          </div>

          {/* =========================
              MISSING SKILLS
          ========================= */}

          <div className="missing">

            <h3>
              ❌ Missing Skills
            </h3>

            {
              (
                result.missingKeywords || []
              ).map((skill, i) => (

                <span
                  key={i}
                  className="tag danger"
                >
                  {skill}
                </span>

              ))
            }

          </div>

          {/* =========================
              ISSUES
          ========================= */}

          <div className="issues">

            <h3>
              ⚠ Issues Found
            </h3>

            {
              (
                result.issues || []
              ).map((issue, i) => (

                <p key={i}>
                  • {issue}
                </p>

              ))
            }

          </div>

          {/* =========================
              IMPROVEMENTS
          ========================= */}

          <div className="improvements">

            <h3>
              💡 Suggested Improvements
            </h3>

            {
              (
                result.improvements || []
              ).map((item, i) => (

                <div
                  key={i}
                  className="improvement-card"
                >

                  <strong>
                    {item.title}
                  </strong>

                  <p>
                    {item.solution}
                  </p>

                </div>

              ))
            }

          </div>

          {/* =========================
              AI QUESTIONS
          ========================= */}

          <div className="issues">

            <h3>
              🤖 AI Interview Questions
            </h3>

            {
              (
                result.aiQuestions || []
              ).map((question, i) => (

                <div
                  key={i}
                  className="improvement-card"
                  style={{
                    marginBottom: 12
                  }}
                >

                  <p>
                    {question}
                  </p>

                </div>

              ))
            }

          </div>

        </div>

      )}

    </div>
  );
};

export default ATSPage;