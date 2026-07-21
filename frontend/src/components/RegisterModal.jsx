import { useState, useEffect } from "react";

export default function RegisterModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fermer avec la touche Échap
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          id: form.id,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess(data.message || "Account created. Please wait for admin approval.");
      setForm({ firstName: "", lastName: "", email: "", id: "", password: "", confirm: "" });
      setTimeout(() => { setSuccess(""); onClose(); }, 3000);
    } catch {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation : un clic dans la modal ne la ferme pas */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Account Creation</h2>
          <button className="modal-close-x" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </header>

        <div className="modal-body">
          <div className="modal-field">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter FirstName"
            />
          </div>

          <div className="modal-field">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter LastName"
            />
          </div>

          <div className="modal-field">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="modal-field">
            <label>ID:</label>
            <input
              type="text"
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="Enter ID"
            />
          </div>

          <div className="modal-field">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="new-password"
            />
          </div>

          <div className="modal-field">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="modal-error">{error}</p>}
          {success && <p className="modal-success">{success}</p>}

          <button className="btn-register" onClick={handleRegister} disabled={!!success}>
            Register
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