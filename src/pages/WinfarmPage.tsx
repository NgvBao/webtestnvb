// src/pages/WinfarmPage.tsx
import React from "react";
import Sidebar from "../components/sidebar";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import ModalForm from "../components/Modal";
import type { FieldColumn } from "../components/Modal";
import "../styles/ProjectManagementPage.css";

export type WindfarmUI = {
  id: string;
  projectId: string;
  name: string;
  location: string;
  createdAt?: string;
  turbineCount?: number; // read-only hiển thị trong detail
};

// form create
type CreateValues = {
  name: string;
  location: string;
};

type Props = {
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
};

const WindfarmPage: React.FC<Props> = ({
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
}) => {
  // ===== Columns (giản lược đúng schema) =====
  const columns: Column<WindfarmUI>[] = [
    {
      key: "index",
      header: "#",
      size: 0.08,
      align: "center",
      render: (_r, i) => i + 1,
      headerClassName: "col-center",
      className: "col-center",
    },
    {
      key: "name",
      header: "Windfarm",
      size: 0.42,
      sortable: true,
      sortAccessor: (r) => r.name.toLowerCase(),
      className: "project",
    },
    {
      key: "location",
      header: "Location",
      size: 0.30,
      sortable: true,
      sortAccessor: (r) => r.location.toLowerCase(),
    },
    {
      key: "actions",
      header: "Action",
      size: 0.20,
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

  // ===== Pagination mapping: offset/limit → page/pageSize =====
  const pageSize = limit || 50;
  const page = Math.floor((offset || 0) / pageSize) + 1;
  const handlePageChange = (nextPage: number) => {
    if (!onOffsetChange) return;
    onOffsetChange((nextPage - 1) * pageSize);
  };

  // ===== Create modal fields (chỉ Name/Location) =====
  const createFields: FieldColumn[] = [
    { key: "name", label: "Name", type: "text", editable: true },
    { key: "location", label: "Location", type: "text", editable: true },
  ];

  // ===== Detail modal fields (Name/Location editable, Turbines read-only) =====
  const detailFields: FieldColumn[] = [
    { key: "name", label: "Name", type: "text", editable: true },
    { key: "location", label: "Location", type: "text", editable: true },
    { key: "turbineCount", label: "Turbines", type: "number", editable: false },
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
              placeholder={`Search windfarm name/location${projectName ? ` in ${projectName}` : ""}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="toolbar-actions">
              <Button variant="submit" onClick={onOpenCreate}>
                + Create
              </Button>
            </div>
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

      {/* Create Modal */}
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
                disabled={!createValues.name.trim() || !createValues.location.trim()}
              >
                Create
              </Button>
            </>
          }
        />
      )}

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
