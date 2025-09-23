import React from "react";
import Sidebar from "../components/sidebar";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import "../styles/ProjectManagementPage.css"; // tái dùng CSS

export type ProjectLite = {
  id: string;
  name: string;
  windfarmCount: number;
  description: string;
  performance: string;
  createdAt: string;
  status: string;
  managedBy: string; // hiển thị ở cột cuối
};

type ProjectPageProps = {
  projects: ProjectLite[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  loadingList?: boolean;
  onRowClick?: (p: ProjectLite) => void;
};

const statusClass = (s: string) => {
  switch (s) {
    case "ACTIVE": return "status-active";
    case "NOT_STARTED": return "status-notstarted";
    case "PAUSED": return "status-paused";
    case "COMPLETED": return "status-completed";
    default: return "status-unknown";
  }
};

const ProjectPage: React.FC<ProjectPageProps> = ({
  projects,
  searchTerm,
  setSearchTerm,
  loadingList,
  onRowClick,
}) => {
  const columns: Column<ProjectLite>[] = [
    {
      key: "index",
      header: "#",
      size: 0.06,
      align: "center",
      render: (_row, i) => i + 1,
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
      render: (p) => <span className={statusClass(p.status)}>{p.status}</span>,
    },
    {
      key: "managedBy",
      header: "Managed by",
      size: 0.18,
      className: "managed-by",
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
          </div>

          {/* Bảng: dùng props mới của GenericTable */}
          <div className="table-section">
            <GenericTable<ProjectLite>
              data={projects}
              columns={columns}
              loading={!!loadingList}
              emptyText="No projects"
              stickyHeader
              onRowClick={onRowClick}
              rowClassName={() => "row-clickable"} // cursor pointer
              // cellAutoTooltip mặc định true → có title khi text dài
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
