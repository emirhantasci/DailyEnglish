import type { ReactNode } from 'react';
import { Header } from './Header';
import type { StreakData } from '@/types';
import type { SyncStatus } from '@/hooks/useSync';

interface LayoutProps {
  children: ReactNode;
  streak: StreakData;
  displayName: string;
  onLogout: () => void;
  syncStatus?: SyncStatus;
}

export function Layout({ children, streak, displayName, onLogout, syncStatus }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface-900">
      <Header streak={streak} displayName={displayName} onLogout={onLogout} syncStatus={syncStatus} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
