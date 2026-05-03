import { Flame, Snowflake, Trophy, Calendar } from 'lucide-react';
import type { StreakData } from '@/types';
import { getLast30Days, getTurkeyDateStr } from '@/utils/dateUtils';
import { clsx } from 'clsx';

interface StreakDisplayProps {
  streak: StreakData;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day: d.getDate(),
    dayName: DAY_NAMES[d.getDay()],
    month: MONTH_NAMES[d.getMonth()],
  };
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const last30 = getLast30Days();
  const today = getTurkeyDateStr();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main streak display */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {/* Current streak */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Flame className="h-16 w-16 text-brand-500 animate-flame" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white drop-shadow-lg mt-1">
              {streak.currentStreak}
            </span>
          </div>
          <span className="text-sm text-slate-400 mt-1 font-medium">Day Streak</span>
        </div>

        {/* Longest streak */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          <span className="text-lg font-bold text-amber-400">{streak.longestStreak}</span>
          <span className="text-xs text-slate-500">Best</span>
        </div>

        {/* Freezes */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/20 border border-blue-500/30">
            <Snowflake className="h-8 w-8 text-blue-400" />
          </div>
          <span className="text-lg font-bold text-blue-400">{streak.freezesAvailable}</span>
          <span className="text-xs text-slate-500">Freezes</span>
        </div>
      </div>

      {/* Calendar view */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400 font-medium">Last 30 Days</span>
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
          {last30.map((date) => {
            const status = streak.history[date];
            const isToday = date === today;
            const { day, dayName } = parseDateParts(date);
            return (
              <div
                key={date}
                title={`${date} (${dayName}): ${status ?? 'no activity'}`}
                className={clsx(
                  'relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[44px] transition-all duration-200',
                  status === 'completed' && 'bg-emerald-500/20 shadow-sm shadow-emerald-500/20',
                  status === 'freeze' && 'bg-blue-500/20 shadow-sm shadow-blue-500/20',
                  status === 'missed' && 'bg-red-500/15',
                  !status && 'bg-surface-700/60',
                  isToday && 'ring-2 ring-brand-500 ring-offset-1 ring-offset-surface-900',
                )}
              >
                <span className={clsx(
                  'text-[10px] leading-none',
                  isToday ? 'text-brand-400 font-bold' : 'text-slate-500',
                )}>{dayName}</span>
                <span className={clsx(
                  'text-sm font-bold leading-tight',
                  status === 'completed' && 'text-emerald-400',
                  status === 'freeze' && 'text-blue-400',
                  status === 'missed' && 'text-red-400',
                  !status && isToday && 'text-brand-400',
                  !status && !isToday && 'text-slate-400',
                )}>{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" /> Completed</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500/40" /> Freeze</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/30" /> Missed</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm ring-2 ring-brand-500" /> Today</span>
        </div>
      </div>
    </div>
  );
}
