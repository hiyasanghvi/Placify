import { useNavigate } from "react-router-dom";

const OpportunityCard = ({ data }) => {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate("/messages", {
      state: { user: data.user }
    });
  };

  return (
    <div className="opportunity-card">
      <div className="op-header">
        <h3>{data.company}</h3>
        <span className="role">{data.role}</span>
      </div>

      <p className="pitch">{data.pitch}</p>

      <div className="tags">
        {data.skills?.map((s, i) => (
          <span key={i} className="tag skill">{s}</span>
        ))}
      </div>

      <div className="tags">
        {data.lookingFor?.map((l, i) => (
          <span key={i} className="tag looking">{l}</span>
        ))}
      </div>

      <div className="op-footer">
        <span className="user">
          👤 {data.user?.name}
        </span>

        <button className="connect-btn" onClick={handleConnect}>
          💬 Connect
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
