import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Helmet>
            <title>Terms of Service - AI Task Manager Pro</title>
            <meta name="description" content="Terms of Service for AI Task Manager Pro." />
            <link rel="canonical" href={(typeof window !== 'undefined' ? window.location.origin : '') + '/terms'} />
          </Helmet>
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using our AI Task Manager Pro service, you accept and agree to be bound 
            by the terms and provision of this agreement.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Our service provides AI-powered task management and productivity tools. We reserve the 
            right to modify, suspend, or discontinue the service at any time.
          </p>

          <h2>3. User Accounts</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Providing accurate and current information</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Attempt to gain unauthorized access to any portion of the service</li>
            <li>Upload malicious code or content</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2>5. Subscription and Payment</h2>
          <p>
            Subscription fees are billed in advance on a monthly basis. All fees are non-refundable 
            except as required by law. We reserve the right to change pricing with 30 days notice.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality remain the exclusive 
            property of our company and its licensors.
          </p>

          <h2>7. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs 
            your use of the service.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall our company be liable for any indirect, incidental, special, 
            consequential, or punitive damages.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service immediately, 
            without prior notice, for conduct that we believe violates these Terms.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of 
            material changes via email or through the service.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to{" "}
            <a href="mailto:legal@aitaskmanagerpro.com" className="text-primary hover:underline">
              legal@aitaskmanagerpro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;