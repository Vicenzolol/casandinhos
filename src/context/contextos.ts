// Objetos de contexto separados dos providers (necessário para o Fast Refresh do Vite)
import { createContext } from 'react';
import type { User } from '../lib/api';
import type {
  EnxovalItem, FiltroEstado, EstatisticasEnxoval,
  ItemPublico, ItemCarrinho, StatusCarrinho, ConflitoCheckout
} from '../types';

// ===== Auth =====
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  isAdmin: () => boolean;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Enxoval (admin) =====
export interface EnxovalState {
  itens: EnxovalItem[];
  filtros: FiltroEstado;
  estatisticas: EstatisticasEnxoval;
  loading: boolean;
  error?: string;
}
export interface EnxovalContextType extends EnxovalState {
  adicionarItem: (item: Omit<EnxovalItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  atualizarItem: (item: EnxovalItem) => Promise<boolean>;
  removerItem: (id: string) => Promise<boolean>;
  marcarComoAdquirido: (id: string, comentario?: string) => Promise<boolean>;
  editarDataConquista: (id: string, novaData: Date) => Promise<boolean>;
  adicionarReserva: (itemId: string, comentario?: string) => Promise<boolean>;
  removerReserva: (itemId: string, reservaId: string) => Promise<boolean>;
  setFiltros: (filtros: Partial<FiltroEstado>) => void;
  resetarFiltros: () => void;
  recarregarItens: () => Promise<void>;
}
export const EnxovalContext = createContext<EnxovalContextType | undefined>(undefined);

// ===== Presentes (lista pública + carrinho) =====
export interface ItemCarrinhoComStatus extends ItemCarrinho {
  status: StatusCarrinho;
}
export interface ResultadoCheckout {
  success: boolean;
  criadas?: number;
  conflitos?: ConflitoCheckout[];
  error?: string;
  precisaLogin?: boolean;
}
export interface PresentesContextType {
  itens: ItemPublico[];
  multiplosPresenteadores: boolean;
  carregando: boolean;
  erro?: string;
  recarregar: () => Promise<void>;
  carrinho: ItemCarrinhoComStatus[];
  noCarrinho: (itemId: string) => boolean;
  adicionarAoCarrinho: (item: ItemPublico) => void;
  removerDoCarrinho: (itemId: string) => void;
  darJunto: (itemId: string) => void;
  confirmarCarrinho: () => Promise<ResultadoCheckout>;
}
export const PresentesContext = createContext<PresentesContextType | undefined>(undefined);

// ===== Avisos (toasts) =====
export type TipoAviso = 'sucesso' | 'erro' | 'info';
export interface AvisoContextType {
  avisar: (mensagem: string, tipo?: TipoAviso) => void;
}
export const AvisoContext = createContext<AvisoContextType | undefined>(undefined);
