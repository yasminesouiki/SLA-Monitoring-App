import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Clock from "../components/Clock";
import "../styles/auth.css";

export default function OTPVerification() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = sessionStorage.getItem("admin_email") || "";
  const sentTo = location.state?.sentTo || "yasminesouikiii@gmail.com";

  const handleVerify = async () => {
    if (!code.trim()) { setError("Please enter the security code."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        code: code.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.removeItem("admin_email");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-visual">
          <img src="/1.jpg" alt="Web Portal" />
        </div>

        <div className="auth-form">
          <div className="auth-clock"><Clock /></div>

          <header className="auth-brand">
            <img src="/dxc-logo.png" alt="DXC" className="auth-logo" />
            <span className="auth-brand-name">Tunisia Web Portal</span>
          </header>

          <div className="admin-badge">Security Verification</div>
          <div style={{ marginBottom: "14px" }} />

          <h1 className="auth-title" style={{ fontWeight: 400, fontSize: "22px", letterSpacing: "0.4px" }}>
            Enter your security code
          </h1>

          <p style={{ fontSize: "14px", color: "#555", marginBottom: "24px", lineHeight: "1.5" }}>
            A 6-digit security code was sent to<br />
            <strong style={{ color: "#1a1a1a" }}>{sentTo}</strong>
          </p>

          <div className="field">
            <label>Security code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              placeholder="6-digit code"
              style={{ letterSpacing: "6px", fontSize: "20px", textAlign: "center" }}
              autoFocus
            />
            {error && <p className="auth-error">{error}</p>}
          </div>

          <div className="auth-actions">
            <button className="btn-primary btn-admin" onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Access"}
            </button>
          </div>

          <p className="auth-help">
            <Link to="/admin" className="link-button">← Back to admin login</Link>
          </p>

          <p className="auth-legal">
            <Link to="/terms">Terms of use.</Link>{" "}
            <Link to="/privacy">Privacy policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
