import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserSidebar from "../components/UserSidebar";
import "../styles/dashboard.css";
import "../styles/settings.css";

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const API = "http://localhost:5000/api/auth";

export default function UserHome() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [profile, setProfile] = useState(stored);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API}/profile`, { headers })
      .then(res => setProfile(res.data.user))
      .catch(() => {});
  }, [headers]);

  const startEdit = () => {
    setForm({
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      nationalId: profile.national_id || "",
      phone: profile.phone || "",
      address: profile.address || "",
      governorate: profile.governorate || "",
      maritalStatus: profile.marital_status || "",
      children: profile.children ?? "",
      language: profile.language || "",
    });
    setSaveError("");
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await axios.put(`${API}/profile/personal`, {
        first_name: form.firstName,
        last_name: form.lastName,
        national_id: form.nationalId,
        phone: form.phone,
        address: form.address,
        governorate: form.governorate,
        marital_status: form.maritalStatus,
        children: form.children,
        language: form.language,
      }, { headers });
      const res = await axios.get(`${API}/profile`, { headers });
      setProfile(res.data.user);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, first_name: form.firstName, last_name: form.lastName }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const user = profile;
  const initial = (user.first_name?.[0] || user.email?.[0] || "U").toUpperCase();
  const fullName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email?.split("@")[0] || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <UserSidebar />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">My Information</span>
          </div>
          <div className="topbar-avatar" title="Logout" onClick={handleLogout}>
            {initial}
          </div>
        </header>

        <div className="page-content">

          <div className="profile-header-card">
            <div className="profile-avatar-placeholder">{initial}</div>

            <div className="profile-header-info">
              <div className="profile-name">{fullName}</div>
              <div className="profile-email">{user.email}</div>
              <span className="profile-badge">
                <IconShield />
                {user.role || "User"}
              </span>
            </div>

            {!editing && (
              <button className="btn-update" onClick={startEdit}>
                <IconEdit /> Update Information
              </button>
            )}
          </div>

          {editing ? (
            <div className="settings-card">
              <h3 className="settings-section-title">Edit My Information</h3>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>First Name</label>
                  <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="settings-field">
                  <label>Last Name</label>
                  <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>National ID</label>
                  <input type="text" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} />
                </div>
                <div className="settings-field">
                  <label>Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Address</label>
                  <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="settings-field">
                  <label>Governorate</label>
                  <input type="text" value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Marital Status</label>
                  <select value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Number of Children</label>
                  <input type="number" min="0" value={form.children} onChange={e => setForm({ ...form, children: e.target.value })} />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field" style={{ gridColumn: "span 2" }}>
                  <label>Language(s)</label>
                  <input type="text" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} placeholder="e.g. French, Arabic, English" />
                </div>
              </div>
              {saveError && <p className="settings-error">{saveError}</p>}
              <div className="settings-actions">
                <button className="btn-settings-outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                <button className="btn-settings-save" onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          ) : (
            <div className="profile-cards">
              {saved && <p className="settings-success" style={{ gridColumn: "1 / -1" }}>Information updated.</p>}

              <div className="info-card">
                <div className="info-card-title">
                  <IconPerson /> Personal Information
                </div>
                <div className="info-grid">
                  {[
                    { label: "National ID",       val: user.national_id },
                    { label: "Phone",              val: user.phone },
                    { label: "Address",            val: user.address },
                    { label: "Governorate",        val: user.governorate },
                    { label: "Marital Status",     val: user.marital_status },
                    { label: "Number of Children", val: user.children },
                    { label: "Role",               val: user.role },
                    { label: "Language",           val: user.language },
                  ].map(({ label, val }) => (
                    <div className="info-field" key={label}>
                      <div className="info-field-label">{label}</div>
                      <div className={"info-field-value" + (!val && val !== 0 ? " empty" : "")}>
                        {val ?? "Not provided"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-title">
                  <IconBriefcase /> Professional Information
                </div>
                <div className="info-grid">
                  {[
                    { label: "Title",            val: user.title },
                    { label: "Assigned Project", val: user.assigned_project },
                    { label: "Diplomas",         val: user.diplomas },
                    { label: "Certifications",   val: user.certifications },
                    { label: "Skills",           val: user.skills },
                    { label: "Manager",          val: user.manager },
                    { label: "HR Manager",       val: user.hr_manager },
                  ].map(({ label, val }) => (
                    <div className="info-field" key={label}>
                      <div className="info-field-label">{label}</div>
                      <div className={"info-field-value" + (!val ? " empty" : "")}>
                        {val || "Not provided"}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="settings-section-hint" style={{ marginTop: 10 }}>
                  Professional details are managed by your administrator.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
