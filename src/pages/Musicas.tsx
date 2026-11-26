import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Heart, Music, Trash2 } from 'lucide-react';
import { CampoNome, Carregando, LayoutConvidado } from '../components/LayoutConvidado';
import { usePolling, useTituloDaAba } from '../hooks/usePaginaInterativa';
import { useConvidado } from '../lib/convidado';
import { musicasApi, type Musica } from '../lib/interativosApi';
import { useAviso } from '../hooks/useAviso';
import { useAuth } from '../hooks/useAuth';

export function Musicas() {
  const { avisar } = useAviso();
  const { nome, autorId, salvarNome } = useConvidado();
  const [musicas, setMusicas] = useState<Musica[] | null>(null);
  const [max, setMax] = useState(3);
  const [form, setForm] = useState({ titulo: '', artista: '' });
  const [enviando, setEnviando] = useState(false);
  const [votando, setVotando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const r = await musicasApi.listar(autorId);
    if (r.success && r.musicas) {
      setMusicas(r.musicas);
      if (r.maxPorPessoa) setMax(r.maxPorPessoa);
    }
  }, [autorId]);

  usePolling(carregar, 15000);

  const minhas = musicas?.filter(m => m.minha).length ?? 0;

  const sugerir = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome) return;
    setEnviando(true);
    const r = await musicasApi.sugerir({ nome, autorId, ...form });
    setEnviando(false);
    if (!r.success) {
      avisar(r.error || 'Não foi possível sugerir', 'erro');
      return;
    }
    setForm({ titulo: '', artista: '' });
    avisar('Música sugerida!', 'sucesso');
    carregar();
  };

  const alternarVoto = async (m: Musica) => {
    setVotando(m.id);
    const r = m.voteiNela ? await musicasApi.desvotar(m.id, autorId) : await musicasApi.votar(m.id, autorId);
    setVotando(null);
    if (!r.success) avisar(r.error || 'Não foi possível votar', 'erro');
    carregar();
  };

  return (
    <LayoutConvidado titulo="Pedidos de música" subtitulo={`Sugira até ${max} músicas para a pista e vote nas que você quer ouvir.`}>
      <section className="pub-card int-caixa">
        <CampoNome nome={nome} onSalvar={salvarNome} />
        {minhas >= max ? (
          <p className="int-sucesso">Você já sugeriu {max} músicas. Agora é só votar nas outras!</p>
        ) : (
          <form onSubmit={sugerir} className="int-form">
            <div className="int-campos-2">
              <label>Música
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} maxLength={120} required placeholder="Nome da música" />
              </label>
              <label>Artista
                <input value={form.artista} onChange={e => setForm(f => ({ ...f, artista: e.target.value }))} maxLength={120} required placeholder="Quem canta" />
              </label>
            </div>
            <div className="int-form-rodape">
              <small>{minhas}/{max} sugestões</small>
              <button type="submit" className="pub-btn pub-btn-primario" disabled={!nome || enviando}>
                <Music size={16} aria-hidden="true" /> {enviando ? 'Enviando…' : 'Sugerir'}
              </button>
            </div>
          </form>
        )}
      </section>

      {!musicas ? <Carregando /> : musicas.length === 0 ? (
        <p className="pub-vazio">Nenhuma música ainda. Comece a playlist!</p>
      ) : (
        <ol className="int-musicas">
          {musicas.map(m => (
            <li key={m.id} className={`int-musica ${m.tocada ? 'tocada' : ''}`}>
              <div className="int-musica-info">
                <strong>{m.titulo}</strong>
                <span>{m.artista} · sugerida por {m.nome}</span>
                {m.tocada && <span className="pub-selo pub-selo-meu"><Check size={12} aria-hidden="true" /> Já tocou</span>}
              </div>
              <button
                type="button"
                className={`int-voto ${m.voteiNela ? 'ativo' : ''}`}
                onClick={() => alternarVoto(m)}
                disabled={votando === m.id}
                aria-pressed={m.voteiNela}
                aria-label={m.voteiNela ? `Tirar voto de ${m.titulo}` : `Votar em ${m.titulo}`}
              >
                <Heart size={18} aria-hidden="true" fill={m.voteiNela ? 'currentColor' : 'none'} />
                <span>{m.votos}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </LayoutConvidado>
  );
}

// Tela do DJ: ranking ao vivo. Marcar como tocada exige estar logado como admin.
export function MusicasDj() {
  useTituloDaAba('Músicas (DJ)');
  const { avisar } = useAviso();
  const { isAdmin } = useAuth();
  const admin = isAdmin();
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [mostrarTocadas, setMostrarTocadas] = useState(false);

  const carregar = useCallback(async () => {
    const r = await musicasApi.listar();
    if (r.success && r.musicas) setMusicas(r.musicas);
  }, []);

  usePolling(carregar, 5000);

  const marcar = async (m: Musica) => {
    const r = await musicasApi.marcarTocada(m.id, !m.tocada);
    if (!r.success) avisar(r.error || 'Erro ao marcar', 'erro');
    carregar();
  };

  const remover = async (m: Musica) => {
    if (!window.confirm(`Excluir "${m.titulo}"?`)) return;
    const r = await musicasApi.remover(m.id);
    if (!r.success) avisar(r.error || 'Erro ao excluir', 'erro');
    carregar();
  };

  const visiveis = musicas.filter(m => mostrarTocadas || !m.tocada);

  return (
    <div className="int-telao int-telao-lista">
      <header className="int-telao-topo">
        <h1>Pedidos da pista</h1>
        <label className="pub-check">
          <input type="checkbox" checked={mostrarTocadas} onChange={e => setMostrarTocadas(e.target.checked)} /> Mostrar já tocadas
        </label>
      </header>
      {!admin && <p className="int-aviso">Para marcar como tocada, entre como admin neste aparelho (em /presentes → Entrar).</p>}
      {visiveis.length === 0 ? <p className="int-telao-vazio">Nenhum pedido por enquanto.</p> : (
        <ol className="int-ranking">
          {visiveis.map((m, i) => (
            <li key={m.id} className={m.tocada ? 'tocada' : ''}>
              <span className="int-ranking-pos">{i + 1}</span>
              <span className="int-ranking-nome">
                <strong>{m.titulo}</strong>
                <small>{m.artista} · {m.nome}</small>
              </span>
              <span className="int-ranking-pontos"><Heart size={18} aria-hidden="true" /> {m.votos}</span>
              {admin && (
                <span className="int-ranking-acoes">
                  <button type="button" className={`pub-btn ${m.tocada ? 'pub-btn-secundario' : 'pub-btn-primario'}`} onClick={() => marcar(m)}>
                    <Check size={16} aria-hidden="true" /> {m.tocada ? 'Desmarcar' : 'Tocada'}
                  </button>
                  <button type="button" className="pub-btn pub-btn-perigo-leve" onClick={() => remover(m)} aria-label={`Excluir ${m.titulo}`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
