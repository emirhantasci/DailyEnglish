const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface AuthUser {
  token: string;
  userId: number;
  email: string;
  displayName: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (res.status === 409) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body.error ?? 'Conflict' };
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body.error ?? 'Bad request' };
    }
    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error' };
  }
}

export async function register(
  email: string,
  displayName: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await apiFetch<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, displayName, password }),
  });
  return { user: data, error };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await apiFetch<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { user: data, error };
}

export function getStoredAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem('linguaflame-auth-v2');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeAuth(user: AuthUser): void {
  localStorage.setItem('linguaflame-auth-v2', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('linguaflame-auth-v2');
}
