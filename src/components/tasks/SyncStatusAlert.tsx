import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SyncStatusAlertProps {
  syncError: string | null;
  onClearError: () => void;
}

export const SyncStatusAlert = ({ syncError, onClearError }: SyncStatusAlertProps) => {
  return (
    <AnimatePresence>
      {syncError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{syncError}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearError}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};