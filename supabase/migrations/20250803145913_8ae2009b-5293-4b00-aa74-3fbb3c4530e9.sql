-- Fix database security issues from linter
-- Set search_path for all functions to prevent security vulnerabilities

-- Update handle_new_user function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.subscribers (user_id, email, trial_start, trial_end, is_trial_active)
  VALUES (
    NEW.id,
    NEW.email,
    now(),
    now() + INTERVAL '5 days',
    true
  );
  
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update user_has_access function with secure search path
CREATE OR REPLACE FUNCTION public.user_has_access(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscribers 
    WHERE subscribers.user_id = user_has_access.user_id 
    AND (
      subscribed = true 
      OR (is_trial_active = true AND trial_end > now())
    )
  );
END;
$function$;

-- Add input validation function for tasks
CREATE OR REPLACE FUNCTION public.validate_task_input()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Validate title length and content
  IF NEW.title IS NULL OR length(trim(NEW.title)) < 1 THEN
    RAISE EXCEPTION 'Task title cannot be empty';
  END IF;
  
  IF length(NEW.title) > 500 THEN
    RAISE EXCEPTION 'Task title cannot exceed 500 characters';
  END IF;
  
  -- Validate priority values
  IF NEW.priority NOT IN ('low', 'medium', 'high', 'urgent') THEN
    NEW.priority = 'medium';
  END IF;
  
  -- Validate category values
  IF NEW.category NOT IN ('work', 'personal', 'health', 'learning', 'finance', 'creative', 'social', 'general') THEN
    NEW.category = 'general';
  END IF;
  
  -- Validate due dates
  IF NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Due date cannot be in the past';
  END IF;
  
  -- Clean and validate description
  IF NEW.description IS NOT NULL AND length(NEW.description) > 2000 THEN
    NEW.description = left(NEW.description, 2000);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add task validation trigger
DROP TRIGGER IF EXISTS validate_task_trigger ON public.tasks;
CREATE TRIGGER validate_task_trigger
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_input();

-- Add audit logging table for enterprise compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit logs (admin access only)
CREATE POLICY "Admin can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles 
  WHERE email LIKE '%@admin.%' OR email IN ('admin@example.com')
));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_created_at ON public.tasks(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_priority ON public.tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_due_date ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at ON public.audit_logs(user_id, created_at);