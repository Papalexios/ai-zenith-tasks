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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-card border-t backdrop-blur-xl bg-background/95 rounded-t-3xl">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onViewChange(item.id as any)}
                className={`flex flex-col gap-1 h-16 relative transition-all duration-300 ${
                  activeView === item.id
                    ? 'text-primary bg-primary/10 hover:bg-primary/15'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-primary text-primary-foreground"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {activeView === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            ))}
            
            {/* Floating Add Button */}
            <div className="flex justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onAddTask}
                  size="sm"
                  className="h-14 w-14 rounded-full bg-gradient-primary shadow-glow-primary hover:shadow-glow-primary/80 border-0 text-white"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}