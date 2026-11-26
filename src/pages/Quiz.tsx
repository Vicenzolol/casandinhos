import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Check, Trophy, X } from 'lucide-react';
import { CampoNome, Carregando, LayoutConvidado } from '../components/LayoutConvidado';
import { usePolling, useTituloDaAba } from '../hooks/usePaginaInterativa';
import { useConvidado } from '../lib/convidado';
import { quizApi, type PerguntaQuiz, type PosicaoQuiz, type ResultadoQuiz } from '../lib/interativosApi';
import { useAviso } from '../hooks/useAviso';
import { formatarTempo } from '../lib/formatar';

export function Quiz() {
  const { avisar } = useAviso();
  const { nome, autorId, salvarNome } = useConvidado();
  const [perguntas, setPerguntas] = useState<PerguntaQuiz[] | null>(null);
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [atual, setAtual] = useState(-1); // -1: tela inicial
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const inicio = useRef(0);

  useEffect(() => {
    quizApi.carregar(autorId).then(r => {
      if (r.success && r.perguntas) {
        setPerguntas(r.perguntas);
        setResultado(r.resultado ?? null);
      } else {
        avisar(r.error || 'Erro ao carregar o quiz', 'erro');
      }
    });
  }, [autorId, avisar]);

  const comecar = () => {
    inicio.current = Date.now();
    setAtual(0);
  };

  const enviar = useCallback(async (finais: Record<string, number>) => {
    setEnviando(true);
    const r = await quizApi.responder({ nome, autorId, respostas: finais, tempoMs: Date.now() - inicio.current });
    setEnviando(false);
    if (r.success && r.resultado) setResultado(r.resultado);
    else avisar(r.error || 'Não foi possível enviar as respostas', 'erro');
  }, [nome, autorId, avisar]);

  const escolher = (pergunta: PerguntaQuiz, opcao: number) => {
    const novas = { ...respostas, [pergunta.id]: opcao };
    setRespostas(novas);
    if (perguntas && atual < perguntas.length - 1) setAtual(atual + 1);
    else enviar(novas);
  };

  const conteudo = () => {
    if (!perguntas) return <Carregando />;
    if (resultado) return <Resultado perguntas={perguntas} resultado={resultado} />;
    if (perguntas.length === 0) return <p className="pub-vazio">O quiz ainda está sendo preparado. Volte mais tarde!</p>;

    if (atual < 0) {
      return (
        <section className="pub-card int-caixa int-quiz-inicio">
          <p>São <strong>{perguntas.length} perguntas</strong>. Cada aparelho responde uma vez só, e o tempo conta como desempate. Boa sorte!</p>
          <CampoNome nome={nome} onSalvar={salvarNome} />
          <button type="button" className="pub-btn pub-btn-primario" onClick={comecar} disabled={!nome}>Começar o quiz</button>
        </section>
      );
    }

    const p = perguntas[atual];
    return (
      <section className="pub-card int-caixa int-quiz-pergunta" aria-live="polite">
        <p className="int-quiz-contador">Pergunta {atual + 1} de {perguntas.length}</p>
        <div className="int-progresso"><span style={{ width: `${(atual / perguntas.length) * 100}%` }} /></div>
        <h2>{p.pergunta}</h2>
        <div className="int-quiz-opcoes">
          {p.opcoes.map((opcao, i) => (
            <button key={i} type="button" className="int-quiz-opcao" onClick={() => escolher(p, i)} disabled={enviando}>
              {opcao}
            </button>
          ))}
        </div>
        {enviando && <p className="int-carregando">Calculando sua pontuação…</p>}
      </section>
    );
  };

  return (
    <LayoutConvidado titulo="Quiz dos noivos" subtitulo="Quanto você conhece o Vicenzo e a Flaviana?">
      {conteudo()}
    </LayoutConvidado>
  );
}

function Resultado({ perguntas, resultado }: { perguntas: PerguntaQuiz[]; resultado: ResultadoQuiz }) {
  return (
    <>
      <section className="pub-card int-caixa int-quiz-resultado">
        <Trophy size={40} aria-hidden="true" />
        <p className="int-quiz-placar">{resultado.acertos} de {resultado.total}</p>
        <p>acertos em {formatarTempo(resultado.tempoMs)}</p>
        <Link to="/quiz/telao" className="pub-btn pub-btn-secundario">Ver o ranking</Link>
      </section>

      <ol className="int-gabarito">
        {perguntas.map(p => {
          const minha = resultado.respostas[p.id];
          const certa = resultado.gabarito[p.id];
          const acertou = minha === certa;
          return (
            <li key={p.id} className={acertou ? 'certa' : 'errada'}>
              <strong>{p.pergunta}</strong>
              <span>
                {acertou ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                {' '}Resposta: {p.opcoes[certa] ?? '—'}
                {!acertou && minha !== undefined && <> · você marcou: {p.opcoes[minha]}</>}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function QuizTelao() {
  useTituloDaAba('Quiz (telão)');
  const [ranking, setRanking] = useState<PosicaoQuiz[]>([]);
  const [participantes, setParticipantes] = useState(0);

  usePolling(async () => {
    const r = await quizApi.ranking(10);
    if (r.success && r.ranking) {
      setRanking(r.ranking);
      setParticipantes(r.participantes ?? 0);
    }
  }, 5000);

  return (
    <div className="int-telao int-telao-lista">
      <header className="int-telao-topo">
        <h1><Trophy size={32} aria-hidden="true" /> Ranking do quiz</h1>
        <p>{participantes} {participantes === 1 ? 'participante' : 'participantes'} · jogue em {window.location.host}/quiz</p>
      </header>
      {ranking.length === 0 ? <p className="int-telao-vazio">Ninguém respondeu ainda. Seja o primeiro!</p> : (
        <ol className="int-ranking">
          {ranking.map((r, i) => (
            <li key={r.id} className={i < 3 ? `podio podio-${i + 1}` : ''}>
              <span className="int-ranking-pos">{i + 1}</span>
              <span className="int-ranking-nome"><strong>{r.nome}</strong></span>
              <span className="int-ranking-pontos">{r.acertos}/{r.total}</span>
              <span className="int-ranking-tempo">{formatarTempo(r.tempoMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
