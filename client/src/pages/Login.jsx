import { useState } from "react";
import { loginUser } from "../api/authApi";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await loginUser(form);

    localStorage.setItem("token", res.data.token);
    const user = res.data.user;

localStorage.setItem(
  "user",
  JSON.stringify({
    _id: user._id || user.id,   // force _id
    name: user.name,
    email: user.email
  })
);

localStorage.setItem("token", res.data.token);

    
    window.location.href = "/dashboard";
  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Placify</h2>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">Login</button>

        <p>
          New to Placify? <a href="/register">Create account</a>
        </p>
      </form>
    </div>
  );
};

export default Login;