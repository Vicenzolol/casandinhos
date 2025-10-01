import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { EnxovalProvider } from './context/EnxovalContextAPI';
import { useAuth } from './hooks/useAuth';
import { useEnxoval } from './hooks/useEnxoval';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { ItemList } from './components/ItemList';
import { ListaCasamento } from './components/ListaCasamento';
import { ItemForm, DeleteConfirmation } from './components/ItemForm';
import PrismaTest from './components/PrismaTest';
import DiagnosticoProd from './components/DiagnosticoProd';
import type { EnxovalItem } from './types';
import './App.css';

function AppContent() {
  const { user, logout, isAdmin } = useAuth();
  const { removerItem } = useEnxoval();
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'casamento' | 'prisma-test' | 'diagnostico'>('dashboard');
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

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      await removerItem(deletingItem.id);
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

  const handleLogout = () => {
    logout();
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
          {isAdmin() && (
            <button 
              className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              📝 Lista de Itens
            </button>
          )}
          <button 
            className={`nav-btn ${currentView === 'casamento' ? 'active' : ''}`}
            onClick={() => setCurrentView('casamento')}
          >
            💕 Lista de Casamento
          </button>
          {isAdmin() && (
            <button 
              className={`nav-btn ${currentView === 'prisma-test' ? 'active' : ''}`}
              onClick={() => setCurrentView('prisma-test')}
            >
              🔍 Teste Prisma
            </button>
          )}
          {isAdmin() && (
            <button 
              className="nav-btn add-btn"
              onClick={() => setShowForm(true)}
            >
              ➕ Adicionar Item
            </button>
          )}
        </div>

        <div className="nav-user">
          <span>Olá, {user?.nome}!</span>
          {isAdmin() && <span className="admin-badge">Admin</span>}
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            🚪 Sair
          </button>
        </div>
      </nav>



      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard onNavigateToList={() => isAdmin() ? setCurrentView('list') : setCurrentView('casamento')} />}
        {currentView === 'list' && isAdmin() && (
          <ItemList 
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        {currentView === 'casamento' && <ListaCasamento />}
        {currentView === 'prisma-test' && isAdmin() && <PrismaTest />}
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

function AppWithAuth() {
  const { user, loading } = useAuth();
  
  // Verificar se estamos na rota de diagnóstico
  const isDiagnosticoRoute = window.location.pathname === '/diagnostico';

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <h2>Carregando...</h2>
        </div>
      </div>
    );
  }

  // Renderizar página de diagnóstico sem autenticação
  if (isDiagnosticoRoute) {
    return <DiagnosticoProd />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <EnxovalProvider>
      <AppContent />
    </EnxovalProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
