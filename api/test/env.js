const { PrismaClient } = require('@prisma/client');

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
    const envCheck = {
      NODE_ENV: !!process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_VERSION: process.version,
      PLATFORM: process.platform
    };

    // Teste rápido de conexão com Prisma (sem criar instância persistente)
    let prismaConnection = false;
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      prismaConnection = true;
      await prisma.$disconnect();
    } catch (error) {
      prismaConnection = false;
    }

    res.json({
      success: true,
      environment: envCheck,
      prismaConnection,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no teste de environment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};