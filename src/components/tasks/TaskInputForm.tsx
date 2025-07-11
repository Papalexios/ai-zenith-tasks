import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStore } from '@/store/taskStore';
import { toast } from '@/hooks/use-toast';

export const TaskInputForm = () => {
  const [newTask, setNewTask] = useState('');
  const { addTask, isLoading } = useTaskStore();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await addTask(newTask, true); // Always use AI for premium experience
      setNewTask('');
      toast({
        title: "Task Added Successfully",
        description: "AI is enhancing your task with premium details...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          Add Premium Task with AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Describe your task naturally (e.g., 'Plan team meeting for next Friday')"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 h-12 text-base"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!newTask.trim() || isLoading}
              className="h-12 px-6 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Add with AI
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};