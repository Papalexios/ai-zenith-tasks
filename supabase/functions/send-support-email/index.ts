import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUPPORT-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    const { name, email, subject, message } = await req.json();

    logStep("Processing support email", { name, email, subject });

    // Send email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "support@aitaskmanagerpro.com",
      to: ["support@aitaskmanagerpro.com"],
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
      `,
    });

    // Send confirmation email to user
    const confirmationEmailResponse = await resend.emails.send({
      from: "noreply@aitaskmanagerpro.com",
      to: [email],
      subject: "We received your message!",
      html: `
        <h2>Thank you for contacting AI Task Manager Pro!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message regarding: <strong>${subject}</strong></p>
        <p>Our support team will get back to you within 24 hours. In the meantime, you can check our <a href="https://aitaskmanagerpro.com/faq">FAQ page</a> for common questions.</p>
        <p>Best regards,<br>The AI Task Manager Pro Team</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated confirmation email. Please do not reply to this email.</p>
      `,
    });

    logStep("Emails sent successfully", { 
      supportId: supportEmailResponse.data?.id,
      confirmationId: confirmationEmailResponse.data?.id 
    });

    return new Response(JSON.stringify({ 
      success: true,
      supportEmailId: supportEmailResponse.data?.id,
      confirmationEmailId: confirmationEmailResponse.data?.id
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