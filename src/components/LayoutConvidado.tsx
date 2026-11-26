// Layout comum das páginas interativas dos convidados: topo, navegação e título
import { useState } from 'react';
import { useTituloDaAba } from '../hooks/usePaginaInterativa';
import type { FormEvent, ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { casamento } from '../data/casamento';
import '../styles/Publico.css';
import '../styles/Site.css';
import '../styles/Interativos.css';

const LINKS = [
  { to: '/inicio', rotulo: 'Início' },
  { to: '/presentes', rotulo: 'Presentes' },
  { to: '/cotas', rotulo: 'Cotas' },
  { to: '/fotos', rotulo: 'Fotos' },
  { to: '/mural', rotulo: 'Mural' },
  { to: '/musicas', rotulo: 'Músicas' },
  { to: '/quiz', rotulo: 'Quiz' },
];

interface LayoutProps {
  titulo: string;
  subtitulo?: ReactNode;
  children: ReactNode;
}

export function LayoutConvidado({ titulo, subtitulo, children }: LayoutProps) {
  useTituloDaAba(titulo);

  return (
    <div className="pub-app site int">
      <header className="pub-topo">
        <Link to="/inicio" className="pub-marca">
          <img src="/assets/brand/monograma-dusty.png" alt="" />
          <span>V &amp; F</span>
        </Link>
        <nav className="pub-nav" aria-label="Principal">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => (isActive ? 'ativo' : '')}>
              {l.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="int-main">
        <header className="int-cabecalho">
          <h1>{titulo}</h1>
          {subtitulo && <p>{subtitulo}</p>}
        </header>
        {children}
      </main>

      <footer className="site-rodape">
        <img src="/assets/brand/monograma-dusty.png" alt="" />
        <p>{casamento.noivos} · 24.04.2027</p>
      </footer>
    </div>
  );
}

// Pede o nome do convidado uma vez; depois mostra "Você é Fulano · trocar"
export function CampoNome({ nome, onSalvar }: { nome: string; onSalvar: (nome: string) => void }) {
  const [editando, setEditando] = useState(!nome);
  const [valor, setValor] = useState(nome);

  if (nome && !editando) {
    return (
      <p className="int-quem">
        Você está como <strong>{nome}</strong>
        <button type="button" className="pub-btn pub-btn-link" onClick={() => { setValor(nome); setEditando(true); }}>trocar</button>
      </p>
    );
  }

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (!valor.trim()) return;
    onSalvar(valor);
    setEditando(false);
  };

  return (
    <form className="int-nome" onSubmit={salvar}>
      <label htmlFor="int-nome">Como você se chama?</label>
      <div className="int-linha">
        <input
          id="int-nome"
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="Seu nome"
          maxLength={80}
          autoComplete="name"
          required
        />
        <button type="submit" className="pub-btn pub-btn-primario">Continuar</button>
      </div>
    </form>
  );
}

export function Carregando() {
  return <p className="int-carregando">Carregando…</p>;
}
