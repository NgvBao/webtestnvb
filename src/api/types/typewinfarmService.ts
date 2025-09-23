// src/types/windfarms.ts
export type ISODate = string;

/** Dùng cho cả list & detail theo schema hiện có */
export interface WindfarmEntity {
  id: string;
  name: string;
  own_company?: string | null;
  location?: string | null;

  project_id: string;
  project_name?: string | null;

  created_at?: ISODate;
  updated_at?: ISODate | null;
  created_by?: string | null;

  turbine_count: number; // BE trả trong list/detail theo ví dụ
}

/** ----- REQUESTS: CHỈ 3 FIELD NHƯ DOC ----- */
export interface WindfarmCreateRequest {
  name: string;            // required theo mô tả
  location: string;        // required theo mô tả
  own_company?: string;    // optional
}

export interface WindfarmUpdateRequest {
  name?: string;
  location?: string;
  own_company?: string;
}

/** ----- BATCH CREATE ----- */
export interface WindfarmBatchCreateRequest {
  count: number;
  name_prefix: string;
}

/** ----- RESPONSES ----- */
export interface WindfarmListResponse {
  windfarms: WindfarmEntity[];
  total: number;
  limit: number;
  offset: number;
}

export interface WindfarmBatchResponse {
  created_windfarms: WindfarmEntity[];
  total_created: number;
  errors: string[];
}

/** Bulk delete theo doc: body là string[]; response hiện hiển thị "string" */
export type WindfarmBulkDeleteResult = string | {
  deleted_count?: number;
  total_requested?: number;
  errors?: string[];
};
