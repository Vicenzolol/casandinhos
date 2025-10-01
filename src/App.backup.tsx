import { useState } from 'react';
import { EnxovalProvider } from './context/EnxovalContext';
import { useEnxoval } from './hooks/useEnxoval';
import { Dashboard } from './components/Dashboard';
import { ItemList } from './components/ItemList';
import { ListaCasamento } from './components/ListaCasamento';
import { ItemForm, DeleteConfirmation } from './components/ItemForm';
import type { EnxovalItem } from './types';
import './App.css';

function AppContent() {
  const { removerItem } = useEnxoval();
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'casamento'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EnxovalItem | undefined>();
  const [deletingItem, setDeletingItem] = useState<EnxovalItem | undefined>();

  const handleEditItem = (item: EnxovalItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = (item: EnxovalItem) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      removerItem(deletingItem.id);
      setDeletingItem(undefined);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  const handleSaveForm = () => {
    // Formulário já salva através do contexto
    setEditingItem(undefined);
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>🏡 Enxoval Casandinhos</h1>
          <p>Vicenzo & Flaviana</p>
        </div>
        
        <div className="nav-menu">
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            📝 Lista de Itens
          </button>
          <button 
            className={`nav-btn ${currentView === 'casamento' ? 'active' : ''}`}
            onClick={() => setCurrentView('casamento')}
          >
            💕 Lista de Casamento
          </button>
          <button 
            className="nav-btn add-btn"
            onClick={() => setShowForm(true)}
          >
            ➕ Adicionar Item
          </button>
        </div>
      </nav>

      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard onNavigateToList={() => setCurrentView('list')} />}
        {currentView === 'list' && (
          <ItemList 
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        {currentView === 'casamento' && <ListaCasamento />}
      </main>

      {/* Modais */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onClose={handleCloseForm}
          onSave={handleSaveForm}
        />
      )}

      {deletingItem && (
        <DeleteConfirmation
          item={deletingItem}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingItem(undefined)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <EnxovalProvider>
      <AppContent />
    </EnxovalProvider>
  );
}

export default App;