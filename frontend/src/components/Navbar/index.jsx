import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          PROJET TEST ARTHUR
        </Link>
      </div>
      <div className="navbar-right">
        {!user && (
          <>
            <Link to="/login" className="nav-link">
              Connexion
            </Link>
            <Link to="/register" className="nav-link btn-primary">
              Inscription
            </Link>
          </>
        )}
        {user && (
          <>
            <span className="nav-link">
              {user.email} ({user.roles})
            </span>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn-ghost">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;