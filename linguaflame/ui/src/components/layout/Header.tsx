import { Flame, Snowflake, LogOut, BookOpen, Cloud, CloudOff, Loader2, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import type { StreakData } from '@/types';
import type { SyncStatus } from '@/hooks/useSync';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getStoredAuth } from '@/services/authApi';

const syncConfig: Record<SyncStatus, { icon: typeof Cloud; color: string; label: string }> = {
  idle: { icon: Cloud, color: 'text-slate-500', label: 'Not synced' },
  syncing: { icon: Loader2, color: 'text-brand-400 animate-spin', label: 'Syncing...' },
  synced: { icon: Cloud, color: 'text-emerald-400', label: 'Synced' },
  offline: { icon: CloudOff, color: 'text-slate-500', label: 'Offline' },
  error: { icon: CloudOff, color: 'text-red-400', label: 'Sync failed' },
};

interface HeaderProps {
  streak: StreakData;
  displayName: string;
  onLogout: () => void;
  syncStatus?: SyncStatus;
}

export function Header({ streak, displayName, onLogout, syncStatus }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isInSession = location.pathname === '/lesson' || location.pathname === '/exam';

  useEffect(() => {
    const checkAdmin = async () => {
      const auth = getStoredAuth();
      if (!auth) return;
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${API_BASE}/admin/check`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        }
      } catch { /* ignore */ }
    };
    checkAdmin();
  }, []);

  const handleLogoClick = () => {
    if (isInSession) {
      setShowLeaveModal(true);
    } else {
      navigate('/');
    }
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-surface-600/50 bg-surface-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Logo — clickable to home */}
          <button onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Flame className="h-7 w-7 text-brand-500 animate-flame" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              LinguaFlame
            </span>
          </button>

        {/* Streak & Freeze */}
        <div className="flex items-center gap-3">
          <Badge variant="brand" size="md" icon={<Flame className="h-4 w-4" />}>
            <span className="font-bold text-base">{streak.currentStreak}</span>
            <span className="hidden sm:inline ml-1">day streak</span>
          </Badge>

          {streak.freezesAvailable > 0 && (
            <Badge variant="info" size="md" icon={<Snowflake className="h-4 w-4" />}>
              {streak.freezesAvailable}
            </Badge>
          )}

          {syncStatus && (() => {
            const cfg = syncConfig[syncStatus];
            const Icon = cfg.icon;
            return (
              <div className="flex items-center" title={cfg.label}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
            );
          })()}

          <div className="hidden sm:flex items-center gap-2 ml-2 text-slate-400">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">{displayName}</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-surface-700"
              title="Admin Panel"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-surface-700"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>

    {/* Leave session confirmation modal */}
    <Modal open={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Leave Session?">
      <p className="text-slate-300 mb-6">
        You're in the middle of a session. Your progress will be lost if you leave now. Are you sure?
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>Stay</Button>
        <Button variant="danger" onClick={confirmLeave}>Leave</Button>
      </div>
    </Modal>
    </>
  );
}
