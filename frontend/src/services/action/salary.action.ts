"use server";

import { apiClient, withAuth } from "@/services/api";
import { createAction } from "./base";

export async function getSalariesAction(params: Record<string, any> = {}) {
  return createAction((token) =>
    apiClient.get("/salaries", withAuth(token, { params }))
  );
}

export async function getSalaryByIdAction(id: string) {
  return createAction((token) =>
    apiClient.get(`/salaries/${id}`, withAuth(token))
  );
}

export async function createSalaryAction(payload: any) {
  return createAction((token) =>
    apiClient.post("/salaries", payload, withAuth(token))
  );
}

export async function updateSalaryAction(id: string, payload: any) {
  return createAction((token) =>
    apiClient.put(`/salaries/${id}`, payload, withAuth(token))
  );
}

export async function deleteSalaryAction(id: string) {
  return createAction((token) =>
    apiClient.delete(`/salaries/${id}`, withAuth(token))
  );
}

export async function sendSalaryEmailAction(id: string) {
  return createAction((token) =>
    apiClient.post(`/salaries/${id}/send-email`, {}, withAuth(token))
  );
}
