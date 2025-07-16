import { useEffect, useCallback } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useToast } from '@/hooks/use-toast';

export function useKeyboardShortcuts() {
  const { toast } = useToast();
  const { 
    addTask, 
    setFilter, 
    filter,
    tasks,
    deleteTask,
    toggleTask,
    generateDailyPlan
  } = useTaskStore();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
    
    // Command palette (Ctrl/Cmd + K)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const commandPalette = document.getElementById('command-palette-trigger');
      if (commandPalette) {
        commandPalette.click();
      }
      return;
    }

    // Quick add task (Ctrl/Cmd + Enter)
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && isInputField) {
      event.preventDefault();
      const inputValue = (target as HTMLInputElement).value;
      if (inputValue.trim()) {
        addTask(inputValue.trim(), true);
        (target as HTMLInputElement).value = '';
        toast({
          title: "Task Added",
          description: "Your task has been created with AI enhancement"
        });
      }
      return;
    }

    // Don't trigger shortcuts when typing
    if (isInputField) return;

    // Filter shortcuts
    switch (event.key) {
      case '1':
        event.preventDefault();
        setFilter('all');
        toast({ title: "Filter: All Tasks" });
        break;
      case '2':
        event.preventDefault();
        setFilter('pending');
        toast({ title: "Filter: Pending Tasks" });
        break;
      case '3':
        event.preventDefault();
        setFilter('completed');
        toast({ title: "Filter: Completed Tasks" });
        break;
      case '4':
        event.preventDefault();
        setFilter('today');
        toast({ title: "Filter: Today's Tasks" });
        break;
      case 'n':
        event.preventDefault();
        // Focus on task input
        const taskInput = document.querySelector('input[placeholder*="task"]') as HTMLInputElement;
        if (taskInput) {
          taskInput.focus();
          toast({ title: "Quick Add Mode", description: "Start typing your task" });
        }
        break;
      case 'p':
        event.preventDefault();
        generateDailyPlan();
        toast({ title: "Generating Daily Plan", description: "AI is creating your optimized schedule" });
        break;
      case 'j':
        event.preventDefault();
        // Navigate down through tasks
        navigateTasks('down');
        break;
      case 'k':
        event.preventDefault();
        // Navigate up through tasks
        navigateTasks('up');
        break;
      case 'x':
        event.preventDefault();
        // Toggle selected task
        toggleSelectedTask();
        break;
      case 'd':
        if (event.shiftKey) {
          event.preventDefault();
          // Delete selected task
          deleteSelectedTask();
        }
        break;
    }
  }, [addTask, setFilter, filter, tasks, deleteTask, toggleTask, generateDailyPlan]);

  // Task navigation
  const navigateTasks = useCallback((direction: 'up' | 'down') => {
    const taskCards = document.querySelectorAll('[data-task-id]');
    const currentFocused = document.querySelector('[data-task-focused="true"]');
    let nextIndex = 0;

    if (currentFocused) {
      const currentIndex = Array.from(taskCards).indexOf(currentFocused);
      nextIndex = direction === 'down' 
        ? Math.min(currentIndex + 1, taskCards.length - 1)
        : Math.max(currentIndex - 1, 0);
      
      // Remove focus from current
      currentFocused.removeAttribute('data-task-focused');
      currentFocused.classList.remove('ring-2', 'ring-primary');
    }

    // Add focus to next
    const nextTask = taskCards[nextIndex] as HTMLElement;
    if (nextTask) {
      nextTask.setAttribute('data-task-focused', 'true');
      nextTask.classList.add('ring-2', 'ring-primary');
      nextTask.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const toggleSelectedTask = useCallback(() => {
    const focusedTask = document.querySelector('[data-task-focused="true"]');
    if (focusedTask) {
      const taskId = focusedTask.getAttribute('data-task-id');
      if (taskId) {
        toggleTask(taskId);
        toast({ title: "Task Toggled" });
      }
    }
  }, [toggleTask]);

  const deleteSelectedTask = useCallback(() => {
    const focusedTask = document.querySelector('[data-task-focused="true"]');
    if (focusedTask) {
      const taskId = focusedTask.getAttribute('data-task-id');
      if (taskId) {
        deleteTask(taskId);
        toast({ title: "Task Deleted" });
      }
    }
  }, [deleteTask]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    // Expose any keyboard shortcut utilities if needed
    shortcuts: {
      'Ctrl/Cmd + K': 'Open command palette',
      'Ctrl/Cmd + Enter': 'Quick add task (when in input)',
      '1-4': 'Filter tasks',
      'N': 'New task (focus input)',
      'P': 'Generate daily plan',
      'J/K': 'Navigate tasks',
      'X': 'Toggle selected task',
      'Shift + D': 'Delete selected task'
    }
  };
}