const API_BASE_URL = 'http://localhost:8080/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface TaskDetailsDto {
  id: string;
  name: string;
  assignee?: string;
  candidateGroups?: string[];
  status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  processInstanceId: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  processVariables?: Record<string, any>;
  formVariables?: Record<string, any>;
  createdDate: string;
  lastModified: string;
}

export interface ProcessInstanceDTO {
  instanceId: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  currentActivityId?: string;
  variables: Record<string, any>;
  status: 'RUNNING' | 'COMPLETED' | 'SUSPENDED';
  startDate: string;
  endDate?: string;
  startUserId?: string;
}

export interface ProcessDefinition {
  id: string;
  key: string;
  name: string;
  version: number;
  description?: string;
  deploymentId: string;
  deploymentTime: string;
  resourceName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      const data = response.ok ? await response.json() : null;

      return {
        data,
        status: response.status,
        error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : undefined,
      };
    } catch (error) {
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Mock implementation for now
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          username: credentials.username,
          email: 'admin@tenda.com',
        },
      };
      return { data: mockResponse, status: 200 };
    }
    return { status: 401, error: 'Invalid credentials' };
  }

  // Task endpoints
  async getTasks(filters?: {
    status?: string;
    assignee?: string;
    dueBefore?: string;
  }): Promise<ApiResponse<TaskDetailsDto[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.assignee) queryParams.append('assignee', filters.assignee);
    if (filters?.dueBefore) queryParams.append('dueBefore', filters.dueBefore);

    // Mock data for now
    const mockTasks: TaskDetailsDto[] = [
      {
        id: '12345',
        name: 'Review Client Proposal',
        assignee: 'Sarah Lee',
        candidateGroups: ['Sales Team'],
        status: 'IN_PROGRESS',
        dueDate: '2024-03-15',
        processInstanceId: 'proc-001',
        processDefinitionId: 'client-review-1',
        processDefinitionKey: 'clientReview',
        processVariables: {
          clientName: 'Acme Corp',
          proposalValue: 50000,
        },
        createdDate: '2024-03-10',
        lastModified: '2024-03-12',
      },
      {
        id: '12346',
        name: 'Prepare Presentation Slides',
        assignee: 'David Chen',
        candidateGroups: ['Marketing Team'],
        status: 'COMPLETED',
        dueDate: '2024-03-20',
        processInstanceId: 'proc-002',
        processDefinitionId: 'presentation-1',
        processDefinitionKey: 'presentation',
        processVariables: {
          topic: 'Q1 Results',
          audience: 'Board Members',
        },
        createdDate: '2024-03-08',
        lastModified: '2024-03-15',
      },
      {
        id: '12347',
        name: 'Schedule Team Meeting',
        assignee: 'Emily Wong',
        candidateGroups: ['Management'],
        status: 'CREATED',
        dueDate: '2024-03-22',
        processInstanceId: 'proc-003',
        processDefinitionId: 'meeting-1',
        processDefinitionKey: 'teamMeeting',
        processVariables: {
          meetingType: 'Weekly Standup',
          duration: 60,
        },
        createdDate: '2024-03-12',
        lastModified: '2024-03-12',
      },
    ];

    return { data: mockTasks, status: 200 };
  }

  async getTask(id: string): Promise<ApiResponse<TaskDetailsDto>> {
    // Mock implementation
    const mockTask: TaskDetailsDto = {
      id: '12345',
      name: 'Review Document',
      assignee: 'Sarah Johnson',
      candidateGroups: ['Legal Team'],
      status: 'IN_PROGRESS',
      dueDate: '2024-03-25',
      processInstanceId: '67890',
      processDefinitionId: 'document-review-process',
      processDefinitionKey: 'documentReview',
      processVariables: {
        document_name: 'Project Proposal.pdf',
        reviewer: 'Sarah Johnson',
        deadline: '2024-03-15',
      },
      createdDate: '2024-03-10',
      lastModified: '2024-03-12',
    };

    return { data: mockTask, status: 200 };
  }

  async claimTask(id: string): Promise<ApiResponse<void>> {
    return this.request(`/v1/tasks/${id}/claim`, { method: 'POST' });
  }

  async completeTask(id: string, variables?: Record<string, any>): Promise<ApiResponse<void>> {
    return this.request(`/v1/tasks/${id}/complete`, {
      method: 'POST',
      body: variables ? JSON.stringify(variables) : undefined,
    });
  }

  // Process endpoints
  async getProcessDefinitions(): Promise<ApiResponse<ProcessDefinition[]>> {
    // Mock data
    const mockProcesses: ProcessDefinition[] = [
      {
        id: 'onboarding-v1',
        key: 'onboarding',
        name: 'Onboarding',
        version: 1,
        description: 'New employee onboarding process.',
        deploymentId: 'dep-001',
        deploymentTime: '2024-01-15T10:00:00Z',
        resourceName: 'onboarding.bpmn',
      },
      {
        id: 'expense-report-v2',
        key: 'expenseReport',
        name: 'Expense Report',
        version: 2,
        description: 'Expense report submission and approval.',
        deploymentId: 'dep-002',
        deploymentTime: '2024-02-01T14:30:00Z',
        resourceName: 'expense-report.bpmn',
      },
    ];

    return { data: mockProcesses, status: 200 };
  }

  async getProcessInstances(): Promise<ApiResponse<ProcessInstanceDTO[]>> {
    // Mock data
    const mockInstances: ProcessInstanceDTO[] = [
      {
        instanceId: 'inst-001',
        processDefinitionId: 'onboarding-v1',
        processDefinitionKey: 'onboarding',
        currentActivityId: 'task-review-documents',
        variables: {
          employeeName: 'John Doe',
          department: 'Engineering',
          startDate: '2024-04-01',
        },
        status: 'RUNNING',
        startDate: '2024-03-15T09:00:00Z',
        startUserId: 'hr-manager',
      },
    ];

    return { data: mockInstances, status: 200 };
  }

  async startProcess(processKey: string, variables?: Record<string, any>): Promise<ApiResponse<{ instanceId: string }>> {
    return this.request('/v1/processes/start', {
      method: 'POST',
      body: JSON.stringify({ processKey, variables }),
    });
  }

  async deployProcess(file: File): Promise<ApiResponse<{ deploymentId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/v1/processes/deploy', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
  }
}

export const apiClient = new ApiClient();