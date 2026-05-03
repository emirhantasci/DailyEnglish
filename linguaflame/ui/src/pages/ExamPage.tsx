import { useNavigate } from 'react-router';
import type { Word, GrammarTopic } from '@/types';
import { useExam } from '@/hooks/useExam';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExamProgress } from '@/components/exam/ExamProgress';
import { MultipleChoice } from '@/components/exam/MultipleChoice';
import { FillInBlank } from '@/components/exam/FillInBlank';
import { SentenceBuilder } from '@/components/exam/SentenceBuilder';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ExamResult } from '@/types';

interface ExamPageProps {
  dailyWords: Word[];
  allWords: Word[];
  dailyGrammar?: GrammarTopic | null;
  onComplete: (result: ExamResult) => void;
}

export function ExamPage({ dailyWords, allWords, dailyGrammar, onComplete }: ExamPageProps) {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    isFinished,
    showFeedback,
    lastAnswer,
    result,
    isChecking,
    aiFeedback,
    submitAnswer,
    nextQuestion,
  } = useExam(dailyWords, allWords, dailyGrammar);

  // When exam finishes, notify parent and go to result
  useEffect(() => {
    if (isFinished && result && !hasNavigated.current) {
      hasNavigated.current = true;
      onComplete(result);
      // Small delay to ensure state is propagated before navigation
      setTimeout(() => {
        navigate('/result', { replace: true });
      }, 100);
    }
  }, [isFinished, result, onComplete, navigate]);

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <ExamProgress
        current={currentIndex}
        total={totalQuestions}
        score={score}
        questionType={currentQuestion.type}
      />

      <Card>
        {currentQuestion.type === 'multiple-choice' && (
          <MultipleChoice
            key={currentQuestion.id}
            question={currentQuestion}
            onSubmit={submitAnswer}
            showFeedback={showFeedback}
            isCorrect={lastAnswer?.isCorrect ?? null}
          />
        )}

        {currentQuestion.type === 'grammar-multiple-choice' && (
          <MultipleChoice
            key={currentQuestion.id}
            question={currentQuestion}
            onSubmit={submitAnswer}
            showFeedback={showFeedback}
            isCorrect={lastAnswer?.isCorrect ?? null}
          />
        )}

        {currentQuestion.type === 'fill-in-blank' && (
          <FillInBlank
            key={currentQuestion.id}
            question={currentQuestion}
            onSubmit={submitAnswer}
            showFeedback={showFeedback}
            isCorrect={lastAnswer?.isCorrect ?? null}
          />
        )}

        {currentQuestion.type === 'grammar-fill-blank' && (
          <FillInBlank
            key={currentQuestion.id}
            question={currentQuestion}
            onSubmit={submitAnswer}
            showFeedback={showFeedback}
            isCorrect={lastAnswer?.isCorrect ?? null}
          />
        )}

        {currentQuestion.type === 'sentence-builder' && (
          <SentenceBuilder
            key={currentQuestion.id}
            question={currentQuestion}
            onSubmit={submitAnswer}
            showFeedback={showFeedback}
            isCorrect={lastAnswer?.isCorrect ?? null}
            isChecking={isChecking}
            aiFeedback={aiFeedback}
          />
        )}

        {/* Feedback bar → next button */}
        {showFeedback && (
          <div className="mt-4 pt-4 border-t border-surface-600/30">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{currentQuestion.explanation}</p>
              <Button
                variant="primary"
                size="sm"
                onClick={nextQuestion}
                iconRight={<ArrowRight className="h-4 w-4" />}
              >
                {currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
