// Hooks das páginas interativas (título da aba e atualização periódica)
import { useEffect, useRef } from 'react';
import { casamento } from '../data/casamento';

export function useTituloDaAba(titulo: string) {
  useEffect(() => {
    const anterior = document.title;
    document.title = `${titulo} · ${casamento.noivos}`;
    return () => { document.title = anterior; };
  }, [titulo]);
}

// Carrega na hora e repete a cada `intervaloMs`. Com a aba escondida, pausa e
// atualiza assim que ela volta a ficar visível.
export function usePolling(fn: () => void | Promise<void>, intervaloMs: number) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);

  useEffect(() => {
    let parado = false;
    let timer: number | undefined;
    let primeira = true;

    const rodar = async () => {
      window.clearTimeout(timer);
      if (parado) return;
      if (primeira || document.visibilityState === 'visible') {
        primeira = false;
        try { await ref.current(); } catch { /* tenta de novo no próximo ciclo */ }
      }
      if (!parado) timer = window.setTimeout(rodar, intervaloMs);
    };

    const aoVoltar = () => { if (document.visibilityState === 'visible') rodar(); };
    document.addEventListener('visibilitychange', aoVoltar);
    rodar();
    return () => {
      parado = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [intervaloMs]);
}
