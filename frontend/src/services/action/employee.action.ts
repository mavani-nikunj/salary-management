"use server";

import { apiClient, withAuth } from "@/services/api";
import { createAction } from "./base";

export async function getEmployeesAction(params: Record<string, any> = {}) {
  return createAction((token) =>
    apiClient.get("/employees", withAuth(token, { params }))
  );
}

export async function getEmployeeByIdAction(id: string, salaryPage: number = 1, salaryLimit: number = 10) {
  return createAction((token) =>
    apiClient.get(`/employees/${id}`, withAuth(token, { params: { salaryPage, salaryLimit } }))
  );
}

export async function createEmployeeAction(payload: any) {
  return createAction((token) =>
    apiClient.post("/employees", payload, withAuth(token))
  );
}

export async function updateEmployeeAction(id: string, payload: any) {
  return createAction((token) =>
    apiClient.put(`/employees/${id}`, payload, withAuth(token))
  );
}

export async function deleteEmployeeAction(id: string, permanent: boolean = false) {
  return createAction((token) =>
    apiClient.delete(`/employees/${id}`, withAuth(token, { params: { permanent } }))
  );
}

export async function sendEmployeeEmailAction(id: string, payload: { salaryId?: string; subject?: string; message?: string } = {}) {
  return createAction((token) =>
    apiClient.post(`/employees/${id}/send-email`, payload, withAuth(token))
  );
}
