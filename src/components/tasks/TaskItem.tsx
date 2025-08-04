import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore, Task } from '@/store/taskStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskEditModal } from './TaskEditModal';
import { useToast } from '@/hooks/use-toast';
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
  compact?: boolean;
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const priorityBadgeColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-600 border-red-500/20'
};

export const TaskItem = React.memo(({ task, compact = false }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toggleTask, deleteTask, enhanceTaskWithAI, startFocusTimer, focusTimer } = useTaskStore();
  const { toast } = useToast();

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleEnhanceWithAI = async () => {
    if (isEnhancing) return;
    
    setIsEnhancing(true);
    try {
      await enhanceTaskWithAI(task.id);
      toast({
        title: "Task Enhanced",
        description: "Task has been optimized with AI insights",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed", 
        description: "Service temporarily unavailable. Try again later.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleStartFocus = () => {
    startFocusTimer(task.id);
  };

  const isCurrentlyFocused = focusTimer.taskId === task.id;

  return (
    <Card 
      className={`premium-card group relative overflow-hidden border-0 transition-all duration-500 hover:shadow-2xl ${
        task.completed ? 'opacity-70' : ''
      } ${isCurrentlyFocused ? 'ring-2 ring-primary/50 shadow-glow scale-[1.02]' : ''} bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg backdrop-blur-sm`}
      data-task-id={task.id}
    >
      
      {/* Ambient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-50" />
      
      <CardContent className="relative p-4 sm:p-6 lg:p-8">
        <div className="space-y-5">
          {/* Main Content Row */}
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Action Zone */}
            <div className="flex flex-col items-center gap-4 pt-1">
              <div className="relative group/checkbox">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={handleToggle}
                  className="w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 hover:scale-110 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent border-2 border-border/30 hover:border-primary/50"
                />
                {task.completed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md animate-ping" />
                )}
              </div>
              
              {!task.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartFocus}
                  className={`relative p-3 h-12 w-12 sm:h-14 sm:w-14 transition-all duration-300 hover:scale-110 rounded-2xl group/focus ${
                    isCurrentlyFocused 
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg' 
                      : 'bg-muted/20 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 backdrop-blur-sm border border-border/20'
                  }`}
                  title="Start Focus Timer"
                >
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover/focus:scale-110" />
                  {isCurrentlyFocused && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
                  )}
                </Button>
              )}
            </div>
            
            {/* Content Zone */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title Section */}
              <div className="space-y-3">
                <h3 className={`font-semibold text-sm sm:text-base leading-tight transition-all duration-300 ${
                  task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'
                }`}>
                  {task.title}
                </h3>
                
                {/* AI Enhancement Badge */}
                {task.aiEnhanced && (
                  <div className="flex items-center gap-2 text-xs text-primary/80">
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-medium text-xs">AI Enhanced</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description */}
              {task.description && (
                <div className="text-xs sm:text-sm transition-all duration-300 text-muted-foreground">
                  <p className="line-clamp-2 sm:line-clamp-3 leading-relaxed text-xs sm:text-sm">
                    {task.description}
                  </p>
                </div>
              )}
              
              {/* Premium Badge System */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Priority Badge */}
                <Badge className={`${priorityBadgeColors[task.priority]} text-xs font-medium px-3 py-1 rounded-full border transition-all duration-300 hover:scale-105`}>
                  <Target className="mr-1 h-3 w-3 flex-shrink-0" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                
                {/* Time Badge */}
                {task.estimatedTime && (
                  <Badge variant="outline" className="text-xs font-medium px-2 py-1 rounded-full border border-muted-foreground/30 hover:border-primary/40 transition-all duration-300 hover:scale-105 bg-background/50 backdrop-blur-sm">
                    <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                    {task.estimatedTime.replace(' minutes', 'm').replace(' hours', 'h').replace(' hour', 'h')}
                  </Badge>
                )}
                
                {/* AI Badge */}
                {task.aiEnhanced && (
                  <Badge className="bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 text-primary border border-primary/30 text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    <Sparkles className="mr-1 h-3 w-3 flex-shrink-0" />
                    AI
                  </Badge>
                )}
                
                {/* Due Date Badge */}
                {task.dueDate && (
                  <Badge variant="outline" className="text-sm font-semibold px-4 py-2 rounded-full border-2 border-muted-foreground/30 hover:border-primary/40 transition-all duration-300 hover:scale-105 bg-background/50 backdrop-blur-sm">
                    {(() => {
                      try {
                        const date = new Date(task.dueDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        date.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
                        
                        if (diffDays === 0) return '📅 Today';
                        if (diffDays === 1) return '📅 Tomorrow';
                        if (diffDays === -1) return '📅 Yesterday';
                        if (diffDays > 0 && diffDays <= 7) return `📅 ${diffDays} days`;
                        if (diffDays < 0) return '⚠️ Overdue';
                        
                        return `📅 ${date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}`;
                      } catch {
                        return '📅 Date';
                      }
                    })()}
                  </Badge>
                )}
                
                {/* Category Badge */}
                {task.category && task.category !== 'general' && (
                  <Badge variant="outline" className="text-sm font-semibold px-4 py-2 rounded-full border-2 border-muted-foreground/30 hidden sm:inline-flex transition-all duration-300 hover:scale-105 bg-background/50 backdrop-blur-sm">
                    📂 {task.category}
                  </Badge>
                )}
                
                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs font-medium px-3 py-1 rounded-full border border-muted-foreground/30 bg-muted/20 hidden lg:inline-flex backdrop-blur-sm">
                        #{tag}
                      </Badge>
                    ))}
                    {task.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs font-medium px-3 py-1 rounded-full border border-muted-foreground/30 bg-muted/20 hidden lg:inline-flex backdrop-blur-sm">
                        +{task.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Expand Button */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex flex-col items-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-3 h-12 w-12 hover:scale-110 transition-all duration-300 rounded-2xl hover:bg-primary/10 border border-border/20 backdrop-blur-sm"
                  title={`${isExpanded ? 'Hide' : 'Show'} ${task.subtasks.length} subtasks`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Subtasks Section */}
        {isExpanded && task.subtasks && task.subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-4 pt-4 border-t border-border/30"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full" />
                  Subtasks ({task.completedSubtasks?.length || 0}/{task.subtasks.length})
                </h4>
                {task.subtasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ 
                          width: `${((task.completedSubtasks?.length || 0) / task.subtasks.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(((task.completedSubtasks?.length || 0) / task.subtasks.length) * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2 pl-4">
                {task.subtasks.map((subtask, index) => {
                  const isCompleted = task.completedSubtasks?.includes(index) || false;
                  return (
                    <div key={index} className="flex items-start gap-3 group">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={(checked) => {
                          const { updateTask } = useTaskStore.getState();
                          const completedSubtasks = task.completedSubtasks || [];
                          let newCompletedSubtasks;
                          
                          if (checked) {
                            newCompletedSubtasks = [...completedSubtasks, index];
                          } else {
                            newCompletedSubtasks = completedSubtasks.filter(i => i !== index);
                          }
                          
                          updateTask(task.id, { completedSubtasks: newCompletedSubtasks });
                        }}
                        className="mt-1 w-4 h-4 transition-all duration-300 hover:scale-110"
                      />
                      <span className={`text-sm transition-colors duration-200 leading-relaxed ${
                        isCompleted 
                          ? 'line-through text-muted-foreground/60' 
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                        {subtask}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Compact Mobile Actions */}
        {!task.completed && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20">
            {!task.aiEnhanced && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing}
                className="enhance-button h-7 px-2 gap-1 text-xs hover:scale-105 transition-all duration-300 bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 border-primary/30 hover:border-primary/50 text-primary disabled:opacity-50"
              >
                <Sparkles className={`h-3 w-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span className="font-medium">{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
              </Button>
            )}
            
            <TaskEditModal task={task}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 gap-1 text-xs hover:scale-105 transition-all duration-300 hover:bg-muted/50"
              >
                <Edit className="h-3 w-3" />
                <span className="font-medium">Edit</span>
              </Button>
            </TaskEditModal>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="h-7 px-2 gap-1 text-xs text-destructive hover:text-destructive hover:scale-105 transition-all duration-300 hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
              <span className="font-medium">Delete</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TaskItem.displayName = 'TaskItem';