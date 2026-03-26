import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    auth?: boolean;
    query?: Record<string, string | number | undefined>;
  }
): Promise<T> {
  const method = options?.method ?? "GET";
  const auth = options?.auth ?? true;

  const query = options?.query
    ? new URLSearchParams(
        Object.entries(options.query).filter(([, v]) => typeof v !== "undefined").map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const url = `${API_BASE}${path}${query ? `?${query}` : ""}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message = json?.error || json?.message || `Request failed (${res.status})`;
    const err = new Error(message) as Error & { status?: number; details?: any };
    err.status = res.status;
    err.details = json?.details;
    throw err;
  }

  return json as T;
}

