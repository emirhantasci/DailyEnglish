import { useNavigate } from 'react-router';
import { Trophy, Flame, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import type { ExamResult } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PASSING_SCORE } from '@/utils/constants';

interface ResultPageProps {
  result: ExamResult | null;
}

export function ResultPage({ result }: ResultPageProps) {
  const navigate = useNavigate();

  if (!result) {
    navigate('/', { replace: true });
    return null;
  }

  const percentage = Math.round((result.score / result.totalPoints) * 100);
  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const totalCount = result.answers.length;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-6">
        {result.passed ? (
          <>
            <Trophy className="h-20 w-20 text-amber-400 mx-auto mb-3 animate-count-up" />
            <h1 className="text-4xl font-black text-white mb-2">Excellent! 🎉</h1>
            <p className="text-slate-400">You passed today&apos;s exam</p>
          </>
        ) : (
          <>
            <Flame className="h-20 w-20 text-brand-500 mx-auto mb-3 animate-flame" />
            <h1 className="text-4xl font-black text-white mb-2">Keep Going! 💪</h1>
            <p className="text-slate-400">
              You need {PASSING_SCORE}% to pass. Review and try again!
            </p>
          </>
        )}
      </div>

      {/* Score card */}
      <Card glow={result.passed}>
        <div className="text-center space-y-4">
          <div className="text-6xl font-black animate-count-up" style={{
            color: result.passed ? '#10b981' : '#ef4444',
          }}>
            {percentage}%
          </div>
          <ProgressBar
            value={percentage}
            variant={result.passed ? 'success' : 'danger'}
            size="lg"
            showPercentage={false}
          />
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{result.score}</p>
              <p className="text-slate-500">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{correctCount}</p>
              <p className="text-slate-500">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{totalCount - correctCount}</p>
              <p className="text-slate-500">Wrong</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Answer breakdown */}
      <Card>
        <h3 className="font-bold text-white mb-3">Answer Breakdown</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {result.answers.map((a, i) => (
            <div
              key={a.questionId}
              title={`Q${i + 1}: ${a.isCorrect ? 'Correct' : 'Wrong'}`}
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold ${
                a.isCorrect
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {a.isCorrect ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" iconLeft={<RotateCcw className="h-4 w-4" />} onClick={() => navigate('/exam')}>
          Retry
        </Button>
        <Button variant="primary" className="flex-1" iconLeft={<Home className="h-4 w-4" />} onClick={() => navigate('/')}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
