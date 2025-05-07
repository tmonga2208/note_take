import { Note } from "./notes";

const LOCAL_NOTES_KEY = "local_notes";
const PENDING_SYNC_KEY = "pending_sync_notes";

export interface LocalNote extends Note {
  id: string;
  isLocal?: boolean;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

export const getLocalNotes = (): LocalNote[] => {
  if (typeof window === 'undefined') return [];
  const notes = localStorage.getItem(LOCAL_NOTES_KEY);
  return notes ? JSON.parse(notes) : [];
};

export const saveLocalNote = (note: LocalNote): void => {
  const notes = getLocalNotes();
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
};

export const deleteLocalNote = (id: string): void => {
  const notes = getLocalNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(filteredNotes));
};

export const getPendingSyncNotes = (): LocalNote[] => {
  if (typeof window === 'undefined') return [];
  const notes = localStorage.getItem(PENDING_SYNC_KEY);
  return notes ? JSON.parse(notes) : [];
};

export const addPendingSyncNote = (note: LocalNote): void => {
  const pendingNotes = getPendingSyncNotes();
  const existingIndex = pendingNotes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    pendingNotes[existingIndex] = note;
  } else {
    pendingNotes.push(note);
  }
  
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingNotes));
};

export const removePendingSyncNote = (id: string): void => {
  const pendingNotes = getPendingSyncNotes();
  const filteredNotes = pendingNotes.filter(note => note.id !== id);
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filteredNotes));
};

export const clearPendingSyncNotes = (): void => {
  localStorage.removeItem(PENDING_SYNC_KEY);
}; 