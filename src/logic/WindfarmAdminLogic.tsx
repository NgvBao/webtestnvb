import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WindfarmAdminPage from "../pages/WindfarmAdminPage";
import type { WindfarmUI } from "../pages/WindfarmAdminPage";

import { windfarmService } from "../api/auth/winfarmService";
import type { WindfarmEntity, WindfarmListResponse } from "../api/types/typewinfarmService";

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

const WindfarmAdminPageLogic: React.FC = () => {
  // list state
  const [items, setItems] = useState<WindfarmUI[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [loadingList, setLoadingList] = useState(false);

  // client-side search (listAll không có search param)
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailValues, setDetailValues] = useState<Record<string, string>>({});
  const [loadingDetail] = useState(false); // không gọi API detail riêng
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // delete per-row
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  // mounted guard
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // fetch listAll
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    const res = await windfarmService.listAll({ limit, offset });
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
  }, [limit, offset]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Detail open — KHÔNG gọi API, lấy từ items
  const onOpenDetail = (wf: WindfarmUI) => {
    setShowDetailModal(true);
    setDetailId(wf.id);
    const values: Record<string, string> = {
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

    // chỉ gửi field cho phép cập nhật
    const body = {
      name: (detailValues.name ?? "").trim() || undefined,
      location: (detailValues.location ?? "").trim() || undefined,
      description: (detailValues.description ?? "").trim() || undefined,
      own_company: (detailValues.own_company ?? "").trim() || undefined,
    };

    setLoadingUpdate(true);
    const res = await windfarmService.update(detailId, body);
    if (!mounted.current) return;
    setLoadingUpdate(false);

    if (!res.ok) {
      if (res.message) alert(res.message);
      return;
    }
    onCloseDetail();
    fetchList(); // refresh
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

    // nếu trang hiện tại trống sau khi xóa -> lùi trang
    const remaining = items.length - 1;
    if (remaining <= 0 && offset > 0) {
      setOffset(Math.max(0, offset - limit));
    } else {
      fetchList();
    }
  };

  // client-side search: lọc theo name/company/location/project (không đổi total)
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      return (
        x.name.toLowerCase().includes(q) ||
        (x.own_company ?? "").toLowerCase().includes(q) ||
        (x.location ?? "").toLowerCase().includes(q) ||
        (x.projectName ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, debouncedSearch]);

  return (
    <WindfarmAdminPage
      // list
      windfarms={filtered}
      loadingList={loadingList}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      // paging (server)
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={(next) => setOffset(next)}
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

export default WindfarmAdminPageLogic;
