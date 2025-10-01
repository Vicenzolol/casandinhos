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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID do item é obrigatório' });
  }

  try {
    if (req.method === 'GET') {
      // Buscar item por ID
      const item = await prisma.enxovalItem.findUnique({
        where: { id: id.toString() },
        include: {
          reservas: {
            include: {
              user: {
                select: { id: true, nome: true, email: true, telefone: true }
              }
            }
          }
        }
      });

      if (!item) {
        return res.status(404).json({ 
          success: false, 
          error: 'Item não encontrado' 
        });
      }

      return res.json({
        success: true,
        item
      });
    }

    if (req.method === 'PUT') {
      // Atualizar item (apenas admin)
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
      }

      const payload = authenticateToken(token);
      if (!payload || (!payload.isAdmin && payload.userId !== 1)) {
        return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
      }

      const { nome, categoria, subCategoria, descricao, prioridade, adquirido, comentario, dataConquista } = req.body;

      const updatedItem = await prisma.enxovalItem.update({
        where: { id: id.toString() },
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

      return res.json({
        success: true,
        item: updatedItem
      });
    }

    if (req.method === 'DELETE') {
      // Deletar item (apenas admin)
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
      }

      const payload = authenticateToken(token);
      if (!payload || (!payload.isAdmin && payload.userId !== 1)) {
        return res.status(403).json({ success: false, error: 'Acesso negado - Admin necessário' });
      }

      await prisma.enxovalItem.delete({
        where: { id: id.toString() }
      });

      return res.json({
        success: true,
        message: 'Item deletado com sucesso'
      });
    }

    return res.status(405).json({ success: false, error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API de item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  } finally {
    await prisma.$disconnect();
  }
};