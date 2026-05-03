import { useState } from 'react';
import type { MultipleChoiceQuestion, GrammarMCQuestion } from '@/types';
import { clsx } from 'clsx';
import { CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion | GrammarMCQuestion;
  onSubmit: (answer: number) => void;
  showFeedback: boolean;
  isCorrect: boolean | null;
}

export function MultipleChoice({ question, onSubmit, showFeedback, isCorrect: _isCorrect }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selected !== null) onSubmit(selected);
  };

  return (
    <div className="animate-fade-in">
      <p className="text-xl text-slate-200 font-medium mb-6">{question.question}</p>

      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => {
          const isThisCorrect = i === question.correctIndex;
          const isSelected = selected === i;

          return (
            <button
              key={i}
              disabled={showFeedback}
              onClick={() => setSelected(i)}
              className={clsx(
                'w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium',
                !showFeedback && !isSelected && 'border-surface-600 bg-surface-700/50 hover:border-brand-500/50 hover:bg-surface-700 text-slate-200',
                !showFeedback && isSelected && 'border-brand-500 bg-brand-500/15 text-white',
                showFeedback && isThisCorrect && 'border-emerald-500 bg-emerald-500/15 text-emerald-300',
                showFeedback && isSelected && !isThisCorrect && 'border-red-500 bg-red-500/15 text-red-300',
                showFeedback && !isThisCorrect && !isSelected && 'border-surface-700 bg-surface-800/50 text-slate-500',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    'flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold',
                    !showFeedback && isSelected ? 'bg-brand-500 text-white' : 'bg-surface-600 text-slate-400',
                    showFeedback && isThisCorrect && 'bg-emerald-500 text-white',
                    showFeedback && isSelected && !isThisCorrect && 'bg-red-500 text-white',
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </div>
                {showFeedback && isThisCorrect && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                {showFeedback && isSelected && !isThisCorrect && <XCircle className="h-5 w-5 text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {!showFeedback && (
        <button
          disabled={selected === null}
          onClick={handleSubmit}
          className={clsx(
            'w-full py-3 rounded-xl font-bold text-lg transition-all',
            selected !== null
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/25'
              : 'bg-surface-700 text-slate-500 cursor-not-allowed',
          )}
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}
