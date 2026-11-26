// Rotas das páginas interativas dos convidados: cotas (Pix), mural, músicas, quiz e fotos.
// O convidado não faz login: ele se identifica pelo nome e por um autorId aleatório
// gerado no próprio aparelho.
import express from 'express';
import type { Express, RequestHandler, Response } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  armazenamentoDisponivel, envioDireto, linkDeEnvio, PASTA_LOCAL, removerArquivo, salvarArquivo, tamanhoDoArquivo, urlPublica
} from '../lib/armazenamento';

type Validar = <T extends z.ZodTypeAny>(schema: T, data: unknown, res: Response) => z.infer<T> | undefined;

interface Dependencias {
  validar: Validar;
  authenticateToken: RequestHandler;
  requireAdmin: RequestHandler;
}

// Na festa muitos convidados dividem o mesmo IP (wifi do sítio): limites folgados
const interativoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Muitas requisições. Aguarde alguns minutos e tente de novo.' }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 800,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Muitas fotos de uma vez. Aguarde alguns minutos e tente de novo.' }
});

// A foto vai na qualidade original (só sem metadados): até 40MB.
// Com R2 o navegador envia direto ao bucket; sem R2 (desenvolvimento) passa pelo servidor.
// Na Vercel o corpo de uma requisição tem limite de ~4,5MB, por isso lá o envio é sempre direto.
const MB = 1024 * 1024;
const LIMITES = { foto: 40 * MB, tela: 4 * MB, miniatura: 1 * MB };
const LIMITE_ENVIO_SERVIDOR = process.env.VERCEL ? 4 * MB : LIMITES.foto + LIMITES.tela + LIMITES.miniatura;
export const ROTA_UPLOAD_FOTO = '/api/fotos';

// Cada foto guarda 3 arquivos: original, versão de tela (2048px, galeria e telão) e miniatura
const chavesDaFoto = (base: string) => ({ foto: `${base}.jpg`, tela: `${base}-tela.jpg`, miniatura: `${base}-mini.jpg` });
const novaBase = () => `fotos/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
const BASE_VALIDA = /^fotos\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const telaUrl = (url: string) => url.replace(/\.jpg$/, '-tela.jpg');

const nomeSchema = z.string().trim().min(1, 'Digite seu nome').max(80, 'Nome muito longo');
const autorIdSchema = z.string().regex(/^[A-Za-z0-9-]{8,64}$/, 'Identificador inválido');
const textoOpcional = (max: number) => z.string().trim().max(max).nullish()
  .transform(v => (v === '' || v == null ? null : v));

const MAX_MUSICAS_POR_PESSOA = 3;

// ===== Schemas =====

const contribuicaoSchema = z.object({
  nome: nomeSchema,
  autorId: autorIdSchema,
  partes: z.number().int().min(1, 'Escolha pelo menos 1 parte').max(1000),
  txid: z.string().regex(/^[A-Za-z0-9]{1,25}$/, 'Identificador do Pix inválido'),
  mensagem: textoOpcional(500)
});

const cotaSchema = z.object({
  titulo: z.string().trim().min(1, 'Título é obrigatório').max(120),
  descricao: textoOpcional(1000),
  valorParte: z.number().int().min(100, 'Valor mínimo de R$ 1,00').max(10_000_000),
  totalPartes: z.number().int().min(1).max(1000),
  ordem: z.number().int().min(0).max(10_000).default(0),
  ativa: z.boolean().default(true)
});

const statusContribuicaoSchema = z.object({ status: z.enum(['pendente', 'confirmada', 'recusada']) });

const recadoSchema = z.object({
  nome: nomeSchema,
  autorId: autorIdSchema,
  mensagem: z.string().trim().min(1, 'Escreva um recado').max(1000, 'Recado muito longo (máx. 1000 caracteres)')
});

const statusRecadoSchema = z.object({ status: z.enum(['pendente', 'aprovado', 'recusado']) });

const musicaSchema = z.object({
  nome: nomeSchema,
  autorId: autorIdSchema,
  titulo: z.string().trim().min(1, 'Digite o nome da música').max(120),
  artista: z.string().trim().min(1, 'Digite o artista').max(120)
});

const autorSchema = z.object({ autorId: autorIdSchema });

const perguntaSchema = z.object({
  pergunta: z.string().trim().min(1, 'Digite a pergunta').max(300),
  opcoes: z.array(z.string().trim().min(1, 'Opção vazia').max(150)).min(2, 'Pelo menos 2 opções').max(6, 'No máximo 6 opções'),
  correta: z.number().int().min(0),
  ordem: z.number().int().min(0).max(10_000).default(0)
}).refine(p => p.correta < p.opcoes.length, { message: 'Marque qual opção é a correta' });

const respostaQuizSchema = z.object({
  nome: nomeSchema,
  autorId: autorIdSchema,
  respostas: z.record(z.string().max(40), z.number().int().min(0).max(10)),
  tempoMs: z.number().int().min(0).max(24 * 60 * 60 * 1000)
});

const pessoaFotoSchema = { nome: nomeSchema, autorId: autorIdSchema };
const dimensoesSchema = {
  largura: z.coerce.number().int().min(1).max(20_000),
  altura: z.coerce.number().int().min(1).max(20_000)
};

const pedidoEnvioSchema = z.object({
  ...pessoaFotoSchema,
  tamanhos: z.object({
    foto: z.number().int().min(1).max(LIMITES.foto, 'Foto grande demais (máx. 40MB)'),
    tela: z.number().int().min(1).max(LIMITES.tela),
    miniatura: z.number().int().min(1).max(LIMITES.miniatura)
  })
});

const confirmarEnvioSchema = z.object({
  ...pessoaFotoSchema,
  ...dimensoesSchema,
  base: z.string().regex(BASE_VALIDA, 'Envio inválido')
});

const fotoMetaSchema = z.object({
  ...pessoaFotoSchema,
  ...dimensoesSchema,
  tela: z.coerce.number().int().min(1).max(LIMITES.tela),
  miniatura: z.coerce.number().int().min(1).max(LIMITES.miniatura)
});

const visibilidadeSchema = z.object({ oculta: z.boolean() });
const tocadaSchema = z.object({ tocada: z.boolean() });

// ===== Auxiliares =====

// Partes que contam no progresso: pendentes (o convidado disse que pagou) e confirmadas
const STATUS_QUE_CONTAM = ['pendente', 'confirmada'];

async function partesUsadasPorCota() {
  const grupos = await prisma.contribuicao.groupBy({
    by: ['cotaId'],
    where: { status: { in: STATUS_QUE_CONTAM } },
    _sum: { partes: true }
  });
  return new Map(grupos.map(g => [g.cotaId, g._sum.partes ?? 0]));
}

function ehJpeg(buf: Buffer) {
  return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

function cabecalho(valor: string | string[] | undefined) {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  if (!texto) return undefined;
  try {
    return decodeURIComponent(texto);
  } catch {
    return undefined;
  }
}

// Ranking do quiz: mais acertos primeiro; empate decidido por quem respondeu mais rápido
const ordemRanking = [{ acertos: 'desc' as const }, { tempoMs: 'asc' as const }, { createdAt: 'asc' as const }];

export function registrarInterativos(app: Express, { validar, authenticateToken, requireAdmin }: Dependencias) {
  const admin = [authenticateToken, requireAdmin];

  // Sem R2, fora da Vercel, as fotos ficam na pasta local uploads/
  app.use('/uploads', express.static(PASTA_LOCAL, { maxAge: '1y', immutable: true, fallthrough: false }));

  // ===================== COTAS =====================

  app.get('/api/cotas', async (_req, res) => {
    const [cotas, usadas] = await Promise.all([
      prisma.cota.findMany({
        where: { ativa: true },
        select: { id: true, titulo: true, descricao: true, valorParte: true, totalPartes: true },
        orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }]
      }),
      partesUsadasPorCota()
    ]);
    res.json({ success: true, cotas: cotas.map(c => ({ ...c, partesUsadas: usadas.get(c.id) ?? 0 })) });
  });

  app.post('/api/cotas/:id/contribuicoes', interativoLimiter, async (req, res) => {
    const dados = validar(contribuicaoSchema, req.body, res);
    if (!dados) return;

    const resultado = await prisma.$transaction(async tx => {
      // Trava a cota para duas pessoas não ficarem com a mesma última parte
      await tx.$queryRaw`SELECT id FROM "cotas" WHERE id = ${req.params.id} FOR UPDATE`;
      const cota = await tx.cota.findUnique({ where: { id: req.params.id } });
      if (!cota || !cota.ativa) return { erro: 'Esta cota não está mais disponível', status: 404 };

      const soma = await tx.contribuicao.aggregate({
        where: { cotaId: cota.id, status: { in: STATUS_QUE_CONTAM } },
        _sum: { partes: true }
      });
      const restantes = cota.totalPartes - (soma._sum.partes ?? 0);
      if (dados.partes > restantes) {
        return {
          erro: restantes > 0 ? `Restam só ${restantes} parte(s) desta cota` : 'Esta cota já foi completada',
          status: 409
        };
      }

      const contribuicao = await tx.contribuicao.create({
        data: { ...dados, cotaId: cota.id },
        select: { id: true, partes: true, status: true, createdAt: true }
      });
      return { contribuicao };
    });

    if ('erro' in resultado) return res.status(resultado.status!).json({ success: false, error: resultado.erro });
    res.status(201).json({ success: true, contribuicao: resultado.contribuicao });
  });

  app.get('/api/admin/cotas', ...admin, async (_req, res) => {
    const cotas = await prisma.cota.findMany({
      include: { contribuicoes: { orderBy: { createdAt: 'desc' } } },
      orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }]
    });
    res.json({ success: true, cotas });
  });

  app.post('/api/admin/cotas', ...admin, async (req, res) => {
    const dados = validar(cotaSchema, req.body, res);
    if (!dados) return;
    const cota = await prisma.cota.create({ data: dados });
    res.status(201).json({ success: true, cota });
  });

  app.put('/api/admin/cotas/:id', ...admin, async (req, res) => {
    const dados = validar(cotaSchema.partial(), req.body, res);
    if (!dados) return;
    const cota = await prisma.cota.update({ where: { id: req.params.id }, data: dados });
    res.json({ success: true, cota });
  });

  app.delete('/api/admin/cotas/:id', ...admin, async (req, res) => {
    await prisma.cota.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.patch('/api/admin/contribuicoes/:id', ...admin, async (req, res) => {
    const dados = validar(statusContribuicaoSchema, req.body, res);
    if (!dados) return;
    const contribuicao = await prisma.contribuicao.update({ where: { id: req.params.id }, data: dados });
    res.json({ success: true, contribuicao });
  });

  app.delete('/api/admin/contribuicoes/:id', ...admin, async (req, res) => {
    await prisma.contribuicao.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // ===================== MURAL =====================

  app.get('/api/recados', async (_req, res) => {
    const recados = await prisma.recado.findMany({
      where: { status: 'aprovado' },
      select: { id: true, nome: true, mensagem: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500
    });
    res.json({ success: true, recados });
  });

  app.post('/api/recados', interativoLimiter, async (req, res) => {
    const dados = validar(recadoSchema, req.body, res);
    if (!dados) return;
    await prisma.recado.create({ data: dados });
    res.status(201).json({ success: true });
  });

  app.get('/api/admin/recados', ...admin, async (_req, res) => {
    const recados = await prisma.recado.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, recados });
  });

  app.patch('/api/admin/recados/:id', ...admin, async (req, res) => {
    const dados = validar(statusRecadoSchema, req.body, res);
    if (!dados) return;
    const recado = await prisma.recado.update({ where: { id: req.params.id }, data: dados });
    res.json({ success: true, recado });
  });

  app.delete('/api/admin/recados/:id', ...admin, async (req, res) => {
    await prisma.recado.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // ===================== MÚSICAS =====================

  async function listarMusicas(autorId?: string) {
    const musicas = await prisma.musica.findMany({
      include: { _count: { select: { votos: true } }, votos: autorId ? { where: { autorId }, select: { id: true } } : false },
      orderBy: { createdAt: 'asc' }
    });
    return musicas
      .map(({ _count, votos, autorId: dono, ...m }) => ({
        ...m,
        votos: _count.votos,
        voteiNela: Array.isArray(votos) && votos.length > 0,
        minha: autorId ? dono === autorId : false
      }))
      .sort((a, b) => b.votos - a.votos || a.createdAt.getTime() - b.createdAt.getTime());
  }

  app.get('/api/musicas', async (req, res) => {
    const autor = autorIdSchema.safeParse(req.query.autorId);
    const musicas = await listarMusicas(autor.success ? autor.data : undefined);
    res.json({ success: true, musicas, maxPorPessoa: MAX_MUSICAS_POR_PESSOA });
  });

  app.post('/api/musicas', interativoLimiter, async (req, res) => {
    const dados = validar(musicaSchema, req.body, res);
    if (!dados) return;

    const minhas = await prisma.musica.count({ where: { autorId: dados.autorId } });
    if (minhas >= MAX_MUSICAS_POR_PESSOA) {
      return res.status(409).json({ success: false, error: `Cada pessoa pode sugerir até ${MAX_MUSICAS_POR_PESSOA} músicas` });
    }

    const repetida = await prisma.musica.findFirst({
      where: {
        titulo: { equals: dados.titulo, mode: 'insensitive' },
        artista: { equals: dados.artista, mode: 'insensitive' }
      }
    });
    if (repetida) {
      return res.status(409).json({ success: false, error: 'Essa música já foi sugerida: vote nela na lista!' });
    }

    // Quem sugere já vota na própria música
    const musica = await prisma.musica.create({
      data: { ...dados, votos: { create: { autorId: dados.autorId } } }
    });
    res.status(201).json({ success: true, musica });
  });

  app.post('/api/musicas/:id/voto', interativoLimiter, async (req, res) => {
    const dados = validar(autorSchema, req.body, res);
    if (!dados) return;
    await prisma.votoMusica.upsert({
      where: { musicaId_autorId: { musicaId: req.params.id, autorId: dados.autorId } },
      create: { musicaId: req.params.id, autorId: dados.autorId },
      update: {}
    });
    res.json({ success: true });
  });

  app.delete('/api/musicas/:id/voto', interativoLimiter, async (req, res) => {
    const dados = validar(autorSchema, req.body, res);
    if (!dados) return;
    await prisma.votoMusica.deleteMany({ where: { musicaId: req.params.id, autorId: dados.autorId } });
    res.json({ success: true });
  });

  // DJ e noivos: marcar como tocada (exige login de admin no aparelho)
  app.patch('/api/admin/musicas/:id', ...admin, async (req, res) => {
    const dados = validar(tocadaSchema, req.body, res);
    if (!dados) return;
    const musica = await prisma.musica.update({ where: { id: req.params.id }, data: dados });
    res.json({ success: true, musica });
  });

  app.delete('/api/admin/musicas/:id', ...admin, async (req, res) => {
    await prisma.musica.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // ===================== QUIZ =====================

  // Perguntas sem a resposta certa. Se o aparelho já respondeu, devolve o resultado.
  app.get('/api/quiz', async (req, res) => {
    const autor = autorIdSchema.safeParse(req.query.autorId);
    const [perguntas, minha] = await Promise.all([
      prisma.quizPergunta.findMany({
        select: { id: true, pergunta: true, opcoes: true },
        orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }]
      }),
      autor.success ? prisma.quizResposta.findUnique({ where: { autorId: autor.data } }) : null
    ]);

    let resultado = null;
    if (minha) {
      const gabarito = await prisma.quizPergunta.findMany({ select: { id: true, correta: true } });
      resultado = {
        acertos: minha.acertos,
        total: minha.total,
        tempoMs: minha.tempoMs,
        respostas: minha.respostas,
        gabarito: Object.fromEntries(gabarito.map(g => [g.id, g.correta]))
      };
    }
    res.json({ success: true, perguntas, resultado });
  });

  app.post('/api/quiz/respostas', interativoLimiter, async (req, res) => {
    const dados = validar(respostaQuizSchema, req.body, res);
    if (!dados) return;

    const perguntas = await prisma.quizPergunta.findMany({ select: { id: true, correta: true } });
    if (perguntas.length === 0) return res.status(400).json({ success: false, error: 'O quiz ainda não tem perguntas' });

    // A pontuação é calculada aqui, nunca no aparelho
    const acertos = perguntas.filter(p => dados.respostas[p.id] === p.correta).length;
    const respostas = Object.fromEntries(perguntas.filter(p => p.id in dados.respostas).map(p => [p.id, dados.respostas[p.id]]));

    const existente = await prisma.quizResposta.findUnique({ where: { autorId: dados.autorId } });
    if (existente) return res.status(409).json({ success: false, error: 'Este aparelho já respondeu o quiz' });

    await prisma.quizResposta.create({
      data: { nome: dados.nome, autorId: dados.autorId, respostas, acertos, total: perguntas.length, tempoMs: dados.tempoMs }
    });

    res.status(201).json({
      success: true,
      resultado: {
        acertos,
        total: perguntas.length,
        tempoMs: dados.tempoMs,
        respostas,
        gabarito: Object.fromEntries(perguntas.map(p => [p.id, p.correta]))
      }
    });
  });

  app.get('/api/quiz/ranking', async (req, res) => {
    const limite = Math.min(Math.max(Number(req.query.limite) || 10, 1), 100);
    const [ranking, participantes] = await Promise.all([
      prisma.quizResposta.findMany({
        select: { id: true, nome: true, acertos: true, total: true, tempoMs: true },
        orderBy: ordemRanking,
        take: limite
      }),
      prisma.quizResposta.count()
    ]);
    res.json({ success: true, ranking, participantes });
  });

  app.get('/api/admin/quiz', ...admin, async (_req, res) => {
    const [perguntas, respostas] = await Promise.all([
      prisma.quizPergunta.findMany({ orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }] }),
      prisma.quizResposta.findMany({ orderBy: ordemRanking })
    ]);
    res.json({ success: true, perguntas, respostas });
  });

  app.post('/api/admin/quiz/perguntas', ...admin, async (req, res) => {
    const dados = validar(perguntaSchema, req.body, res);
    if (!dados) return;
    const pergunta = await prisma.quizPergunta.create({ data: dados });
    res.status(201).json({ success: true, pergunta });
  });

  app.put('/api/admin/quiz/perguntas/:id', ...admin, async (req, res) => {
    const dados = validar(perguntaSchema, req.body, res);
    if (!dados) return;
    const pergunta = await prisma.quizPergunta.update({ where: { id: req.params.id }, data: dados });
    res.json({ success: true, pergunta });
  });

  app.delete('/api/admin/quiz/perguntas/:id', ...admin, async (req, res) => {
    await prisma.quizPergunta.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.delete('/api/admin/quiz/respostas', ...admin, async (_req, res) => {
    const { count } = await prisma.quizResposta.deleteMany({});
    res.json({ success: true, removidas: count });
  });

  app.delete('/api/admin/quiz/respostas/:id', ...admin, async (req, res) => {
    await prisma.quizResposta.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // ===================== FOTOS =====================

  const camposFoto = {
    id: true, nome: true, url: true, miniaturaUrl: true, largura: true, altura: true, createdAt: true
  } as const;

  // ?nome= filtra por quem enviou; ?depois= (ISO) traz só as novas (telão)
  app.get('/api/fotos', async (req, res) => {
    const nome = typeof req.query.nome === 'string' && req.query.nome ? req.query.nome.slice(0, 80) : undefined;
    const depois = typeof req.query.depois === 'string' ? new Date(req.query.depois) : null;

    const [fotos, autores] = await Promise.all([
      prisma.foto.findMany({
        where: {
          oculta: false,
          ...(nome && { nome }),
          ...(depois && !Number.isNaN(depois.getTime()) && { createdAt: { gt: depois } })
        },
        select: camposFoto,
        orderBy: { createdAt: 'desc' },
        take: 500
      }),
      prisma.foto.groupBy({ by: ['nome'], where: { oculta: false }, _count: { _all: true }, orderBy: { nome: 'asc' } })
    ]);

    res.json({
      success: true,
      fotos: fotos.map(f => ({ ...f, telaUrl: telaUrl(f.url) })),
      autores: autores.map(a => ({ nome: a.nome, fotos: a._count._all })),
      armazenamentoDisponivel
    });
  });

  async function registrarFoto(dados: { nome: string; autorId: string; largura: number; altura: number }, base: string) {
    const chaves = chavesDaFoto(base);
    return prisma.foto.create({
      data: {
        ...dados,
        chave: chaves.foto,
        miniaturaChave: chaves.miniatura,
        url: urlPublica(chaves.foto),
        miniaturaUrl: urlPublica(chaves.miniatura)
      },
      select: camposFoto
    });
  }

  // 1º passo: o navegador informa os tamanhos e recebe os links assinados do R2.
  // Sem R2 responde { direto: false } e o envio vai pela rota POST /api/fotos.
  app.post('/api/fotos/envio', uploadLimiter, async (req, res) => {
    if (!armazenamentoDisponivel) {
      return res.status(503).json({ success: false, error: 'O envio de fotos ainda não foi configurado' });
    }
    const dados = validar(pedidoEnvioSchema, req.body, res);
    if (!dados) return;
    if (!envioDireto) return res.json({ success: true, direto: false });

    const base = novaBase();
    const chaves = chavesDaFoto(base);
    const [foto, tela, miniatura] = await Promise.all([
      linkDeEnvio(chaves.foto, 'image/jpeg', dados.tamanhos.foto),
      linkDeEnvio(chaves.tela, 'image/jpeg', dados.tamanhos.tela),
      linkDeEnvio(chaves.miniatura, 'image/jpeg', dados.tamanhos.miniatura)
    ]);
    res.json({ success: true, direto: true, base, links: { foto, tela, miniatura } });
  });

  // 2º passo: depois de enviar os 3 arquivos ao R2, o navegador pede para registrar a foto
  app.post('/api/fotos/confirmar', uploadLimiter, async (req, res) => {
    const dados = validar(confirmarEnvioSchema, req.body, res);
    if (!dados) return;
    const chaves = chavesDaFoto(dados.base);

    if (await prisma.foto.findFirst({ where: { chave: chaves.foto }, select: { id: true } })) {
      return res.status(409).json({ success: false, error: 'Foto já registrada' });
    }
    const tamanhos = await Promise.all([chaves.foto, chaves.tela, chaves.miniatura].map(tamanhoDoArquivo));
    if (tamanhos.some(t => t === null)) {
      return res.status(400).json({ success: false, error: 'O envio da foto não terminou. Tente de novo.' });
    }

    const { base, ...resto } = dados;
    const criada = await registrarFoto(resto, base);
    res.status(201).json({ success: true, foto: { ...criada, telaUrl: telaUrl(criada.url) } });
  });

  // Envio pelo servidor (desenvolvimento sem R2). Corpo: foto + tela + miniatura, nessa ordem;
  // X-Foto-Tela e X-Foto-Miniatura dizem o tamanho das duas últimas partes.
  app.post(ROTA_UPLOAD_FOTO, uploadLimiter, express.raw({ type: 'image/jpeg', limit: LIMITE_ENVIO_SERVIDOR }), async (req, res) => {
    if (!armazenamentoDisponivel) {
      return res.status(503).json({ success: false, error: 'O envio de fotos ainda não foi configurado' });
    }

    const meta = validar(fotoMetaSchema, {
      nome: cabecalho(req.headers['x-foto-nome']),
      autorId: cabecalho(req.headers['x-foto-autor']),
      largura: req.headers['x-foto-largura'],
      altura: req.headers['x-foto-altura'],
      tela: req.headers['x-foto-tela'],
      miniatura: req.headers['x-foto-miniatura']
    }, res);
    if (!meta) return;

    const corpo = req.body;
    const tamanhoFoto = Buffer.isBuffer(corpo) ? corpo.length - meta.tela - meta.miniatura : 0;
    if (tamanhoFoto <= 0) {
      return res.status(400).json({ success: false, error: 'Arquivo de foto inválido' });
    }

    const partes = {
      foto: corpo.subarray(0, tamanhoFoto),
      tela: corpo.subarray(tamanhoFoto, tamanhoFoto + meta.tela),
      miniatura: corpo.subarray(tamanhoFoto + meta.tela)
    };
    if (!Object.values(partes).every(ehJpeg)) {
      return res.status(400).json({ success: false, error: 'Envie só fotos (JPEG)' });
    }

    const base = novaBase();
    const chaves = chavesDaFoto(base);
    await Promise.all([
      salvarArquivo(chaves.foto, partes.foto, 'image/jpeg'),
      salvarArquivo(chaves.tela, partes.tela, 'image/jpeg'),
      salvarArquivo(chaves.miniatura, partes.miniatura, 'image/jpeg')
    ]);

    const { nome, autorId, largura, altura } = meta;
    const criada = await registrarFoto({ nome, autorId, largura, altura }, base);
    res.status(201).json({ success: true, foto: { ...criada, telaUrl: telaUrl(criada.url) } });
  });

  app.get('/api/admin/fotos', ...admin, async (_req, res) => {
    const fotos = await prisma.foto.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, fotos: fotos.map(f => ({ ...f, telaUrl: telaUrl(f.url) })) });
  });

  app.patch('/api/admin/fotos/:id', ...admin, async (req, res) => {
    const dados = validar(visibilidadeSchema, req.body, res);
    if (!dados) return;
    const foto = await prisma.foto.update({ where: { id: req.params.id }, data: dados });
    res.json({ success: true, foto });
  });

  app.delete('/api/admin/fotos/:id', ...admin, async (req, res) => {
    const foto = await prisma.foto.findUnique({ where: { id: req.params.id } });
    if (!foto) return res.status(404).json({ success: false, error: 'Foto não encontrada' });
    // Primeiro o registro (é o que aparece no site), depois os arquivos. Na ordem inversa,
    // uma falha no banco deixava na galeria uma foto cujos arquivos já tinham sido apagados.
    await prisma.foto.delete({ where: { id: foto.id } });
    const chaves = [foto.chave, telaUrl(foto.chave), foto.miniaturaChave];
    const resultados = await Promise.allSettled(chaves.map(removerArquivo));
    resultados.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Falha ao apagar ${chaves[i]} do armazenamento:`, r.reason);
    });
    res.json({ success: true });
  });
}
