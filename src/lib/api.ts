import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

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
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const body = (json && typeof json === "object" ? (json as ApiErrorBody) : {}) as ApiErrorBody;
    const message = body.error || body.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body.details);
  }

  return json as T;
}

