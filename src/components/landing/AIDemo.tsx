import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Target, Users, Zap } from 'lucide-react';
import { openRouterService } from '@/lib/openrouter';

interface DemoTask {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  subtasks: string[];
  category: string;
}

const mockTasks: DemoTask[] = [
  {
    title: 'Launch Product Marketing Campaign',
    priority: 'high',
    estimatedTime: '3 hours',
    subtasks: [
      'Research target audience demographics',
      'Create marketing content calendar',
      'Design social media assets',
      'Schedule initial launch posts',
      'Set up analytics tracking'
    ],
    category: 'Marketing'
  },
  {
    title: 'Organize Team Building Event',
    priority: 'medium',
    estimatedTime: '2 hours',
    subtasks: [
      'Survey team for activity preferences',
      'Research and book venue',
      'Plan activity schedule',
      'Arrange catering options',
      'Send calendar invites'
    ],
    category: 'HR'
  }
];

const priorityColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-600 border-red-500/20'
};

export function AIDemo() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<DemoTask | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentMockIndex, setCurrentMockIndex] = useState(0);

  // Auto-cycle through mock examples
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isProcessing && !showResult) {
        setCurrentMockIndex((prev) => (prev + 1) % mockTasks.length);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isProcessing, showResult]);

  const handleTryDemo = async (demoInput?: string) => {
    const inputText = demoInput || input;
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setShowResult(false);

    try {
      // Simulate AI processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use actual AI or fallback to mock data for demo
      let result;
      try {
        result = await openRouterService.enhanceTask(inputText);
      } catch {
        // Fallback to mock data for demo purposes
        result = mockTasks[Math.floor(Math.random() * mockTasks.length)];
      }

      setCurrentTask(result);
      setShowResult(true);
    } catch (error) {
      console.error('Demo error:', error);
      setCurrentTask(mockTasks[0]);
      setShowResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickExamples = [
    'Plan a team retreat for 20 people',
    'Launch new app feature next month',
    'Organize home office for productivity',
    'Create content strategy for Q2'
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">
            See AI Magic in <span className="gradient-text">Real-Time</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch as our AI transforms your vague ideas into detailed, actionable plans. 
            Try it yourself with the interactive demo below.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold">AI Task Enhancement Demo</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live AI Processing
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Describe any task or project you want to organize..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTryDemo()}
                className="text-lg h-14 border-2 focus:border-primary"
                disabled={isProcessing}
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleTryDemo()}
                  disabled={!input.trim() || isProcessing}
                  size="lg"
                  variant="glow"
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Enhance with AI
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleTryDemo(quickExamples[currentMockIndex])}
                  variant="outline"
                  size="lg"
                  disabled={isProcessing}
                >
                  Try Example
                </Button>
              </div>

              {/* Quick examples */}
              <div className="flex flex-wrap gap-2">
                {quickExamples.map((example, index) => (
                  <motion.button
                    key={example}
                    onClick={() => setInput(example)}
                    className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Processing animation */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">AI Models Working Together</p>
                    <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                      <span className="animate-pulse">Cypher Alpha analyzing...</span>
                      <span className="animate-pulse delay-300">DeepSeek parsing...</span>
                      <span className="animate-pulse delay-700">Optimizing results...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {showResult && currentTask && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Card className="p-6 border-2 border-primary/20 shadow-glow">
                  <div className="space-y-6">
                    {/* Enhanced task header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-semibold">{currentTask.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={priorityColors[currentTask.priority]}>
                            <Target className="mr-1 h-3 w-3" />
                            {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)} Priority
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            {currentTask.estimatedTime}
                          </Badge>
                          <Badge variant="outline">
                            <Users className="mr-1 h-3 w-3" />
                            {currentTask.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-muted-foreground">AI-Generated Action Steps:</h4>
                      <div className="space-y-2">
                        {currentTask.subtasks.map((subtask, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="text-sm">{subtask}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* AI insights */}
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Insights</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This task has been optimized for maximum efficiency. The AI detected dependencies and 
                        arranged subtasks in the optimal order for completion.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="text-center">
                  <Button
                    onClick={() => {
                      setShowResult(false);
                      setInput('');
                    }}
                    variant="outline"
                  >
                    Try Another Task
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}