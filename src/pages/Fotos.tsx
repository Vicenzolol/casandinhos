import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Camera, ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react';
import { CampoNome, Carregando, LayoutConvidado } from '../components/LayoutConvidado';
import { usePolling, useTituloDaAba } from '../hooks/usePaginaInterativa';
import { useConvidado } from '../lib/convidado';
import { fotosApi, type Foto } from '../lib/interativosApi';
import { comprimirFoto } from '../lib/comprimirFoto';
import { useAviso } from '../hooks/useAviso';
import { casamento } from '../data/casamento';

interface Envio {
  id: number;
  nome: string;
  previa: string;
  estado: 'fila' | 'enviando' | 'ok' | 'erro';
  erro?: string;
}

let proximoEnvio = 1;

export function Fotos() {
  const { avisar } = useAviso();
  const { nome, autorId, salvarNome } = useConvidado();
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [autores, setAutores] = useState<{ nome: string; fotos: number }[]>([]);
  const [filtro, setFiltro] = useState('');
  const [disponivel, setDisponivel] = useState(true);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [aberta, setAberta] = useState<number | null>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const fila = useRef<{ id: number; arquivo: File }[]>([]);
  const processando = useRef(false);

  const carregar = useCallback(async () => {
    const r = await fotosApi.listar({ nome: filtro || undefined });
    if (r.success && r.fotos) {
      setFotos(r.fotos);
      setAutores(r.autores ?? []);
      setDisponivel(r.armazenamentoDisponivel !== false);
    }
  }, [filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  // Libera as prévias locais quando a página fecha
  const envioRef = useRef(envios);
  useEffect(() => { envioRef.current = envios; }, [envios]);
  useEffect(() => () => envioRef.current.forEach(e => URL.revokeObjectURL(e.previa)), []);

  const atualizarEnvio = (id: number, dados: Partial<Envio>) =>
    setEnvios(lista => lista.map(e => (e.id === id ? { ...e, ...dados } : e)));

  // Envia uma foto de cada vez (no celular, comprimir várias juntas estoura a memória).
  // Fotos novas entram na fila mesmo durante um envio: dá para tirar várias seguidas.
  const processarFila = async () => {
    if (processando.current) return;
    processando.current = true;
    let enviadas = 0;
    while (fila.current.length) {
      const item = fila.current.shift()!;
      atualizarEnvio(item.id, { estado: 'enviando' });
      try {
        const comprimida = await comprimirFoto(item.arquivo);
        const r = await fotosApi.enviar({ nome, autorId, ...comprimida });
        if (!r.success) throw new Error(r.error);
        atualizarEnvio(item.id, { estado: 'ok' });
        enviadas++;
      } catch (erro) {
        atualizarEnvio(item.id, { estado: 'erro', erro: erro instanceof Error ? erro.message : 'Falhou' });
      }
    }
    processando.current = false;
    if (enviadas) avisar(enviadas === 1 ? 'Foto enviada!' : `${enviadas} fotos enviadas!`, 'sucesso');
    carregar();
  };

  const escolher = (e: ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'));
    e.target.value = '';
    if (!arquivos.length || !nome) return;

    const novos = arquivos.map(f => ({ id: proximoEnvio++, nome: f.name, previa: URL.createObjectURL(f), arquivo: f }));
    setEnvios(lista => [...novos.map(({ id, nome: n, previa }) => ({ id, nome: n, previa, estado: 'fila' as const })), ...lista]);
    fila.current.push(...novos.map(({ id, arquivo }) => ({ id, arquivo })));
    processarFila();
  };

  const emAndamento = envios.some(e => e.estado === 'fila' || e.estado === 'enviando');

  return (
    <LayoutConvidado titulo="Fotos da festa" subtitulo="Mande as fotos que você tirou! Elas aparecem aqui e no telão.">
      <section className="pub-card int-caixa">
        <CampoNome nome={nome} onSalvar={salvarNome} />
        {!disponivel ? (
          <p className="int-aviso">O envio de fotos ainda não está disponível.</p>
        ) : (
          <>
            {/* capture abre direto a câmera traseira no celular; no computador vira um seletor comum */}
            <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={escolher} />
            <input ref={galeria} type="file" accept="image/*" multiple hidden onChange={escolher} />
            <div className="int-botoes-foto">
              <button type="button" className="pub-btn pub-btn-primario int-btn-grande" disabled={!nome} onClick={() => camera.current?.click()}>
                <Camera size={20} aria-hidden="true" /> Tirar foto
              </button>
              <button type="button" className="pub-btn pub-btn-secundario int-btn-grande" disabled={!nome} onClick={() => galeria.current?.click()}>
                <ImagePlus size={20} aria-hidden="true" /> Da galeria
              </button>
            </div>
            {emAndamento && <p className="pub-form-ajuda">Enviando… pode continuar tirando fotos.</p>}
            {!nome && <p className="pub-form-ajuda">Digite seu nome para enviar.</p>}
          </>
        )}

        {envios.length > 0 && (
          <ul className="int-envios">
            {envios.map(e => (
              <li key={e.id} className={`int-envio ${e.estado}`} title={e.erro || e.nome}>
                <img src={e.previa} alt="" />
                <span>{e.estado === 'ok' ? '✓' : e.estado === 'erro' ? '!' : e.estado === 'enviando' ? '…' : ''}</span>
              </li>
            ))}
          </ul>
        )}
        {envios.some(e => e.estado === 'erro') && (
          <p className="pub-form-erro">Algumas fotos não foram enviadas: {envios.find(e => e.estado === 'erro')?.erro}</p>
        )}
      </section>

      {autores.length > 1 && (
        <div className="pub-chips int-filtro" role="group" aria-label="Filtrar por quem enviou">
          <button type="button" className={`pub-chip ${!filtro ? 'ativo' : ''}`} onClick={() => setFiltro('')}>Todas</button>
          {autores.map(a => (
            <button key={a.nome} type="button" className={`pub-chip ${filtro === a.nome ? 'ativo' : ''}`} onClick={() => setFiltro(a.nome)}>
              {a.nome} ({a.fotos})
            </button>
          ))}
        </div>
      )}

      {!fotos ? <Carregando /> : fotos.length === 0 ? (
        <p className="pub-vazio"><Camera size={20} aria-hidden="true" /> Nenhuma foto ainda.</p>
      ) : (
        <div className="int-galeria">
          {fotos.map((f, i) => (
            <button key={f.id} type="button" className="int-galeria-item" onClick={() => setAberta(i)} aria-label={`Foto de ${f.nome}`}>
              <img src={f.miniaturaUrl} alt="" loading="lazy" width={f.largura} height={f.altura} />
            </button>
          ))}
        </div>
      )}

      {aberta !== null && fotos?.[aberta] && (
        <Visualizador fotos={fotos} indice={aberta} onTrocar={setAberta} onFechar={() => setAberta(null)} />
      )}
    </LayoutConvidado>
  );
}

function Visualizador({ fotos, indice, onTrocar, onFechar }: { fotos: Foto[]; indice: number; onTrocar: (i: number) => void; onFechar: () => void }) {
  const foto = fotos[indice];
  const anterior = useCallback(() => onTrocar((indice - 1 + fotos.length) % fotos.length), [indice, fotos.length, onTrocar]);
  const proxima = useCallback(() => onTrocar((indice + 1) % fotos.length), [indice, fotos.length, onTrocar]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === 'ArrowRight') proxima();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [anterior, proxima, onFechar]);

  return (
    <div className="int-visualizador" role="dialog" aria-modal="true" aria-label={`Foto de ${foto.nome}`} onClick={e => e.target === e.currentTarget && onFechar()}>
      <button type="button" className="int-vis-fechar" onClick={onFechar} aria-label="Fechar"><X size={24} aria-hidden="true" /></button>
      {fotos.length > 1 && <button type="button" className="int-vis-nav esq" onClick={anterior} aria-label="Anterior"><ChevronLeft size={32} aria-hidden="true" /></button>}
      <figure>
        <img src={foto.url} alt="" />
        <figcaption>Enviada por {foto.nome}</figcaption>
      </figure>
      {fotos.length > 1 && <button type="button" className="int-vis-nav dir" onClick={proxima} aria-label="Próxima"><ChevronRight size={32} aria-hidden="true" /></button>}
    </div>
  );
}

const TEMPO_POR_FOTO = 7000;

// Telão: as fotos chegando ao vivo. As novas entram na frente da fila.
export function FotosTelao() {
  useTituloDaAba('Fotos (telão)');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [indice, setIndice] = useState(0);
  const ultima = useRef<string | undefined>(undefined);

  usePolling(async () => {
    const r = await fotosApi.listar({ depois: ultima.current });
    if (!r.success || !r.fotos?.length) return;
    const novas = r.fotos;
    ultima.current = novas[0].createdAt;
    setFotos(atual => {
      const ids = new Set(atual.map(f => f.id));
      return [...novas.filter(f => !ids.has(f.id)), ...atual].slice(0, 200);
    });
    // Mostra a mais nova assim que chega (depois da primeira carga)
    setIndice(0);
  }, 5000);

  useEffect(() => {
    if (fotos.length < 2) return;
    const id = window.setInterval(() => setIndice(i => (i + 1) % Math.min(fotos.length, 60)), TEMPO_POR_FOTO);
    return () => window.clearInterval(id);
  }, [fotos.length]);

  const atual = fotos[indice] ?? null;

  return (
    <div className="int-telao int-telao-fotos">
      {atual ? (
        <figure key={atual.id} className="int-telao-foto">
          <img src={atual.url} alt="" />
          <figcaption>{atual.nome}</figcaption>
        </figure>
      ) : (
        <div className="int-telao-espera">
          <img className="int-telao-logo" src="/assets/brand/logo-dusty.png" alt={casamento.noivos} />
          <p className="int-telao-vazio">As fotos da festa aparecem aqui</p>
        </div>
      )}
      <p className="int-telao-rodape">Mande suas fotos: {window.location.host}/fotos</p>
    </div>
  );
}
