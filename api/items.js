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

  try {
    if (req.method === 'GET') {
      // Lista todos os itens (apenas admin)
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
      }

      const payload = authenticateToken(token);
      if (!payload || (!payload.isAdmin && payload.userId !== 1)) {
        return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
      }

      const items = await prisma.enxovalItem.findMany({
        include: {
          reservas: {
            include: {
              user: {
                select: { id: true, nome: true, email: true, telefone: true }
              }
            }
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
    }

    if (req.method === 'POST') {
      // Criar item (apenas admin)
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
      }

      const payload = authenticateToken(token);
      if (!payload || (!payload.isAdmin && payload.userId !== 1)) {
        return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
      }

      const { nome, categoria, subCategoria, descricao, prioridade } = req.body;

      if (!nome || !categoria) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nome e categoria são obrigatórios' 
        });
      }

      const newItem = await prisma.enxovalItem.create({
        data: {
          nome,
          categoria,
          subCategoria,
          descricao,
          prioridade: prioridade || 'media'
        }
      });

      return res.status(201).json({
        success: true,
        item: newItem
      });
    }

    return res.status(405).json({ success: false, error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API de itens:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  } finally {
    await prisma.$disconnect();
  }
};