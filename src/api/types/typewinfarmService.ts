export type ISODate = string;

/** Entity — trả về ở cả list & detail */
export interface WindfarmEntity {
  id: string;
  name: string;
  description?: string | null;
  own_company?: string | null;
  location?: string | null;

  project_id: string;
  project_name?: string | null;

  created_at?: ISODate;
  updated_at?: ISODate | null;
  created_by?: string | null;

  turbine_count: number;
}

/** ----- REQUESTS ----- */
export interface WindfarmCreateRequest {
  name: string;         // required
  location: string;     // required
  description?: string;
  own_company?: string;
}

export interface WindfarmUpdateRequest {
  name?: string;
  location?: string;
  description?: string;
  own_company?: string;
}

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

/** Bulk delete: body là string[], response BE hiện có thể chỉ là "string" */
export type WindfarmBulkDeleteResult =
  | string
  | {
      deleted_count?: number;
      total_requested?: number;
      errors?: string[];
    };
