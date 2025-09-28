import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, AUTH_SESSION_STORAGE_KEY } from "../context";
import { authServiceLong } from "../api/auth/authService";
import "../components styles/sidebar.css";

/* ✅ Icons hiện đại */
import { FiSettings, FiBarChart2, FiUsers } from "react-icons/fi";

function Sidebar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);

  const path = location.pathname;

  const activeTab = useMemo(() => {
    if (path === "/setting") return "setting";
    if (path === "/dashboard") return "dashboard";
    if (path.startsWith("/manage")) return "manage";
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
    <aside className="sidebar-content" aria-label="Primary">
      <ul className="menu" role="menu">
        {/* Setting */}
        <li
          className={activeTab === "setting" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/setting")}
        >
          <FiSettings size={24} />
        </li>

        {/* ✅ Dashboard với icon Bar Chart */}
        <li
          className={activeTab === "dashboard" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/dashboard")}
        >
          <FiBarChart2 size={24} />
        </li>

        {/* Manage */}
        <li
          className={activeTab === "manage" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/manage")}
        >
          <FiUsers size={24} />
        </li>
      </ul>

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
    </aside>
  );
}

export default Sidebar;
