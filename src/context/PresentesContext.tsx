import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { presentesApi } from '../lib/apiComplete';
import { useAuth } from '../hooks/useAuth';
import type { ItemCarrinho, ItemPublico, StatusCarrinho } from '../types';
import { PresentesContext, type ItemCarrinhoComStatus, type PresentesContextType, type ResultadoCheckout } from './contextos';

const CHAVE_CARRINHO = 'casandinhos:carrinho:v1';
// De quanto em quanto tempo a lista é conferida de novo enquanto a página está aberta
const INTERVALO_ATUALIZACAO = 60_000;

function lerCarrinho(): ItemCarrinho[] {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || '[]');
    return Array.isArray(salvo) ? salvo.filter(i => i && typeof i.itemId === 'string') : [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho: ItemCarrinho[]) {
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  } catch {
    // armazenamento indisponível: o carrinho dura só enquanto a página estiver aberta
  }
}

export function PresentesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [itens, setItens] = useState<ItemPublico[]>([]);
  const [multiplosPresenteadores, setMultiplos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState<string>();
  const [carrinhoBase, setCarrinhoBase] = useState<ItemCarrinho[]>(lerCarrinho);
  const carregandoRef = useRef(false);

  useEffect(() => salvarCarrinho(carrinhoBase), [carrinhoBase]);

  const recarregar = useCallback(async () => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    const response = await presentesApi.getItensPublicos();
    if (response.success && response.items) {
      setItens(response.items);
      setMultiplos(response.multiplosPresenteadores ?? false);
      setErro(undefined);
      setCarregado(true);
    } else {
      setErro(response.error || 'Não foi possível carregar a lista');
    }
    setCarregando(false);
    carregandoRef.current = false;
  }, []);

  // Recarrega ao entrar/sair da conta (muda o "escolhido por mim")
  useEffect(() => {
    recarregar();
  }, [recarregar, user?.id]);

  // Confere de novo quando a pessoa volta para a aba e periodicamente
  useEffect(() => {
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') recarregar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    const timer = window.setInterval(aoVoltar, INTERVALO_ATUALIZACAO);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      window.clearInterval(timer);
    };
  }, [recarregar]);

  // Itens que já são presentes do usuário logado saem do carrinho
  useEffect(() => {
    if (!carregado) return;
    const meus = new Set(itens.filter(i => i.escolhidoPorMim).map(i => i.id));
    if (carrinhoBase.some(c => meus.has(c.itemId))) {
      setCarrinhoBase(atual => atual.filter(c => !meus.has(c.itemId)));
    }
  }, [carregado, itens, carrinhoBase]);

  const carrinho = useMemo<ItemCarrinhoComStatus[]>(() => {
    const porId = new Map(itens.map(i => [i.id, i]));
    return carrinhoBase.map(c => {
      const item = porId.get(c.itemId);
      let status: StatusCarrinho = 'ok';
      if (carregado) {
        if (!item) status = 'indisponivel';
        else if (item.escolhido && !multiplosPresenteadores) status = 'esgotado';
        else if (item.escolhido && !c.escolhidoAoAdicionar && !c.aceitaDividir) status = 'escolhido';
      }
      return { ...c, nome: item?.nome ?? c.nome, status };
    });
  }, [carrinhoBase, itens, carregado, multiplosPresenteadores]);

  const noCarrinho = useCallback(
    (itemId: string) => carrinhoBase.some(c => c.itemId === itemId),
    [carrinhoBase]
  );

  const adicionarAoCarrinho = useCallback((item: ItemPublico) => {
    setCarrinhoBase(atual => atual.some(c => c.itemId === item.id) ? atual : [
      ...atual,
      {
        itemId: item.id,
        nome: item.nome,
        categoria: item.categoria,
        escolhidoAoAdicionar: item.escolhido,
        aceitaDividir: false,
        adicionadoEm: Date.now()
      }
    ]);
  }, []);

  const removerDoCarrinho = useCallback((itemId: string) => {
    setCarrinhoBase(atual => atual.filter(c => c.itemId !== itemId));
  }, []);

  const darJunto = useCallback((itemId: string) => {
    setCarrinhoBase(atual => atual.map(c => c.itemId === itemId ? { ...c, aceitaDividir: true } : c));
  }, []);

  const confirmarCarrinho = useCallback(async (): Promise<ResultadoCheckout> => {
    if (!user) return { success: false, precisaLogin: true };
    if (carrinho.length === 0) return { success: false, error: 'Seu carrinho está vazio' };
    if (carrinho.some(c => c.status !== 'ok')) {
      return { success: false, error: 'Alguns itens mudaram. Veja os destaques no carrinho.' };
    }

    const response = await presentesApi.checkout(carrinho.map(c => ({
      itemId: c.itemId,
      aceitaDividir: c.escolhidoAoAdicionar || c.aceitaDividir
    })));

    if (response.success) {
      const enviados = new Set(carrinho.map(c => c.itemId));
      setCarrinhoBase(atual => atual.filter(c => !enviados.has(c.itemId)));
      await recarregar();
      return { success: true, criadas: response.criadas };
    }

    if (response.status === 409) {
      // A lista atualizada faz os conflitos aparecerem destacados no carrinho
      await recarregar();
      return { success: false, conflitos: response.conflitos, error: response.error };
    }

    if (response.status === 401) return { success: false, precisaLogin: true };
    return { success: false, error: response.error };
  }, [user, carrinho, recarregar]);

  const value: PresentesContextType = {
    itens,
    multiplosPresenteadores,
    carregando,
    erro,
    recarregar,
    carrinho,
    noCarrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    darJunto,
    confirmarCarrinho
  };

  return (
    <PresentesContext.Provider value={value}>
      {children}
    </PresentesContext.Provider>
  );
}
