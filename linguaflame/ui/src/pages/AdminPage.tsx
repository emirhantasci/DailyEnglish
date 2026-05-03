import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { getStoredAuth } from '@/services/authApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string | null;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lastModified: string | null;
  totalExams: number;
  totalScore: number;
  totalMaxScore: number;
  joinedDate: string | null;
}

export function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const auth = getStoredAuth();
      if (!auth) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        if (res.status === 403) {
          setError('Access denied — admin only');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(`Error: ${res.status}`);
          setLoading(false);
          return;
        }

        const data = (await res.json()) as AdminUser[];
        setUsers(data);
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastActive = (user: AdminUser) => {
    if (user.lastActiveDate) return formatDate(user.lastActiveDate);
    return formatDateTime(user.lastModified ?? user.lastLoginAt);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 text-lg font-semibold">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">{users.length} users</span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-600/50 text-left">
                <th className="pb-3 pr-4 text-slate-400 font-medium">#</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Display Name</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Email</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium text-center">🔥 Streak</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium text-center">🏆 Best</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium text-center">📝 Exams</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium text-center">📊 Score</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Last Active</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Last Login</th>
                <th className="pb-3 text-slate-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const avgScore =
                  u.totalExams > 0 && u.totalMaxScore > 0
                    ? Math.round((u.totalScore / u.totalMaxScore) * 100)
                    : 0;

                return (
                  <tr
                    key={u.id}
                    className="border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors"
                  >
                    <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                    <td className="py-3 pr-4 text-white font-medium">{u.displayName}</td>
                    <td className="py-3 pr-4 text-slate-300">{u.email}</td>
                    <td className="py-3 pr-4 text-center">
                      <span className={u.currentStreak > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {u.currentStreak}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center text-slate-300">{u.longestStreak}</td>
                    <td className="py-3 pr-4 text-center text-slate-300">{u.totalExams}</td>
                    <td className="py-3 pr-4 text-center">
                      {(() => {
                        let scoreClass = 'text-slate-500';
                        if (avgScore >= 70) scoreClass = 'text-emerald-400';
                        else if (avgScore > 0) scoreClass = 'text-amber-400';
                        return <span className={scoreClass}>{avgScore > 0 ? `${avgScore}%` : '—'}</span>;
                      })()}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{formatLastActive(u)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{formatDateTime(u.lastLoginAt)}</td>
                    <td className="py-3 text-slate-400 text-xs">{formatDate(u.joinedDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-8 text-slate-500">No users found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
