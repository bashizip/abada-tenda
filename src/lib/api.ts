import { TEST_USER, TEST_GROUPS } from './auth';

const API_BASE_URL = 'http://localhost:5601/abada/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export type TaskStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'FAILED';

export interface TaskDetailsDto {
  id: string;
  name: string;
  assignee?: string;
  status: TaskStatus;
  candidateGroups?: string[];
  processInstanceId: string;
  variables?: Record<string, any>;
  startDate?: string;
  endDate?: string;
}

export interface ProcessInstanceDTO {
  id: string;
  currentActivityId: string;
  variables: Record<string, any>;
  isCompleted: boolean;
  startDate: string;
  endDate?: string;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  documentation?: string;
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User': TEST_USER,
      'X-Groups': TEST_GROUPS,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const defaultHeaders = this.getAuthHeaders();
      const customHeaders = options.headers || {};

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...customHeaders,
        },
      });

      if (response.ok) {
        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
          return { data: undefined, status: response.status };
        }
        const data = await response.json();
        return { data, status: response.status };
      }

      // Handle error responses
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Not a JSON error response, or empty body. Use default message.
      }
      return { status: response.status, error: errorMessage };

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
  }): Promise<ApiResponse<TaskDetailsDto[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    const queryString = queryParams.toString();

    return this.request(`/v1/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id: string): Promise<ApiResponse<TaskDetailsDto>> {
    return this.request(`/v1/tasks/${id}`);
  }

  async claimTask(taskId: string): Promise<ApiResponse<{ status: string; taskId: string }>> {
    return this.request(`/v1/tasks/claim?taskId=${encodeURIComponent(taskId)}`, { method: 'POST' });
  }

  async completeTask(taskId: string, variables?: Record<string, any>): Promise<ApiResponse<{ status: string; taskId: string }>> {
    const endpoint = `/v1/tasks/complete?taskId=${encodeURIComponent(taskId)}`;
    return this.request(endpoint, {
      method: 'POST',
      body: variables ? JSON.stringify(variables) : undefined,
    });
  }

  async failTask(taskId: string): Promise<ApiResponse<{ status: string; taskId: string }>> {
    const endpoint = `/v1/tasks/fail?taskId=${encodeURIComponent(taskId)}`;
    return this.request(endpoint, { method: 'POST' });
  }

  // Process endpoints
  async getProcessDefinitions(): Promise<ApiResponse<ProcessDefinition[]>> {
    return this.request('/v1/processes');
  }

  async getProcessInstances(): Promise<ApiResponse<ProcessInstanceDTO[]>> {
    return this.request('/v1/processes/instances');
  }

  async startProcess(processId: string, variables?: Record<string, any>): Promise<ApiResponse<{ processInstanceId: string }>> {
    const endpoint = `/v1/processes/start?processId=${encodeURIComponent(processId)}`;
    return this.request(endpoint, {
      method: 'POST',
      body: variables ? JSON.stringify(variables) : undefined,
    });
  }

  async failProcessInstance(instanceId: string): Promise<ApiResponse<{ status: string; processInstanceId: string }>> {
    const endpoint = `/v1/processes/instance/${encodeURIComponent(instanceId)}/fail`;
    return this.request(endpoint, { method: 'POST' });
  }

  async deployProcess(file: File): Promise<ApiResponse<{ status: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.getAuthHeaders();
    delete (headers as any)['Content-Type']; // Let the browser set the Content-Type for FormData

    return this.request('/v1/processes/deploy', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }
}

export const apiClient = new ApiClient();
