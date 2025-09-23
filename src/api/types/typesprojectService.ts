// src/api/types/typesprojectService.ts

// ---- Role: dùng object làm "value", union làm "type"
export const ProjectRole = {
  OWNER: "owner",
  MANAGER: "manager",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

// Kiểu type: "owner" | "manager" | "editor" | "viewer"
export type ProjectRoleEnum = typeof ProjectRole[keyof typeof ProjectRole];

// ---- Status: tương tự
export const ProjectStatus = {
  NOT_STARTED: "not_started",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type ProjectStatusEnum = typeof ProjectStatus[keyof typeof ProjectStatus];

export type ProjectCreateRequest = {
  name: string;
  description?: string;
  location?: string;
  status?: ProjectStatusEnum;
};

export type ProjectUpdateRequest = {
  name?: string;
  description?: string;
  location?: string;
  status?: ProjectStatusEnum;
};

export type ProjectEntity = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status: ProjectStatusEnum;

  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;

  invite_code?: string | null;
  invite_expires_at?: string | null;

  windfarm_count?: number;
  turbine_count?: number;
  member_count?: number;

  user_role?: ProjectRoleEnum;
  user_joined_at?: string | null;
};

export type ProjectResponse = ProjectEntity;

export type ProjectListResponse = {
  projects: ProjectEntity[];
  total: number;
  limit: number;
  offset: number;
};
