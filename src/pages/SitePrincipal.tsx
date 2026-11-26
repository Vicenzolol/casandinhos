import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CalendarPlus, Clock, ExternalLink, Instagram, MapPin, Navigation } from 'lucide-react';
import { casamento, buscaDoLocal } from '../data/casamento';
import { baixarIcs, linkGoogleAgenda } from '../lib/calendario';
import '../styles/Publico.css';
import '../styles/Site.css';

const inicio = new Date(casamento.inicio);
const fim = new Date(casamento.fim);
const fuso = 'America/Sao_Paulo';

const dataPorExtenso = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: fuso,
}).format(inicio).replace(/^./, (c) => c.toUpperCase());

const horario = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit', minute: '2-digit', timeZone: fuso,
}).format(inicio).replace(':00', 'h');

const evento = {
  titulo: `Casamento ${casamento.noivos}`,
  descricao: 'Mais informações em https://casandinhos.vercel.app/inicio',
  local: buscaDoLocal(),
  inicio,
  fim,
};

function useAgora() {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return agora;
}

function Contagem() {
  const agora = useAgora();
  const restante = inicio.getTime() - agora;

  if (restante <= 0) {
    return <p className="site-contagem-fim">{agora < fim.getTime() ? 'É hoje!' : 'Casados!'}</p>;
  }

  const s = Math.floor(restante / 1000);
  const partes = [
    { valor: Math.floor(s / 86400), rotulo: 'dias' },
    { valor: Math.floor((s % 86400) / 3600), rotulo: 'horas' },
    { valor: Math.floor((s % 3600) / 60), rotulo: 'min' },
    { valor: s % 60, rotulo: 'seg' },
  ];

  return (
    <div className="site-contagem" role="timer" aria-label={`Faltam ${partes[0].valor} dias`}>
      {partes.map((p) => (
        <div key={p.rotulo} className="site-contagem-item">
          <span className="site-contagem-valor">{String(p.valor).padStart(2, '0')}</span>
          <span className="site-contagem-rotulo">{p.rotulo}</span>
        </div>
      ))}
    </div>
  );
}

function EmBreve() {
  return <p className="site-em-breve">Em breve</p>;
}

export function SitePrincipal() {
  const busca = encodeURIComponent(buscaDoLocal());

  useEffect(() => {
    const anterior = document.title;
    document.title = `${casamento.noivos} · 24.04.2027`;
    return () => { document.title = anterior; };
  }, []);

  return (
    <div className="pub-app site">
      <header className="pub-topo">
        <Link to="/inicio" className="pub-marca">
          <img src="/assets/brand/monograma-dusty.png" alt="" />
          <span>V &amp; F</span>
        </Link>
        <nav className="pub-nav" aria-label="Principal">
          <a href="#historia">Nossa história</a>
          <a href="#local">Local</a>
          <Link to="/presentes">Presentes</Link>
        </nav>
      </header>

      <main>
        <section className="pub-hero site-hero">
          <img className="pub-hero-guirlanda" src="/assets/brand/guirlanda.jpg" alt="" width={1600} height={500} />
          <h1>
            <img className="pub-hero-logo" src="/assets/brand/logo-dusty.png" alt={casamento.noivos} width={959} height={623} />
          </h1>
          <p className="pub-hero-sobre">Vamos nos casar</p>
          <p className="site-data">{dataPorExtenso}</p>
          <p className="site-hora"><Clock size={16} aria-hidden="true" /> {horario} · {casamento.local.nome}, {casamento.local.cidade}</p>

          <Contagem />

          <div className="site-acoes">
            <button type="button" className="pub-btn pub-btn-primario" onClick={() => baixarIcs(evento)}>
              <CalendarPlus size={16} aria-hidden="true" /> Adicionar ao calendário
            </button>
            <a className="pub-btn pub-btn-secundario" href={linkGoogleAgenda(evento)} target="_blank" rel="noreferrer">
              Google Agenda
            </a>
          </div>
        </section>

        <section id="historia" className="site-secao">
          <h2>Nossa história</h2>
          {casamento.historia
            ? casamento.historia.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
            : <EmBreve />}
        </section>

        <section id="local" className="site-secao">
          <h2>O local</h2>
          <p className="site-local-nome"><MapPin size={18} aria-hidden="true" /> {casamento.local.nome}</p>
          <p>{casamento.local.endereco || casamento.local.cidade}</p>

          <div className="site-mapa">
            <iframe
              title={`Mapa: ${casamento.local.nome}`}
              src={`https://www.google.com/maps?q=${busca}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="site-acoes">
            <a className="pub-btn pub-btn-primario" href={`https://www.google.com/maps/dir/?api=1&destination=${busca}`} target="_blank" rel="noreferrer">
              <Navigation size={16} aria-hidden="true" /> Como chegar
            </a>
            <a className="pub-btn pub-btn-secundario" href={`https://waze.com/ul?q=${busca}&navigate=yes`} target="_blank" rel="noreferrer">
              Waze
            </a>
            <a className="pub-btn pub-btn-secundario" href={casamento.local.links} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" /> Conheça o sítio
            </a>
            <a className="pub-btn pub-btn-secundario" href={casamento.local.instagram} target="_blank" rel="noreferrer">
              <Instagram size={16} aria-hidden="true" /> Instagram
            </a>
          </div>
        </section>

        <section className="site-secao site-presentes">
          <h2>Lista de presentes</h2>
          <p>Se quiser nos presentear, preparamos uma lista com carinho.</p>
          <Link to="/presentes" className="pub-btn pub-btn-primario">Ver lista de presentes</Link>
        </section>
      </main>

      <footer className="site-rodape">
        <img src="/assets/brand/monograma-dusty.png" alt="" />
        <p>{casamento.noivos} · 24.04.2027</p>
      </footer>
    </div>
  );
}
