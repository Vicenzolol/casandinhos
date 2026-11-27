import { useEffect } from 'react';
import { Link } from 'react-router';
import { CalendarPlus, ChevronDown, Gift, MapPin, Navigation } from 'lucide-react';
import { casamento, buscaDoLocal } from '../data/casamento';
import { baixarIcs } from '../lib/calendario';
import { Petalas } from '../components/Petalas';
import '../styles/Publico.css';
import '../styles/Convite.css';

const inicio = new Date(casamento.inicio);
const fuso = 'America/Sao_Paulo';

const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: fuso })
  .format(inicio).replace(/^./, (c) => c.toUpperCase());
const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', timeZone: fuso }).format(inicio);
const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: fuso }).format(inicio);
const ano = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', timeZone: fuso }).format(inicio);
const horario = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: fuso })
  .format(inicio).replace(':00', 'h');

export function Convite() {
  const busca = encodeURIComponent(buscaDoLocal());

  useEffect(() => {
    const anterior = document.title;
    document.title = `Convite · ${casamento.noivos}`;
    return () => { document.title = anterior; };
  }, []);

  return (
    <div className="convite">
      <section className="convite-capa">
        <div className="convite-flores convite-flores-topo" aria-hidden="true">
          <img src="/assets/brand/guirlanda.jpg" alt="" width={1600} height={500} />
        </div>
        <div className="convite-flores convite-flores-base" aria-hidden="true">
          <img src="/assets/brand/guirlanda.jpg" alt="" width={1600} height={500} />
        </div>

        <div className="convite-capa-centro">
          <img className="convite-monograma" src="/assets/brand/monograma-dusty.png" alt="V & F" />
          <h1 className="convite-nomes">Vicenzo <span>&amp;</span> Flaviana</h1>
          <p className="convite-data-curta">24 · 04 · 2027</p>
        </div>

        <Petalas />

        <a href="#convite" className="convite-abrir">
          Abrir convite
          <ChevronDown size={20} aria-hidden="true" />
        </a>
      </section>

      <div className="convite-corpo">
      {/* Vinhas descendo pelas laterais, do fim das flores até o fim da página */}
      <div className="convite-vinha convite-vinha-esq" aria-hidden="true" />
      <div className="convite-vinha convite-vinha-dir" aria-hidden="true" />
      {/* segundo par, mais para dentro, só em telas largas */}
      <div className="convite-vinha convite-vinha-interna convite-vinha-esq2" aria-hidden="true" />
      <div className="convite-vinha convite-vinha-interna convite-vinha-dir2" aria-hidden="true" />

      {/* Continuação das flores da capa: a mesma guirlanda espelhada na divisa, virando ramos */}
      <div id="convite" className="convite-ramo" aria-hidden="true">
        <img src="/assets/brand/guirlanda.jpg" alt="" width={1600} height={500} />
      </div>

      <section className="convite-cartao">
        <img className="convite-cartao-monograma" src="/assets/brand/monograma-dusty.png" alt="" />

        <p className="convite-frase">
          Com a bênção de Deus e dos nossos Pais,
        </p>
        <h2 className="convite-titulo">{casamento.noivos}</h2>
        <p className="convite-frase">
          têm a alegria de convidar você para celebrar
          <br />o nosso casamento
        </p>

        <div className="convite-quando">
          <span className="convite-quando-lado">{diaSemana}</span>
          <span className="convite-quando-dia">
            <span className="convite-quando-mes">{mes}</span>
            <strong>{dia}</strong>
            <span className="convite-quando-mes">{ano}</span>
          </span>
          <span className="convite-quando-lado">às {horario}</span>
        </div>

        <p className="convite-onde">
          <MapPin size={16} aria-hidden="true" />
          <span>
            <strong>{casamento.local.nome}</strong>
            <br />
            {casamento.local.endereco || casamento.local.cidade}
          </span>
        </p>

        <div className="convite-acoes">
          <Link to="/confirmar" className="pub-btn pub-btn-primario convite-btn-destaque">
            Confirmar presença
          </Link>
          <div className="convite-acoes-linha">
            <a className="pub-btn pub-btn-secundario" href={`https://www.google.com/maps/dir/?api=1&destination=${busca}`} target="_blank" rel="noreferrer">
              <Navigation size={16} aria-hidden="true" /> Como chegar
            </a>
            <button
              type="button"
              className="pub-btn pub-btn-secundario"
              onClick={() => baixarIcs({
                titulo: `Casamento ${casamento.noivos}`,
                descricao: 'Mais informações em https://casandinhos.vercel.app/inicio',
                local: buscaDoLocal(),
                inicio,
                fim: new Date(casamento.fim),
              })}
            >
              <CalendarPlus size={16} aria-hidden="true" /> Salvar a data
            </button>
            <Link to="/presentes" className="pub-btn pub-btn-secundario">
              <Gift size={16} aria-hidden="true" /> Presentes
            </Link>
          </div>
          <Link to="/inicio" className="convite-mais">Mais informações sobre o casamento</Link>
        </div>
      </section>
      </div>
    </div>
  );
}
