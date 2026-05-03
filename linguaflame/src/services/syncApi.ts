import type { UserProgress } from '@/types';
import { getStoredAuth } from './authApi';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function authHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network error — offline, return null silently
    return null;
  }
}

export async function fetchProgress(): Promise<UserProgress | null> {
  return apiFetch<UserProgress>('/progress');
}

export async function saveProgress(progress: UserProgress): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(progress),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[] | null> {
  return apiFetch<LeaderboardEntry[]>('/leaderboard');
}

export interface LeaderboardEntry {
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  totalExams: number;
  totalScore: number;
}

