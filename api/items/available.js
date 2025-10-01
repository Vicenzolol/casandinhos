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
    const items = await prisma.enxovalItem.findMany({
      where: {
        reservas: {
          none: {}
        }
      },
      orderBy: [
        { categoria: 'asc' },
        { nome: 'asc' }
      ]
    });

    return res.json({
      success: true,
      items
    });

  } catch (error) {
    console.error('Erro ao buscar itens disponíveis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  } finally {
    await prisma.$disconnect();
  }
};