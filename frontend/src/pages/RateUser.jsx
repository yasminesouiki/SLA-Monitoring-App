import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/settings.css";
import "../styles/rate-user.css";

const RATINGS_API = "http://localhost:5000/api/ratings";
const MGMT_API = "http://localhost:5000/api/management";

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
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

const CHANNELS = [
  { key: "call", label: "Call" },
  { key: "case", label: "Case" },
  { key: "chat", label: "Chat" },
];

function scoreClass(score) {
  if (score >= 80) return "score-good";
  if (score >= 50) return "score-mid";
  return "score-bad";
}

export default function RateUser() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = (user.first_name?.[0] || user.email?.[0] || "A").toUpperCase();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ══════════ Desks & channel ══════════ */
  const [desks, setDesks] = useState([]);
  const [deskId, setDeskId] = useState("");
  const [channel, setChannel] = useState("call");

  useEffect(() => {
    axios.get(`${MGMT_API}/desks`, { headers })
      .then(res => setDesks(res.data.desks))
      .catch(() => setDesks([]));
  }, []);

  /* ══════════ Questions for the selected desk + channel ══════════ */
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    setAnswers({});
    if (!deskId) { setQuestions([]); return; }
    setLoadingQuestions(true);
    axios.get(`${RATINGS_API}/desk-questions/${deskId}/${channel}`, { headers })
      .then(res => setQuestions(res.data.questions))
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQuestions(false));
  }, [deskId, channel]);

  /* ══════════ User search ══════════ */
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!search.trim()) { setResults([]); return; }
    searchTimer.current = setTimeout(() => {
      axios.get(`${RATINGS_API}/search-users`, { headers, params: { q: search } })
        .then(res => setResults(res.data.users))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const pickUser = (u) => {
    setSelectedUser(u);
    setSearch("");
    setResults([]);
    fetchHistory(u.id);
  };

  /* ══════════ Answers / weighted scoring ══════════ */
  const [answers, setAnswers] = useState({}); // { index: 'yes' | 'no' }
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setAnswer = (idx, value) => setAnswers(a => ({ ...a, [idx]: value }));

  const eliminated = questions.some((q, i) => q.isEliminator && answers[i] === "no");
  const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);
  const earnedWeight = questions.reduce((sum, q, i) => sum + (answers[i] === "yes" ? q.weight : 0), 0);
  const liveScore = questions.length === 0
    ? null
    : eliminated ? 0 : (totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100));

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] === "yes" || answers[i] === "no");

  const submitRating = async () => {
    if (!selectedUser) { showToast("error", "Please select a user to rate first."); return; }
    if (!deskId) { showToast("error", "Please select a desk."); return; }
    if (!allAnswered) { showToast("error", "Please answer all the questions."); return; }

    setSubmitting(true);
    try {
      const payload = {
        userId: selectedUser.id,
        deskId,
        channel,
        answers: questions.map((_, i) => answers[i]),
        comment: comment.trim() || null,
      };
      const res = await axios.post(RATINGS_API, payload, { headers });
      showToast("success", `Rating saved — score: ${res.data.rating.score}%${res.data.rating.eliminated ? " (eliminated)" : ""}.`);
      setAnswers({});
      setComment("");
      fetchHistory(selectedUser.id);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save rating.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ══════════ History ══════════ */
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = (userId) => {
    setLoadingHistory(true);
    axios.get(`${RATINGS_API}/user/${userId}`, { headers })
      .then(res => setHistory(res.data.ratings))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">Rate Users</span>
          </div>
          <div className="topbar-avatar" onClick={handleLogout} title="Logout">{initial}</div>
        </header>

        <div className="rate-page-content">

          {/* ── Desk + channel + user picker ── */}
          <div className="rate-card rate-search-card">
            <div className="rate-top-selectors">
              <div className="settings-field">
                <label>Desk</label>
                <select value={deskId} onChange={e => setDeskId(e.target.value)}>
                  <option value="">Select a desk...</option>
                  {desks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="settings-field">
                <label>Channel</label>
                <div className="rate-channel-tabs">
                  {CHANNELS.map(c => (
                    <button
                      key={c.key}
                      className={"rate-channel-tab" + (channel === c.key ? " active" : "")}
                      onClick={() => setChannel(c.key)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rate-search-wrap">
              <div className="mgmt-search">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Search a user by name, email or employee ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {results.length > 0 && (
                <div className="rate-search-results">
                  {results.map(u => (
                    <div className="rate-search-item" key={u.id} onClick={() => pickUser(u)}>
                      <div className="rate-search-avatar">{(u.first_name?.[0] || "U").toUpperCase()}</div>
                      <div>
                        <div className="rate-search-name">{u.first_name} {u.last_name}</div>
                        <div className="rate-search-meta">{u.email}{u.employee_id ? ` · ${u.employee_id}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="rate-selected-user">
                <div className="rate-search-avatar large">{(selectedUser.first_name?.[0] || "U").toUpperCase()}</div>
                <div>
                  <div className="rate-selected-name">{selectedUser.first_name} {selectedUser.last_name}</div>
                  <div className="rate-search-meta">{selectedUser.email}{selectedUser.employee_id ? ` · ${selectedUser.employee_id}` : ""}</div>
                </div>
                <button className="btn-settings-outline" onClick={() => { setSelectedUser(null); setHistory([]); setAnswers({}); }}>
                  Change user
                </button>
              </div>
            )}
          </div>

          {selectedUser && !deskId && (
            <div className="rate-card"><p className="mgmt-empty">Select a desk above to load its assessment questions.</p></div>
          )}

          {selectedUser && deskId && (
            <>
              {/* ── Assessment form ── */}
              <div className="rate-card">
                <div className="rate-form-header">
                  <h3 className="mgmt-title" style={{ border: "none", margin: 0, padding: 0 }}>
                    Assessment Framework — {CHANNELS.find(c => c.key === channel)?.label}
                  </h3>
                  <div className={"rate-live-score " + (liveScore === null ? "" : scoreClass(liveScore))}>
                    <span className="rate-live-score-label">Live Score</span>
                    <span className="rate-live-score-value">{liveScore === null ? "--" : `${liveScore}%`}</span>
                  </div>
                </div>

                {loadingQuestions ? (
                  <p className="mgmt-empty">Loading questions...</p>
                ) : questions.length === 0 ? (
                  <p className="mgmt-empty">
                    This desk has no {CHANNELS.find(c => c.key === channel)?.label} questions configured yet.
                    Add some from Management &rarr; Desks.
                  </p>
                ) : (
                  <div className="rate-questions-list">
                    {questions.map((q, idx) => (
                      <div className={"rate-question-row" + (q.isEliminator ? " eliminator" : "")} key={idx}>
                        <span className="question-number">{idx + 1}</span>
                        <span className="rate-question-weight" title="Weight (COF)">{q.weight}</span>
                        <div className="rate-question-text">
                          {q.text}
                          {q.isEliminator && <span className="eliminator-badge">ELIMINATOR</span>}
                        </div>
                        <div className="rate-answer-toggle">
                          <button
                            className={"rate-answer-btn yes" + (answers[idx] === "yes" ? " active" : "")}
                            onClick={() => setAnswer(idx, "yes")}
                          >Yes</button>
                          <button
                            className={"rate-answer-btn no" + (answers[idx] === "no" ? " active" : "")}
                            onClick={() => setAnswer(idx, "no")}
                          >No</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {eliminated && (
                  <p className="settings-error" style={{ marginTop: 10 }}>
                    Eliminatory question answered "No" — the final score will be 0.
                  </p>
                )}

                {questions.length > 0 && (
                  <>
                    <div className="settings-field" style={{ marginTop: 14 }}>
                      <label>Feedback / Comment (optional)</label>
                      <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add overall feedback..." />
                    </div>

                    <div className="mgmt-actions">
                      <button className="btn-settings-save" onClick={submitRating} disabled={submitting}>
                        {submitting ? "Saving..." : "Submit Rating"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ── History ── */}
              <div className="rate-card">
                <h3 className="mgmt-title">Rating History — {selectedUser.first_name} {selectedUser.last_name}</h3>
                {loadingHistory ? (
                  <p className="mgmt-empty">Loading...</p>
                ) : history.length === 0 ? (
                  <p className="mgmt-empty">No ratings recorded yet for this user.</p>
                ) : (
                  <div className="rate-history-table">
                    <div className="rate-history-head">
                      <span>Date</span><span>Desk / Channel</span><span>Rater</span><span>Score</span><span>Status</span><span></span>
                    </div>
                    {history.map(r => {
                      const parsedAnswers = typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers;
                      const isOpen = expandedId === r.id;
                      return (
                        <div className="rate-history-row-wrap" key={r.id}>
                          <div className="rate-history-row">
                            <span>{new Date(r.created_at).toLocaleString()}</span>
                            <span>{r.desk_name || "—"} / {r.channel || "—"}</span>
                            <span>{r.rater_first_name} {r.rater_last_name}</span>
                            <span className={"rate-score-badge " + scoreClass(r.score)}>{r.score}%</span>
                            <span>{r.eliminated ? <span className="eliminator-badge">ELIMINATED</span> : "OK"}</span>
                            <button className="btn-settings-outline" onClick={() => setExpandedId(isOpen ? null : r.id)}>
                              {isOpen ? "Hide" : "Details"}
                            </button>
                          </div>
                          {isOpen && (
                            <div className="rate-history-details">
                              {r.comment && <div className="rate-history-detail-comment">"{r.comment}"</div>}
                              {parsedAnswers.map((a, i) => (
                                <div className="rate-history-detail-item" key={i}>
                                  <span className={"detail-answer " + (a.answer === "yes" ? "yes" : "no")}>{a.answer}</span>
                                  <span className="rate-question-weight small">{a.weight}</span>
                                  <span>{a.text}{a.isEliminator ? " (eliminator)" : ""}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
