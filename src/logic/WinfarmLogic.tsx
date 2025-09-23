import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WindfarmPage from "../pages/WinfarmPage";
import type { WindfarmUI } from "../pages/WinfarmPage";

// Đường dẫn đã chỉnh KHỚP file thật
import { windfarmService } from "../api/auth/winfarmService";
import type { WindfarmEntity, WindfarmListResponse } from "../api/types/typewinfarmService";

import { useParams, useLocation } from "react-router-dom";

type LocationState = { project?: { id: string; name: string } };

// Map API → UI: chỉ lấy những field thực sự có trong schema doc
function mapApiToUI(w: WindfarmEntity): WindfarmUI {
  return {
    id: w.id,
    projectId: w.project_id,
    name: w.name,
    location: w.location ?? "",
    createdAt: w.created_at ?? "",
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

const WindfarmPageLogic: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const projectName = (location.state as LocationState | undefined)?.project?.name;

  // list state
  const [items, setItems] = useState<WindfarmUI[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [loadingList, setLoadingList] = useState(false);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // create modal (chỉ name + location theo API)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createValues, setCreateValuesState] = useState({
    name: "",
    location: "",
  });
  const setCreateValues = (k: keyof typeof createValues, v: string) =>
    setCreateValuesState((s) => ({ ...s, [k]: v }));

  const [loadingCreate, setLoadingCreate] = useState(false);

  // detail modal (chỉ sửa name + location; turbineCount read-only)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailValues, setDetailValues] = useState<Record<string, string>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // delete per-row
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // reset trang khi search đổi
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

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

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Create
  const onOpenCreate = () => setShowCreateModal(true);
  const onCloseCreate = () => {
    setShowCreateModal(false);
    setCreateValuesState({
      name: "",
      location: "",
    });
  };

  const onCreateSubmit = async () => {
    if (loadingCreate || !projectId) return;
    const name = createValues.name.trim();
    const locationName = createValues.location.trim();
    if (!name || !locationName) return;

    setLoadingCreate(true);

    // Body KHỚP DOC: chỉ name + location (+ own_company nếu sau này thêm field input)
    const res = await windfarmService.create(projectId, {
      name,
      location: locationName,
    });

    setLoadingCreate(false);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }
    onCloseCreate();
    fetchList();
  };

  // Detail open (fetch detail)
  const onOpenDetail = async (wf: WindfarmUI) => {
    setShowDetailModal(true);
    setDetailId(wf.id);
    setLoadingDetail(true);

    const res = await windfarmService.detail(wf.id);
    setLoadingDetail(false);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }

    const d = res.data as WindfarmEntity;
    const values: Record<string, string> = {
      name: d.name ?? "",
      location: d.location ?? "",
      turbineCount: d.turbine_count != null ? String(d.turbine_count) : "0",
    };
    setDetailValues(values);
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
    setLoadingUpdate(true);
    const res = await windfarmService.update(detailId, {
      name: detailValues.name?.trim() || undefined,
      location: detailValues.location?.trim() || undefined,
    });
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
    setLoadingDeleteId(null);

    if (!res.ok) {
      if (res.message) alert(res.message); // 400 nếu còn turbines hoạt động
      return;
    }

    // nếu trang hiện tại trống sau khi xóa -> lùi trang
    const remaining = items.length - 1;
    if (remaining <= 0 && offset > 0) {
      setOffset(Math.max(0, offset - limit));
    } else {
      fetchList();
    }
  };

  const filtered = useMemo(() => items, [items]); // server-side search

  return (
    <WindfarmPage
      projectName={projectName}
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
    />
  );
};

export default WindfarmPageLogic;
