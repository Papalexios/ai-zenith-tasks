-- Fix your subscription status again and prevent it from being overridden
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'premium',
  subscription_end = now() + INTERVAL '1 year',
  is_trial_active = false,
  stripe_customer_id = 'manual_test_customer',
  updated_at = now()
WHERE email = 'papalexios@gmail.com';