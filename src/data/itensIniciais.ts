import type { EnxovalItem } from '../types';

export { categoriasInfo } from './categorias';

// Dados do seed (links começam vazios no banco)
export const itensIniciais: Omit<EnxovalItem, 'links'>[] = [
  // COZINHA
  // Eletrodomésticos e Equipamentos
  {
    id: 'coz-001',
    nome: 'Fogão',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Fogão 4 ou 5 bocas com forno',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-002',
    nome: 'Geladeira',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Geladeira duplex ou frost free',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-003',
    nome: 'Armário',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Armário de cozinha aéreo e balcão',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-004',
    nome: 'Panela Elétrica de Arroz',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Panela elétrica para arroz',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-005',
    nome: 'Panela Elétrica de Feijão',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Panela de pressão elétrica',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-006',
    nome: 'Liquidificador',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Liquidificador com jarra de vidro',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-007',
    nome: 'Batedeira',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Batedeira planetária ou comum',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-008',
    nome: 'Sanduicheira e grill',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Sanduicheira e grill 2 em 1',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-009',
    nome: 'Cafeteira',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Cafeteira elétrica',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-010',
    nome: 'Micro-ondas',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Micro-ondas de bancada',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-011',
    nome: 'Air fryer',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Fritadeira elétrica sem óleo',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-012',
    nome: 'Processador de Alimentos',
    categoria: 'cozinha',
    subCategoria: 'Eletrodomésticos e Equipamentos',
    descricao: 'Processador multiuso',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Utensílios Básicos
  {
    id: 'coz-013',
    nome: 'Conjunto de facas',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Conjunto com facas variadas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-014',
    nome: 'Tábua de corte',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Tábua de corte de madeira ou plástico',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-015',
    nome: 'Colheres de silicone',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Kit de colheres de silicone',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-016',
    nome: 'Espátula',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Espátula para cozinhar',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-017',
    nome: 'Garrafa de água',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Garrafa térmica ou comum',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-018',
    nome: 'Concha para feijão',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Concha grande para servir',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-019',
    nome: 'Concha para sopa',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Concha média para sopa',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-020',
    nome: 'Pegador de massa',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Pegador para macarrão',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-021',
    nome: 'Fouet (batedor de arame)',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Batedor manual para ovos',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-022',
    nome: 'Descascador de legumes',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Descascador de batatas e legumes',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-023',
    nome: 'Abridor de latas',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Abridor manual de latas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-024',
    nome: 'Abridor de garrafas/saca-rolhas',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Abridor multifuncional',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-025',
    nome: 'Ralador',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Ralador multiuso',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-026',
    nome: 'Tesoura de cozinha',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Tesoura específica para cozinha',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-027',
    nome: 'Cumbucas cerâmica',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Conjunto de tigelas pequenas',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-028',
    nome: 'Peneira',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Peneira para coar',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-029',
    nome: 'Funil',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Funil para líquidos',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-030',
    nome: 'Escorredor de macarrão',
    categoria: 'cozinha',
    subCategoria: 'Utensílios Básicos',
    descricao: 'Escorredor grande',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Panelas e Assadeiras
  {
    id: 'coz-031',
    nome: 'Jogo de panelas (mínimo: 1 pequena, 1 média e 1 grande)',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Conjunto com 3 panelas de tamanhos diferentes',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-032',
    nome: 'Frigideira antiaderente',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Frigideira antiaderente média',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-033',
    nome: 'Panela de pressão',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Panela de pressão 3-4 litros',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-034',
    nome: 'Assadeiras retangular',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Assadeira para forno',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-035',
    nome: 'Assadeiras redonda',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Forma redonda para bolos',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-036',
    nome: 'Forma de bolo',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Forma para bolo comum',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-037',
    nome: 'Forma de pudim',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Forma específica para pudim',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-038',
    nome: 'Travessas refratárias',
    categoria: 'cozinha',
    subCategoria: 'Panelas e Assadeiras',
    descricao: 'Travessas para forno',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Louças e Talheres
  {
    id: 'coz-039',
    nome: 'Jogo de Pratos rasos e fundos',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Conjunto de pratos para 6 pessoas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-040',
    nome: 'Jogo de sobremesa',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Pratos de sobremesa para 6 pessoas',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-041',
    nome: 'Jogo de Copos para água',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Copos de vidro para água',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-042',
    nome: 'Jogo de Copos para suco',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Copos menores para suco',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-043',
    nome: 'Taças',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Taças para vinho ou champagne',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-044',
    nome: 'Jogo de Xícaras',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Xícaras de café com pires',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-045',
    nome: 'Jogo de talheres (garfos, facas, colheres de sopa, sobremesa e chá)',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Conjunto completo de talheres para 6 pessoas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-046',
    nome: 'Colher de arroz',
    categoria: 'cozinha',
    subCategoria: 'Louças e Talheres',
    descricao: 'Colher específica para servir arroz',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Outros Itens Essenciais
  {
    id: 'coz-047',
    nome: 'Porta-temperos',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Organizador para temperos',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-048',
    nome: 'Potes herméticos para mantimentos',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Potes para armazenar alimentos',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-049',
    nome: 'Potes plásticos',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Potes diversos para geladeira',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-050',
    nome: 'Lixeira para a pia',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Lixeira pequena para bancada',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-051',
    nome: 'Luva térmica para forno',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Luva para proteção no forno',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-052',
    nome: 'Panos de prato',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Panos para secar louças',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-053',
    nome: 'Toalha de mesa',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Toalha para mesa de jantar',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'coz-054',
    nome: 'Jogos americanos',
    categoria: 'cozinha',
    subCategoria: 'Outros Itens Essenciais',
    descricao: 'Jogos americanos individuais',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // SALA E COPA
  // Móveis Principais
  {
    id: 'sal-001',
    nome: 'Sofá',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Sofá para sala de estar',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-002',
    nome: 'Rack ou painel para TV',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Móvel para TV e equipamentos',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-003',
    nome: 'Mesa de jantar e cadeiras',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Conjunto mesa com 4-6 cadeiras',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-004',
    nome: 'Estante e prateleiras',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Estante para livros e decoração',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-005',
    nome: 'Decoração e Conforto',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Itens decorativos diversos',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-006',
    nome: 'Almofadas decorativas',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Almofadas para sofá',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-007',
    nome: 'Tapetes',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Tapetes para sala',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-008',
    nome: 'Cortinas',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Cortinas para janelas',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-009',
    nome: 'Quadros, espelhos ou objetos decorativos',
    categoria: 'sala-copa',
    subCategoria: 'Móveis Principais',
    descricao: 'Decoração para paredes',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Eletroeletrônicos
  {
    id: 'sal-010',
    nome: 'Televisão',
    categoria: 'sala-copa',
    subCategoria: 'Eletroeletrônicos',
    descricao: 'TV para sala',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-011',
    nome: 'Ventilador ou ar-condicionado',
    categoria: 'sala-copa',
    subCategoria: 'Eletroeletrônicos',
    descricao: 'Climatização para sala',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-012',
    nome: 'Computadores',
    categoria: 'sala-copa',
    subCategoria: 'Eletroeletrônicos',
    descricao: 'Computador desktop ou notebook',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Outros
  {
    id: 'sal-013',
    nome: 'Porta-retratos',
    categoria: 'sala-copa',
    subCategoria: 'Outros',
    descricao: 'Porta-retratos para fotos',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-014',
    nome: 'Suporte para Guardanapo',
    categoria: 'sala-copa',
    subCategoria: 'Outros',
    descricao: 'Porta guardanapos para mesa',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-015',
    nome: 'Jarra de Vidro',
    categoria: 'sala-copa',
    subCategoria: 'Outros',
    descricao: 'Jarra para água na mesa',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-016',
    nome: 'Suporte para panelas na mesa',
    categoria: 'sala-copa',
    subCategoria: 'Outros',
    descricao: 'Descansos para panelas quentes',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-017',
    nome: 'Vasos com plantas naturais ou artificiais',
    categoria: 'sala-copa',
    subCategoria: 'Outros',
    descricao: 'Plantas para decoração',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sal-018',
    nome: 'Mesas de suporte para computador',
    categoria: 'sala-copa',
    subCategoria: 'Outros',
    descricao: 'Mesa para escritorio em casa',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // BANHEIRO E QUINTAL
  // Itens Básicos
  {
    id: 'ban-001',
    nome: 'Toalhas de banho (mínimo 3 por pessoa)',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Toalhas de banho para o casal',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-002',
    nome: '3 Toalhas de rosto',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Toalhas menores para rosto',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-003',
    nome: 'Tapete antiderrapante',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Tapete para box do chuveiro',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-004',
    nome: '2 Jogos de banheiro',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Conjunto tapete e tampa do vaso',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-005',
    nome: 'Lixeira com tampa',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Lixeira para banheiro',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-006',
    nome: 'Suporte para papel higiênico',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Porta papel higiênico',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-007',
    nome: 'Espelho',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Espelho para banheiro',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-008',
    nome: 'Saboneteira ou dispenser para sabonete líquido',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Porta sabonete',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-009',
    nome: 'Porta-escova de dentes',
    categoria: 'banheiro-quintal',
    subCategoria: 'Itens Básicos',
    descricao: 'Organizador para escovas',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Organização e Armazenamento
  {
    id: 'ban-010',
    nome: 'Prateleiras ou nichos',
    categoria: 'banheiro-quintal',
    subCategoria: 'Organização e Armazenamento',
    descricao: 'Prateleiras para organização',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-011',
    nome: 'Cestos organizadores para produtos de higiene',
    categoria: 'banheiro-quintal',
    subCategoria: 'Organização e Armazenamento',
    descricao: 'Cestos para organizar produtos',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-012',
    nome: 'Ganchos ou suportes para pendurar toalhas',
    categoria: 'banheiro-quintal',
    subCategoria: 'Organização e Armazenamento',
    descricao: 'Suportes para toalhas',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Outros Itens Úteis
  {
    id: 'ban-013',
    nome: 'Escova para limpeza do vaso sanitário',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Escova específica para vaso',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-014',
    nome: 'Mangueira',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Mangueira para quintal',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-015',
    nome: 'Difusor de aromas ou spray para ambiente',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Aromatizador para banheiro',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-016',
    nome: 'Vassoura',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Vassoura para limpeza',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-017',
    nome: 'Máquina de Lavar',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Máquina de lavar roupas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-018',
    nome: 'Varal',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Varal para secar roupas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-019',
    nome: 'Rodo',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Rodo para limpeza do chão',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-020',
    nome: 'Pá',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Pá para lixo',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-021',
    nome: 'Lixeira grande',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Lixeira para área de serviço',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ban-022',
    nome: 'Sexto de roupa',
    categoria: 'banheiro-quintal',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Cesto para roupas sujas',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // QUARTO
  // Móveis Principais
  {
    id: 'qua-001',
    nome: 'Cama',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Cama de casal com colchão',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-002',
    nome: 'Colchão',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Colchão de casal',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-003',
    nome: 'Mesa de canto',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Mesa de cabeceira (2 unidades)',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-004',
    nome: 'Guarda-roupa',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Armário para roupas',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-005',
    nome: 'Cômoda',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Cômoda para roupas íntimas',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-006',
    nome: 'Espelho de corpo inteiro',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Espelho grande para quarto',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-007',
    nome: 'Penteadeira',
    categoria: 'quarto',
    subCategoria: 'Móveis Principais',
    descricao: 'Penteadeira com espelho',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Roupa de Cama
  {
    id: 'qua-008',
    nome: '3 Jogos de lençol',
    categoria: 'quarto',
    subCategoria: 'Roupa de Cama',
    descricao: 'Jogos de lençol de casal',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-009',
    nome: '3 Edredom',
    categoria: 'quarto',
    subCategoria: 'Roupa de Cama',
    descricao: 'Edredons para diferentes estações',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-010',
    nome: 'Fronhas',
    categoria: 'quarto',
    subCategoria: 'Roupa de Cama',
    descricao: 'Fronhas extras',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-011',
    nome: '3 Cobertor',
    categoria: 'quarto',
    subCategoria: 'Roupa de Cama',
    descricao: 'Cobertores para inverno',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-012',
    nome: 'Travesseiros',
    categoria: 'quarto',
    subCategoria: 'Roupa de Cama',
    descricao: 'Travesseiros para o casal',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-013',
    nome: 'Capas protetoras para colchão e travesseiro',
    categoria: 'quarto',
    subCategoria: 'Roupa de Cama',
    descricao: 'Capas impermeáveis',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Decoração e Conforto
  {
    id: 'qua-014',
    nome: 'Almofadas decorativas',
    categoria: 'quarto',
    subCategoria: 'Decoração e Conforto',
    descricao: 'Almofadas para decorar a cama',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-015',
    nome: 'Cortinas ou persianas',
    categoria: 'quarto',
    subCategoria: 'Decoração e Conforto',
    descricao: 'Cortinas para privacidade',
    adquirido: false,
    prioridade: 'alta',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-016',
    nome: 'Tapetes',
    categoria: 'quarto',
    subCategoria: 'Decoração e Conforto',
    descricao: 'Tapetes para quarto',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-017',
    nome: 'Abajur ou luminária',
    categoria: 'quarto',
    subCategoria: 'Decoração e Conforto',
    descricao: 'Iluminação suave para quarto',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-018',
    nome: 'Quadros ou objetos decorativos',
    categoria: 'quarto',
    subCategoria: 'Decoração e Conforto',
    descricao: 'Decoração para as paredes',
    adquirido: false,
    prioridade: 'baixa',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Outros Itens Úteis
  {
    id: 'qua-019',
    nome: 'Cabides para roupas',
    categoria: 'quarto',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Cabides para guarda-roupa',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-020',
    nome: 'Cestos organizadores',
    categoria: 'quarto',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Cestos para organização',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-021',
    nome: 'Ventilador',
    categoria: 'quarto',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Ventilador para quarto',
    adquirido: false,
    prioridade: 'media',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'qua-022',
    nome: 'Luzes',
    categoria: 'quarto',
    subCategoria: 'Outros Itens Úteis',
    descricao: 'Iluminação principal do quarto',
    adquirido: false,
    prioridade: 'essencial',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];