import React, { useState, useEffect } from 'react';
import { useEnxoval } from '../hooks/useEnxoval';
import { categoriasInfo } from '../data/itensIniciais';
import type { EnxovalItem, Categoria, Prioridade } from '../types';
import '../styles/ItemForm.css';

interface ItemFormProps {
  item?: EnxovalItem;
  onClose: () => void;
  onSave: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ item, onClose, onSave }) => {
  const { adicionarItem, atualizarItem } = useEnxoval();
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'cozinha' as Categoria,
    subCategoria: '',
    descricao: '',
    prioridade: 'media' as Prioridade,
    comentario: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário se editando item existente
  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome,
        categoria: item.categoria,
        subCategoria: item.subCategoria || '',
        descricao: item.descricao || '',
        prioridade: item.prioridade,
        comentario: item.comentario || ''
      });
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const itemData = {
      nome: formData.nome.trim(),
      categoria: formData.categoria,
      subCategoria: formData.subCategoria.trim() || undefined,
      descricao: formData.descricao.trim() || undefined,
      prioridade: formData.prioridade,
      adquirido: false,
      comentario: formData.comentario.trim() || null
    };

    if (item) {
      // Editando item existente
      atualizarItem({
        ...item,
        ...itemData
      });
    } else {
      // Criando novo item
      adicionarItem(itemData);
    }

    onSave();
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>{item ? 'Editar Item' : 'Adicionar Novo Item'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome do Item *</label>
              <input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={errors.nome ? 'error' : ''}
                placeholder="Ex: Fogão 4 bocas"
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoria *</label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={errors.categoria ? 'error' : ''}
              >
                {Object.values(categoriasInfo).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.nome}
                  </option>
                ))}
              </select>
              {errors.categoria && <span className="error-message">{errors.categoria}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subCategoria">Subcategoria</label>
              <input
                id="subCategoria"
                type="text"
                value={formData.subCategoria}
                onChange={(e) => handleInputChange('subCategoria', e.target.value)}
                placeholder="Ex: Eletrodomésticos e Equipamentos"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prioridade">Prioridade</label>
              <select
                id="prioridade"
                value={formData.prioridade}
                onChange={(e) => handleInputChange('prioridade', e.target.value)}
              >
                <option value="baixa">🟢 Baixa</option>
                <option value="media">🟡 Média</option>
                <option value="alta">🟠 Alta</option>
                <option value="essencial">🔴 Essencial</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Detalhes sobre o item, especificações, preferências..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comentario">Comentário</label>
            <textarea
              id="comentario"
              value={formData.comentario}
              onChange={(e) => handleInputChange('comentario', e.target.value)}
              placeholder="Comentários adicionais, onde comprar, preço estimado..."
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              {item ? 'Atualizar' : 'Adicionar'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationProps {
  item: EnxovalItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  item, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal small">
        <div className="modal-header delete-modal-header">
          <span className="delete-warning-icon">⚠️</span>
          <h2>Excluir item?</h2>
        </div>
        
        <div className="delete-content">
          <p>Você está prestes a excluir permanentemente:</p>
          <strong>"{item.nome}"</strong>
          <p className="delete-warning-text">Esta ação não pode ser desfeita.</p>
        </div>

        <div className="delete-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button onClick={onConfirm} className="destructive-btn">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};