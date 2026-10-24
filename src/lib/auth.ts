import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

// Lido sob demanda para não depender da ordem de carregamento do dotenv
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return secret;
}

// Convidados ficam logados por muito tempo (o token é renovado a cada visita)
const EXPIRACAO_CONVIDADO = '365d';
const EXPIRACAO_ADMIN = '30d';

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Gerar JWT token
export function generateToken(payload: JWTPayload): string {
  const { userId, email, isAdmin } = payload;
  return jwt.sign({ userId, email, isAdmin }, getSecret(), {
    expiresIn: isAdmin ? EXPIRACAO_ADMIN : EXPIRACAO_CONVIDADO
  });
}

// Verificar JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

// Senha fácil de ditar/digitar: sem caracteres ambíguos (0/O, 1/l/I)
export function gerarSenha(tamanho = 8): string {
  const alfabeto = 'abcdefghjkmnpqrstuvwxyz23456789';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += alfabeto[crypto.randomInt(alfabeto.length)];
  }
  return senha;
}
