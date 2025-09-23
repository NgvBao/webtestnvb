// src/api/services/memberService.ts
import { api, type ApiResult } from "../../api/core";
import { MEMBERS } from "../../api/endpoints";
import type {
  ProjectMember,
  ProjectMemberResponse,
  ProjectMemberListResponse,
  AdminUserLite,
  AddMemberRequest,
} from "../types/typesmemberService";

// Map BE -> UI
function mapMember(m: ProjectMemberResponse): ProjectMember {
  return {
    project_id: m.project_id,
    user_id: m.user_id,
    user_name: m.user_name,
    user_email: m.user_email,
    role: m.role,
    can_invite: m.can_invite,
    joined_at: m.joined_at,
  };
}

export const memberService = {
  // List (đã map sang UI)
  list: async (
    projectId: string,
    params: { limit: number; offset: number },
    signal?: AbortSignal
  ): Promise<ApiResult<{ members: ProjectMember[]; total: number; limit: number; offset: number }>> => {
    const res = await api.get<ProjectMemberListResponse>(MEMBERS.LIST(projectId), { params, signal });
    if (!res.ok) return res as any;
    return {
      ok: true,
      status: res.status,
      message: res.message,
      data: {
        members: res.data.members.map(mapMember),
        total: res.data.total,
        limit: res.data.limit,
        offset: res.data.offset,
      },
    };
  },

  // Search users (raw)
  searchUsers: async (
    projectId: string,
    query: string,
    limit = 10,
    signal?: AbortSignal
  ): Promise<ApiResult<AdminUserLite[]>> => {
    return api.get<AdminUserLite[]>(MEMBERS.SEARCH_USERS(projectId), { params: { query, limit }, signal });
  },

  // Add member (payload.role phải là "owner" | "editor" | "viewer")
  add: async (
    projectId: string,
    payload: AddMemberRequest
  ): Promise<ApiResult<ProjectMember>> => {
    const res = await api.post<ProjectMemberResponse>(MEMBERS.ADD(projectId), payload);
    if (!res.ok) return res as any;
    return { ok: true, status: res.status, message: res.message, data: mapMember(res.data) };
  },

  // Remove member
  remove: async (projectId: string, userId: string): Promise<ApiResult<null>> => {
    return api.delete<null>(MEMBERS.REMOVE(projectId, userId));
  },
};
