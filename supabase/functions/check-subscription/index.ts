import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check current trial status
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    let isTrialActive = false;
    let trialEnd = null;
    
    if (subscriber) {
      trialEnd = subscriber.trial_end;
      isTrialActive = subscriber.is_trial_active && new Date(subscriber.trial_end) > now;
      logStep("Found subscriber record", { 
        isTrialActive, 
        trialEnd: subscriber.trial_end,
        subscribed: subscriber.subscribed 
      });
    } else {
      // New user - create subscriber record with 5-day trial
      logStep("No subscriber record found, creating new trial");
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 5);
      
      await supabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email,
        trial_start: now.toISOString(),
        trial_end: trialEndDate.toISOString(),
        is_trial_active: true,
        subscribed: false,
        subscription_tier: 'free'
      });
      
      isTrialActive = true;
      trialEnd = trialEndDate.toISOString();
      logStep("Created new trial", { trialEnd });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      
      // Check if user has manually set subscription (for test accounts)
      const currentDbSub = subscriber?.subscribed || false;
      const currentDbTier = subscriber?.subscription_tier || 'free';
      const currentDbEnd = subscriber?.subscription_end;
      
      // If user has a manual subscription in DB, respect it
      if (currentDbSub && currentDbTier !== 'free') {
        logStep("Found manual subscription in DB (no Stripe customer), respecting it", { 
          tier: currentDbTier, 
          end: currentDbEnd 
        });
        
        const hasAccess = currentDbSub || isTrialActive;
        
        return new Response(JSON.stringify({
          subscribed: currentDbSub,
          subscription_tier: currentDbTier,
          subscription_end: currentDbEnd,
          trial_active: isTrialActive,
          trial_end: trialEnd,
          has_access: hasAccess
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // No manual subscription, update with trial status only
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        is_trial_active: isTrialActive,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        trial_active: isTrialActive,
        trial_end: trialEnd,
        has_access: isTrialActive
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check if user has manually set subscription (for test accounts)
    const currentDbSub = subscriber?.subscribed || false;
    const currentDbTier = subscriber?.subscription_tier || 'free';
    const currentDbEnd = subscriber?.subscription_end;
    
    // If user already has a manual subscription in DB, respect it
    if (currentDbSub && currentDbTier !== 'free') {
      logStep("Found manual subscription in DB, respecting it", { 
        tier: currentDbTier, 
        end: currentDbEnd 
      });
      
      const hasAccess = currentDbSub || isTrialActive;
      
      return new Response(JSON.stringify({
        subscribed: currentDbSub,
        subscription_tier: currentDbTier,
        subscription_end: currentDbEnd,
        trial_active: isTrialActive,
        trial_end: trialEnd,
        has_access: hasAccess
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
    }

    // Update subscriber record only if no manual subscription exists
    await supabaseClient.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: hasActiveSub ? 'pro' : 'free',
      subscription_end: subscriptionEnd,
      is_trial_active: hasActiveSub ? false : isTrialActive, // Disable trial if subscribed
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const hasAccess = hasActiveSub || isTrialActive;
    logStep("Updated subscription status", { 
      subscribed: hasActiveSub, 
      trialActive: isTrialActive,
      hasAccess 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: hasActiveSub ? 'pro' : 'free',
      subscription_end: subscriptionEnd,
      trial_active: isTrialActive,
      trial_end: trialEnd,
      has_access: hasAccess
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});