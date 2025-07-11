import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Brain } from 'lucide-react';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { EmptyPlanState } from './daily-plan/EmptyPlanState';
import { LoadingState } from './daily-plan/LoadingState';
import { PlanOverview } from './daily-plan/PlanOverview';
import { TimeBlocksList } from './daily-plan/TimeBlocksList';
import { PlanInsights } from './daily-plan/PlanInsights';
import { PlanActions } from './daily-plan/PlanActions';

interface DailyPlanModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DailyPlanModal({ children, open, onOpenChange }: DailyPlanModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const {
    currentPlan,
    isGenerating,
    isEditing,
    editedTimeBlocks,
    isSyncing,
    handleGeneratePlan,
    handleDragEnd,
    handleSaveChanges,
    handleCancelEdit,
    startEditing,
    handleSyncToCalendar,
    getPriorityColor
  } = useDailyPlan();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Generated Daily Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!currentPlan && !isGenerating && (
            <EmptyPlanState onGeneratePlan={handleGeneratePlan} />
          )}

          {isGenerating && <LoadingState />}

          {currentPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PlanOverview plan={currentPlan} />
              
              <TimeBlocksList
                plan={currentPlan}
                isEditing={isEditing}
                editedTimeBlocks={editedTimeBlocks}
                getPriorityColor={getPriorityColor}
                onStartEditing={startEditing}
                onSaveChanges={handleSaveChanges}
                onCancelEdit={handleCancelEdit}
                onDragEnd={handleDragEnd}
              />

              <PlanInsights plan={currentPlan} />

              <PlanActions
                isSyncing={isSyncing}
                onGeneratePlan={handleGeneratePlan}
                onSyncToCalendar={handleSyncToCalendar}
                onClose={() => setIsOpen(false)}
              />
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}