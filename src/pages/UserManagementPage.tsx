import Sidebar from "../components/sidebar";
import "../styles/UserManagementPage.css";
import Button from "../components/button";
import GenericTable from "../components/table";
import type { Column } from "../components/table";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
};

type UserManagementPageProps = {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onApproveClick: (user: User) => void;
  approveLoading: string | null;
  deleteLoading: string | null;
  onDeleteClick: (user: User) => void;
};

function UserManagementPage({
  users,
  searchTerm,
  setSearchTerm,
  approveLoading,
  deleteLoading,
  onApproveClick,
  onDeleteClick,
}: UserManagementPageProps) {
  // ---------------- Cấu hình cột ----------------
  const columns: Column<User>[] = [
    { key: "index", header: "#", size: 0.05, render: (_, i) => i + 1 },
    { key: "name", header: "Name", size: 0.2 },
    { key: "email", header: "Email", size: 0.25 },
    { key: "phone", header: "Phone", size: 0.15 },
    { key: "role", header: "Role", size: 0.1 },
    {
      key: "status",
      header: "Status",
      size: 0.1,
      render: (user) => (
        <span
          className={user.status === "Active" ? "status-active" : "status-inactive"}
        >
          {user.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      size: 0.15,
      className: "action-cell",
      render: (user) => (
      <>
        <Button
          variant="delete"
          onClick={() => onDeleteClick(user)}
          loading={deleteLoading === user.id}
          >
            Delete
        </Button>
        <Button
          variant="approve"
          hidden={user.status === "Active"}
          onClick={() => onApproveClick(user)}
          loading={approveLoading === user.id}
        >
          Approve
        </Button>
      </>

      ),
    },
  ];

  return (
    <div className="UserManagementPage">
      {/* Sidebar */}
      <aside className="sidebar-content">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-body">
          {/* Toolbar */}
          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <GenericTable<User> data={users} columns={columns} />
        </div>
      </main>
    </div>
  );
}

export default UserManagementPage;
