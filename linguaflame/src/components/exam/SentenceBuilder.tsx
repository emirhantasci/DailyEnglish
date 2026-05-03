import { useState, useEffect } from 'react';
import type { SentenceBuilderQuestion } from '@/types';
import { clsx } from 'clsx';
import { Mic, MicOff, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface SentenceBuilderProps {
  question: SentenceBuilderQuestion;
  onSubmit: (answer: string) => void;
  showFeedback: boolean;
  isCorrect: boolean | null;
  isChecking?: boolean;
  aiFeedback?: string | null;
}

export function SentenceBuilder({ question, onSubmit, showFeedback, isCorrect, isChecking, aiFeedback }: SentenceBuilderProps) {
  const [input, setInput] = useState('');
  const { isListening, isSupported, transcript, startListening, stopListening } = useSpeechRecognition();

  // Auto-fill input with transcript as it arrives
  useEffect(() => {
    if (transcript && isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // When listening stops and we have a final transcript, set it
  useEffect(() => {
    if (!isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isChecking) onSubmit(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim() && !isChecking) handleSubmit();
  };

  return (
    <div className="animate-fade-in">
      <p className="text-xl text-slate-200 font-medium mb-2">{question.prompt}</p>
      <p className="text-sm text-slate-400 mb-6">
        Use the word <span className="text-brand-400 font-bold">&ldquo;{question.targetWord}&rdquo;</span> in a sentence.
      </p>

      {!showFeedback && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a sentence using the word..."
              rows={3}
              disabled={isChecking}
              className={clsx(
                'w-full px-5 py-4 pr-14 rounded-xl bg-surface-700 border-2 border-surface-600 text-white text-lg placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors resize-none',
                isChecking && 'opacity-60',
              )}
              autoFocus
            />
            {isSupported && !isChecking && (
              <button
                onClick={handleMicToggle}
                className={clsx(
                  'absolute right-3 top-3 p-2 rounded-lg transition-all',
                  isListening
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'bg-surface-600 text-slate-400 hover:text-white',
                )}
                title={isListening ? 'Stop recording' : 'Use microphone'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
          </div>

          {isListening && transcript && (
            <p className="text-sm text-brand-400 italic animate-pulse">Hearing: {transcript}</p>
          )}

          {isChecking ? (
            <div className="w-full py-3 rounded-xl bg-surface-700 text-slate-400 flex items-center justify-center gap-2 font-bold text-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking your sentence...
            </div>
          ) : (
            <button
              disabled={!input.trim()}
              onClick={handleSubmit}
              className={clsx(
                'w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
                input.trim()
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/25'
                  : 'bg-surface-700 text-slate-500 cursor-not-allowed',
              )}
            >
              <Send className="h-5 w-5" />
              Submit Sentence
            </button>
          )}
        </div>
      )}

      {showFeedback && (
        <div className="space-y-3 animate-slide-up">
          <div className={clsx(
            'p-4 rounded-xl border',
            isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
          )}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
              <span className={clsx('font-bold', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
                {isCorrect ? 'Good sentence!' : 'Needs improvement'}
              </span>
            </div>
            <p className="text-slate-300 italic">&ldquo;{input}&rdquo;</p>
            {aiFeedback && (
              <p className="text-sm text-slate-400 mt-2">{aiFeedback}</p>
            )}
          </div>
          {!aiFeedback && <p className="text-sm text-slate-400">{question.explanation}</p>}
        </div>
      )}
    </div>
  );
}
