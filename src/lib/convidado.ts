// Identificação do convidado nas páginas interativas: só o nome digitado, sem login.
// O autorId é aleatório e fica no aparelho; serve para limitar votos, sugestões e respostas.
import { useCallback, useState } from 'react';

const CHAVE = 'casandinhos:convidado';

export interface Convidado {
  nome: string;
  autorId: string;
}

function novoId() {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    // randomUUID só existe em contexto seguro (https/localhost)
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Mesmo sem localStorage (aba anônima bloqueada), mantém o id durante a visita
let idDaSessao: string | null = null;

function ler(): Convidado {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null') as Partial<Convidado> | null;
    if (salvo?.autorId && /^[A-Za-z0-9-]{8,64}$/.test(salvo.autorId)) {
      return { nome: typeof salvo.nome === 'string' ? salvo.nome : '', autorId: salvo.autorId };
    }
  } catch {
    // armazenamento bloqueado ou corrompido
  }
  idDaSessao ??= novoId();
  const novo = { nome: '', autorId: idDaSessao };
  gravar(novo);
  return novo;
}

function gravar(convidado: Convidado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(convidado));
  } catch {
    // segue sem persistir
  }
}

export function useConvidado() {
  const [convidado, setConvidado] = useState<Convidado>(ler);

  const salvarNome = useCallback((nome: string) => {
    setConvidado(atual => {
      const novo = { ...atual, nome: nome.trim().slice(0, 80) };
      gravar(novo);
      return novo;
    });
  }, []);

  return { ...convidado, salvarNome };
}
