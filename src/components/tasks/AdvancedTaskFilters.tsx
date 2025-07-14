import React, { useState } from 'react';
import { Calendar, Plus, Zap, BarChart3, Target, Clock, AlertCircle, CheckCircle2, X, CalendarDays, Filter, Search, Tag, User, ArrowUpDown, Eye, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useTaskStore } from '@/store/taskStore';

export const AdvancedTaskFilters = () => {
  const { filter, setFilter, sortBy, setSortBy, tasks } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('');
  const [focusMode, setFocusMode] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Target, count: tasks.length },
    { value: 'pending', label: 'Active', icon: Clock, count: tasks.filter(t => !t.completed).length },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, count: tasks.filter(t => t.completed).length },
    { value: 'today', label: 'Due Today', icon: Calendar, count: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0] && !t.completed).length },
    { value: 'overdue', label: 'Overdue', icon: AlertCircle, count: tasks.filter(t => t.dueDate && t.dueDate < new Date().toISOString().split('T')[0] && !t.completed).length },
    { value: 'urgent', label: 'Urgent', icon: Zap, count: tasks.filter(t => t.priority === 'urgent').length }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: Calendar },
    { value: 'priority', label: 'Priority', icon: AlertCircle },
    { value: 'created', label: 'Date Created', icon: Plus },
    { value: 'alphabetical', label: 'Alphabetical', icon: ArrowUpDown },
    { value: 'category', label: 'Category', icon: Tag },
    { value: 'estimatedTime', label: 'Time Estimate', icon: Timer }
  ];

  // Extract unique categories, priorities, and tags from tasks
  const uniqueCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
  const uniquePriorities = ['urgent', 'high', 'medium', 'low'];
  const uniqueTags = [...new Set(tasks.flatMap(t => t.tags || []))];

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    // Focus mode will be handled in the parent component
    window.dispatchEvent(new CustomEvent('focusModeToggle', { detail: { enabled: !focusMode } }));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedPriorities([]);
    setSelectedTags([]);
    setDateRange('');
    setFilter('all');
    setSortBy('priority');
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategories.length > 0,
    selectedPriorities.length > 0,
    selectedTags.length > 0,
    dateRange,
    filter !== 'all'
  ].filter(Boolean).length;

  return (
    <Card className={`mb-6 border-0 shadow-sm transition-all duration-300 ${focusMode ? 'opacity-50 scale-95' : ''}`}>
      <CardContent className="p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, tags, or natural language queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 bg-background/50 border-muted/30 focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Primary Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value as any)}
                className={`gap-2 transition-all hover:scale-105 ${
                  filter === option.value 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:bg-muted/80'
                }`}
              >
                <option.icon className="h-3 w-3" />
                {option.label}
                <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={focusMode ? "default" : "outline"}
              size="sm"
              onClick={toggleFocusMode}
              className="gap-2"
            >
              <Eye className="h-3 w-3" />
              Focus Mode
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-3 w-3" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Tag className="h-3 w-3" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-2">
                  {uniqueCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <label htmlFor={`category-${category}`} className="text-sm font-medium">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Priority Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <AlertCircle className="h-3 w-3" />
                Priority
                {selectedPriorities.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                    {selectedPriorities.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                {uniquePriorities.map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={selectedPriorities.includes(priority)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPriorities([...selectedPriorities, priority]);
                        } else {
                          setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
                        }
                      }}
                    />
                    <label htmlFor={`priority-${priority}`} className="text-sm font-medium capitalize">
                      {priority}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Tags Filter */}
          {uniqueTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Tag className="h-3 w-3" />
                  Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniqueTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          }
                        }}
                      />
                      <label htmlFor={`tag-${tag}`} className="text-sm font-medium">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedCategories.length > 0 || selectedPriorities.length > 0 || selectedTags.length > 0 || searchQuery) && (
          <div className="mt-3 pt-3 border-t border-muted/30">
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="outline" className="gap-1">
                  <Search className="h-3 w-3" />
                  "{searchQuery}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedCategories.map(category => (
                <Badge key={category} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                  />
                </Badge>
              ))}
              {selectedPriorities.map(priority => (
                <Badge key={priority} variant="outline" className="gap-1 capitalize">
                  <AlertCircle className="h-3 w-3" />
                  {priority}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedPriorities(selectedPriorities.filter(p => p !== priority))}
                  />
                </Badge>
              ))}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};