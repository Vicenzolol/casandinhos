import { useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { EnxovalItem, FiltroEstado, Categoria, EstatisticasEnxoval } from '../types';
import { enxovalApi, type EnxovalItemAPI } from '../lib/apiComplete';
import { EnxovalContext, type EnxovalContextType, type EnxovalState } from './contextos';
import { useAviso } from '../hooks/useAviso';

type EnxovalAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_ITENS'; payload: EnxovalItem[] }
  | { type: 'ADD_ITEM'; payload: EnxovalItem }
  | { type: 'UPDATE_ITEM'; payload: EnxovalItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_FILTROS'; payload: Partial<FiltroEstado> }
  | { type: 'UPDATE_ESTATISTICAS' };

const initialState: EnxovalState = {
  itens: [],
  filtros: {
    categoria: 'todas',
    status: 'todos',
    prioridade: 'todas',
    busca: ''
  },
  estatisticas: {
    total: 0,
    adquiridos: 0,
    pendentes: 0,
    porcentagemCompleta: 0,
    porCategoria: {
      'cozinha': { total: 0, adquiridos: 0, porcentagem: 0 },
      'sala-copa': { total: 0, adquiridos: 0, porcentagem: 0 },
      'banheiro-quintal': { total: 0, adquiridos: 0, porcentagem: 0 },
      'quarto': { total: 0, adquiridos: 0, porcentagem: 0 }
    }
  },
  loading: true
};

function calcularEstatisticas(itens: EnxovalItem[]): EstatisticasEnxoval {
  const total = itens.length;
  const adquiridos = itens.filter(item => item.adquirido).length;
  const pendentes = total - adquiridos;
  const porcentagemCompleta = total > 0 ? (adquiridos / total) * 100 : 0;

  const porCategoria = itens.reduce((acc, item) => {
    if (!acc[item.categoria as Categoria]) {
      acc[item.categoria as Categoria] = { total: 0, adquiridos: 0, porcentagem: 0 };
    }
    acc[item.categoria as Categoria].total++;
    if (item.adquirido) {
      acc[item.categoria as Categoria].adquiridos++;
    }
    acc[item.categoria as Categoria].porcentagem = 
      acc[item.categoria as Categoria].total > 0 
        ? (acc[item.categoria as Categoria].adquiridos / acc[item.categoria as Categoria].total) * 100 
        : 0;
    return acc;
  }, {} as Record<Categoria, { total: number; adquiridos: number; porcentagem: number }>);

  // Garantir que todas as categorias existam
  const categorias: Categoria[] = ['cozinha', 'sala-copa', 'banheiro-quintal', 'quarto'];
  categorias.forEach(cat => {
    if (!porCategoria[cat]) {
      porCategoria[cat] = { total: 0, adquiridos: 0, porcentagem: 0 };
    }
  });

  return {
    total,
    adquiridos,
    pendentes,
    porcentagemCompleta,
    porCategoria
  };
}

// Converter item da API para o formato local
function convertApiItemToLocal(apiItem: EnxovalItemAPI): EnxovalItem {
  return {
    id: apiItem.id,
    nome: apiItem.nome,
    categoria: apiItem.categoria as Categoria,
    subCategoria: apiItem.subCategoria ?? undefined,
    descricao: apiItem.descricao ?? undefined,
    adquirido: apiItem.adquirido,
    comentario: apiItem.comentario,
    dataConquista: apiItem.dataConquista ? new Date(apiItem.dataConquista) : undefined,
    prioridade: apiItem.prioridade as 'essencial' | 'alta' | 'media' | 'baixa',
    links: apiItem.links ?? [],
    createdAt: new Date(apiItem.createdAt),
    updatedAt: new Date(apiItem.updatedAt),
    reservas: apiItem.reservas ? apiItem.reservas.map(reserva => ({
      id: reserva.id,
      nomeConvidado: reserva.user.nome,
      dataReserva: new Date(reserva.dataReserva),
      comentario: reserva.comentario,
      isAdminReserva: reserva.user.isAdmin ?? false
    })) : []
  };
}

function enxovalReducer(state: EnxovalState, action: EnxovalAction): EnxovalState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ITENS':
      return { 
        ...state, 
        itens: action.payload,
        estatisticas: calcularEstatisticas(action.payload),
        error: undefined
      };
    
    case 'ADD_ITEM': {
      const novosItens = [...state.itens, action.payload];
      return { 
        ...state, 
        itens: novosItens,
        estatisticas: calcularEstatisticas(novosItens)
      };
    }
    
    case 'UPDATE_ITEM': {
      const novosItens = state.itens.map(item => 
        item.id === action.payload.id ? action.payload : item
      );
      return { 
        ...state, 
        itens: novosItens,
        estatisticas: calcularEstatisticas(novosItens)
      };
    }
    
    case 'DELETE_ITEM': {
      const novosItens = state.itens.filter(item => item.id !== action.payload);
      return { 
        ...state, 
        itens: novosItens,
        estatisticas: calcularEstatisticas(novosItens)
      };
    }
    
    case 'SET_FILTROS':
      return { 
        ...state, 
        filtros: { ...state.filtros, ...action.payload } 
      };
    
    case 'UPDATE_ESTATISTICAS':
      return { 
        ...state, 
        estatisticas: calcularEstatisticas(state.itens) 
      };
    
    default:
      return state;
  }
}

export function EnxovalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(enxovalReducer, initialState);
  const { avisar } = useAviso();

  // Erros da API aparecem para o usuário em vez de ficarem só no console
  useEffect(() => {
    if (state.error) avisar(state.error, 'erro');
  }, [state.error, avisar]);

  // Carregar dados da API na inicialização
  const carregarItens = async () => {
    try {
      console.log('🔄 Carregando itens da API...');
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await enxovalApi.getItems();
      
      console.log('📦 Resposta da API:', response);
      
      if (response.success && response.items) {
        const itensConvertidos = response.items.map(convertApiItemToLocal);
        console.log(`✅ ${itensConvertidos.length} itens carregados com sucesso!`);
        dispatch({ type: 'SET_ITENS', payload: itensConvertidos });
      } else {
        console.error('❌ Erro na API:', response.error);
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao carregar itens' });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar itens:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  const limparErro = () => dispatch({ type: 'SET_ERROR', payload: undefined });

  const adicionarItem = async (itemData: Omit<EnxovalItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    limparErro();
    try {
      const response = await enxovalApi.createItem({
        nome: itemData.nome,
        categoria: itemData.categoria,
        subCategoria: itemData.subCategoria,
        descricao: itemData.descricao,
        adquirido: itemData.adquirido,
        comentario: itemData.comentario,
        dataConquista: itemData.dataConquista?.toISOString(),
        prioridade: itemData.prioridade,
        links: itemData.links
      });

      if (response.success && response.item) {
        const itemConvertido = convertApiItemToLocal(response.item);
        dispatch({ type: 'ADD_ITEM', payload: itemConvertido });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao adicionar item' });
        return false;
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' });
      return false;
    }
  };

  const atualizarItem = async (item: EnxovalItem): Promise<boolean> => {
    limparErro();
    try {
      const response = await enxovalApi.updateItem(item.id, {
        nome: item.nome,
        categoria: item.categoria,
        subCategoria: item.subCategoria,
        descricao: item.descricao,
        adquirido: item.adquirido,
        comentario: item.comentario,
        dataConquista: item.dataConquista ? item.dataConquista.toISOString() : null,
        prioridade: item.prioridade,
        links: item.links
      });

      if (response.success && response.item) {
        const itemConvertido = convertApiItemToLocal(response.item);
        dispatch({ type: 'UPDATE_ITEM', payload: itemConvertido });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao atualizar item' });
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' });
      return false;
    }
  };

  const removerItem = async (id: string): Promise<boolean> => {
    limparErro();
    try {
      const response = await enxovalApi.deleteItem(id);

      if (response.success) {
        dispatch({ type: 'DELETE_ITEM', payload: id });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao remover item' });
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' });
      return false;
    }
  };

  const marcarComoAdquirido = async (id: string, comentario?: string): Promise<boolean> => {
    const item = state.itens.find(i => i.id === id);
    if (!item) return false;

    const itemAtualizado = {
      ...item,
      adquirido: !item.adquirido,
      comentario: comentario || item.comentario,
      dataConquista: !item.adquirido ? new Date() : undefined,
      updatedAt: new Date()
    };

    return atualizarItem(itemAtualizado);
  };

  const editarDataConquista = async (id: string, novaData: Date): Promise<boolean> => {
    const item = state.itens.find(i => i.id === id);
    if (!item) return false;

    const itemAtualizado = {
      ...item,
      dataConquista: novaData,
      updatedAt: new Date()
    };

    return atualizarItem(itemAtualizado);
  };

  const adicionarReserva = async (itemId: string, comentario?: string): Promise<boolean> => {
    limparErro();
    try {
      const response = await enxovalApi.createReserva(itemId, comentario);

      if (response.success) {
        // Recarregar os itens para obter as reservas atualizadas
        await carregarItens();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao criar reserva' });
        return false;
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' });
      return false;
    }
  };

  const removerReserva = async (_itemId: string, reservaId: string): Promise<boolean> => {
    limparErro();
    try {
      const response = await enxovalApi.deleteReserva(reservaId);

      if (response.success) {
        // Recarregar os itens para obter as reservas atualizadas
        await carregarItens();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao remover reserva' });
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover reserva:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' });
      return false;
    }
  };

  const setFiltros = (filtros: Partial<FiltroEstado>) => {
    dispatch({ type: 'SET_FILTROS', payload: filtros });
  };

  const resetarFiltros = () => {
    dispatch({ 
      type: 'SET_FILTROS', 
      payload: {
        categoria: 'todas',
        status: 'todos',
        prioridade: 'todas',
        busca: ''
      }
    });
  };

  const recarregarItens = async () => {
    await carregarItens();
  };

  const contextValue: EnxovalContextType = {
    ...state,
    adicionarItem,
    atualizarItem,
    removerItem,
    marcarComoAdquirido,
    editarDataConquista,
    adicionarReserva,
    removerReserva,
    setFiltros,
    resetarFiltros,
    recarregarItens
  };

  return (
    <EnxovalContext.Provider value={contextValue}>
      {children}
    </EnxovalContext.Provider>
  );
}