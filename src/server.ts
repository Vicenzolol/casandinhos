import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './lib/prisma';
import { hashPassword, verifyPassword, generateToken, verifyToken, gerarSenha } from './lib/auth';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar o servidor.');
}

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    isAdmin: boolean;
  };
}

function parseBoolean(value: string | undefined, padrao: boolean) {
  if (value === undefined || value === '') return padrao;
  return value === 'true' || value === '1';
}

const app = express();
const PORT = process.env.PORT || 3001;

// Permite que mais de um convidado escolha o mesmo item ("dar junto")
const MULTIPLOS_PRESENTEADORES = parseBoolean(process.env.MULTIPLOS_PRESENTEADORES, false);

const CATEGORIAS = ['cozinha', 'sala-copa', 'banheiro-quintal', 'quarto'] as const;
const PRIORIDADES = ['baixa', 'media', 'alta', 'essencial'] as const;

const rawBasicAuthEnabled = process.env.BASIC_AUTH_ENABLED ?? process.env.VITE_BASIC_AUTH_ENABLED;
const basicAuthUser = process.env.BASIC_AUTH_USER || process.env.VITE_BASIC_AUTH_USER;
const basicAuthPass = process.env.BASIC_AUTH_PASS || process.env.VITE_BASIC_AUTH_PASS;
const basicAuthEnabled = rawBasicAuthEnabled !== undefined
  ? rawBasicAuthEnabled === 'true' || rawBasicAuthEnabled === '1'
  : Boolean(basicAuthUser && basicAuthPass);

// Protege apenas as páginas: a API usa o header Authorization para o token JWT
const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!basicAuthEnabled || !basicAuthUser || !basicAuthPass || req.path.startsWith('/api/')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Área restrita"');
    return res.status(401).send('Autenticação básica necessária');
  }

  const base64Credentials = authHeader.slice(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [user, pass] = credentials.split(':');

  if (user !== basicAuthUser || pass !== basicAuthPass) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Área restrita"');
    return res.status(401).send('Usuário ou senha inválidos');
  }

  next();
};

// Middlewares
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false }));
app.use(morgan('combined'));
app.use(basicAuthMiddleware);
app.use(express.json({ limit: '100kb' }));

// Servir arquivos estáticos do React (build do Vite)
app.use(express.static(path.join(__dirname, '../dist')));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' }
});

const escritaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Muitas requisições. Aguarde alguns minutos e tente de novo.' }
});

// ===== VALIDAÇÃO =====

const textoOpcional = (max: number) => z.string().trim().max(max).nullish()
  .transform(v => (v === '' ? null : v));

const emailSchema = z.string().trim().toLowerCase().email('Email inválido').max(200);

const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Senha é obrigatória').max(200)
});

const convidadoSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  email: emailSchema,
  telefone: textoOpcional(30)
});

const itemSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(200),
  categoria: z.enum(CATEGORIAS, { errorMap: () => ({ message: 'Categoria inválida' }) }),
  subCategoria: textoOpcional(200),
  descricao: textoOpcional(2000),
  prioridade: z.enum(PRIORIDADES, { errorMap: () => ({ message: 'Prioridade inválida' }) }),
  adquirido: z.boolean(),
  comentario: textoOpcional(2000),
  dataConquista: z.coerce.date().nullish(),
  links: z.array(
    z.string().trim().max(2000).url('Link inválido')
      .refine(url => /^https?:\/\//i.test(url), 'O link deve começar com http:// ou https://')
  ).max(10, 'No máximo 10 links por item')
});

const checkoutSchema = z.object({
  itens: z.array(z.object({
    itemId: z.string().min(1).max(100),
    comentario: textoOpcional(500),
    // O convidado já sabia (ou confirmou) que outra pessoa escolheu o item
    aceitaDividir: z.boolean().default(false)
  })).min(1, 'Carrinho vazio').max(200)
});

const reservaAdminSchema = z.object({
  itemId: z.string().min(1).max(100),
  comentario: textoOpcional(500)
});

function validar<T extends z.ZodTypeAny>(schema: T, data: unknown, res: Response): z.infer<T> | undefined {
  const result = schema.safeParse(data);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues[0]?.message || 'Dados inválidos' });
    return undefined;
  }
  return result.data;
}

function parseId(value: string, res: Response): number | undefined {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ success: false, error: 'ID inválido' });
    return undefined;
  }
  return id;
}

// Busca por email sem diferenciar maiúsculas/minúsculas (contas antigas podem ter maiúsculas)
function buscarUsuarioPorEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } }
  });
}

// ===== AUTENTICAÇÃO =====

function lerToken(req: Request) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const payload = lerToken(req);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Sessão inválida ou expirada' });
  }
  req.user = payload;
  next();
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
  }
  next();
};

const usuarioPublico = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  isAdmin: true,
  createdAt: true,
  updatedAt: true
} as const;

// Login
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const dados = validar(loginSchema, req.body, res);
  if (!dados) return;

  const user = await buscarUsuarioPorEmail(dados.email);
  if (!user || !(await verifyPassword(dados.senha, user.senha))) {
    return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
  }

  const token = generateToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { senha: _senha, ...userWithoutPassword } = user;

  res.json({ success: true, token, user: userWithoutPassword });
});

// Dados do usuário atual (renova o token para manter o convidado logado)
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: usuarioPublico
  });

  if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não encontrado' });
  }

  const token = generateToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
  res.json({ success: true, token, user });
});

// ===== LISTA PÚBLICA =====

// Itens disponíveis para presentear. Não expõe quem escolheu, só se foi escolhido.
// Reservas feitas pelos noivos (admin) não contam como "escolhido".
app.get('/api/public/items', async (req, res) => {
  const viewer = lerToken(req);

  const items = await prisma.enxovalItem.findMany({
    where: { adquirido: false },
    select: {
      id: true,
      nome: true,
      categoria: true,
      subCategoria: true,
      descricao: true,
      prioridade: true,
      links: true,
      reservas: {
        where: { user: { isAdmin: false } },
        select: { userId: true }
      }
    },
    orderBy: [{ nome: 'asc' }]
  });

  res.json({
    success: true,
    multiplosPresenteadores: MULTIPLOS_PRESENTEADORES,
    items: items.map(({ reservas, ...item }) => ({
      ...item,
      escolhido: reservas.some(r => r.userId !== viewer?.userId),
      escolhidoPorMim: viewer ? reservas.some(r => r.userId === viewer.userId) : false
    }))
  });
});

// ===== RESERVAS DO CONVIDADO =====

type Conflito = { itemId: string; nome: string | null; motivo: 'indisponivel' | 'esgotado' | 'escolhido' };

// Confirma o carrinho inteiro de uma vez. Se algum item mudou desde que entrou
// no carrinho, nada é gravado e a resposta lista os conflitos.
app.post('/api/reservas/checkout', escritaLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const dados = validar(checkoutSchema, req.body, res);
  if (!dados) return;

  const userId = req.user!.userId;
  const pedidos = [...new Map(dados.itens.map(i => [i.itemId, i])).values()];
  const ids = pedidos.map(p => p.itemId);

  const resultado = await prisma.$transaction(async tx => {
    // Trava os itens para que dois checkouts simultâneos não escolham o mesmo item
    await tx.$queryRaw`SELECT id FROM "enxoval_items" WHERE id IN (${Prisma.join(ids)}) FOR UPDATE`;

    const items = await tx.enxovalItem.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        nome: true,
        adquirido: true,
        reservas: { where: { user: { isAdmin: false } }, select: { userId: true } }
      }
    });
    const porId = new Map(items.map(i => [i.id, i]));

    const conflitos: Conflito[] = [];
    const criar: typeof pedidos = [];

    for (const pedido of pedidos) {
      const item = porId.get(pedido.itemId);
      if (!item || item.adquirido) {
        conflitos.push({ itemId: pedido.itemId, nome: item?.nome ?? null, motivo: 'indisponivel' });
        continue;
      }
      if (item.reservas.some(r => r.userId === userId)) continue; // já era dele

      const escolhidoPorOutros = item.reservas.length > 0;
      if (escolhidoPorOutros && !MULTIPLOS_PRESENTEADORES) {
        conflitos.push({ itemId: item.id, nome: item.nome, motivo: 'esgotado' });
      } else if (escolhidoPorOutros && !pedido.aceitaDividir) {
        conflitos.push({ itemId: item.id, nome: item.nome, motivo: 'escolhido' });
      } else {
        criar.push(pedido);
      }
    }

    if (conflitos.length > 0) return { conflitos, criadas: 0 };

    await tx.reserva.createMany({
      data: criar.map(p => ({ userId, itemId: p.itemId, comentario: p.comentario ?? null })),
      skipDuplicates: true
    });
    return { conflitos, criadas: criar.length };
  });

  if (resultado.conflitos.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'Alguns itens mudaram enquanto estavam no seu carrinho',
      conflitos: resultado.conflitos
    });
  }

  res.status(201).json({ success: true, criadas: resultado.criadas });
});

// Presentes escolhidos pelo usuário logado
app.get('/api/me/reservas', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const reservas = await prisma.reserva.findMany({
    where: { userId: req.user!.userId },
    select: {
      id: true,
      comentario: true,
      dataReserva: true,
      item: {
        select: { id: true, nome: true, categoria: true, descricao: true, adquirido: true }
      }
    },
    orderBy: { dataReserva: 'desc' }
  });

  res.json({ success: true, reservas });
});

// Criar reserva avulsa (usado pelos noivos na tela de administração)
app.post('/api/reservas', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const dados = validar(reservaAdminSchema, req.body, res);
  if (!dados) return;

  const item = await prisma.enxovalItem.findUnique({ where: { id: dados.itemId } });
  if (!item) {
    return res.status(404).json({ success: false, error: 'Item não encontrado' });
  }

  const reserva = await prisma.reserva.create({
    data: { userId: req.user!.userId, itemId: dados.itemId, comentario: dados.comentario ?? null },
    include: { user: { select: { id: true, nome: true } } }
  });

  res.status(201).json({ success: true, reserva });
});

// Listar reservas (usuário vê as suas, admin vê todas)
app.get('/api/reservas', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const reservas = await prisma.reserva.findMany({
    where: req.user!.isAdmin ? {} : { userId: req.user!.userId },
    include: {
      user: { select: { id: true, nome: true } },
      item: { select: { id: true, nome: true, categoria: true } }
    },
    orderBy: { dataReserva: 'desc' }
  });

  res.json({ success: true, reservas });
});

// Cancelar reserva (o próprio convidado ou admin)
app.delete('/api/reservas/:id', escritaLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const reserva = await prisma.reserva.findUnique({ where: { id: req.params.id } });

  if (!reserva) {
    return res.status(404).json({ success: false, error: 'Reserva não encontrada' });
  }

  if (reserva.userId !== req.user!.userId && !req.user!.isAdmin) {
    return res.status(403).json({ success: false, error: 'Você só pode cancelar suas próprias reservas' });
  }

  await prisma.reserva.delete({ where: { id: reserva.id } });
  res.json({ success: true, message: 'Reserva cancelada' });
});

// ===== ITENS (ADMIN) =====

app.get('/api/items', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  const items = await prisma.enxovalItem.findMany({
    include: {
      reservas: {
        include: { user: { select: { id: true, nome: true, isAdmin: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, items });
});

app.post('/api/items', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const dados = validar(itemSchema.partial({ prioridade: true, adquirido: true }), req.body, res);
  if (!dados) return;

  const item = await prisma.enxovalItem.create({
    data: {
      ...dados,
      prioridade: dados.prioridade ?? 'media',
      adquirido: dados.adquirido ?? false
    }
  });

  res.status(201).json({ success: true, item });
});

// Atualização parcial: campos ausentes não são alterados
app.put('/api/items/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const dados = validar(itemSchema.partial(), req.body, res);
  if (!dados) return;

  // Desmarcar como adquirido limpa a data de conquista
  if (dados.adquirido === false && dados.dataConquista === undefined) {
    dados.dataConquista = null;
  }

  const item = await prisma.enxovalItem.update({
    where: { id: req.params.id },
    data: dados
  });

  res.json({ success: true, item });
});

app.delete('/api/items/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  await prisma.enxovalItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Item deletado com sucesso' });
});

// ===== CONVIDADOS (ADMIN) =====

app.get('/api/admin/convidados', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  const convidados = await prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      createdAt: true,
      reservas: {
        select: {
          id: true,
          comentario: true,
          dataReserva: true,
          item: { select: { id: true, nome: true, categoria: true } }
        },
        orderBy: { dataReserva: 'desc' }
      }
    },
    orderBy: { nome: 'asc' }
  });

  res.json({ success: true, convidados });
});

// Cria o acesso do convidado. A senha gerada só é devolvida nesta resposta.
app.post('/api/admin/convidados', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const dados = validar(convidadoSchema, req.body, res);
  if (!dados) return;

  if (await buscarUsuarioPorEmail(dados.email)) {
    return res.status(409).json({ success: false, error: 'Já existe um convidado com este email' });
  }

  const senha = gerarSenha();
  const convidado = await prisma.user.create({
    data: { ...dados, senha: await hashPassword(senha), isAdmin: false },
    select: { id: true, nome: true, email: true, telefone: true, createdAt: true }
  });

  res.status(201).json({ success: true, convidado: { ...convidado, reservas: [] }, senha });
});

app.put('/api/admin/convidados/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = parseId(req.params.id, res);
  if (id === undefined) return;
  const dados = validar(convidadoSchema, req.body, res);
  if (!dados) return;

  const existente = await buscarUsuarioPorEmail(dados.email);
  if (existente && existente.id !== id) {
    return res.status(409).json({ success: false, error: 'Já existe um convidado com este email' });
  }

  const convidado = await prisma.user.update({
    where: { id, isAdmin: false },
    data: dados,
    select: { id: true, nome: true, email: true, telefone: true, createdAt: true }
  });

  res.json({ success: true, convidado });
});

// Gera uma nova senha (substitui o "esqueci minha senha")
app.post('/api/admin/convidados/:id/senha', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = parseId(req.params.id, res);
  if (id === undefined) return;

  const senha = gerarSenha();
  await prisma.user.update({
    where: { id, isAdmin: false },
    data: { senha: await hashPassword(senha) }
  });

  res.json({ success: true, senha });
});

app.delete('/api/admin/convidados/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = parseId(req.params.id, res);
  if (id === undefined) return;

  await prisma.user.delete({ where: { id, isAdmin: false } });
  res.json({ success: true, message: 'Convidado removido' });
});

// ===== ROTAS DE TESTE =====

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/prisma/quick', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    res.json({
      success: true,
      message: '✅ Prisma conectado com sucesso!',
      timestamp: new Date().toISOString(),
      status: 'online'
    });
  } catch (error) {
    console.error('Erro no teste rápido do Prisma:', error);
    res.status(500).json({
      success: false,
      message: '❌ Erro na conexão com Prisma',
      timestamp: new Date().toISOString(),
      status: 'offline'
    });
  }
});

// Teste completo do Prisma (apenas admin)
app.get('/api/test/prisma', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const dbConnection = await prisma.$queryRaw`SELECT 1 as test`;
    const userCount = await prisma.user.count();
    const itemCount = await prisma.enxovalItem.count();
    const reservaCount = await prisma.reserva.count();
    const version = await prisma.$queryRaw`SELECT version()`;

    const recentUsers = await prisma.user.findMany({
      take: 3,
      select: { id: true, nome: true, email: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    const recentItems = await prisma.enxovalItem.findMany({
      take: 3,
      select: { id: true, nome: true, categoria: true, adquirido: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: '✅ Conexão com Prisma funcionando perfeitamente!',
      timestamp: new Date().toISOString(),
      tests: {
        database_connection: dbConnection ? '✅ Conectado' : '❌ Falha na conexão',
        user_count: `✅ ${userCount} usuário(s) cadastrado(s)`,
        item_count: `✅ ${itemCount} item(ns) no enxoval`,
        reserva_count: `✅ ${reservaCount} reserva(s) ativa(s)`,
        postgresql_version: version,
        recent_users: recentUsers,
        recent_items: recentItems
      },
      database_info: {
        provider: 'PostgreSQL',
        prisma_version: '6.16.3',
        connection_status: '✅ Ativo'
      }
    });
  } catch (error) {
    console.error('Erro no teste do Prisma:', error);
    res.status(500).json({
      success: false,
      message: '❌ Erro na conexão com Prisma',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      tests: {
        database_connection: '❌ Falha na conexão',
        details: 'Verifique se o DATABASE_URL está configurado corretamente'
      }
    });
  }
});

// Diagnóstico de ambiente (apenas admin)
app.get('/api/test/env', authenticateToken, requireAdmin, (_req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: !!process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      MULTIPLOS_PRESENTEADORES,
      NODE_VERSION: process.version,
      PLATFORM: process.platform
    },
    timestamp: new Date().toISOString(),
    note: 'Environment variables status (true = configured, false = missing)'
  });
});

// Rota catch-all para servir o React (deve ser a última rota)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Rota não encontrada' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Tratamento central de erros (o Express 5 encaminha erros de handlers async para cá)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Registro não encontrado' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Registro duplicado' });
    }
  }
  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'JSON inválido' });
  }
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});

// Na Vercel a função exporta o app; localmente sobe o servidor
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API rodando na porta ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🎁 Múltiplos presenteadores por item: ${MULTIPLOS_PRESENTEADORES ? 'sim' : 'não'}`);
  });
}

export default app;
