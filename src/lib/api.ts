// Cliente HTTP único da aplicação
const API_BASE = '/api';
const TOKEN_KEY = 'authToken';

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export type ApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  status?: number;
  error?: string;
  message?: string;
} & Partial<T>;

// Disparado quando o servidor recusa o token (expirado/inválido)
export const SESSAO_EXPIRADA = 'auth:sessao-expirada';

function lerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function salvarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // navegação privada / armazenamento bloqueado: segue sem persistir
  }
}

export async function apiRequest<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = lerToken();

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({})) as ApiResponse<T>;

    if (!response.ok) {
      if (response.status === 401 && token) {
        salvarToken(null);
        window.dispatchEvent(new Event(SESSAO_EXPIRADA));
      }
      return { ...data, success: false, status: response.status, error: data.error || 'Erro desconhecido' };
    }

    return { ...data, status: response.status };
  } catch (error) {
    console.error('Erro na API:', error);
    return { success: false, error: 'Sem conexão com o servidor. Verifique sua internet.' } as ApiResponse<T>;
  }
}

export const authApi = {
  async login(data: LoginData) {
    const response = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.success && response.token) salvarToken(response.token);
    return response;
  },

  // Também renova o token, mantendo o convidado logado
  async getCurrentUser() {
    const response = await apiRequest<{ token: string; user: User }>('/auth/me');
    if (response.success && response.token) salvarToken(response.token);
    return response;
  },

  logout() {
    salvarToken(null);
  },

  isAuthenticated(): boolean {
    return !!lerToken();
  }
};
