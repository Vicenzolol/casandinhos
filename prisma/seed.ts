import { PrismaClient } from '@prisma/client';
import { itensIniciais } from '../src/data/itensIniciais.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Verificar se já existem itens no banco
  const existingItems = await prisma.enxovalItem.count();
  
  if (existingItems > 0) {
    console.log(`✅ Banco já possui ${existingItems} itens. Pulando seed...`);
    return;
  }

  console.log('📦 Inserindo itens do enxoval...');
  
  // Inserir todos os itens iniciais
  for (const item of itensIniciais) {
    await prisma.enxovalItem.create({
      data: {
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        subCategoria: item.subCategoria,
        descricao: item.descricao,
        adquirido: item.adquirido,
        prioridade: item.prioridade,
      }
    });
  }

  console.log(`✅ ${itensIniciais.length} itens inseridos com sucesso!`);
  
  const stats = await prisma.enxovalItem.groupBy({
    by: ['categoria'],
    _count: {
      categoria: true
    }
  });

  console.log('\n📊 Resumo por categoria:');
  stats.forEach(stat => {
    console.log(`   ${stat.categoria}: ${stat._count.categoria} itens`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 Seed concluído com sucesso!');
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });