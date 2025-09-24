import { api, type ApiResult } from "../core";
import { TURBINES } from "../endpoints";
import type {
  Turbine,
  TurbineListResponse,
  CreateTurbineRequest,
  UpdateTurbineRequest,
  DeleteTurbineResponse,
} from "../types/typeturbineService";

export type ListByWindfarmParams = {
  limit?: number;   // default 50 on server
  offset?: number;  // default 0  on server
  search?: string;  // search by name or serial_no
};

export type ListAllParams = {
  limit?: number;   // default 100 on server
  offset?: number;  // default 0   on server
};

export const turbineService = {
  // 1) Create Turbine in a windfarm
  create: (
    windfarm_id: string,
    data: CreateTurbineRequest
  ): Promise<ApiResult<Turbine>> =>
    api.post<Turbine>(TURBINES.CREATE_BY_WINDFARM(windfarm_id), data),

  // 2) List Turbines by windfarm (Viewer+)
  listByWindfarm: (
    windfarm_id: string,
    params?: ListByWindfarmParams,
    signal?: AbortSignal
  ): Promise<ApiResult<TurbineListResponse>> =>
    api.get<TurbineListResponse>(TURBINES.LIST_BY_WINDFARM(windfarm_id), {
      params,
      signal,
    }),

  // 3) Admin: List All Turbines
  listAll: (
    params?: ListAllParams,
    signal?: AbortSignal
  ): Promise<ApiResult<TurbineListResponse>> =>
    api.get<TurbineListResponse>(TURBINES.LIST_ALL, { params, signal }),

  // Optional: detail (nếu backend có GET /turbines/{id})
  detail: (
    turbine_id: string,
    signal?: AbortSignal
  ): Promise<ApiResult<Turbine>> =>
    api.get<Turbine>(TURBINES.DETAIL(turbine_id), { signal }),

  // 4) Update Turbine
  update: (
    turbine_id: string,
    data: UpdateTurbineRequest
  ): Promise<ApiResult<Turbine>> =>
    api.put<Turbine>(TURBINES.UPDATE(turbine_id), data),

  // 5) Delete Turbine (soft delete) — 204
  delete: (
    turbine_id: string
  ): Promise<ApiResult<DeleteTurbineResponse>> =>
    api.delete<DeleteTurbineResponse>(TURBINES.DELETE(turbine_id)),

  // ⛔️ removed updateStatus entirely
};
