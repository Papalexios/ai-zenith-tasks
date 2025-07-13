import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, addMinutes, differenceInMinutes, isWithinInterval } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, Filter, Plus, Zap, Brain, Target } from 'lucide-react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTaskStore, Task } from '@/store/taskStore';
import { toast } from '@/hooks/use-toast';

type ViewMode = 'week' | 'month' | 'year' | 'timeblock';

interface TimeBlock {
  id: string;
  taskId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

interface DraggableTaskProps {
  task: Task;
  timeBlock?: TimeBlock;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ task, timeBlock }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: timeBlock ? `scheduled-${task.id}` : `unscheduled-${task.id}`,
    data: { task, timeBlock }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 text-red-900';
      case 'high': return 'border-l-orange-500 bg-orange-50 text-orange-900';
      case 'medium': return 'border-l-blue-500 bg-blue-50 text-blue-900';
      case 'low': return 'border-l-gray-500 bg-gray-50 text-gray-900';
      default: return 'border-l-gray-500 bg-gray-50 text-gray-900';
    }
  };

  const estimatedMinutes = task.estimatedTime ? parseInt(task.estimatedTime) * 60 : 60;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 rounded border-l-4 cursor-move transition-all hover:shadow-md ${
        getPriorityColor(task.priority)
      } ${task.completed ? 'opacity-60 line-through' : ''}`}
    >
      <div className="font-medium text-sm truncate">{task.title}</div>
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {Math.round(estimatedMinutes / 60)}h
        </span>
        {task.priority === 'urgent' && <Zap className="h-3 w-3" />}
      </div>
    </div>
  );
};

interface DroppableTimeSlotProps {
  date: string;
  hour: number;
  timeBlocks: TimeBlock[];
  onDrop: (taskId: string, date: string, hour: number) => void;
}

const DroppableTimeSlot: React.FC<DroppableTimeSlotProps> = ({ date, hour, timeBlocks, onDrop }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${date}-${hour}`,
    data: { date, hour }
  });

  const slotTimeBlocks = timeBlocks.filter(tb => {
    const tbHour = parseInt(tb.startTime.split(':')[0]);
    return tb.date === date && tbHour === hour;
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-16 border border-gray-200 p-1 transition-colors ${
        isOver ? 'bg-primary/20 border-primary' : 'hover:bg-gray-50'
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">
        {hour === 0 ? '12:00 AM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
      </div>
      <div className="space-y-1">
        {slotTimeBlocks.map(tb => {
          // We'll need to find the task for this time block
          return (
            <div key={tb.id} className="text-xs bg-primary/10 p-1 rounded">
              Time blocked
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('timeblock');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [showAIScheduler, setShowAIScheduler] = useState(false);
  const [schedulingPreferences, setSchedulingPreferences] = useState({
    workingHours: { start: '09:00', end: '17:00' },
    preferredFocusTime: '09:00',
    breakDuration: 15,
    maxTaskDuration: 120
  });

  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);

  const getDateRange = () => {
    switch (viewMode) {
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case 'year':
        return {
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        };
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const { start, end } = getDateRange();
  const days = eachDayOfInterval({ start, end });

  const tasksWithDates = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      
      try {
        const taskDate = parseISO(task.dueDate);
        return taskDate >= start && taskDate <= end;
      } catch {
        return false;
      }
    });
  }, [tasks, start, end, filterCategory]);

  const getTasksForDay = (day: Date) => {
    return tasksWithDates.filter(task => {
      if (!task.dueDate) return false;
      try {
        return isSameDay(parseISO(task.dueDate), day);
      } catch {
        return false;
      }
    });
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskData = active.data.current;
    const slotData = over.data.current;

    if (taskData?.task && slotData?.date && slotData?.hour !== undefined) {
      const task = taskData.task;
      const estimatedMinutes = task.estimatedTime ? parseInt(task.estimatedTime) * 60 : 60;
      
      const newTimeBlock: TimeBlock = {
        id: `${task.id}-${slotData.date}-${slotData.hour}`,
        taskId: task.id,
        date: slotData.date,
        startTime: `${slotData.hour.toString().padStart(2, '0')}:00`,
        endTime: `${Math.min(slotData.hour + Math.ceil(estimatedMinutes / 60), 23).toString().padStart(2, '0')}:00`,
        duration: estimatedMinutes
      };

      setTimeBlocks(prev => {
        // Remove existing time blocks for this task
        const filtered = prev.filter(tb => tb.taskId !== task.id);
        return [...filtered, newTimeBlock];
      });

      // Update task due date and time
      updateTask(task.id, {
        dueDate: slotData.date,
        dueTime: newTimeBlock.startTime
      });

      toast({
        title: "Task Scheduled",
        description: `${task.title} scheduled for ${format(new Date(slotData.date), 'MMM d')} at ${newTimeBlock.startTime}`,
      });
    }
  }, [updateTask]);

  const autoScheduleTasks = useCallback(() => {
    const unscheduledTasks = tasks.filter(task => 
      !task.completed && 
      (!task.dueDate || !task.dueTime) &&
      (filterCategory === 'all' || task.category === filterCategory)
    );

    if (unscheduledTasks.length === 0) {
      toast({
        title: "No Tasks to Schedule",
        description: "All tasks are already scheduled or completed.",
      });
      return;
    }

    // Simple AI scheduling algorithm
    const sortedTasks = unscheduledTasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });

    const newTimeBlocks: TimeBlock[] = [];
    const startHour = parseInt(schedulingPreferences.workingHours.start.split(':')[0]);
    const endHour = parseInt(schedulingPreferences.workingHours.end.split(':')[0]);
    
    let currentSlot = startHour;
    const today = format(new Date(), 'yyyy-MM-dd');

    sortedTasks.forEach(task => {
      const estimatedMinutes = task.estimatedTime ? parseInt(task.estimatedTime) * 60 : 60;
      const slotsNeeded = Math.ceil(estimatedMinutes / 60);
      
      if (currentSlot + slotsNeeded <= endHour) {
        const timeBlock: TimeBlock = {
          id: `${task.id}-${today}-${currentSlot}`,
          taskId: task.id,
          date: today,
          startTime: `${currentSlot.toString().padStart(2, '0')}:00`,
          endTime: `${(currentSlot + slotsNeeded).toString().padStart(2, '0')}:00`,
          duration: estimatedMinutes
        };

        newTimeBlocks.push(timeBlock);
        
        updateTask(task.id, {
          dueDate: today,
          dueTime: timeBlock.startTime
        });

        currentSlot += slotsNeeded;
        
        // Add break if needed
        if (currentSlot < endHour) {
          currentSlot += Math.ceil(schedulingPreferences.breakDuration / 60);
        }
      }
    });

    setTimeBlocks(prev => [...prev, ...newTimeBlocks]);
    
    toast({
      title: "AI Scheduling Complete",
      description: `${newTimeBlocks.length} tasks automatically scheduled based on priority and time estimates.`,
    });
  }, [tasks, filterCategory, schedulingPreferences, updateTask]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 border-red-200';
      case 'high': return 'bg-orange-500 border-orange-200';
      case 'medium': return 'bg-blue-500 border-blue-200';
      case 'low': return 'bg-gray-500 border-gray-200';
      default: return 'bg-gray-500 border-gray-200';
    }
  };

  const categories = [...new Set(tasks.map(t => t.category))];

  const unscheduledTasks = tasks.filter(task => 
    !task.completed && 
    (!task.dueDate || !task.dueTime) &&
    (filterCategory === 'all' || task.category === filterCategory)
  );

  const weekDays = viewMode === 'timeblock' ? 
    eachDayOfInterval({ 
      start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
      end: endOfWeek(currentDate, { weekStartsOn: 1 }) 
    }) : [];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Enhanced Calendar Header */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">AI Time Blocking Calendar</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={autoScheduleTasks} className="h-8">
                  <Brain className="h-3 w-3 mr-1" />
                  Auto Schedule
                </Button>
                <Dialog open={showAIScheduler} onOpenChange={setShowAIScheduler}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Target className="h-3 w-3 mr-1" />
                      Preferences
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>AI Scheduling Preferences</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Work Start</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={schedulingPreferences.workingHours.start}
                            onChange={(e) => setSchedulingPreferences(prev => ({
                              ...prev,
                              workingHours: { ...prev.workingHours, start: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">Work End</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={schedulingPreferences.workingHours.end}
                            onChange={(e) => setSchedulingPreferences(prev => ({
                              ...prev,
                              workingHours: { ...prev.workingHours, end: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="focus-time">Preferred Focus Time</Label>
                        <Input
                          id="focus-time"
                          type="time"
                          value={schedulingPreferences.preferredFocusTime}
                          onChange={(e) => setSchedulingPreferences(prev => ({
                            ...prev,
                            preferredFocusTime: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32 h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timeblock">Time Block</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {viewMode === 'timeblock' && `Time Blocking - Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')}`}
                {viewMode === 'week' && `Week of ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`}
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewMode === 'year' && format(currentDate, 'yyyy')}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Time Block View */}
        {viewMode === 'timeblock' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Unscheduled Tasks Panel */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Unscheduled Tasks ({unscheduledTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {unscheduledTasks.map(task => (
                  <DraggableTask key={task.id} task={task} />
                ))}
                {unscheduledTasks.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All tasks scheduled!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Block Grid */}
            <Card className="lg:col-span-3">
              <CardContent className="p-0">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-2 text-xs font-medium text-muted-foreground">Time</div>
                  {weekDays.map(day => (
                    <div key={day.toISOString()} className="p-2 text-xs font-medium text-center border-l">
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-muted-foreground">{format(day, 'MMM d')}</div>
                    </div>
                  ))}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {hours.slice(6, 23).map(hour => ( // Show 6 AM to 11 PM
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 text-xs text-muted-foreground bg-gray-50 border-r">
                        {hour === 0 ? '12:00 AM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                      </div>
                      {weekDays.map(day => (
                        <DroppableTimeSlot
                          key={`${day.toISOString()}-${hour}`}
                          date={format(day, 'yyyy-MM-dd')}
                          hour={hour}
                          timeBlocks={timeBlocks}
                          onDrop={(taskId, date, hour) => {}}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Original Calendar Views */}

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border min-h-32 ${
                      isToday 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium text-sm mb-2">
                      <div className={isToday ? 'text-primary font-semibold' : 'text-foreground'}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {format(day, 'MMM d')}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-2 rounded border-l-2 ${getPriorityColor(task.priority)} ${
                            task.completed ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <div className="font-medium text-white truncate">{task.title}</div>
                          {task.dueTime && (
                            <div className="flex items-center gap-1 mt-1 text-white/80">
                              <Clock className="h-2 w-2" />
                              <span>{task.dueTime}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-2 text-xs font-medium text-center text-muted-foreground">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={index}
                    className={`aspect-square p-1 border rounded ${
                      isToday 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`text-xs mb-1 ${isToday ? 'font-semibold text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`h-1 rounded ${getPriorityColor(task.priority)} ${
                            task.completed ? 'opacity-50' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'year' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(currentDate.getFullYear(), i, 1);
                const monthTasks = tasksWithDates.filter(task => {
                  if (!task.dueDate) return false;
                  try {
                    const taskDate = parseISO(task.dueDate);
                    return taskDate.getMonth() === i && taskDate.getFullYear() === currentDate.getFullYear();
                  } catch {
                    return false;
                  }
                });

                return (
                  <Card key={i} className="p-3">
                    <h3 className="font-medium text-sm mb-2">{format(monthDate, 'MMM yyyy')}</h3>
                    <div className="text-xs text-muted-foreground">
                      {monthTasks.length} tasks
                    </div>
                    <div className="mt-2 space-y-1">
                      {['urgent', 'high', 'medium', 'low'].map(priority => {
                        const count = monthTasks.filter(t => t.priority === priority).length;
                        if (count === 0) return null;
                        return (
                          <div key={priority} className="flex justify-between text-xs">
                            <span className="capitalize">{priority}:</span>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </DndContext>
  );
};