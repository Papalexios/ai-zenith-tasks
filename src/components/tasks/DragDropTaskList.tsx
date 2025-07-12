import { useState } from 'react';
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
// Note: Modifiers would require additional package
import { SortableTaskItem } from './SortableTaskItem';
import { CompactTaskItem } from './CompactView';
import { useTaskStore, Task } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutList, 
  Grid3X3, 
  CheckSquare, 
  Trash2, 
  Eye,
  EyeOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropTaskListProps {
  tasks: Task[];
}

export function DragDropTaskList({ tasks: initialTasks }: DragDropTaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isCompactView, setIsCompactView] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(true);
  
  const { toggleTask, deleteTask, updateTask } = useTaskStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = showCompleted ? tasks : tasks.filter(t => !t.completed);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleTaskSelect = (taskId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (isSelected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkAction = async (action: 'complete' | 'delete') => {
    for (const taskId of selectedTasks) {
      if (action === 'complete') {
        await toggleTask(taskId);
      } else if (action === 'delete') {
        await deleteTask(taskId);
      }
    }
    setSelectedTasks(new Set());
  };

  const handleTaskEdit = (task: Task) => {
    // Implement task editing modal
    console.log('Edit task:', task);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isCompactView ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsCompactView(!isCompactView)}
            className="gap-2"
          >
            {isCompactView ? <LayoutList className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            {isCompactView ? 'Compact' : 'Detailed'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="gap-2"
          >
            {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCompleted ? 'Hide' : 'Show'} Done
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <Badge variant="secondary" className="px-3">
              {selectedTasks.size} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('complete')}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Complete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </motion.div>
        )}
      </div>

      {/* Task List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        // modifiers would go here if package is installed
      >
        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                isCompactView ? (
                  <SortableTaskItem key={task.id} id={task.id}>
                    <CompactTaskItem
                      task={task}
                      onToggle={toggleTask}
                      onEdit={handleTaskEdit}
                      onDelete={deleteTask}
                    />
                  </SortableTaskItem>
                ) : (
                  <SortableTaskItem key={task.id} id={task.id}>
                    <div className="task-item-detailed">
                      {/* Use existing detailed task item component */}
                      <CompactTaskItem
                        task={task}
                        onToggle={toggleTask}
                        onEdit={handleTaskEdit}
                        onDelete={deleteTask}
                      />
                    </div>
                  </SortableTaskItem>
                )
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <LayoutList className="h-12 w-12 mx-auto opacity-30" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">
              {!showCompleted ? 'All tasks are completed!' : 'Add some tasks to get started'}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}