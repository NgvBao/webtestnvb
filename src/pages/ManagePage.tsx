import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import Sidebar from "../components/sidebar";
import UserManagementLogic from "../logic/UserManagementLogic";
import ProjectManagementLogic from "../logic/ProjectManagementLogic";
import "../styles/ManagePage.css"; // tự tạo file css cho layout 3 khối

export default function ManagePage() {
  return (
    <div className="ManagePage">
      {/* 1️⃣ Sidebar bên trái */}
      <Sidebar />

      {/* 2️⃣ Menu dọc riêng của Manage */}
      <nav className="manage-menu">
        <NavLink
          to="user"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          User Management
        </NavLink>
        <NavLink
          to="project-management"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Project Management
        </NavLink>
      </nav>

      {/* 3️⃣ Khối content: mặc định mở UserManagement */}
      <div className="manage-content">
        <Routes>
          <Route index element={<Navigate to="user" replace />} />
          <Route path="user" element={<UserManagementLogic />} />
          <Route
            path="project-management"
            element={<ProjectManagementLogic />}
          />
        </Routes>
      </div>
    </div>
  );
}
