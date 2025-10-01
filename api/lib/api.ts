// API client para autenticação
const API_BASE = '/api';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

// Helper para fazer requests com token
async function apiRequest<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro de conexão' })) as { error?: string };
      return { success: false, error: errorData.error || 'Erro desconhecido' };
    }

    const data = await response.json() as ApiResponse<T>;
    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    return { success: false, error: 'Erro de conexão com o servidor' };
  }
}

// Funções de autenticação
export const authApi = {
  async login(data: LoginData): Promise<ApiResponse> {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  async getCurrentUser(): Promise<ApiResponse> {
    return apiRequest('/auth/me');
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

// Token utilities (apenas para verificação no frontend)
export function getTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = getTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  
  return Date.now() >= payload.exp * 1000;
}