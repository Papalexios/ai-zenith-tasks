import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from './TaskItem';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const TaskList = React.memo(() => {
  const { tasks, filter, sortBy } = useTaskStore();

  // Memoize filtered and sorted tasks to prevent unnecessary re-computations
  const { filteredTasks, sortedTasks } = useMemo(() => {
    const filtered = tasks.filter(task => {
      switch (filter) {
        case 'completed':
          return task.completed;
        case 'pending':
          return !task.completed;
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          return task.dueDate === today && !task.completed;
        case 'overdue':
          const todayDate = new Date().toISOString().split('T')[0];
          return task.dueDate && task.dueDate < todayDate && !task.completed;
        case 'all':
        default:
          return true;
      }
    });

    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const sorted = [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Sort by priority, then by due date, then by creation date
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      }
      
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return { filteredTasks: filtered, sortedTasks: sorted };
  }, [tasks, filter, sortBy]);

  if (sortedTasks.length === 0) {
    return (
      <div className="minimal-card p-12 text-center border border-muted/20 rounded-2xl">
        <div className="space-y-6">
          {filter === 'all' && (
            <>
              <div className="w-20 h-20 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">No tasks yet</h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Add your first task above and let AI help you organize it perfectly!
                </p>
              </div>
            </>
          )}
          {filter === 'completed' && (
            <>
              <div className="w-20 h-20 bg-gradient-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-accent" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">No completed tasks</h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Complete some tasks to see them here.
                </p>
              </div>
            </>
          )}
          {filter === 'pending' && (
            <>
              <div className="w-20 h-20 bg-gradient-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-secondary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">No pending tasks</h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Great job! You're all caught up.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ 
              layout: { duration: 0.2 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.2 }
            }}
            className="transform-gpu"
          >
            <TaskItem task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

TaskList.displayName = 'TaskList';