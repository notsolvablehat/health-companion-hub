import { API_BASE_URL, TOKEN_KEY, TOKEN_EXPIRY_KEY } from '@/lib/constants';

// Types
interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

// Token management
export const tokenManager = {
  get: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    if (Date.now() > parseInt(expiry, 10)) {
      tokenManager.clear();
      return null;
    }
    
    return token;
  },
  
  set: (token: string, expiresInMs: number = 24 * 60 * 60 * 1000): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInMs));
  },
  
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },
  
  isValid: (): boolean => {
    return tokenManager.get() !== null;
  }
};

// Build URL with query params
function buildUrl(endpoint: string, params?: RequestConfig['params']): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// Error helpers
function createApiError(message: string, status: number, details?: Record<string, string[]>): ApiError {
  return { message, status, details };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}

// Main request function
async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data?: unknown,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { headers = {}, params, skipAuth = false } = config;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  if (!skipAuth) {
    const token = tokenManager.get();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const options: RequestInit = {
    method,
    headers: requestHeaders,
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(buildUrl(endpoint, params), options);
    
    if (response.status === 401) {
      tokenManager.clear();
      window.location.href = '/login';
      throw createApiError('Session expired. Please login again.', 401);
    }
    
    if (response.status === 204) {
      return { data: null as T, status: 204, ok: true };
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw createApiError(
        responseData.detail || responseData.message || 'An error occurred',
        response.status,
        responseData.errors
      );
    }
    
    return {
      data: responseData as T,
      status: response.status,
      ok: true,
    };
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw createApiError('Network error. Please check your connection.', 0);
    }
    
    throw createApiError('An unexpected error occurred.', 500);
  }
}

// FormData request (for file uploads - multipart/form-data)
async function requestFormData<T>(
  endpoint: string,
  formData: FormData,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { params, skipAuth = false } = config;

  const requestHeaders: Record<string, string> = {};
  // Do NOT set Content-Type — browser will set it with boundary for multipart/form-data

  if (!skipAuth) {
    const token = tokenManager.get();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    });

    if (response.status === 401) {
      tokenManager.clear();
      window.location.href = '/login';
      throw createApiError('Session expired. Please login again.', 401);
    }

    if (response.status === 204) {
      return { data: null as T, status: 204, ok: true };
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw createApiError(
        responseData.detail || responseData.message || 'An error occurred',
        response.status,
        responseData.errors
      );
    }

    return {
      data: responseData as T,
      status: response.status,
      ok: true,
    };
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw createApiError('Network error. Please check your connection.', 0);
    }

    throw createApiError('An unexpected error occurred.', 500);
  }
}

// HTTP method shortcuts
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) => 
    request<T>('GET', endpoint, undefined, config),
    
  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => 
    request<T>('POST', endpoint, data, config),
    
  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => 
    request<T>('PUT', endpoint, data, config),
    
  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => 
    request<T>('PATCH', endpoint, data, config),
    
  delete: <T>(endpoint: string, config?: RequestConfig) => 
    request<T>('DELETE', endpoint, undefined, config),

  postFormData: <T>(endpoint: string, formData: FormData, config?: RequestConfig) =>
    requestFormData<T>(endpoint, formData, config),
};

export default api;
