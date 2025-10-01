import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi, type User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (nome: string, email: string, telefone: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const response = await authApi.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            authApi.logout();
          }
        }
      } catch {
        authApi.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, senha });
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Erro no login' };
    } catch {
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, telefone: string, senha: string) => {
    try {
      setLoading(true);
      const response = await authApi.register({ nome, email, telefone, senha });
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Erro no cadastro' };
    } catch {
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.isAdmin === true || user?.id === '1';
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}