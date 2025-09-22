import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { apiClient, TaskDetailsDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchTask(id);
    }
  }, [id]);

  const fetchTask = async (taskId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.getTask(taskId);
      if (response.data) {
        setTask(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch task details",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch task details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!task) return;
    
    setActionLoading(true);
    try {
      const response = await apiClient.claimTask(task.id);
      if (response.status === 200) {
        toast({
          title: "Task claimed",
          description: "You have successfully claimed this task",
        });
        // Refresh task data
        fetchTask(task.id);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to claim task",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to claim task",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    
    setActionLoading(true);
    try {
      const response = await apiClient.completeTask(task.id);
      if (response.status === 200) {
        toast({
          title: "Task completed",
          description: "Task has been marked as completed",
        });
        navigate('/tasks');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to complete task",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete task",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: TaskDetailsDto['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'CREATED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: TaskDetailsDto['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'CREATED':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Task not found</p>
            <Button onClick={() => navigate('/tasks')} className="mt-4">
              Back to Tasks
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/tasks')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Task Details</h1>
              <p className="text-muted-foreground mt-1">
                View and manage the details of the selected task.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Task Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Task Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Task ID</p>
                <p className="font-medium text-foreground">#{task.id}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Task Name</p>
                <p className="font-medium text-foreground">{task.name}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(task.status)} className="mt-1">
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Assignee</p>
                <p className="font-medium text-foreground">{task.assignee || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Process Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Process Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Process ID</p>
                <p className="font-medium text-foreground">#{task.processInstanceId}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Process Name</p>
                <p className="font-medium text-foreground">Document Review Process</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Started By</p>
                <p className="font-medium text-foreground">Michael Chen</p>
              </div>
            </div>
          </div>

          {/* Variables */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Variables</h2>
            <div className="bg-slate-800 p-4 rounded-lg">
              <pre className="text-sm font-mono text-white overflow-x-auto">
                <code className="text-white">
                  {JSON.stringify(task.processVariables || {}, null, 2)}
                </code>
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClaim}
              disabled={actionLoading || task.status === 'COMPLETED'}
              className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600"
            >
              <Star className="mr-2 h-4 w-4" />
              Claim
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={actionLoading || task.status === 'COMPLETED'}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}