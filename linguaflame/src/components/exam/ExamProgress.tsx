import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckCircle, HelpCircle, PenLine, BookOpen } from 'lucide-react';
import type { QuestionType } from '@/types';
import { clsx } from 'clsx';

interface ExamProgressProps {
  current: number;
  total: number;
  score: number;
  questionType?: QuestionType;
}

const typeIcons: Record<QuestionType, React.ReactNode> = {
  'multiple-choice': <HelpCircle className="h-4 w-4" />,
  'fill-in-blank': <PenLine className="h-4 w-4" />,
  'sentence-builder': <CheckCircle className="h-4 w-4" />,
  'grammar-multiple-choice': <BookOpen className="h-4 w-4" />,
  'grammar-fill-blank': <BookOpen className="h-4 w-4" />,
};

const typeLabels: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'fill-in-blank': 'Fill in the Blank',
  'sentence-builder': 'Sentence Builder',
  'grammar-multiple-choice': 'Grammar',
  'grammar-fill-blank': 'Grammar Fill',
};

export function ExamProgress({ current, total, score, questionType }: ExamProgressProps) {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            Question <span className="text-white font-bold">{current + 1}</span> of {total}
          </span>
          {questionType && (
            <span className={clsx(
              'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
              'bg-surface-700 text-slate-400 border border-surface-600',
            )}>
              {typeIcons[questionType]}
              {typeLabels[questionType]}
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-brand-400">{score} pts</span>
      </div>
      <ProgressBar value={percentage} variant="brand" size="sm" />
    </div>
  );
}
