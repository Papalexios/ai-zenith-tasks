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
    if (!newTask.trim()) {
      console.warn('Empty task input');
      return;
    }

    console.log('🚀 Form submitted with task:', newTask);
    console.log('🔥 Task input length:', newTask.length);
    console.log('🔥 Task characters:', newTask.split('').map(c => c.charCodeAt(0)));

    try {
      console.log('🎯 Calling addTask with:', newTask, true);
      await addTask(newTask.trim(), true);
      console.log('✅ Task added successfully');
      setNewTask('');
      toast({
        title: "Task Created Successfully",
        description: `"${newTask.trim()}" has been added with AI enhancement`,
      });
    } catch (error) {
      console.error('❌ Failed to add task:', error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
        <CardHeader className="relative pb-4 pt-6">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Add Premium AI Task
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Works in any language • Enhanced with AI
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6 pb-8">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type your task in any language... (e.g., 'Plan meeting', 'Αφαίρεση cherries', '会議の準備', 'Llamar a mamá')"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="h-14 sm:h-16 text-base sm:text-lg px-6 rounded-2xl border-2 border-border/20 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              
              <Button 
                type="submit" 
                disabled={!newTask.trim() || isLoading}
                className="h-14 sm:h-16 px-8 gap-3 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-0 min-w-[140px] sm:min-w-[160px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Add with AI</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Language Examples */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
              {[
                "🇺🇸 Plan meeting",
                "🇬🇷 Αφαίρεση cherries", 
                "🇯🇵 会議の準備",
                "🇪🇸 Llamar a mamá",
                "🇫🇷 Appeler maman",
                "🇨🇳 给妈妈打电话"
              ].map((example, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTask(example.split(' ').slice(1).join(' '))}
                  className="text-xs h-8 border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  disabled={isLoading}
                >
                  {example}
                </Button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};