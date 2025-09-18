// Thông tin cơ bản của 1 project
export type Project = {
  id: string;
  name: string;
  description?: string;
  windfarm_count: number;
  created_at: string;      // ISO string
  updated_at?: string;     // ISO string
};

// Request để tạo project
export type ProjectCreateRequest = {
  name: string;
  description?: string;
  windfarm_count?: number;
};

// Response cho 1 project (single)
export type ProjectResponse = {
  status: string;          // e.g., "success", "error"
  message: string;
  data: Project;
};

// Response khi list project
export type ProjectsListResponse = {
  status: string;
  message: string;
  data: Project[];
};
