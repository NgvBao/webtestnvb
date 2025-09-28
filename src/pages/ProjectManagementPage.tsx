import React from "react";
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
  projects: Project[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;

  showCreateModal: boolean;
  newName: string;
  setNewName: (s: string) => void;
  newDescription: string;
  setNewDescription: (s: string) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  onCreateSubmit: (name: string, description: string) => void;
  loadingCreate?: boolean;

  onManageClick?: (p: Project) => void;
  onDeleteClick?: (p: Project) => void;

  loadingList?: boolean;
  loadingDeleteId?: string | null;
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

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(
    d.getFullYear()
  ).slice(-2)}`;
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
  const columns: Column<Project>[] = [
    {
      key: "index",
      header: "#",
      size: 0.05,
      align: "center",
      render: (_row, i) => i + 1,
      headerClassName: "col-center",
      className: "col-center",
    },
    {
      key: "name",
      header: "Project",
      size: 0.25,
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
    },
    {
      key: "createdAt",
      header: "Created",
      size: 0.16,
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.createdAt || "",
      headerClassName: "col-right",
      className: "col-right",
      render: (p) => formatDate(p.createdAt),
    },
    {
      key: "windfarmCount",
      header: "Windfarms",
      size: 0.12,
      align: "center",
      sortable: true,
      sortAccessor: (r) => r.windfarmCount,
      headerClassName: "col-center",
      className: "col-center",
      render: (p) => p.windfarmCount,
    },
    { key: "performance", header: "Performance", size: 0.16 },
    {
      key: "status",
      header: "Status",
      size: 0.12,
      align: "center",
      sortable: true,
      sortAccessor: (r) => r.status,
      headerClassName: "col-center",
      className: "col-center",
      render: (p) => <span className={statusClass(p.status)}>{p.status}</span>,
    },
    {
      key: "actions",
      header: "Action",
      size: 0.18,
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
    <div className="ProjectManagementContent">
      <h1 className="page-title">Project Management</h1>

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
            variant="create"
            onClick={onCreateClick}
            loading={!!loadingCreate}
          >
            + Create
          </Button>
        </div>
      </div>

      <div className="table-section">
        <GenericTable<Project>
          data={projects}
          columns={columns}
          loading={!!loadingList}
          emptyText="No projects"
          stickyHeader
          cellProps={(_row, col) =>
            col.key === "actions" ? { onClick: (e) => e.stopPropagation() } : {}
          }
        />
      </div>

      {showCreateModal && (
        <ModalForm
          isOpen={showCreateModal}
          header="Create Project"
          fields={[
            { key: "name", label: "Project Name", editable: true },
            {
              key: "description",
              label: "Description",
              editable: true,
              type: "textarea",
            },
          ]}
          values={{ name: newName, description: newDescription }}
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
                variant="create"
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
