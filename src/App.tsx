import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "../src/context";
import LoginLogic from "./logic/LoginLogic";
import OtpSignupLogic from "./logic/OtpSignupLogic";
import OtpLoginLogic from "./logic/OtpLoginLogic";
import TurbineListLogic from "./logic/TurbineListLogic";
import SettingLogic from "./logic/SettingLogic";
import SignUpLogic from "./logic/SignUplogic";
import SessionsListLogic from "./logic/SessionsListLoic";
import UserManagementLogic from "./logic/UserManagementLogic";
import ForgotMailPasswordLogic from "./logic/ForgotMailPasswordLogic";
import ForgotChangePasswordLogic from "./logic/ForgotChangePasswordLogic";
import OtpChangeLogic from "./logic/OtpChangeLogic";
// Route bảo vệ
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Route public
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Route public */}
          <Route path="/login" element={<PublicRoute><LoginLogic /></PublicRoute>} />
          <Route path="/sign-up" element={<PublicRoute><SignUpLogic /></PublicRoute>} />
          <Route path="/otp-login" element={<PublicRoute><OtpLoginLogic /></PublicRoute>} />
          <Route path="/otp-sign-up" element={<PublicRoute><OtpSignupLogic /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotMailPasswordLogic /></PublicRoute>} />
          <Route path="/change-password" element={<PublicRoute><ForgotChangePasswordLogic /></PublicRoute>} />
          <Route path="/otp-forgot" element={<PublicRoute><OtpChangeLogic /></PublicRoute>} />
          {/* Route cần login */}
          <Route path="/dashboard" element={<ProtectedRoute><TurbineListLogic /></ProtectedRoute>} />
          <Route path="/setting" element={<ProtectedRoute><SettingLogic /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionsListLogic /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute><UserManagementLogic /></ProtectedRoute>} />

          {/* Wildcard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
