import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectPage from "../pages/ProjectPage";
import type { ProjectLite } from "../pages/ProjectPage";
import { projectService } from "../api/auth/projectService";
import type { ProjectResponse as ApiProject } from "../api/types/typesprojectService";

type ListResponse = {
  projects: ApiProject[];
  total: number;
  limit: number;
  offset: number;
};

function toUpperUnderscore(s?: string): string {
  return (s ?? "").toUpperCase(); // "active" => "ACTIVE", "not_started" => "NOT_STARTED"
}

function pickManagedBy(p: any): string {
  // BE /projects/ có thể trả user_role: "owner" | "manager" | "editor" | "viewer"
  const role = p?.user_role ? String(p.user_role) : "";
  if (role) return `You (${role.toUpperCase()})`;
  return "—";
}

function mapApiToUI(p: ApiProject): ProjectLite {
  const anyp = p as any; // do BE dùng snake_case
  return {
    id: p.id,
    name: p.name,
    windfarmCount: anyp.windfarm_count ?? 0,
    description: p.description ?? "",
    performance: "N/A",
    createdAt: anyp.created_at ?? "",
    status: toUpperUnderscore(anyp.status),
    managedBy: pickManagedBy(anyp),
  };
}

const ProjectPageLogic: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // chống race-condition & memory leak
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

  // optional UX: tự refresh khi quay lại tab
  useEffect(() => {
    const onFocus = () => fetchProjects();
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    const k = searchTerm.trim().toLowerCase();
    if (!k) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(k));
  }, [projects, searchTerm]);

  // Điều hướng tách khỏi Page (giống pattern ở ProjectManagementPage)
  const onRowClick = (p: ProjectLite) => {
    navigate(`/project/${p.id}/windfarms`);
  };

  return (
    <ProjectPage
      projects={filtered}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      loadingList={loadingList}
      onRowClick={onRowClick}
    />
  );
};

export default ProjectPageLogic;
