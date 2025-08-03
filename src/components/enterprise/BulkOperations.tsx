import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';
import { InputValidator } from '@/utils/validation';
import { logger } from '@/utils/logger';
import { 
  Download, 
  Upload, 
  FileDown, 
  FileUp, 
  AlertTriangle,
  CheckCircle,
  X,
  Database,
  Filter,
  Calendar
} from 'lucide-react';

interface BulkOperation {
  id: string;
  type: 'export' | 'import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

export function EnterpriseBulkOperations() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [importData, setImportData] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportFilter, setExportFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  const { toast } = useToast();
  const { tasks, addTask } = useTaskStore();

  // Enterprise Export Function
  const handleExport = async () => {
    const operationId = `export_${Date.now()}`;
    const newOperation: BulkOperation = {
      id: operationId,
      type: 'export',
      status: 'processing',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      errors: [],
      startTime: new Date()
    };

    setOperations(prev => [...prev, newOperation]);

    try {
      // Filter tasks based on selection
      let filteredTasks = tasks;
      if (exportFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
      } else if (exportFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
      }

      newOperation.totalItems = filteredTasks.length;

      let exportData: string;
      const timestamp = new Date().toISOString();
      
      if (exportFormat === 'json') {
        const exportObject = {
          metadata: {
            exportDate: timestamp,
            totalTasks: filteredTasks.length,
            filter: exportFilter,
            version: '1.0'
          },
          tasks: filteredTasks.map((task, index) => {
            // Update progress
            setOperations(prev => prev.map(op => 
              op.id === operationId 
                ? { ...op, processedItems: index + 1, progress: ((index + 1) / filteredTasks.length) * 100 }
                : op
            ));
            
            return {
              id: task.id,
              title: task.title,
              description: task.description,
              completed: task.completed,
              priority: task.priority,
              dueDate: task.dueDate,
              dueTime: task.dueTime,
              category: task.category,
              estimatedTime: task.estimatedTime,
              subtasks: task.subtasks,
              aiEnhanced: task.aiEnhanced,
              aiModelUsed: task.aiModelUsed,
              tags: task.tags,
              createdAt: task.createdAt
            };
          })
        };
        exportData = JSON.stringify(exportObject, null, 2);
      } else {
        // CSV Export
        const headers = [
          'ID', 'Title', 'Description', 'Completed', 'Priority', 'Due Date', 
          'Due Time', 'Category', 'Estimated Time', 'Subtasks', 'AI Enhanced', 
          'AI Model', 'Tags', 'Created At'
        ];
        
        const csvRows = [
          headers.join(','),
          ...filteredTasks.map((task, index) => {
            // Update progress
            setOperations(prev => prev.map(op => 
              op.id === operationId 
                ? { ...op, processedItems: index + 1, progress: ((index + 1) / filteredTasks.length) * 100 }
                : op
            ));
            
            return [
              task.id,
              `"${task.title.replace(/"/g, '""')}"`,
              `"${(task.description || '').replace(/"/g, '""')}"`,
              task.completed,
              task.priority,
              task.dueDate || '',
              task.dueTime || '',
              task.category,
              task.estimatedTime || '',
              `"${task.subtasks.join('; ').replace(/"/g, '""')}"`,
              task.aiEnhanced,
              task.aiModelUsed || '',
              `"${task.tags.join('; ').replace(/"/g, '""')}"`,
              task.createdAt
            ].join(',');
          })
        ];
        exportData = csvRows.join('\n');
      }

      // Create and download file
      const blob = new Blob([exportData], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks_export_${exportFilter}_${timestamp.split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Complete operation
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', progress: 100, endTime: new Date() }
          : op
      ));

      logger.info('Export completed successfully', { 
        operationId, 
        format: exportFormat, 
        filter: exportFilter,
        tasksExported: filteredTasks.length 
      });

      toast({
        title: "Export Completed",
        description: `Successfully exported ${filteredTasks.length} tasks as ${exportFormat.toUpperCase()}`,
      });

    } catch (error) {
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status: 'failed', 
              errors: [error instanceof Error ? error.message : 'Export failed'],
              endTime: new Date()
            }
          : op
      ));

      logger.error('Export failed', error);
      toast({
        title: "Export Failed",
        description: "Failed to export tasks. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Enterprise Import Function
  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste the task data to import",
        variant: "destructive"
      });
      return;
    }

    const operationId = `import_${Date.now()}`;
    const newOperation: BulkOperation = {
      id: operationId,
      type: 'import',
      status: 'processing',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      errors: [],
      startTime: new Date()
    };

    setOperations(prev => [...prev, newOperation]);

    try {
      let tasksToImport: any[];

      // Parse import data
      try {
        const parsed = JSON.parse(importData);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          tasksToImport = parsed.tasks;
        } else if (Array.isArray(parsed)) {
          tasksToImport = parsed;
        } else {
          throw new Error('Invalid format: Expected array of tasks or object with tasks property');
        }
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please check your data.');
      }

      // Validate all tasks using enterprise validation
      const validation = InputValidator.validateBulkTaskInput(tasksToImport);
      
      if (validation.errors.length > 0) {
        logger.warn('Import validation errors', { 
          operationId,
          errors: validation.errors,
          validCount: validation.valid.length,
          invalidCount: validation.invalid.length
        });
      }

      // Update operation with totals
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              totalItems: validation.valid.length,
              errors: validation.errors
            }
          : op
      ));

      // Import valid tasks
      let successCount = 0;
      for (let i = 0; i < validation.valid.length; i++) {
        const task = validation.valid[i];
        
        try {
          await addTask(task.title, false); // Import without AI enhancement for speed
          successCount++;
          
          // Update progress
          setOperations(prev => prev.map(op => 
            op.id === operationId 
              ? { 
                  ...op, 
                  processedItems: i + 1, 
                  progress: ((i + 1) / validation.valid.length) * 100 
                }
              : op
          ));

          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (taskError) {
          const errorMsg = `Failed to import task "${task.title}": ${taskError instanceof Error ? taskError.message : 'Unknown error'}`;
          setOperations(prev => prev.map(op => 
            op.id === operationId 
              ? { ...op, errors: [...op.errors, errorMsg] }
              : op
          ));
        }
      }

      // Complete operation
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', progress: 100, endTime: new Date() }
          : op
      ));

      logger.info('Import completed', { 
        operationId,
        totalAttempted: validation.valid.length,
        successCount,
        validationErrors: validation.errors.length
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${successCount} tasks${validation.errors.length > 0 ? ` (${validation.errors.length} validation warnings)` : ''}`,
      });

      setImportData('');

    } catch (error) {
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status: 'failed', 
              errors: [error instanceof Error ? error.message : 'Import failed'],
              endTime: new Date()
            }
          : op
      ));

      logger.error('Import failed', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import tasks",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: BulkOperation['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <X className="h-4 w-4 text-red-500" />;
      case 'processing': return <Database className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          Bulk Operations
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Enterprise Bulk Operations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Operation Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'export' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('export')}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Tasks
            </Button>
            <Button
              variant={activeTab === 'import' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('import')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Tasks
            </Button>
          </div>

          {/* Export Tab */}
          {activeTab === 'export' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Export Your Tasks
                </CardTitle>
                <CardDescription>
                  Export your tasks in JSON or CSV format for backup, analysis, or migration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select value={exportFormat} onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON (Structured Data)</SelectItem>
                        <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="export-filter">Tasks to Export</Label>
                    <Select value={exportFilter} onValueChange={(value: 'all' | 'completed' | 'pending') => setExportFilter(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tasks</SelectItem>
                        <SelectItem value="completed">Completed Only</SelectItem>
                        <SelectItem value="pending">Pending Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Ready to Export</p>
                    <p className="text-sm text-muted-foreground">
                      {exportFilter === 'all' ? tasks.length : 
                       exportFilter === 'completed' ? tasks.filter(t => t.completed).length :
                       tasks.filter(t => !t.completed).length} tasks will be exported
                    </p>
                  </div>
                  <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export {exportFormat.toUpperCase()}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Import Tasks
                </CardTitle>
                <CardDescription>
                  Import tasks from JSON data. Supports bulk validation and error reporting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-data">Task Data (JSON)</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='Paste your task data here in JSON format. Example:
[
  {
    "title": "Complete project proposal",
    "description": "Finalize the Q1 project proposal",
    "priority": "high",
    "category": "work",
    "dueDate": "2024-02-15"
  }
]'
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Import with Validation</p>
                    <p className="text-sm text-muted-foreground">
                      Tasks will be validated for security and format compliance
                    </p>
                  </div>
                  <Button 
                    onClick={handleImport} 
                    disabled={!importData.trim()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operations History */}
          {operations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operations.slice(-5).reverse().map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(operation.status)}
                        <div>
                          <p className="font-medium capitalize">
                            {operation.type} Operation
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {operation.status === 'completed' 
                              ? `${operation.processedItems}/${operation.totalItems} items processed`
                              : operation.status === 'processing'
                              ? `${operation.processedItems}/${operation.totalItems} (${operation.progress.toFixed(0)}%)`
                              : operation.status === 'failed'
                              ? `Failed after ${operation.processedItems} items`
                              : 'Pending...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          operation.status === 'completed' ? 'default' :
                          operation.status === 'failed' ? 'destructive' :
                          operation.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {operation.status}
                        </Badge>
                        {operation.errors.length > 0 && (
                          <p className="text-xs text-destructive mt-1">
                            {operation.errors.length} warning{operation.errors.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}