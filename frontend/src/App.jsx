import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import OTPVerification from "./pages/OTPVerification";
import AdminProfile from "./pages/AdminProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/verify" element={<OTPVerification />} />
      <Route path="/dashboard" element={<AdminProfile />} />
    </Routes>
  );
}