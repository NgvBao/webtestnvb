// Turbine domain types (status removed)

export type Turbine = {
  id: string;
  name: string;
  description?: string;
  windfarm_id: string;
  windfarm_name?: string;
  capacity_mw?: number;     // number >= 0
  coordinates?: string;     // "lat,lng" e.g. "21.0278,105.8342"
  serial_no?: string;
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
  created_by: string;        // user id
};

export type CreateTurbineRequest = {
  name: string;              // required
  description?: string;
  capacity_mw?: number;
  serial_no?: string;
  coordinates?: string;      // "lat,lng"
};

export type UpdateTurbineRequest = Partial<CreateTurbineRequest>;

// ⛔️ removed UpdateTurbineStatusRequest and TurbineStatus

export type TurbineListResponse = {
  turbines: Turbine[];
  total: number;
  limit: number;
  offset: number;
};

// Backend trả 204 + body rỗng (swagger ví dụ "string")
// Để gọn, cho phép string | null
export type DeleteTurbineResponse = string | null;
