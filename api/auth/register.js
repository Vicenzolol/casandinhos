const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { nome, email, telefone, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email já cadastrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 12);
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        telefone,
        senha: hashedPassword,
        isAdmin: isFirstUser
      }
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    const { senha: userPasswordHash, ...userWithoutPassword } = newUser;

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
  } finally {
    await prisma.$disconnect();
  }
};