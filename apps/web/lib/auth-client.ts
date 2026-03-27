const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
  storeAssignments: { storeId: string; scopeType: string }[];
}

export interface AuthClientError {
  message: string;
  statusCode: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore JSON parse error
    }
    throw { message, statusCode: res.status } satisfies AuthClientError;
  }
  return res.json() as Promise<T>;
}

export const authClient = {
  signUp: (email: string, password: string, name: string, tenantId: string) =>
    fetch(`${API_BASE}/api/v1/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, tenantId }),
      credentials: 'include',
    }).then((r) => handleResponse<{ id: string; email: string; name: string }>(r)),

  signIn: (email: string, password: string, tenantId: string) =>
    fetch(`${API_BASE}/api/v1/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenantId }),
      credentials: 'include',
    }).then((r) => handleResponse<{ success: true }>(r)),

  signOut: () =>
    fetch(`${API_BASE}/api/v1/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    }).then((r) => handleResponse<{ success: true }>(r)),

  getSession: () =>
    fetch(`${API_BASE}/api/v1/auth/session`, {
      credentials: 'include',
    }).then(async (r) => {
      if (r.status === 401) return null;
      return handleResponse<{ user: SessionUser }>(r);
    }),

  pinLogin: (pin: string, tenantSlug: string, email: string) =>
    fetch(`${API_BASE}/api/v1/auth/pin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, tenantSlug, email }),
      credentials: 'include',
    }).then((r) => handleResponse<{ token: string; user: { id: string; name: string; email: string; roles: string[]; storeAssignments: { storeId: string; scopeType: string }[] } }>(r)),
};
