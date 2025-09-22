import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient, ProcessDefinition } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Processes() {
  const [processes, setProcesses] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [variables, setVariables] = useState('');
  const [startingProcess, setStartingProcess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProcessDefinitions();
      if (response.data) {
        setProcesses(response.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch processes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcess = async () => {
    if (!selectedProcess) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a process to start",
      });
      return;
    }

    setStartingProcess(true);
    try {
      let parsedVariables = {};
      if (variables.trim()) {
        parsedVariables = JSON.parse(variables);
      }

      const response = await apiClient.startProcess(selectedProcess, parsedVariables);
      if (response.data) {
        toast({
          title: "Process started",
          description: `Process instance created successfully`,
        });
        setSelectedProcess('');
        setVariables('');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start process",
        });
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "Please check the variables format",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start process",
        });
      }
    } finally {
      setStartingProcess(false);
    }
  };

  const mockProcesses = [
    {
      id: 'onboarding-v1',
      key: 'onboarding',
      name: 'Onboarding',
      version: '1.0',
      description: 'New employee onboarding process.',
    },
    {
      id: 'expense-report-v2',
      key: 'expenseReport',
      name: 'Expense Report',
      version: '2.1',
      description: 'Expense report submission and approval.',
    },
    {
      id: 'vacation-request-v1',
      key: 'vacationRequest',
      name: 'Vacation Request',
      version: '1.5',
      description: 'Employee vacation request process.',
    },
    {
      id: 'incident-report-v1',
      key: 'incidentReport',
      name: 'Incident Report',
      version: '1.2',
      description: 'IT incident reporting and resolution.',
    },
    {
      id: 'customer-feedback-v1',
      key: 'customerFeedback',
      name: 'Customer Feedback',
      version: '1.0',
      description: 'Collect and analyze customer feedback.',
    },
    {
      id: 'hardware-request-v1',
      key: 'hardwareRequest',
      name: 'Hardware Request',
      version: '1.1',
      description: 'Request new hardware for employees.',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Process List</h1>
            <p className="text-muted-foreground mt-1">Browse and start available processes.</p>
          </div>
          <Link to="/processes/upload">
            <Button className="bg-accent hover:bg-accent/90">
              <Upload className="mr-2 h-4 w-4" />
              Launch Process
            </Button>
          </Link>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockProcesses.map((process) => (
            <Card key={process.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{process.name}</CardTitle>
                  <Badge variant="outline">{process.version}</Badge>
                </div>
                <CardDescription>{process.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-info text-info hover:bg-info hover:text-info-foreground"
                  onClick={() => setSelectedProcess(process.key)}
                >
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Start Process Form */}
        <Card>
          <CardHeader>
            <CardTitle>Start a New Process Instance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="process-select">Select Process</Label>
              <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                <SelectTrigger id="process-select">
                  <SelectValue placeholder="Choose a process to start..." />
                </SelectTrigger>
                <SelectContent>
                  {mockProcesses.map((process) => (
                    <SelectItem key={process.key} value={process.key}>
                      {process.name} (v{process.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variables">Initial Variables (JSON format)</Label>
              <Textarea
                id="variables"
                placeholder='{ "employeeName": "John Doe", "department": "Engineering" }'
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Provide initial data for the process if required.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleStartProcess}
                disabled={startingProcess || !selectedProcess}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" />
                {startingProcess ? 'Starting...' : 'Start Process'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}