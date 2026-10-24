import { defineConfig, loadEnv } from 'vite'
import type { Connect, ViteDevServer } from 'vite'
import type { ServerResponse } from 'http'
import react from '@vitejs/plugin-react'

function parseBoolean(value: string | undefined) {
  return value === 'true' || value === '1';
}

function createBasicAuthMiddleware(enabled: boolean, user: string | undefined, pass: string | undefined) {
  return (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    // A API usa o header Authorization para o token JWT, então fica fora do Basic Auth
    if (!enabled || !user || !pass || req.url?.startsWith('/api/')) {
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Área restrita"');
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      return res.end('Autenticação básica necessária');
    }

    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [reqUser, reqPass] = credentials.split(':');

    if (reqUser !== user || reqPass !== pass) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Área restrita"');
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      return res.end('Usuário ou senha inválidos');
    }

    next();
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
  const basicAuthRawEnabled = env.VITE_BASIC_AUTH_ENABLED ?? env.BASIC_AUTH_ENABLED;
  const basicAuthUser = env.VITE_BASIC_AUTH_USER;
  const basicAuthPass = env.VITE_BASIC_AUTH_PASS;
  const basicAuthEnabled = basicAuthRawEnabled !== undefined
    ? parseBoolean(basicAuthRawEnabled)
    : Boolean(basicAuthUser && basicAuthPass);

  console.log(`\n[Vite] Basic Auth ${basicAuthEnabled && basicAuthUser && basicAuthPass ? 'ativado' : 'desativado'}`);
  if (basicAuthEnabled) {
    if (basicAuthUser && basicAuthPass) {
      console.log('[Vite] Basic Auth configurado com VITE_BASIC_AUTH_USER/VITE_BASIC_AUTH_PASS');
    } else {
      console.log('[Vite] VITE_BASIC_AUTH_USER ou VITE_BASIC_AUTH_PASS não definidos');
    }
  }

  return {
    plugins: [
      react(),
      {
        name: 'basic-auth-plugin',
        configureServer(server: ViteDevServer) {
          server.middlewares.use(createBasicAuthMiddleware(basicAuthEnabled, basicAuthUser, basicAuthPass));
        },
      },
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
