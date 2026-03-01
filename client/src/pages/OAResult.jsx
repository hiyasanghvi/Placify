import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const OAResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(
  `https://placify-ooic.onrender.com/api/oa/result/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setResult(res.data))
      .catch(() => alert("Failed to load result"));
  }, [id]);

  if (!result) return <p>Loading...</p>;

  return (
    <div className="oa-wrapper">
      <h1>OA Result</h1>

      <div className="card">
        <p><strong>Topic:</strong> {result.topic}</p>
        <p><strong>Difficulty:</strong> {result.difficulty}</p>
        <p><strong>Score:</strong> {result.score} / {result.total}</p>
        <p><strong>Status:</strong> {result.status}</p>
      </div>

      <h2>Question Breakdown</h2>

      {result.answers.map((a, idx) => (
        <div key={idx} className="oa-question-card">
          <h3>Q{idx + 1}. {a.question.question}</h3>

          {a.question.type === "MCQ" && (
            <p>
              <strong>Your Answer:</strong>{" "}
              {a.question.options[a.selected]}
            </p>
          )}

          {a.question.type === "CODING" && (
            <>
              <p><strong>Submitted Code:</strong></p>
              <pre>{a.selected}</pre>
              <p style={{ color: "#888" }}>
                Coding answer pending evaluation
              </p>
            </>
          )}

          {a.correct !== null && (
            <p style={{ color: a.correct ? "green" : "red" }}>
              {a.correct ? "Correct" : "Incorrect"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default OAResult;
