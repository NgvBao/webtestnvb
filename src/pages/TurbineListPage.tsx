import Sidebar from "../components/sidebar";
import "../styles/TurbineListPage.css";
import { Search } from "lucide-react";

type Turbine = {
  id: string;
  name: string;
  company: string;
  created: string;
  images: number;
};

type ReviewPageProps = {
  turbines: Turbine[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  showCreateModal: boolean;
  detailData: Turbine | null;
  newName: string;
  newCompany: string;
  setNewName: (name: string) => void;
  setNewCompany: (company: string) => void;

  onRowClick: (tur: Turbine) => void;
  onOpenDetail: (tur: Turbine) => void;
  onDetailChange: (tur: Turbine) => void;

  onCreateClick: () => void;
  onCancelCreate: () => void;
  onCreateSubmit: (name: string, company: string) => void;

  onCloseDetail: () => void;
  onSaveDetail: () => void;
  onDeleteDetail: () => void;
};

function TurbineListPage({
  turbines,
  searchTerm,
  setSearchTerm,
  showCreateModal,
  detailData,
  newName,
  newCompany,
  setNewName,
  setNewCompany,
  onRowClick,
  onOpenDetail,
  onDetailChange,
  onCreateClick,
  onCancelCreate,
  onCreateSubmit,
  onCloseDetail,
  onSaveDetail,
  onDeleteDetail,
}: ReviewPageProps) {
  return (
    <div className="TurbinePage">
      {/* Sidebar */}
      <aside className="sidebar-content">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Turbine List</h1>
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search turbine name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="search-icon" size={18} />
          </div>
        </div>

        <div className="content-body">
          <div className="toolbar">
            <button className="btn-create" onClick={onCreateClick}>
              + Create
            </button>
          </div>

          <div className="table-container">
            <table className="turbine-table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Turbine</th>
                  <th>Company</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {turbines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-data">
                      No turbines found.
                    </td>
                  </tr>
                ) : (
                  turbines.map((tur) => (
                    <tr
                      key={tur.id}
                      className="table-row"
                      onClick={() => onRowClick(tur)}
                    >
                      <td>{tur.created}</td>
                      <td>{tur.name}</td>
                      <td>{tur.company}</td>
                      <td>{tur.images}</td>
                      <td>
                        <button
                          className="btn-detail"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetail(tur);
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Create Turbine</h3>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                placeholder="Turbine Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="text"
                className="modal-input"
                placeholder="Company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={onCancelCreate}>
                Cancel
              </button>
              <button
                className="btn btn-submit"
                onClick={() =>
                  onCreateSubmit(newName.trim(), newCompany.trim())
                }
                disabled={!newName.trim() || !newCompany.trim()}
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
            <h3 className="modal-title">Turbine Detail</h3>
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
                <label>Company</label>
                <input
                  type="text"
                  className="modal-input"
                  value={detailData?.company ?? ""}
                  onChange={(e) =>
                    detailData &&
                    onDetailChange({ ...detailData, company: e.target.value })
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
    </div>
  );
}

export default TurbineListPage;
