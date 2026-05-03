import type { StreakData } from '@/types';
import { STREAK_FREEZE_INTERVAL, MAX_CONSECUTIVE_MISSED_DAYS } from './constants';
import { getTurkeyDateStr, getYesterday, daysBetween } from './dateUtils';

export function createDefaultStreak(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    freezesAvailable: 0,
    freezesUsed: 0,
    lastActiveDate: null,
    lastFreezeDate: null,
    consecutiveMissedDays: 0,
    history: {},
  };
}

export function calculateStreakOnLogin(streak: StreakData): StreakData {
  const today = getTurkeyDateStr();
  const updated = { ...streak, history: { ...streak.history } };

  if (!updated.lastActiveDate) return updated;

  const lastDate = updated.lastActiveDate;
  if (lastDate === today) return updated;

  const missed = daysBetween(lastDate, today) - 1;

  if (missed === 0) return updated;

  // Fill in missed days
  let consecutiveMissed = 0;
  let currentDate = getYesterday(today);

  for (let i = 0; i < missed; i++) {
    const dateStr = currentDate;
    if (updated.history[dateStr] === 'completed') break;

    if (updated.freezesAvailable > 0 && consecutiveMissed < MAX_CONSECUTIVE_MISSED_DAYS - 1) {
      updated.history[dateStr] = 'freeze';
      updated.freezesAvailable--;
      updated.freezesUsed++;
      updated.lastFreezeDate = dateStr;
    } else {
      updated.history[dateStr] = 'missed';
      consecutiveMissed++;
    }

    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    currentDate = getTurkeyDateStr(d);
  }

  updated.consecutiveMissedDays = consecutiveMissed;

  // If 3+ consecutive missed days → reset streak
  if (consecutiveMissed >= MAX_CONSECUTIVE_MISSED_DAYS) {
    updated.currentStreak = 0;
    updated.consecutiveMissedDays = 0;
  }

  return updated;
}

export function completeDay(streak: StreakData): StreakData {
  const today = getTurkeyDateStr();
  const updated = { ...streak, history: { ...streak.history } };

  updated.history[today] = 'completed';
  updated.lastActiveDate = today;
  updated.consecutiveMissedDays = 0;

  // Calculate current streak by counting backwards
  let count = 0;
  let checkDate = today;
  while (true) {
    const status = updated.history[checkDate];
    if (status === 'completed' || status === 'freeze') {
      count++;
      const d = new Date(checkDate + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      checkDate = getTurkeyDateStr(d);
    } else {
      break;
    }
  }

  updated.currentStreak = count;
  updated.longestStreak = Math.max(updated.longestStreak, count);

  // Award freezes: 1 freeze per 10-day streak milestone
  const earnedFreezes = Math.floor(count / STREAK_FREEZE_INTERVAL);
  const totalFreezesSoFar = updated.freezesUsed + updated.freezesAvailable;
  if (earnedFreezes > totalFreezesSoFar) {
    updated.freezesAvailable += earnedFreezes - totalFreezesSoFar;
  }

  return updated;
}

export function isTodayCompleted(streak: StreakData): boolean {
  const today = getTurkeyDateStr();
  return streak.history[today] === 'completed';
}
