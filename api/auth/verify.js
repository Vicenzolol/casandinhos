const jwt = require('jsonwebtoken');
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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, nome: true, email: true, telefone: true, isAdmin: true }
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
    console.error('Erro na verificação:', error);
    res.status(403).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  } finally {
    await prisma.$disconnect();
  }
};