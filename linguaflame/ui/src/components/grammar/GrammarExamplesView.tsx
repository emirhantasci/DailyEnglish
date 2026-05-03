import { MessageSquareText } from 'lucide-react';
import type { GrammarTopic } from '@/types';

interface GrammarExamplesViewProps {
  topic: GrammarTopic;
}

export function GrammarExamplesView({ topic }: GrammarExamplesViewProps) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <MessageSquareText className="h-10 w-10 text-brand-400 mx-auto" />
        <h3 className="text-2xl font-bold text-white">Examples — Örnekler</h3>
        <p className="text-slate-400">Gerçek kullanım örnekleri</p>
      </div>

      {/* Example cards */}
      <div className="space-y-3">
        {topic.examples.map((ex, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-700/50 border border-surface-600/30 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{ex.emoji}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-surface-600/50 px-2 py-0.5 rounded-full">
                {ex.label}
              </span>
            </div>

            {/* English sentence */}
            <p
              className="text-white text-lg leading-relaxed font-medium"
              dangerouslySetInnerHTML={{
                __html: ex.english.replace(
                  /\*\*(.*?)\*\*/g,
                  '<span class="text-brand-400 font-bold underline decoration-brand-500/40 underline-offset-2">$1</span>',
                ),
              }}
            />

            {/* Turkish translation */}
            <p className="text-blue-300/80 mt-2 text-sm">
              🇹🇷 {ex.turkish}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
