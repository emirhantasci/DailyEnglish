import { useCallback, useMemo } from 'react';
import type { StreakData, UserProgress } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { useSync } from './useSync';
import {
  createDefaultStreak,
  calculateStreakOnLogin,
  completeDay,
  isTodayCompleted,
} from '@/utils/streakCalculator';
import { getTurkeyDateStr } from '@/utils/dateUtils';
import { getStoredAuth } from '@/services/authApi';

function makeDefaultProgress(): UserProgress {
  const auth = getStoredAuth();
  return {
    userId: auth ? String(auth.userId) : 'guest',
    displayName: auth?.displayName ?? 'Learner',
    streak: createDefaultStreak(),
    sessions: {},
    learnedWordIds: [],
    totalExams: 0,
    totalScore: 0,
    joinedDate: getTurkeyDateStr(),
  };
}

export function useStreak(enabled = true) {
  const [progress, setProgress] = useLocalStorage<UserProgress>('linguaflame-progress', makeDefaultProgress());
  const { syncStatus, syncToRemote } = useSync(progress, setProgress, enabled);

  const stampAndSync = useCallback(
    (updater: (prev: UserProgress) => UserProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        const stamped = { ...next, lastModified: new Date().toISOString() };
        syncToRemote(stamped);
        return stamped;
      });
    },
    [setProgress, syncToRemote],
  );

  const refreshStreak = useCallback(() => {
    stampAndSync((prev) => ({
      ...prev,
      streak: calculateStreakOnLogin(prev.streak),
    }));
  }, [stampAndSync]);

  const completeTodayStreak = useCallback(() => {
    stampAndSync((prev) => ({
      ...prev,
      streak: completeDay(prev.streak),
    }));
  }, [stampAndSync]);

  const updateProgress = useCallback(
    (updater: (prev: UserProgress) => UserProgress) => {
      stampAndSync(updater);
    },
    [stampAndSync],
  );

  const todayCompleted = useMemo(() => isTodayCompleted(progress.streak), [progress.streak]);

  return {
    progress,
    streak: progress.streak as StreakData,
    todayCompleted,
    refreshStreak,
    completeTodayStreak,
    updateProgress,
    syncStatus,
  };
}
