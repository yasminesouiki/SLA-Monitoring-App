import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminLoginModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ email: "", password: "", token: "", remember: false });
  const [tokenStatus, setTokenStatus] = useState("Revoked");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGenerateToken = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/generate-token", {
        email: form.email,
      });
      setForm((prev) => ({ ...prev, token: res.data.token }));
      setTokenStatus("Valid");
    } catch {
      setTokenStatus("Revoked");
    }
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required.";
    if (!form.password) newErrors.password = "Password is required.";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      const user = res.data.user;
      if (user.role !== "admin") {
        setErrors({ general: "Access denied. Admin privileges required." });
        return;
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (msg.toLowerCase().includes("email") || err.response?.status === 404) {
        setErrors({ email: "No account found with this email." });
      } else {
        setErrors({ password: "Incorrect password." });
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal admin-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Admin Access</h2>
          <button className="modal-close-x" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </header>

        <div className="modal-body">
          <div className="modal-field">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="email"
            />
            {errors.email && <p className="modal-error">{errors.email}</p>}
          </div>

          <div className="modal-field">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            {errors.password && <p className="modal-error">{errors.password}</p>}
          </div>

          <div className="modal-field">
            <label>
              Token: <span className="token-status">({tokenStatus})</span>
            </label>
            <input
              type="text"
              name="token"
              value={form.token}
              onChange={handleChange}
              placeholder="Enter Token"
            />
          </div>

          <button className="link-button token-generate" onClick={handleGenerateToken}>
            Generate Token
          </button>

          <label className="checkbox" style={{ marginTop: "16px" }}>
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            Remember me
          </label>

          {errors.general && <p className="modal-error">{errors.general}</p>}

          <button className="btn-register" onClick={handleLogin}>
            Login
          </button>
        </div>

        <footer className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
