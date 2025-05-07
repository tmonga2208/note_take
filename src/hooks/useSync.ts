import { useEffect, useState } from 'react';
import { useUser } from '@/context/usercontext';
import { addData } from './useDB';
import { getPendingSyncNotes, removePendingSyncNote } from '@/lib/localStorage';
import { toast } from 'sonner';

export const useSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingNotes();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingNotes = async () => {
    if (!user || !isOnline) return;

    const pendingNotes = getPendingSyncNotes();
    if (pendingNotes.length === 0) return;

    toast.info(`Syncing ${pendingNotes.length} notes...`);

    for (const note of pendingNotes) {
      try {
        const result = await addData(`users/${user.uid}/notes/${note.id}`, note);
        if (result.success) {
          removePendingSyncNote(note.id);
          toast.success(`Note "${note.title}" synced successfully`);
        } else {
          toast.error(`Failed to sync note "${note.title}"`);
        }
      } catch (error) {
        console.error('Error syncing note:', error);
        toast.error(`Error syncing note "${note.title}"`);
      }
    }
  };

  return {
    isOnline,
    syncPendingNotes,
  };
}; 