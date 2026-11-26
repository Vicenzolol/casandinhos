import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Send } from 'lucide-react';
import { CampoNome, Carregando, LayoutConvidado } from '../components/LayoutConvidado';
import { usePolling, useTituloDaAba } from '../hooks/usePaginaInterativa';
import { useConvidado } from '../lib/convidado';
import { muralApi, type Recado } from '../lib/interativosApi';
import { useAviso } from '../hooks/useAviso';
import { casamento } from '../data/casamento';

const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

export function Mural() {
  const { avisar } = useAviso();
  const { nome, autorId, salvarNome } = useConvidado();
  const [recados, setRecados] = useState<Recado[] | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const carregar = useCallback(async () => {
    const r = await muralApi.listar();
    if (r.success && r.recados) setRecados(r.recados);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome || !mensagem.trim()) return;
    setEnviando(true);
    const r = await muralApi.enviar({ nome, autorId, mensagem });
    setEnviando(false);
    if (!r.success) {
      avisar(r.error || 'Não foi possível enviar', 'erro');
      return;
    }
    setMensagem('');
    setEnviado(true);
  };

  return (
    <LayoutConvidado titulo="Mural de recados" subtitulo="Deixe uma mensagem para os noivos. Ela aparece aqui depois que eles lerem e aprovarem.">
      <section className="pub-card int-caixa">
        <CampoNome nome={nome} onSalvar={salvarNome} />
        {enviado ? (
          <div className="int-sucesso">
            <p>Recado enviado! Ele aparece no mural assim que os noivos aprovarem 💙</p>
            <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setEnviado(false)}>Escrever outro</button>
          </div>
        ) : (
          <form onSubmit={enviar} className="int-form">
            <label htmlFor="recado">Seu recado</label>
            <textarea
              id="recado"
              className="conv-mensagem"
              rows={4}
              maxLength={1000}
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              placeholder="Escreva com carinho…"
              required
            />
            <div className="int-form-rodape">
              <small>{mensagem.length}/1000</small>
              <button type="submit" className="pub-btn pub-btn-primario" disabled={!nome || !mensagem.trim() || enviando}>
                <Send size={16} aria-hidden="true" /> {enviando ? 'Enviando…' : 'Enviar recado'}
              </button>
            </div>
          </form>
        )}
      </section>

      {!recados ? <Carregando /> : recados.length === 0 ? (
        <p className="pub-vazio">Ainda não há recados no mural. Seja o primeiro!</p>
      ) : (
        <div className="int-recados">
          {recados.map(r => (
            <figure key={r.id} className="int-recado">
              <blockquote>{r.mensagem}</blockquote>
              <figcaption>{r.nome} · {dataCurta.format(new Date(r.createdAt))}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </LayoutConvidado>
  );
}

const TEMPO_POR_RECADO = 9000;

export function MuralTelao() {
  useTituloDaAba('Mural (telão)');
  const [recados, setRecados] = useState<Recado[]>([]);
  const [indice, setIndice] = useState(0);

  usePolling(async () => {
    const r = await muralApi.listar();
    if (r.success && r.recados) setRecados(r.recados);
  }, 20000);

  useEffect(() => {
    if (recados.length < 2) return;
    const id = window.setInterval(() => setIndice(i => (i + 1) % recados.length), TEMPO_POR_RECADO);
    return () => window.clearInterval(id);
  }, [recados.length]);

  const atual = recados.length ? recados[indice % recados.length] : null;

  return (
    <div className="int-telao">
      <img className="int-telao-logo" src="/assets/brand/logo-dusty.png" alt={casamento.noivos} />
      {atual ? (
        <figure key={atual.id} className="int-telao-recado">
          <blockquote>{atual.mensagem}</blockquote>
          <figcaption>{atual.nome}</figcaption>
        </figure>
      ) : (
        <p className="int-telao-vazio">Deixe seu recado em <strong>{window.location.host}/mural</strong></p>
      )}
      <p className="int-telao-rodape">Mande o seu: {window.location.host}/mural</p>
    </div>
  );
}
