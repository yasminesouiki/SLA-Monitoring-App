import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/management.css";
import "../styles/approvals.css";

const API = "http://localhost:5000/api/management";

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
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
const IconCheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function UserApprovals() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = (user.first_name?.[0] || user.email?.[0] || "A").toUpperCase();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState("pending");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchUsers = () => {
    setLoading(true);
    axios.get(`${API}/approvals`, { headers, params: { status: tab } })
      .then(res => setUsers(res.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [tab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const act = async (id, action) => {
    setBusyId(id);
    try {
      await axios.put(`${API}/approvals/${id}/${action}`, {}, { headers });
      showToast("success", `User ${action === "approve" ? "approved" : "rejected"} successfully.`);
      setUsers(u => u.filter(x => x.id !== id));
    } catch (err) {
      showToast("error", err.response?.data?.message || `Failed to ${action} user.`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">User Approvals</span>
          </div>
          <div className="topbar-avatar" onClick={handleLogout} title="Logout">{initial}</div>
        </header>

        <div className="mgmt-page-content">
          <div className="mgmt-sub-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={"mgmt-sub-tab" + (tab === t.key ? " active" : "")}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mgmt-card">
            {loading ? (
              <p className="mgmt-empty">Loading...</p>
            ) : users.length === 0 ? (
              <p className="mgmt-empty">No {tab} accounts.</p>
            ) : (
              <div className="approvals-list">
                {users.map(u => (
                  <div className="approvals-row" key={u.id}>
                    <div className="approvals-avatar">{(u.first_name?.[0] || "U").toUpperCase()}</div>
                    <div className="approvals-info">
                      <div className="approvals-name">{u.first_name} {u.last_name}</div>
                      <div className="approvals-meta">
                        {u.email}{u.employee_id ? ` · ${u.employee_id}` : ""}{u.role ? ` · ${u.role}` : ""}
                      </div>
                      {(u.title || u.assigned_project) && (
                        <div className="approvals-meta-secondary">
                          {u.title || ""}{u.title && u.assigned_project ? " — " : ""}{u.assigned_project || ""}
                        </div>
                      )}
                    </div>
                    <div className="approvals-date">
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                    {tab === "pending" ? (
                      <div className="approvals-actions">
                        <button
                          className="btn-approve"
                          disabled={busyId === u.id}
                          onClick={() => act(u.id, "approve")}
                        >
                          <IconCheckCircle /> Approve
                        </button>
                        <button
                          className="btn-reject"
                          disabled={busyId === u.id}
                          onClick={() => act(u.id, "reject")}
                        >
                          <IconX /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className={"approvals-status-badge " + tab}>{tab}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
