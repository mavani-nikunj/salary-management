"use server";

import { apiClient, withAuth } from "@/services/api";
import { createAction } from "./base";

export async function getCountriesAction(limit: number = 300) {
  return createAction((token) =>
    apiClient.get("/countries", withAuth(token, { params: { limit } }))
  );
}

export async function getCurrenciesAction(limit: number = 300) {
  return createAction((token) =>
    apiClient.get("/currencies", withAuth(token, { params: { limit } }))
  );
}
