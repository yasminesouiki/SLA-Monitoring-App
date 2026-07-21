import { NavLink } from "react-router-dom";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

export default function UserSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/dxc-logo.png" alt="DXC" />
        <span className="sidebar-logo-text">DXC Technology</span>
      </div>
      <div className="sidebar-bar" />

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Workspace</p>
        <NavLink to="/home" end className={({ isActive }) => "sidebar-item" + (isActive ? " active" : "")}>
          <IconDashboard /> My Information
        </NavLink>
        <NavLink to="/home/sla" className={({ isActive }) => "sidebar-item" + (isActive ? " active" : "")}>
          <IconChart /> SLA Dashboard
        </NavLink>
      </nav>
    </aside>
  );
}
