import { useCallback, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AvisoProvider } from './context/AvisoContext';
import { EnxovalProvider } from './context/EnxovalContextAPI';
import { PresentesProvider } from './context/PresentesContext';
import { useAuth } from './hooks/useAuth';
import { useEnxoval } from './hooks/useEnxoval';
import { Dashboard } from './components/Dashboard';
import { ItemList } from './components/ItemList';
import { ListaCasamento } from './components/ListaCasamento';
import { ItemForm, DeleteConfirmation } from './components/ItemForm';
import { Convidados } from './components/Convidados';
import { ListaPublica } from './components/ListaPublica';
import { MeusPresentes } from './components/MeusPresentes';
import { Carrinho } from './components/Carrinho';
import { LoginModal } from './components/LoginModal';
import PrismaTest from './components/PrismaTest';
import DiagnosticoProd from './components/DiagnosticoProd';
import type { EnxovalItem } from './types';
import './App.css';
import './styles/Publico.css';

type AdminView = 'dashboard' | 'list' | 'casamento' | 'convidados' | 'prisma-test';

function AdminApp({ onVerListaPublica }: { onVerListaPublica: () => void }) {
  const { user, logout } = useAuth();
  const { removerItem } = useEnxoval();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EnxovalItem | undefined>();
  const [deletingItem, setDeletingItem] = useState<EnxovalItem | undefined>();

  const handleEditItem = (item: EnxovalItem) => {
    setEditingItem(item);
    setShowForm(true);
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

  const navBtn = (view: AdminView, label: string) => (
    <button
      className={`nav-btn ${currentView === view ? 'active' : ''}`}
      onClick={() => setCurrentView(view)}
    >
      {label}
    </button>
  );

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>🏡 Enxoval Casandinhos</h1>
          <p>Vicenzo & Flaviana</p>
        </div>

        <div className="nav-menu">
          {navBtn('dashboard', '📊 Dashboard')}
          {navBtn('list', '📝 Lista de Itens')}
          {navBtn('casamento', '💕 Reservas')}
          {navBtn('convidados', '👥 Convidados')}
          {navBtn('prisma-test', '🔍 Teste Prisma')}
          <button className="nav-btn add-btn" onClick={() => setShowForm(true)}>
            ➕ Adicionar Item
          </button>
        </div>

        <div className="nav-user">
          <span>Olá, {user?.nome}!</span>
          <span className="admin-badge">Admin</span>
          <button className="nav-btn" onClick={onVerListaPublica}>👀 Ver como convidado</button>
          <button className="nav-btn logout-btn" onClick={logout}>🚪 Sair</button>
        </div>
      </nav>

      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard onNavigateToList={() => setCurrentView('list')} />}
        {currentView === 'list' && (
          <ItemList onEditItem={handleEditItem} onDeleteItem={setDeletingItem} />
        )}
        {currentView === 'casamento' && <ListaCasamento />}
        {currentView === 'convidados' && <Convidados />}
        {currentView === 'prisma-test' && <PrismaTest />}
      </main>

      {showForm && (
        <ItemForm item={editingItem} onClose={handleCloseForm} />
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

function PublicoApp({ onPainel }: { onPainel?: () => void }) {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'lista' | 'meus'>('lista');
  const [categoria, setCategoria] = useState('todas');
  const [entrando, setEntrando] = useState(false);

  const irParaLista = useCallback((novaCategoria?: string) => {
    if (novaCategoria) setCategoria(novaCategoria);
    setView('lista');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sair = () => {
    logout();
    setView('lista');
  };

  return (
    <div className="pub-app">
      <header className="pub-topo">
        <button type="button" className="pub-marca" onClick={() => irParaLista()}>
          <span aria-hidden="true">💍</span> F &amp; V
        </button>

        <nav className="pub-nav" aria-label="Principal">
          <button type="button" className={view === 'lista' ? 'ativo' : ''} onClick={() => irParaLista()}>
            Presentes
          </button>
          {user && (
            <button type="button" className={view === 'meus' ? 'ativo' : ''} onClick={() => setView('meus')}>
              Meus presentes
            </button>
          )}
        </nav>

        <div className="pub-conta">
          {onPainel && <button type="button" className="pub-btn pub-btn-secundario" onClick={onPainel}>Painel</button>}
          {user ? (
            <>
              <span className="pub-conta-nome">Olá, {user.nome.split(' ')[0]}</span>
              <button type="button" className="pub-btn pub-btn-link" onClick={sair}>Sair</button>
            </>
          ) : (
            <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setEntrando(true)}>Entrar</button>
          )}
        </div>
      </header>

      <main className="pub-main">
        {view === 'lista' || !user ? (
          <ListaPublica categoria={categoria} onCategoria={setCategoria} onVerMeusPresentes={() => setView('meus')} />
        ) : (
          <MeusPresentes onVoltar={() => irParaLista()} />
        )}
      </main>

      <Carrinho onTrocar={irParaLista} onConfirmado={() => setView('meus')} />

      {entrando && <LoginModal onClose={() => setEntrando(false)} />}
    </div>
  );
}

function AppWithAuth() {
  const { loading, isAdmin } = useAuth();
  const [verComoConvidado, setVerComoConvidado] = useState(false);

  if (window.location.pathname === '/diagnostico') {
    return <DiagnosticoProd />;
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <h2>Carregando...</h2>
        </div>
      </div>
    );
  }

  if (isAdmin() && !verComoConvidado) {
    return (
      <EnxovalProvider>
        <AdminApp onVerListaPublica={() => setVerComoConvidado(true)} />
      </EnxovalProvider>
    );
  }

  return (
    <PresentesProvider>
      <PublicoApp onPainel={isAdmin() ? () => setVerComoConvidado(false) : undefined} />
    </PresentesProvider>
  );
}

function App() {
  return (
    <AvisoProvider>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </AvisoProvider>
  );
}

export default App;
