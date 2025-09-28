// src/components/MainLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import "../components styles/MainLayout.css";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isManage = pathname.startsWith("/manage");

  return (
    <div className="MainLayout">
      {/* Sidebar */}
      <aside className="sidebar-content">
        <Sidebar />
      </aside>

      {/* Nếu là Manage thì Outlet sẽ tự chia 2 khối: menu + content */}
      {isManage ? (
        <div className="manage-wrapper">
          <Outlet />
        </div>
      ) : (
        <main className="main-content">
          <Outlet />
        </main>
      )}
    </div>
  );
}
