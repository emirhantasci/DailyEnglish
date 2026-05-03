import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useStreak } from '@/hooks/useStreak';
import { useDailyWords } from '@/hooks/useDailyWords';
import { useDailyGrammar } from '@/hooks/useDailyGrammar';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LessonPage } from '@/pages/LessonPage';
import { ExamPage } from '@/pages/ExamPage';
import { ResultPage } from '@/pages/ResultPage';
import { WordLibraryPage } from '@/pages/WordLibraryPage';
import { GrammarLibraryPage } from '@/pages/GrammarLibraryPage';
import { AdminPage } from '@/pages/AdminPage';
import type { ExamResult, DailySession } from '@/types';
import { getStoredAuth, clearAuth, type AuthUser } from '@/services/authApi';

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredAuth());
  const isLoggedIn = authUser !== null;

  const { progress, streak, todayCompleted, refreshStreak, completeTodayStreak, updateProgress, syncStatus } = useStreak(isLoggedIn);
  const { dailyWords, allWords, today } = useDailyWords(progress.learnedWordIds, progress.sessions);
  const { dailyGrammar } = useDailyGrammar(progress.completedGrammarIds ?? []);

  // Latest exam result for the result page
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);

  // On mount / login, refresh streak calculations
  useEffect(() => {
    if (isLoggedIn) refreshStreak();
  }, [isLoggedIn, refreshStreak]);

  // Today's session helpers
  const todaySession = progress.sessions[today];
  const todayLessonDone = todaySession?.lessonCompleted ?? false;
  const todayExamDone = !!todaySession?.examResult;

  const handleLogin = useCallback((user: AuthUser) => {
    setAuthUser(user);
    refreshStreak();
  }, [refreshStreak]);

  const handleLogout = useCallback(() => {
    clearAuth();
    setAuthUser(null);
  }, []);

  const handleLessonComplete = useCallback(() => {
    updateProgress((prev) => {
      const session: DailySession = prev.sessions[today] ?? {
        date: today,
        wordIds: dailyWords.map((w) => w.id),
        lessonCompleted: false,
      };
      return {
        ...prev,
        sessions: {
          ...prev.sessions,
          [today]: { ...session, lessonCompleted: true },
        },
      };
    });
  }, [updateProgress, today, dailyWords]);

  const handleExamComplete = useCallback(
    (result: ExamResult) => {
      setLatestResult(result);
      updateProgress((prev) => {
        const session: DailySession = prev.sessions[today] ?? {
          date: today,
          wordIds: dailyWords.map((w) => w.id),
          lessonCompleted: true,
        };
        const newLearnedIds = result.passed
          ? [...new Set([...prev.learnedWordIds, ...result.wordIds])]
          : prev.learnedWordIds;

        return {
          ...prev,
          sessions: {
            ...prev.sessions,
            [today]: { ...session, examResult: result },
          },
          learnedWordIds: newLearnedIds,
          totalExams: prev.totalExams + 1,
          totalScore: prev.totalScore + result.score,
          totalMaxScore: (prev.totalMaxScore ?? 0) + result.totalPoints,
        };
      });

      // Complete the streak day
      completeTodayStreak();
    },
    [updateProgress, completeTodayStreak, today, dailyWords],
  );

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout streak={streak} displayName={progress.displayName} onLogout={handleLogout} syncStatus={syncStatus}>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                progress={progress}
                todayCompleted={todayCompleted}
                todayLessonDone={todayLessonDone}
                todayExamDone={todayExamDone}
              />
            }
          />
          <Route
            path="/lesson"
            element={<LessonPage dailyWords={dailyWords} dailyGrammar={dailyGrammar} onComplete={handleLessonComplete} />}
          />
          <Route
            path="/exam"
            element={
              <ExamPage dailyWords={dailyWords} allWords={allWords} dailyGrammar={dailyGrammar} onComplete={handleExamComplete} />
            }
          />
          <Route path="/result" element={<ResultPage result={latestResult} />} />
          <Route
            path="/library"
            element={<WordLibraryPage />}
          />
          <Route
            path="/grammar-library"
            element={<GrammarLibraryPage />}
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
