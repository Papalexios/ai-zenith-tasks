import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore, Task } from '@/store/taskStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, X, Plus, GripVertical } from 'lucide-react';

interface SortableSubtaskProps {
  id: string;
  subtask: string;
  onRemove: () => void;
  onEdit: (newText: string) => void;
}

function SortableSubtask({ id, subtask, onRemove, onEdit }: SortableSubtaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subtask);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(subtask);
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="h-7 text-xs"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
            ✓
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
            ✕
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between">
          <span 
            className="text-xs cursor-pointer hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {subtask}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="p-1 h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface TaskEditModalProps {
  task: Task;
  children: React.ReactNode;
}

export function TaskEditModal({ task, children }: TaskEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category,
    estimatedTime: task.estimatedTime || '',
    dueDate: task.dueDate || '',
    dueTime: task.dueTime || '',
    subtasks: [...task.subtasks]
  });
  const [newSubtask, setNewSubtask] = useState('');
  
  const { updateTask } = useTaskStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = () => {
    updateTask(task.id, {
      ...formData,
      subtasks: formData.subtasks.filter(st => st.trim() !== '')
    });
    setIsOpen(false);
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, newSubtask.trim()]
      }));
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const editSubtask = (index: number, newText: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) => i === index ? newText : subtask)
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.subtasks.findIndex((_, i) => i.toString() === active.id);
        const newIndex = prev.subtasks.findIndex((_, i) => i.toString() === over?.id);

        return {
          ...prev,
          subtasks: arrayMove(prev.subtasks, oldIndex, newIndex)
        };
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description"
              rows={3}
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="work, personal, etc."
              />
            </div>
          </div>

          {/* Time and Date */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time</Label>
              <Input
                id="estimatedTime"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="2 hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label>Subtasks</Label>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={formData.subtasks.map((_, i) => i.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {formData.subtasks.map((subtask, index) => (
                    <SortableSubtask
                      key={index}
                      id={index.toString()}
                      subtask={subtask}
                      onRemove={() => removeSubtask(index)}
                      onEdit={(newText) => editSubtask(index, newText)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <div className="flex gap-2 pt-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              />
              <Button onClick={addSubtask} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}