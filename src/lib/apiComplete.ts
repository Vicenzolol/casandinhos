// API client para itens, reservas e convidados
import { apiRequest } from './api';
import type { ConflitoCheckout, Convidado, ItemPublico, MinhaReserva } from '../types';

export interface EnxovalItemAPI {
  id: string;
  nome: string;
  categoria: string;
  subCategoria?: string | null;
  descricao?: string | null;
  adquirido: boolean;
  comentario?: string | null;
  dataConquista?: string | null;
  prioridade: string;
  links?: string[];
  createdAt: string;
  updatedAt: string;
  reservas?: ReservaAPI[];
}

export interface ReservaAPI {
  id: string;
  comentario?: string | null;
  dataReserva: string;
  user: {
    id: number;
    nome: string;
    isAdmin?: boolean;
  };
}

export type ItemPayload = Partial<Omit<EnxovalItemAPI, 'id' | 'createdAt' | 'updatedAt' | 'reservas'>>;

// API para itens do enxoval (admin)
export const enxovalApi = {
  getItems() {
    return apiRequest<{ items: EnxovalItemAPI[] }>('/items');
  },

  createItem(item: ItemPayload) {
    return apiRequest<{ item: EnxovalItemAPI }>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateItem(id: string, item: ItemPayload) {
    return apiRequest<{ item: EnxovalItemAPI }>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  deleteItem(id: string) {
    return apiRequest(`/items/${id}`, { method: 'DELETE' });
  },

  createReserva(itemId: string, comentario?: string) {
    return apiRequest<{ reserva: ReservaAPI }>('/reservas', {
      method: 'POST',
      body: JSON.stringify({ itemId, comentario }),
    });
  },

  deleteReserva(reservaId: string) {
    return apiRequest(`/reservas/${reservaId}`, { method: 'DELETE' });
  }
};

// Lista pública e reservas do convidado
export const presentesApi = {
  getItensPublicos() {
    return apiRequest<{ items: ItemPublico[]; multiplosPresenteadores: boolean }>('/public/items');
  },

  checkout(itens: { itemId: string; aceitaDividir: boolean }[]) {
    return apiRequest<{ criadas: number; conflitos: ConflitoCheckout[] }>('/reservas/checkout', {
      method: 'POST',
      body: JSON.stringify({ itens }),
    });
  },

  minhasReservas() {
    return apiRequest<{ reservas: MinhaReserva[] }>('/me/reservas');
  },

  cancelarReserva(reservaId: string) {
    return apiRequest(`/reservas/${reservaId}`, { method: 'DELETE' });
  }
};

// Gestão de convidados (admin)
export interface ConvidadoPayload {
  nome: string;
  email: string;
  telefone?: string;
}

export const convidadosApi = {
  listar() {
    return apiRequest<{ convidados: Convidado[] }>('/admin/convidados');
  },

  criar(dados: ConvidadoPayload) {
    return apiRequest<{ convidado: Convidado; senha: string }>('/admin/convidados', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  editar(id: number, dados: ConvidadoPayload) {
    return apiRequest<{ convidado: Omit<Convidado, 'reservas'> }>(`/admin/convidados/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  novaSenha(id: number) {
    return apiRequest<{ senha: string }>(`/admin/convidados/${id}/senha`, { method: 'POST' });
  },

  remover(id: number) {
    return apiRequest(`/admin/convidados/${id}`, { method: 'DELETE' });
  }
};
