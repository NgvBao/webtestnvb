// src/logic/ProjectManagementLogic.tsx
import React, { useEffect, useMemo, useState } from "react";
import ProjectManagementPage from "../pages/ProjectManagementPage";
import type { Project } from "../pages/ProjectManagementPage";
import { api } from "../api/core";

/**
 * Giả định:
 * - api.baseURL = "https://fastapi-turbine-62vm.onrender.com/api/v1"
 *   nên mọi call chỉ cần "/projects", "/projects/{id}" (KHÔNG thêm /v1)
 */

type ApiProject = {
  id: string;
  name: string;
  description?: string;
  status: string; // ví dụ: "NOT_STARTED" | "ACTIVE" | "COMPLETED" ...
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  invite_code?: string;
  invite_expires_at?: string;
  // các count CHỈ có ở detail (/projects/{id}) & admin (/projects/all)
  member_count?: number;
  windfarm_count?: number;
  turbine_count?: number;
};

type ListResponse = {
  projects: ApiProject[];
  total: number;
  limit: number;
  offset: number;
};

function mapApiToUI(p: ApiProject): Project {
  return {
    id: p.id,
    name: p.name,
    windfarmCount: p.windfarm_count ?? 0, // list có thể không có -> 0
    description: p.description ?? "",
    performance: "N/A", // chưa có field từ backend
    createdAt: p.created_at ?? "",
    // hiển thị nguyên trạng thái enum từ BE (NOT_STARTED/ACTIVE/…)
    status: p.status ?? "",
  };
}

const ProjectManagementLogic: React.FC = () => {
  // ====== list & search ======
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // ====== create modal ======
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // ====== detail modal ======
  const [detailData, setDetailData] = useState<Project | null>(null);
  const [loadingSaveDetail, setLoadingSaveDetail] = useState(false);
  const [loadingDeleteDetail, setLoadingDeleteDetail] = useState(false);

  // ====== fetch list ======
  const fetchProjects = async () => {
    try {
      setLoadingList(true);
      // GET /projects  (list dự án user có quyền)
      const res = await api.get<ListResponse>("/projects");
      if (!res.ok) {
        alert(res.message || "Failed to fetch projects");
        return;
      }
      const raw = res.data?.projects ?? [];
      const mapped = raw.map(mapApiToUI);
      // optional: sort by createdAt desc
      mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setProjects(mapped);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch projects");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    const k = searchTerm.trim().toLowerCase();
    if (!k) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(k));
  }, [projects, searchTerm]);

  // ====== create handlers ======
  const onCreateClick = () => setShowCreateModal(true);
  const onCancelCreate = () => {
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
  };

  const onCreateSubmit = async (name: string, description: string) => {
    if (!name.trim()) return;
    try {
      setLoadingCreate(true);
      // POST /projects
      const res = await api.post<ApiProject>("/projects", { name, description });
      if (!res.ok) {
        alert(res.message || "Create project failed");
        return;
      }
      const created = mapApiToUI(res.data as ApiProject);
      setProjects((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewName("");
      setNewDescription("");
    } catch (err) {
      console.error(err);
      alert("Create project failed");
    } finally {
      setLoadingCreate(false);
    }
  };

  // ====== detail handlers ======
  const onOpenDetail = async (p: Project) => {
    // mở ngay bằng dữ liệu hiện có
    setDetailData(p);
    try {
      // GET /projects/{id} (có trả windfarm_count, turbine_count, member_count)
      const res = await api.get<ApiProject>(`/projects/${p.id}`);
      if (res.ok) {
        const fresh = mapApiToUI(res.data as ApiProject);
        setDetailData(fresh);
        // Optionally, cập nhật list cho đồng bộ
        setProjects((prev) => prev.map((x) => (x.id === fresh.id ? fresh : x)));
      } else {
        console.warn("Get detail failed:", res.message);
      }
    } catch (err) {
      console.warn("Get detail failed:", err);
    }
  };

  const onDetailChange = (p: Project) => setDetailData(p);
  const onCloseDetail = () => setDetailData(null);

  const onSaveDetail = async () => {
    // Chưa có endpoint update trong spec -> báo nhẹ
    setLoadingSaveDetail(true);
    setTimeout(() => {
      setLoadingSaveDetail(false);
      alert("Update project chưa được backend hỗ trợ trong spec hiện tại.");
    }, 250);
  };

  const onDeleteDetail = async () => {
    // Chưa có endpoint delete trong spec -> báo nhẹ
    setLoadingDeleteDetail(true);
    setTimeout(() => {
      setLoadingDeleteDetail(false);
      alert("Delete project chưa được backend hỗ trợ trong spec hiện tại.");
    }, 250);
  };

  return (
    <ProjectManagementPage
      projects={filtered}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      // create
      showCreateModal={showCreateModal}
      newName={newName}
      setNewName={setNewName}
      newDescription={newDescription}
      setNewDescription={setNewDescription}
      onCreateClick={onCreateClick}
      onCancelCreate={onCancelCreate}
      onCreateSubmit={onCreateSubmit}
      loadingCreate={loadingCreate}
      // detail
      detailData={detailData}
      onOpenDetail={onOpenDetail}
      onDetailChange={onDetailChange}
      onCloseDetail={onCloseDetail}
      onSaveDetail={onSaveDetail}
      onDeleteDetail={onDeleteDetail}
      loadingSaveDetail={loadingSaveDetail}
      loadingDeleteDetail={loadingDeleteDetail}
      // extra
      loadingList={loadingList}
    />
  );
};

export default ProjectManagementLogic;
