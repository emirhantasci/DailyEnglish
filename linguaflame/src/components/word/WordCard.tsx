import { Volume2, Loader2 } from 'lucide-react';
import type { Word } from '@/types';
import { useAudio } from '@/hooks/useAudio';
import { Badge } from '@/components/ui/Badge';
import { DIFFICULTY_COLORS, CATEGORY_ICONS } from '@/utils/constants';

interface WordCardProps {
  word: Word;
  showMeaning?: boolean;
}

export function WordCard({ word, showMeaning = false }: WordCardProps) {
  const { isPlaying, playWord } = useAudio();
  const diffColors = DIFFICULTY_COLORS[word.difficulty];
  const catIcon = CATEGORY_ICONS[word.category] ?? '📖';

  return (
    <div className="animate-fade-in">
      {/* Category & Difficulty badges */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="default" icon={<span>{catIcon}</span>}>
          {word.category}
        </Badge>
        <Badge
          variant={word.difficulty === 'beginner' ? 'success' : word.difficulty === 'intermediate' ? 'warning' : 'danger'}
        >
          {word.difficulty}
        </Badge>
        <Badge variant="info">{word.partOfSpeech}</Badge>
      </div>

      {/* Word */}
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{word.word}</h2>
        <button
          onClick={() => playWord(word.word)}
          className={`p-3 rounded-full transition-all ${
            isPlaying
              ? 'bg-brand-500/30 text-brand-400'
              : 'bg-surface-700 text-slate-300 hover:bg-brand-500/20 hover:text-brand-400'
          }`}
          title="Listen to pronunciation"
        >
          {isPlaying ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className="h-6 w-6" />}
        </button>
      </div>

      {/* Phonetic */}
      <p className="text-lg text-slate-400 font-mono mb-4">{word.phonetic}</p>

      {/* Meaning (conditional) */}
      {showMeaning && (
        <div className="mt-4 space-y-3 animate-slide-up">
          <div className={`p-4 rounded-xl border ${diffColors.border} ${diffColors.bg}`}>
            <p className="text-lg text-slate-200 font-medium">{word.definition}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 uppercase tracking-wider mb-1 font-semibold">Türkçe</p>
            <p className="text-xl text-blue-200 font-bold">{word.turkishMeaning}</p>
          </div>
          {word.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm text-slate-500">Synonyms:</span>
              {word.synonyms.map((s) => (
                <span key={s} className="text-sm text-slate-400 bg-surface-700 px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
