import React from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from './TaskItem';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function KanbanBoard() {
  const { tasks } = useTaskStore();

  const today = new Date().toISOString().split('T')[0];
  
  const columns = [
    {
      id: 'today',
      title: 'Today',
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500/20',
      tasks: tasks.filter(task => task.dueDate === today && !task.completed)
    },
    {
      id: 'pending',
      title: 'To Do',
      icon: Circle,
      color: 'from-blue-500 to-purple-500',
      borderColor: 'border-blue-500/20',
      tasks: tasks.filter(task => !task.completed && task.dueDate !== today)
    },
    {
      id: 'overdue',
      title: 'Overdue',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      borderColor: 'border-red-500/20',
      tasks: tasks.filter(task => task.dueDate && task.dueDate < today && !task.completed)
    },
    {
      id: 'completed',
      title: 'Done',
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-500/20',
      tasks: tasks.filter(task => task.completed)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mobile View - Stacked */}
      <div className="block lg:hidden space-y-4">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl border ${column.borderColor} overflow-hidden`}
          >
            <div className={`bg-gradient-to-r ${column.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <column.icon className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-bold text-white">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {column.tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <column.icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              ) : (
                column.tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TaskItem task={task} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop View - Horizontal Kanban */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl border ${column.borderColor} overflow-hidden min-h-[600px]`}
          >
            <div className={`bg-gradient-to-r ${column.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <column.icon className="h-5 w-5 text-white" />
                  <h3 className="font-bold text-white">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>
            
            <div className="p-4 space-y-3 h-full">
              {column.tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <column.icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No tasks</p>
                </div>
              ) : (
                column.tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskItem task={task} compact />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}