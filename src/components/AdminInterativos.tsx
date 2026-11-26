// Painel dos noivos para as páginas interativas: cotas, mural, fotos, músicas e quiz
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Eye, EyeOff, HandCoins, HelpCircle, Image, MessageSquareHeart, Music, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAviso } from '../hooks/useAviso';
import { formatarReais } from '../lib/pix';
import { formatarTempo } from '../lib/formatar';
import {
  cotasApi, fotosApi, muralApi, musicasApi, quizApi,
  type CotaAdmin, type CotaPayload, type Foto, type Musica, type PerguntaQuizAdmin, type PosicaoQuiz, type Recado,
} from '../lib/interativosApi';
import '../styles/Publico.css';
import '../styles/Interativos.css';

type Aba = 'cotas' | 'mural' | 'fotos' | 'musicas' | 'quiz';

const ABAS: { id: Aba; rotulo: string; icone: LucideIcon; pagina: string }[] = [
  { id: 'cotas', rotulo: 'Cotas', icone: HandCoins, pagina: '/cotas' },
  { id: 'mural', rotulo: 'Mural', icone: MessageSquareHeart, pagina: '/mural' },
  { id: 'fotos', rotulo: 'Fotos', icone: Image, pagina: '/fotos' },
  { id: 'musicas', rotulo: 'Músicas', icone: Music, pagina: '/musicas' },
  { id: 'quiz', rotulo: 'Quiz', icone: HelpCircle, pagina: '/quiz' },
];

const TELOES: Partial<Record<Aba, string>> = {
  mural: '/mural/telao',
  fotos: '/fotos/telao',
  musicas: '/musicas/dj',
  quiz: '/quiz/telao',
};

const dataHora = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const quando = (iso: string) => dataHora.format(new Date(iso));

export function AdminInterativos() {
  const [aba, setAba] = useState<Aba>('cotas');
  const atual = ABAS.find(a => a.id === aba)!;

  return (
    <div className="int-admin">
      <h2>Interativos</h2>
      <div className="int-admin-abas" role="tablist">
        {ABAS.map(({ id, rotulo, icone: Icone }) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} className={`pub-chip ${aba === id ? 'ativo' : ''}`} onClick={() => setAba(id)}>
            <Icone size={15} aria-hidden="true" /> {rotulo}
          </button>
        ))}
      </div>
      <div className="int-admin-barra">
        <span />
        <span className="int-admin-acoes">
          <a href={atual.pagina} target="_blank" rel="noreferrer">Abrir página dos convidados ↗</a>
          {TELOES[aba] && <a href={TELOES[aba]} target="_blank" rel="noreferrer">Abrir telão ↗</a>}
        </span>
      </div>

      {aba === 'cotas' && <AbaCotas />}
      {aba === 'mural' && <AbaMural />}
      {aba === 'fotos' && <AbaFotos />}
      {aba === 'musicas' && <AbaMusicas />}
      {aba === 'quiz' && <AbaQuiz />}
    </div>
  );
}

// Carrega uma lista e devolve [dados, recarregar]
function useLista<T>(buscar: () => Promise<{ success: boolean; error?: string } & T>) {
  const { avisar } = useAviso();
  const [dados, setDados] = useState<T | null>(null);
  const recarregar = useCallback(async () => {
    const r = await buscar();
    if (r.success) setDados(r);
    else avisar(r.error || 'Erro ao carregar', 'erro');
  }, [buscar, avisar]);
  useEffect(() => { recarregar(); }, [recarregar]);
  return [dados, recarregar] as const;
}

// Executa uma ação da API, avisa o erro e recarrega
function useAcao(recarregar: () => void) {
  const { avisar } = useAviso();
  return useCallback(async (acao: Promise<{ success: boolean; error?: string }>, sucesso?: string) => {
    const r = await acao;
    if (!r.success) avisar(r.error || 'Não foi possível concluir', 'erro');
    else if (sucesso) avisar(sucesso, 'sucesso');
    recarregar();
    return r.success;
  }, [avisar, recarregar]);
}

// ===================== COTAS =====================

const COTA_VAZIA = { titulo: '', descricao: '', valor: '', totalPartes: '10', ordem: '0', ativa: true };
type FormCota = typeof COTA_VAZIA;

function AbaCotas() {
  const [dados, recarregar] = useLista(cotasApi.admin);
  const executar = useAcao(recarregar);
  const [editando, setEditando] = useState<{ id?: string; form: FormCota } | null>(null);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    const f = editando.form;
    const payload: CotaPayload = {
      titulo: f.titulo,
      descricao: f.descricao || null,
      valorParte: Math.round(Number(f.valor.replace(/\./g, '').replace(',', '.')) * 100),
      totalPartes: Number(f.totalPartes),
      ordem: Number(f.ordem) || 0,
      ativa: f.ativa,
    };
    const ok = await executar(editando.id ? cotasApi.atualizar(editando.id, payload) : cotasApi.criar(payload), 'Cota salva');
    if (ok) setEditando(null);
  };

  const editar = (c: CotaAdmin) => setEditando({
    id: c.id,
    form: {
      titulo: c.titulo,
      descricao: c.descricao ?? '',
      valor: (c.valorParte / 100).toFixed(2).replace('.', ','),
      totalPartes: String(c.totalPartes),
      ordem: String(c.ordem),
      ativa: c.ativa,
    },
  });

  const campo = (nome: keyof FormCota) => ({
    value: editando?.form[nome] as string,
    onChange: (e: { target: { value: string } }) => setEditando(ed => ed && { ...ed, form: { ...ed.form, [nome]: e.target.value } }),
  });

  if (!dados?.cotas) return <p>Carregando…</p>;

  const pendentes = dados.cotas.flatMap(c => c.contribuicoes).filter(c => c.status === 'pendente').length;

  return (
    <>
      <div className="int-admin-barra">
        <span className="int-admin-resumo">{dados.cotas.length} cota(s) · {pendentes} contribuição(ões) aguardando confirmação</span>
        {!editando && (
          <button type="button" className="pub-btn pub-btn-primario" onClick={() => setEditando({ form: COTA_VAZIA })}>
            <Plus size={16} aria-hidden="true" /> Nova cota
          </button>
        )}
      </div>

      {editando && (
        <form className="int-admin-card int-admin-form duas" onSubmit={salvar}>
          <h3 className="largo">{editando.id ? 'Editar cota' : 'Nova cota'}</h3>
          <label className="largo">Título <input required maxLength={120} {...campo('titulo')} placeholder="Ex.: Jantar na lua de mel" /></label>
          <label className="largo">Descrição <textarea className="conv-mensagem" rows={2} maxLength={1000} {...campo('descricao')} /></label>
          <label>Valor de cada parte (R$) <input required inputMode="decimal" pattern="[0-9.,]+" {...campo('valor')} placeholder="50,00" /></label>
          <label>Número de partes <input required type="number" min={1} max={1000} {...campo('totalPartes')} /></label>
          <label>Ordem na lista <input type="number" min={0} {...campo('ordem')} /></label>
          <label className="pub-check">
            <input type="checkbox" checked={editando.form.ativa} onChange={e => setEditando(ed => ed && { ...ed, form: { ...ed.form, ativa: e.target.checked } })} />
            Visível para os convidados
          </label>
          <div className="int-admin-form-rodape largo">
            <button type="submit" className="pub-btn pub-btn-primario">Salvar</button>
            <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setEditando(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {dados.cotas.length === 0 && !editando && <p>Nenhuma cota cadastrada.</p>}

      {dados.cotas.map(c => {
        const usadas = c.contribuicoes.filter(x => x.status !== 'recusada').reduce((s, x) => s + x.partes, 0);
        const confirmadas = c.contribuicoes.filter(x => x.status === 'confirmada');
        const recebido = confirmadas.reduce((s, x) => s + x.partes, 0) * c.valorParte;
        return (
          <section key={c.id} className={`int-admin-card ${c.ativa ? '' : 'inativa'}`}>
            <div className="int-admin-topo">
              <div>
                <h3>{c.titulo} {!c.ativa && <span className="int-status">oculta</span>}</h3>
                <p>{formatarReais(c.valorParte)} por parte · {usadas}/{c.totalPartes} partes · {formatarReais(recebido)} confirmados</p>
              </div>
              <div className="int-admin-acoes">
                <button type="button" className="pub-btn pub-btn-secundario" onClick={() => editar(c)}><Pencil size={14} aria-hidden="true" /> Editar</button>
                <button
                  type="button"
                  className="pub-btn pub-btn-perigo-leve"
                  onClick={() => window.confirm(`Excluir a cota "${c.titulo}" e todas as contribuições dela?`) && executar(cotasApi.remover(c.id), 'Cota excluída')}
                >
                  <Trash2 size={14} aria-hidden="true" /> Excluir
                </button>
              </div>
            </div>
            <div className="int-progresso"><span style={{ width: `${Math.min(100, (usadas / c.totalPartes) * 100)}%` }} /></div>

            {c.contribuicoes.length > 0 && (
              <ul className="int-admin-lista">
                {c.contribuicoes.map(x => (
                  <li key={x.id}>
                    <div>
                      <strong>{x.nome}</strong> · {x.partes} parte(s) · {formatarReais(x.partes * c.valorParte)}{' '}
                      <span className={`int-status ${x.status}`}>{x.status}</span>
                      <br /><small>{quando(x.createdAt)} · ID do Pix: {x.txid}</small>
                      {x.mensagem && <p>“{x.mensagem}”</p>}
                    </div>
                    <div className="int-admin-acoes">
                      {x.status !== 'confirmada' && (
                        <button type="button" className="pub-btn pub-btn-primario" onClick={() => executar(cotasApi.statusContribuicao(x.id, 'confirmada'))}>
                          <Check size={14} aria-hidden="true" /> Confirmar
                        </button>
                      )}
                      {x.status !== 'recusada' && (
                        <button type="button" className="pub-btn pub-btn-secundario" onClick={() => executar(cotasApi.statusContribuicao(x.id, 'recusada'))}>
                          <X size={14} aria-hidden="true" /> Recusar
                        </button>
                      )}
                      {x.status !== 'pendente' && (
                        <button type="button" className="pub-btn pub-btn-link" onClick={() => executar(cotasApi.statusContribuicao(x.id, 'pendente'))}>
                          Voltar para pendente
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}

// ===================== MURAL =====================

function AbaMural() {
  const [dados, recarregar] = useLista(muralApi.admin);
  const executar = useAcao(recarregar);
  const [filtro, setFiltro] = useState<'pendente' | 'aprovado' | 'recusado' | 'todos'>('pendente');

  if (!dados?.recados) return <p>Carregando…</p>;
  const contagem = (s: string) => dados.recados!.filter(r => r.status === s).length;
  const lista = dados.recados.filter(r => filtro === 'todos' || r.status === filtro);

  return (
    <>
      <div className="pub-chips">
        {(['pendente', 'aprovado', 'recusado', 'todos'] as const).map(s => (
          <button key={s} type="button" className={`pub-chip ${filtro === s ? 'ativo' : ''}`} onClick={() => setFiltro(s)}>
            {s === 'pendente' ? 'Aguardando' : s === 'aprovado' ? 'Aprovados' : s === 'recusado' ? 'Recusados' : 'Todos'}
            {s !== 'todos' && ` (${contagem(s)})`}
          </button>
        ))}
      </div>
      {lista.length === 0 ? <p>Nenhum recado aqui.</p> : (
        <ul className="int-admin-lista">
          {lista.map((r: Recado) => (
            <li key={r.id}>
              <div>
                <strong>{r.nome}</strong> <span className={`int-status ${r.status}`}>{r.status}</span>
                <br /><small>{quando(r.createdAt)}</small>
                <p>{r.mensagem}</p>
              </div>
              <div className="int-admin-acoes">
                {r.status !== 'aprovado' && (
                  <button type="button" className="pub-btn pub-btn-primario" onClick={() => executar(muralApi.status(r.id, 'aprovado'))}>
                    <Check size={14} aria-hidden="true" /> Aprovar
                  </button>
                )}
                {r.status !== 'recusado' && (
                  <button type="button" className="pub-btn pub-btn-secundario" onClick={() => executar(muralApi.status(r.id, 'recusado'))}>
                    <X size={14} aria-hidden="true" /> Recusar
                  </button>
                )}
                <button type="button" className="pub-btn pub-btn-perigo-leve" onClick={() => window.confirm('Excluir este recado?') && executar(muralApi.remover(r.id))} aria-label="Excluir recado">
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ===================== FOTOS =====================

function AbaFotos() {
  const [dados, recarregar] = useLista(fotosApi.admin);
  const executar = useAcao(recarregar);

  if (!dados?.fotos) return <p>Carregando…</p>;
  const ocultas = dados.fotos.filter(f => f.oculta).length;

  return (
    <>
      <p className="int-admin-resumo">{dados.fotos.length} foto(s) · {ocultas} oculta(s)</p>
      {dados.fotos.length === 0 ? <p>Nenhuma foto enviada ainda.</p> : (
        <div className="int-admin-fotos">
          {dados.fotos.map((f: Foto) => (
            <figure key={f.id} className={`int-admin-foto ${f.oculta ? 'oculta' : ''}`} style={{ margin: 0 }}>
              <a href={f.url} target="_blank" rel="noreferrer"><img src={f.miniaturaUrl} alt={`Foto de ${f.nome}`} loading="lazy" /></a>
              <div>
                <span><strong>{f.nome}</strong><br /><small>{quando(f.createdAt)}</small></span>
                <span className="int-admin-acoes">
                  <button type="button" className="pub-btn pub-btn-secundario" onClick={() => executar(fotosApi.visibilidade(f.id, !f.oculta))} aria-label={f.oculta ? 'Mostrar' : 'Ocultar'}>
                    {f.oculta ? <><Eye size={14} aria-hidden="true" /> Mostrar</> : <><EyeOff size={14} aria-hidden="true" /> Ocultar</>}
                  </button>
                  <button type="button" className="pub-btn pub-btn-perigo-leve" onClick={() => window.confirm('Excluir esta foto de vez?') && executar(fotosApi.remover(f.id), 'Foto excluída')} aria-label="Excluir foto">
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </span>
              </div>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

// ===================== MÚSICAS =====================

const listarMusicas = () => musicasApi.listar();

function AbaMusicas() {
  const [dados, recarregar] = useLista(listarMusicas);
  const executar = useAcao(recarregar);

  if (!dados?.musicas) return <p>Carregando…</p>;

  return dados.musicas.length === 0 ? <p>Nenhuma música sugerida ainda.</p> : (
    <ul className="int-admin-lista">
      {dados.musicas.map((m: Musica) => (
        <li key={m.id}>
          <div>
            <strong>{m.titulo}</strong> · {m.artista} {m.tocada && <span className="int-status confirmada">tocada</span>}
            <br /><small>{m.votos} voto(s) · sugerida por {m.nome}</small>
          </div>
          <div className="int-admin-acoes">
            <button type="button" className="pub-btn pub-btn-secundario" onClick={() => executar(musicasApi.marcarTocada(m.id, !m.tocada))}>
              <Check size={14} aria-hidden="true" /> {m.tocada ? 'Desmarcar' : 'Tocada'}
            </button>
            <button type="button" className="pub-btn pub-btn-perigo-leve" onClick={() => window.confirm(`Excluir "${m.titulo}"?`) && executar(musicasApi.remover(m.id))} aria-label="Excluir música">
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ===================== QUIZ =====================

interface FormPergunta { id?: string; pergunta: string; opcoes: string[]; correta: number; ordem: number }
const PERGUNTA_VAZIA: FormPergunta = { pergunta: '', opcoes: ['', '', '', ''], correta: 0, ordem: 0 };

function AbaQuiz() {
  const [dados, recarregar] = useLista(quizApi.admin);
  const executar = useAcao(recarregar);
  const [form, setForm] = useState<FormPergunta | null>(null);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    // Remove opções vazias, mantendo a marcação da correta
    const preenchidas = form.opcoes.map((texto, i) => ({ texto: texto.trim(), i })).filter(o => o.texto);
    const correta = preenchidas.findIndex(o => o.i === form.correta);
    const payload = { pergunta: form.pergunta, opcoes: preenchidas.map(o => o.texto), correta: correta < 0 ? -1 : correta, ordem: form.ordem };
    if (payload.correta < 0) return void executar(Promise.resolve({ success: false, error: 'A opção marcada como correta está vazia' }));
    const ok = await executar(form.id ? quizApi.atualizarPergunta(form.id, payload) : quizApi.criarPergunta(payload), 'Pergunta salva');
    if (ok) setForm(null);
  };

  if (!dados?.perguntas) return <p>Carregando…</p>;
  const respostas: PosicaoQuiz[] = dados.respostas ?? [];

  return (
    <>
      <div className="int-admin-barra">
        <span className="int-admin-resumo">{dados.perguntas.length} pergunta(s) · {respostas.length} resposta(s)</span>
        {!form && (
          <button type="button" className="pub-btn pub-btn-primario" onClick={() => setForm({ ...PERGUNTA_VAZIA, ordem: dados.perguntas!.length })}>
            <Plus size={16} aria-hidden="true" /> Nova pergunta
          </button>
        )}
      </div>

      {respostas.length > 0 && dados.perguntas.length > 0 && !form && (
        <p className="int-aviso">Já há respostas. Se mudar as perguntas, a pontuação de quem já respondeu não é recalculada: zere as respostas antes do quiz começar de verdade.</p>
      )}

      {form && (
        <form className="int-admin-card int-admin-form" onSubmit={salvar}>
          <h3>{form.id ? 'Editar pergunta' : 'Nova pergunta'}</h3>
          <label>Pergunta <input required maxLength={300} value={form.pergunta} onChange={e => setForm({ ...form, pergunta: e.target.value })} placeholder="Ex.: Onde foi o primeiro encontro?" /></label>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
            <legend style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Opções (marque a correta)</legend>
            {form.opcoes.map((o, i) => (
              <div key={i} className="int-admin-opcao">
                <input type="radio" name="correta" checked={form.correta === i} onChange={() => setForm({ ...form, correta: i })} aria-label={`Opção ${i + 1} é a correta`} />
                <input value={o} maxLength={150} placeholder={`Opção ${i + 1}`} onChange={e => setForm({ ...form, opcoes: form.opcoes.map((x, j) => (j === i ? e.target.value : x)) })} />
                {form.opcoes.length > 2 && (
                  <button type="button" className="pub-btn pub-btn-link" aria-label={`Remover opção ${i + 1}`} onClick={() => setForm({
                    ...form,
                    opcoes: form.opcoes.filter((_, j) => j !== i),
                    correta: form.correta === i ? 0 : form.correta > i ? form.correta - 1 : form.correta,
                  })}><X size={16} aria-hidden="true" /></button>
                )}
              </div>
            ))}
            {form.opcoes.length < 6 && (
              <button type="button" className="pub-btn pub-btn-link" style={{ justifySelf: 'start' }} onClick={() => setForm({ ...form, opcoes: [...form.opcoes, ''] })}>
                <Plus size={14} aria-hidden="true" /> Adicionar opção
              </button>
            )}
          </fieldset>
          <label style={{ maxWidth: 160 }}>Ordem <input type="number" min={0} value={form.ordem} onChange={e => setForm({ ...form, ordem: Number(e.target.value) || 0 })} /></label>
          <div className="int-admin-form-rodape">
            <button type="submit" className="pub-btn pub-btn-primario">Salvar</button>
            <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <ol className="int-admin-lista">
        {dados.perguntas.map((p: PerguntaQuizAdmin) => (
          <li key={p.id}>
            <div>
              <strong>{p.pergunta}</strong>
              <br /><small>{p.opcoes.map((o, i) => (i === p.correta ? `✓ ${o}` : o)).join(' · ')}</small>
            </div>
            <div className="int-admin-acoes">
              <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setForm({ ...p })}><Pencil size={14} aria-hidden="true" /> Editar</button>
              <button type="button" className="pub-btn pub-btn-perigo-leve" onClick={() => window.confirm('Excluir esta pergunta?') && executar(quizApi.removerPergunta(p.id))} aria-label="Excluir pergunta">
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <section className="int-admin-card">
        <div className="int-admin-topo">
          <h3>Respostas ({respostas.length})</h3>
          {respostas.length > 0 && (
            <button
              type="button"
              className="pub-btn pub-btn-perigo-leve"
              onClick={() => window.confirm('Apagar TODAS as respostas do quiz? Todo mundo poderá responder de novo.') && executar(quizApi.zerarRespostas(), 'Respostas zeradas')}
            >
              <Trash2 size={14} aria-hidden="true" /> Zerar respostas
            </button>
          )}
        </div>
        {respostas.length === 0 ? <p style={{ margin: 0 }}>Ninguém respondeu ainda.</p> : (
          <ol className="int-admin-lista">
            {respostas.map((r, i) => (
              <li key={r.id}>
                <div><strong>{i + 1}º {r.nome}</strong> · {r.acertos}/{r.total} · {formatarTempo(r.tempoMs)}</div>
                <button type="button" className="pub-btn pub-btn-link" onClick={() => window.confirm(`Apagar a resposta de ${r.nome}?`) && executar(quizApi.removerResposta(r.id))}>Apagar</button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
