import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Clock from "../components/Clock";
import RegisterModal from "../components/RegisterModal";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showRegister, setShowRegister] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setAuthError("");

    if (!form.email) { setEmailError("Email is required."); return; }
    if (!form.password) { setPasswordError("Password is required."); return; }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.user.role === "admin" ? "/dashboard" : "/home");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (err.response?.status === 403) {
        setAuthError(msg);
      } else if (msg.toLowerCase().includes("email") || err.response?.status === 404) {
        setEmailError("No account found with this email.");
      } else {
        setPasswordError("Incorrect password.");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Colonne gauche : image */}
        <div className="auth-visual">
          <img src="/img_authh.png" alt="Web Portal" />
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
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="Email address"
            />
            {emailError && <p className="auth-error">{emailError}</p>}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Password"
            />
            {passwordError && <p className="auth-error">{passwordError}</p>}
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

          {authError && <p className="auth-error">{authError}</p>}

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
            <button
              className="link-button"
              onClick={() => setShowRegister(true)}
            >
              Register here
            </button>
          </p>

          <p className="auth-legal">
            <Link to="/terms">Terms of use.</Link>{" "}
            <Link to="/privacy">Privacy policy</Link>
          </p>
        </div>
      </div>

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </div>
  );
}
