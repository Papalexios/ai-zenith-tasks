import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    }));
    setShowConsent(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    }));
    setShowConsent(false);
  };

  const openPreferences = () => {
    setShowPreferences(true);
  };

  if (!showConsent && !showPreferences) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">We use cookies to enhance your experience</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies and similar technologies to provide essential features, analyze usage, 
                  and improve our services. By clicking "Accept All", you consent to our use of cookies. 
                  You can manage your preferences at any time.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button onClick={acceptAll} size="sm">
                  Accept All Cookies
                </Button>
                <Button onClick={acceptNecessary} variant="outline" size="sm">
                  Accept Necessary Only
                </Button>
                <Button onClick={openPreferences} variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Customize
                </Button>
                <Link to="/privacy" className="text-sm text-primary hover:underline self-center">
                  Learn More
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConsent(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;