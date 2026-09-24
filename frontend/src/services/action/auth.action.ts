"use server";

import { apiClient } from "@/services/api";

export const CallLogin = async (payload: any) => {
  try {
    const response: any = await apiClient.post("/Auth/Login", payload);
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred during login",
    };
  }
};
