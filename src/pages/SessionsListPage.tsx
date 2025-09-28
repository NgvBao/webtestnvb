import React, { useMemo } from "react";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import "../styles/SessionsListPage.css";

type Session = {
  id: string;
  name: string;
  created: string;
  images: number;
  note: string;
};

type SessionPageProps = {
  sessions: Session[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  showCreateModal: boolean;
  detailData: Session | null;
  newName: string;
  setNewName: (name: string) => void;

  onRowClick: (ses: Session) => void;
  onOpenDetail: (ses: Session) => void;
  onDetailChange: (ses: Session) => void;

  onCreateClick: () => void;
  onCancelCreate: () => void;
  onCreateSubmit: (name: string) => void;

  onCloseDetail: () => void;
  onSaveDetail: () => void;
  onDeleteDetail: () => void;

  // Note
  viewNoteData: Session | null;
  onOpenNoteView: (ses: Session) => void;
  onCloseNoteView: () => void;
  onEditNote: () => void;

  editNoteData: Session | null;
  onCloseNoteEdit: () => void;
  onSaveNote: (newNote: string) => void;
  onDeleteNote: () => void;
};

const SessionsListPage: React.FC<SessionPageProps> = ({
  sessions,
  searchTerm,
  setSearchTerm,
  showCreateModal,
  detailData,
  newName,
  setNewName,
  onRowClick,
  onOpenDetail,
  onDetailChange,
  onCreateClick,
  onCancelCreate,
  onCreateSubmit,
  onCloseDetail,
  onSaveDetail,
  onDeleteDetail,
  viewNoteData,
  onOpenNoteView,
  onCloseNoteView,
  onEditNote,
  editNoteData,
  onCloseNoteEdit,
  onSaveNote,
  onDeleteNote,
}) => {
  const data = useMemo(() => sessions, [sessions]);

  const columns: Column<Session>[] = [
    {
      key: "created",
      header: "Created",
      size: 0.2,
      render: (s) => s.created,
    },
    {
      key: "name",
      header: "Session",
      size: 0.25,
      render: (s) => s.name,
    },
    {
      key: "images",
      header: "Images",
      size: 0.15,
      align: "center",
      render: (s) => s.images,
    },
    {
      key: "note",
      header: "Note",
      size: 0.25,
      render: (s) => (
        <span
          className="note-view"
          onClick={(e) => {
            e.stopPropagation();
            onOpenNoteView(s);
          }}
        >
          View note
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      size: 0.15,
      align: "center",
      render: (s) => (
        <button
          className="btn-detail"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(s);
          }}
        >
          Detail
        </button>
      ),
    },
  ];

  return (
    <div className="SessionPage">
      <div className="content-body">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Sessions</h1>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search session name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-create" onClick={onCreateClick}>
            + Create
          </button>
        </div>

        {/* ✅ Table dùng component chung */}
        <div className="table-wrap">
          <GenericTable<Session>
            data={data}
            columns={columns}
            emptyText="No sessions found."
            stickyHeader
            rowProps={(row) => ({
              onClick: () => onRowClick(row),
              className: "table-row",
            })}
          />
        </div>

        {/* --- Modal giữ nguyên như cũ --- */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Create Session</h3>
              <div className="modal-body">
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Session Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={onCancelCreate}>
                  Cancel
                </button>
                <button
                  className="btn btn-submit"
                  onClick={() => onCreateSubmit(newName.trim())}
                  disabled={!newName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {detailData && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Session Detail</h3>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={detailData?.name ?? ""}
                    onChange={(e) =>
                      detailData &&
                      onDetailChange({ ...detailData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Created</label>
                  <input
                    type="text"
                    className="modal-input readonly"
                    value={detailData?.created ?? ""}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Images</label>
                  <input
                    type="text"
                    className="modal-input readonly"
                    value={String(detailData?.images ?? "")}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <input
                    type="text"
                    className="modal-input readonly"
                    value={detailData?.note ?? ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={onCloseDetail}>
                  Close
                </button>
                <button className="btn btn-delete" onClick={onDeleteDetail}>
                  Delete
                </button>
                <button className="btn btn-submit" onClick={onSaveDetail}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {viewNoteData && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">View Note</h3>
              <div className="modal-body">
                <p>{viewNoteData.note || "No note yet"}</p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={onCloseNoteView}>
                  Close
                </button>
                <button className="btn btn-submit" onClick={onEditNote}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {editNoteData && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Edit Note</h3>
              <div className="modal-body">
                <textarea
                  className="modal-textarea"
                  defaultValue={editNoteData.note}
                  onChange={(e) =>
                    onDetailChange({ ...editNoteData, note: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={onCloseNoteEdit}>
                  Cancel
                </button>
                <button className="btn btn-delete" onClick={onDeleteNote}>
                  Delete
                </button>
                <button
                  className="btn btn-submit"
                  onClick={() => onSaveNote(editNoteData.note)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsListPage;
