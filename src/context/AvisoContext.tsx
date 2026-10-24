import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AvisoContext, type TipoAviso } from './contextos';

interface Aviso {
  id: number;
  mensagem: string;
  tipo: TipoAviso;
}

let proximoId = 1;

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const fechar = useCallback((id: number) => {
    setAvisos(atual => atual.filter(a => a.id !== id));
  }, []);

  const avisar = useCallback((mensagem: string, tipo: TipoAviso = 'info') => {
    const id = proximoId++;
    setAvisos(atual => [...atual.slice(-2), { id, mensagem, tipo }]);
    window.setTimeout(() => fechar(id), tipo === 'erro' ? 7000 : 4000);
  }, [fechar]);

  const value = useMemo(() => ({ avisar }), [avisar]);

  return (
    <AvisoContext.Provider value={value}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map(aviso => (
          <div key={aviso.id} className={`aviso aviso-${aviso.tipo}`}>
            <span>{aviso.mensagem}</span>
            <button type="button" onClick={() => fechar(aviso.id)} aria-label="Fechar aviso">×</button>
          </div>
        ))}
      </div>
    </AvisoContext.Provider>
  );
}
