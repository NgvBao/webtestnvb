// src/logic/ProjectManagementLogic.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectManagementPage from "../pages/ProjectManagementPage";
import type { Project } from "../pages/ProjectManagementPage";
import { projectService } from "../api/auth/projectService";
import type { ProjectResponse as ApiProject } from "../api/types/typesprojectService";

type ListResponse = {
  projects: ApiProject[];
  total: number;
  limit: number;
  offset: number;
};

function toUpperUnderscore(s?: string): string {
  return (s ?? "").toUpperCase();
}

function mapApiToUI(p: ApiProject): Project {
  return {
    id: p.id,
    name: p.name,
    windfarmCount: (p as any).windfarm_count ?? 0,
    description: p.description ?? "",
    performance: "N/A",
    createdAt: (p as any).created_at ?? "",
    status: toUpperUnderscore((p as any).status),
  };
}

const ProjectManagementLogic: React.FC = () => {
  const navigate = useNavigate();

  // ===== list & search =====
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // ===== create modal =====
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // ===== delete per-row loading =====
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  // ===== race-condition guard =====
  const listReqIdRef = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoadingList(true);
    const reqId = ++listReqIdRef.current;

    const res = await projectService.list();
    if (reqId !== listReqIdRef.current || !mountedRef.current) return;

    if (!res.ok) {
      alert(res.message || "Failed to fetch projects");
      setLoadingList(false);
      return;
    }

    const payload = res.data as ListResponse;
    const raw = payload?.projects ?? [];
    const mapped = raw.map(mapApiToUI).sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );

    setProjects(mapped);
    setLoadingList(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Refresh nhẹ khi quay lại tab
  useEffect(() => {
    const onFocus = () => fetchProjects();
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchProjects]);

  // ===== client-side search =====
  const filtered = useMemo(() => {
    const k = searchTerm.trim().toLowerCase();
    if (!k) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(k));
  }, [projects, searchTerm]);

  // ===== Create =====
  const onCreateClick = () => setShowCreateModal(true);
  const onCancelCreate = () => {
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
  };
  const onCreateSubmit = async (name: string, description: string) => {
    const n = name.trim();
    const d = description.trim();
    if (!n) return;
    setLoadingCreate(true);
    const res = await projectService.create({ name: n, description: d });
    setLoadingCreate(false);

    if (!res.ok) {
      alert(res.message || "Create project failed");
      return;
    }
    const created = mapApiToUI(res.data as ApiProject);
    setProjects((prev) => [created, ...prev]);
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
  };

  // ===== Management (điều hướng) =====
  const onManageClick = (p: Project) => {
    navigate(`/project-management/${p.id}/members`, { state: { project: p } });
  };

  // ===== Delete (placeholder – BE chưa có DELETE) =====
  const onDeleteClick = async (p: Project) => {
    setLoadingDeleteId(p.id);
    try {
      alert("Delete project chưa được backend hỗ trợ trong spec hiện tại.");
      // Khi có API:
      // const res = await projectService.remove(p.id);
      // if (!res.ok) { alert(res.message || "Delete failed"); return; }
      // setProjects(prev => prev.filter(x => x.id !== p.id));
    } finally {
      setLoadingDeleteId(null);
    }
  };

  return (
    <ProjectManagementPage
      // dữ liệu + search
      projects={filtered}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}

      // create modal
      showCreateModal={showCreateModal}
      newName={newName}
      setNewName={setNewName}
      newDescription={newDescription}
      setNewDescription={setNewDescription}
      onCreateClick={onCreateClick}
      onCancelCreate={onCancelCreate}
      onCreateSubmit={onCreateSubmit}
      loadingCreate={loadingCreate}

      // actions
      onManageClick={onManageClick}
      onDeleteClick={onDeleteClick}
      loadingDeleteId={loadingDeleteId}

      // loading vùng bảng
      loadingList={loadingList}
    />
  );
};

export default ProjectManagementLogic;
