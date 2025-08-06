import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentCanceled = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment was canceled. No charges were made to your account.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Still interested in upgrading?</h3>
            <p className="text-sm text-muted-foreground">
              You can try again anytime. Our AI Task Manager Pro includes unlimited 
              AI insights, advanced analytics, and priority support.
            </p>
          </div>

          <div className="space-y-2">
            <Link to="/app">
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Try Upgrading Again
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue with Free Plan
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Questions? <Link to="/support" className="text-primary hover:underline">Contact our support team</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;