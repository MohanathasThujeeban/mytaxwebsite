const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface ApiError extends Error {
  status?: number;
}

const request = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // ignore JSON parse errors; handled below
  }

  if (!res.ok) {
    const err = new Error(
      (data as { message?: string })?.message || `Request failed (${res.status})`
    ) as ApiError;
    err.status = res.status;
    throw err;
  }

  return data as T;
};

const requestGet = async <T>(path: string, token?: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // ignore JSON parse errors; handled below
  }

  if (!res.ok) {
    const err = new Error(
      (data as { message?: string })?.message || `Request failed (${res.status})`
    ) as ApiError;
    err.status = res.status;
    throw err;
  }

  return data as T;
};

export const api = {
  requestOtp: (payload: { nic: string; phone?: string; email?: string }) =>
    request<{ message: string; channel: string; expiresAt: string; token?: string }>("/auth/otp", payload),

  verifyOtp: (payload: { nic: string; code: string; email?: string }) =>
    request<{ message: string; token: string }>("/auth/verify", payload),

  verifyOtpWithEmail: (payload: { nic: string; email: string; code: string }) =>
    request<{ message: string; token: string }>("/auth/verify", payload),

  register: (payload: {
    nic: string;
    emailAddress: string;
    fullName: string;
    mobileNo: string;
    district?: string;
    dsDivision?: string;
    gsDivision?: string;
    postalNo?: string;
    addressLine1?: string;
    addressLine2?: string;
    password: string;
  }) => request<{ message: string; token: string; user: Record<string, unknown> }>("/auth/register", payload),

  login: (payload: { nic: string; password: string }) =>
    request<{ message: string; token: string; role?: string; user: Record<string, unknown> }>("/auth/login", payload),

  adminUsers: (token: string) =>
    requestGet<{ users: Record<string, unknown>[] }>("/admin/users", token),
};
