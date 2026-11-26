// Cliente das páginas interativas (cotas, mural, músicas, quiz e fotos) e das telas do painel
import { apiRequest } from './api';

export interface Cota {
  id: string;
  titulo: string;
  descricao: string | null;
  valorParte: number;
  totalPartes: number;
  partesUsadas: number;
}

export interface Contribuicao {
  id: string;
  nome: string;
  partes: number;
  mensagem: string | null;
  status: 'pendente' | 'confirmada' | 'recusada';
  txid: string;
  createdAt: string;
}

export interface CotaAdmin extends Omit<Cota, 'partesUsadas'> {
  ordem: number;
  ativa: boolean;
  contribuicoes: Contribuicao[];
}

export type CotaPayload = Pick<CotaAdmin, 'titulo' | 'descricao' | 'valorParte' | 'totalPartes' | 'ordem' | 'ativa'>;

export interface Recado {
  id: string;
  nome: string;
  mensagem: string;
  createdAt: string;
  status?: 'pendente' | 'aprovado' | 'recusado';
}

export interface Musica {
  id: string;
  titulo: string;
  artista: string;
  nome: string;
  tocada: boolean;
  votos: number;
  voteiNela: boolean;
  minha: boolean;
  createdAt: string;
}

export interface PerguntaQuiz {
  id: string;
  pergunta: string;
  opcoes: string[];
}

export interface PerguntaQuizAdmin extends PerguntaQuiz {
  correta: number;
  ordem: number;
}

export interface ResultadoQuiz {
  acertos: number;
  total: number;
  tempoMs: number;
  respostas: Record<string, number>;
  gabarito: Record<string, number>;
}

export interface PosicaoQuiz {
  id: string;
  nome: string;
  acertos: number;
  total: number;
  tempoMs: number;
  createdAt?: string;
}

export interface Foto {
  id: string;
  nome: string;
  url: string;
  miniaturaUrl: string;
  largura: number;
  altura: number;
  createdAt: string;
  oculta?: boolean;
}

const json = (body: unknown) => JSON.stringify(body);

export const cotasApi = {
  listar: () => apiRequest<{ cotas: Cota[] }>('/cotas'),
  contribuir: (cotaId: string, dados: { nome: string; autorId: string; partes: number; txid: string; mensagem?: string }) =>
    apiRequest<{ contribuicao: Contribuicao }>(`/cotas/${cotaId}/contribuicoes`, { method: 'POST', body: json(dados) }),

  admin: () => apiRequest<{ cotas: CotaAdmin[] }>('/admin/cotas'),
  criar: (dados: CotaPayload) => apiRequest('/admin/cotas', { method: 'POST', body: json(dados) }),
  atualizar: (id: string, dados: Partial<CotaPayload>) => apiRequest(`/admin/cotas/${id}`, { method: 'PUT', body: json(dados) }),
  remover: (id: string) => apiRequest(`/admin/cotas/${id}`, { method: 'DELETE' }),
  statusContribuicao: (id: string, status: Contribuicao['status']) =>
    apiRequest(`/admin/contribuicoes/${id}`, { method: 'PATCH', body: json({ status }) }),
  removerContribuicao: (id: string) => apiRequest(`/admin/contribuicoes/${id}`, { method: 'DELETE' }),
};

export const muralApi = {
  listar: () => apiRequest<{ recados: Recado[] }>('/recados'),
  enviar: (dados: { nome: string; autorId: string; mensagem: string }) =>
    apiRequest('/recados', { method: 'POST', body: json(dados) }),

  admin: () => apiRequest<{ recados: Recado[] }>('/admin/recados'),
  status: (id: string, status: NonNullable<Recado['status']>) =>
    apiRequest(`/admin/recados/${id}`, { method: 'PATCH', body: json({ status }) }),
  remover: (id: string) => apiRequest(`/admin/recados/${id}`, { method: 'DELETE' }),
};

export const musicasApi = {
  listar: (autorId?: string) =>
    apiRequest<{ musicas: Musica[]; maxPorPessoa: number }>(`/musicas${autorId ? `?autorId=${encodeURIComponent(autorId)}` : ''}`),
  sugerir: (dados: { nome: string; autorId: string; titulo: string; artista: string }) =>
    apiRequest('/musicas', { method: 'POST', body: json(dados) }),
  votar: (id: string, autorId: string) => apiRequest(`/musicas/${id}/voto`, { method: 'POST', body: json({ autorId }) }),
  desvotar: (id: string, autorId: string) => apiRequest(`/musicas/${id}/voto`, { method: 'DELETE', body: json({ autorId }) }),

  marcarTocada: (id: string, tocada: boolean) => apiRequest(`/admin/musicas/${id}`, { method: 'PATCH', body: json({ tocada }) }),
  remover: (id: string) => apiRequest(`/admin/musicas/${id}`, { method: 'DELETE' }),
};

export const quizApi = {
  carregar: (autorId: string) =>
    apiRequest<{ perguntas: PerguntaQuiz[]; resultado: ResultadoQuiz | null }>(`/quiz?autorId=${encodeURIComponent(autorId)}`),
  responder: (dados: { nome: string; autorId: string; respostas: Record<string, number>; tempoMs: number }) =>
    apiRequest<{ resultado: ResultadoQuiz }>('/quiz/respostas', { method: 'POST', body: json(dados) }),
  ranking: (limite = 10) => apiRequest<{ ranking: PosicaoQuiz[]; participantes: number }>(`/quiz/ranking?limite=${limite}`),

  admin: () => apiRequest<{ perguntas: PerguntaQuizAdmin[]; respostas: PosicaoQuiz[] }>('/admin/quiz'),
  criarPergunta: (dados: Omit<PerguntaQuizAdmin, 'id'>) =>
    apiRequest('/admin/quiz/perguntas', { method: 'POST', body: json(dados) }),
  atualizarPergunta: (id: string, dados: Omit<PerguntaQuizAdmin, 'id'>) =>
    apiRequest(`/admin/quiz/perguntas/${id}`, { method: 'PUT', body: json(dados) }),
  removerPergunta: (id: string) => apiRequest(`/admin/quiz/perguntas/${id}`, { method: 'DELETE' }),
  zerarRespostas: () => apiRequest<{ removidas: number }>('/admin/quiz/respostas', { method: 'DELETE' }),
  removerResposta: (id: string) => apiRequest(`/admin/quiz/respostas/${id}`, { method: 'DELETE' }),
};

export const fotosApi = {
  listar: (filtro: { nome?: string; depois?: string } = {}) => {
    const qs = new URLSearchParams();
    if (filtro.nome) qs.set('nome', filtro.nome);
    if (filtro.depois) qs.set('depois', filtro.depois);
    const sufixo = qs.toString() ? `?${qs}` : '';
    return apiRequest<{ fotos: Foto[]; autores: { nome: string; fotos: number }[]; armazenamentoDisponivel: boolean }>(`/fotos${sufixo}`);
  },

  // Foto e miniatura vão juntas no corpo (binário); os dados vão nos cabeçalhos
  async enviar(dados: { nome: string; autorId: string; foto: Blob; miniatura: Blob; largura: number; altura: number }) {
    try {
      const corpo = new Blob([dados.foto, dados.miniatura], { type: 'image/jpeg' });
      const resposta = await fetch('/api/fotos', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg',
          'X-Foto-Nome': encodeURIComponent(dados.nome),
          'X-Foto-Autor': dados.autorId,
          'X-Foto-Largura': String(dados.largura),
          'X-Foto-Altura': String(dados.altura),
          'X-Foto-Miniatura': String(dados.miniatura.size),
        },
        body: corpo,
      });
      const data = await resposta.json().catch(() => ({})) as { success?: boolean; error?: string; foto?: Foto };
      if (!resposta.ok) return { success: false, error: data.error || 'Não foi possível enviar a foto' };
      return { success: true, foto: data.foto };
    } catch {
      return { success: false, error: 'Sem conexão. Tente de novo.' };
    }
  },

  admin: () => apiRequest<{ fotos: Foto[] }>('/admin/fotos'),
  visibilidade: (id: string, oculta: boolean) => apiRequest(`/admin/fotos/${id}`, { method: 'PATCH', body: json({ oculta }) }),
  remover: (id: string) => apiRequest(`/admin/fotos/${id}`, { method: 'DELETE' }),
};
