import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTaskStore } from '@/store/taskStore';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Trash2,
  Star,
  Calendar,
  Tag,
  Zap,
  X,
  Grid3x3
} from 'lucide-react';

export function BulkActions() {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const { toast } = useToast();
  const { tasks, toggleTask, deleteTask, updateTask } = useTaskStore();

  const pendingTasks = tasks.filter(t => !t.completed);
  const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));

  const toggleSelection = (taskId: string) => {
    const newSelection = new Set(selectedTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTaskIds(newSelection);
    
    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const selectAll = () => {
    if (selectedTaskIds.size === pendingTasks.length) {
      setSelectedTaskIds(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedTaskIds(new Set(pendingTasks.map(t => t.id)));
      setIsSelectionMode(true);
    }
  };

  const bulkComplete = async () => {
    const tasksToComplete = Array.from(selectedTaskIds);
    for (const taskId of tasksToComplete) {
      await toggleTask(taskId);
    }
    setSelectedTaskIds(new Set());
    setIsSelectionMode(false);
    toast({
      title: "Tasks Completed",
      description: `${tasksToComplete.length} tasks marked as complete`
    });
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedTaskIds.size} selected tasks? This cannot be undone.`)) return;
    
    const tasksToDelete = Array.from(selectedTaskIds);
    for (const taskId of tasksToDelete) {
      await deleteTask(taskId);
    }
    setSelectedTaskIds(new Set());
    setIsSelectionMode(false);
    toast({
      title: "Tasks Deleted",
      description: `${tasksToDelete.length} tasks deleted`
    });
  };

  const bulkSetPriority = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const tasksToUpdate = Array.from(selectedTaskIds);
    for (const taskId of tasksToUpdate) {
      await updateTask(taskId, { priority });
    }
    setSelectedTaskIds(new Set());
    setIsSelectionMode(false);
    toast({
      title: "Priority Updated",
      description: `${tasksToUpdate.length} tasks set to ${priority} priority`
    });
  };

  const bulkSetDueDate = async () => {
    const dateInput = prompt('Enter due date (YYYY-MM-DD):');
    if (!dateInput) return;
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      
      const tasksToUpdate = Array.from(selectedTaskIds);
      for (const taskId of tasksToUpdate) {
        await updateTask(taskId, { dueDate: dateInput });
      }
      setSelectedTaskIds(new Set());
      setIsSelectionMode(false);
      toast({
        title: "Due Date Set",
        description: `${tasksToUpdate.length} tasks due on ${dateInput}`
      });
    } catch (error) {
      toast({
        title: "Invalid Date",
        description: "Please enter a valid date in YYYY-MM-DD format",
        variant: "destructive"
      });
    }
  };

  if (pendingTasks.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Selection Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/30">
        <div className="flex items-center gap-3">
          <Button
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (!isSelectionMode) {
                setSelectedTaskIds(new Set());
              }
            }}
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            {isSelectionMode ? 'Exit Selection' : 'Bulk Select'}
          </Button>
          
          {isSelectionMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {selectedTaskIds.size === pendingTasks.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
        
        {selectedTaskIds.size > 0 && (
          <Badge variant="secondary" className="gap-1">
            {selectedTaskIds.size} selected
          </Badge>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedTaskIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {selectedTaskIds.size} selected
              </Badge>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={bulkComplete}
                  className="gap-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={bulkSetDueDate}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Set Due Date
                </Button>
                
                {/* Priority Buttons */}
                <div className="flex gap-1">
                  {(['urgent', 'high', 'medium', 'low'] as const).map(priority => (
                    <Button
                      key={priority}
                      size="sm"
                      variant="outline"
                      onClick={() => bulkSetPriority(priority)}
                      className={`h-8 w-8 p-0 ${
                        priority === 'urgent' ? 'text-red-600 hover:bg-red-500/10' :
                        priority === 'high' ? 'text-orange-600 hover:bg-orange-500/10' :
                        priority === 'medium' ? 'text-yellow-600 hover:bg-yellow-500/10' :
                        'text-green-600 hover:bg-green-500/10'
                      }`}
                      title={`Set ${priority} priority`}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={bulkDelete}
                  className="gap-2 text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedTaskIds(new Set());
                    setIsSelectionMode(false);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Selection Overlay */}
      {isSelectionMode && (
        <div className="space-y-3">
          {pendingTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedTaskIds.has(task.id)
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-background hover:bg-muted/50 border-border/30'
              }`}
              onClick={() => toggleSelection(task.id)}
            >
              <Checkbox
                checked={selectedTaskIds.has(task.id)}
                onCheckedChange={() => toggleSelection(task.id)}
                className="h-5 w-5"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{task.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      task.priority === 'urgent' ? 'border-red-500/20 text-red-600' :
                      task.priority === 'high' ? 'border-orange-500/20 text-orange-600' :
                      task.priority === 'medium' ? 'border-yellow-500/20 text-yellow-600' :
                      'border-green-500/20 text-green-600'
                    }`}
                  >
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <Badge variant="outline" className="text-xs">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}