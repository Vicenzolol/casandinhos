const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
  } finally {
    await prisma.$disconnect();
  }
};