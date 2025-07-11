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
  const isAiEnhancing = task.description?.includes('AI is enhancing');

  return (
    <Card className={`transition-all duration-500 hover:shadow-xl group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm ${
      task.completed ? 'opacity-60' : ''
    } ${isCurrentlyFocused ? 'ring-2 ring-primary/50 shadow-glow' : ''} ${
      isAiEnhancing ? 'animate-pulse bg-gradient-to-r from-primary/5 to-accent/5' : 'bg-gradient-to-br from-card to-card/90'
    }`}>
      <CardContent className="p-4 sm:p-5 lg:p-6">
        {/* Premium Mobile-First Layout */}
        <div className="space-y-4">
          {/* Main Content Row - Touch Optimized */}
          <div className="flex items-start gap-4">
            {/* Action Zone - Premium Touch Targets */}
            <div className="flex flex-col items-center gap-3 pt-1">
              <div className="relative">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={handleToggle}
                  className="w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 hover:scale-110 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                />
              </div>
              
              {!task.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartFocus}
                  className={`relative p-2.5 h-10 w-10 sm:h-11 sm:w-11 transition-all duration-300 hover:scale-110 rounded-full group ${
                    isCurrentlyFocused 
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg' 
                      : 'bg-muted/30 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10'
                  }`}
                  title="Start Focus Timer"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                  {isCurrentlyFocused && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-ping" />
                  )}
                </Button>
              )}
            </div>
            
            {/* Content Zone - Premium Typography */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title - Enhanced Mobile Typography */}
              <div className="space-y-1">
                <h3 className={`font-bold text-lg sm:text-xl lg:text-2xl leading-tight transition-all duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ${
                  task.completed ? 'line-through text-muted-foreground/60' : ''
                }`}>
                  {task.title}
                </h3>
                
                {/* Subtitle for AI Enhanced */}
                {task.aiEnhanced && !isAiEnhancing && (
                  <div className="flex items-center gap-2 text-xs text-primary/70">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Enhanced with Premium Quality</span>
                  </div>
                )}
              </div>
              
              {/* Description - Premium Mobile Display */}
              {task.description && (
                <div className={`text-sm sm:text-base transition-all duration-300 ${
                  isAiEnhancing ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {isAiEnhancing ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary flex-shrink-0" />
                      <span>AI is enhancing this task with premium quality...</span>
                    </div>
                  ) : (
                    <p className="line-clamp-3 sm:line-clamp-4 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>
              )}
              
              {/* Premium Badge System */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Badge - Enhanced Design */}
                <Badge className={`${priorityColors[task.priority]} text-xs font-semibold px-3 py-1 rounded-full border shadow-sm transition-all duration-300 hover:scale-105`}>
                  <Target className="mr-1.5 h-3 w-3 flex-shrink-0" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                
                {/* Time Badge - Premium Style */}
                {task.estimatedTime && (
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1 rounded-full border-muted-foreground/20 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                    <Clock className="mr-1.5 h-3 w-3 flex-shrink-0" />
                    {task.estimatedTime.replace(' minutes', 'm').replace(' hours', 'h').replace(' hour', 'h')}
                  </Badge>
                )}
                
                {/* AI Badge - Premium Gradient */}
                {task.aiEnhanced && !isAiEnhancing && (
                  <Badge className="bg-gradient-to-r from-primary/15 to-accent/15 text-primary border-primary/30 text-xs font-semibold px-3 py-1 rounded-full shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                    <Sparkles className="mr-1.5 h-3 w-3 flex-shrink-0" />
                    Premium AI
                  </Badge>
                )}
                
                {/* Due Date - Enhanced Mobile Format */}
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1 rounded-full border-muted-foreground/20 hover:border-primary/30 transition-all duration-300 hover:scale-105">
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
                        if (diffDays > 0 && diffDays <= 7) return `📅 ${diffDays}d`;
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
                
                {/* Category - Desktop Enhanced */}
                {task.category && task.category !== 'general' && (
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1 rounded-full border-muted-foreground/20 hidden sm:inline-flex transition-all duration-300 hover:scale-105">
                    📂 {task.category}
                  </Badge>
                )}
                
                {/* Tags - Premium Display */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs font-medium px-2 py-0.5 rounded-full border-muted-foreground/20 bg-muted/30 hidden sm:inline-flex">
                        #{tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 rounded-full border-muted-foreground/20 bg-muted/30 hidden sm:inline-flex">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Action Zone - Enhanced */}
            <div className="flex flex-col items-center gap-2">
              {task.subtasks && task.subtasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 h-9 w-9 hover:scale-110 transition-all duration-300 rounded-full hover:bg-primary/10"
                  title={`${isExpanded ? 'Hide' : 'Show'} ${task.subtasks.length} subtasks`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Premium Subtasks Section */}
        {isExpanded && task.subtasks && task.subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-4 pt-4 border-t border-border/30"
          >
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full" />
                Subtasks ({task.subtasks.length})
              </h4>
              <div className="space-y-2 pl-4">
                {task.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-2 h-2 bg-gradient-to-r from-primary/60 to-accent/60 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200 leading-relaxed">
                      {subtask}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Premium Mobile Actions */}
        {!task.completed && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/20">
            {!task.aiEnhanced && !isAiEnhancing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhanceWithAI}
                className="flex-1 sm:flex-none min-w-[100px] gap-2 hover:scale-105 transition-all duration-300 bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 border-primary/30 hover:border-primary/50 text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-medium">Enhance</span>
              </Button>
            )}
            
            <TaskEditModal task={task}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 sm:flex-none min-w-[80px] gap-2 hover:scale-105 transition-all duration-300 hover:bg-muted/50"
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="font-medium">Edit</span>
              </Button>
            </TaskEditModal>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="gap-2 text-destructive hover:text-destructive hover:scale-105 transition-all duration-300 hover:bg-destructive/10 px-3"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="font-medium">Delete</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}