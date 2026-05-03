import { useEffect, useRef, useCallback, useState } from 'react';
import type { UserProgress } from '@/types';
import { fetchProgress, saveProgress } from '@/services/syncApi';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export function useSync(
  localProgress: UserProgress,
  setProgress: (updater: (prev: UserProgress) => UserProgress) => void,
  enabled = true,
) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const hasSyncedOnMount = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: fetch remote, compare lastModified, take newer
  useEffect(() => {
    if (!enabled) return;
    if (hasSyncedOnMount.current) return;
    hasSyncedOnMount.current = true;

    (async () => {
      setSyncStatus('syncing');
      const remote = await fetchProgress();

      if (!remote) {
        // No remote data or offline — push local to remote
        if (localProgress.learnedWordIds.length > 0 || Object.keys(localProgress.sessions).length > 0) {
          const success = await saveProgress({ ...localProgress, lastModified: new Date().toISOString() });
          setSyncStatus(success ? 'synced' : 'offline');
        } else {
          setSyncStatus('offline');
        }
        return;
      }

      const localTime = localProgress.lastModified ? new Date(localProgress.lastModified).getTime() : 0;
      const remoteTime = remote.lastModified ? new Date(remote.lastModified).getTime() : 0;

      if (remoteTime > localTime) {
        // Remote is newer — adopt it
        setProgress(() => remote);
        setSyncStatus('synced');
      } else if (localTime > remoteTime) {
        // Local is newer — push to remote
        const success = await saveProgress(localProgress);
        setSyncStatus(success ? 'synced' : 'error');
      } else {
        setSyncStatus('synced');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save to remote on progress changes
  const syncToRemote = useCallback(
    (progress: UserProgress) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);

      saveTimer.current = setTimeout(async () => {
        setSyncStatus('syncing');
        const stamped = { ...progress, lastModified: new Date().toISOString() };
        const success = await saveProgress(stamped);
        setSyncStatus(success ? 'synced' : 'error');
      }, 1000);
    },
    [],
  );

  return { syncStatus, syncToRemote };
}
