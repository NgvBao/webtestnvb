import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, AUTH_SESSION_STORAGE_KEY } from "../context";
import { authServiceLong } from "../api/auth/authService";
import "../components styles/sidebar.css";

import { FiSettings, FiBarChart2, FiGrid } from "react-icons/fi"; // FiGrid = Manage

function Sidebar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);
  const path = location.pathname;

  // ✅ xác định tab đang active
  const activeTab = useMemo(() => {
    if (path === "/setting") return "setting";
    if (path.startsWith("/project")) return "project";
    if (path.startsWith("/manage")) return "manage"; // managePage
    return "";
  }, [path]);

  const handleNavigate = (to: string) => navigate(to);

  const handleLogout = async () => {
    setLoggingOut(true);
    const res = await authServiceLong.logout();
    if (!res.ok) {
      alert(res.message || "Logout failed");
      setLoggingOut(false);
      return;
    }
    sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    setUser(null);
    navigate("/login", { replace: true });
    setLoggingOut(false);
  };

  return (
    <>
      <ul className="menu" role="menu">
        {/* ✅ Settings */}
        <li
          className={activeTab === "setting" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/setting")}
        >
          <FiSettings size={24} />
        </li>

        {/* ✅ Projects */}
        <li
          className={activeTab === "project" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/project")}
        >
          <FiBarChart2 size={24} />
        </li>

        {/* ✅ ManagePage */}
        <li
          className={activeTab === "manage" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/manage")}
        >
          <FiGrid size={24} />
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-mini" title={user?.name || ""}>
          <div className="user-name">{user?.name || "Guest"}</div>
          <div className="user-role">{user?.role || "viewer"}</div>
        </div>
        <button
          className="btn-logout btn-logout--compact"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </>
  );
}

export default Sidebar;
