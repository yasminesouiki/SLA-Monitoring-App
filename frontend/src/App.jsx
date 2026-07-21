import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import OTPVerification from "./pages/OTPVerification";
import AdminProfile from "./pages/AdminProfile";
import AdminSettings from "./pages/AdminSettings";
import Management from "./pages/Management";
import RateUser from "./pages/RateUser";
import UserApprovals from "./pages/UserApprovals";
import Dashboard from "./pages/Dashboard";
import UserHome from "./pages/UserHome";
import UserSlaDashboard from "./pages/UserSlaDashboard";
import { RequireAuth, RequireAdmin } from "./components/RouteGuards";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/verify" element={<OTPVerification />} />

      {/* Admin workspace */}
      <Route path="/dashboard" element={<RequireAdmin><AdminProfile /></RequireAdmin>} />
      <Route path="/dashboard/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
      <Route path="/dashboard/management" element={<RequireAdmin><Management /></RequireAdmin>} />
      <Route path="/dashboard/rate-user" element={<RequireAdmin><RateUser /></RequireAdmin>} />
      <Route path="/dashboard/approvals" element={<RequireAdmin><UserApprovals /></RequireAdmin>} />
      <Route path="/dashboard/analytics" element={<RequireAdmin><Dashboard /></RequireAdmin>} />

      {/* Regular user workspace */}
      <Route path="/home" element={<RequireAuth><UserHome /></RequireAuth>} />
      <Route path="/home/sla" element={<RequireAuth><UserSlaDashboard /></RequireAuth>} />
    </Routes>
  );
}
