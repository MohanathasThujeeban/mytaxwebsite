const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface ApiError extends Error {
  status?: number;
}

const parseJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
};

const throwApiError = (res: Response, data: unknown): never => {
  const err = new Error(
    (data as { message?: string })?.message || `Request failed (${res.status})`
  ) as ApiError;
  err.status = res.status;
  throw err;
};

const request = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await parseJson(res);

  if (!res.ok) {
    throwApiError(res, data);
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

  const data = await parseJson(res);

  if (!res.ok) {
    throwApiError(res, data);
  }

  return data as T;
};

const requestAuthed = async <T>(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
  token: string,
): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await parseJson(res);

  if (!res.ok) {
    throwApiError(res, data);
  }

  return data as T;
};

export const api = {
  requestOtp: (payload: { nic: string; phone?: string; email?: string }) =>
    request<{ message: string; channel: string; expiresAt: string; token?: string; isRegistered?: boolean }>("/auth/otp", payload),

  verifyOtp: (payload: { nic: string; code: string; email?: string }) =>
    request<{ message: string; token: string; isRegistered?: boolean }>("/auth/verify", payload),

  verifyOtpWithEmail: (payload: { nic: string; email: string; code: string }) =>
    request<{ message: string; token: string; isRegistered?: boolean }>("/auth/verify", payload),

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

  adminTinApplications: (token: string, options?: { paidOnly?: boolean; moduleCode?: 'M6' | 'M7' }) => {
    const params = new URLSearchParams();
    if (options?.paidOnly) {
      params.set('paidOnly', 'true');
    }
    if (options?.moduleCode) {
      params.set('moduleCode', options.moduleCode);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return requestGet<{ applications: Record<string, unknown>[] }>(`/admin/tin-applications${query}`, token);
  },

  adminAssignTin: (token: string, applicationId: string, assignedTin: string) =>
    requestAuthed<{ message: string; application: Record<string, unknown> }>(
      `/admin/tin-applications/${encodeURIComponent(applicationId)}/assign-tin`,
      "PATCH",
      { assignedTin },
      token,
    ),

  adminSendTinCertificate: (
    token: string,
    applicationId: string,
    payload: {
      tinNumber?: string;
      fileName: string;
      fileType?: string;
      fileDataUrl: string;
    },
  ) =>
    requestAuthed<{
      message: string;
      application: Record<string, unknown>;
      delivery: {
        sentTo: string;
        sentAt: string;
        fileName: string;
        tinNumber: string;
        paymentReference: string | null;
      };
    }>(
      `/admin/tin-applications/${encodeURIComponent(applicationId)}/send-certificate`,
      "POST",
      payload,
      token,
    ),

  m7Latest: (token: string) =>
    requestGet<{ application: Record<string, unknown> | null }>("/m7/latest", token),

  m7SaveDraft: (token: string, payload: { application?: Record<string, unknown> }) =>
    requestAuthed<{ message: string; application: Record<string, unknown> }>("/m7/draft", "POST", payload, token),

  m7Submit: (token: string, payload: { application?: Record<string, unknown>; payment?: Record<string, unknown> }) =>
    requestAuthed<{ message: string; application: Record<string, unknown> }>("/m7/submit", "POST", payload, token),

  m6Latest: (token: string) =>
    requestGet<{ application: Record<string, unknown> | null }>("/m6/latest", token),

  m6SaveDraft: (token: string, payload: { application?: Record<string, unknown> }) =>
    requestAuthed<{ message: string; application: Record<string, unknown> }>("/m6/draft", "POST", payload, token),

  m6Submit: (token: string, payload: { application?: Record<string, unknown>; payment?: Record<string, unknown> }) =>
    requestAuthed<{ message: string; application: Record<string, unknown> }>("/m6/submit", "POST", payload, token),

  m2TinStatus: (token: string, nic: string) =>
    requestGet<{ tinStatus: Record<string, unknown> }>(`/m2/status?nic=${encodeURIComponent(nic)}`, token),
};
