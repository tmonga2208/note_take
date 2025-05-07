"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/usercontext";
import { getCollection, deleteData, addData } from "@/hooks/useDB";
import { Note, convertTimestampToDate } from "@/lib/notes";
import { Timestamp } from "firebase/firestore";
import NoteCard from "@/components/note_card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useSync } from "@/hooks/useSync";
import { getLocalNotes, saveLocalNote, deleteLocalNote, addPendingSyncNote, LocalNote } from "@/lib/localStorage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function Home() {
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { isOnline } = useSync();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        // If not logged in, use local storage
        const localNotes = getLocalNotes();
        setNotes(localNotes);
        setLoading(false);
        return;
      }

      try {
        const result = await getCollection<Note>(`users/${user.uid}/notes`);
        if (result.success && result.data) {
          setNotes(result.data);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        // If fetch fails, fall back to local storage
        const localNotes = getLocalNotes();
        setNotes(localNotes);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const handleDeleteNote = async (id: string) => {
    if (!user) {
      // If not logged in, just delete from local storage
      deleteLocalNote(id);
      setNotes(notes.filter(note => note.id !== id));
      toast.success("Note deleted from local storage");
      return;
    }

    try {
      if (isOnline) {
        const result = await deleteData(`users/${user.uid}/notes/${id}`);
        if (result.success) {
          setNotes(notes.filter(note => note.id !== id));
          toast.success("Note deleted successfully");
        } else {
          toast.error("Failed to delete note");
        }
      } else {
        // If offline, mark for deletion and remove from local storage
        const note = notes.find(n => n.id === id);
        if (note) {
          note.syncStatus = 'pending';
          addPendingSyncNote(note);
        }
        deleteLocalNote(id);
        setNotes(notes.filter(note => note.id !== id));
        toast.info("Note will be deleted when you're back online");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("An error occurred while deleting the note");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const reorderedNotes = arrayMove(
        notes,
        notes.findIndex((note) => note.id === active.id),
        notes.findIndex((note) => note.id === over.id)
      );

      setNotes(reorderedNotes);

      if (!user) {
        // If not logged in, just update local storage
        reorderedNotes.forEach(note => saveLocalNote(note));
        return;
      }

      // Update the order in Firebase if online
      if (isOnline) {
        try {
          for (const note of reorderedNotes) {
            await addData(`users/${user.uid}/notes/${note.id}`, {
              ...note,
              order: reorderedNotes.indexOf(note),
              createdAt: Timestamp.fromDate(convertTimestampToDate(note.createdAt)),
              updatedAt: note.updatedAt ? Timestamp.fromDate(convertTimestampToDate(note.updatedAt)) : undefined
            });
          }
          toast.success("Note order updated");
        } catch (error) {
          console.error("Error updating note order:", error);
          toast.error("Failed to update note order");
        }
      } else {
        // If offline, save to local storage and mark for sync
        reorderedNotes.forEach(note => {
          note.syncStatus = 'pending';
          saveLocalNote(note);
          addPendingSyncNote(note);
        });
        toast.info("Order will be updated when you're back online");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="absolute bottom-0 right-0 m-4">
        <Button
          onClick={() => router.push("/new")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {!isOnline && (
        <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow-md">
          You are offline. Changes will be synced when you are back online.
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={notes.map(note => note.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </main>
  );
}
