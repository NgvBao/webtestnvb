// src/pages/ManagePage.tsx
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import UserManagementLogic from "../logic/UserManagementLogic";
import ProjectManagementLogic from "../logic/ProjectManagementLogic";
import WindfarmAdminLogic from "../logic/WindfarmAdminLogic";
import SettingLogic from "../logic/SettingLogic";
import AuditLogsLogic from "../logic/AuditLogic";
import "../styles/ManagePage.css";

export default function ManagePage() {
  return (
    <>
      {/* Khối menu riêng */}
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
        <NavLink
          to="windfarm-management"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Windfarm Management
        </NavLink>
        <NavLink
          to="setting"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Setting
        </NavLink>
        <NavLink
          to="audit-logs"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Audit Logs
        </NavLink>
      </nav>

      {/* Khối content riêng */}
      <div className="manage-content">
        <Routes>
          <Route index element={<Navigate to="user" replace />} />
          <Route path="user" element={<UserManagementLogic />} />
          <Route
            path="project-management"
            element={<ProjectManagementLogic />}
          />
          <Route path="windfarm-management" element={<WindfarmAdminLogic />} />
          <Route path="setting" element={<SettingLogic />} />
          <Route path="audit-logs" element={<AuditLogsLogic />} />
          <Route path="*" element={<Navigate to="user" replace />} />
        </Routes>
      </div>
    </>
  );
}
