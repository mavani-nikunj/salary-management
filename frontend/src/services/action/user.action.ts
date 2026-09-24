import { apiClient, withAuth } from "../api";
import { createAction } from "./base";

export async function getUserByIdAction(id: string) {
  return createAction((token) => apiClient.get(`users/${id}`, withAuth(token)));
}
