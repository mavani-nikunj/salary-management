"use server";

import { apiClient, withAuth } from "@/services/api";
import { createAction } from "./base";

export const CallLogin = async (payload: { email: string; password: string }) => {
  try {
    const response: any = await apiClient.post("/auth/login", payload);
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred during login",
    };
  }
};

export const CallForgotPassword = async (payload: { email: string }) => {
  try {
    const response: any = await apiClient.post("/auth/forgot-password", payload);
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to process forgot password request",
    };
  }
};

export const CallResetPassword = async (payload: { token: string; password: string }) => {
  try {
    const response: any = await apiClient.post("/auth/reset-password", payload);
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to reset password",
    };
  }
};

export const CallGetMe = async () => {
  return createAction((token) => apiClient.get("/auth/me", withAuth(token)));
};

export const CallChangePassword = async (payload: { oldPassword: string; newPassword: string }) => {
  return createAction((token) => apiClient.post("/auth/change-password", payload, withAuth(token)));
};
