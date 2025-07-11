import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/store/taskStore';

type ViewMode = 'week' | 'month' | 'year';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const tasks = useTaskStore(state => state.tasks);

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

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Calendar View</CardTitle>
            </div>
            <div className="flex items-center gap-2">
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
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
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

      {/* Calendar Grid */}
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
  );
};