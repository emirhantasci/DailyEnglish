import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ArrowLeft, CheckCircle, Flame, BookOpen } from 'lucide-react';
import type { Word, LessonStep, GrammarTopic } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { WordCard } from '@/components/word/WordCard';
import { WordExamples } from '@/components/word/WordExamples';
import { GrammarIntro } from '@/components/grammar/GrammarIntro';
import { GrammarStructureView } from '@/components/grammar/GrammarStructureView';
import { GrammarTimeline } from '@/components/grammar/GrammarTimeline';
import { GrammarNotesView } from '@/components/grammar/GrammarNotesView';
import { GrammarExamplesView } from '@/components/grammar/GrammarExamplesView';

interface LessonPageProps {
  dailyWords: Word[];
  dailyGrammar: GrammarTopic | null;
  onComplete: () => void;
}

export function LessonPage({ dailyWords, dailyGrammar, onComplete }: LessonPageProps) {
  const navigate = useNavigate();

  const hasTimeline = !!(dailyGrammar?.timeline && dailyGrammar.timeline.length > 0);
  const grammarStepCount = dailyGrammar ? (hasTimeline ? 5 : 4) : 0;

  const steps = useMemo<LessonStep[]>(() => {
    const s: LessonStep[] = [];

    // Grammar steps (wordIndex = -1)
    if (dailyGrammar) {
      s.push({ type: 'grammar-intro', wordIndex: -1 });
      s.push({ type: 'grammar-structure', wordIndex: -1 });
      if (hasTimeline) {
        s.push({ type: 'grammar-timeline', wordIndex: -1 });
      }
      s.push({ type: 'grammar-notes', wordIndex: -1 });
      s.push({ type: 'grammar-examples', wordIndex: -1 });
    }

    // Word steps
    for (let i = 0; i < dailyWords.length; i++) {
      s.push({ type: 'word-card', wordIndex: i });
      s.push({ type: 'meaning', wordIndex: i });
      s.push({ type: 'examples', wordIndex: i });
      s.push({ type: 'pronunciation', wordIndex: i });
    }
    return s;
  }, [dailyWords, dailyGrammar]);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = steps[currentStepIdx];
  const isGrammarStep = currentStep.wordIndex === -1;
  const currentWord = isGrammarStep ? null : dailyWords[currentStep.wordIndex];
  const totalSteps = steps.length;
  const progress = Math.round(((currentStepIdx + 1) / totalSteps) * 100);
  const isLast = currentStepIdx === totalSteps - 1;

  const next = () => {
    if (isLast) {
      onComplete();
      navigate('/exam');
    } else {
      setCurrentStepIdx((i) => i + 1);
    }
  };

  const prev = () => {
    if (currentStepIdx > 0) setCurrentStepIdx((i) => i - 1);
  };

  const stepLabel = () => {
    switch (currentStep.type) {
      case 'grammar-intro':
        return 'Grammar — Introduction';
      case 'grammar-structure':
        return 'Grammar — Structure';
      case 'grammar-timeline':
        return 'Grammar — Timeline';
      case 'grammar-notes':
        return 'Grammar — Common Mistakes';
      case 'grammar-examples':
        return 'Grammar — Examples';
      case 'word-card':
        return 'New Word';
      case 'meaning':
        return 'Meaning & Translation';
      case 'examples':
        return 'Real-world Examples';
      case 'pronunciation':
        return 'Practice & Review';
    }
  };

  const phaseLabel = isGrammarStep
    ? `📐 Grammar: ${dailyGrammar?.title ?? ''}`
    : `Word ${currentStep.wordIndex + 1} of ${dailyWords.length}`;

  const grammarDone = currentStepIdx >= grammarStepCount;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">
            {phaseLabel} &middot; {stepLabel()}
          </span>
          <span className="text-sm text-brand-400 font-bold">{progress}%</span>
        </div>
        <ProgressBar value={progress} variant="brand" size="sm" />
      </div>

      {/* Section indicator pills */}
      <div className="flex justify-center gap-2 flex-wrap">
        {dailyGrammar && (
          <button
            onClick={() => setCurrentStepIdx(0)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              isGrammarStep
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                : grammarDone
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-surface-700 text-slate-500'
            }`}
          >
            {grammarDone && !isGrammarStep ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <BookOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Grammar</span>
          </button>
        )}

        {dailyGrammar && (
          <span className="text-slate-600 self-center">|</span>
        )}

        {dailyWords.map((w, i) => {
          const wordStepsStart = grammarStepCount + i * 4;
          const wordStepsEnd = wordStepsStart + 3;
          const isActive = !isGrammarStep && currentStep.wordIndex === i;
          const isDone = currentStepIdx > wordStepsEnd;
          return (
            <button
              key={w.id}
              onClick={() => setCurrentStepIdx(wordStepsStart)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-surface-700 text-slate-500'
              }`}
            >
              {isDone ? <CheckCircle className="h-3.5 w-3.5 inline" /> : i + 1}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card glow={currentStep.type === 'word-card' || currentStep.type === 'grammar-intro'}>
        {currentStep.type === 'grammar-intro' && dailyGrammar && (
          <GrammarIntro topic={dailyGrammar} />
        )}

        {currentStep.type === 'grammar-structure' && dailyGrammar && (
          <GrammarStructureView topic={dailyGrammar} />
        )}

        {currentStep.type === 'grammar-timeline' && dailyGrammar && (
          <GrammarTimeline topic={dailyGrammar} />
        )}

        {currentStep.type === 'grammar-notes' && dailyGrammar && (
          <GrammarNotesView topic={dailyGrammar} />
        )}

        {currentStep.type === 'grammar-examples' && dailyGrammar && (
          <GrammarExamplesView topic={dailyGrammar} />
        )}

        {currentStep.type === 'word-card' && currentWord && (
          <WordCard word={currentWord} showMeaning={false} />
        )}

        {currentStep.type === 'meaning' && currentWord && (
          <WordCard word={currentWord} showMeaning={true} />
        )}

        {currentStep.type === 'examples' && currentWord && (
          <WordExamples word={currentWord} />
        )}

        {currentStep.type === 'pronunciation' && currentWord && (
          <div className="text-center space-y-4">
            <Flame className="h-12 w-12 text-brand-500 mx-auto animate-flame" />
            <h3 className="text-2xl font-bold text-white">{currentWord.word}</h3>
            <p className="text-slate-400">{currentWord.phonetic}</p>
            <p className="text-slate-300">{currentWord.definition}</p>
            <p className="text-blue-300 font-medium">{currentWord.turkishMeaning}</p>
            <p className="text-sm text-slate-500">
              {currentStep.wordIndex < dailyWords.length - 1
                ? `Next word: ${dailyWords[currentStep.wordIndex + 1].word}`
                : 'Last word — ready for the exam!'}
            </p>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={currentStepIdx === 0} iconLeft={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button variant="primary" onClick={next} iconRight={isLast ? <CheckCircle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}>
          {isLast ? 'Start Exam' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
