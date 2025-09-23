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
  status: string;
};

type ProjectManagementPageProps = {
  // Data + search
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

  // Actions (từ Logic)
  onManageClick?: (p: Project) => void;
  onDeleteClick?: (p: Project) => void;

  // Loading trong bảng & xoá theo hàng
  loadingList?: boolean;
  loadingDeleteId?: string | null; // per-row spinner
};

const statusClass = (s: string) => {
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

  onManageClick,
  onDeleteClick,

  loadingList,
  loadingDeleteId,
}) => {
  // ===== Create Modal fields =====
  const createFields = [
    { key: "name", label: "Project Name", editable: true },
    {
      key: "description",
      label: "Description",
      editable: true,
      type: "textarea" as const,
    },
  ];
  const createValues: Record<string, string> = {
    name: newName,
    description: newDescription,
  };

  // ===== Columns =====
  const columns: Column<Project>[] = [
    {
      key: "index",
      header: "#",
      size: 0.06,
      align: "center",
      sortable: false,
      render: (_row, i) => i + 1, // ✅ _row thay vì row
      headerClassName: "col-center",
      className: "col-center",
    },
    {
      key: "name",
      header: "Project",
      size: 0.26,
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
      className: "project",
    },
    {
      key: "createdAt",
      header: "Created",
      size: 0.16,
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.createdAt || "",
      className: "created",
      headerClassName: "col-right",
    },
    {
      key: "windfarmCount",
      header: "Windfarms",
      size: 0.12,
      align: "center",
      sortable: true,
      sortAccessor: (r) => r.windfarmCount,
      className: "windfarms col-center",
      headerClassName: "col-center",
      render: (p) => p.windfarmCount,
    },
    {
      key: "performance",
      header: "Performance",
      size: 0.16,
      sortable: false,
      className: "performance",
    },
    {
      key: "status",
      header: "Status",
      size: 0.12,
      align: "center",
      sortable: true,
      sortAccessor: (r) => r.status,
      className: "status col-center",
      headerClassName: "col-center",
      render: (p) => (
        <span className={statusClass(String(p.status))}>{p.status}</span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      size: 0.18,
      align: "left",
      sortable: false,
      className: "action-cell",
      render: (p) => (
        <>
          <Button
            variant="detail"
            style={{ marginRight: "0.5rem" }}
            onClick={(e: any) => {
              e.stopPropagation();
              onManageClick?.(p);
            }}
          >
            Management
          </Button>
          <Button
            variant="delete"
            onClick={(e: any) => {
              e.stopPropagation();
              onDeleteClick?.(p);
            }}
            loading={loadingDeleteId === p.id}
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
            <div className="toolbar-actions">
              <Button
                variant="submit"
                onClick={onCreateClick}
                loading={!!loadingCreate}
              >
                + Create
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="table-section">
            <GenericTable<Project>
              data={projects}
              columns={columns}
              loading={!!loadingList}
              emptyText="No projects"
              stickyHeader
              cellProps={(_row, col) => {
                if (col.key === "actions") {
                  return { onClick: (e) => e.stopPropagation() };
                }
                return {};
              }}
              // onRowClick={(p) => onManageClick?.(p)}
              rowClassName={(_r) => undefined}
            />
          </div>
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
          onSave={() =>
            onCreateSubmit(newName.trim(), newDescription.trim())
          }
          footer={
            <>
              <Button variant="cancel" onClick={onCancelCreate}>
                Cancel
              </Button>
              <Button
                variant="submit"
                onClick={() =>
                  onCreateSubmit(newName.trim(), newDescription.trim())
                }
                loading={!!loadingCreate}
                disabled={!newName.trim()}
              >
                Create
              </Button>
            </>
          }
        />
      )}
    </div>
  );
};

export default ProjectManagementPage;
