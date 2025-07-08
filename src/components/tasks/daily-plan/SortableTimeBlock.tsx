import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';

interface SortableTimeBlockProps {
  block: any;
  index: number;
  isEditing: boolean;
  getPriorityColor: (priority: string) => string;
}

export function SortableTimeBlock({ block, index, isEditing, getPriorityColor }: SortableTimeBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id || `block-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 bg-muted/50 rounded-lg ${
        isEditing ? 'border-2 border-dashed border-primary/30' : ''
      }`}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className="text-sm font-mono text-muted-foreground min-w-[120px]">
        {block.startTime} - {block.endTime}
      </div>
      <div className="flex-1">
        <div className="font-medium">{block.task}</div>
        <div className="flex items-center gap-2 mt-1">
          {block.priority && (
            <Badge className={getPriorityColor(block.priority)}>
              {block.priority}
            </Badge>
          )}
          <Badge variant="outline">
            {block.energy} energy
          </Badge>
          <Badge variant="outline">
            {block.type?.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </div>
  );
}