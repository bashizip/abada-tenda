import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar } from 'lucide-react';
import { apiClient, TaskDetailsDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const { toast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTasks();
      if (response.data) {
        setTasks(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tasks",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tasks",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Poll for updates every 15 seconds
    const interval = setInterval(fetchTasks, 15000);
    return () => clearInterval(interval);
  }, []);

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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const uniqueAssignees = [...new Set(tasks.map(task => task.assignee).filter(Boolean))];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage and track your assigned tasks</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="CREATED">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assignee: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Assignee: All</SelectItem>
                    {uniqueAssignees.map(assignee => (
                      <SelectItem key={assignee} value={assignee!}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Input
                  type="date"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">TASK NAME</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">ASSIGNEE</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">CANDIDATE GROUPS</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">DUE DATE</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        Loading tasks...
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {task.name}
                          </Link>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {task.assignee || '-'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {task.candidateGroups?.join(', ') || '-'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {task.dueDate || '-'}
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}