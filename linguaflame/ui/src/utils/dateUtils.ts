import { TURKEY_UTC_OFFSET } from './constants';

export function getTurkeyNow(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + TURKEY_UTC_OFFSET * 3600000);
}

export function getTurkeyDateStr(date?: Date): string {
  const d = date ?? getTurkeyNow();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getYesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return getTurkeyDateStr(d);
}

export function getDaysAgo(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - days);
  return getTurkeyDateStr(d);
}

export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T12:00:00');
  const d2 = new Date(dateStr2 + 'T12:00:00');
  return Math.round(Math.abs(d2.getTime() - d1.getTime()) / 86400000);
}

export function getLast30Days(): string[] {
  const today = getTurkeyDateStr();
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(getDaysAgo(today, i));
  }
  return days;
}
