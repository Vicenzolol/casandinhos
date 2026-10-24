export interface EnxovalItem {
  id: string;
  nome: string;
  categoria: Categoria;
  subCategoria?: string;
  descricao?: string;
  adquirido: boolean;
  comentario?: string | null;
  dataConquista?: Date;
  prioridade: Prioridade;
  links: string[];
  createdAt: Date;
  updatedAt: Date;
  reservas?: Reserva[];
}

export interface Reserva {
  id: string;
  nomeConvidado: string;
  dataReserva: Date;
  comentario?: string | null;
  isAdminReserva?: boolean;
}

export type Categoria = 
  | 'cozinha'
  | 'sala-copa'
  | 'banheiro-quintal'
  | 'quarto';

export type Prioridade = 'baixa' | 'media' | 'alta' | 'essencial';

export interface CategoriaInfo {
  id: Categoria;
  nome: string;
  icon: string;
  cor: string;
  descricao: string;
}

export interface FiltroEstado {
  categoria: Categoria | 'todas';
  status: 'todos' | 'adquirido' | 'pendente';
  prioridade: Prioridade | 'todas';
  busca: string;
}

export interface EstatisticasEnxoval {
  total: number;
  adquiridos: number;
  pendentes: number;
  porcentagemCompleta: number;
  porCategoria: Record<Categoria, {
    total: number;
    adquiridos: number;
    porcentagem: number;
  }>;
}

// ===== Lista pública / carrinho =====

export interface ItemPublico {
  id: string;
  nome: string;
  categoria: string;
  subCategoria?: string | null;
  descricao?: string | null;
  prioridade: Prioridade;
  links: string[];
  escolhido: boolean;        // escolhido por outro convidado
  escolhidoPorMim: boolean;  // escolhido pelo usuário logado
}

export interface ItemCarrinho {
  itemId: string;
  nome: string;
  categoria: string;
  // O item já estava escolhido por alguém quando entrou no carrinho
  escolhidoAoAdicionar: boolean;
  // O convidado confirmou que quer dar junto com outra pessoa
  aceitaDividir: boolean;
  adicionadoEm: number;
}

export type StatusCarrinho = 'ok' | 'escolhido' | 'esgotado' | 'indisponivel';

export interface ConflitoCheckout {
  itemId: string;
  nome: string | null;
  motivo: 'indisponivel' | 'esgotado' | 'escolhido';
}

export interface MinhaReserva {
  id: string;
  comentario?: string | null;
  dataReserva: string;
  item: { id: string; nome: string; categoria: string; descricao?: string | null; adquirido: boolean };
}

export interface Convidado {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  createdAt: string;
  reservas: {
    id: string;
    comentario?: string | null;
    dataReserva: string;
    item: { id: string; nome: string; categoria: string };
  }[];
}
