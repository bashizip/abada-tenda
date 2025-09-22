const API_BASE_URL = 'http://localhost:5601/abada/api';

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
  documentation?: string;
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
    const queryString = queryParams.toString();

    return this.request(`/v1/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id: string): Promise<ApiResponse<TaskDetailsDto>> {
    return this.request(`/v1/tasks/${id}`);
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
    return this.request('/v1/processes/definitions');
  }

  async getProcessInstances(): Promise<ApiResponse<ProcessInstanceDTO[]>> {
    return this.request('/v1/processes/instances');
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