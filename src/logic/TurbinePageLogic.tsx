// src/pages/TurbinePageLogic.tsx
import React, { useEffect, useState } from "react";
import TurbinePage, { type TurbineUI } from "../pages/TurbinePage";
import { turbineService } from "../api/auth/turbineService";
import type { Turbine } from "../api/types/typeturbineService";
import { useParams, useLocation} from "react-router-dom";

type LocationState = {
  project?: { id: string; name: string };
  windfarm?: { id: string; name: string };
};

type CreateValues = {
  name: string;
  serialNo?: string;
  capacityMw?: string;
  coordinates?: string;
  description?: string;
};

function mapApiToUI(t: Turbine): TurbineUI {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? "",
    windfarmId: t.windfarm_id,
    windfarmName: t.windfarm_name ?? "",
    serialNo: t.serial_no ?? "",
    capacityMw: t.capacity_mw ?? undefined,
    coordinates: t.coordinates ?? "",
    createdAt: t.created_at ?? "",
    updatedAt: t.updated_at ?? "",
    createdBy: t.created_by ?? "",
  };
}

function mapUIToUpdatePayload(values: Record<string, string>) {
  const payload: any = {};
  if (values.name) payload.name = values.name;
  if (values.description !== undefined) payload.description = values.description;
  if (values.serialNo !== undefined) payload.serial_no = values.serialNo;
  if (values.coordinates !== undefined) payload.coordinates = values.coordinates;
  if (values.capacityMw !== undefined && values.capacityMw !== "") {
    const n = Number(values.capacityMw);
    if (!Number.isNaN(n)) payload.capacity_mw = n;
  }
  return payload;
}

const useDebounced = (value: string, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
};

const TurbinePageLogic: React.FC = () => {
  const params = useParams<{ windfarmId?: string }>();
  const location = useLocation();
  const locState = (location.state || {}) as LocationState;

  const windfarmId = params.windfarmId || locState.windfarm?.id || "";
  const windfarmName = locState.windfarm?.name || "";
  const projectId = locState.project?.id || "";
  const projectName = locState.project?.name || "";

  // list state
  const [turbines, setTurbines] = useState<TurbineUI[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 350);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createValues, setCreateValuesState] = useState<CreateValues>({ name: "" });
  const setCreateValues = (k: keyof CreateValues, v: string) =>
    setCreateValuesState((s) => ({ ...s, [k]: v }));
  const [loadingCreate, setLoadingCreate] = useState(false);

  // detail state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailValues, setDetailValues] = useState<Record<string, string>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // delete
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  // fetch list
  useEffect(() => {
    if (!windfarmId) return;
    const ctrl = new AbortController();
    setLoadingList(true);
    turbineService
      .listByWindfarm(
        windfarmId,
        { limit, offset, search: debouncedSearch || undefined },
        ctrl.signal
      )
      .then((res) => {
        if (res.message === "canceled") return;
        if (!res.ok) {
          alert(res.message || "Failed to load turbines");
          return;
        }
        const d = res.data;
        const list = Array.isArray(d?.turbines) ? d.turbines.map(mapApiToUI) : [];
        setTurbines(list);
        setTotal(typeof d?.total === "number" ? d.total : list.length);
        setLimit(typeof d?.limit === "number" && d.limit > 0 ? d.limit : 50);
      })
      .finally(() => setLoadingList(false));
    return () => ctrl.abort();
  }, [windfarmId, limit, offset, debouncedSearch]);

  // create
  const onOpenCreate = () => setShowCreateModal(true);
  const onCloseCreate = () => setShowCreateModal(false);

  const onCreateSubmit = () => {
    if (!windfarmId) return;
    if (!createValues.name.trim()) return;
    setLoadingCreate(true);

    const payload = {
      name: createValues.name.trim(),
      description: createValues.description?.trim() || undefined,
      serial_no: createValues.serialNo?.trim() || undefined,
      coordinates: createValues.coordinates?.trim() || undefined,
      capacity_mw:
        createValues.capacityMw && createValues.capacityMw.trim() !== ""
          ? Number(createValues.capacityMw)
          : undefined,
    };

    turbineService
      .create(windfarmId, payload as any)
      .then((res) => {
        if (!res.ok) {
          alert(res.message || "Create turbine failed");
          return;
        }
        // refresh first page
        setOffset(0);
        setShowCreateModal(false);
        setCreateValuesState({ name: "" });
      })
      .finally(() => setLoadingCreate(false));
  };

  // detail
  const onOpenDetail = (tb: TurbineUI) => {
    setLoadingDetail(true);
    setDetailValues({
      id: tb.id,
      windfarmId: tb.windfarmId,
      windfarmName: tb.windfarmName ?? "",
      name: tb.name,
      serialNo: tb.serialNo ?? "",
      capacityMw: tb.capacityMw !== undefined ? String(tb.capacityMw) : "",
      coordinates: tb.coordinates ?? "",
      description: tb.description ?? "",
      createdAt: tb.createdAt ?? "",
      updatedAt: tb.updatedAt ?? "",
      createdBy: tb.createdBy ?? "",
    });
    setShowDetailModal(true);
    setLoadingDetail(false);
  };

  const onCloseDetail = () => setShowDetailModal(false);

  const onDetailSave = () => {
    const id = detailValues.id;
    if (!id) return;
    setLoadingUpdate(true);

    const payload = mapUIToUpdatePayload(detailValues);

    turbineService
      .update(id, payload)
      .then((res) => {
        if (!res.ok) {
          alert(res.message || "Update turbine failed");
          return;
        }
        const ctrl = new AbortController();
        setLoadingList(true);
        turbineService
          .listByWindfarm(
            windfarmId,
            { limit, offset, search: debouncedSearch || undefined },
            ctrl.signal
          )
          .then((r2) => {
            if (r2.ok) {
              setTurbines(r2.data.turbines.map(mapApiToUI));
              setTotal(r2.data.total ?? 0);
            }
          })
          .finally(() => setLoadingList(false));
        setShowDetailModal(false);
      })
      .finally(() => setLoadingUpdate(false));
  };

  // delete
  const onDelete = (tb: TurbineUI) => {
    if (!confirm(`Delete turbine "${tb.name}"?`)) return;
    setLoadingDeleteId(tb.id);
    turbineService
      .delete(tb.id)
      .then((res) => {
        if (!res.ok) {
          alert(res.message || "Delete turbine failed");
          return;
        }
        const ctrl = new AbortController();
        setLoadingList(true);
        turbineService
          .listByWindfarm(
            windfarmId,
            { limit, offset, search: debouncedSearch || undefined },
            ctrl.signal
          )
          .then((r2) => {
            if (r2.ok) {
              setTurbines(r2.data.turbines.map(mapApiToUI));
              setTotal(r2.data.total ?? 0);
            }
          })
          .finally(() => setLoadingList(false));
      })
      .finally(() => setLoadingDeleteId(null));
  };

  // optional row click
  const onRowClick = (_tb: TurbineUI) => {};

  const setCreateValuesProxy = (k: keyof CreateValues, v: string) => setCreateValues(k, v);
  const setDetailValue = (k: string, v: string) => setDetailValues((s) => ({ ...s, [k]: v }));

  return (
    <TurbinePage
      projectId={projectId}
      projectName={projectName}
      windfarmId={windfarmId}
      windfarmName={windfarmName}
      turbines={turbines}
      loadingList={loadingList}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={setOffset}
      showCreateModal={showCreateModal}
      onOpenCreate={onOpenCreate}
      onCloseCreate={onCloseCreate}
      createValues={createValues}
      setCreateValues={setCreateValuesProxy}
      onCreateSubmit={onCreateSubmit}
      loadingCreate={loadingCreate}
      showDetailModal={showDetailModal}
      onOpenDetail={onOpenDetail}
      onCloseDetail={onCloseDetail}
      detailValues={detailValues}
      setDetailValue={setDetailValue}
      onDetailSave={onDetailSave}
      loadingDetail={loadingDetail}
      loadingUpdate={loadingUpdate}
      onDelete={onDelete}
      loadingDeleteId={loadingDeleteId}
      onRowClick={onRowClick}
    />
  );
};

export default TurbinePageLogic;
