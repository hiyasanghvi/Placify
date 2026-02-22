import { useEffect, useState } from "react";
import { getPlacements } from "../api/placementApi";
import { useNavigate } from "react-router-dom";

const statusColor = {
  Applied: "#60a5fa",
  OA: "#a78bfa",
  Interview: "#fbbf24",
  Offer: "#22c55e",
  Rejected: "#ef4444"
};

const Placements = () => {
  const [placements, setPlacements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlacements = async () => {
      try {
        const res = await getPlacements();
        console.log("PLACEMENTS:", res.data);
        setPlacements(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadPlacements();
  }, []);

  return (
    <div className="dashboard">
      <h1>Placements</h1>
      <p className="dashboard-subtitle">
        Track all your job applications
      </p>

      {/* ✅ ADD BUTTON */}
      <button
        className="action-btn"
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/placements/add")}
      >
        ➕ Add Placement
      </button>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p) => (
              <tr key={p._id}>
                <td>{p.company}</td>
                <td>{p.role}</td>
                <td>
                  <span
                    style={{
                      color: statusColor[p.status],
                      fontWeight: 600
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  {new Date(p.appliedDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {placements.length === 0 && (
          <p style={{ marginTop: 16, color: "#64748b" }}>
            No placements added yet
          </p>
        )}
      </div>
    </div>
  );
};

export default Placements;