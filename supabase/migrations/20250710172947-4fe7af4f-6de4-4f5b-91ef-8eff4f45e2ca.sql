-- Fix subscription status for your account
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'premium',
  subscription_end = now() + INTERVAL '1 year',
  is_trial_active = false,
  updated_at = now()
WHERE email = 'papalexios@gmail.com';