import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/settings.css";
import "../styles/management.css";

const API = "http://localhost:5000/api/management";


const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconUserPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const IconDesk = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const IconDice = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="16" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toast-icon">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconCase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>
  </svg>
);

const ROLE_LABELS = { admin: "Admin", user: "User" };
const FALLBACK_ROLES = ["user", "admin"];

const QUESTION_TYPES = [
  { key: "callQuestions", label: "Call", icon: IconCall },
  { key: "caseQuestions", label: "Case", icon: IconCase },
  { key: "chatQuestions", label: "Chat", icon: IconChat },
];

const EMPTY_QUESTION = { text: "", weight: 1, isEliminator: false };

const EXAMPLE_QUESTIONS = {
  callQuestions: [
    { text: "Did the agent answer the call within the required SLA time?", weight: 3, isEliminator: false },
    { text: "Did the agent correctly understand the customer's problem?", weight: 4, isEliminator: true },
    { text: "Did the agent provide the correct solution or workaround?", weight: 4, isEliminator: false },
    { text: "Did the agent maintain a professional and courteous tone?", weight: 2, isEliminator: false },
    { text: "Did the agent properly document and close the call?", weight: 2, isEliminator: false },
  ],
  caseQuestions: [
    { text: "Was the case updated within the expected timeframe?", weight: 3, isEliminator: false },
    { text: "Did the agent correctly understand the reported issue?", weight: 4, isEliminator: true },
    { text: "Was the correct category/qualification selected?", weight: 3, isEliminator: false },
    { text: "Did the agent provide a clear and complete resolution?", weight: 4, isEliminator: false },
    { text: "Was the case properly documented and closed?", weight: 2, isEliminator: false },
  ],
  chatQuestions: [
    { text: "Did the agent respond within the expected response time?", weight: 3, isEliminator: false },
    { text: "Did the agent correctly understand the customer's request?", weight: 4, isEliminator: true },
    { text: "Did the agent communicate clearly and professionally?", weight: 3, isEliminator: false },
    { text: "Did the agent resolve the issue during the chat?", weight: 4, isEliminator: false },
    { text: "Did the agent close the chat properly (summary/confirmation)?", weight: 2, isEliminator: false },
  ],
};

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

const EMPTY_USER_FORM = {
  fullName: "", email: "", tempPassword: "", role: "",
  phone: "", title: "", assignedProject: "", language: "", manager: "", hrManager: "", address: "",
};
const EMPTY_DESK_FORM = { name: "", acronym: "", languages: [], callQuestions: [], caseQuestions: [], chatQuestions: [] };

export default function Management() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = (user.first_name?.[0] || user.email?.[0] || "A").toUpperCase();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [primaryTab, setPrimaryTab] = useState("user"); // user | desks
  const [deskSubTab, setDeskSubTab] = useState("create"); // create | update

  const [roles, setRoles] = useState([]);
  const [desks, setDesks] = useState([]);
  const [toast, setToast] = useState(null); // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchRoles = () => {
    axios.get(`${API}/roles`, { headers })
      .then(res => setRoles(res.data.roles))
      .catch(() => setRoles(FALLBACK_ROLES.map((name, id) => ({ id, name }))));
  };
  const fetchDesks = () => {
    axios.get(`${API}/desks`, { headers })
      .then(res => setDesks(res.data.desks))
      .catch(() => setDesks([]));
  };

  useEffect(() => { fetchRoles(); fetchDesks(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ══════════ CREATE USER ══════════ */
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const setUF = (key, value) => setUserForm(f => ({ ...f, [key]: value }));

  const handleGeneratePassword = () => {
    setUF("tempPassword", generatePassword());
    setShowPwd(true);
  };

  const submitUser = async () => {
    if (!userForm.fullName || !userForm.email || !userForm.tempPassword || !userForm.role) {
      showToast("error", "Please fill in full name, email, password and role.");
      return;
    }
    setCreatingUser(true);
    try {
      await axios.post(`${API}/users`, userForm, { headers });
      showToast("success", `User "${userForm.fullName}" created successfully.`);
      setUserForm(EMPTY_USER_FORM);
      setShowPwd(false);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  /* ══════════ DESKS ══════════ */
  const [deskForm, setDeskForm] = useState(EMPTY_DESK_FORM);
  const [deskId, setDeskId] = useState(null);
  const [langInput, setLangInput] = useState("");
  const [deskSearch, setDeskSearch] = useState("");
  const [savingDesk, setSavingDesk] = useState(false);
  const [activeQType, setActiveQType] = useState("callQuestions");
  const setDF = (key, value) => setDeskForm(f => ({ ...f, [key]: value }));

  const addLanguage = () => {
    const v = langInput.trim();
    if (!v) return;
    if (deskForm.languages.includes(v)) { setLangInput(""); return; }
    setDF("languages", [...deskForm.languages, v]);
    setLangInput("");
  };
  const removeLanguage = (idx) => setDF("languages", deskForm.languages.filter((_, i) => i !== idx));

  const addQuestion = (key) => setDF(key, [...deskForm[key], { ...EMPTY_QUESTION }]);
  const removeQuestion = (key, idx) => setDF(key, deskForm[key].filter((_, i) => i !== idx));
  const changeQuestionField = (key, idx, field, value) => {
    const list = [...deskForm[key]];
    list[idx] = { ...list[idx], [field]: value };
    setDF(key, list);
  };
  const loadExampleQuestions = (key) => {
    setDF(key, [...deskForm[key], ...EXAMPLE_QUESTIONS[key].map(q => ({ ...q }))]);
  };

  const resetDeskForm = () => {
    setDeskForm(EMPTY_DESK_FORM);
    setDeskId(null);
    setLangInput("");
    setActiveQType("callQuestions");
  };

  const selectDesk = async (id) => {
    try {
      const res = await axios.get(`${API}/desks/${id}`, { headers });
      const d = res.data.desk;
      const parseRaw = (v) => (Array.isArray(v) ? v : (typeof v === "string" ? JSON.parse(v || "[]") : v || []));
      const parse = (v) => parseRaw(v).map(q => (
        typeof q === "string" ? { text: q, weight: 1, isEliminator: false } : q
      ));
      setDeskForm({
        name: d.name || "",
        acronym: d.acronym || "",
        languages: parse(d.languages),
        callQuestions: parse(d.call_questions),
        caseQuestions: parse(d.case_questions),
        chatQuestions: parse(d.chat_questions),
      });
      setDeskId(d.id);
    } catch {
      showToast("error", "Failed to load desk.");
    }
  };

  const submitDesk = async () => {
    if (!deskForm.name || !deskForm.acronym) {
      showToast("error", "Desk name and acronym are required.");
      return;
    }
    setSavingDesk(true);
    const payload = {
      name: deskForm.name,
      acronym: deskForm.acronym,
      languages: deskForm.languages,
      callQuestions: deskForm.callQuestions.filter(q => q.text.trim()),
      caseQuestions: deskForm.caseQuestions.filter(q => q.text.trim()),
      chatQuestions: deskForm.chatQuestions.filter(q => q.text.trim()),
    };
    try {
      if (deskId) {
        await axios.put(`${API}/desks/${deskId}`, payload, { headers });
        showToast("success", `Desk "${deskForm.name}" updated successfully.`);
      } else {
        await axios.post(`${API}/desks`, payload, { headers });
        showToast("success", `Desk "${deskForm.name}" created successfully.`);
      }
      resetDeskForm();
      fetchDesks();
      if (deskId) setDeskSubTab("create");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save desk.");
    } finally {
      setSavingDesk(false);
    }
  };

  const filteredDesks = desks.filter(d =>
    (d.name + d.acronym).toLowerCase().includes(deskSearch.toLowerCase())
  );

  const activeQuestions = deskForm[activeQType];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">Management</span>
          </div>
          <div className="topbar-avatar" onClick={handleLogout} title="Logout">{initial}</div>
        </header>

        <div className="mgmt-page-content">

          {/* Primary tabs */}
          <div className="mgmt-primary-tabs">
            <button
              className={"mgmt-primary-tab" + (primaryTab === "user" ? " active" : "")}
              onClick={() => setPrimaryTab("user")}
            >
              <IconUserPlus /> Create User
            </button>
            <button
              className={"mgmt-primary-tab" + (primaryTab === "desks" ? " active" : "")}
              onClick={() => setPrimaryTab("desks")}
            >
              <IconDesk /> Desks
            </button>
          </div>

          {/* ══════════════ CREATE USER TAB ══════════════ */}
          {primaryTab === "user" && (
            <div className="mgmt-card">
              <h3 className="mgmt-title">Create New User</h3>

              <div className="mgmt-field-row">
                <div className="settings-field">
                  <label>Full Name</label>
                  <input type="text" value={userForm.fullName} onChange={e => setUF("fullName", e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div className="settings-field">
                  <label>Email</label>
                  <input type="email" value={userForm.email} onChange={e => setUF("email", e.target.value)} placeholder="name@dxc.com" />
                </div>
                <div className="settings-field">
                  <label>Role</label>
                  <select value={userForm.role} onChange={e => setUF("role", e.target.value)}>
                    <option value="">Select a role...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{ROLE_LABELS[r.name] || r.name}</option>
                    ))}
                  </select>
                  {userForm.role && (
                    <span className={"role-badge " + userForm.role}>{ROLE_LABELS[userForm.role] || userForm.role}</span>
                  )}
                </div>
              </div>

              <div className="mgmt-field-row">
                <div className="settings-field">
                  <label>Temporary Password</label>
                  <div className="mgmt-password-row">
                    <div className="input-eye-wrap">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={userForm.tempPassword}
                        onChange={e => setUF("tempPassword", e.target.value)}
                        placeholder="Min. 8 characters"
                      />
                      <button className="eye-btn" type="button" onClick={() => setShowPwd(s => !s)}>
                        {showPwd ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    <button className="btn-generate" type="button" title="Generate password" onClick={handleGeneratePassword}>
                      <IconDice />
                    </button>
                  </div>
                </div>
                <div className="settings-field">
                  <label>Phone</label>
                  <input type="text" value={userForm.phone} onChange={e => setUF("phone", e.target.value)} placeholder="Phone number" />
                </div>
                <div className="settings-field">
                  <label>Title</label>
                  <input type="text" value={userForm.title} onChange={e => setUF("title", e.target.value)} placeholder="Job title" />
                </div>
              </div>

              <div className="mgmt-field-row">
                <div className="settings-field">
                  <label>Assigned Project</label>
                  <select value={userForm.assignedProject} onChange={e => setUF("assignedProject", e.target.value)}>
                    <option value="">Select a project...</option>
                    {desks.length > 0
                      ? desks.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                      : ["SLA Monitoring", "Infrastructure", "Cloud Services"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="settings-field">
                  <label>Language</label>
                  <input type="text" value={userForm.language} onChange={e => setUF("language", e.target.value)} placeholder="e.g. French, English" />
                </div>
                <div className="settings-field">
                  <label>Manager</label>
                  <input type="email" value={userForm.manager} onChange={e => setUF("manager", e.target.value)} placeholder="manager@dxc.com" />
                </div>
              </div>

              <div className="mgmt-field-row">
                <div className="settings-field">
                  <label>HR Manager</label>
                  <input type="email" value={userForm.hrManager} onChange={e => setUF("hrManager", e.target.value)} placeholder="hr@dxc.com" />
                </div>
                <div className="settings-field" style={{ gridColumn: "span 2" }}>
                  <label>Address</label>
                  <input type="text" value={userForm.address} onChange={e => setUF("address", e.target.value)} placeholder="Address" />
                </div>
              </div>

              <div className="mgmt-actions">
                <button className="btn-settings-save" onClick={submitUser} disabled={creatingUser}>
                  {creatingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ DESKS TAB ══════════════ */}
          {primaryTab === "desks" && (
            <>
              <div className="mgmt-sub-tabs">
                <button
                  className={"mgmt-sub-tab" + (deskSubTab === "create" ? " active" : "")}
                  onClick={() => { setDeskSubTab("create"); resetDeskForm(); }}
                >
                  Create New Desk
                </button>
                <button
                  className={"mgmt-sub-tab" + (deskSubTab === "update" ? " active" : "")}
                  onClick={() => { setDeskSubTab("update"); resetDeskForm(); }}
                >
                  Update Existing Desk
                </button>
              </div>

              <div className="mgmt-card">
                {deskSubTab === "update" && (
                  <>
                    <div className="mgmt-search">
                      <IconSearch />
                      <input type="text" placeholder="Search desks..." value={deskSearch} onChange={e => setDeskSearch(e.target.value)} />
                    </div>
                    {filteredDesks.length === 0 ? (
                      <p className="mgmt-empty">No desks found. Create one first from the "Create New Desk" tab.</p>
                    ) : (
                      <div className="desk-select-strip">
                        {filteredDesks.map(d => (
                          <div
                            key={d.id}
                            className={"desk-select-card" + (deskId === d.id ? " active" : "")}
                            onClick={() => selectDesk(d.id)}
                          >
                            <div className="desk-select-avatar">{(d.acronym || d.name).slice(0, 2).toUpperCase()}</div>
                            <div>
                              <div className="desk-select-name">{d.name}</div>
                              <div className="desk-select-meta">{d.acronym}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {(deskSubTab === "create" || (deskSubTab === "update" && deskId)) && (
                  <>
                    <div className="desk-top-row">
                      <div className="settings-field">
                        <label>Desk Name</label>
                        <input type="text" value={deskForm.name} onChange={e => setDF("name", e.target.value)} placeholder="Enter desk name" />
                      </div>
                      <div className="settings-field">
                        <label>Desk Acronym</label>
                        <input type="text" value={deskForm.acronym} onChange={e => setDF("acronym", e.target.value)} placeholder="e.g. rn for Renault" />
                      </div>
                      <div className="settings-field">
                        <label>Desk Languages</label>
                        <div className="lang-input-row">
                          <input
                            type="text"
                            value={langInput}
                            onChange={e => setLangInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLanguage(); } }}
                            placeholder="e.g. English"
                          />
                          <button className="btn-add-lang" onClick={addLanguage}><IconPlus /> Add</button>
                        </div>
                        {deskForm.languages.length > 0 && (
                          <div className="lang-chips">
                            {deskForm.languages.map((l, idx) => (
                              <span className="lang-chip" key={idx}>
                                {l}
                                <button onClick={() => removeLanguage(idx)}>&times;</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="question-type-tabs">
                      {QUESTION_TYPES.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          className={"question-type-tab" + (activeQType === key ? " active" : "")}
                          onClick={() => setActiveQType(key)}
                        >
                          <Icon /> {label} Questions
                          <span className="question-type-count">{deskForm[key].length}</span>
                        </button>
                      ))}
                    </div>

                    <div className="question-panel">
                      <div className="question-list-scroll">
                        {activeQuestions.length === 0 ? (
                          <p className="question-list-empty">No questions yet — add one below or load examples.</p>
                        ) : (
                          activeQuestions.map((q, idx) => (
                            <div className={"question-row" + (q.isEliminator ? " eliminator" : "")} key={idx}>
                              <span className="question-number">{idx + 1}</span>
                              <input
                                className="question-weight-input"
                                type="number"
                                min="1"
                                title="Weight (COF)"
                                value={q.weight}
                                onChange={e => changeQuestionField(activeQType, idx, "weight", Math.max(1, Number(e.target.value) || 1))}
                              />
                              <input
                                type="text"
                                value={q.text}
                                placeholder={`Question ${idx + 1}...`}
                                onChange={e => changeQuestionField(activeQType, idx, "text", e.target.value)}
                              />
                              <label className="question-eliminator-toggle" title="Mark as eliminatory question">
                                <input
                                  type="checkbox"
                                  checked={q.isEliminator}
                                  onChange={e => changeQuestionField(activeQType, idx, "isEliminator", e.target.checked)}
                                />
                                Eliminator
                              </label>
                              <button className="btn-remove-question" onClick={() => removeQuestion(activeQType, idx)} title="Remove question">
                                <IconTrash />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="question-panel-actions">
                        <button className="btn-add-question" onClick={() => addQuestion(activeQType)}>
                          <IconPlus /> Add Question
                        </button>
                        <button className="btn-load-examples" onClick={() => loadExampleQuestions(activeQType)}>
                          Load Example Questions
                        </button>
                      </div>
                    </div>

                    <div className="mgmt-actions">
                      {deskSubTab === "update" && (
                        <button className="btn-settings-outline" style={{ marginRight: 10 }} onClick={resetDeskForm}>
                          Cancel
                        </button>
                      )}
                      <button className="btn-settings-save" onClick={submitDesk} disabled={savingDesk}>
                        {savingDesk ? "Saving..." : deskSubTab === "update" ? "Update Desk" : "Create Desk"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {toast && (
        <div className={"mgmt-toast " + toast.type}>
          {toast.type === "success" ? <IconCheck /> : <IconAlert />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
