import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingContextType {
  isFirstVisit: boolean;
  showDemo: boolean;
  hasCompletedDemo: boolean;
  startDemo: () => void;
  completeDemo: () => void;
  skipDemo: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('app-visited');
    const demoCompleted = localStorage.getItem('demo-completed');
    
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowDemo(true);
      localStorage.setItem('app-visited', 'true');
    }
    
    if (demoCompleted === 'true') {
      setHasCompletedDemo(true);
    }
  }, []);

  const startDemo = () => {
    setShowDemo(true);
  };

  const completeDemo = () => {
    setShowDemo(false);
    setHasCompletedDemo(true);
    localStorage.setItem('demo-completed', 'true');
  };

  const skipDemo = () => {
    setShowDemo(false);
    localStorage.setItem('demo-completed', 'true');
  };

  return (
    <OnboardingContext.Provider
      value={{
        isFirstVisit,
        showDemo,
        hasCompletedDemo,
        startDemo,
        completeDemo,
        skipDemo,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};