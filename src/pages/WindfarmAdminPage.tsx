import React from "react";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import ModalForm from "../components/Modal";
import type { FieldColumn } from "../components/Modal";
import Breadcrumb from "../components/breadcrumb";
import "../styles/ProjectManagementPage.css"; // dùng chung CSS
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
  windfarms: WindfarmUI[];
  loadingList?: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  total?: number;
  limit?: number;
  offset?: number;
  onOffsetChange?: (nextOffset: number) => void;

  showDetailModal: boolean;
  onOpenDetail: (wf: WindfarmUI) => void;
  onCloseDetail: () => void;
  detailValues: Record<string, string>;
  setDetailValue: (k: string, v: string) => void;
  onDetailSave: () => void;
  loadingDetail?: boolean;
  loadingUpdate?: boolean;

  onDelete: (wf: WindfarmUI) => void;
  loadingDeleteId?: string | null;
};

// format date
const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(
    d.getFullYear()
  ).slice(-2)}`;
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
  // columns
  const columns: Column<WindfarmUI>[] = [
    {
      key: "index",
      header: "#",
      align: "center",
      headerClassName: "col-center",
      className: "col-center",
      render: (_r, i) => (offset || 0) + i + 1,
    },
    {
      key: "name",
      header: "Windfarm",
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
      render: (r) => (
        <span className="wf-name" title={r.name}>
          {r.name}
        </span>
      ),
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
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: "updatedAt",
      header: "Updated At",
      sortable: true,
      render: (r) => formatDate(r.updatedAt),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
      render: (r) => r.createdBy || "-",
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

  // paging
  const pageSize = limit || 50;
  const page = Math.floor((offset || 0) / pageSize) + 1;
  const handlePageChange = (nextPage: number) => {
    onOffsetChange?.((nextPage - 1) * pageSize);
  };

  // detail modal fields
  const detailFields: FieldColumn[] = [
    { key: "id", label: "ID", editable: false },
    { key: "name", label: "Name", editable: true },
    { key: "own_company", label: "Own Company", editable: true },
    { key: "location", label: "Location", editable: true },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      editable: true,
    },
    { key: "projectId", label: "Project ID", editable: false },
    { key: "projectName", label: "Project Name", editable: false },
    { key: "turbineCount", label: "Turbines", editable: false },
    { key: "createdAt", label: "Created At", editable: false },
    { key: "updatedAt", label: "Updated At", editable: false },
    { key: "createdBy", label: "Created By", editable: false },
  ];

  return (
    <div className="ProjectManagementContent">
      {/* Header + Breadcrumb */}
      <div className="page-title">
        <Breadcrumb items={[{ label: "Admin" }, { label: "Windfarms" }]} />
        <h2 className="page-subtitle">All Windfarms</h2>
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

      {/* Detail Modal */}
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
