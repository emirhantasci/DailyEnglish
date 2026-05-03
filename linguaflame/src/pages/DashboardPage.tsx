import { useNavigate } from 'react-router';
import {
  BookOpen,
  ClipboardCheck,
  Library,
  ArrowRight,
  CalendarCheck,
  Trophy,
  Target,
} from 'lucide-react';
import type { UserProgress } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StreakDisplay } from '@/components/streak/StreakDisplay';
import { DAILY_WORD_COUNT } from '@/utils/constants';

interface DashboardPageProps {
  progress: UserProgress;
  todayCompleted: boolean;
  todayLessonDone: boolean;
  todayExamDone: boolean;
}

export function DashboardPage({ progress, todayCompleted, todayLessonDone, todayExamDone }: DashboardPageProps) {
  const navigate = useNavigate();

  const avgScore =
    progress.totalExams > 0 && (progress.totalMaxScore ?? 0) > 0
      ? Math.round((progress.totalScore / (progress.totalMaxScore ?? 1)) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          {todayCompleted ? '🎉 Great job today!' : '🔥 Ready to learn?'}
        </h1>
        <p className="text-slate-400">
          {todayCompleted
            ? 'Come back tomorrow for new words'
            : `${DAILY_WORD_COUNT} new words are waiting for you`}
        </p>
      </div>

      {/* Streak Card */}
      <Card glow>
        <StreakDisplay streak={progress.streak} />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Lesson CTA */}
        <Card
          className={!todayLessonDone ? 'ring-2 ring-brand-500/30' : ''}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand-500/15">
              <BookOpen className="h-7 w-7 text-brand-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Daily Lesson</h3>
              <p className="text-sm text-slate-400 mt-1">
                {todayLessonDone
                  ? 'Lesson completed ✓'
                  : `Grammar + ${DAILY_WORD_COUNT} new words`}
              </p>
              <Button
                variant={todayLessonDone ? 'secondary' : 'primary'}
                size="sm"
                className="mt-3"
                iconRight={<ArrowRight className="h-4 w-4" />}
                onClick={() => navigate('/lesson')}
              >
                {todayLessonDone ? 'Review' : 'Start Lesson'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Exam CTA */}
        <Card
          className={todayLessonDone && !todayExamDone ? 'ring-2 ring-emerald-500/30' : ''}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/15">
              <ClipboardCheck className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Daily Exam</h3>
              <p className="text-sm text-slate-400 mt-1">
                {todayExamDone
                  ? 'Exam completed ✓'
                  : !todayLessonDone
                    ? 'Complete the lesson first'
                    : '20 questions to test knowledge'}
              </p>
              <Button
                variant={todayExamDone ? 'secondary' : todayLessonDone ? 'primary' : 'ghost'}
                size="sm"
                className="mt-3"
                iconRight={<ArrowRight className="h-4 w-4" />}
                disabled={!todayLessonDone}
                onClick={() => navigate('/exam')}
              >
                {todayExamDone ? 'Review' : 'Start Exam'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Libraries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Word Library */}
        <Card className="cursor-pointer hover:ring-1 hover:ring-brand-500/30 transition-all" onClick={() => navigate('/library')}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/15">
              <Library className="h-7 w-7 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Word Library</h3>
              <p className="text-sm text-slate-400 mt-1">
                Browse & search all {progress.learnedWordIds.length > 0 ? `${progress.learnedWordIds.length} learned` : ''} words
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-sm text-blue-400 font-medium">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Card>

        {/* Grammar Library */}
        <Card className="cursor-pointer hover:ring-1 hover:ring-violet-500/30 transition-all" onClick={() => navigate('/grammar-library')}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-500/15">
              <BookOpen className="h-7 w-7 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Grammar Library</h3>
              <p className="text-sm text-slate-400 mt-1">
                Study tenses, clauses & more
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-sm text-violet-400 font-medium">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <h3 className="font-bold text-white text-lg mb-4">📊 Your Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatItem icon={<CalendarCheck className="h-5 w-5 text-brand-400" />} label="Total Exams" value={progress.totalExams} />
          <StatItem icon={<Target className="h-5 w-5 text-emerald-400" />} label="Avg Score" value={`${avgScore}%`} />
          <StatItem icon={<Library className="h-5 w-5 text-blue-400" />} label="Words Learned" value={progress.learnedWordIds.length} />
          <StatItem icon={<Trophy className="h-5 w-5 text-amber-400" />} label="Best Streak" value={progress.streak.longestStreak} />
        </div>
      </Card>

    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
