import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/store/taskStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  Calendar, 
  GripVertical, 
  MoreHorizontal,
  Flag,
  CheckCircle2,
  Circle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CompactTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
  isDragging?: boolean;
}

const priorityColors = {
  urgent: 'border-l-destructive bg-destructive/5',
  high: 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20',
  medium: 'border-l-accent bg-accent/5',
  low: 'border-l-muted-foreground bg-muted/20'
};

const priorityIcons = {
  urgent: '🔴',
  high: '🟠', 
  medium: '🟡',
  low: '⚪'
};

export function CompactTaskItem({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  style,
  isDragging 
}: CompactTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        group compact-task-item transition-all duration-200 hover:shadow-md
        border-l-4 ${priorityColors[task.priority]}
        ${task.completed ? 'opacity-60' : ''}
        ${isDragging ? 'shadow-lg scale-105 rotate-1' : ''}
      `}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        
        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="h-5 w-5"
        />
        
        {/* Priority Indicator */}
        <span className="text-sm">{priorityIcons[task.priority]}</span>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium text-sm truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {task.aiEnhanced && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                AI
              </Badge>
            )}
          </div>
          
          {/* Quick Info */}
          <div className="flex items-center gap-3 mt-1">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.estimatedTime}
              </div>
            )}
            <Badge variant="outline" className="h-5 px-2 text-xs">
              {task.category}
            </Badge>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.subtasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <span className="text-xs">{task.subtasks.length}</span>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Expanded Subtasks */}
      {isExpanded && task.subtasks.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border/50 px-12 py-2 space-y-1"
        >
          {task.subtasks.map((subtask, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Circle className="h-3 w-3" />
              {subtask}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}