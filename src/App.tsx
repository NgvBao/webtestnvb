import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "../src/context";
import TurbineListLogic from "./logic/TurbineListLogic";
import SettingLogic from "./logic/SettingLogic";
import SessionsListLogic from "./logic/SessionsListLoic";
import UserManagementLogic from "./logic/UserManagementLogic";
import ProjectManagementLogic from "./logic/ProjectManagementLogic";
import ManagePage from "./pages/ManagePage"; // ✅ import thêm

// ===== Cờ bypass cho môi trường dev =====
const DEV_BYPASS = true;

// Route bảo vệ – đã thêm bypass
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (DEV_BYPASS) return <>{children}</>; // ✅ Bypass kiểm tra đăng nhập
  const { user, loading } = useUser();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Chỉ giữ lại các trang cần test khi đã login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TurbineListLogic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute>
                <SettingLogic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsListLogic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserManagementLogic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-management"
            element={
              <ProtectedRoute>
                <ProjectManagementLogic />
              </ProtectedRoute>
            }
          />

          {/* ✅ Route mới cho trang Manage (3 khối: sidebar + menu giữa + content) */}
          <Route
            path="/manage/*"
            element={
              <ProtectedRoute>
                <ManagePage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Mặc định chuyển thẳng về dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
