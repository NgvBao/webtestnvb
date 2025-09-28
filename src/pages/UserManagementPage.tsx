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
  loadingList?: boolean; // ✅ hiển thị loading
};

function UserManagementPage({
  users,
  searchTerm,
  setSearchTerm,
  approveLoading,
  deleteLoading,
  onApproveClick,
  onDeleteClick,
  loadingList,
}: UserManagementPageProps) {
  const columns: Column<User>[] = [
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
      header: "Name",
      size: 0.22,
      sortable: true,
      sortAccessor: (u) => u.name.toLowerCase(),
    },
    {
      key: "email",
      header: "Email",
      size: 0.26,
      sortable: true,
      sortAccessor: (u) => u.email.toLowerCase(),
    },
    {
      key: "phone",
      header: "Phone",
      size: 0.16,
      sortable: true,
      sortAccessor: (u) => u.phone,
    },
    {
      key: "role",
      header: "Role",
      size: 0.1,
      align: "center",
      sortable: true,
      sortAccessor: (u) => u.role,
      headerClassName: "col-center",
      className: "col-center",
    },
    {
      key: "status",
      header: "Status",
      size: 0.1,
      align: "center",
      sortable: true,
      sortAccessor: (u) => u.status,
      headerClassName: "col-center",
      className: "col-center",
      render: (user) => (
        <span
          className={
            user.status === "Active" ? "status-active" : "status-inactive"
          }
        >
          {user.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      size: 0.16,
      className: "action-cell",
      render: (user) => (
        <>
          <Button
            variant="delete"
            onClick={(e: any) => {
              e.stopPropagation();
              onDeleteClick(user);
            }}
            loading={deleteLoading === user.id}
            style={{ marginRight: 8 }}
          >
            Delete
          </Button>
          <Button
            variant="approve"
            hidden={user.status === "Active"}
            onClick={(e: any) => {
              e.stopPropagation();
              onApproveClick(user);
            }}
            loading={approveLoading === user.id}
          >
            Approve
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="UserManagementContent">
      <div className="content-body">
        {/* ✅ Page Title ra riêng */}
        <h1 className="page-title">User Management</h1>

        {/* ✅ Toolbar */}
        <div className="toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ✅ Table */}
        <div className="table-section">
          <GenericTable<User>
            data={users}
            columns={columns}
            loading={!!loadingList}
            emptyText="No users"
            stickyHeader
            cellProps={(_row, col) =>
              col.key === "actions"
                ? { onClick: (e) => e.stopPropagation() }
                : {}
            }
          />
        </div>
      </div>
    </div>
  );
}

export default UserManagementPage;
