import React from 'react';
import { Calendar, Plus, Zap, BarChart3, Target, Clock, AlertCircle, CheckCircle2, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/store/taskStore';

export const TaskFilters = () => {
  const { filter, setFilter, sortBy, setSortBy } = useTaskStore();

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Target },
    { value: 'pending', label: 'Active', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle2 },
    { value: 'today', label: 'Due Today', icon: Calendar }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'created', label: 'Created' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  return (
    <Card className="mb-6 border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log('Filter button clicked:', option.value, 'Current filter:', filter);
                  setFilter(option.value as any);
                }}
                className={`gap-2 transition-all ${
                  filter === option.value 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:bg-muted/80'
                }`}
              >
                <option.icon className="h-3 w-3" />
                {option.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};