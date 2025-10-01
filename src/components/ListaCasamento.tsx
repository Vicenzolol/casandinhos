import React, { useState } from 'react';
import { useEnxoval } from '../hooks/useEnxoval';
import { useAuth } from '../hooks/useAuth';
import { categoriasInfo } from '../data/itensIniciais';
import type { EnxovalItem } from '../types';
import '../styles/ListaCasamento.css';

interface ReservaModalProps {
  item: EnxovalItem;
  onClose: () => void;
  onReservar: (comentario?: string) => void;
}

const ReservaModal: React.FC<ReservaModalProps> = ({ item, onClose, onReservar }) => {
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReservar(comentario.trim() || undefined);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal reserva-modal">
        <div className="modal-header">
          <h3>🎁 Reservar Presente</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <div className="item-info">
            <h4>{item.nome}</h4>
            <p>{item.descricao}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="comentario">Comentário (opcional):</label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ex: Vou comprar na loja X"
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancelar
              </button>
              <button type="submit" className="reserve-btn">
                🎁 Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ListaCasamento: React.FC = () => {
  const { itens, adicionarReserva, removerReserva } = useEnxoval();
  const { user, isAdmin } = useAuth();
  const [itemParaReservar, setItemParaReservar] = useState<EnxovalItem | null>(null);

  // Filtra apenas itens não adquiridos para mostrar aos convidados
  const itensDisponiveis = itens.filter(item => !item.adquirido);

  // Agrupa por categoria
  const itensPorCategoria = itensDisponiveis.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, EnxovalItem[]>);

  const handleReservar = (comentario?: string) => {
    if (itemParaReservar) {
      adicionarReserva(itemParaReservar.id, comentario);
    }
  };



  const getStatusItem = (item: EnxovalItem) => {
    const reservas = item.reservas || [];
    if (reservas.length === 0) return 'disponivel';
    return 'reservado';
  };

  return (
    <div className="lista-casamento">
      <div className="casamento-header">
        <h1>💕 Lista de Casamento</h1>
        <h2>Vicenzo & Flaviana</h2>
        <p className="casamento-description">
          Queridos amigos e familiares, aqui vocês podem ver o que ainda precisamos para nossa casa nova! 
          Cliquem em "Vou dar este presente" para nos ajudar. Vocês podem escolher o mesmo item juntos! 💖
        </p>
      </div>

      <div className="casamento-stats">
        <div className="stat-card">
          <span className="stat-number">{itensDisponiveis.length}</span>
          <span className="stat-label">Itens na Lista</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {itensDisponiveis.filter(item => (item.reservas || []).length > 0).length}
          </span>
          <span className="stat-label">Já Reservados</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {itensDisponiveis.filter(item => (item.reservas || []).length === 0).length}
          </span>
          <span className="stat-label">Ainda Disponíveis</span>
        </div>
      </div>

      <div className="categorias-casamento">
        {Object.entries(itensPorCategoria).map(([categoria, itens]) => {
          const categoriaInfo = categoriasInfo[categoria as keyof typeof categoriasInfo];
          return (
            <div key={categoria} className="categoria-casamento">
              <div className="categoria-header">
                <span className="categoria-icon">{categoriaInfo.icon}</span>
                <h3>{categoriaInfo.nome}</h3>
                <span className="categoria-count">{itens.length} itens</span>
              </div>

              <div className="itens-casamento-grid">
                {itens.map(item => {
                  const status = getStatusItem(item);
                  const reservas = item.reservas || [];
                  
                  return (
                    <div key={item.id} className={`item-casamento-card ${status}`}>
                      <div className="item-casamento-header">
                        <h4 className="item-casamento-nome">{item.nome}</h4>
                        <div className={`status-badge ${status}`}>
                          {status === 'disponivel' ? '✨ Disponível' : '🎁 Reservado'}
                        </div>
                      </div>

                      {item.descricao && (
                        <p className="item-casamento-description">{item.descricao}</p>
                      )}

                      <div className="item-casamento-priority">
                        <span className={`priority-indicator ${item.prioridade}`}>
                          {item.prioridade === 'essencial' && '🔥 Essencial'}
                          {item.prioridade === 'alta' && '⭐ Alta Prioridade'}
                          {item.prioridade === 'media' && '📝 Média Prioridade'}
                          {item.prioridade === 'baixa' && '💡 Baixa Prioridade'}
                        </span>
                      </div>

                      {reservas.length > 0 && (
                        <div className="reservas-info">
                          <h5>Quem vai dar:</h5>
                          {reservas.map(reserva => (
                            <div key={reserva.id} className="reserva-item">
                              <div className="reserva-content">
                                <span className="reserva-nome">💝 {reserva.nomeConvidado}</span>
                                {reserva.comentario && (
                                  <span className="reserva-comentario">{reserva.comentario}</span>
                                )}
                              </div>
                              {(isAdmin() || (user && reserva.nomeConvidado === user.nome)) && (
                                <button
                                  className="remover-reserva-btn"
                                  onClick={() => removerReserva(item.id, reserva.id)}
                                  title="Remover reserva"
                                >
                                  ❌
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        className="reservar-btn"
                        onClick={() => setItemParaReservar(item)}
                      >
                        🎁 Vou dar este presente!
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {itensDisponiveis.length === 0 && (
        <div className="empty-state">
          <h3>🎉 Uau! Todos os itens já foram adquiridos!</h3>
          <p>Muito obrigado pelo carinho de todos! 💕</p>
        </div>
      )}

      {itemParaReservar && (
        <ReservaModal
          item={itemParaReservar}
          onClose={() => setItemParaReservar(null)}
          onReservar={handleReservar}
        />
      )}
    </div>
  );
};