import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  List, 
  Calendar, 
  BarChart3, 
  Layout 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'list' | 'kanban' | 'calendar' | 'analytics';
  onViewChange: (view: 'list' | 'kanban' | 'calendar' | 'analytics') => void;
  onAddTask: () => void;
  taskCount?: number;
}

export function MobileBottomNav({ 
  activeView, 
  onViewChange, 
  onAddTask,
  taskCount = 0 
}: MobileBottomNavProps) {
  const navItems = [
    { id: 'list', icon: List, label: 'Tasks', badge: taskCount },
    { id: 'kanban', icon: Layout, label: 'Board' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'analytics', icon: BarChart3, label: 'Stats' }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="glass-card border-t backdrop-blur-xl bg-background/95 rounded-t-2xl shadow-2xl">
        <div className="px-4 py-3 pb-4">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onViewChange(item.id as any)}
                className={`flex flex-col gap-1 h-14 relative transition-all duration-300 rounded-xl ${
                  activeView === item.id
                    ? 'text-primary bg-primary/10 hover:bg-primary/15'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <div className="relative">
                  <item.icon className="h-4 w-4" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[10px] bg-primary text-primary-foreground border-0 rounded-full flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                {activeView === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            ))}
            
            {/* Floating Add Button - Enhanced */}
            <div className="flex justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  onClick={onAddTask}
                  size="sm"
                  className="h-12 w-12 rounded-full bg-gradient-primary shadow-glow-primary hover:shadow-glow-primary/80 border-0 text-white relative"
                >
                  <Plus className="h-5 w-5" />
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 animate-pulse" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}