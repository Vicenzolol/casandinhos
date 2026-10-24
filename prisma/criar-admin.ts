// Cria (ou promove) um usuário administrador.
// Uso: npm run admin:criar -- <email> <nome> [senha]
// Sem senha, uma senha aleatória é gerada e exibida.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword, gerarSenha } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const [emailArg, nome, senhaArg] = process.argv.slice(2);
  if (!emailArg || !nome) {
    console.error('Uso: npm run admin:criar -- <email> <nome> [senha]');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const senha = senhaArg || gerarSenha(12);
  const existente = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });

  if (existente) {
    await prisma.user.update({
      where: { id: existente.id },
      data: { isAdmin: true, ...(senhaArg ? { senha: await hashPassword(senhaArg) } : {}) }
    });
    console.log(`✅ ${existente.email} agora é admin${senhaArg ? ' (senha atualizada)' : ''}`);
  } else {
    await prisma.user.create({ data: { email, nome, senha: await hashPassword(senha), isAdmin: true } });
    console.log(`✅ Admin criado: ${email}`);
    if (!senhaArg) console.log(`🔑 Senha gerada: ${senha}`);
  }
}

main().finally(() => prisma.$disconnect());
