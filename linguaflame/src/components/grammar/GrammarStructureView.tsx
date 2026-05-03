import { Code, AlertTriangle, HelpCircle } from 'lucide-react';
import type { GrammarTopic } from '@/types';

interface GrammarStructureViewProps {
  topic: GrammarTopic;
}

export function GrammarStructureView({ topic }: GrammarStructureViewProps) {
  const struct = topic.structure;
  const help = topic.structureHelp;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Code className="h-10 w-10 text-brand-400 mx-auto" />
        <h3 className="text-2xl font-bold text-white">Structure — Yapısı</h3>
        <p className="text-slate-400">Cümle kuruluş formülleri</p>
      </div>

      {/* Structure Help — Key Terms */}
      {help && help.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-base font-bold text-white mb-3">
            <HelpCircle className="h-5 w-5 text-violet-400" />
            Key Terms — Terimler
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {help.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-violet-500/8 border border-violet-500/20 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-mono font-bold text-violet-300 text-sm">{item.term}</span>
                </div>
                <p className="text-xs text-slate-300">{item.meaning}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.meaningTr}</p>
                {item.examples.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.examples.map((ex, j) => (
                      <span
                        key={j}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-surface-700/80 text-slate-400"
                        dangerouslySetInnerHTML={{
                          __html: ex.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-400 font-semibold">$1</span>'),
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structure formulas */}
      <div className="space-y-3">
        {/* Positive */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✅</span>
            <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Positive (+)</span>
          </div>
          {struct.positive.split('\n').map((line, i) => (
            <p key={i} className="text-white font-mono text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>

        {/* Negative */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">❌</span>
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Negative (−)</span>
          </div>
          {struct.negative.split('\n').map((line, i) => (
            <p key={i} className="text-white font-mono text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>

        {/* Question */}
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">❓</span>
            <span className="text-sky-400 font-bold text-sm uppercase tracking-wider">Question (?)</span>
          </div>
          {struct.question.split('\n').map((line, i) => (
            <p key={i} className="text-white font-mono text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Important Notes — Önemli Notlar
        </h3>
        <div className="space-y-3">
          {topic.notes.map((note, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-surface-700/50 border border-surface-600/30 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{note.icon}</span>
                <h4 className="text-white font-bold">{note.title}</h4>
              </div>
              <p className="text-slate-300 mb-2">{note.description}</p>
              {note.examples && (
                <div className="space-y-1 mt-2">
                  {note.examples.map((ex, j) => (
                    <p
                      key={j}
                      className="text-sm text-slate-400 pl-3 border-l-2 border-brand-500/30"
                      dangerouslySetInnerHTML={{
                        __html: ex.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-400 font-bold">$1</span>'),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
