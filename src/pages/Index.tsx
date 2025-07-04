import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AIDemo } from '@/components/landing/AIDemo';
import { ArrowRight, CheckCircle, Star, TrendingUp, Users, Zap } from 'lucide-react';

// Social Proof Section
const SocialProof = () => (
  <section className="section-padding border-t border-border">
    <div className="container-width px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center space-y-6 sm:space-y-8"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Trusted by <span className="gradient-text">50,000+ Productivity Enthusiasts</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[
            { icon: Users, number: '50,000+', label: 'Active Users' },
            { icon: CheckCircle, number: '2.5M+', label: 'Tasks Completed' },
            { icon: TrendingUp, number: '100000x', label: 'Productivity Boost' },
            { icon: Star, number: '4.9/5', label: 'User Rating' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-2 sm:space-y-3"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-2xl font-bold text-primary">{stat.number}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <blockquote className="text-sm sm:text-base lg:text-lg italic text-muted-foreground mb-4">
            "This AI task manager has completely transformed how I work. What used to take me hours of planning now happens in seconds. The AI suggestions are eerily accurate!"
          </blockquote>
          <div className="flex items-center gap-3 justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
              JD
            </div>
            <div className="text-left">
              <div className="font-medium text-sm sm:text-base">Jessica Davis</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Product Manager, TechCorp</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// Pricing Section
const Pricing = () => (
  <section className="section-padding bg-muted/20">
    <div className="container-width px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          Start Free, <span className="gradient-text">Scale with AI</span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Get access to all 5 AI models with our free tier. Upgrade when you're ready for unlimited AI power.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-2xl p-8 relative"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold">Free Forever</h3>
              <p className="text-muted-foreground">Perfect for getting started with AI productivity</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-4xl font-bold">$0</div>
              <div className="text-muted-foreground">Forever free</div>
            </div>

            <ul className="space-y-3">
              {[
                'All 5 AI models included',
                '100 AI enhancements/month',
                'Natural language parsing',
                'Smart prioritization',
                'Basic analytics'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth">
              <Button variant="outline" className="w-full" size="lg">
                Start Free Today
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-card border-2 border-primary rounded-2xl p-8 relative shadow-glow"
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold">AI Pro</h3>
              <p className="text-muted-foreground">Unlimited AI power for productivity maximalists</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-4xl font-bold">$12</div>
              <div className="text-muted-foreground">per month</div>
            </div>

            <ul className="space-y-3">
              {[
                'Everything in Free',
                'Unlimited AI enhancements',
                'Advanced team collaboration',
                'Custom AI training',
                'Priority support',
                'Advanced analytics dashboard'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth">
              <Button variant="hero" className="w-full" size="lg">
                <Zap className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// CTA Section
const FinalCTA = () => (
  <section className="section-padding bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
    <div className="container-width">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center space-y-8 max-w-4xl mx-auto"
      >
        <h2 className="text-4xl lg:text-6xl font-bold">
          Ready to Transform Your 
          <span className="gradient-text block">Productivity Forever?</span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of users who've already experienced the magic of AI-powered task management. 
          Your most productive life is just one click away.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="xl" variant="hero" className="group">
              Start Your AI Journey Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button size="xl" variant="outline">
            Schedule a Demo
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          ✅ No credit card required  ✅ 2-minute setup  ✅ Cancel anytime
        </div>
      </motion.div>
    </div>
  </section>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <AIDemo />
      <Pricing />
      <FinalCTA />
    </div>
  );
};

export default Index;
