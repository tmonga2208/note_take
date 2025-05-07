"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { Note, formatDate } from "@/lib/notes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NoteCardProps {
  note: Note & { id: string };
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/${note.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleClick = () => {
    router.push(`/${note.id}`);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isDragging ? "ring-2 ring-primary" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-2">
          <button
            className="p-1 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 line-clamp-1">{note.title}</h3>
            <p className="text-gray-600 line-clamp-3">{note.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 border-t">
        <span className="text-sm text-gray-500">
          {formatDate(note.createdAt)}
        </span>
        {isHovered && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
