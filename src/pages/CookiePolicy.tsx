import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicy = () => {
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
          <h1 className="text-4xl font-bold text-foreground">Cookie Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          <h2>What Are Cookies</h2>
          <p>
            Cookies are small pieces of text sent by your web browser by a website you visit. 
            A cookie file is stored in your web browser and allows the Service or a third-party 
            to recognize you and make your next visit easier and the Service more useful to you.
          </p>

          <h2>How We Use Cookies</h2>
          <p>When you use and access our Service, we may place cookies on your device. We use cookies for the following purposes:</p>
          
          <h3>Essential Cookies</h3>
          <ul>
            <li>Authentication and security</li>
            <li>Remembering your login status</li>
            <li>Maintaining your session</li>
            <li>Security and fraud prevention</li>
          </ul>

          <h3>Analytics Cookies</h3>
          <ul>
            <li>Understanding how you use our website</li>
            <li>Analyzing website traffic and usage patterns</li>
            <li>Improving our services based on usage data</li>
            <li>Measuring the effectiveness of our marketing campaigns</li>
          </ul>

          <h3>Preference Cookies</h3>
          <ul>
            <li>Remembering your settings and preferences</li>
            <li>Personalizing your experience</li>
            <li>Storing your theme preferences (dark/light mode)</li>
          </ul>

          <h2>Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-party cookies to report 
            usage statistics of the Service and deliver advertisements on and through the Service.
          </p>

          <h3>Service Providers</h3>
          <ul>
            <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
            <li><strong>Stripe:</strong> For payment processing and subscription management</li>
            <li><strong>Supabase:</strong> For authentication and backend services</li>
          </ul>

          <h2>Managing Your Cookies</h2>
          <p>
            You can choose to delete or disable cookies through your browser settings. Please note 
            that disabling certain cookies may affect the functionality of our Service.
          </p>

          <h3>Browser Settings</h3>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
          </ul>

          <h2>Cookie Categories</h2>
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div>
              <h4 className="font-semibold">Strictly Necessary Cookies</h4>
              <p className="text-sm text-muted-foreground">
                These cookies are essential for the website to function and cannot be switched off.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Performance Cookies</h4>
              <p className="text-sm text-muted-foreground">
                These cookies allow us to count visits and traffic sources to measure performance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Functional Cookies</h4>
              <p className="text-sm text-muted-foreground">
                These cookies enable enhanced functionality and personalization.
              </p>
            </div>
          </div>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. Any changes will be posted on this 
            page with an updated revision date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Cookie Policy, please contact us at{" "}
            <a href="mailto:privacy@yourdomain.com" className="text-primary hover:underline">
              privacy@yourdomain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;