import { useMemo, useState } from 'react';
import { usePresentes } from '../hooks/usePresentes';
import { categoriasInfo, infoCategoria, nomeDoSite } from '../data/categorias';
import type { ItemPublico } from '../types';

interface ListaPublicaProps {
  categoria: string;
  onCategoria: (categoria: string) => void;
  onVerMeusPresentes: () => void;
}

const ordemPrioridade: Record<string, number> = { essencial: 0, alta: 1, media: 2, baixa: 3 };

export function ListaPublica({ categoria, onCategoria, onVerMeusPresentes }: ListaPublicaProps) {
  const { itens, carregando, erro, recarregar, multiplosPresenteadores } = usePresentes();
  const [busca, setBusca] = useState('');
  const [soDisponiveis, setSoDisponiveis] = useState(false);

  // Sem múltiplos presenteadores, item escolhido por outra pessoa não pode ser escolhido:
  // some da lista (os escolhidos pelo próprio convidado continuam aparecendo)
  const visiveis = useMemo(
    () => (multiplosPresenteadores ? itens : itens.filter(i => !i.escolhido)),
    [itens, multiplosPresenteadores]
  );

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = visiveis
      .filter(item =>
        (categoria === 'todas' || item.categoria === categoria) &&
        (!soDisponiveis || (!item.escolhido && !item.escolhidoPorMim)) &&
        (termo === '' ||
          item.nome.toLowerCase().includes(termo) ||
          (item.descricao?.toLowerCase().includes(termo) ?? false))
      )
      .sort((a, b) =>
        Number(a.escolhido || a.escolhidoPorMim) - Number(b.escolhido || b.escolhidoPorMim) ||
        (ordemPrioridade[a.prioridade] ?? 9) - (ordemPrioridade[b.prioridade] ?? 9) ||
        a.nome.localeCompare(b.nome)
      );

    const porCategoria = new Map<string, ItemPublico[]>();
    for (const item of filtrados) {
      porCategoria.set(item.categoria, [...(porCategoria.get(item.categoria) ?? []), item]);
    }
    const ordem = Object.keys(categoriasInfo);
    const posicao = (cat: string) => (ordem.indexOf(cat) + 1) || ordem.length + 1;
    return [...porCategoria.entries()].sort(([a], [b]) => posicao(a) - posicao(b));
  }, [visiveis, categoria, busca, soDisponiveis]);

  const disponiveis = itens.filter(i => !i.escolhido && !i.escolhidoPorMim).length;

  return (
    <div className="pub-lista">
      <section className="pub-hero">
        <p className="pub-hero-sobre">Lista de presentes</p>
        <h1>Flaviana &amp; Vicenzo</h1>
        <p>
          Obrigado por fazer parte deste momento! Escolha os presentes que quiser, coloque no
          carrinho e confirme quando estiver pronto.
          {multiplosPresenteadores && <> Itens marcados como <strong>Já escolhido</strong> já têm alguém cuidando deles.</>}
        </p>
        {!carregando && !erro && (
          <p className="pub-hero-contagem">
            {multiplosPresenteadores
              ? `${disponiveis} de ${itens.length} presentes ainda disponíveis`
              : `${disponiveis} ${disponiveis === 1 ? 'presente disponível' : 'presentes disponíveis'}`}
          </p>
        )}
      </section>

      <div className="pub-filtros">
        <input
          type="search"
          className="pub-busca"
          placeholder="Buscar presente..."
          aria-label="Buscar presente"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <div className="pub-chips" role="group" aria-label="Filtrar por categoria">
          <button
            type="button"
            className={`pub-chip ${categoria === 'todas' ? 'ativo' : ''}`}
            aria-pressed={categoria === 'todas'}
            onClick={() => onCategoria('todas')}
          >
            Todos
          </button>
          {Object.values(categoriasInfo).map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`pub-chip ${categoria === cat.id ? 'ativo' : ''}`}
              aria-pressed={categoria === cat.id}
              onClick={() => onCategoria(cat.id)}
            >
              {cat.icon} {cat.nome.replace(/^Itens para (a )?/, '')}
            </button>
          ))}
        </div>
        {multiplosPresenteadores && (
          <label className="pub-check">
            <input type="checkbox" checked={soDisponiveis} onChange={e => setSoDisponiveis(e.target.checked)} />
            Mostrar só os disponíveis
          </label>
        )}
      </div>

      {carregando && <p className="pub-vazio">Carregando a lista...</p>}

      {erro && (
        <div className="pub-vazio">
          <p>{erro}</p>
          <button type="button" className="pub-btn pub-btn-secundario" onClick={recarregar}>Tentar de novo</button>
        </div>
      )}

      {!carregando && !erro && grupos.length === 0 && (
        <div className="pub-vazio">
          <p>Nenhum presente encontrado com esses filtros.</p>
          <button
            type="button"
            className="pub-btn pub-btn-secundario"
            onClick={() => { setBusca(''); setSoDisponiveis(false); onCategoria('todas'); }}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {grupos.map(([cat, itensDaCategoria]) => {
        const info = infoCategoria(cat);
        return (
          <section key={cat} className="pub-categoria">
            <h2>
              <span aria-hidden="true">{info.icon}</span> {info.nome}
              <span className="pub-categoria-contagem">{itensDaCategoria.length}</span>
            </h2>
            <div className="pub-grid">
              {itensDaCategoria.map(item => (
                <CartaoPresente
                  key={item.id}
                  item={item}
                  multiplos={multiplosPresenteadores}
                  onVerMeusPresentes={onVerMeusPresentes}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface CartaoProps {
  item: ItemPublico;
  multiplos: boolean;
  onVerMeusPresentes: () => void;
}

function CartaoPresente({ item, multiplos, onVerMeusPresentes }: CartaoProps) {
  const { noCarrinho, adicionarAoCarrinho, removerDoCarrinho } = usePresentes();
  const estaNoCarrinho = noCarrinho(item.id);
  const bloqueado = item.escolhido && !multiplos;

  let classe = 'pub-card';
  if (item.escolhidoPorMim) classe += ' meu';
  else if (item.escolhido) classe += ' escolhido';
  if (estaNoCarrinho) classe += ' no-carrinho';

  return (
    <article className={classe}>
      <div className="pub-card-topo">
        <h3>{item.nome}</h3>
        {item.escolhidoPorMim && <span className="pub-selo pub-selo-meu">💝 Você vai dar</span>}
        {!item.escolhidoPorMim && item.escolhido && <span className="pub-selo pub-selo-escolhido">🎁 Já escolhido</span>}
      </div>

      {item.descricao && <p className="pub-card-desc">{item.descricao}</p>}

      {(item.prioridade === 'essencial' || item.prioridade === 'alta') && (
        <span className={`pub-prioridade ${item.prioridade}`}>
          {item.prioridade === 'essencial' ? '🔥 Essencial' : '⭐ Muito desejado'}
        </span>
      )}

      {item.links.length > 0 && (
        <div className="pub-links">
          <span>Inspiração:</span>
          {item.links.map(link => (
            <a key={link} href={link} target="_blank" rel="noopener noreferrer nofollow">
              {nomeDoSite(link)} ↗
            </a>
          ))}
        </div>
      )}

      <div className="pub-card-acao">
        {item.escolhidoPorMim ? (
          <button type="button" className="pub-btn pub-btn-link" onClick={onVerMeusPresentes}>
            Ver meus presentes
          </button>
        ) : estaNoCarrinho ? (
          <button
            type="button"
            className="pub-btn pub-btn-secundario pub-btn-bloco"
            onClick={() => removerDoCarrinho(item.id)}
            aria-label={`Tirar ${item.nome} do carrinho`}
          >
            ✓ No carrinho · tirar
          </button>
        ) : bloqueado ? (
          <button type="button" className="pub-btn pub-btn-bloco" disabled>
            Já escolhido
          </button>
        ) : (
          <button
            type="button"
            className={`pub-btn pub-btn-bloco ${item.escolhido ? 'pub-btn-secundario' : 'pub-btn-primario'}`}
            onClick={() => adicionarAoCarrinho(item)}
          >
            {item.escolhido ? '🤝 Quero dar junto' : '🛒 Adicionar ao carrinho'}
          </button>
        )}
      </div>
    </article>
  );
}
