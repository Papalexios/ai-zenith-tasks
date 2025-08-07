import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });
    
    // First try to find customer by email
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    logStep("Searched for customer by email", { email: user.email, found: customers.data.length });
    
    if (customers.data.length === 0) {
      // Try to find customer by checking the subscribers table for stripe_customer_id
      const { data: subscriberData, error: subscriberError } = await supabaseClient
        .from('subscribers')
        .select('stripe_customer_id')
        .eq('email', user.email)
        .single();
      
      logStep("Checked subscribers table", { subscriberData, subscriberError });
      
      if (subscriberData?.stripe_customer_id) {
        // Check if it's a test/manual customer ID
        if (subscriberData.stripe_customer_id === 'manual_test_customer' || 
            subscriberData.stripe_customer_id.startsWith('manual_')) {
          throw new Error(`Your subscription is set up for testing only. Please contact support to activate a real Stripe customer portal. Email: ${user.email}`);
        }
        
        // Try to retrieve the customer by ID
        try {
          const customer = await stripe.customers.retrieve(subscriberData.stripe_customer_id);
          customers = { data: [customer] };
          logStep("Found customer by ID from database", { customerId: subscriberData.stripe_customer_id });
        } catch (stripeError) {
          logStep("Failed to retrieve customer by ID", { error: stripeError.message });
          throw new Error(`Stripe customer ${subscriberData.stripe_customer_id} not found. Please contact support to resolve this subscription issue.`);
        }
      }
    }
    
    if (customers.data.length === 0) {
      throw new Error(`No Stripe customer found for email ${user.email}. Please contact support to resolve this subscription issue.`);
    }
    
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });
    
    logStep("Customer portal session created", { sessionId: portalSession.id });

    return new Response(JSON.stringify({ url: portalSession.url }), {
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