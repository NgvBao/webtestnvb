import React from "react";
import Sidebar from "../components/sidebar";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import ModalForm from "../components/Modal";
import type { FieldColumn } from "../components/Modal";
import Breadcrumb from "../components/breadcrumb";
import "../styles/ProjectManagementPage.css";
import "../styles/WindfarmAdminPage.css";

export type WindfarmUI = {
  id: string;
  name: string;
  description?: string;
  own_company?: string;
  location?: string;

  projectId: string;
  projectName?: string;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;

  turbineCount: number;
};

type Props = {
  // list
  windfarms: WindfarmUI[];
  loadingList?: boolean;

  // client-side search (vì listAll không nhận search)
  searchTerm: string;
  setSearchTerm: (s: string) => void;

  // paging (server)
  total?: number;
  limit?: number;
  offset?: number;
  onOffsetChange?: (nextOffset: number) => void;

  // detail/edit
  showDetailModal: boolean;
  onOpenDetail: (wf: WindfarmUI) => void;
  onCloseDetail: () => void;
  detailValues: Record<string, string>;
  setDetailValue: (k: string, v: string) => void;
  onDetailSave: () => void;
  loadingDetail?: boolean;
  loadingUpdate?: boolean;

  // delete
  onDelete: (wf: WindfarmUI) => void;
  loadingDeleteId?: string | null;
};

// ---- Format hh:mm:ss dd/mm/yy (local time) ----
const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yy = String(d.getFullYear()).slice(-2);
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${hh}:${mi}:${ss} ${dd}/${mm}/${yy}`;
};

const WindfarmAdminPage: React.FC<Props> = ({
  windfarms,
  loadingList,
  searchTerm,
  setSearchTerm,
  total = 0,
  limit = 50,
  offset = 0,
  onOffsetChange,

  showDetailModal,
  onOpenDetail,
  onCloseDetail,
  detailValues,
  setDetailValue,
  onDetailSave,
  loadingDetail,
  loadingUpdate,

  onDelete,
  loadingDeleteId,
}) => {
  // ===== Columns: gọn, khoa học =====
  const columns: Column<WindfarmUI>[] = [
    {
      key: "index",
      header: "#",
      align: "center",
      headerClassName: "col-center",
      className: "col-center",
      render: (_r, i) => (offset || 0) + i + 1, // đánh số liên tục theo trang
    },
    {
      key: "name",
      header: "Windfarm",
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
      render: (r) => <span className="wf-name" title={r.name}>{r.name}</span>,
      className: "wf-col-name",
    },
    {
      key: "companyLocation",
      header: "Company / Location",
      render: (r) => {
        const text = `${r.own_company || "-"} — ${r.location || "-"}`;
        return (
          <span className="one-line-ellipsis" title={text}>
            {text}
          </span>
        );
      },
      className: "wf-col-company",
    },
    {
      key: "projectName",
      header: "Project",
      sortable: true,
      sortAccessor: (r) => (r.projectName ?? "").toLowerCase(),
      render: (r) => r.projectName || "-",
      className: "wf-col-project",
    },
    {
      key: "description",
      header: "Description",
      render: (r) =>
        r.description ? (
          <span className="line-clamp-2" title={r.description}>
            {r.description}
          </span>
        ) : (
          "-"
        ),
      className: "wf-col-desc",
    },
    {
      key: "turbineCount",
      header: "Turbines",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.turbineCount ?? 0,
      render: (r) => r.turbineCount ?? 0,
      className: "col-right",
    },
    {
      key: "createdAt",
      header: "Created At",
      sortable: true,
      sortAccessor: (r) => r.createdAt ?? "",
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: "updatedAt",
      header: "Updated At",
      sortable: true,
      sortAccessor: (r) => r.updatedAt ?? "",
      render: (r) => formatDate(r.updatedAt),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
      sortAccessor: (r) => (r.createdBy ?? "").toLowerCase(),
      render: (r) => r.createdBy || "-",
      className: "wf-col-createdby",
    },
    {
      key: "actions",
      header: "Actions",
      render: (wf) => (
        <>
          <Button
            variant="detail"
            style={{ marginRight: 8 }}
            onClick={(e: any) => {
              e.stopPropagation();
              onOpenDetail(wf);
            }}
          >
            Detail
          </Button>
          <Button
            variant="delete"
            onClick={(e: any) => {
              e.stopPropagation();
              onDelete(wf);
            }}
            loading={loadingDeleteId === wf.id}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  // ===== Pagination mapping: offset/limit → page =====
  const pageSize = limit || 50;
  const page = Math.floor((offset || 0) / pageSize) + 1;
  const handlePageChange = (nextPage: number) => {
    if (!onOffsetChange) return;
    onOffsetChange((nextPage - 1) * pageSize);
  };

  // ===== Detail modal fields =====
  const detailFields: FieldColumn[] = [
    { key: "id", label: "ID", type: "text", editable: false },
    { key: "name", label: "Name", type: "text", editable: true },
    { key: "own_company", label: "Own Company", type: "text", editable: true },
    { key: "location", label: "Location", type: "text", editable: true },
    { key: "description", label: "Description", type: "textarea", editable: true },
    { key: "projectId", label: "Project ID", type: "text", editable: false },
    { key: "projectName", label: "Project Name", type: "text", editable: false },
    { key: "turbineCount", label: "Turbines", type: "number", editable: false },
    { key: "createdAt", label: "Created At", type: "text", editable: false },
    { key: "updatedAt", label: "Updated At", type: "text", editable: false },
    { key: "createdBy", label: "Created By", type: "text", editable: false },
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
          {/* Header + Breadcrumb */}
          <div className="page-title">
            <Breadcrumb items={[{ label: "Admin" }, { label: "Windfarms" }]} />
            <h2 style={{ marginTop: 6 }}>All Windfarms</h2>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name / company / location / project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="toolbar-actions" />
          </div>

          {/* Table */}
          <div className="table-section">
            <GenericTable<WindfarmUI>
              data={windfarms}
              columns={columns}
              loading={!!loadingList}
              emptyText="No windfarms"
              stickyHeader
              cellProps={(_row, col) =>
                col.key === "actions" ? { onClick: (e) => e.stopPropagation() } : {}
              }
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>

      {/* Detail/Edit Modal */}
      {showDetailModal && (
        <ModalForm
          isOpen={showDetailModal}
          header="Windfarm Detail"
          fields={detailFields}
          values={detailValues}
          onChange={(k, v) => setDetailValue(k, v)}
          onClose={onCloseDetail}
          onSave={onDetailSave}
          footer={
            <>
              <Button variant="cancel" onClick={onCloseDetail}>
                Close
              </Button>
              <Button
                variant="submit"
                onClick={onDetailSave}
                loading={!!loadingUpdate || !!loadingDetail}
                disabled={!!loadingDetail || !!loadingUpdate}
              >
                Save
              </Button>
            </>
          }
        />
      )}
    </div>
  );
};

export default WindfarmAdminPage;
