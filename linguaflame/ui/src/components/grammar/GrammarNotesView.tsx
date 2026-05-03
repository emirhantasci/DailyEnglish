import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import type { GrammarTopic } from '@/types';

interface GrammarNotesViewProps {
  topic: GrammarTopic;
}

export function GrammarNotesView({ topic }: GrammarNotesViewProps) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
        <h3 className="text-2xl font-bold text-white">Common Mistakes</h3>
        <p className="text-slate-400">Türk öğrencilerin sık yaptığı hatalar</p>
      </div>

      {/* Common Mistakes */}
      <div className="space-y-4">
        {topic.commonMistakes.map((mistake, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-700/50 border border-surface-600/30 animate-slide-up space-y-3"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {/* Wrong */}
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Wrong</span>
                <p className="text-red-300 text-lg line-through decoration-red-500/50">{mistake.wrong}</p>
              </div>
            </div>

            {/* Correct */}
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Correct</span>
                <p className="text-emerald-300 text-lg font-medium">{mistake.correct}</p>
              </div>
            </div>

            {/* Explanation */}
            <div className="pl-8 pt-2 border-t border-surface-600/30">
              <p className="text-slate-400 text-sm">💡 {mistake.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Signal Words recap */}
      <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/25">
        <h4 className="text-white font-bold mb-2">🔑 Signal Words — Bu yapıyı gördüğünde düşün:</h4>
        <div className="flex flex-wrap gap-2">
          {topic.signalWords.map((word) => (
            <span
              key={word}
              className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-sm font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
