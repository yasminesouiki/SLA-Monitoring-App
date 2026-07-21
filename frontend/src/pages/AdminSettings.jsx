import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/settings.css";

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconCamera = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const TABS = [
  { id: "account",      label: "Account",       icon: <IconUser /> },
  { id: "personal",     label: "Personal Info",  icon: <IconInfo /> },
  { id: "professional", label: "Professional",   icon: <IconBriefcase /> },
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = (user.first_name?.[0] || user.email?.[0] || "A").toUpperCase();
  const fullName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email?.split("@")[0] || "Admin";

  const [activeTab, setActiveTab] = useState("account");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Account tab state
  const [accountForm, setAccountForm] = useState({ firstName: user.first_name || "", lastName: user.last_name || "" });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPwd: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  // Personal tab state
  const [personalForm, setPersonalForm] = useState({
    nationalId: "", phone: "", address: "", governorate: "",
    maritalStatus: "", children: "", language: "",
  });

  // Professional tab state
  const [proForm, setProForm] = useState({
    title: "", assignedProject: "", diplomas: "",
    certifications: "", skills: "", proLanguage: "", manager: "", hrManager: "",
  });

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Charger le profil complet au montage
  useState(() => {
    axios.get("http://localhost:5000/api/auth/profile", { headers })
      .then(res => {
        const u = res.data.user;
        setAccountForm({ firstName: u.first_name || "", lastName: u.last_name || "" });
        setPersonalForm({
          nationalId:    u.national_id     || "",
          phone:         u.phone           || "",
          address:       u.address         || "",
          governorate:   u.governorate     || "",
          maritalStatus: u.marital_status  || "",
          children:      u.children        ?? "",
          language:      u.language        || "",
        });
        setProForm({
          title:          u.title           || "",
          assignedProject:u.assigned_project|| "",
          diplomas:       u.diplomas        || "",
          certifications: u.certifications  || "",
          skills:         u.skills          || "",
          proLanguage:    u.language        || "",
          manager:        u.manager         || "",
          hrManager:      u.hr_manager      || "",
        });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const showSaved = () => {
    setSaved(true);
    setSaveError("");
    setTimeout(() => setSaved(false), 2500);
  };

  const saveAccount = async () => {
    try {
      await axios.put("http://localhost:5000/api/auth/profile/account",
        { first_name: accountForm.firstName, last_name: accountForm.lastName },
        { headers }
      );
      navigate("/dashboard");
    } catch { setSaveError("Failed to save."); }
  };

  const savePersonal = async () => {
    try {
      await axios.put("http://localhost:5000/api/auth/profile/personal", {
        first_name:     accountForm.firstName,
        last_name:      accountForm.lastName,
        national_id:    personalForm.nationalId,
        phone:          personalForm.phone,
        address:        personalForm.address,
        governorate:    personalForm.governorate,
        marital_status: personalForm.maritalStatus,
        children:       personalForm.children,
        language:       personalForm.language,
      }, { headers });
      navigate("/dashboard");
    } catch { setSaveError("Failed to save."); }
  };

  const saveProfessional = async () => {
    try {
      await axios.put("http://localhost:5000/api/auth/profile/professional", {
        title:           proForm.title,
        assigned_project:proForm.assignedProject,
        diplomas:        proForm.diplomas,
        certifications:  proForm.certifications,
        skills:          proForm.skills,
        language:        proForm.proLanguage,
        manager:         proForm.manager,
        hr_manager:      proForm.hrManager,
      }, { headers });
      navigate("/dashboard");
    } catch { setSaveError("Failed to save."); }
  };

  const handlePasswordChange = async () => {
    setPwdError(""); setPwdSuccess("");
    if (!passwords.current) { setPwdError("Enter your current password."); return; }
    if (passwords.newPwd.length < 6) { setPwdError("New password must be at least 6 characters."); return; }
    if (passwords.newPwd !== passwords.confirm) { setPwdError("Passwords do not match."); return; }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/auth/change-password",
        { currentPassword: passwords.current, newPassword: passwords.newPwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwdSuccess("Password updated successfully.");
      setPasswords({ current: "", newPwd: "", confirm: "" });
      setShowPasswordSection(false);
    } catch (err) {
      setPwdError(err.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">Settings</span>
          </div>
          <div className="topbar-avatar" onClick={handleLogout} title="Logout">{initial}</div>
        </header>

        <div className="page-content">

          {/* Profile banner */}
          <div className="settings-banner">
            <div className="settings-avatar-wrap">
              <div className="settings-avatar">{initial}</div>
              <label className="settings-avatar-btn" title="Change photo">
                <IconCamera /> Change photo
                <input type="file" accept="image/*" style={{ display: "none" }} />
              </label>
            </div>
            <div className="settings-banner-info">
              <h2 className="settings-banner-name">{fullName}</h2>
              <p className="settings-banner-email">{user.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="settings-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={"settings-tab" + (activeTab === t.id ? " active" : "")}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── ACCOUNT TAB ── */}
          {activeTab === "account" && (
            <div className="settings-card">
              <h3 className="settings-section-title">Account Information</h3>

              <div className="settings-field-row">
                <div className="settings-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={accountForm.firstName}
                    onChange={e => setAccountForm({ ...accountForm, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div className="settings-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={accountForm.lastName}
                    onChange={e => setAccountForm({ ...accountForm, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field" style={{gridColumn:"span 2"}}>
                  <label>Email</label>
                  <input type="email" value={user.email} disabled className="disabled" />
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-password-header">
                <div>
                  <h4 className="settings-section-subtitle">Password</h4>
                  <p className="settings-section-hint">Update your account password</p>
                </div>
                <button
                  className={"btn-settings-outline" + (showPasswordSection ? " active" : "")}
                  onClick={() => { setShowPasswordSection(!showPasswordSection); setPwdError(""); setPwdSuccess(""); }}
                >
                  <IconLock /> {showPasswordSection ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showPasswordSection && (
                <div className="settings-password-section">
                  {[
                    { key: "current", label: "Current Password", placeholder: "Enter current password" },
                    { key: "newPwd", label: "New Password",      placeholder: "At least 6 characters" },
                    { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                  ].map(({ key, label, placeholder }) => (
                    <div className="settings-field" key={key}>
                      <label>{label}</label>
                      <div className="input-eye-wrap">
                        <input
                          type={showPwd[key] ? "text" : "password"}
                          value={passwords[key]}
                          onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                          placeholder={placeholder}
                        />
                        <button className="eye-btn" type="button" onClick={() => setShowPwd(s => ({ ...s, [key]: !s[key] }))}>
                          {showPwd[key] ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwdError   && <p className="settings-error">{pwdError}</p>}
                  {pwdSuccess && <p className="settings-success">{pwdSuccess}</p>}
                  <button className="btn-settings-save" onClick={handlePasswordChange}>Update Password</button>
                </div>
              )}

              {saveError && <p className="settings-error">{saveError}</p>}
              <div className="settings-actions">
                <button className="btn-settings-save" onClick={saveAccount}>
                  {saved ? "✓ Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── PERSONAL INFO TAB ── */}
          {activeTab === "personal" && (
            <div className="settings-card">
              <h3 className="settings-section-title">Personal Information</h3>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>National ID</label>
                  <input type="text" value={personalForm.nationalId} onChange={e => setPersonalForm({...personalForm, nationalId: e.target.value})} placeholder="National ID" />
                </div>
                <div className="settings-field">
                  <label>Phone</label>
                  <input type="text" value={personalForm.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} placeholder="Phone number" />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Address</label>
                  <input type="text" value={personalForm.address} onChange={e => setPersonalForm({...personalForm, address: e.target.value})} placeholder="Address" />
                </div>
                <div className="settings-field">
                  <label>Governorate</label>
                  <input type="text" value={personalForm.governorate} onChange={e => setPersonalForm({...personalForm, governorate: e.target.value})} placeholder="Governorate" />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Marital Status</label>
                  <select value={personalForm.maritalStatus} onChange={e => setPersonalForm({...personalForm, maritalStatus: e.target.value})}>
                    <option value="">Select...</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Number of Children</label>
                  <input type="number" min="0" value={personalForm.children} onChange={e => setPersonalForm({...personalForm, children: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field" style={{ gridColumn: "span 2" }}>
                  <label>Language(s)</label>
                  <input type="text" value={personalForm.language} onChange={e => setPersonalForm({...personalForm, language: e.target.value})} placeholder="e.g. French, Arabic, English" />
                </div>
              </div>
              {saveError && <p className="settings-error">{saveError}</p>}
              <div className="settings-actions">
                <button className="btn-settings-save" onClick={savePersonal}>{saved ? "✓ Saved!" : "Save Changes"}</button>
              </div>
            </div>
          )}

          {/* ── PROFESSIONAL TAB ── */}
          {activeTab === "professional" && (
            <div className="settings-card">
              <h3 className="settings-section-title">Professional Information</h3>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Title</label>
                  <input type="text" value={proForm.title} onChange={e => setProForm({...proForm, title: e.target.value})} placeholder="Job title" />
                </div>
                <div className="settings-field">
                  <label>Assigned Project</label>
                  <select value={proForm.assignedProject} onChange={e => setProForm({...proForm, assignedProject: e.target.value})}>
                    <option value="">Select a project...</option>
                    <option>SLA Monitoring</option>
                    <option>Infrastructure</option>
                    <option>Cloud Services</option>
                  </select>
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Diplomas</label>
                  <textarea value={proForm.diplomas} onChange={e => setProForm({...proForm, diplomas: e.target.value})} placeholder="Your diplomas..." rows={3} />
                </div>
                <div className="settings-field">
                  <label>Certifications</label>
                  <textarea value={proForm.certifications} onChange={e => setProForm({...proForm, certifications: e.target.value})} placeholder="Your certifications..." rows={3} />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Skills</label>
                  <textarea value={proForm.skills} onChange={e => setProForm({...proForm, skills: e.target.value})} placeholder="Your skills..." rows={3} />
                </div>
                <div className="settings-field">
                  <label>Language</label>
                  <textarea value={proForm.language} onChange={e => setProForm({...proForm, language: e.target.value})} placeholder="Languages spoken..." rows={3} />
                </div>
              </div>
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Manager</label>
                  <input type="email" value={proForm.manager} onChange={e => setProForm({...proForm, manager: e.target.value})} placeholder="manager@dxc.com" />
                </div>
                <div className="settings-field">
                  <label>HR Manager</label>
                  <input type="email" value={proForm.hrManager} onChange={e => setProForm({...proForm, hrManager: e.target.value})} placeholder="hr@dxc.com" />
                </div>
              </div>
              {saveError && <p className="settings-error">{saveError}</p>}
              <div className="settings-actions">
                <button className="btn-settings-save" onClick={saveProfessional}>{saved ? "✓ Saved!" : "Save Changes"}</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
