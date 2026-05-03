import { useState } from 'react';
import type { FillInBlankQuestion, GrammarFillQuestion } from '@/types';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface FillInBlankProps {
  question: FillInBlankQuestion | GrammarFillQuestion;
  onSubmit: (answer: string) => void;
  showFeedback: boolean;
  isCorrect: boolean | null;
}

export function FillInBlank({ question, onSubmit, showFeedback, isCorrect }: FillInBlankProps) {
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) onSubmit(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) handleSubmit();
  };

  // Split sentence at ___
  const parts = question.sentence.split('___');

  return (
    <div className="animate-fade-in">
      {/* Sentence with blank */}
      <div className="text-xl text-slate-200 leading-relaxed mb-6">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className={clsx(
                'inline-block mx-1 px-3 py-0.5 rounded-lg font-bold min-w-[100px] text-center border-b-2',
                !showFeedback && 'border-brand-500 text-brand-400',
                showFeedback && isCorrect && 'border-emerald-500 text-emerald-400',
                showFeedback && !isCorrect && 'border-red-500 text-red-400',
              )}>
                {showFeedback ? (isCorrect ? input : question.answer) : input || '____'}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Input */}
      {!showFeedback && (
        <div className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            className="w-full px-5 py-4 rounded-xl bg-surface-700 border-2 border-surface-600 text-white text-lg placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
            autoFocus
          />

          {question.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? question.hint : 'Show hint'}
            </button>
          )}

          <button
            disabled={!input.trim()}
            onClick={handleSubmit}
            className={clsx(
              'w-full py-3 rounded-xl font-bold text-lg transition-all',
              input.trim()
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/25'
                : 'bg-surface-700 text-slate-500 cursor-not-allowed',
            )}
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className={clsx(
          'flex items-start gap-3 p-4 rounded-xl animate-slide-up',
          isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20',
        )}>
          {isCorrect ? <CheckCircle className="h-6 w-6 text-emerald-400 mt-0.5" /> : <XCircle className="h-6 w-6 text-red-400 mt-0.5" />}
          <div>
            <p className={clsx('font-bold', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            {!isCorrect && (
              <p className="text-slate-400 mt-1">
                The answer is: <span className="text-white font-bold">{question.answer}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
