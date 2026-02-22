import { useState } from "react";
import axios from "axios";

const OA = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);

  const token = localStorage.getItem("token");

  // ---------------- START OA ----------------
  const startOA = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/oa/questions?topic=${topic}&difficulty=${difficulty}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setQuestions(res.data);
      setStarted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start OA");
    }
  };

  // ---------------- MCQ ----------------
  const selectOption = (qId, index) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: index
    }));
  };

  // ---------------- CODING ----------------
  const updateCode = (qId, value) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: value
    }));
  };

  // ---------------- SUBMIT OA ----------------
  const submitOA = async () => {
    // validation
    for (const q of questions) {
      if (answers[q._id] === undefined || answers[q._id] === "") {
        alert("Please answer all questions before submitting");
        return;
      }
    }

    const payload = {
      topic,
      difficulty,
      answers: questions.map(q => ({
        questionId: q._id,
        selected: answers[q._id] // number (MCQ) OR string (CODING)
      }))
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/oa/submit",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      window.location.href = `/oa-result/${res.data.attemptId}`;
    } catch (err) {
      alert("Submit failed");
      console.error(err);
    }
  };

  return (
    <div className="oa-wrapper">
      {!started && (
        <div className="oa-start-card">
          <h1>Online Assessment</h1>

          <select onChange={e => setTopic(e.target.value)}>
            <option value="">Select Topic</option>
            <option value="DSA">DSA</option>
            <option value="OS">OS</option>
            <option value="DBMS">DBMS</option>
            <option value="CN">CN</option>
          </select>

          <select onChange={e => setDifficulty(e.target.value)}>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            type="button"
            disabled={!topic || !difficulty}
            onClick={startOA}
          >
            Start OA
          </button>
        </div>
      )}

      {started &&
        questions.map((q, idx) => (
          <div key={q._id} className="oa-question-card">
            <h3>
              Q{idx + 1}. {q.question}
            </h3>

            {/* MCQ */}
            {q.type === "MCQ" && (
              <div>
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => selectOption(q._id, i)}
                    style={{
                      padding: "10px",
                      border: "1px solid #ccc",
                      marginBottom: "6px",
                      cursor: "pointer",
                      background:
                        answers[q._id] === i ? "#dbeafe" : "#fff"
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}

            {/* CODING */}
            {q.type === "CODING" && (
              <>
                <p>{q.codingPrompt}</p>
                <textarea
                  rows={8}
                  style={{ width: "100%" }}
                  value={answers[q._id] ?? q.starterCode}
                  onChange={e => updateCode(q._id, e.target.value)}
                />
              </>
            )}
          </div>
        ))}

      {started && (
        <button type="button" onClick={submitOA}>
          Submit Test
        </button>
      )}
    </div>
  );
};

export default OA;