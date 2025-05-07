"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/usercontext";
import { addData } from "@/hooks/useDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSync } from "@/hooks/useSync";
import { saveLocalNote, addPendingSyncNote, LocalNote } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

export default function NewNote() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { isOnline } = useSync();
  const router = useRouter();

  const handleCreateNote = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const noteId = uuidv4();
      const newNote: LocalNote = {
        id: noteId,
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date(),
      };

      if (!user) {
        // If not logged in, save to local storage
        saveLocalNote(newNote);
        toast.success("Note saved to local storage");
        router.push(`/${noteId}`);
        return;
      }

      if (isOnline) {
        // If online and logged in, save to Firebase
        const result = await addData(`users/${user.uid}/notes/${noteId}`, newNote);
        if (result.success && result.data) {
          toast.success("Note created successfully");
          router.push(`/${noteId}`);
        } else {
          toast.error("Failed to create note");
        }
      } else {
        // If offline but logged in, save locally and mark for sync
        newNote.syncStatus = 'pending';
        saveLocalNote(newNote);
        addPendingSyncNote(newNote);
        toast.info("Note will be synced when you're back online");
        router.push(`/${noteId}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("An error occurred while creating the note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {!isOnline && (
          <div className="mb-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
            You&apos;re offline. Note will be synced when you&apos;re back online.
          </div>
        )}

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-2xl font-bold"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[300px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateNote} disabled={loading || !title.trim()}>
              {loading ? "Creating..." : "Create Note"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 