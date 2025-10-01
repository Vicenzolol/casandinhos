import React, { useState, useEffect } from 'react';
import './PrismaTest.css';

interface PostgreSQLVersion {
  version: string;
}

interface RecentUser {
  id: number;
  nome: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface RecentItem {
  id: string;
  nome: string;
  categoria: string;
  adquirido: boolean;
}

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  tests?: {
    database_connection: string;
    user_count: string;
    item_count: string;
    reserva_count: string;
    postgresql_version: PostgreSQLVersion[];
    recent_users: RecentUser[];
    recent_items: RecentItem[];
  };
  database_info?: {
    provider: string;
    prisma_version: string;
    connection_status: string;
  };
  error?: string;
}

const PrismaTest: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runPrismaTest = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setTestResult({
          success: false,
          message: '❌ Token de autenticação não encontrado',
          timestamp: new Date().toISOString(),
          error: 'Faça login novamente para executar o teste'
        });
        return;
      }
      
      const response = await fetch('/api/test/prisma', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro de conexão' }));
        setTestResult({
          success: false,
          message: `❌ Erro ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
          error: errorData.error || 'Erro desconhecido'
        });
        return;
      }
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: '❌ Erro na comunicação com a API',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrismaTest();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(runPrismaTest, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatPostgresVersion = (version: PostgreSQLVersion[]) => {
    if (Array.isArray(version) && version.length > 0) {
      return version[0]?.version || 'Não disponível';
    }
    return 'Não disponível';
  };

  return (
    <div className="prisma-test-container">
      <div className="test-header">
        <h1>🔍 Teste de Conexão Prisma</h1>
        <p>Verifica a conectividade e status do banco de dados PostgreSQL</p>
      </div>

      <div className="test-controls">
        <button 
          onClick={runPrismaTest} 
          disabled={loading}
          className="test-button primary"
        >
          {loading ? '⏳ Testando...' : '🔄 Executar Teste'}
        </button>
        
        <label className="auto-refresh">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          🔄 Auto-refresh (5s)
        </label>
      </div>

      {testResult && (
        <div className={`test-results ${testResult.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <h2>{testResult.message}</h2>
            <span className="timestamp">
              ⏰ {new Date(testResult.timestamp).toLocaleString('pt-BR')}
            </span>
          </div>

          {testResult.success && testResult.tests && (
            <div className="test-details">
              <div className="test-grid">
                <div className="test-item">
                  <h3>🔌 Conexão</h3>
                  <p>{testResult.tests.database_connection}</p>
                </div>

                <div className="test-item">
                  <h3>👥 Usuários</h3>
                  <p>{testResult.tests.user_count}</p>
                </div>

                <div className="test-item">
                  <h3>🎁 Itens</h3>
                  <p>{testResult.tests.item_count}</p>
                </div>

                <div className="test-item">
                  <h3>📋 Reservas</h3>
                  <p>{testResult.tests.reserva_count}</p>
                </div>
              </div>

              <div className="database-info">
                <h3>📊 Informações do Banco</h3>
                <div className="info-grid">
                  <div>
                    <strong>Provider:</strong> {testResult.database_info?.provider}
                  </div>
                  <div>
                    <strong>Prisma:</strong> v{testResult.database_info?.prisma_version}
                  </div>
                  <div>
                    <strong>Status:</strong> {testResult.database_info?.connection_status}
                  </div>
                  <div>
                    <strong>PostgreSQL:</strong> {formatPostgresVersion(testResult.tests.postgresql_version)}
                  </div>
                </div>
              </div>

              {testResult.tests.recent_users.length > 0 && (
                <div className="recent-data">
                  <h3>👤 Usuários Recentes</h3>
                  <div className="data-table">
                    {testResult.tests.recent_users.map((user: RecentUser) => (
                      <div key={user.id} className="data-row">
                        <span className="data-id">#{user.id}</span>
                        <span className="data-name">{user.nome}</span>
                        <span className="data-email">{user.email}</span>
                        <span className={`data-role ${user.isAdmin ? 'admin' : 'user'}`}>
                          {user.isAdmin ? '👑 Admin' : '👤 User'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResult.tests.recent_items.length > 0 && (
                <div className="recent-data">
                  <h3>🎁 Itens Recentes</h3>
                  <div className="data-table">
                    {testResult.tests.recent_items.map((item: RecentItem) => (
                      <div key={item.id} className="data-row">
                        <span className="data-name">{item.nome}</span>
                        <span className="data-category">{item.categoria}</span>
                        <span className={`data-status ${item.adquirido ? 'acquired' : 'available'}`}>
                          {item.adquirido ? '✅ Adquirido' : '⏳ Disponível'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!testResult.success && (
            <div className="error-details">
              <h3>❌ Detalhes do Erro</h3>
              <p>{testResult.error}</p>
              <div className="error-help">
                <h4>💡 Possíveis soluções:</h4>
                <ul>
                  <li>Verifique se a variável DATABASE_URL está configurada</li>
                  <li>Confirme se o banco PostgreSQL está ativo</li>
                  <li>Execute: <code>npx prisma generate</code></li>
                  <li>Execute: <code>npx prisma migrate deploy</code></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="test-footer">
        <p>
          Esta página testa a conectividade entre a aplicação e o banco de dados PostgreSQL 
          usando o Prisma ORM. Use para diagnosticar problemas de conexão.
        </p>
      </div>
    </div>
  );
};

export default PrismaTest;