// src/pages/TurbinePage.tsx
import React from "react";
import Sidebar from "../components/sidebar";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import ModalForm from "../components/Modal";
import type { FieldColumn } from "../components/Modal";
import "../styles/ProjectManagementPage.css";
import Breadcrumb from "../components/breadcrumb";

export type TurbineUI = {
  id: string;
  name: string;
  description?: string;

  windfarmId: string;
  windfarmName?: string;

  serialNo?: string;
  capacityMw?: number;
  coordinates?: string;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

type CreateValues = {
  name: string;
  serialNo?: string;
  capacityMw?: string; // input text, convert to number ở logic
  coordinates?: string;
  description?: string;
};

type Props = {
  // context
  projectId?: string;
  projectName?: string;
  windfarmId?: string;
  windfarmName?: string;

  // list
  turbines: TurbineUI[];
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
  onOpenDetail: (tb: TurbineUI) => void;
  onCloseDetail: () => void;
  detailValues: Record<string, string>;
  setDetailValue: (k: string, v: string) => void;
  onDetailSave: () => void;
  loadingDetail?: boolean;
  loadingUpdate?: boolean;

  // delete
  onDelete: (tb: TurbineUI) => void;
  loadingDeleteId?: string | null;

  // optional row click
  onRowClick?: (tb: TurbineUI) => void;
};

const truncate = (s?: string, n = 120) =>
  (s ?? "").length > n ? `${s!.slice(0, n)}…` : (s ?? "");

const TurbinePage: React.FC<Props> = ({
  projectId,
  projectName,
  windfarmId,
  windfarmName,

  turbines,
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
  const columns: Column<TurbineUI>[] = [
    { key: "index", header: "#", align: "center", render: (_r, i) => i + 1, headerClassName: "col-center", className: "col-center" },
    { key: "name", header: "Turbine", sortable: true, sortAccessor: (r) => r.name.toLowerCase(), className: "project" },
    { key: "serialNo", header: "Serial No.", sortable: true, sortAccessor: (r) => (r.serialNo ?? "").toLowerCase() },
    { key: "capacityMw", header: "Capacity (MW)", align: "right", sortable: true, sortAccessor: (r) => r.capacityMw ?? 0 },
    { key: "coordinates", header: "Coordinates", sortable: true, sortAccessor: (r) => (r.coordinates ?? "").toLowerCase() },
    { key: "description", header: "Description", sortable: true, sortAccessor: (r) => (r.description ?? "").toLowerCase(), render: (r) => truncate(r.description, 140) },
    { key: "windfarmName", header: "Windfarm", sortable: true, sortAccessor: (r) => (r.windfarmName ?? "").toLowerCase() },
    { key: "createdAt", header: "Created At", sortable: true, sortAccessor: (r) => (r.createdAt ?? "") },
    { key: "updatedAt", header: "Updated At", sortable: true, sortAccessor: (r) => (r.updatedAt ?? "") },
    {
      key: "actions",
      header: "Action",
      render: (tb) => (
        <>
          <Button variant="detail" style={{ marginRight: 8 }} onClick={(e: any) => { e.stopPropagation(); onOpenDetail(tb); }}>
            Detail
          </Button>
          <Button variant="delete" onClick={(e: any) => { e.stopPropagation(); onDelete(tb); }} loading={loadingDeleteId === tb.id}>
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
    { key: "serialNo", label: "Serial No.", type: "text", editable: true },
    { key: "capacityMw", label: "Capacity (MW)", type: "number", editable: true },
    { key: "coordinates", label: "Coordinates (lat,lng)", type: "text", editable: true },
    { key: "description", label: "Description", type: "textarea", editable: true },
  ];

  const detailFields: FieldColumn[] = [
    { key: "id", label: "ID", type: "text", editable: false },
    { key: "windfarmId", label: "Windfarm ID", type: "text", editable: false },
    { key: "windfarmName", label: "Windfarm Name", type: "text", editable: false },
    { key: "name", label: "Name", type: "text", editable: true },
    { key: "serialNo", label: "Serial No.", type: "text", editable: true },
    { key: "capacityMw", label: "Capacity (MW)", type: "number", editable: true },
    { key: "coordinates", label: "Coordinates", type: "text", editable: true },
    { key: "description", label: "Description", type: "textarea", editable: true },
    { key: "createdAt", label: "Created At", type: "text", editable: false },
    { key: "updatedAt", label: "Updated At", type: "text", editable: false },
    { key: "createdBy", label: "Created By", type: "text", editable: false },
  ];

  const canCreate = createValues.name.trim();
  const canSaveDetail = (detailValues.name ?? "").trim();

  return (
    <div className="ProjectManagementPage">
      <aside className="sidebar-content"><Sidebar /></aside>
      <main className="main-content">
        <div className="content-body">
          <div className="page-title">
            <Breadcrumb
              items={[
                { label: "Projects", path: "/project-management" },
                projectName ? { label: projectName, path: projectId ? `/project/${projectId}` : undefined } : undefined,
                windfarmName ? { label: windfarmName, path: windfarmId ? `/winfarm/${windfarmId}` : undefined } : undefined,
                { label: "Turbines" },
              ].filter(Boolean) as any}
            />
          </div>

          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder={`Search by name/serial${windfarmName ? ` in ${windfarmName}` : ""}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="toolbar-actions" style={{ display: "flex", gap: 8 }}>
              <Button variant="submit" onClick={onOpenCreate}>+ Create</Button>
            </div>
          </div>

          <div className="table-section">
            <GenericTable<TurbineUI>
              data={turbines}
              columns={columns}
              loading={!!loadingList}
              emptyText="No turbines"
              stickyHeader
              cellProps={(_row, col) => col.key === "actions" ? { onClick: (e) => e.stopPropagation() } : {}}
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onRowClick={onRowClick}
            />
          </div>
        </div>
      </main>

      {showCreateModal && (
        <ModalForm
          isOpen={showCreateModal}
          header="Create Turbine"
          fields={createFields}
          values={createValues}
          onChange={(k, v) => setCreateValues(k as keyof CreateValues, v)}
          onClose={onCloseCreate}
          onSave={onCreateSubmit}
          footer={
            <>
              <Button variant="cancel" onClick={onCloseCreate}>Cancel</Button>
              <Button variant="submit" onClick={onCreateSubmit} loading={!!loadingCreate} disabled={!canCreate || !!loadingCreate}>
                Create
              </Button>
            </>
          }
        />
      )}

      {showDetailModal && (
        <ModalForm
          isOpen={showDetailModal}
          header="Turbine Detail"
          fields={detailFields}
          values={detailValues}
          onChange={(k, v) => setDetailValue(k, v)}
          onClose={onCloseDetail}
          onSave={onDetailSave}
          footer={
            <>
              <Button variant="cancel" onClick={onCloseDetail}>Close</Button>
              <Button variant="submit" onClick={onDetailSave} loading={!!loadingUpdate || !!loadingDetail} disabled={!!loadingDetail || !!loadingUpdate || !canSaveDetail}>
                Save
              </Button>
            </>
          }
        />
      )}
    </div>
  );
};

export default TurbinePage;
