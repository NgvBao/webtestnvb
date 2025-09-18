import React, { useEffect, useState } from "react";
import UserManagementPage from "../pages/UserManagementPage";
import { authServiceLong } from "../api/auth/authService";
import type { UserListResponse } from "../api/types/typesauthService";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
};

const UserManagementLogic: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = async () => {
    const res = await authServiceLong.getAllUsers();

    if (!res.ok) {
      alert(res.message || "Failed to fetch users");
      return;
    }

    const filtered = res.data.filter(
      (u: UserListResponse) => u.role === "user" && u.is_active === true
    );

    const mapped: User[] = filtered.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.is_approved ? "Active" : "Inactive",
    }));

    setUsers(mapped);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveClick = async (user: User) => {
    setApproveLoading(user.id);

    const res = await authServiceLong.approveUser({ user_id: user.id });

    if (!res.ok) {
      alert(res.message || "Approve failed");
      setApproveLoading(null);
      return;
    }

    alert(res.data.message || "Approve success");
    setApproveLoading(null);
    fetchUsers();
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Ban co chac muon xoa user: ${user.name}?`)) return;

    setDeleteLoading(user.id);

    const res = await authServiceLong.deleteUser(user.id);

    if (!res.ok) {
      alert(res.message || "Delete failed");
      setDeleteLoading(null);
      return;
    }

    alert(res.data.message || "Delete success");
    setDeleteLoading(null);
    fetchUsers();
  };

  const filteredUsers = users.filter((u) => {
    const keyword = debouncedSearch.toLowerCase();
    return (
      u.email.toLowerCase().includes(keyword) ||
      u.phone.toLowerCase().includes(keyword)
    );
  });

  return (
    <UserManagementPage
      approveLoading={approveLoading}
      deleteLoading={deleteLoading}
      users={filteredUsers}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onApproveClick={handleApproveClick}
      onDeleteClick={handleDelete}
    />
  );
};

export default UserManagementLogic;
