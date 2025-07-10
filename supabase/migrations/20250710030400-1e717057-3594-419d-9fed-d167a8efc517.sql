-- Update existing account to have active subscription
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'premium',
  subscription_end = now() + INTERVAL '1 year',
  updated_at = now()
WHERE email = 'papalexios@gmail.com';

-- Or create a new test account with subscription access
-- Replace 'test@example.com' with your preferred test email
INSERT INTO public.subscribers (
  email,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  trial_start,
  trial_end,
  is_trial_active,
  stripe_customer_id,
  created_at,
  updated_at
) VALUES (
  'test@example.com',
  gen_random_uuid(),
  true,
  'premium',
  now() + INTERVAL '1 year',
  now() - INTERVAL '10 days',
  now() - INTERVAL '5 days',
  false,
  'cus_test_' || generate_random_uuid(),
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = now();