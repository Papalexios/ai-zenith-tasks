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
  Edit
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
  const { toggleTask, deleteTask, enhanceTaskWithAI, isLoading } = useTaskStore();

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleEnhanceWithAI = async () => {
    await enhanceTaskWithAI(task.id);
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${task.completed ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Main task row */}
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggle}
              className="mt-1"
            />
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {task.subtasks.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 h-6 w-6"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Tags and metadata */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={priorityColors[task.priority]}>
                  <Target className="mr-1 h-3 w-3" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                
                {task.estimatedTime && (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {task.estimatedTime}
                  </Badge>
                )}
                
                {task.category && (
                  <Badge variant="outline">
                    {task.category}
                  </Badge>
                )}
                
                {task.aiEnhanced && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Enhanced
                  </Badge>
                )}
                
                {task.dueDate && (
                  <Badge variant="outline">
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
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {!task.aiEnhanced && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnhanceWithAI}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Sparkles className="h-3 w-3" />
                  Enhance with AI
                </Button>
              )}
              
              <TaskEditModal task={task}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </TaskEditModal>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}