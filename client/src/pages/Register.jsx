import { useState } from "react";
import { registerUser } from "../api/authApi";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    year: "",
    role: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Account created. Please login.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="college" placeholder="College" onChange={handleChange} />
        <input name="year" placeholder="Passing Year" onChange={handleChange} />
        <input name="role" placeholder="Student / Alumni" onChange={handleChange} />

        <button type="submit">Register</button>

        <p>
          Already have an account? <a href="/">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;