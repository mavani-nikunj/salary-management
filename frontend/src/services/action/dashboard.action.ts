"use server";

import { apiClient, authOptions } from "@/services/api";
import { getServerSession } from "next-auth/next";

export const CallGetDashboard = async () => {
  try {
    const session: any = await getServerSession(authOptions);
    const token = session?.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response: any = await apiClient.get("/dashboard", { headers });
    return response;
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || "Failed to load dashboard data",
      data: null,
    };
  }
};

export const CallGetDashboardMetrics = async () => {
  try {
    const session: any = await getServerSession(authOptions);
    const token = session?.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response: any = await apiClient.get("/dashboard/metrics", { headers });
    return response;
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || "Failed to load dashboard metrics",
      data: null,
    };
  }
};
