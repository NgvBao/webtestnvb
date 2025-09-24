// src/logic/WinfarmLogic.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WindfarmPage from "../pages/WinfarmPage";
import type { WindfarmUI } from "../pages/WinfarmPage";
import { windfarmService } from "../api/auth/winfarmService";
import type { WindfarmEntity, WindfarmListResponse } from "../api/types/typewinfarmService";
import { useParams, useLocation, useNavigate } from "react-router-dom";

type LocationState = { project?: { id: string; name: string } };

// Map API → UI
function mapApiToUI(w: WindfarmEntity): WindfarmUI {
  return {
    id: w.id,
    name: w.name,
    description: w.description ?? "",
    own_company: w.own_company ?? "",
    location: w.location ?? "",
    projectId: w.project_id,
    projectName: w.project_name ?? "",
    createdAt: w.created_at ?? "",
    updatedAt: w.updated_at ?? "",
    createdBy: w.created_by ?? "",
    turbineCount: w.turbine_count ?? 0,
  };
}

const useDebounce = <T,>(value: T, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const WindfarmLogic: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const projectNameFromState = (location.state as LocationState | undefined)?.project?.name;

  // list state
  const [items, setItems] = useState<WindfarmUI[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [loadingList, setLoadingList] = useState(false);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createValues, setCreateValuesState] = useState({ name: "", location: "" });
  const setCreateValues = (k: "name" | "location", v: string) =>
    setCreateValuesState((s) => ({ ...s, [k]: v }));
  const [loadingCreate, setLoadingCreate] = useState(false);

  // detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailValues, setDetailValues] = useState<Record<string, string>>({});
  const [loadingDetail] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // delete per-row
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  // mounted guard
  const mounted = useRef(true);
  
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // reset paging khi search đổi
  useEffect(() => { setOffset(0); }, [debouncedSearch]);

  // reset state khi projectId đổi
  useEffect(() => {
    setOffset(0);
    setItems([]);
    setTotal(0);
    setSearchTerm("");
  }, [projectId]);

  // fetch list
  const fetchList = useCallback(async () => {
    if (!projectId) return;
    setLoadingList(true);
    const res = await windfarmService.listByProject({
      project_id: projectId,
      limit,
      offset,
      search: debouncedSearch.trim() || undefined,
    });
    if (!mounted.current) return;
    setLoadingList(false);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }
    const payload = res.data as WindfarmListResponse;
    const arr = (payload.windfarms ?? []).map(mapApiToUI);
    setItems(arr);
    setTotal(payload.total ?? arr.length);
  }, [projectId, limit, offset, debouncedSearch]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Create
  const onOpenCreate = () => setShowCreateModal(true);
  const onCloseCreate = () => {
    setShowCreateModal(false);
    setCreateValuesState({ name: "", location: "" });
  };
  const onCreateSubmit = async () => {
    if (loadingCreate || !projectId) return;
    const name = createValues.name.trim();
    const locationName = createValues.location.trim();
    if (!name || !locationName) return;

    setLoadingCreate(true);
    const res = await windfarmService.create(projectId, { name, location: locationName });
    if (!mounted.current) return;
    setLoadingCreate(false);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }
    onCloseCreate();
    fetchList();
  };

  // Detail open — dùng data từ list
  const onOpenDetail = (wf: WindfarmUI) => {
    setShowDetailModal(true);
    setDetailId(wf.id);
    setDetailValues({
      id: wf.id,
      name: wf.name ?? "",
      description: wf.description ?? "",
      own_company: wf.own_company ?? "",
      location: wf.location ?? "",
      projectId: wf.projectId ?? "",
      projectName: wf.projectName ?? "",
      createdAt: wf.createdAt ?? "",
      updatedAt: wf.updatedAt ?? "",
      createdBy: wf.createdBy ?? "",
      turbineCount: wf.turbineCount != null ? String(wf.turbineCount) : "0",
    });
  };

  const onCloseDetail = () => {
    setShowDetailModal(false);
    setDetailId(null);
    setDetailValues({});
  };

  const setDetailValue = (k: string, v: string) =>
    setDetailValues((s) => ({ ...s, [k]: v }));

  const onDetailSave = async () => {
    if (!detailId) return;
    const body = {
      name: (detailValues.name ?? "").trim() || undefined,
      location: (detailValues.location ?? "").trim() || undefined,
      description: (detailValues.description ?? "").trim() || undefined,
      own_company: (detailValues.own_company ?? "").trim() || undefined,
    };
    if (!body.name || !body.location) return;

    setLoadingUpdate(true);
    const res = await windfarmService.update(detailId, body);
    if (!mounted.current) return;
    setLoadingUpdate(false);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }
    onCloseDetail();
    fetchList();
  };

  // Delete
  const onDelete = async (wf: WindfarmUI) => {
    if (!window.confirm(`Delete windfarm "${wf.name}"?`)) return;
    setLoadingDeleteId(wf.id);
    const res = await windfarmService.remove(wf.id);
    if (!mounted.current) return;
    setLoadingDeleteId(null);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }

    const remaining = items.length - 1;
    if (remaining <= 0 && offset > 0) {
      setOffset(Math.max(0, offset - limit));
    } else {
      fetchList();
    }
  };

  // server-side search → items đã chuẩn
  const filtered = useMemo(() => items, [items]);

  // Fallback tên project: ưu tiên state, nếu không có thì lấy từ list
  const computedProjectName = useMemo(() => {
    if (projectNameFromState && projectNameFromState.trim()) return projectNameFromState;
    const fromList = items.find((x) => x.projectName && x.projectName.trim())?.projectName;
    return fromList ?? "";
  }, [projectNameFromState, items]);

  // 👇 Row click → đi tới trang turbines đúng route bạn đã khai báo trong App.tsx
  const handleRowClick = (wf: WindfarmUI) => {
    if (!projectId) return;
    navigate(`/project/${projectId}/windfarms/${wf.id}/turbines`, {
      state: {
        project: { id: projectId, name: computedProjectName || "" },
        windfarm: { id: wf.id, name: wf.name },
      },
    });
  };

  return (
    <WindfarmPage
      projectId={projectId}
      projectName={computedProjectName}
      // list
      windfarms={filtered}
      loadingList={loadingList}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      // paging
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={(next) => setOffset(next)}
      // create
      showCreateModal={showCreateModal}
      onOpenCreate={onOpenCreate}
      onCloseCreate={onCloseCreate}
      createValues={createValues}
      setCreateValues={setCreateValues}
      onCreateSubmit={onCreateSubmit}
      loadingCreate={loadingCreate}
      // detail/edit
      showDetailModal={showDetailModal}
      onOpenDetail={onOpenDetail}
      onCloseDetail={onCloseDetail}
      detailValues={detailValues}
      setDetailValue={setDetailValue}
      onDetailSave={onDetailSave}
      loadingDetail={loadingDetail}
      loadingUpdate={loadingUpdate}
      // delete
      onDelete={onDelete}
      loadingDeleteId={loadingDeleteId}
      // ✅ row click → Turbine
      onRowClick={handleRowClick}
    />
  );
};

export default WindfarmLogic;
