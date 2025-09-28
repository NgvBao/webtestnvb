// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { UserProvider, useUser } from "../src/context";

// ================= Public pages =================
import LoginLogic from "./logic/LoginLogic";
import OtpSignupLogic from "./logic/OtpSignupLogic";
import OtpLoginLogic from "./logic/OtpLoginLogic";
import SignUpLogic from "./logic/SignUplogic";
import ForgotMailPasswordLogic from "./logic/ForgotMailPasswordLogic";
import ForgotChangePasswordLogic from "./logic/ForgotChangePasswordLogic";
import OtpChangeLogic from "./logic/OtpChangeLogic";

// ================= Protected pages =================
import ProjectLogic from "./logic/ProjectLogic";
import SettingLogic from "./logic/SettingLogic";
import SessionsListLogic from "./logic/SessionsListLogic";
import UserManagementLogic from "./logic/UserManagementLogic";
import ProjectManagementLogic from "./logic/ProjectManagementLogic";
import MemberProjectLogic from "./logic/MemberProjectLogic";
import WindfarmLogic from "./logic/WinfarmLogic";
import WindfarmAdminLogic from "./logic/WindfarmAdminLogic";
import TurbinePageLogic from "./logic/TurbinePageLogic";
import AuditLogsLogic from "./logic/AuditLogic";

// ✅ Thêm ManagePage
import ManagePage from "./pages/ManagePage";

// ✅ Thêm MainLayout (layout có Sidebar, header,...)
import MainLayout from "./components/MainLayout";

// ================= Guards =================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/project" replace />;
  return <>{children}</>;
}

// ================= Wrapper: Members =================
function MemberProjectRouteWrapper() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const projectFromState = location.state?.project as
    | { id: string; name?: string }
    | undefined;

  return (
    <MemberProjectLogic
      projectId={projectId!}
      projectTitle={projectFromState?.name ?? "Project Members"}
      canManage={true} // TODO: map quyền thực tế
      onBack={() => navigate(-1)}
    />
  );
}

// ================= Wrapper: Windfarms in Project =================
function WindfarmRouteWrapper() {
  return <WindfarmLogic />;
}

// ================= App =================
export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= Public ================= */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginLogic />
              </PublicRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <SignUpLogic />
              </PublicRoute>
            }
          />
          <Route
            path="/otp-login"
            element={
              <PublicRoute>
                <OtpLoginLogic />
              </PublicRoute>
            }
          />
          <Route
            path="/otp-sign-up"
            element={
              <PublicRoute>
                <OtpSignupLogic />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotMailPasswordLogic />
              </PublicRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PublicRoute>
                <ForgotChangePasswordLogic />
              </PublicRoute>
            }
          />
          <Route
            path="/otp-forgot"
            element={
              <PublicRoute>
                <OtpChangeLogic />
              </PublicRoute>
            }
          />

          {/* ================= Protected (có MainLayout) ================= */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/project" element={<ProjectLogic />} />
            <Route
              path="/project-management"
              element={<ProjectManagementLogic />}
            />
            <Route
              path="/project-management/:projectId/members"
              element={<MemberProjectRouteWrapper />}
            />
            <Route
              path="/project/:projectId/windfarms"
              element={<WindfarmRouteWrapper />}
            />
            <Route
              path="/project/:projectId/windfarms/:windfarmId/turbines"
              element={<TurbinePageLogic />}
            />
            <Route
              path="/windfarm-management"
              element={<WindfarmAdminLogic />}
            />
            <Route path="/audit-logs" element={<AuditLogsLogic />} />
            <Route path="/setting" element={<SettingLogic />} />
            <Route path="/sessions" element={<SessionsListLogic />} />
            <Route path="/user" element={<UserManagementLogic />} />

            {/* ✅ Thêm ManagePage vào trong MainLayout */}
            <Route path="/manage/*" element={<ManagePage />} />
          </Route>

          {/* ================= Wildcard ================= */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
