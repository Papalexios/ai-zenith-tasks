import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqData = [
    {
      question: "What is AI Task Manager Pro?",
      answer: "AI Task Manager Pro is an intelligent productivity platform that helps you organize, prioritize, and complete tasks more efficiently using AI-powered insights and recommendations."
    },
    {
      question: "How much does it cost?",
      answer: "We offer a free plan with basic features and AI Task Manager Pro at $11.99/month for unlimited AI insights, advanced analytics, and priority support. All paid plans include a 5-day free trial."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time through your account settings or the billing portal. You'll continue to have access to Pro features until the end of your billing period."
    },
    {
      question: "What AI features are included?",
      answer: "Pro subscribers get unlimited AI-powered task insights, smart prioritization suggestions, productivity analytics, deadline predictions, and personalized productivity recommendations."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, secure cloud infrastructure, and follow industry best practices to protect your data. We never share your personal information with third parties."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export all your tasks and data at any time through your account settings. We support various formats including CSV and JSON."
    },
    {
      question: "Do you offer team/business plans?",
      answer: "Currently, we focus on individual productivity. Team and business features are in development and will be available soon. Contact support to be notified when they're ready."
    },
    {
      question: "What devices can I use?",
      answer: "Our app works on any device with a web browser - desktop, tablet, or mobile. We're optimized for all screen sizes and offer a native app-like experience."
    },
    {
      question: "How does the AI learn my preferences?",
      answer: "Our AI analyzes your task completion patterns, timing, and behavior to provide personalized recommendations. All analysis is done securely and privately within your account."
    },
    {
      question: "What if I need help?",
      answer: "Pro subscribers get priority email support with responses within 24 hours. Free users can access our help center and community forums. Contact us anytime at support@yourdomain.com."
    },
    {
      question: "Can I change my plan?",
      answer: "Yes, you can upgrade or downgrade your plan at any time through your account settings. Changes take effect immediately, and billing is prorated accordingly."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 5-day free trial so you can test all features risk-free. If you're not satisfied, contact support within 30 days for a full refund consideration."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-2">Find answers to common questions about AI Task Manager Pro</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link to="/support">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;