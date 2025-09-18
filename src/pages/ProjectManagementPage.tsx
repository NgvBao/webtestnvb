// src/pages/ProjectManagementPage.tsx
import React from "react";
import Sidebar from "../components/sidebar";
import ModalForm from "../components/Modal";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import "../styles/ProjectManagementPage.css";

export type Project = {
  id: string;
  name: string;
  windfarmCount: number;
  description: string;
  performance: string;
  createdAt: string;
  status: string; // nhận enum thô từ BE: NOT_STARTED/ACTIVE/...
};

type ProjectManagementPageProps = {
  projects: Project[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;

  // Create modal
  showCreateModal: boolean;
  newName: string;
  setNewName: (s: string) => void;
  newDescription: string;
  setNewDescription: (s: string) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  onCreateSubmit: (name: string, description: string) => void;
  loadingCreate?: boolean;

  // Detail modal
  detailData: Project | null;
  onOpenDetail: (p: Project) => void;
  onDetailChange: (p: Project) => void;
  onCloseDetail: () => void;
  onSaveDetail: () => void;
  onDeleteDetail: () => void;
  loadingSaveDetail?: boolean;
  loadingDeleteDetail?: boolean;

  // Extra
  loadingList?: boolean;
};

const statusClass = (s: string) => {
  // Map enum -> class cho badge
  switch (s) {
    case "ACTIVE":
      return "status-active";
    case "NOT_STARTED":
      return "status-notstarted";
    case "PAUSED":
      return "status-paused";
    case "COMPLETED":
      return "status-completed";
    default:
      return "status-unknown";
  }
};

const ProjectManagementPage: React.FC<ProjectManagementPageProps> = ({
  projects,
  searchTerm,
  setSearchTerm,

  showCreateModal,
  newName,
  setNewName,
  newDescription,
  setNewDescription,
  onCreateClick,
  onCancelCreate,
  onCreateSubmit,
  loadingCreate,

  detailData,
  onOpenDetail,
  onDetailChange,
  onCloseDetail,
  onSaveDetail,
  onDeleteDetail,
  loadingSaveDetail,
  loadingDeleteDetail,

  loadingList,
}) => {
  // ===== Fields (Detail) =====
  const detailFields = [
    { key: "name",           label: "Project Name",  editable: true },
    { key: "windfarmCount",  label: "Windfarms",     editable: false },
    { key: "description",    label: "Description",   editable: true,  type: "textarea" as const },
    { key: "performance",    label: "Performance",   editable: false },
    { key: "createdAt",      label: "Created At",    editable: false },
    { key: "status",         label: "Status",        editable: false },
  ];

  const detailValues: Record<string, string> = detailData
    ? {
        name: detailData.name ?? "",
        windfarmCount: String(detailData.windfarmCount ?? ""),
        description: detailData.description ?? "",
        performance: detailData.performance ?? "",
        createdAt: detailData.createdAt ?? "",
        status: String(detailData.status ?? ""),
      }
    : { name: "", windfarmCount: "", description: "", performance: "", createdAt: "", status: "" };

  const handleDetailFieldChange = (key: string, value: string) => {
    if (!detailData) return;
    if (key === "name")        onDetailChange({ ...detailData, name: value });
    if (key === "description") onDetailChange({ ...detailData, description: value });
  };

  // ===== Fields (Create) =====
  const createFields = [
    { key: "name",        label: "Project Name", editable: true },
    { key: "description", label: "Description",  editable: true, type: "textarea" as const },
  ];
  const createValues: Record<string, string> = {
    name: newName,
    description: newDescription,
  };

  // ===== Columns =====
  const columns: Column<Project>[] = [
    { key: "index", header: "#", size: 0.06, render: (_row, i) => i + 1 },
    { key: "name", header: "Project", size: 0.26, className: "project" },
    { key: "createdAt", header: "Created", size: 0.16, className: "created" },
    {
      key: "windfarmCount",
      header: "Windfarms",
      size: 0.12,
      className: "windfarms",
      render: (p) => (
        <span style={{ display: "inline-block", width: "100%", textAlign: "center" }}>
          {p.windfarmCount}
        </span>
      ),
    },
    { key: "performance", header: "Performance", size: 0.16, className: "performance" },
    {
      key: "status",
      header: "Status",
      size: 0.12,
      className: "status",
      render: (p) => <span className={statusClass(String(p.status))}>{p.status}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      size: 0.12,
      className: "action-cell",
      render: (p) => (
        <>
          <Button variant="detail" style={{ marginRight: "0.5rem" }} onClick={() => onOpenDetail(p)}>
            Detail
          </Button>
          <Button
            variant="delete"
            onClick={() => onDeleteDetail()}
            loading={!!loadingDeleteDetail /* có thể đổi theo per-row id nếu cần */}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="ProjectManagementPage">
      {/* Sidebar */}
      <aside className="sidebar-content">
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="content-body">
          {/* Toolbar */}
          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search project name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button className="btn-create" onClick={onCreateClick}>
              + Create
            </button>
          </div>

          {/* Loading / Empty / Table */}
          {loadingList ? (
            <div className="list-loading">Loading projects…</div>
          ) : projects.length === 0 ? (
            <div className="list-empty">No projects</div>
          ) : (
            <GenericTable<Project> data={projects} columns={columns} />
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <ModalForm
          isOpen={showCreateModal}
          header="Create Project"
          fields={createFields}
          values={createValues}
          onChange={(key, v) => {
            if (key === "name") setNewName(v);
            if (key === "description") setNewDescription(v);
          }}
          onClose={onCancelCreate}
          onSave={() => onCreateSubmit(newName.trim(), newDescription.trim())}
          footer={
            <>
              <Button variant="cancel" onClick={onCancelCreate}>
                Cancel
              </Button>
              <Button
                variant="submit"
                onClick={() => onCreateSubmit(newName.trim(), newDescription.trim())}
                loading={!!loadingCreate}
                disabled={!newName.trim()}
              >
                Create
              </Button>
            </>
          }
        />
      )}

      {/* Detail Modal */}
      {detailData && (
        <ModalForm
          isOpen={!!detailData}
          header="Project Detail"
          fields={detailFields as any}
          values={detailValues}
          onChange={handleDetailFieldChange}
          onClose={onCloseDetail}
          onSave={onSaveDetail}
          footer={
            <>
              <Button variant="cancel" onClick={onCloseDetail}>
                Close
              </Button>
              <Button variant="delete" onClick={onDeleteDetail} loading={!!loadingDeleteDetail}>
                Delete
              </Button>
              <Button variant="submit" onClick={onSaveDetail} loading={!!loadingSaveDetail}>
                Save
              </Button>
            </>
          }
        />
      )}
    </div>
  );
};

export default ProjectManagementPage;
