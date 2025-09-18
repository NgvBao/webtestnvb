// Sidebar.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, AUTH_SESSION_STORAGE_KEY } from "../context";
import { authServiceLong } from "../api/auth/authService";
import "../components styles/sidebar.css";

function Sidebar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);

  // Explorer-style: mở theo route hiện tại hoặc trạng thái đã lưu
  const [openManage, setOpenManage] = useState<boolean>(() => {
    const p = window.location.pathname;
    const byRoute =
      p.startsWith("/user") || p.startsWith("/project-management") || p.startsWith("/winfarm");
    const saved = localStorage.getItem("sidebar.manageOpen") === "1";
    return byRoute || saved;
  });

  useEffect(() => {
    localStorage.setItem("sidebar.manageOpen", openManage ? "1" : "0");
  }, [openManage]);

  const path = location.pathname;

  const activeTab = useMemo(() => {
    if (path === "/setting") return "setting";
    if (path === "/dashboard") return "dashboard";
    if (
      path.startsWith("/user") ||
      path.startsWith("/project-management") ||
      path.startsWith("/winfarm")
    ) {
      return "manage";
    }
    return "";
  }, [path]);

  const activeSub = useMemo(() => {
    if (path.startsWith("/user")) return "user";
    if (path.startsWith("/project-management")) return "project";
    if (path.startsWith("/winfarm")) return "winfarm";
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

  const toggleManage = () => setOpenManage((v) => !v);

  // Auto mở nếu đang ở route con của Manage
  useEffect(() => {
    if (
      path.startsWith("/user") ||
      path.startsWith("/project-management") ||
      path.startsWith("/winfarm")
    ) {
      setOpenManage(true);
    }
  }, [path]);

  const submenuId = "sidebar-manage-submenu";

  return (
    <aside className="sidebar" aria-label="Primary">
      <ul className="menu" role="menu">
        <li
          className={activeTab === "setting" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/setting")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavigate("/setting");
            }
          }}
        >
          Setting
        </li>

        <li
          className={activeTab === "dashboard" ? "active" : ""}
          role="menuitem"
          onClick={() => handleNavigate("/dashboard")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavigate("/dashboard");
            }
          }}
        >
          Dashboard
        </li>

        {/* Manage */}
        <li
          className={`has-sub ${openManage ? "open" : ""} ${
            activeTab === "manage" ? "active-parent" : ""
          }`}
          role="none"
        >
          {/* Dùng button để a11y tốt hơn */}
          <button
            type="button"
            className="submenu-title"
            aria-expanded={openManage}
            aria-controls={submenuId}
            onClick={(e) => {
              e.stopPropagation();
              toggleManage();
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setOpenManage(true);
              if (e.key === "ArrowLeft") setOpenManage(false);
            }}
          >
            <span className="submenu-label">Manage</span>
            <span className="caret" aria-hidden="true" />
          </button>

          <ul
            id={submenuId}
            className="submenu"
            role="menu"
            aria-label="Manage submenu"
          >
            <li
              className={activeSub === "user" ? "active" : ""}
              role="menuitem"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate("/user");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigate("/user");
                }
              }}
            >
              <span className="dot" aria-hidden="true" /> User Management
            </li>

            <li
              className={activeSub === "project" ? "active" : ""}
              role="menuitem"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate("/project-management");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigate("/project-management");
                }
              }}
            >
              <span className="dot" aria-hidden="true" /> Project Management
            </li>

            <li
              className={activeSub === "winfarm" ? "active" : ""}
              role="menuitem"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate("/winfarm");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigate("/winfarm");
                }
              }}
            >
              <span className="dot" aria-hidden="true" /> Winfarm Management
            </li>
          </ul>
        </li>
        {/* /Manage */}
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
    </aside>
  );
}

export default Sidebar;
