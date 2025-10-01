import React, { useState, useMemo } from 'react';
import { useEnxoval } from '../hooks/useEnxoval';
import { categoriasInfo } from '../data/itensIniciais';
import type { EnxovalItem } from '../types';
import { DateEditor } from './DateEditor';
import '../styles/ItemList.css';

interface ItemListProps {
  onEditItem?: (item: EnxovalItem) => void;
  onDeleteItem?: (item: EnxovalItem) => void;
}

export const ItemList: React.FC<ItemListProps> = ({ onEditItem, onDeleteItem }) => {
  const { 
    itens, 
    filtros, 
    setFiltros, 
    marcarComoAdquirido,
    editarDataConquista
  } = useEnxoval();
  
  const [itemParaComentario, setItemParaComentario] = useState<string | null>(null);
  const [comentarioTemp, setComentarioTemp] = useState('');
  const [itemParaEditarData, setItemParaEditarData] = useState<EnxovalItem | null>(null);

  // Filtrar itens baseado nos filtros ativos
  const itensFiltrados = useMemo(() => {
    return itens.filter(item => {
      const matchCategoria = filtros.categoria === 'todas' || item.categoria === filtros.categoria;
      const matchStatus = filtros.status === 'todos' || 
        (filtros.status === 'adquirido' && item.adquirido) ||
        (filtros.status === 'pendente' && !item.adquirido);
      const matchPrioridade = filtros.prioridade === 'todas' || item.prioridade === filtros.prioridade;
      const matchBusca = filtros.busca === '' || 
        item.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        (item.descricao?.toLowerCase().includes(filtros.busca.toLowerCase()) ?? false);

      return matchCategoria && matchStatus && matchPrioridade && matchBusca;
    });
  }, [itens, filtros]);

  // Agrupar itens por categoria
  const itensAgrupados = useMemo(() => {
    const grupos = itensFiltrados.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
      return acc;
    }, {} as Record<string, EnxovalItem[]>);

    // Ordenar itens dentro de cada grupo por prioridade e nome
    Object.keys(grupos).forEach(categoria => {
      grupos[categoria].sort((a, b) => {
        const prioridadeOrder = { 'essencial': 0, 'alta': 1, 'media': 2, 'baixa': 3 };
        const prioridadeDiff = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
        if (prioridadeDiff !== 0) return prioridadeDiff;
        return a.nome.localeCompare(b.nome);
      });
    });

    return grupos;
  }, [itensFiltrados]);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'essencial': return '#e74c3c';
      case 'alta': return '#f39c12';
      case 'media': return '#f1c40f';
      case 'baixa': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case 'essencial': return 'Essencial';
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Normal';
    }
  };

  const handleToggleAdquirido = (item: EnxovalItem) => {
    if (!item.adquirido) {
      // Se está marcando como adquirido, perguntar por comentário
      setItemParaComentario(item.id);
      setComentarioTemp(item.comentario || '');
    } else {
      // Se está desmarcando, apenas alternar
      marcarComoAdquirido(item.id);
    }
  };

  const handleSalvarComentario = () => {
    if (itemParaComentario) {
      marcarComoAdquirido(itemParaComentario, comentarioTemp);
      setItemParaComentario(null);
      setComentarioTemp('');
    }
  };

  const handleCancelarComentario = () => {
    setItemParaComentario(null);
    setComentarioTemp('');
  };

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  };

  return (
    <div className="item-list">
      <div className="list-header">
        <h2>Lista de Itens</h2>
        <div className="list-stats">
          <span className="total-items">{itensFiltrados.length} itens</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Categoria:</label>
          <select 
            value={filtros.categoria} 
            onChange={(e) => setFiltros({ categoria: e.target.value as 'todas' | 'cozinha' | 'sala-copa' | 'banheiro-quintal' | 'quarto' })}
          >
            <option value="todas">Todas</option>
            {Object.values(categoriasInfo).map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filtros.status} 
            onChange={(e) => setFiltros({ status: e.target.value as 'todos' | 'adquirido' | 'pendente' })}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="adquirido">Adquiridos</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Prioridade:</label>
          <select 
            value={filtros.prioridade} 
            onChange={(e) => setFiltros({ prioridade: e.target.value as 'todas' | 'baixa' | 'media' | 'alta' | 'essencial' })}
          >
            <option value="todas">Todas</option>
            <option value="essencial">Essencial</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Digite para buscar..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ busca: e.target.value })}
          />
        </div>
      </div>

      <div className="items-container">
        {Object.entries(itensAgrupados).map(([categoriaId, itensCategoria]) => {
          const categoriaInfo = categoriasInfo[categoriaId as keyof typeof categoriasInfo];
          
          return (
            <div key={categoriaId} className="category-section">
              <div className="category-title">
                <span className="category-icon">{categoriaInfo.icon}</span>
                <h3>{categoriaInfo.nome}</h3>
                <span className="category-count">({itensCategoria.length})</span>
              </div>

              <div className="items-grid">
                {itensCategoria.map(item => (
                  <div 
                    key={item.id} 
                    className={`item-card ${item.adquirido ? 'acquired' : 'pending'}`}
                  >
                    <div className="item-header">
                      <div className="item-title">
                        <h4>{item.nome}</h4>
                        <div 
                          className="priority-badge"
                          style={{ backgroundColor: getPrioridadeColor(item.prioridade) }}
                        >
                          {getPrioridadeLabel(item.prioridade)}
                        </div>
                      </div>
                      
                      <div className="item-actions">
                        <button
                          className={`toggle-btn ${item.adquirido ? 'acquired' : 'pending'}`}
                          onClick={() => handleToggleAdquirido(item)}
                        >
                          {item.adquirido ? '✓' : '○'}
                        </button>
                        
                        {onEditItem && (
                          <button
                            className="edit-btn"
                            onClick={() => onEditItem(item)}
                          >
                            ✎
                          </button>
                        )}
                        
                        {onDeleteItem && (
                          <button
                            className="delete-btn"
                            onClick={() => onDeleteItem(item)}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>

                    {item.subCategoria && (
                      <div className="item-subcategory">{item.subCategoria}</div>
                    )}

                    {item.descricao && (
                      <div className="item-description">{item.descricao}</div>
                    )}

                    {item.adquirido && (
                      <div className="conquest-info">
                        <span 
                          className={`conquest-date ${item.dataConquista ? 'date-clickable' : 'no-date date-clickable'}`}
                          onClick={() => setItemParaEditarData(item)}
                          title="Clique para editar a data"
                        >
                          {item.dataConquista 
                            ? `Conquistado em: ${formatarData(item.dataConquista)}`
                            : 'Clique para definir a data de conquista'
                          }
                        </span>
                      </div>
                    )}

                    {item.comentario && (
                      <div className="item-comment">
                        <strong>Comentário:</strong> {item.comentario}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {itensFiltrados.length === 0 && (
        <div className="empty-state">
          <p>Nenhum item foi encontrado com os filtros aplicados.</p>
          <button 
            onClick={() => setFiltros({ categoria: 'todas', status: 'todos', prioridade: 'todas', busca: '' })}
            className="reset-filters-btn"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Modal para comentário */}
      {itemParaComentario && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Parabéns! 🎉</h3>
            <p>Você conquistou mais um item! Quer deixar um comentário?</p>
            <textarea
              value={comentarioTemp}
              onChange={(e) => setComentarioTemp(e.target.value)}
              placeholder="Ex: Comprei na loja X por R$ 100,00"
              rows={3}
            />
            <div className="modal-actions">
              <button onClick={handleCancelarComentario} className="cancel-btn">
                Cancelar
              </button>
              <button onClick={handleSalvarComentario} className="save-btn">
                Marcar como Conquistado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor de data */}
      {itemParaEditarData && (
        <DateEditor
          item={itemParaEditarData}
          onSave={(novaData) => {
            editarDataConquista(itemParaEditarData.id, novaData);
            setItemParaEditarData(null);
          }}
          onCancel={() => setItemParaEditarData(null)}
        />
      )}
    </div>
  );
};