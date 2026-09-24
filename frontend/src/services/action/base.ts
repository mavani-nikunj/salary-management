"use server";

import { getAuthToken } from "../api";

/**
 * Shared helper to create a server action with authentication.
 */
export async function createAction<T>(apiFn: (token: string) => Promise<T>) {
  try {
    const token = await getAuthToken();
    if (!token) return { data: null, error: "Unauthorized" };
    const data = await apiFn(token);
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export { getAuthToken };
