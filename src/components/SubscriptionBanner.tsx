import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, Calendar, Zap, CreditCard } from 'lucide-react';

export const SubscriptionBanner = () => {
  const { subscription, session, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!subscription) return null;

  const { subscribed, trial_active, trial_end, has_access } = subscription;

  const handleUpgrade = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast.error('Failed to create checkout session');
        return;
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) {
      toast.error('Please log in to manage your subscription');
      return;
    }
    
    console.log('🔧 Starting subscription management...');
    setIsLoading(true);
    
    try {
      console.log('📞 Calling customer-portal function...');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('📋 Customer portal response:', { data, error });

      if (error) {
        console.error('❌ Customer portal error:', error);
        toast.error(`Failed to open customer portal: ${error.message || 'Unknown error'}`);
        return;
      }

      if (!data?.url) {
        console.error('❌ No URL returned from customer portal');
        toast.error('No customer portal URL received');
        return;
      }

      console.log('✅ Opening customer portal:', data.url);
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
      toast.success('Opening customer portal...');
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const trialDaysLeft = trial_end ? Math.max(0, Math.ceil((new Date(trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  if (subscribed) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-primary">Pro Subscriber</p>
                <p className="text-sm text-muted-foreground">
                  Enjoying unlimited AI features
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trial_active && trialDaysLeft > 0) {
    return (
      <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  Free Trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left
                </p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for $11.99/month
                </p>
              </div>
            </div>
            <Button 
              variant="hero" 
              size="sm" 
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!has_access) {
    return (
      <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  Trial Expired
                </p>
                <p className="text-sm text-muted-foreground">
                  Subscribe to continue using AI features
                </p>
              </div>
            </div>
            <Button 
              variant="hero" 
              size="sm" 
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              <Crown className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};