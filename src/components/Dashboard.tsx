import React from 'react';
import { useEnxoval } from '../hooks/useEnxoval';
import { categoriasInfo } from '../data/itensIniciais';
import type { Categoria } from '../types';
import '../styles/Dashboard.css';

interface DashboardProps {
  onNavigateToList?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToList }) => {
  const { estatisticas, setFiltros } = useEnxoval();

  const handleCategoriaClick = (categoria: Categoria) => {
    setFiltros({ categoria });
    onNavigateToList?.();
  };

  const handleQuickActionClick = (filters: object) => {
    setFiltros(filters);
    onNavigateToList?.();
  };



  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏡 Enxoval de Casa Nova</h1>
        <p className="subtitle">Vicenzo & Flaviana</p>
      </div>

      <div className="progress-overview">
        <div className="progress-card main-progress">
          <h2>Progresso Geral</h2>
          <div className="progress-circle">
            <div 
              className="progress-ring"
              style={{
                background: `conic-gradient(#4ecdc4 0deg ${estatisticas.porcentagemCompleta * 3.6}deg, #e9ecef ${estatisticas.porcentagemCompleta * 3.6}deg 360deg)`
              }}
            >
              <div className="progress-inner">
                <span className="progress-value">{Math.round(estatisticas.porcentagemCompleta)}%</span>
                <span className="progress-label">Completo</span>
              </div>
            </div>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-number">{estatisticas.adquiridos}</span>
              <span className="stat-label">Conquistados</span>
            </div>
            <div className="stat">
              <span className="stat-number">{estatisticas.pendentes}</span>
              <span className="stat-label">Pendentes</span>
            </div>
            <div className="stat">
              <span className="stat-number">{estatisticas.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="categories-overview">
        <h2>Progresso por Categoria</h2>
        <div className="categories-grid">
          {Object.values(categoriasInfo).map((categoria) => {
            const stats = estatisticas.porCategoria[categoria.id];
            return (
              <div 
                key={categoria.id}
                className="category-card"
                onClick={() => handleCategoriaClick(categoria.id)}
              >
                <div className="category-header">
                  <span className="category-icon">{categoria.icon}</span>
                  <h3>{categoria.nome}</h3>
                </div>
                
                <div className="category-progress">
                  <div 
                    className="progress-bar"
                    style={{ backgroundColor: categoria.cor + '20' }}
                  >
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${stats.porcentagem}%`,
                        backgroundColor: categoria.cor
                      }}
                    />
                  </div>
                  <div className="category-stats">
                    <span className="percentage">{Math.round(stats.porcentagem)}%</span>
                    <span className="fraction">{stats.adquiridos}/{stats.total}</span>
                  </div>
                </div>

                <p className="category-description">{categoria.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-btn primary"
            onClick={() => handleQuickActionClick({ status: 'pendente', prioridade: 'essencial' })}
          >
            <span className="action-icon">🚨</span>
            <span>Itens Essenciais</span>
          </button>
          
          <button 
            className="action-btn success"
            onClick={() => handleQuickActionClick({ status: 'adquirido' })}
          >
            <span className="action-icon">✅</span>
            <span>Já Conquistados</span>
          </button>
          
          <button 
            className="action-btn warning"
            onClick={() => handleQuickActionClick({ prioridade: 'alta' })}
          >
            <span className="action-icon">⭐</span>
            <span>Alta Prioridade</span>
          </button>
          
          <button 
            className="action-btn info"
            onClick={() => handleQuickActionClick({ categoria: 'todas', status: 'todos', prioridade: 'todas', busca: '' })}
          >
            <span className="action-icon">🔄</span>
            <span>Ver Todos</span>
          </button>
        </div>
      </div>

      <div className="achievements">
        <h2>Conquistas</h2>
        <div className="achievements-grid">
          <div className={`achievement ${estatisticas.porcentagemCompleta >= 25 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🌟</span>
            <span className="achievement-title">Primeiro Passo</span>
            <span className="achievement-desc">25% completo</span>
          </div>
          
          <div className={`achievement ${estatisticas.porcentagemCompleta >= 50 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🔥</span>
            <span className="achievement-title">Na Metade</span>
            <span className="achievement-desc">50% completo</span>
          </div>
          
          <div className={`achievement ${estatisticas.porcentagemCompleta >= 75 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🚀</span>
            <span className="achievement-title">Quase Lá</span>
            <span className="achievement-desc">75% completo</span>
          </div>
          
          <div className={`achievement ${estatisticas.porcentagemCompleta >= 100 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🎉</span>
            <span className="achievement-title">Casa Completa!</span>
            <span className="achievement-desc">100% completo</span>
          </div>
        </div>
      </div>
    </div>
  );
};