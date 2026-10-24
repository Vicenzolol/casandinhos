import { useEffect, useState } from 'react';
import { usePresentes } from '../hooks/usePresentes';
import { useAuth } from '../hooks/useAuth';
import { useAviso } from '../hooks/useAviso';
import { infoCategoria } from '../data/categorias';
import type { ItemCarrinhoComStatus } from '../context/contextos';
import { LoginModal } from './LoginModal';

interface CarrinhoProps {
  onTrocar: (categoria: string) => void;
  onConfirmado: () => void;
}

export function Carrinho({ onTrocar, onConfirmado }: CarrinhoProps) {
  const { carrinho, confirmarCarrinho, recarregar } = usePresentes();
  const { user } = useAuth();
  const { avisar } = useAviso();
  const [aberto, setAberto] = useState(false);
  const [pedindoLogin, setPedindoLogin] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [confirmarAposLogin, setConfirmarAposLogin] = useState(false);

  const pendencias = carrinho.filter(c => c.status !== 'ok').length;

  // Ao abrir o carrinho, confere a lista na hora
  useEffect(() => {
    if (aberto) recarregar();
  }, [aberto, recarregar]);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !pedindoLogin && setAberto(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aberto, pedindoLogin]);

  const confirmar = async () => {
    setEnviando(true);
    const resultado = await confirmarCarrinho();
    setEnviando(false);

    if (resultado.precisaLogin) {
      setPedindoLogin(true);
      return;
    }
    if (resultado.success) {
      const n = resultado.criadas ?? 0;
      avisar(`🎉 ${n === 1 ? 'Presente confirmado' : `${n} presentes confirmados`}! Muito obrigado 💕`, 'sucesso');
      setAberto(false);
      onConfirmado();
      return;
    }
    avisar(resultado.error || 'Não foi possível confirmar', 'erro');
  };

  // Depois do login pelo carrinho, continua a confirmação automaticamente
  useEffect(() => {
    if (confirmarAposLogin && user) {
      setConfirmarAposLogin(false);
      confirmar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmarAposLogin, user]);

  const trocar = (item: ItemCarrinhoComStatus, remover: () => void) => {
    remover();
    setAberto(false);
    onTrocar(item.categoria);
  };

  return (
    <>
      {carrinho.length > 0 && !aberto && (
        <button
          type="button"
          className={`pub-carrinho-botao ${pendencias > 0 ? 'com-pendencia' : ''}`}
          onClick={() => setAberto(true)}
        >
          🛒 Carrinho <span className="pub-carrinho-qtd">{carrinho.length}</span>
          {pendencias > 0 && <span className="pub-carrinho-alerta" aria-label={`${pendencias} item(ns) precisam de atenção`}>!</span>}
        </button>
      )}

      {aberto && (
        <div className="pub-gaveta-overlay" onMouseDown={e => e.target === e.currentTarget && setAberto(false)}>
          <aside className="pub-gaveta" role="dialog" aria-modal="true" aria-label="Seu carrinho">
            <div className="pub-gaveta-header">
              <h2>Seu carrinho</h2>
              <button type="button" className="pub-modal-fechar" onClick={() => setAberto(false)} aria-label="Fechar carrinho">×</button>
            </div>

            <div className="pub-gaveta-corpo">
              {carrinho.length === 0 && <p className="pub-vazio">Seu carrinho está vazio.</p>}

              {pendencias > 0 && (
                <div className="pub-gaveta-aviso" role="alert">
                  Algumas coisas mudaram enquanto os presentes estavam no seu carrinho. Veja abaixo.
                </div>
              )}

              <ul className="pub-carrinho-lista">
                {carrinho.map(item => (
                  <LinhaCarrinho key={item.itemId} item={item} onTrocar={trocar} />
                ))}
              </ul>
            </div>

            {carrinho.length > 0 && (
              <div className="pub-gaveta-rodape">
                {user ? (
                  <p className="pub-gaveta-quem">Confirmando como <strong>{user.nome}</strong></p>
                ) : (
                  <p className="pub-gaveta-quem">Para confirmar, entre com o acesso que os noivos te enviaram.</p>
                )}
                <button
                  type="button"
                  className="pub-btn pub-btn-primario pub-btn-bloco"
                  disabled={enviando || pendencias > 0}
                  onClick={confirmar}
                >
                  {enviando
                    ? 'Confirmando...'
                    : user
                      ? `Confirmar ${carrinho.length === 1 ? 'presente' : `${carrinho.length} presentes`}`
                      : 'Entrar e confirmar'}
                </button>
                {pendencias > 0 && <p className="pub-gaveta-dica">Resolva os itens destacados para confirmar.</p>}
              </div>
            )}
          </aside>
        </div>
      )}

      {pedindoLogin && (
        <LoginModal
          motivo="Para confirmar seus presentes, entre com o email e a senha que os noivos te enviaram. Seu carrinho continua salvo."
          onClose={() => setPedindoLogin(false)}
          onSuccess={() => setConfirmarAposLogin(true)}
        />
      )}
    </>
  );
}

interface LinhaProps {
  item: ItemCarrinhoComStatus;
  onTrocar: (item: ItemCarrinhoComStatus, remover: () => void) => void;
}

function LinhaCarrinho({ item, onTrocar }: LinhaProps) {
  const { removerDoCarrinho, darJunto } = usePresentes();
  const remover = () => removerDoCarrinho(item.itemId);
  const info = infoCategoria(item.categoria);

  return (
    <li className={`pub-carrinho-item ${item.status !== 'ok' ? 'pendente' : ''}`}>
      <div className="pub-carrinho-item-topo">
        <span aria-hidden="true">{info.icon}</span>
        <strong>{item.nome}</strong>
        <button type="button" className="pub-btn-icone" onClick={remover} aria-label={`Remover ${item.nome} do carrinho`}>×</button>
      </div>

      {item.status === 'ok' && (item.escolhidoAoAdicionar || item.aceitaDividir) && (
        <p className="pub-carrinho-nota">🤝 Você vai dar junto com outra pessoa.</p>
      )}

      {item.status === 'escolhido' && (
        <>
          <p className="pub-carrinho-nota">Outra pessoa escolheu este presente enquanto ele estava no seu carrinho. Quer dar junto ou prefere trocar?</p>
          <div className="pub-carrinho-acoes">
            <button type="button" className="pub-btn pub-btn-primario" onClick={() => darJunto(item.itemId)}>Dar junto</button>
            <button type="button" className="pub-btn pub-btn-secundario" onClick={() => onTrocar(item, remover)}>Trocar por outro</button>
          </div>
        </>
      )}

      {item.status === 'esgotado' && (
        <>
          <p className="pub-carrinho-nota">Este presente acabou de ser escolhido por outra pessoa.</p>
          <div className="pub-carrinho-acoes">
            <button type="button" className="pub-btn pub-btn-primario" onClick={() => onTrocar(item, remover)}>Escolher outro</button>
            <button type="button" className="pub-btn pub-btn-secundario" onClick={remover}>Remover</button>
          </div>
        </>
      )}

      {item.status === 'indisponivel' && (
        <>
          <p className="pub-carrinho-nota">Este presente saiu da lista.</p>
          <div className="pub-carrinho-acoes">
            <button type="button" className="pub-btn pub-btn-primario" onClick={() => onTrocar(item, remover)}>Escolher outro</button>
            <button type="button" className="pub-btn pub-btn-secundario" onClick={remover}>Remover</button>
          </div>
        </>
      )}
    </li>
  );
}
