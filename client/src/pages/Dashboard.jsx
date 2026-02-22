import { useEffect, useState } from "react";
import { getProfile } from "../api/authApi";
import { getPlacements } from "../api/placementApi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const profileRes = await getProfile();
        setUser(profileRes.data);

        const placementsRes = await getPlacements();
        setPlacements(placementsRes.data || []);

        setLoading(false);
      } catch (err) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    loadDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) return <p style={{ padding: 40 }}>Loading dashboard...</p>;

  // ===== Derived Data (NO UI CHANGE) =====
  const totalPlacements = placements.length;
  const totalOffers = placements.filter(p => p.status === "Offer").length;

  // Public placements = Opportunities (used later)
  const opportunities = placements.filter(p => p.isPublic === true);

  // Referrals (future-ready)
  const totalReferrals = 0;

  return (
    <>
      <div className="navbar">
        <h3>Placify</h3>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="dashboard">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Track your placements, referrals & progress
        </p>

        {/* ===== STATS (UNCHANGED) ===== */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>ATS SCORE</h3>
            <p>{user?.ats_score ?? "—"}</p>
          </div>

          <div
            className="stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/placements")}
          >
            <h3>PLACEMENTS</h3>
            <p>{totalPlacements}</p>
          </div>

          <div className="stat-card">
            <h3>REFERRALS</h3>
            <p>{totalReferrals}</p>
          </div>

          <div className="stat-card">
            <h3>OFFERS</h3>
            <p>{totalOffers}</p>
          </div>
        </div>

        {/* ===== LOWER GRID (UNCHANGED) ===== */}
        <div className="grid-2">
          <div className="card">
            <h3>Profile Overview</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>College:</strong> {user.college || "—"}</p>
            <p><strong>Role:</strong> {user.role || "Student"}</p>
          </div>

          <div className="card">
            <h3>Quick Actions</h3>

            <button
              className="action-btn"
              onClick={() => navigate("/opportunities")}
            >
               Opportunities
            </button>
            <button
              className="action-btn"
              onClick={() => navigate("/oa")}
            >
               OA
            </button>

            <button className="action-btn"
            onClick={() => navigate("/ATSPage")}>
               Upload Resume (ATS)
            </button>
            <button
  className="action-btn"
  onClick={() => navigate("/messages")}
>
   Messages
</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;