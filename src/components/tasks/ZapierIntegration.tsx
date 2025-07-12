import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Zap, ExternalLink, Settings } from 'lucide-react';

interface ZapierIntegrationProps {
  onTaskCreated?: (taskData: any) => void;
}

export function ZapierIntegration({ onTaskCreated }: ZapierIntegrationProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTriggerZap = async (taskData: any) => {
    if (!webhookUrl) {
      toast({
        title: "Configuration Required",
        description: "Please enter your Zapier webhook URL first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          event: "task_created",
          task: taskData,
          timestamp: new Date().toISOString(),
          source: "ai-zenith-tasks",
        }),
      });

      toast({
        title: "Zapier Triggered",
        description: "Task data sent to your Zapier webhook successfully!",
      });

      onTaskCreated?.(taskData);
    } catch (error) {
      console.error("Zapier trigger error:", error);
      toast({
        title: "Integration Error",
        description: "Failed to trigger Zapier webhook. Please check your URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL Required",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    await handleTriggerZap({
      id: "test-task",
      title: "Test Task from AI Zenith",
      description: "This is a test task to verify your Zapier integration",
      priority: "medium",
      category: "test",
      completed: false,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Zapier Integration
          <Badge variant="secondary" className="ml-auto">
            Automation
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Webhook URL</label>
          <Input
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter your Zapier webhook URL to automatically send task data to other apps
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTestWebhook}
            disabled={isLoading || !webhookUrl}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Test Connection
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Setup Guide
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">How it works:</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a Zap in Zapier with a Webhook trigger</li>
            <li>Copy the webhook URL and paste it above</li>
            <li>Tasks created in AI Zenith will automatically trigger your Zap</li>
            <li>Connect to Slack, Trello, Notion, or 6000+ other apps</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}