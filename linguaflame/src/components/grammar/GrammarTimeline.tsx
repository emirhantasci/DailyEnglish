import { Clock } from 'lucide-react';
import type { GrammarTopic } from '@/types';

interface GrammarTimelineProps {
  topic: GrammarTopic;
}

export function GrammarTimeline({ topic }: GrammarTimelineProps) {
  const timeline = topic.timeline;
  if (!timeline || timeline.length === 0) return null;

  // Find which position is the "active" one (has a description)
  const activePoints = timeline.filter((p) => p.description);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Clock className="h-10 w-10 text-sky-400 mx-auto" />
        <h3 className="text-2xl font-bold text-white">Timeline — Zaman Çizelgesi</h3>
        <p className="text-slate-400">Bu zamanın zaman çizelgesindeki yeri</p>
      </div>

      {/* Visual Timeline */}
      <div className="relative px-4 py-6">
        {/* Main line */}
        <div className="absolute top-1/2 left-6 right-6 h-1 bg-surface-600 rounded-full -translate-y-1/2" />

        {/* Gradient overlay on active segment */}
        <div className="relative flex items-center justify-between">
          {timeline.map((point, i) => {
            const isActive = !!point.description;

            return (
              <div
                key={i}
                className="relative flex flex-col items-center z-10"
                style={{ width: '33.33%' }}
              >
                {/* Dot */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all
                    ${isActive
                      ? 'bg-sky-500 border-sky-400 shadow-lg shadow-sky-500/30 scale-125'
                      : 'bg-surface-700 border-surface-500 opacity-50'
                    }
                  `}
                >
                  {point.emoji}
                </div>

                {/* Label */}
                <div className={`mt-3 text-center ${isActive ? '' : 'opacity-40'}`}>
                  <p className={`text-sm font-bold ${isActive ? 'text-sky-300' : 'text-slate-400'}`}>
                    {point.label}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                    {point.labelTr}
                  </p>
                </div>

                {/* Active indicator arrow */}
                {isActive && (
                  <div className="mt-2 animate-bounce">
                    <span className="text-sky-400 text-lg">▼</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active point descriptions */}
      {activePoints.length > 0 && (
        <div className="space-y-3">
          {activePoints.map((point, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{point.emoji}</span>
                <span className="text-sky-300 font-bold">{point.label}</span>
              </div>
              <p className="text-slate-300 text-sm">{point.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Visual representation with example sentence */}
      <div className="p-4 rounded-xl bg-surface-700/50 border border-surface-600/30">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
          💡 Understanding the timeline — Zaman çizelgesini anlama
        </p>
        <p className="text-sm text-slate-300">
          İngilizce zamanlarda en önemli şey, eylemin zaman çizelgesinde <strong className="text-sky-400">nerede</strong> gerçekleştiğini anlamaktır.
          Her tense farklı bir zaman dilimini veya farklı bir bakış açısını temsil eder.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>⬅️ Past</span>
          <div className="flex-1 h-px bg-surface-600" />
          <span>📍 Now</span>
          <div className="flex-1 h-px bg-surface-600" />
          <span>➡️ Future</span>
        </div>
      </div>
    </div>
  );
}
