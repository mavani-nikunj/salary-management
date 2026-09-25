"use server";

import { apiClient } from "@/services/api";

export const CallLogin = async (payload: any) => {
  try {
    const response: any = await apiClient.post("/auth/login", payload);
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error.code || 400,
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
      code: error.code || 400,
      message: error.message || "Failed to process forgot password request",
    };
  }
};

export const CallResetPassword = async (payload: {
  token: string;
  newPassword: string;
}) => {
  try {
    const response: any = await apiClient.post("/auth/reset-password", payload);
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error.code || 400,
      message: error.message || "Failed to reset password",
    };
  }
};

export const CallChangePassword = async (
  payload: { currentPassword: string; newPassword: string },
  token?: string,
) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response: any = await apiClient.post(
      "/auth/change-password",
      payload,
      { headers },
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      code: error.code || 400,
      message: error.message || "Failed to update password",
    };
  }
};
