import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from './TaskItem';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function TaskList() {
  const { tasks, filter } = useTaskStore();

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate === today;
      default:
        return true;
    }
  });

  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (sortedTasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="space-y-4">
            {filter === 'all' && (
              <>
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">No tasks yet</h3>
                  <p className="text-muted-foreground">
                    Add your first task above and let AI help you organize it!
                  </p>
                </div>
              </>
            )}
            {filter === 'completed' && (
              <>
                <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">No completed tasks</h3>
                  <p className="text-muted-foreground">
                    Complete some tasks to see them here.
                  </p>
                </div>
              </>
            )}
            {filter === 'pending' && (
              <>
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">No pending tasks</h3>
                  <p className="text-muted-foreground">
                    Great job! You're all caught up.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sortedTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <TaskItem task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}