import React, { useState, useEffect } from 'react';
import '../styles/DiagnosticoProd.css';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  duration?: number;
}

interface EnvironmentInfo {
  userAgent: string;
  url: string;
  protocol: string;
  host: string;
  timestamp: string;
}

const DiagnosticoProd: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [environmentInfo, setEnvironmentInfo] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    setEnvironmentInfo({
      userAgent: navigator.userAgent,
      url: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      timestamp: new Date().toISOString()
    });
  }, []);

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runTest = async (testName: string, testFn: () => Promise<unknown>): Promise<void> => {
    const startTime = Date.now();
    const testIndex = tests.length;
    
    addTest({
      name: testName,
      status: 'pending',
      message: 'Executando teste...'
    });

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      updateTest(testIndex, {
        status: 'success',
        message: 'Teste passou com sucesso',
        details: JSON.stringify(result, null, 2),
        duration
      });
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      updateTest(testIndex, {
        status: 'error',
        message: errorMessage,
        details: JSON.stringify(error, null, 2),
        duration
      });
    }
  };

  const testHealthEndpoint = async () => {
    // Usar sempre o proxy do Vite, assim como o resto da aplicação
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`Health check falhou: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return { status: response.status, data };
  };

  const testAuthLogin = async () => {
    // Usar sempre o proxy do Vite, assim como o resto da aplicação
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@diagnostic.com',
        senha: 'invalid-password'
      })
    });

    // Esperamos que falhe com 401 (credenciais inválidas), isso indica que a API está funcionando
    if (response.status === 401) {
      const data = await response.json();
      return { status: response.status, message: 'API de login funcionando (retornou erro esperado)', data };
    } else if (response.status === 405) {
      throw new Error('Método não permitido - API não está configurada corretamente');
    } else if (response.status >= 500) {
      throw new Error(`Erro interno do servidor: ${response.status}`);
    }
    
    const data = await response.json();
    return { status: response.status, data };
  };

  const testPrismaConnection = async () => {
    // Usar sempre o proxy do Vite, assim como o resto da aplicação
    const response = await fetch('/api/test/prisma');
    
    // Se retornar 401, a API está funcionando mas requer autenticação (isso é bom!)
    if (response.status === 401) {
      return { 
        status: response.status, 
        message: 'API Prisma funcionando (requer autenticação - correto!)',
        note: 'Endpoint protegido adequadamente'
      };
    }
    
    if (!response.ok) {
      throw new Error(`Teste Prisma falhou: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return { status: response.status, data };
  };

  const testItemsAPI = async () => {
    // Usar sempre o proxy do Vite, assim como o resto da aplicação
    const response = await fetch('/api/items');
    
    // Se retornar 401, a API está funcionando mas requer autenticação (isso é bom!)
    if (response.status === 401) {
      return { 
        status: response.status, 
        message: 'API de itens funcionando (requer autenticação - correto!)',
        itemCount: 'N/A - autenticação necessária'
      };
    }
    
    if (!response.ok) {
      throw new Error(`API de itens falhou: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return { status: response.status, itemCount: data.items?.length || 0, data };
  };

  const testEnvironmentVariables = async () => {
    // Usar sempre o proxy do Vite, assim como o resto da aplicação
    const response = await fetch('/api/test/env');
    
    if (response.status === 404) {
      // Em desenvolvimento, pode não existir - isso é OK
      if (window.location.hostname === 'localhost') {
        return { 
          status: 200, 
          message: 'Teste de environment não aplicável em desenvolvimento',
          data: { environment: 'development', note: 'Variables checked via server.js' }
        };
      }
      throw new Error('Endpoint de teste de environment não encontrado em produção');
    }
    
    if (!response.ok) {
      throw new Error(`Teste de environment falhou: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return { status: response.status, data };
  };

  const testCORSConfiguration = async () => {
    try {
      // Usar sempre o proxy do Vite, assim como o resto da aplicação
      const response = await fetch('/api/health', {
        method: 'OPTIONS'
      });
      
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      };

      return { 
        status: response.status, 
        corsHeaders,
        corsConfigured: !!corsHeaders['access-control-allow-origin']
      };
    } catch (error) {
      throw new Error(`Erro ao testar CORS: ${error}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    const testSuite = [
      { name: 'Health Check', fn: testHealthEndpoint },
      { name: 'CORS Configuration', fn: testCORSConfiguration },
      { name: 'Auth API (Login)', fn: testAuthLogin },
      { name: 'Items API', fn: testItemsAPI },
      { name: 'Prisma Connection', fn: testPrismaConnection },
      { name: 'Environment Variables', fn: testEnvironmentVariables }
    ];

    for (const test of testSuite) {
      await runTest(test.name, test.fn);
      // Pequena pausa entre os testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusClass = (status: TestResult['status']) => {
    return `test-result ${status}`;
  };

  const copyResults = () => {
    const results = {
      environment: environmentInfo,
      tests: tests,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    alert('Resultados copiados para a área de transferência!');
  };

  return (
    <div className="diagnostico-container">
      <div className="diagnostico-header">
        <h1>🔧 Diagnóstico de Produção</h1>
        <p>Esta página testa todas as funcionalidades críticas do sistema em produção</p>
      </div>

      {environmentInfo && (
        <div className="environment-info">
          <h2>Informações do Ambiente</h2>
          <div className="environment-badge">
            {window.location.hostname === 'localhost' ? 
              <span className="badge development">🔧 DESENVOLVIMENTO</span> : 
              <span className="badge production">🚀 PRODUÇÃO</span>
            }
          </div>
          <div className="info-grid">
            <div><strong>URL:</strong> {environmentInfo.url}</div>
            <div><strong>Host:</strong> {environmentInfo.host}</div>
            <div><strong>Protocol:</strong> {environmentInfo.protocol}</div>
            <div><strong>Timestamp:</strong> {environmentInfo.timestamp}</div>
            <div><strong>User Agent:</strong> {environmentInfo.userAgent}</div>
          </div>
        </div>
      )}

      <div className="diagnostico-actions">
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="run-tests-btn"
        >
          {isRunning ? '🔄 Executando Testes...' : '🚀 Executar Todos os Testes'}
        </button>
        
        {tests.length > 0 && (
          <button onClick={copyResults} className="copy-results-btn">
            📋 Copiar Resultados
          </button>
        )}
      </div>

      <div className="tests-container">
        {tests.map((test, index) => (
          <div key={index} className={getStatusClass(test.status)}>
            <div className="test-header">
              <span className="test-icon">{getStatusIcon(test.status)}</span>
              <span className="test-name">{test.name}</span>
              {test.duration && (
                <span className="test-duration">{test.duration}ms</span>
              )}
            </div>
            
            <div className="test-message">{test.message}</div>
            
            {test.details && (
              <details className="test-details">
                <summary>Ver detalhes</summary>
                <pre>{test.details}</pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {tests.length > 0 && (
        <div className="diagnostico-summary">
          <h3>Resumo dos Testes</h3>
          <div className="summary-stats">
            <span className="stat success">
              Sucessos: {tests.filter(t => t.status === 'success').length}
            </span>
            <span className="stat error">
              Erros: {tests.filter(t => t.status === 'error').length}
            </span>
            <span className="stat warning">
              Avisos: {tests.filter(t => t.status === 'warning').length}
            </span>
          </div>
        </div>
      )}

      <div className="diagnostico-instructions">
        <h3>Como usar os resultados:</h3>
        <ol>
          <li>Execute todos os testes clicando no botão acima</li>
          <li>Copie os resultados usando o botão "Copiar Resultados"</li>
          <li>Cole os resultados na conversa com o assistente</li>
          <li>O assistente usará essas informações para corrigir os problemas</li>
        </ol>
        
        {window.location.hostname === 'localhost' ? (
          <div className="env-note development">
            <h4>📝 Executando em Desenvolvimento:</h4>
            <ul>
              <li>APIs testadas via proxy do Vite (igual ao resto da aplicação)</li>
              <li>Erro 401 (Unauthorized) é normal para APIs protegidas</li>
              <li>Certifique-se que o servidor backend está rodando em <code>localhost:3001</code></li>
              <li>Se houver erro de conexão, execute: <code>npm run dev:server</code> em outro terminal</li>
            </ul>
          </div>
        ) : (
          <div className="env-note production">
            <h4>🚀 Executando em Produção:</h4>
            <ul>
              <li>APIs testadas diretamente no Vercel</li>
              <li>Erro 405 (Method Not Allowed) indica problema de configuração</li>
              <li>Erro 500 geralmente indica problema com variáveis de ambiente</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticoProd;