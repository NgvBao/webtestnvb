import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";

export type ApiOk<T> = { ok: true; data: T; message?: string; status: number };
export type ApiErr = { ok: false; data: null; message: string; status: number };
export type ApiResult<T> = ApiOk<T> | ApiErr;

// -------------------- utils --------------------
function extractMessage(payload: any, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  // Ưu tiên các trường thường gặp
  if ("message" in payload && payload.message) return String(payload.message);
  if ("detail" in payload) {
    if (typeof payload.detail === "string") return String(payload.detail);
    if (typeof payload.detail === "object" && "message" in payload.detail) {
      return String(payload.detail.message);
    }
  }
  return fallback;
}

function toOk<T>(res: AxiosResponse<T>): ApiOk<T> {
  const anyData = res.data as any;
  const msg = extractMessage(anyData, "");
  return {
    ok: true,
    data: res.data,
    message: msg || undefined,
    status: res.status,
  };
}

function toErr(error: AxiosError): ApiErr {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data as any;
  const msg = extractMessage(payload, error.message || "Request failed");
  return { ok: false, data: null, message: msg, status };
}

// -------------------- axios instance --------------------
export const apiClient = axios.create({
  baseURL: "https://fastapi-turbine-62vm.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// giữ interceptors *side-effect only*
apiClient.interceptors.request.use((config) => config);
apiClient.interceptors.response.use(
  (res) => res, // ✅ giữ nguyên AxiosResponse
  (err) => Promise.reject(err) // ✅ để helpers xử lý non-throw
);

// -------------------- typed helpers --------------------
export const api = {
  get: async <T>(
    url: string,
    config?: Parameters<typeof apiClient.get>[1]
  ): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.get<T>(url, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },

  post: async <T>(
    url: string,
    data?: any,
    config?: Parameters<typeof apiClient.post>[2]
  ): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.post<T>(url, data, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },

  put: async <T>(
    url: string,
    data?: any,
    config?: Parameters<typeof apiClient.put>[2]
  ): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.put<T>(url, data, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },

  delete: async <T>(
    url: string,
    config?: Parameters<typeof apiClient.delete>[1]
  ): Promise<ApiResult<T>> => {
    try {
      const res = await apiClient.delete<T>(url, config);
      return toOk(res);
    } catch (e) {
      return toErr(e as AxiosError);
    }
  },
};
