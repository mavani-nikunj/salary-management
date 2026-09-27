"use server";

import { apiClient, withAuth } from "@/services/api";
import { createAction } from "./base";

export async function getDashboardDataAction() {
  return createAction((token) => apiClient.get("/dashboard", withAuth(token)));
}

export async function getDashboardMetricsAction() {
  return createAction((token) => apiClient.get("/dashboard/metrics", withAuth(token)));
}

export async function getReportsOverviewAction() {
  return createAction((token) => apiClient.get("/reports/overview", withAuth(token)));
}

export async function getReportsDepartmentsAction() {
  return createAction((token) => apiClient.get("/reports/departments", withAuth(token)));
}

export async function getReportsPayrollHistoryAction() {
  return createAction((token) => apiClient.get("/reports/payroll-history", withAuth(token)));
}
