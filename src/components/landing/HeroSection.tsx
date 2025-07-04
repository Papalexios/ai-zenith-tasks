import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Brain, Target, Users } from 'lucide-react';
import heroImage from '@/assets/hero-ai-dashboard.jpg';

const AIModel = ({ name, icon: Icon, delay }: { name: string; icon: any; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex items-center gap-1.5 sm:gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 hover:shadow-glow transition-all duration-300"
  >
    <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
    <span className="text-xs sm:text-sm font-medium">{name}</span>
  </motion.div>
);

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [taskDemo, setTaskDemo] = useState('');
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoTasks = [
    "Launch new product next month",
    "Plan team retreat with budget constraints",
    "Learn React and build a portfolio",
    "Organize home office and increase productivity"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoTasks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setTaskDemo('');
      const text = demoTasks[currentDemo];
      let i = 0;
      const timer = setInterval(() => {
        setTaskDemo(text.slice(0, i));
        i++;
        if (i > text.length) {
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [currentDemo, isVisible]);

  const aiModels = [
    { name: 'Cypher Alpha', icon: Brain },
    { name: 'DeepSeek R1', icon: Zap },
    { name: 'Gemini 2.5 Pro', icon: Sparkles },
    { name: 'DeepSeek Chat', icon: Users },
    { name: 'Task Optimizer', icon: Target }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 25%),
                           radial-gradient(circle at 75% 75%, hsl(var(--secondary) / 0.1) 0%, transparent 25%),
                           radial-gradient(circle at 75% 25%, hsl(var(--accent) / 0.1) 0%, transparent 25%)`,
        }} />
      </div>

      <div className="container-width relative z-10 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            {/* Main headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight"
              >
                Transform Your{' '}
                <span className="gradient-text animate-gradient-shift">
                  Chaos Into Clarity
                </span>
                {' '}in 3 Seconds
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl"
              >
                Let 5 powerful AI models organize your life while you focus on what matters. 
                Experience 100000x productivity boost with intelligent task management.
              </motion.p>
            </div>

            {/* Live demo input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Live AI Demo
              </div>
              <div className="bg-input rounded-xl p-3 sm:p-4 min-h-[50px] sm:min-h-[60px] flex items-center">
                <span className="text-sm sm:text-lg">{taskDemo}</span>
                <div className="w-0.5 h-6 bg-primary ml-1 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">5 subtasks created</span>
                <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">Priority: High</span>
                <span className="bg-accent/10 text-accent px-2 py-1 rounded">Est: 2.5 hours</span>
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
            >
              <Link to="/app" className="w-full sm:w-auto">
                <Button size="lg" variant="hero" className="group w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8">
                  Start Free with AI
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8">
                See AI Demo (60s)
              </Button>
            </motion.div>

            {/* AI models showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="space-y-3"
            >
              <p className="text-xs sm:text-sm text-muted-foreground">Powered by 5 AI models working together:</p>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                {aiModels.map((model, index) => (
                  <AIModel
                    key={model.name}
                    name={model.name}
                    icon={model.icon}
                    delay={1.2 + index * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative ai-glow rounded-3xl overflow-hidden">
              <img
                src={heroImage}
                alt="AI Productivity Dashboard"
                className="w-full h-auto object-cover"
              />
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-glow text-sm font-medium"
              >
                ✨ AI Enhanced
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-1/4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl shadow-glow-secondary text-sm font-medium"
              >
                🚀 100000x Faster
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-primary rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}