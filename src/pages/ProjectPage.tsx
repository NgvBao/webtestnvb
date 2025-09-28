import React, { useState } from "react";
import GenericTable, { type Column } from "../components/table";
import type { ProjectUI } from "../api/types/typesprojectService";
import ModalForm from "../components/Modal";
import "../styles/ProjectManagementPage.css";

type ProjectPageProps = {
  projects: ProjectUI[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  loadingList?: boolean;
  onRowClick?: (p: ProjectUI) => void;

  // pagination props
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (p: number) => void;
};

// format: hh:mm:ss dd/mm/yy
const formatDate = (iso?: string | null) => {
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

const ProjectPage: React.FC<ProjectPageProps> = ({
  projects,
  searchTerm,
  setSearchTerm,
  loadingList,
  onRowClick,
  page,
  pageSize,
  total,
  onPageChange,
}) => {
  const [showDescModal, setShowDescModal] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState("");

  const columns: Column<ProjectUI>[] = [
    {
      key: "index",
      header: "#",
      align: "center",
      render: (_row, i) => i + 1,
      className: "col-center",
    },
    {
      key: "name",
      header: "Project",
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
    },
    {
      key: "created_at",
      header: "Created",
      align: "right",
      sortable: true,
      render: (p) => formatDate(p.created_at),
    },
    {
      key: "updated_at",
      header: "Updated",
      align: "right",
      sortable: true,
      render: (p) => formatDate(p.updated_at),
    },
    {
      key: "windfarm_count",
      header: "Windfarms",
      align: "center",
      sortable: true,
      render: (p) => p.windfarm_count ?? 0,
    },
    {
      key: "turbine_count",
      header: "Turbines",
      align: "center",
      sortable: true,
      render: (p) => p.turbine_count ?? 0,
    },
    {
      key: "description",
      header: "Description",
      align: "center",
      render: (p) =>
        p.description ? (
          <button
            className="btn-detail"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDesc(p.description ?? "");
              setShowDescModal(true);
            }}
          >
            View
          </button>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      render: (p) => (
        <span className={`status-${p.status?.toLowerCase()}`}>{p.status}</span>
      ),
    },
    {
      key: "managedBy",
      header: "Managed by",
      render: (p) =>
        p.created_by ? (
          <div>
            <span>{p.created_by.email}</span>
            {p.user_role && (
              <span
                style={{
                  marginLeft: 6,
                  padding: "2px 6px",
                  background: "#eef",
                  borderRadius: 4,
                  fontSize: "0.75em",
                  fontWeight: 600,
                }}
              >
                {p.user_role.toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="ProjectManagementContent">
      {/* ✅ Page Title */}
      <h1 className="page-title">Project</h1>

      {/* ✅ Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search project name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Table with pagination */}
      <div className="table-section">
        <GenericTable<ProjectUI>
          data={projects}
          columns={columns}
          loading={!!loadingList}
          emptyText="No projects"
          stickyHeader
          onRowClick={onRowClick}
          rowClassName={() => "row-clickable"}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      </div>

      {/* ✅ Modal Description */}
      {showDescModal && (
        <ModalForm
          isOpen={showDescModal}
          header="Project Description"
          fields={[
            {
              key: "description",
              label: "Description",
              type: "textarea",
              editable: false,
            },
          ]}
          values={{ description: selectedDesc }}
          onChange={() => {}}
          onClose={() => setShowDescModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectPage;
