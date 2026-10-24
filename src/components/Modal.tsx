import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  largura?: 'pequena' | 'media';
}

export function Modal({ titulo, onClose, children, largura = 'pequena' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Roda só ao abrir: re-renderizações do pai não devem roubar o foco
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const primeiro = ref.current?.querySelector<HTMLElement>('input, textarea, select, button:not(.pub-modal-fechar)');
    primeiro?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      anterior?.focus();
    };
  }, []);

  return (
    <div className="pub-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`pub-modal pub-modal-${largura}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="pub-modal-header">
          <h2>{titulo}</h2>
          <button type="button" className="pub-modal-fechar" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
