import { BookOpen, Zap, Lightbulb } from 'lucide-react';
import type { GrammarTopic } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface GrammarIntroProps {
  topic: GrammarTopic;
}

const levelColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
} as const;

const categoryLabels: Record<string, string> = {
  tenses: 'Tenses',
  clauses: 'Clauses',
  modals: 'Modals',
  other: 'Grammar',
};

export function GrammarIntro({ topic }: GrammarIntroProps) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-5xl">{topic.emoji}</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {topic.title}
        </h2>
        <p className="text-xl text-brand-400 font-semibold">{topic.titleTr}</p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={levelColors[topic.level]}>{topic.level}</Badge>
          <Badge variant="brand" icon={<BookOpen className="h-3 w-3" />}>
            {categoryLabels[topic.category] ?? topic.category}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 rounded-xl bg-surface-700/50 border border-surface-600/30">
        <p className="text-slate-200 text-lg leading-relaxed">{topic.description}</p>
        <p className="text-blue-300 mt-2">{topic.descriptionTr}</p>
      </div>

      {/* When to use */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
          <Zap className="h-5 w-5 text-amber-400" />
          When to Use — Ne Zaman Kullanılır?
        </h3>
        <div className="space-y-2">
          {topic.whenToUse.map((use, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-surface-700/30 border border-surface-600/20 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-brand-400 font-bold text-lg mt-0.5">{i + 1}</span>
              <p
                className="text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: use.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-400 font-bold">$1</span>'),
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Signal Words */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Signal Words — İpucu Kelimeleri
        </h3>
        <div className="flex flex-wrap gap-2">
          {topic.signalWords.map((word) => (
            <span
              key={word}
              className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
