// src/core.ts
import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";

export type ApiOk<T> = { ok: true; data: T; message?: string; status: number };
export type ApiErr   = { ok: false; data: null; message: string; status: number };
export type ApiResult<T> = ApiOk<T> | ApiErr;

// -------------------- utils --------------------
function toOk<T>(res: AxiosResponse<T>): ApiOk<T> {
  const anyData = res.data as any;
  return {
    ok: true,
    data: res.data,
    message:
      anyData && typeof anyData === "object" && "message" in anyData
        ? (anyData.message as string)
        : undefined,
    status: res.status,
  };
}

function toErr(error: AxiosError): ApiErr {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data as any;
  const msg =
    (payload && typeof payload === "object" && "message" in payload && payload.message) ||
    error.message ||
    "Request failed";
  // Optional redirect:
  // if (status === 401) window.location.href = "/login";
  return { ok: false, data: null, message: String(msg), status };
}

// -------------------- axios instance --------------------
export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// keep interceptors *side-effect only*, don't change return types
apiClient.interceptors.request.use((config) => config);
apiClient.interceptors.response.use(
  (res) => res,                         // ✅ giữ nguyên AxiosResponse
  (err) => Promise.reject(err)          // ✅ để helpers xử lý non-throw
);

// -------------------- typed helpers --------------------
export const api = {
  get: async <T>(url: string, config?: Parameters<typeof apiClient.get>[1]): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.get<T>(url, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },

  post: async <T>(url: string, data?: any, config?: Parameters<typeof apiClient.post>[2]): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.post<T>(url, data, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },

  put: async <T>(url: string, data?: any, config?: Parameters<typeof apiClient.put>[2]): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.put<T>(url, data, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },

  delete: async <T>(url: string, config?: Parameters<typeof apiClient.delete>[1]): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.delete<T>(url, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },
};
