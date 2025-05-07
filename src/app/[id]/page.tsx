"use client"
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/usercontext";
import { getData, addData } from "@/hooks/useDB";
import { Note, formatDate } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSync } from "@/hooks/useSync";
import { getLocalNotes, saveLocalNote, addPendingSyncNote, LocalNote } from "@/lib/localStorage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [note, setNote] = useState<LocalNote | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const { isOnline } = useSync();
    const router = useRouter();

    useEffect(() => {
        const fetchNote = async () => {
            if (!user) {
                // If not logged in, get from local storage
                const localNotes = getLocalNotes();
                const localNote = localNotes.find(n => n.id === id);
                if (localNote) {
                    setNote(localNote);
                    setTitle(localNote.title);
                    setDescription(localNote.description);
                }
                setLoading(false);
                return;
            }

            try {
                const result = await getData<Note>(`users/${user.uid}/notes/${id}`);
                if (result.success && result.data) {
                    setNote(result.data);
                    setTitle(result.data.title);
                    setDescription(result.data.description);
                } else {
                    // If not found in Firebase, try local storage
                    const localNotes = getLocalNotes();
                    const localNote = localNotes.find(n => n.id === id);
                    if (localNote) {
                        setNote(localNote);
                        setTitle(localNote.title);
                        setDescription(localNote.description);
                    } else {
                        toast.error("Note not found");
                    }
                }
            } catch (error) {
                console.error("Error fetching note:", error);
                // If fetch fails, try local storage
                const localNotes = getLocalNotes();
                const localNote = localNotes.find(n => n.id === id);
                if (localNote) {
                    setNote(localNote);
                    setTitle(localNote.title);
                    setDescription(localNote.description);
                } else {
                    toast.error("Failed to fetch note");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [user, id]);

    const handleUpdateNote = async () => {
        if (!note) return;

        const updatedNote: LocalNote = {
            ...note,
            title,
            description,
            updatedAt: new Date(),
        };

        if (!user) {
            // If not logged in, just update local storage
            saveLocalNote(updatedNote);
            setNote(updatedNote);
            setIsEditing(false);
            toast.success("Note updated in local storage");
            return;
        }

        if (isOnline) {
            // If online and logged in, update Firebase
            try {
                const result = await addData(`users/${user.uid}/notes/${note.id}`, updatedNote);
                if (result.success && result.data) {
                    setNote(result.data);
                    setIsEditing(false);
                    toast.success("Note updated successfully");
                } else {
                    toast.error("Failed to update note");
                }
            } catch (error) {
                console.error("Error updating note:", error);
                toast.error("An error occurred while updating the note");
            }
        } else {
            // If offline but logged in, update locally and mark for sync
            updatedNote.syncStatus = 'pending';
            saveLocalNote(updatedNote);
            addPendingSyncNote(updatedNote);
            setNote(updatedNote);
            setIsEditing(false);
            toast.info("Note will be synced when you're back online");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Note not found</h1>
                <Button onClick={() => router.push("/")}>Go back</Button>
            </div>
        );
    }

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
                        You&apos;re offline. Changes will be synced when you&apos;re back online.
                    </div>
                )}

                {isEditing ? (
                    <div className="space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                        />
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="min-h-[200px]"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleUpdateNote}>Save</Button>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold">{note.title}</h1>
                            <Button onClick={() => setIsEditing(true)}>Edit</Button>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{note.description}</p>
                        <p className="text-sm text-gray-500">
                            Last updated: {formatDate(note.updatedAt)}
                        </p>
                        {note.syncStatus === 'pending' && (
                            <p className="text-sm text-yellow-600">
                                This note has pending changes that will be synced when you&apos;re back online.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
