import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

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

export default function AdminProfile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState(stored);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data.user)).catch(() => {});
  }, []);

  const user = profile;
  const initial = (user.first_name?.[0] || user.email?.[0] || "A").toUpperCase();
  const fullName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email?.split("@")[0] || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn"><IconMenu /></button>
            <span className="topbar-title">Profile</span>
          </div>
          <div className="topbar-avatar" title="Logout" onClick={handleLogout}>
            {initial}
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">

          {/* Profile header */}
          <div className="profile-header-card">
            <div className="profile-avatar-placeholder">{initial}</div>

            <div className="profile-header-info">
              <div className="profile-name">{fullName}</div>
              <div className="profile-email">{user.email}</div>
              <span className="profile-badge">
                <IconShield />
                {user.role || "Administrator"}
              </span>
            </div>

            <button className="btn-update" onClick={() => navigate("/dashboard/settings")}>
              <IconEdit /> Update Profile
            </button>
          </div>

          {/* Info cards */}
          <div className="profile-cards">

            {/* Personal Information */}
            <div className="info-card">
              <div className="info-card-title">
                <IconPerson /> Personal Information
              </div>
              <div className="info-grid">
                {[
                  { label: "National ID",        val: user.national_id },
                  { label: "Phone",               val: user.phone },
                  { label: "Address",             val: user.address },
                  { label: "Governorate",         val: user.governorate },
                  { label: "Marital Status",      val: user.marital_status },
                  { label: "Number of Children",  val: user.children },
                  { label: "Role",                val: user.role },
                  { label: "Language",            val: user.language },
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

            {/* Professional Information */}
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
                  { label: "Language",         val: user.language },
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
