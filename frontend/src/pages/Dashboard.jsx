import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  StatCard, Donut, TrendChart, GroupRow,
  IconPhone, IconPhoneOff, IconTrophy, IconTrendUp, IconZap, IconGauge, IconClock,
} from "../components/DashboardWidgets";
import { formatDuration, formatNumber, pctSafe } from "../utils/dashboardFormat";
import "../styles/dashboard.css";
import "../styles/settings.css";
import "../styles/management.css";
import "../styles/rate-user.css";
import "../styles/dashboard-analytics.css";

const API = "http://localhost:5000/api/dashboard";

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconUpload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
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

function ManageQueuesModal({ headers, onClose, showToast, refreshAll }) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQueue, setNewQueue] = useState({ name: "", clientGroup: "", targetPercentage: 90 });
  const [savingId, setSavingId] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchQueues = useCallback(() => {
    axios.get(`${API}/queues`, { headers })
      .then(res => setQueues(res.data.queues))
      .catch(() => setQueues([]))
      .finally(() => setLoading(false));
  }, [headers]);
  useEffect(() => { fetchQueues(); }, [fetchQueues]);

  const updateLocal = (id, field, value) => {
    setQueues(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const saveQueue = async (q) => {
    setSavingId(q.id);
    try {
      await axios.put(`${API}/queues/${q.id}`, { clientGroup: q.client_group, targetPercentage: q.target_percentage }, { headers });
      showToast("success", `"${q.name}" updated.`);
      refreshAll();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update queue.");
    } finally {
      setSavingId(null);
    }
  };

  const addQueue = async () => {
    if (!newQueue.name.trim()) { showToast("error", "Queue name is required."); return; }
    try {
      await axios.post(`${API}/queues`, newQueue, { headers });
      showToast("success", `Queue "${newQueue.name}" added.`);
      setNewQueue({ name: "", clientGroup: "", targetPercentage: 90 });
      fetchQueues();
      refreshAll();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to add queue.");
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/import`, formData, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      showToast("success", res.data.message);
      fetchQueues();
      refreshAll();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Import failed.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="dash-modal-backdrop" onClick={onClose}>
      <div className="dash-modal" onClick={e => e.stopPropagation()}>
        <header className="dash-modal-header">
          <h2>Manage Queues &amp; Import Data</h2>
          <button className="dash-modal-close" onClick={onClose}><IconX /></button>
        </header>

        <div className="dash-modal-body">
          <div className="import-box">
            <div>
              <strong>Import a historical metrics file</strong>
              <p>CSV or XLSX with the usual Queue/StartInterval columns. Feeds the Historical tab directly.</p>
            </div>
            <label className={"btn-import" + (importing ? " disabled" : "")}>
              <IconUpload /> {importing ? "Importing..." : "Choose File"}
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} disabled={importing} style={{ display: "none" }} />
            </label>
          </div>

          <h3 className="dash-modal-subtitle">Add a Queue</h3>
          <div className="add-queue-row">
            <input type="text" placeholder="Queue name" value={newQueue.name} onChange={e => setNewQueue({ ...newQueue, name: e.target.value })} />
            <input type="text" placeholder="Client group" value={newQueue.clientGroup} onChange={e => setNewQueue({ ...newQueue, clientGroup: e.target.value })} />
            <input type="number" min="0" max="100" placeholder="Target %" value={newQueue.targetPercentage} onChange={e => setNewQueue({ ...newQueue, targetPercentage: e.target.value })} />
            <button className="btn-add-question" onClick={addQueue}><IconPlus /> Add</button>
          </div>

          <h3 className="dash-modal-subtitle">All Queues ({queues.length})</h3>
          {loading ? (
            <p className="mgmt-empty">Loading...</p>
          ) : (
            <div className="queues-table-scroll">
              <table className="queues-table">
                <thead>
                  <tr><th>Queue</th><th>Client Group</th><th>Target %</th><th></th></tr>
                </thead>
                <tbody>
                  {queues.map(q => (
                    <tr key={q.id}>
                      <td>{q.name}</td>
                      <td><input type="text" value={q.client_group} onChange={e => updateLocal(q.id, "client_group", e.target.value)} /></td>
                      <td><input type="number" min="0" max="100" value={q.target_percentage} onChange={e => updateLocal(q.id, "target_percentage", e.target.value)} /></td>
                      <td>
                        <button className="btn-settings-outline" disabled={savingId === q.id} onClick={() => saveQueue(q)}>
                          {savingId === q.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddEventModal({ headers, queues, onClose, showToast, refreshAll }) {
  const [form, setForm] = useState({ queueId: "", type: "handled", handleTimeSeconds: "", holdTimeSeconds: "", queueAnswerTimeSeconds: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.queueId) { showToast("error", "Please select a queue."); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/realtime/events`, {
        queueId: form.queueId,
        type: form.type,
        handleTimeSeconds: form.handleTimeSeconds ? Number(form.handleTimeSeconds) : null,
        holdTimeSeconds: form.holdTimeSeconds ? Number(form.holdTimeSeconds) : null,
        queueAnswerTimeSeconds: form.queueAnswerTimeSeconds ? Number(form.queueAnswerTimeSeconds) : null,
      }, { headers });
      showToast("success", "Interaction recorded.");
      refreshAll();
      onClose();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to record interaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash-modal-backdrop" onClick={onClose}>
      <div className="dash-modal dash-modal-sm" onClick={e => e.stopPropagation()}>
        <header className="dash-modal-header">
          <h2>Add Real-Time Interaction</h2>
          <button className="dash-modal-close" onClick={onClose}><IconX /></button>
        </header>
        <div className="dash-modal-body">
          <div className="settings-field">
            <label>Queue</label>
            <select value={form.queueId} onChange={e => setForm({ ...form, queueId: e.target.value })}>
              <option value="">Select a queue...</option>
              {queues.map(q => <option key={q.id} value={q.id}>{q.client_group} — {q.name}</option>)}
            </select>
          </div>
          <div className="settings-field">
            <label>Outcome</label>
            <div className="rate-answer-toggle" style={{ width: "100%" }}>
              <button className={"rate-answer-btn yes" + (form.type === "handled" ? " active" : "")} style={{ flex: 1 }} onClick={() => setForm({ ...form, type: "handled" })}>Handled</button>
              <button className={"rate-answer-btn no" + (form.type === "abandoned" ? " active" : "")} style={{ flex: 1 }} onClick={() => setForm({ ...form, type: "abandoned" })}>Abandoned</button>
            </div>
          </div>
          <div className="mgmt-field-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 0 }}>
            <div className="settings-field">
              <label>Answer time (s)</label>
              <input type="number" min="0" value={form.queueAnswerTimeSeconds} onChange={e => setForm({ ...form, queueAnswerTimeSeconds: e.target.value })} placeholder="e.g. 12" />
            </div>
            <div className="settings-field">
              <label>Handle time (s)</label>
              <input type="number" min="0" value={form.handleTimeSeconds} onChange={e => setForm({ ...form, handleTimeSeconds: e.target.value })} placeholder="e.g. 240" />
            </div>
            <div className="settings-field">
              <label>Hold time (s)</label>
              <input type="number" min="0" value={form.holdTimeSeconds} onChange={e => setForm({ ...form, holdTimeSeconds: e.target.value })} placeholder="e.g. 30" />
            </div>
          </div>
          <div className="mgmt-actions" style={{ borderTop: "none", marginTop: 14 }}>
            <button className="btn-settings-save" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Add Interaction"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = (user.first_name?.[0] || user.email?.[0] || "A").toUpperCase();
  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [tab, setTab] = useState("historical");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState([]);
  const [showManage, setShowManage] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOverview = useCallback(() => {
    axios.get(`${API}/${tab}/overview`, { headers })
      .then(res => setOverview(res.data))
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, [tab, headers]);

  const fetchQueuesList = useCallback(() => {
    axios.get(`${API}/queues`, { headers }).then(res => setQueues(res.data.queues)).catch(() => setQueues([]));
  }, [headers]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { fetchQueuesList(); }, [fetchQueuesList]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const resetRealtime = async () => {
    try {
      await axios.post(`${API}/realtime/reset`, {}, { headers });
      showToast("success", "Real-time counters reset.");
      fetchOverview();
    } catch {
      showToast("error", "Failed to reset counters.");
    }
  };

  const s = overview?.summary;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">SLA Dashboard</span>
          </div>
          <div className="topbar-avatar" onClick={handleLogout} title="Logout">{initial}</div>
        </header>

        <div className="analytics-page-content">
          <div className="analytics-toolbar">
            <div className="mgmt-primary-tabs analytics-tabs">
              <button className={"mgmt-primary-tab" + (tab === "historical" ? " active" : "")} onClick={() => setTab("historical")}>Historical</button>
              <button className={"mgmt-primary-tab" + (tab === "realtime" ? " active" : "")} onClick={() => setTab("realtime")}>Real Time</button>
            </div>
            <div className="analytics-toolbar-actions">
              {tab === "realtime" && (
                <>
                  <button className="btn-settings-outline" onClick={resetRealtime}>Reset</button>
                  <button className="btn-settings-save" onClick={() => setShowAddEvent(true)}><IconPlus /> Add Interaction</button>
                </>
              )}
              <button className="btn-manage-queues" onClick={() => setShowManage(true)}>
                <IconSettings /> Manage Queues &amp; Import Data
              </button>
            </div>
          </div>

          {loading || !s ? (
            <p className="mgmt-empty">Loading dashboard...</p>
          ) : (
            <>
              <div className="stat-cards-grid">
                <StatCard icon={<IconPhone />} label="Total Handled" value={formatNumber(s.totalHandled)} sub={`of ${formatNumber(s.totalOffered)} offered`} />
                <StatCard icon={<IconPhoneOff />} label="Total Abandoned" value={formatNumber(s.totalAbandoned)} sub={`${pctSafe(s.totalAbandoned, s.totalOffered)}% of offered`} />
                <StatCard icon={<IconTrophy />} label="Best Answer Rate" value={`${s.bestAnswerRate.value}%`} sub={s.bestAnswerRate.label} />
                <StatCard icon={<IconTrendUp />} label="Highest Volume" value={formatNumber(s.highestVolume.value)} sub={s.highestVolume.label} />
                <StatCard icon={<IconZap />} label="Fastest Response" value={formatDuration(s.fastestResponse.value)} sub={s.fastestResponse.label} />
                <StatCard icon={<IconGauge />} label="Best Efficiency" value={formatDuration(s.bestEfficiency.value)} sub={s.bestEfficiency.label} />
                <StatCard icon={<IconClock />} label="Shortest Hold" value={formatDuration(s.shortestHold.value)} sub={s.shortestHold.label} />
              </div>

              <div className="charts-row">
                <Donut title="Handled vs Abandoned" data={overview.donuts.handledVsAbandoned} total={s.totalOffered} />
                <Donut title="Volume by Desk" data={overview.donuts.volumeByGroup} total={s.totalOffered} />
                {tab === "historical" && <TrendChart data={overview.trend} />}
              </div>

              <div className="groups-section">
                {overview.groups.length === 0 ? (
                  <p className="mgmt-empty">No queues yet — add one from "Manage Queues &amp; Import Data".</p>
                ) : (
                  overview.groups.map(g => <GroupRow key={g.group} group={g} />)
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showManage && (
        <ManageQueuesModal headers={headers} onClose={() => setShowManage(false)} showToast={showToast} refreshAll={() => { fetchOverview(); fetchQueuesList(); }} />
      )}
      {showAddEvent && (
        <AddEventModal headers={headers} queues={queues} onClose={() => setShowAddEvent(false)} showToast={showToast} refreshAll={fetchOverview} />
      )}

      {toast && (
        <div className={"mgmt-toast " + toast.type}>
          {toast.type === "success" ? <IconCheck /> : <IconAlert />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
