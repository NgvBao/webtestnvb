
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context"; // import context hook
import "../components styles/sidebar.css";

function Sidebar() {
  const { user } = useUser(); // lấy user từ context
  const navigate = useNavigate();
  const location = useLocation();

  // Map route path sang tab key để active
  const getActiveTab = () => {
    switch (location.pathname) {
      case "/setting":
        return "user";
      case "/dashboard":
        return "dashboard";
      case "/user":
        return "manage";
      default:
        return "";
    }
  };

  const activeTab = getActiveTab();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <ul className="menu">
        <li
          className={activeTab === "user" ? "active" : ""}
          onClick={() => handleNavigate("/setting")}
        >
          User
        </li>
        <li
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => handleNavigate("/dashboard")}
        >
          Dashboard
        </li>

        {/* Chỉ hiển thị User Management nếu role = admin */}
        {user?.role === "admin" && (
          <li
            className={activeTab === "manage" ? "active" : ""}
            onClick={() => handleNavigate("/user")}
          >
            User Management
          </li>
        )}
      </ul>
    </aside>
  );
}
export default Sidebar;