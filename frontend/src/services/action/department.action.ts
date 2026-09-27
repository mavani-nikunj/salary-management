"use server";

import { apiClient, withAuth } from "@/services/api";
import { createAction } from "./base";

export async function getDepartmentsAction(search?: string) {
  return createAction((token) =>
    apiClient.get("/departments", withAuth(token, { params: { search } }))
  );
}

export async function getDepartmentByIdAction(id: string) {
  return createAction((token) =>
    apiClient.get(`/departments/${id}`, withAuth(token))
  );
}

export async function createDepartmentAction(payload: { name: string; status?: "Active" | "Inactive" }) {
  return createAction((token) =>
    apiClient.post("/departments", payload, withAuth(token))
  );
}

export async function updateDepartmentAction(id: string, payload: { name: string; status?: "Active" | "Inactive" }) {
  return createAction((token) =>
    apiClient.put(`/departments/${id}`, payload, withAuth(token))
  );
}

export async function deleteDepartmentAction(id: string) {
  return createAction((token) =>
    apiClient.delete(`/departments/${id}`, withAuth(token))
  );
}
