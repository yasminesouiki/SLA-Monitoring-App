import { useState, useEffect } from "react";

export default function RegisterModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    id: "",
  });

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
    // TODO: brancher sur ton API Node/Express : POST /api/auth/register
    // await axios.post("/api/auth/register", form);
    console.log("Register:", form);
    onClose();
  };

  return (
    // Le backdrop grise l'arrière-plan ; clic dessus = fermer
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

          <button className="btn-register" onClick={handleRegister}>
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