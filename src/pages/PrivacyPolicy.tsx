import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            use our services, or contact us for support.
          </p>
          
          <h3>Personal Information</h3>
          <ul>
            <li>Email address</li>
            <li>Account credentials</li>
            <li>Task and productivity data you create</li>
            <li>Usage and analytics data</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns to improve user experience</li>
          </ul>

          <h2>3. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
          </ul>

          <h2>6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and assist in our marketing efforts.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any 
            changes by posting the new policy on this page.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at{" "}
            <a href="mailto:privacy@aitaskmanagerpro.com" className="text-primary hover:underline">
              privacy@aitaskmanagerpro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;