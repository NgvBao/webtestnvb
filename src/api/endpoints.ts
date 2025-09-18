// src/api/endpoints.ts

// =======================
// Authentication
// =======================
export const AUTH = {
  REGISTER: "/auth/register",
  VERIFY_REGISTRATION: "/auth/verify-registration",
  RESEND_REGISTRATION_OTP: "/auth/resend-registration-otp",
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_RESET_OTP: "/auth/verify-reset-otp",
  RESEND_RESET_OTP: "/auth/resend-reset-otp",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  CHANGE_PASSWORD: "/auth/change-password",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",

  ADMIN: {
    PENDING_USERS: "/auth/admin/pending-users",
    APPROVE_USER: "/auth/admin/approve-user",
    ALL_USERS: "/auth/admin/all-users",
    DELETE_USER: (user_id: string) => `/auth/admin/delete-user/${user_id}`,
  },
};

// =======================
// Projects
// =======================
export const PROJECTS = {
  CREATE: "/projects",
  LIST: "/projects",
  DETAIL: (project_id: string) => `/projects/${project_id}`,
};

// =======================
// Windfarms
// =======================
export const WINDFARMS = {
  CREATE: "/windfarms",
  BATCH_CREATE: "/windfarms/batch",
  LIST_BY_PROJECT: (project_id: string) => `/windfarms/project/${project_id}`,
  DETAIL: (windfarm_id: string) => `/windfarms/${windfarm_id}`,
  UPDATE: (windfarm_id: string) => `/windfarms/${windfarm_id}`,
  DELETE: (windfarm_id: string) => `/windfarms/${windfarm_id}`,
  BULK_DELETE: "/windfarms/bulk",
};

// =======================
// Turbines
// =======================
export const TURBINES = {
  CREATE: "/turbines",
  BATCH_CREATE: "/turbines/batch",
  LIST_BY_WINDFARM: (windfarm_id: string) => `/turbines/windfarm/${windfarm_id}`,
  DETAIL: (turbine_id: string) => `/turbines/${turbine_id}`,
  UPDATE: (turbine_id: string) => `/turbines/${turbine_id}`,
  DELETE: (turbine_id: string) => `/turbines/${turbine_id}`,
  UPDATE_STATUS: (turbine_id: string) => `/turbines/${turbine_id}/status`,
  BULK_UPDATE_STATUS: "/turbines/bulk/status",
};

// =======================
// Members
// =======================
export const MEMBERS = {
  ADD: (project_id: string) => `/members/${project_id}/add`,
  LIST: (project_id: string) => `/members/${project_id}`,
  REMOVE: (project_id: string, user_id: string) => `/members/${project_id}/remove/${user_id}`,
  UPDATE_ROLE: (project_id: string, user_id: string) => `/members/${project_id}/update-role/${user_id}`,
};

// =======================
// Audit
// =======================
export const AUDIT = {
  DEFAULT: "/audit", // placeholder nếu có
};

// =======================
// Default / Health
// =======================
export const DEFAULT = {
  HEALTH: "/health",
  ROOT: "/",
};
