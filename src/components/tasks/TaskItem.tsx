import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore, Task } from '@/store/taskStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskEditModal } from './TaskEditModal';
import { 
  MoreHorizontal, 
  Sparkles, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronRight,
  Trash2,
  Edit,
  Play
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-600 border-red-500/20'
};

export function TaskItem({ task }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleTask, deleteTask, enhanceTaskWithAI, startFocusTimer, focusTimer } = useTaskStore();

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleEnhanceWithAI = async () => {
    await enhanceTaskWithAI(task.id);
  };

  const handleStartFocus = () => {
    startFocusTimer(task.id);
  };

  const isCurrentlyFocused = focusTimer.taskId === task.id;

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group ${
      task.completed ? 'opacity-75' : ''
    } ${isCurrentlyFocused ? 'ring-2 ring-primary/50 shadow-glow' : ''} ${
      task.description === 'AI is enhancing...' ? 'animate-pulse' : ''
    }`}>
      <CardContent className="p-6 space-y-4">
        {/* Main task row */}
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggle}
              className="w-5 h-5 transition-all duration-300"
            />
            
            {!task.completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartFocus}
                className={`p-2 h-8 w-8 transition-all duration-300 hover:scale-110 ${
                  isCurrentlyFocused ? 'bg-primary/10 text-primary' : 'opacity-70 hover:opacity-100'
                }`}
                title="Start focus session"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h3 className={`font-semibold text-lg transition-all duration-300 ${
                  task.completed ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-sm transition-all duration-300 ${
                    task.description === 'AI is enhancing...' ? 'text-primary animate-pulse' : 'text-muted-foreground'
                  }`}>
                    {task.description === 'AI is enhancing...' && (
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        AI is enhancing...
                      </span>
                    )}
                    {task.description !== 'AI is enhancing...' && task.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {task.subtasks.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 h-8 w-8 hover:scale-110 transition-all duration-300"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 h-8 w-8 hover:scale-110 transition-all duration-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Tags and metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${priorityColors[task.priority]} transition-all duration-300 hover:scale-105`}>
                <Target className="mr-1 h-3 w-3" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              
              {task.estimatedTime && (
                <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
                  <Clock className="mr-1 h-3 w-3" />
                  {task.estimatedTime}
                </Badge>
              )}
              
              {task.category && (
                <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
                  {task.category}
                </Badge>
              )}
              
              {task.aiEnhanced && !task.description?.includes('AI is enhancing') && (
                <Badge className="bg-primary/10 text-primary border-primary/20 transition-all duration-300 hover:scale-105">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Enhanced
                </Badge>
              )}
              
              {task.dueDate && (
                <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>

          {/* Subtasks */}
          {isExpanded && task.subtasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-8 space-y-2 border-l-2 border-muted pl-4"
            >
              {task.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  <span className="text-muted-foreground">{subtask}</span>
                </div>
              ))}
            </motion.div>
          )}

        {/* Actions */}
        {!task.completed && (
          <div className="flex items-center gap-3 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {!task.aiEnhanced && !task.description?.includes('AI is enhancing') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhanceWithAI}
                className="gap-2 hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="h-3 w-3" />
                Enhance with AI
              </Button>
            )}
            
            <TaskEditModal task={task}>
              <Button variant="ghost" size="sm" className="gap-2 hover:scale-105 transition-all duration-300">
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </TaskEditModal>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="gap-2 text-destructive hover:text-destructive hover:scale-105 transition-all duration-300"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}