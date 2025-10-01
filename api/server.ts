import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './lib/prisma';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './lib/auth';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    isAdmin: boolean;
  };
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Middleware de autenticação
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }

  req.user = payload;
  next();
};

// Middleware para admin
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin && req.user?.userId !== 1) {
    return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
  }
  next();
};

// ===== ROTAS DE AUTENTICAÇÃO =====

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      });
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(senha, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      });
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    // Retornar dados do usuário (sem senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha: userPasswordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Cadastro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email já está em uso' 
      });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(senha);

    // Verificar se é o primeiro usuário (será admin)
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        telefone,
        senha: hashedPassword,
        isAdmin: isFirstUser
      }
    });

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    // Retornar dados do usuário (sem senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha: userPasswordHashRegister, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Verificar token (rota para obter dados do usuário atual)
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// ===== ROTAS DE ITENS DO ENXOVAL =====

// Listar todos os itens
app.get('/api/items', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.enxovalItem.findMany({
      include: {
        reservas: {
          include: {
            user: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      items
    });

  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Criar novo item (apenas admin)
app.post('/api/items', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nome, categoria, subCategoria, descricao, prioridade } = req.body;

    if (!nome || !categoria) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome e categoria são obrigatórios' 
      });
    }

    const item = await prisma.enxovalItem.create({
      data: {
        nome,
        categoria,
        subCategoria,
        descricao,
        prioridade: prioridade || 'media'
      }
    });

    res.status(201).json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Atualizar item (apenas admin)
app.put('/api/items/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, categoria, subCategoria, descricao, prioridade, adquirido, comentario, dataConquista } = req.body;

    const item = await prisma.enxovalItem.update({
      where: { id },
      data: {
        nome,
        categoria,
        subCategoria,
        descricao,
        prioridade,
        adquirido,
        comentario: comentario === '' ? null : comentario,
        dataConquista: dataConquista ? new Date(dataConquista) : null
      }
    });

    res.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Deletar item (apenas admin)
app.delete('/api/items/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.enxovalItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// ===== ROTAS DE RESERVAS =====

// Criar reserva
app.post('/api/reservas', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId, comentario } = req.body;

    if (!itemId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID do item é obrigatório' 
      });
    }

    // Verificar se o item existe e não está adquirido
    const item = await prisma.enxovalItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item não encontrado' 
      });
    }

    if (item.adquirido) {
      return res.status(400).json({ 
        success: false, 
        error: 'Item já foi adquirido' 
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const reserva = await prisma.reserva.create({
      data: {
        userId: req.user.userId,
        itemId,
        comentario: comentario === '' ? null : comentario
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      reserva
    });

  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Deletar reserva (usuário pode deletar suas próprias reservas, admin pode deletar qualquer uma)
app.delete('/api/reservas/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id }
    });

    if (!reserva) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reserva não encontrada' 
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    // Verificar se o usuário pode deletar a reserva
    if (reserva.userId !== req.user.userId && !req.user.isAdmin && req.user.userId !== 1) {
      return res.status(403).json({ 
        success: false, 
        error: 'Você só pode deletar suas próprias reservas' 
      });
    }

    await prisma.reserva.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Reserva deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar reserva:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// ===== ROTAS DE TESTE =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Teste rápido do Prisma (público)
app.get('/api/test/prisma/quick', async (req, res) => {
  try {
    // Teste básico de conectividade
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
app.get('/api/test/prisma', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Teste 1: Conexão básica com o banco
    const dbConnection = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Teste 2: Contar usuários
    const userCount = await prisma.user.count();
    
    // Teste 3: Contar itens
    const itemCount = await prisma.enxovalItem.count();
    
    // Teste 4: Contar reservas
    const reservaCount = await prisma.reserva.count();
    
    // Teste 5: Verificar versão do PostgreSQL
    const version = await prisma.$queryRaw`SELECT version()`;
    
    // Teste 6: Listar algumas tabelas (limitado)
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

// Rota de teste de environment para diagnóstico
app.get('/api/test/env', (req, res) => {
  try {
    const envCheck = {
      NODE_ENV: !!process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_VERSION: process.version,
      PLATFORM: process.platform
    };

    res.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString(),
      note: 'Environment variables status (true = configured, false = missing)'
    });

  } catch (error) {
    console.error('Erro no teste de environment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API rodando na porta ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
  });
}

// Exportar para Vercel
export default app;