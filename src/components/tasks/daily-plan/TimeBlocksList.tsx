import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTimeBlock } from './SortableTimeBlock';

interface TimeBlocksListProps {
  plan: any;
  isEditing: boolean;
  editedTimeBlocks: any[];
  getPriorityColor: (priority: string) => string;
  onStartEditing: () => void;
  onSaveChanges: () => void;
  onCancelEdit: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function TimeBlocksList({
  plan,
  isEditing,
  editedTimeBlocks,
  getPriorityColor,
  onStartEditing,
  onSaveChanges,
  onCancelEdit,
  onDragEnd
}: TimeBlocksListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!plan.timeBlocks || plan.timeBlocks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Optimized Schedule</CardTitle>
          {!isEditing ? (
            <Button onClick={onStartEditing} size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Plan
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={onSaveChanges} size="sm" variant="default">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={onCancelEdit} size="sm" variant="ghost">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
        {isEditing && (
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks to reorder your schedule
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={editedTimeBlocks.map((block, index) => block.id || `block-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {editedTimeBlocks.map((block: any, index: number) => (
                  <SortableTimeBlock
                    key={block.id || `block-${index}`}
                    block={block}
                    index={index}
                    isEditing={isEditing}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3">
            {plan.timeBlocks.map((block: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
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
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}