import { useState } from "react";
import { Link } from "react-router-dom";
import Clock from "../components/Clock";
import RegisterModal from "../components/RegisterModal";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showRegister, setShowRegister] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLogin = async () => {
    // TODO: brancher sur ton API Node/Express : POST /api/auth/login
    // const res = await axios.post("/api/auth/login", form);
    console.log("Login:", form);
    // navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Colonne gauche : image */}
        <div className="auth-visual">
          <img src="/img_auth.png" alt="Web Portal" />
        </div>

        {/* Colonne droite : formulaire */}
        <div className="auth-form">
          <div className="auth-clock">
            <Clock />
          </div>

          <header className="auth-brand">
            <img src="/dxc-logo.png" alt="DXC" className="auth-logo" />
            <span className="auth-brand-name">Tunisia Web Portal</span>
          </header>

          <h1 className="auth-title">Sign into your account</h1>

          <div className="field">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <label>Email address</label>
          </div>

          <div className="field">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <label>Password</label>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            Remember me
          </label>

          <div className="auth-actions">
            <button className="btn-primary" onClick={handleLogin}>
              Login
            </button>
            <span className="divider">|</span>
            <Link to="/admin" className="link-strong">
              Admin Access
            </Link>
          </div>

          <p className="auth-help">
            Forgot your password? <Link to="/reset">Want to reset</Link>
          </p>

          <p className="auth-help">
            Don't have an account?{" "}
            <button className="link-button" onClick={() => setShowRegister(true)}>
              Register here
            </button>
          </p>

          <p className="auth-legal">
            <Link to="/terms">Terms of use.</Link> <Link to="/privacy">Privacy policy</Link>
          </p>
        </div>
      </div>

      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}