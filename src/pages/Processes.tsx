import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
      } else {
        setProcesses([]);
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
          description: response.error || "Failed to start process",
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
      setIsConfirmOpen(false);
    }
  };

  const handleOpenConfirmDialog = (processId: string) => {
    setSelectedProcess(processId);
    setIsConfirmOpen(true);
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Process List</h1>
            <p className="text-sm text-muted-foreground mt-1">Browse and start available processes.</p>
          </div>
          <Link to="/processes/upload">
            <Button className="bg-accent hover:bg-accent/90">
              <Upload className="mr-2 h-4 w-4" />
              Launch Process
            </Button>
          </Link>
        </div>

        {/* Process Grid */}
        {loading ? (
          <div className="text-center p-8">Loading processes...</div>
        ) : processes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {processes.map((process) => (
              <Card key={process.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{process.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground pt-2">{process.documentation || 'No documentation available.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-info text-info hover:bg-info hover:text-info-foreground text-sm font-medium"
                    onClick={() => handleOpenConfirmDialog(process.id)}
                  >
                    Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md">
            <h3 className="text-lg font-semibold">No Processes Found</h3>
            <p className="text-muted-foreground">There are no available processes to display.</p>
          </div>
        )}

        {/* Start Process Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Start a New Process Instance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="process-select" className="text-sm font-medium">Select Process</Label>
              <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                <SelectTrigger id="process-select" className="text-sm">
                  <SelectValue placeholder="Choose a process to start..." />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((process) => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variables" className="text-sm font-medium">Initial Variables (JSON format)</Label>
              <Textarea
                id="variables"
                placeholder='{ "employeeName": "John Doe", "department": "Engineering" }'
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                rows={6}
                className="font-mono text-sm placeholder:text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Provide initial data for the process if required.
              </p>
            </div>

            <div className="flex justify-end">
               <Button
                onClick={() => setIsConfirmOpen(true)}
                disabled={startingProcess || !selectedProcess}
                className="bg-primary hover:bg-primary/90 text-sm font-semibold"
              >
                <Play className="mr-2 h-4 w-4" />
                {startingProcess ? 'Starting...' : 'Start Process'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will start a new instance of the process.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleStartProcess} disabled={startingProcess}>
              {startingProcess ? 'Starting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
