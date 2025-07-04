import { motion } from 'framer-motion';
import { Brain, Zap, Target, TrendingUp, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Cypher Alpha Intelligence',
    description: 'Break down complex projects into actionable subtasks with dependencies and time estimates.',
    gradient: 'from-primary to-primary-glow',
    stat: '15 subtasks average'
  },
  {
    icon: Zap,
    title: 'Natural Language Parsing',
    description: 'Just speak naturally. "Call mom tomorrow at 2pm" becomes a perfectly scheduled task.',
    gradient: 'from-secondary to-secondary-glow',
    stat: '99.7% accuracy'
  },
  {
    icon: Target,
    title: 'Smart Prioritization',
    description: 'AI analyzes deadlines, importance, and your energy levels to optimize your day.',
    gradient: 'from-accent to-accent-glow',
    stat: '40% more focus'
  },
  {
    icon: TrendingUp,
    title: 'Productivity Analytics',
    description: 'Gemini 2.5 Pro reveals patterns and provides insights to boost your productivity.',
    gradient: 'from-primary to-secondary',
    stat: '2.5x faster completion'
  },
  {
    icon: Users,
    title: 'AI Productivity Coach',
    description: 'Get personalized advice and motivation from your AI coach throughout the day.',
    gradient: 'from-secondary to-accent',
    stat: '89% stay motivated'
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your data is encrypted and processed securely. We never share your personal information.',
    gradient: 'from-accent to-primary',
    stat: 'Bank-level security'
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    viewport={{ once: true }}
    className="feature-card group relative overflow-hidden"
  >
    {/* Background gradient */}
    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    
    {/* Icon */}
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <feature.icon className="h-6 w-6 text-white" />
    </div>
    
    {/* Content */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
          {feature.stat}
        </span>
      </div>
      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
    </div>
    
    {/* Hover effect */}
    <motion.div
      className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    />
  </motion.div>
);

export function FeaturesSection() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container-width">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">
            5 AI Models, <span className="gradient-text">Infinite Possibilities</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Each AI model specializes in different aspects of productivity, working together to create 
            the ultimate task management experience.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Join 50,000+ users who've completed 2.5M tasks with AI
          </div>
        </motion.div>
      </div>
    </section>
  );
}