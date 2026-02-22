import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <h3>Placify</h3>
      <Link to="/dashboard">Dashboard</Link>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;