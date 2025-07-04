import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Target, 
  Brain, 
  Zap,
  CheckCircle,
  Edit,
  Save,
  X,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DailyPlanModalProps {
  children: React.ReactNode;
}

// Sortable time block component
interface SortableTimeBlockProps {
  block: any;
  index: number;
  isEditing: boolean;
  getPriorityColor: (priority: string) => string;
}

function SortableTimeBlock({ block, index, isEditing, getPriorityColor }: SortableTimeBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id || `block-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 bg-muted/50 rounded-lg ${
        isEditing ? 'border-2 border-dashed border-primary/30' : ''
      }`}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className="text-sm font-mono text-muted-foreground min-w-[120px]">
        {block.startTime} - {block.endTime}
      </div>
      <div className="flex-1">
        <div className="font-medium">{block.task}</div>
        <div className="flex items-center gap-2 mt-1">
          {block.priority && (
            <Badge className={getPriorityColor(block.priority)}>
              {block.priority}
            </Badge>
          )}
          <Badge variant="outline">
            {block.energy} energy
          </Badge>
          <Badge variant="outline">
            {block.type?.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function DailyPlanModal({ children }: DailyPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTimeBlocks, setEditedTimeBlocks] = useState<any[]>([]);
  const { generateDailyPlan, dailyPlan, updateDailyPlan } = useTaskStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateDailyPlan();
      setPlan(generatedPlan);
      setEditedTimeBlocks(generatedPlan?.timeBlocks || []);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editedTimeBlocks.findIndex((block, index) => 
        (block.id || `block-${index}`) === active.id
      );
      const newIndex = editedTimeBlocks.findIndex((block, index) => 
        (block.id || `block-${index}`) === over.id
      );

      setEditedTimeBlocks(arrayMove(editedTimeBlocks, oldIndex, newIndex));
    }
  };

  const handleSaveChanges = () => {
    const updatedPlan = {
      ...currentPlan,
      timeBlocks: editedTimeBlocks
    };
    
    if (updateDailyPlan) {
      updateDailyPlan(updatedPlan);
    }
    setPlan(updatedPlan);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTimeBlocks(currentPlan?.timeBlocks || []);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedTimeBlocks(currentPlan?.timeBlocks || []);
    setIsEditing(true);
  };

  // Use existing plan from store if available
  const currentPlan = plan || dailyPlan;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Generated Daily Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!currentPlan && !isGenerating && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Let AI create the perfect daily plan based on your tasks
              </p>
              <Button onClick={handleGeneratePlan} variant="glow">
                <Zap className="mr-2 h-4 w-4" />
                Generate AI Plan
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                AI is analyzing your tasks and creating the optimal schedule...
              </p>
            </div>
          )}

          {currentPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Plan Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Focus Time</div>
                    <div className="font-semibold">{currentPlan.totalFocusTime || '6 hours'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-6 w-6 text-accent mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Tasks Planned</div>
                    <div className="font-semibold">{currentPlan.timeBlocks?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-secondary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Productivity Score</div>
                    <div className="font-semibold">{currentPlan.productivityScore || 85}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Blocks */}
              {currentPlan.timeBlocks && currentPlan.timeBlocks.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Your Optimized Schedule</CardTitle>
                      {!isEditing ? (
                        <Button onClick={startEditing} size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Plan
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={handleSaveChanges} size="sm" variant="default">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={handleCancelEdit} size="sm" variant="ghost">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-sm text-muted-foreground">
                        Drag and drop tasks to reorder your schedule
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={editedTimeBlocks.map((block, index) => block.id || `block-${index}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {editedTimeBlocks.map((block: any, index: number) => (
                              <SortableTimeBlock
                                key={block.id || `block-${index}`}
                                block={block}
                                index={index}
                                isEditing={isEditing}
                                getPriorityColor={getPriorityColor}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="space-y-3">
                        {currentPlan.timeBlocks.map((block: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="text-sm font-mono text-muted-foreground min-w-[120px]">
                              {block.startTime} - {block.endTime}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{block.task}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {block.priority && (
                                  <Badge className={getPriorityColor(block.priority)}>
                                    {block.priority}
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {block.energy} energy
                                </Badge>
                                <Badge variant="outline">
                                  {block.type?.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Insights */}
              {currentPlan.insights && currentPlan.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentPlan.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {currentPlan.recommendations && currentPlan.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentPlan.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-accent mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button onClick={handleGeneratePlan} variant="outline">
                  Regenerate Plan
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Apply Schedule
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}