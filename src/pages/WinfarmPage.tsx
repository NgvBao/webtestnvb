// src/pages/WinfarmPage.tsx
import React from "react";
import Sidebar from "../components/sidebar";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import ModalForm from "../components/Modal";
import type { FieldColumn } from "../components/Modal";
import "../styles/ProjectManagementPage.css";
import Breadcrumb from "../components/breadcrumb";

export type WindfarmUI = {
  id: string;
  name: string;
  description?: string;
  own_company?: string;
  location: string;

  projectId: string;
  projectName?: string;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;

  turbineCount?: number;
};

type CreateValues = { name: string; location: string };

type Props = {
  projectId?: string;
  projectName?: string;

  // list
  windfarms: WindfarmUI[];
  loadingList?: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;

  // paging (server)
  total?: number;
  limit?: number;
  offset?: number;
  onOffsetChange?: (nextOffset: number) => void;

  // create
  showCreateModal: boolean;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  createValues: CreateValues;
  setCreateValues: (k: keyof CreateValues, v: string) => void;
  onCreateSubmit: () => void;
  loadingCreate?: boolean;

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

  // NEW: click row → đi trang turbine
  onRowClick?: (wf: WindfarmUI) => void;
};

const truncate = (s: string | undefined, n = 120) =>
  (s ?? "").length > n ? `${(s ?? "").slice(0, n)}…` : (s ?? "");

const WindfarmPage: React.FC<Props> = ({
  projectId,
  projectName,
  windfarms,
  loadingList,
  searchTerm,
  setSearchTerm,
  total = 0,
  limit = 50,
  offset = 0,
  onOffsetChange,

  showCreateModal,
  onOpenCreate,
  onCloseCreate,
  createValues,
  setCreateValues,
  onCreateSubmit,
  loadingCreate,

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

  onRowClick,
}) => {
  const columns: Column<WindfarmUI>[] = [
    {
      key: "index",
      header: "#",
      align: "center",
      render: (_r, i) => i + 1,
      headerClassName: "col-center",
      className: "col-center",
    },
    {
      key: "name",
      header: "Windfarm",
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
      className: "project",
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      sortAccessor: (r) => r.location.toLowerCase(),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      sortAccessor: (r) => (r.description ?? "").toLowerCase(),
      render: (r) => truncate(r.description, 140),
    },
    {
      key: "own_company",
      header: "Own Company",
      sortable: true,
      sortAccessor: (r) => (r.own_company ?? "").toLowerCase(),
    },
    {
      key: "projectName",
      header: "Project",
      sortable: true,
      sortAccessor: (r) => (r.projectName ?? "").toLowerCase(),
    },
    {
      key: "createdAt",
      header: "Created At",
      sortable: true,
      sortAccessor: (r) => r.createdAt ?? "",
    },
    {
      key: "updatedAt",
      header: "Updated At",
      sortable: true,
      sortAccessor: (r) => r.updatedAt ?? "",
    },
    {
      key: "turbineCount",
      header: "Turbines",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.turbineCount ?? 0,
    },
    {
      key: "actions",
      header: "Action",
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

  const pageSize = limit || 50;
  const page = Math.floor((offset || 0) / pageSize) + 1;

  const handlePageChange = (nextPage: number) => {
    if (!onOffsetChange) return;
    onOffsetChange((nextPage - 1) * pageSize);
  };

  const createFields: FieldColumn[] = [
    { key: "name", label: "Name", type: "text", editable: true },
    { key: "location", label: "Location", type: "text", editable: true },
  ];

  const detailFields: FieldColumn[] = [
    { key: "id", label: "ID", type: "text", editable: false },
    { key: "projectId", label: "Project ID", type: "text", editable: false },
    { key: "projectName", label: "Project Name", type: "text", editable: false },
    { key: "name", label: "Name", type: "text", editable: true },
    { key: "location", label: "Location", type: "text", editable: true },
    { key: "description", label: "Description", type: "textarea", editable: true },
    { key: "own_company", label: "Own Company", type: "text", editable: true },
    { key: "turbineCount", label: "Turbines", type: "number", editable: false },
    { key: "createdAt", label: "Created At", type: "text", editable: false },
    { key: "updatedAt", label: "Updated At", type: "text", editable: false },
    { key: "createdBy", label: "Created By", type: "text", editable: false },
  ];

  const canCreate = createValues.name.trim() && createValues.location.trim();
  const canSaveDetail =
    (detailValues.name ?? "").trim() && (detailValues.location ?? "").trim();

  return (
    <div className="ProjectManagementPage">
      <aside className="sidebar-content">
        <Sidebar />
      </aside>

      <main className="main-content">
        <div className="content-body">
          <div className="page-title">
            <Breadcrumb
              items={[
                { label: "Projects", path: "/project-management" },
                projectName
                  ? {
                      label: projectName,
                      path: projectId ? `/project/${projectId}` : undefined,
                    }
                  : undefined,
                { label: "Windfarms" },
              ].filter(Boolean) as any}
            />
          </div>

          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder={`Search by name/location${
                projectName ? ` in ${projectName}` : ""
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="toolbar-actions" style={{ display: "flex", gap: 8 }}>
              <Button variant="submit" onClick={onOpenCreate}>
                + Create
              </Button>
            </div>
          </div>

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
              onRowClick={onRowClick}
              activateOnKeyboard={false}  
            />
          </div>
        </div>
      </main>

      {showCreateModal && (
        <ModalForm
          isOpen={showCreateModal}
          header="Create Windfarm"
          fields={createFields}
          values={createValues}
          onChange={(k, v) => setCreateValues(k as keyof CreateValues, v)}
          onClose={onCloseCreate}
          onSave={onCreateSubmit}
          footer={
            <>
              <Button variant="cancel" onClick={onCloseCreate}>
                Cancel
              </Button>
              <Button
                variant="submit"
                onClick={onCreateSubmit}
                loading={!!loadingCreate}
                disabled={!canCreate || !!loadingCreate}
              >
                Create
              </Button>
            </>
          }
        />
      )}

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
                disabled={!!loadingDetail || !!loadingUpdate || !canSaveDetail}
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

export default WindfarmPage;
