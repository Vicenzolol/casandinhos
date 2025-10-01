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
  createdAt: Date;
  updatedAt: Date;
  reservas?: Reserva[];
}

export interface Reserva {
  id: string;
  nomeConvidado: string;
  dataReserva: Date;
  comentario?: string | null;
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