import React, { useCallback, useEffect, useMemo, useState } from "react";
import MemberProjectPage from "../pages/MemberProjectPage";
import { memberService } from "../api/auth/memberService";
import type { AdminUserLite, ProjectMember } from "../api/types/typesmemberService";

type Props = {
  projectId: string;
  projectTitle: string;
  canManage: boolean;
  onBack: () => void;
  pageSize?: number;
};

function useDebounce<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const MemberProjectLogic: React.FC<Props> = ({
  projectId,
  projectTitle,
  canManage,
  onBack,
  pageSize = 20,
}) => {
  // list + paging
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = pageSize;
  const [loadingList, setLoadingList] = useState(false);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // invite
  const [suggestQuery, setSuggestQuery] = useState("");
  const debouncedSuggest = useDebounce(suggestQuery, 350);
  const [suggestions, setSuggestions] = useState<AdminUserLite[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // per-row delete
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // reload trigger
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  // fetch members (paged)
useEffect(() => {
  const ctrl = new AbortController();
  setLoadingList(true);

  memberService
    .list(projectId, { limit, offset }, ctrl.signal)
    .then((res) => {
      // ✅ Nếu request bị hủy thì bỏ qua luôn
      if (res.message === "canceled") return;

      // ❌ Nếu có lỗi khác thì alert
      if (!res.ok) {
        alert(res.message || "Failed to load project members");
        return;
      }

      // ✅ Nếu thành công thì cập nhật state
      setMembers(res.data.members);
      setTotal(res.data.total ?? 0);
    })
    .finally(() => setLoadingList(false));

  return () => ctrl.abort();
}, [projectId, limit, offset, reloadKey]);


  // fetch suggestions
  useEffect(() => {
    if (!debouncedSuggest || !canManage) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    setSuggestLoading(true);
    memberService
      .searchUsers(projectId, debouncedSuggest, 10, ctrl.signal)
      .then((res) => setSuggestions(res.ok && res.data ? res.data : []))
      .finally(() => setSuggestLoading(false));
    return () => ctrl.abort();
  }, [projectId, canManage, debouncedSuggest]);

  // actions
  const handleInviteUserId = useCallback(
    async (userIdOrEmail: string) => {
      if (inviteLoading) return;
      setInviteLoading(true);
      try {
        const found = suggestions.find((s) => s.id === userIdOrEmail);
        const email = found?.email || userIdOrEmail;
        const res = await memberService.add(projectId, {
          email,
          role: "viewer",
          can_invite: false,
        });
        if (!res.ok) {
          alert(res.message || "Failed to add member");
          return;
        }
        setSuggestQuery("");
        setSuggestions([]);
        refresh();
      } finally {
        setInviteLoading(false);
      }
    },
    [inviteLoading, suggestions, projectId, refresh]
  );

  const handleRemove = useCallback(
    async (m: ProjectMember) => {
      if (m.role === "owner") {
        alert("Owner cannot be removed.");
        return;
      }
      if (!window.confirm(`Remove ${m.user_email} khỏi project?`)) return;

      setDeleteLoading(m.user_id);
      const res = await memberService.remove(projectId, m.user_id);
      setDeleteLoading(null);

      if (!res.ok) {
        alert(res.message || "Failed to remove member");
        return;
      }

      // nếu trang hiện tại trống sau khi xóa -> lùi trang; ngược lại refresh
      const willCount = members.length - 1;
      if (willCount <= 0 && offset > 0) {
        setOffset(Math.max(0, offset - limit));
      } else {
        refresh();
      }
    },
    [members.length, offset, limit, projectId, refresh]
  );

  const handleOffsetChange = useCallback((nextOffset: number) => {
    setOffset(nextOffset);
  }, []);

  // filter client-side
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.user_name.toLowerCase().includes(q) ||
        m.user_email.toLowerCase().includes(q)
    );
  }, [members, debouncedSearch]);

  // khi đang search -> không đổi offset/limit; hiển thị tất cả kết quả
  const paging = useMemo(() => {
    if (debouncedSearch.trim()) {
      return { total: filtered.length, limit: filtered.length || 1, offset: 0 };
    }
    return { total, limit, offset };
  }, [filtered.length, total, limit, offset, debouncedSearch]);

  return (
    <MemberProjectPage
      // header
      projectTitle={projectTitle}
      onBack={onBack}
      canManage={canManage}
      // invite
      suggestQuery={suggestQuery}
      onSuggestQueryChange={setSuggestQuery}
      suggestions={suggestions}
      suggestLoading={suggestLoading}
      inviteLoading={inviteLoading}
      onInviteUserId={handleInviteUserId}
      // filter
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      // table + paging
      members={filtered}
      total={paging.total}
      limit={paging.limit}
      offset={paging.offset}
      onPageChange={handleOffsetChange}
      // actions
      onRemove={handleRemove}
      deleteLoading={deleteLoading}
      // loading
      loadingList={loadingList}
    />
  );
};

export default MemberProjectLogic;
