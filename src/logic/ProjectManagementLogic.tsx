// src/logic/ProjectManagementLogic.tsx
import React, { useEffect, useMemo, useState } from "react";
import ProjectManagementPage from "../pages/ProjectManagementPage";
import type { Project } from "../pages/ProjectManagementPage";
import { api } from "../api/core"; 

type ApiProject = {
  id: string;
  name: string;
  description: string;
  status: string; // ví dụ: "NOT_STARTED" | "ACTIVE" ...
  created_at: string;
  updated_at: string;
  created_by: string;
  invite_code?: string;
  invite_expires_at?: string;
  member_count: number;
  windfarm_count: number;
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
    windfarmCount: p.windfarm_count ?? 0,
    description: p.description ?? "",
    performance: "N/A", // backend chưa có field performance -> hiển thị N/A
    createdAt: p.created_at ?? "",
    status: p.status ?? "",
  };
}

const ProjectManagementLogic: React.FC = () => {
  // ====== list & search ======
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    const res = await api.get<ListResponse>("/v1/projects/"); // baseURL:'/api' + '/v1/projects/'
    if (!res.ok) {
      alert(res.message || "Failed to fetch projects");
      return;
    }
    const raw = res.data?.projects ?? [];
    const mapped = raw.map(mapApiToUI);
    // optional: sort by createdAt desc
    mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    setProjects(mapped);
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
    setLoadingCreate(true);
    const res = await api.post<ApiProject>("/v1/projects/", { name, description });
    setLoadingCreate(false);

    if (!res.ok) {
      alert(res.message || "Create project failed");
      return;
    }

    const created = mapApiToUI(res.data);
    setProjects((prev) => [created, ...prev]);
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
  };

  // ====== detail handlers ======
  const onOpenDetail = async (p: Project) => {
    // mở ngay bằng dữ liệu hiện có
    setDetailData(p);

    // gọi GET detail để sync dữ liệu mới nhất
    const res = await api.get<ApiProject>(`/v1/projects/${p.id}`);
    if (res.ok) {
      setDetailData(mapApiToUI(res.data));
    } else {
      // không chặn UI; chỉ log
      console.warn("Get detail failed:", res.message);
    }
  };

  const onDetailChange = (p: Project) => setDetailData(p);
  const onCloseDetail = () => setDetailData(null);

  const onSaveDetail = async () => {
    // Spec bạn đưa CHƯA có endpoint update -> báo nhẹ nhàng
    setLoadingSaveDetail(true);
    setTimeout(() => {
      setLoadingSaveDetail(false);
      alert("Update project chưa được backend hỗ trợ trong spec hiện tại.");
    }, 300);
  };

  const onDeleteDetail = async () => {
    // Spec bạn đưa CHƯA có endpoint delete -> báo nhẹ nhàng
    setLoadingDeleteDetail(true);
    setTimeout(() => {
      setLoadingDeleteDetail(false);
      alert("Delete project chưa được backend hỗ trợ trong spec hiện tại.");
    }, 300);
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
    />
  );
};

export default ProjectManagementLogic;
