import React, { useEffect, useState } from "react";
import UserManagementPage from "../pages/UserManagementPage";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
};

type ApiResponse = {
  message: string;
};

const BACKEND_URL = "https://fastapi-turbine-62vm.onrender.com"; // backend full URL

const UserManagementLogic: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // ---------------- Debounce search ----------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ---------------- Load all users ----------------
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/admin/all-users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiUser[] = await res.json();

      const filtered = data.filter(
        (u) => u.role === "user" && u.is_active === true
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
    } catch (err) {
      console.error("Fetch users error:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to fetch users");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- Approve user ----------------
  const handleApproveClick = async (user: User) => {
    setApproveLoading(user.id);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/admin/approve-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();

      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error("Approve error:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Approve failed");
      }
    } finally {
      setApproveLoading(null);
    }
  };

  // ---------------- Delete user ----------------
  const handleDelete = async (user: User) => {
    if (!window.confirm(`Bạn có chắc muốn xóa user: ${user.name}?`)) return;

    setDeleteLoading(user.id);
    try {
      const res = await fetch(
        `${BACKEND_URL}/auth/admin/delete-user/${user.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();

      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Delete failed");
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  // ---------------- Filter users ----------------
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
