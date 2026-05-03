import { useState, useMemo, useCallback } from 'react';
import type { Word, ExamAnswer, ExamResult, GrammarTopic, ExamQuestionWithGrammar } from '@/types';
import { generateExam, checkMultipleChoice, checkFillInBlank, checkSentenceBuilderAsync, checkGrammarMC, checkGrammarFill } from '@/utils/examGenerator';
import { POINTS_PER_QUESTION, PASSING_SCORE } from '@/utils/constants';
import { getTurkeyDateStr } from '@/utils/dateUtils';

export function useExam(dailyWords: Word[], allWords: Word[], dailyGrammar?: GrammarTopic | null) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<ExamAnswer | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const questions = useMemo(() => generateExam(dailyWords, allWords, dailyGrammar), [dailyWords, allWords, dailyGrammar]);

  const currentQuestion = questions[currentIndex] as ExamQuestionWithGrammar | undefined;
  const totalQuestions = questions.length;

  const submitAnswer = useCallback(
    async (userAnswer: string | number) => {
      if (!currentQuestion) return;

      let isCorrect = false;
      let feedback: string | null = null;

      if (currentQuestion.type === 'multiple-choice') {
        isCorrect = checkMultipleChoice(currentQuestion, userAnswer as number);
      } else if (currentQuestion.type === 'fill-in-blank') {
        isCorrect = checkFillInBlank(currentQuestion, userAnswer as string);
      } else if (currentQuestion.type === 'grammar-multiple-choice') {
        isCorrect = checkGrammarMC(currentQuestion, userAnswer as number);
      } else if (currentQuestion.type === 'grammar-fill-blank') {
        isCorrect = checkGrammarFill(currentQuestion, userAnswer as string);
      } else if (currentQuestion.type === 'sentence-builder') {
        setIsChecking(true);
        try {
          const result = await checkSentenceBuilderAsync(currentQuestion, userAnswer as string);
          isCorrect = result.isCorrect;
          feedback = result.feedback;
        } finally {
          setIsChecking(false);
        }
      }

      const answer: ExamAnswer = {
        questionId: currentQuestion.id,
        userAnswer,
        isCorrect,
        points: isCorrect ? POINTS_PER_QUESTION : 0,
      };

      setLastAnswer(answer);
      setAiFeedback(feedback);
      setAnswers((prev) => [...prev, answer]);
      setShowFeedback(true);
    },
    [currentQuestion],
  );

  const nextQuestion = useCallback(() => {
    setShowFeedback(false);
    setLastAnswer(null);
    setAiFeedback(null);
    if (currentIndex + 1 >= totalQuestions) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, totalQuestions]);

  const score = useMemo(() => answers.reduce((sum, a) => sum + a.points, 0), [answers]);

  const result: ExamResult | null = isFinished
    ? {
        date: getTurkeyDateStr(),
        score,
        totalPoints: totalQuestions * POINTS_PER_QUESTION,
        passed: score >= PASSING_SCORE,
        answers,
        wordIds: dailyWords.map((w) => w.id),
      }
    : null;

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setIsFinished(false);
    setShowFeedback(false);
    setLastAnswer(null);
    setIsChecking(false);
    setAiFeedback(null);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    score,
    isFinished,
    showFeedback,
    lastAnswer,
    result,
    isChecking,
    aiFeedback,
    submitAnswer,
    nextQuestion,
    reset,
  };
}
