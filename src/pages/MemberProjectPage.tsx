import React, { useMemo, useState } from "react";
import Sidebar from "../components/sidebar";
import GenericTable from "../components/table";
import type { Column } from "../components/table";
import Button from "../components/button";
import "../styles/MemberProjectPage.css";

/** Types khớp BE */
export type ProjectMember = {
  project_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: "owner" | "editor" | "viewer";
  can_invite: boolean;
  joined_at: string; // ISO
};

export type AdminUserLite = {
  id: string;
  name: string;
  email: string;
};

type MemberProjectPageProps = {
  // Header
  projectTitle: string;
  onBack: () => void;
  canManage?: boolean;

  // Invite (autocomplete)
  suggestQuery: string;
  onSuggestQueryChange: (v: string) => void;
  suggestions: AdminUserLite[];
  suggestLoading?: boolean;
  inviteLoading?: boolean;
  onInviteUserId: (userIdOrEmail: string) => void;

  // Filter
  searchTerm: string;
  onSearchTermChange: (v: string) => void;

  // Table + paging
  members: ProjectMember[];
  total?: number;
  limit?: number;
  offset?: number;
  onPageChange?: (nextOffset: number) => void;

  // Actions
  onRemove: (m: ProjectMember) => void;
  deleteLoading?: string | null;

  // Loading list (tuỳ chọn)
  loadingList?: boolean;
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const roleText = (r: ProjectMember["role"]) =>
  r === "owner" ? "Owner" : r === "editor" ? "Editor" : "Viewer";
const roleClass = (r: ProjectMember["role"]) =>
  r === "owner" ? "role-owner" : r === "editor" ? "role-editor" : "role-viewer";

const MemberProjectPage: React.FC<MemberProjectPageProps> = ({
  // header
  projectTitle,
  onBack,
  canManage = false,

  // invite
  suggestQuery,
  onSuggestQueryChange,
  suggestions,
  suggestLoading,
  inviteLoading,
  onInviteUserId,

  // filter
  searchTerm,
  onSearchTermChange,

  // table + paging
  members,
  total = 0,
  limit = 50,
  offset = 0,
  onPageChange,

  // actions
  onRemove,
  deleteLoading,

  // loading
  loadingList,
}) => {
  // bảng cần id ổn định
  const data = useMemo(
    () => members.map((m) => ({ ...m, id: `${m.project_id}:${m.user_id}` })),
    [members]
  );

  // dropdown state cho invite
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const columns: Column<typeof data[number]>[] = [
    {
      key: "user",
      header: "Member",
      size: 0.44,
      sortable: true,
      sortAccessor: (m) => m.user_name.toLowerCase(),
      render: (m) => (
        <div>
          <div style={{ fontWeight: 600 }}>{m.user_name}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{m.user_email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      size: 0.18,
      align: "center",
      sortable: true,
      sortAccessor: (m) => m.role,
      headerClassName: "col-center",
      className: "col-center",
      render: (m) => (
        <span className={`role-badge ${roleClass(m.role)}`} title={roleText(m.role)}>
          {roleText(m.role)}
        </span>
      ),
    },
    {
      key: "joined_at",
      header: "Joined",
      size: 0.20,
      align: "right",
      sortable: true,
      sortAccessor: (m) => m.joined_at || "",
      headerClassName: "col-right",
      className: "col-right",
      render: (m) => <span>{formatDate(m.joined_at)}</span>,
    },
    {
      key: "actions",
      header: "Action",
      size: 0.18,
      render: (m) => {
        const isOwner = m.role === "owner";
        const isDeleting = deleteLoading === m.user_id;
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="delete"
              onClick={() => onRemove(m)}
              disabled={!canManage || isOwner || isDeleting}
              loading={isDeleting}
              title={isOwner ? "Owner cannot be removed" : "Remove from project"}
            >
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  // map offset/limit → pagination của GenericTable (1-based page)
  const pageSize = limit || 50;
  const page = Math.floor((offset || 0) / pageSize) + 1;
  const handlePageChange = (nextPage: number) => {
    if (!onPageChange) return;
    onPageChange((nextPage - 1) * pageSize);
  };

  const handleInviteKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      onSuggestQueryChange(suggestions[activeIndex].email);
      setActiveIndex(-1);
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  };

  return (
    <div className="MemberProjectPage">
      <aside className="sidebar-content">
        <Sidebar />
      </aside>

      <main className="main-content">
        <div className="content-body">
          {/* Header */}
          <div className="page-header">
            <div className="page-title">{projectTitle}</div>
            <Button variant="cancel" onClick={onBack}>Back</Button>
          </div>

          {/* Invite */}
          <section className="invite-section">
            <div className="invite-label">Invite team members</div>

            <div className="invite-row-wrap">
              <div className="invite-row">
                <input
                  type="text"
                  className="invite-input"
                  placeholder="Type email or name..."
                  value={suggestQuery}
                  onChange={(e) => { onSuggestQueryChange(e.target.value); setActiveIndex(-1); }}
                  onKeyDown={handleInviteKeyDown}
                  disabled={!canManage}
                  aria-autocomplete="list"
                  aria-expanded={!!suggestQuery && (suggestLoading || suggestions.length > 0)}
                  aria-controls="invite-suggest-listbox"
                />
                <Button
                  className="invite-add-btn"
                  variant="submit"
                  onClick={() => suggestQuery.trim() && onInviteUserId(suggestQuery.trim())}
                  disabled={!canManage || !suggestQuery.trim() || !!inviteLoading}
                  loading={!!inviteLoading}
                  title="Add member by email"
                >
                  Add
                </Button>
              </div>

              {/* Suggest dropdown */}
              <div
                id="invite-suggest-listbox"
                className="suggest-dropdown"
                style={{
                  display:
                    suggestQuery && (suggestLoading || suggestions.length > 0) ? "block" : "none",
                }}
                role="listbox"
                aria-label="User suggestions"
              >
                {suggestLoading ? (
                  <div className="suggest-loading">Searching…</div>
                ) : suggestions.length ? (
                  suggestions.map((u, i) => (
                    <div
                      key={u.id}
                      className={`suggest-item${i === activeIndex ? " active" : ""}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      onClick={() => { onSuggestQueryChange(u.email); setActiveIndex(-1); }}
                    >
                      <div className="suggest-name">{u.name}</div>
                      <div className="suggest-email">{u.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="suggest-empty">No results</div>
                )}
              </div>
            </div>
          </section>

          {/* Filter */}
          <section className="filter-section">
            <div className="filter-label">Team Members with Access</div>
            <input
              type="text"
              className="filter-input"
              placeholder="Search name or email"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </section>

          {/* Table (clean, đồng kiểu) */}
          <div className="table-wrap">
            <GenericTable<typeof data[number]>
              data={data}
              columns={columns}
              loading={!!loadingList}
              emptyText="No members"
              stickyHeader
              // chặn nổi bọt ở ô actions
              cellProps={(_row, col) =>
                col.key === "actions" ? { onClick: (e) => e.stopPropagation() } : {}
              }
              // Pagination built-in
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberProjectPage;
