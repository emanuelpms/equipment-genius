import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

export function SortableItem({ id, children, handleClassName }: { id: string; children: ReactNode; handleClassName?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : "auto", opacity: isDragging ? 0.7 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch">
      <button {...attributes} {...listeners} className={`shrink-0 grid place-items-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing px-1 ${handleClassName ?? ""}`}>
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}