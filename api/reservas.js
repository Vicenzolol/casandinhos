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

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  const payload = authenticateToken(token);
  if (!payload) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }

  try {
    if (req.method === 'POST') {
      // Criar reserva
      const { itemId, comentario } = req.body;
      const userId = payload.userId;

      if (!itemId) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID do item é obrigatório' 
        });
      }

      const item = await prisma.enxovalItem.findUnique({
        where: { id: itemId },
        include: { reservas: true }
      });

      if (!item) {
        return res.status(404).json({ 
          success: false, 
          error: 'Item não encontrado' 
        });
      }

      if (item.reservas.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Item já foi reservado' 
        });
      }

      const newReserva = await prisma.reserva.create({
        data: {
          userId,
          itemId,
          comentario: comentario === '' ? null : comentario
        },
        include: {
          user: {
            select: { id: true, nome: true, email: true, telefone: true }
          },
          item: true
        }
      });

      return res.status(201).json({
        success: true,
        reserva: newReserva
      });
    }

    if (req.method === 'GET') {
      // Listar reservas (admin vê todas, usuário vê apenas suas)
      const isAdmin = payload.isAdmin || payload.userId === 1;
      
      const reservas = await prisma.reserva.findMany({
        where: isAdmin ? {} : { userId: payload.userId },
        include: {
          item: true,
          user: {
            select: { id: true, nome: true, email: true, telefone: true }
          }
        },
        orderBy: { dataReserva: 'desc' }
      });

      return res.json({
        success: true,
        reservas
      });
    }

    return res.status(405).json({ success: false, error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API de reservas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  } finally {
    await prisma.$disconnect();
  }
};