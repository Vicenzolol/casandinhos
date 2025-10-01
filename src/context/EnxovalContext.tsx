import { createContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { EnxovalItem, FiltroEstado, EstatisticasEnxoval, Categoria } from '../types';
import { itensIniciais } from '../data/itensIniciais';

interface EnxovalState {
  itens: EnxovalItem[];
  filtros: FiltroEstado;
  estatisticas: EstatisticasEnxoval;
  loading: boolean;
}

type EnxovalAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITENS'; payload: EnxovalItem[] }
  | { type: 'ADD_ITEM'; payload: EnxovalItem }
  | { type: 'UPDATE_ITEM'; payload: EnxovalItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'TOGGLE_ADQUIRIDO'; payload: { id: string; comentario?: string } }
  | { type: 'EDITAR_DATA_CONQUISTA'; payload: { id: string; novaData: Date } }
  | { type: 'ADD_RESERVA'; payload: { itemId: string; nomeConvidado: string; comentario?: string } }
  | { type: 'REMOVE_RESERVA'; payload: { itemId: string; reservaId: string } }
  | { type: 'SET_FILTROS'; payload: Partial<FiltroEstado> }
  | { type: 'UPDATE_ESTATISTICAS' };

interface EnxovalContextType extends EnxovalState {
  adicionarItem: (item: Omit<EnxovalItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  atualizarItem: (item: EnxovalItem) => void;
  removerItem: (id: string) => void;
  marcarComoAdquirido: (id: string, comentario?: string) => void;
  editarDataConquista: (id: string, novaData: Date) => void;
  adicionarReserva: (itemId: string, nomeConvidado: string, comentario?: string) => void;
  removerReserva: (itemId: string, reservaId: string) => void;
  setFiltros: (filtros: Partial<FiltroEstado>) => void;
  resetarFiltros: () => void;
  importarItensIniciais: () => void;
}

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
    if (!acc[item.categoria]) {
      acc[item.categoria] = { total: 0, adquiridos: 0, porcentagem: 0 };
    }
    acc[item.categoria].total++;
    if (item.adquirido) {
      acc[item.categoria].adquiridos++;
    }
    acc[item.categoria].porcentagem = 
      acc[item.categoria].total > 0 
        ? (acc[item.categoria].adquiridos / acc[item.categoria].total) * 100 
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

function enxovalReducer(state: EnxovalState, action: EnxovalAction): EnxovalState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ITENS':
      return { 
        ...state, 
        itens: action.payload,
        estatisticas: calcularEstatisticas(action.payload)
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
    
    case 'TOGGLE_ADQUIRIDO': {
      const novosItens = state.itens.map(item => {
        if (item.id === action.payload.id) {
          const novoStatus = !item.adquirido;
          return {
            ...item,
            adquirido: novoStatus,
            comentario: action.payload.comentario || item.comentario,
            dataConquista: novoStatus ? new Date() : undefined,
            updatedAt: new Date()
          };
        }
        return item;
      });
      return { 
        ...state, 
        itens: novosItens,
        estatisticas: calcularEstatisticas(novosItens)
      };
    }
    
    case 'EDITAR_DATA_CONQUISTA': {
      const novosItens = state.itens.map(item => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            dataConquista: action.payload.novaData,
            updatedAt: new Date()
          };
        }
        return item;
      });
      return { 
        ...state, 
        itens: novosItens,
        estatisticas: calcularEstatisticas(novosItens)
      };
    }
    
    case 'ADD_RESERVA': {
      const novosItens = state.itens.map(item => {
        if (item.id === action.payload.itemId) {
          const novaReserva = {
            id: `reserva-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nomeConvidado: action.payload.nomeConvidado,
            dataReserva: new Date(),
            comentario: action.payload.comentario
          };
          return {
            ...item,
            reservas: [...(item.reservas || []), novaReserva],
            updatedAt: new Date()
          };
        }
        return item;
      });
      return { 
        ...state, 
        itens: novosItens,
        estatisticas: calcularEstatisticas(novosItens)
      };
    }
    
    case 'REMOVE_RESERVA': {
      const novosItens = state.itens.map(item => {
        if (item.id === action.payload.itemId) {
          return {
            ...item,
            reservas: (item.reservas || []).filter(r => r.id !== action.payload.reservaId),
            updatedAt: new Date()
          };
        }
        return item;
      });
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

export const EnxovalContext = createContext<EnxovalContextType | undefined>(undefined);

export function EnxovalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(enxovalReducer, initialState);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const carregarDados = () => {
      try {
        const dadosSalvos = localStorage.getItem('enxoval-casandinhos');
        if (dadosSalvos) {
          const itens = JSON.parse(dadosSalvos).map((item: EnxovalItem & { createdAt: string; updatedAt: string; dataConquista?: string }) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            dataConquista: item.dataConquista ? new Date(item.dataConquista) : undefined
          }));
          dispatch({ type: 'SET_ITENS', payload: itens });
        } else {
          // Se não há dados salvos, usar itens iniciais
          dispatch({ type: 'SET_ITENS', payload: itensIniciais });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
        dispatch({ type: 'SET_ITENS', payload: itensIniciais });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    carregarDados();
  }, []);

  // Salvar no localStorage sempre que os itens mudarem
  useEffect(() => {
    if (!state.loading && state.itens.length > 0) {
      localStorage.setItem('enxoval-casandinhos', JSON.stringify(state.itens));
    }
  }, [state.itens, state.loading]);

  const adicionarItem = (itemData: Omit<EnxovalItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoItem: EnxovalItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_ITEM', payload: novoItem });
  };

  const atualizarItem = (item: EnxovalItem) => {
    const itemAtualizado = {
      ...item,
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_ITEM', payload: itemAtualizado });
  };

  const removerItem = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  const marcarComoAdquirido = (id: string, comentario?: string) => {
    dispatch({ type: 'TOGGLE_ADQUIRIDO', payload: { id, comentario } });
  };

  const editarDataConquista = (id: string, novaData: Date) => {
    dispatch({ type: 'EDITAR_DATA_CONQUISTA', payload: { id, novaData } });
  };

  const adicionarReserva = (itemId: string, nomeConvidado: string, comentario?: string) => {
    dispatch({ type: 'ADD_RESERVA', payload: { itemId, nomeConvidado, comentario } });
  };

  const removerReserva = (itemId: string, reservaId: string) => {
    dispatch({ type: 'REMOVE_RESERVA', payload: { itemId, reservaId } });
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

  const importarItensIniciais = () => {
    const itensParaImportar = itensIniciais.filter(itemInicial => 
      !state.itens.some(item => item.nome.toLowerCase() === itemInicial.nome.toLowerCase())
    );
    
    itensParaImportar.forEach(item => {
      dispatch({ type: 'ADD_ITEM', payload: item });
    });
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
    importarItensIniciais
  };

  return (
    <EnxovalContext.Provider value={contextValue}>
      {children}
    </EnxovalContext.Provider>
  );
}
