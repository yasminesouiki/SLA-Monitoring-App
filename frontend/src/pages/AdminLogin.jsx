import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Clock from "../components/Clock";
import "../styles/auth.css";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!form.email) {
      setEmailError("Email is required.");
      return;
    }
    if (!form.password) {
      setPasswordError("Password is required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const user = res.data.user;

      if (user.role !== "admin") {
        setGeneralError("Access denied. Admin privileges required.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (msg.toLowerCase().includes("email") || err.response?.status === 404) {
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

          <div className="admin-badge">Admin Access</div>

          <div style={{ marginBottom: "15px" }} />

          <h1
            className="auth-title"
            style={{ fontWeight: 300, fontSize: "25px" }}
          >
            Sign in as Administrator
          </h1>

          <div className="field">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <label>Admin email</label>
            {emailError && <p className="auth-error">{emailError}</p>}
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
            {passwordError && <p className="auth-error">{passwordError}</p>}
          </div>

          {generalError && <p className="auth-error">{generalError}</p>}

          <div className="auth-actions">
            <button className="btn-primary btn-admin" onClick={handleLogin}>
              Sign in
            </button>
            <span className="divider">|</span>
            <Link to="/" className="link-strong">
              Back to login
            </Link>
          </div>

          <p className="auth-legal">
            <Link to="/terms">Terms of use.</Link>{" "}
            <Link to="/privacy">Privacy policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

