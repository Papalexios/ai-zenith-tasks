import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/store/taskStore';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Repeat, Clock } from 'lucide-react';

interface RecurringTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimatedTime: string;
  recurringType: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringInterval: number;
  startDate: string;
  endDate?: string;
}

export function RecurringTasks() {
  const [taskData, setTaskData] = useState<RecurringTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    estimatedTime: '30 minutes',
    recurringType: 'daily',
    recurringInterval: 1,
    startDate: new Date().toISOString().split('T')[0],
  });

  const { addTask } = useTaskStore();
  const { toast } = useToast();

  const handleCreateRecurringTask = async () => {
    if (!taskData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate initial task instances
      const tasks = generateTaskInstances(taskData);
      
      for (const task of tasks) {
        await addTask(task.title);
        // Update the task with recurring metadata
        // This would require extending the task store to support recurring metadata
      }

      toast({
        title: "Recurring Tasks Created",
        description: `Created ${tasks.length} recurring task instances`,
      });

      // Reset form
      setTaskData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        estimatedTime: '30 minutes',
        recurringType: 'daily',
        recurringInterval: 1,
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recurring tasks",
        variant: "destructive",
      });
    }
  };

  const generateTaskInstances = (data: RecurringTaskData) => {
    const instances = [];
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days default
    
    let currentDate = new Date(startDate);
    let instanceCount = 0;
    const maxInstances = 50; // Prevent too many instances

    while (currentDate <= endDate && instanceCount < maxInstances) {
      instances.push({
        title: `${data.title} (${currentDate.toLocaleDateString()})`,
        description: data.description,
        dueDate: currentDate.toISOString().split('T')[0],
        priority: data.priority,
        category: data.category,
        estimatedTime: data.estimatedTime,
      });

      // Calculate next occurrence
      switch (data.recurringType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + data.recurringInterval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * data.recurringInterval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + data.recurringInterval);
          break;
        default:
          currentDate.setDate(currentDate.getDate() + data.recurringInterval);
      }

      instanceCount++;
    }

    return instances;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Repeat className="h-4 w-4 text-white" />
          </div>
          Recurring Tasks
          <Badge variant="secondary" className="ml-auto">
            Premium
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="Daily standup meeting"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={taskData.category} onValueChange={(value) => setTaskData({ ...taskData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={taskData.priority} onValueChange={(value: any) => setTaskData({ ...taskData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated-time">Estimated Time</Label>
            <Select value={taskData.estimatedTime} onValueChange={(value) => setTaskData({ ...taskData, estimatedTime: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 minutes">15 minutes</SelectItem>
                <SelectItem value="30 minutes">30 minutes</SelectItem>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="2 hours">2 hours</SelectItem>
                <SelectItem value="4 hours">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurring-type">Repeat</Label>
            <Select value={taskData.recurringType} onValueChange={(value: any) => setTaskData({ ...taskData, recurringType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Every</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="30"
                value={taskData.recurringInterval}
                onChange={(e) => setTaskData({ ...taskData, recurringInterval: parseInt(e.target.value) || 1 })}
                className="w-20"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                {taskData.recurringType === 'daily' ? 'day(s)' : 
                 taskData.recurringType === 'weekly' ? 'week(s)' : 
                 taskData.recurringType === 'monthly' ? 'month(s)' : 'day(s)'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              type="date"
              value={taskData.startDate}
              onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date (Optional)</Label>
            <Input
              type="date"
              value={taskData.endDate || ''}
              onChange={(e) => setTaskData({ ...taskData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Additional details about this recurring task..."
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Preview</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This will create a task "{taskData.title}" every {taskData.recurringInterval} {taskData.recurringType.replace('ly', '')}
            {taskData.recurringInterval > 1 ? 's' : ''} starting from {new Date(taskData.startDate).toLocaleDateString()}.
          </p>
        </div>

        <Button 
          onClick={handleCreateRecurringTask}
          className="w-full gap-2"
          size="lg"
        >
          <Repeat className="h-4 w-4" />
          Create Recurring Tasks
        </Button>
      </CardContent>
    </Card>
  );
}