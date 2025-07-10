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
    <Card className={`transition-all duration-300 hover:shadow-md group relative overflow-hidden ${
      task.completed ? 'opacity-60' : ''
    } ${isCurrentlyFocused ? 'ring-2 ring-primary/50 shadow-glow' : ''} ${
      task.description === 'AI is enhancing...' ? 'animate-pulse' : ''
    }`}>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Ultra Mobile-First Layout */}
        <div className="space-y-3">
          {/* Main Content Row - Optimized for Thumb Navigation */}
          <div className="flex items-start gap-3">
            {/* Left Action Zone - Touch Optimized */}
            <div className="flex flex-col items-center gap-2 pt-0.5">
              <div className="touch-target">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={handleToggle}
                  className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300"
                />
              </div>
              
              {!task.completed && (
                <div className="touch-target">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartFocus}
                    className={`p-2 h-8 w-8 sm:h-9 sm:w-9 transition-all duration-300 hover:scale-110 rounded-full ${
                      isCurrentlyFocused ? 'bg-primary/20 text-primary' : 'bg-muted/50 hover:bg-muted'
                    }`}
                    title="Focus"
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Content Zone - Mobile Optimized */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title - Mobile Typography */}
              <h3 className={`font-semibold text-base sm:text-lg lg:text-xl leading-tight transition-all duration-300 ${
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {task.title}
              </h3>
              
              {/* Description - Mobile Truncated */}
              {task.description && (
                <p className={`text-sm sm:text-base transition-all duration-300 line-clamp-2 sm:line-clamp-3 ${
                  task.description === 'AI is enhancing...' ? 'text-primary animate-pulse' : 'text-muted-foreground'
                }`}>
                  {task.description === 'AI is enhancing...' ? (
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-3 w-3 animate-pulse flex-shrink-0" />
                      AI is enhancing...
                    </span>
                  ) : task.description}
                </p>
              )}
              
              {/* Ultra Mobile Badge Row */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Priority - Always Visible */}
                <Badge className={`${priorityColors[task.priority]} text-xs px-2 py-0.5 font-medium`}>
                  <Target className="mr-1 h-2.5 w-2.5 flex-shrink-0" />
                  {task.priority.charAt(0).toUpperCase()}
                </Badge>
                
                {/* Time - Compact Mobile */}
                {task.estimatedTime && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <Clock className="mr-1 h-2.5 w-2.5 flex-shrink-0" />
                    {task.estimatedTime.replace(' minutes', 'm').replace(' hours', 'h')}
                  </Badge>
                )}
                
                {/* AI Badge - Mobile Priority */}
                {task.aiEnhanced && !task.description?.includes('AI is enhancing') && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
                    <Sparkles className="mr-1 h-2.5 w-2.5 flex-shrink-0" />
                    AI
                  </Badge>
                )}
                
                {/* Due Date - Mobile Format */}
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {(() => {
                      try {
                        const date = new Date(task.dueDate);
                        const today = new Date();
                        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
                        
                        if (diffDays === 0) return 'Today';
                        if (diffDays === 1) return 'Tomorrow';
                        if (diffDays === -1) return 'Yesterday';
                        if (diffDays > 0 && diffDays <= 7) return `${diffDays}d`;
                        
                        return date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      } catch {
                        return 'No date';
                      }
                    })()}
                  </Badge>
                )}
                
                {/* Category - Desktop Only */}
                {task.category && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 hidden sm:inline-flex">
                    {task.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Right Action Zone - Mobile Menu */}
            <div className="flex flex-col items-center gap-1">
              {task.subtasks.length > 0 && (
                <div className="touch-target">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 h-8 w-8 hover:scale-110 transition-all duration-300 rounded-full"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              
              <div className="touch-target">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 h-8 w-8 hover:scale-110 transition-all duration-300 rounded-full opacity-50 hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
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

        {/* Ultra Mobile Actions - Swipe-Friendly */}
        {!task.completed && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-border/30 transition-all duration-300">
            {!task.aiEnhanced && !task.description?.includes('AI is enhancing') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhanceWithAI}
                className="gap-1.5 hover:scale-105 transition-all duration-300 text-xs px-3 py-1.5 h-8 touch-target flex-1 sm:flex-none min-w-[80px]"
              >
                <Sparkles className="h-3 w-3" />
                AI Boost
              </Button>
            )}
            
            <TaskEditModal task={task}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 hover:scale-105 transition-all duration-300 text-xs px-3 py-1.5 h-8 touch-target flex-1 sm:flex-none min-w-[60px]"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </TaskEditModal>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="gap-1.5 text-destructive hover:text-destructive hover:scale-105 transition-all duration-300 text-xs px-3 py-1.5 h-8 touch-target"
            >
              <Trash2 className="h-3 w-3" />
              Del
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}