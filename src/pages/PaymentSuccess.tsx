import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsLoading(true);
        // Refresh subscription status to get the latest data
        await checkSubscription();
        
        // Small delay to ensure subscription status is updated
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("Error verifying payment status");
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [checkSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Helmet>
          <title>Payment Successful - AI Task Manager Pro</title>
          <meta name="description" content="Your subscription is active. Enjoy AI Task Manager Pro!" />
          <link rel="canonical" href={(typeof window !== 'undefined' ? window.location.origin : '') + '/payment-success'} />
        </Helmet>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Verifying your payment...</h2>
              <p className="text-muted-foreground">This may take a few moments.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Payment Verification Error</h2>
              <p className="text-muted-foreground">{error}</p>
              <Link to="/app">
                <Button>
                  Continue to App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Welcome to AI Task Manager Pro! Your subscription is now active and you have 
            access to all premium features.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Access unlimited AI-powered insights</li>
              <li>• Create unlimited tasks and projects</li>
              <li>• Use advanced analytics and reporting</li>
              <li>• Enjoy priority customer support</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Link to="/app">
              <Button className="w-full">
                Start Using AI Task Manager Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="outline" className="w-full">
                Need Help? Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;