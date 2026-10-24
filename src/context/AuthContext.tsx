import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi, SESSAO_EXPIRADA, type User } from '../lib/api';
import { AuthContext, type AuthContextType } from './contextos';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão salva (e renova o token)
  useEffect(() => {
    const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        const response = await authApi.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        } else if (response.status === 401) {
          authApi.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Token expirado em qualquer chamada da API -> volta para visitante
  useEffect(() => {
    const onExpirada = () => setUser(null);
    window.addEventListener(SESSAO_EXPIRADA, onExpirada);
    return () => window.removeEventListener(SESSAO_EXPIRADA, onExpirada);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await authApi.login({ email, senha });
    if (response.success && response.user) {
      setUser(response.user);
      return { success: true, user: response.user };
    }
    return { success: false, error: response.error || 'Erro no login' };
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin: () => user?.isAdmin === true
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
