const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
  } catch {
    return null;
  }
};

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  // Verificar se é admin
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  const payload = authenticateToken(token);
  if (!payload || (!payload.isAdmin && payload.userId !== 1)) {
    return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
  }

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
      error: error.message,
      tests: {
        database_connection: '❌ Falha na conexão',
        details: 'Verifique se o DATABASE_URL está configurado corretamente'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
};