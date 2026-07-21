import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserSidebar from "../components/UserSidebar";
import {
  StatCard, Donut, TrendChart, GroupRow,
  IconPhone, IconPhoneOff, IconTrophy, IconTrendUp, IconZap, IconGauge, IconClock,
} from "../components/DashboardWidgets";
import { formatDuration, formatNumber, pctSafe } from "../utils/dashboardFormat";
import "../styles/dashboard.css";
import "../styles/dashboard-analytics.css";

const API = "http://localhost:5000/api/dashboard";

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function UserSlaDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = (user.first_name?.[0] || user.email?.[0] || "U").toUpperCase();
  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [tab, setTab] = useState("historical");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(() => {
    axios.get(`${API}/${tab}/overview`, { headers })
      .then(res => setOverview(res.data))
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, [tab, headers]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const s = overview?.summary;

  return (
    <div className="dashboard-layout">
      <UserSidebar />

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
                <Donut title="Volume by Group" data={overview.donuts.volumeByGroup} total={s.totalOffered} />
                {tab === "historical" && <TrendChart data={overview.trend} />}
              </div>

              <div className="groups-section">
                {overview.groups.length === 0 ? (
                  <p className="mgmt-empty">No SLA data available yet.</p>
                ) : (
                  overview.groups.map(g => <GroupRow key={g.group} group={g} />)
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
