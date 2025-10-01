import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

export const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, senha);
      } else {
        result = await register(nome, email, telefone, senha);
      }

      if (!result.success) {
        setError(result.error || 'Erro desconhecido');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Limpar campos
    setEmail('');
    setSenha('');
    setNome('');
    setTelefone('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏡 Enxoval de Casa Nova</h1>
          <h2>Vicenzo & Flaviana</h2>
          <p>{isLogin ? 'Entre na sua conta' : 'Crie sua conta para participar'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button 
              type="button" 
              className="auth-toggle-btn"
              onClick={toggleMode}
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="admin-info">
            <p>💡 <strong>Para administradores:</strong> Use "admin" como e-mail</p>
          </div>
        )}

        <div className="diagnostic-access">
          <button 
            type="button" 
            className="diagnostic-btn"
            onClick={() => window.location.href = '/diagnostico'}
            title="Acessar diagnóstico de produção"
          >
            🔧 Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};