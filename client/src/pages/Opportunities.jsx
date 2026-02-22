import { useEffect, useState } from "react";
import { getPublicOpportunities, createOpportunity } from "../api/opportunityApi";
import OpportunityCard from "../components/OpportunityCard";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    pitch: "",
    skills: "",
    lookingFor: ""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getPublicOpportunities();
    setOpportunities(res.data);
  };

  const submit = async () => {
    await createOpportunity({
      company: form.company,
      role: form.role,
      pitch: form.pitch,
      skills: form.skills.split(","),
      lookingFor: form.lookingFor.split(","),
      isPublic: true
    });

    setShowForm(false);
    setForm({ company: "", role: "", pitch: "", skills: "", lookingFor: "" });
    load();
  };

  return (
    <div className="dashboard">
      <h1>Opportunities</h1>
      <p className="dashboard-subtitle">
        Post or explore public opportunities
      </p>

      <button className="action-btn" onClick={() => setShowForm(!showForm)}>
        ➕ Post Opportunity
      </button>

      {showForm && (
        <div className="card" style={{ marginTop: 16 }}>
          <input placeholder="Company" onChange={e => setForm({ ...form, company: e.target.value })} />
          <input placeholder="Role" onChange={e => setForm({ ...form, role: e.target.value })} />
          <textarea placeholder="Pitch" onChange={e => setForm({ ...form, pitch: e.target.value })} />
          <input placeholder="Skills (comma separated)" onChange={e => setForm({ ...form, skills: e.target.value })} />
          <input placeholder="Looking for (Referral, Mentor…)" onChange={e => setForm({ ...form, lookingFor: e.target.value })} />
          <button className="action-btn" onClick={submit}>Publish</button>
        </div>
      )}

      {opportunities.map(o => (
        <OpportunityCard key={o._id} data={o} />
      ))}
    </div>
  );
};

export default Opportunities;