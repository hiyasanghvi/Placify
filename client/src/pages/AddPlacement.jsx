import { useState } from "react";
import { addPlacement } from "../api/placementApi";
import { useNavigate } from "react-router-dom";

const AddPlacement = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "Applied",
    appliedDate: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPlacement(form);
      navigate("/placements"); // go back to list
    } catch (err) {
      console.error(err);
      alert("Failed to add placement");
    }
  };

  return (
    <div className="dashboard">
      <h1>Add Placement</h1>

      <form className="card" onSubmit={handleSubmit}>
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          required
        />

        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleChange}
          required
        />

        <select name="status" value={form.status} onChange={handleChange}>
          <option>Applied</option>
          <option>OA</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>

        <input
          type="date"
          name="appliedDate"
          value={form.appliedDate}
          onChange={handleChange}
          required
        />

        <button className="action-btn" type="submit">
          Save Placement
        </button>
      </form>
    </div>
  );
};

export default AddPlacement;