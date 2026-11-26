import { Link } from 'react-router';
import { casamento } from '../data/casamento';
import '../styles/Publico.css';
import '../styles/Site.css';

// Página provisória: o formulário de confirmação (RSVP) ainda vai ser construído.
export function Confirmar() {
  return (
    <div className="pub-app site">
      <main className="site-secao site-provisoria">
        <img src="/assets/brand/monograma-dusty.png" alt="" width={96} />
        <h2>Confirmar presença</h2>
        <p className="site-em-breve">Em breve você poderá confirmar sua presença por aqui.</p>
        <p>{casamento.noivos} · 24.04.2027</p>
        <Link to="/convite" className="pub-btn pub-btn-secundario">Voltar ao convite</Link>
      </main>
    </div>
  );
}
