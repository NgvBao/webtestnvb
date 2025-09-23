// src/api/services/projectService.ts
import { api, type ApiResult } from "../core";
import { PROJECTS } from "../endpoints";
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectResponse,
  ProjectListResponse,
  ProjectStatusEnum,
} from "../types/typesprojectService";

// Params cho list
type ListParams = {
  status?: ProjectStatusEnum;
  limit?: number;
  offset?: number;
};

// Params cho listAll (admin)
type ListAllParams = {
  limit?: number;
  offset?: number;
};

export const projectService = {
  /** Tạo project — POST /projects/ */
  create: (data: ProjectCreateRequest): Promise<ApiResult<ProjectResponse>> =>
    api.post<ProjectResponse>(PROJECTS.CREATE, data),

  /** Danh sách project của current user — GET /projects/?status=&limit=&offset= */
  list: (params?: ListParams): Promise<ApiResult<ProjectListResponse>> =>
    api.get<ProjectListResponse>(PROJECTS.LIST, { params }),

  /** Chi tiết project — GET /projects/{project_id} */
  detail: (project_id: string): Promise<ApiResult<ProjectResponse>> =>
    api.get<ProjectResponse>(PROJECTS.DETAIL(project_id)),

  /** (Admin) Danh sách tất cả project — GET /projects/all?limit=&offset= */
  listAll: (params?: ListAllParams): Promise<ApiResult<ProjectListResponse>> =>
    api.get<ProjectListResponse>(PROJECTS.LIST_ALL, { params }),

  // Nếu sau này BE có PUT/DELETE thì mở thêm:
  // update: (project_id: string, data: ProjectUpdateRequest): Promise<ApiResult<ProjectResponse>> =>
  //   api.put<ProjectResponse>(PROJECTS.UPDATE(project_id), data),
  // remove: (project_id: string): Promise<ApiResult<{ message: string }>> =>
  //   api.delete<{ message: string }>(PROJECTS.DELETE(project_id)),
};
