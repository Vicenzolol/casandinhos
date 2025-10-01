import React, { useState } from 'react';
import type { EnxovalItem } from '../types';
import '../styles/DateEditor.css';
import '../styles/DateEditor.css';

interface DateEditorProps {
  item: EnxovalItem;
  onSave: (novaData: Date) => void;
  onCancel: () => void;
}

export const DateEditor: React.FC<DateEditorProps> = ({ item, onSave, onCancel }) => {
  const [dataInput, setDataInput] = useState(() => {
    if (item.dataConquista) {
      // Converter para formato YYYY-MM-DD para o input date
      const data = new Date(item.dataConquista);
      return data.toISOString().split('T')[0];
    }
    // Data atual como padrão
    return new Date().toISOString().split('T')[0];
  });

  const handleSave = () => {
    const novaData = new Date(dataInput + 'T12:00:00'); // Meio-dia para evitar problemas de timezone
    onSave(novaData);
  };

  const formatarDataDisplay = (dataStr: string) => {
    const data = new Date(dataStr + 'T12:00:00');
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  };

  return (
    <div className="date-editor-overlay">
      <div className="date-editor-modal">
        <div className="date-editor-header">
          <h3>Editar Data de Conquista</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="date-editor-content">
          <div className="item-info">
            <strong>{item.nome}</strong>
          </div>
          
          <div className="date-input-group">
            <label htmlFor="data-conquista">Data da conquista:</label>
            <input
              id="data-conquista"
              type="date"
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
            />
            <div className="date-preview">
              Será exibido como: <strong>{formatarDataDisplay(dataInput)}</strong>
            </div>
          </div>
        </div>

        <div className="date-editor-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button onClick={handleSave} className="save-btn">
            Salvar Data
          </button>
        </div>
      </div>
    </div>
  );
};