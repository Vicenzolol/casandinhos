// Onde as fotos ficam guardadas.
// - Produção: Cloudflare R2 (variáveis R2_*). O banco guarda só o link.
//   O navegador envia direto para o R2 por um link assinado (a Vercel limita o corpo a ~4,5MB).
// - Desenvolvimento sem R2: pasta local "uploads/", servida em /uploads.
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const {
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL,
} = process.env;

const r2Configurado = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_URL);

export const PASTA_LOCAL = path.join(process.cwd(), 'uploads');

// Na Vercel o disco é somente leitura: sem R2 não há onde guardar
export const armazenamentoDisponivel = r2Configurado || !process.env.VERCEL;

// Com R2 o navegador envia direto para o bucket; sem R2 o envio passa pelo servidor
export const envioDireto = r2Configurado;

export const origemPublicaFotos = r2Configurado ? new URL(R2_PUBLIC_URL!).origin : null;

const s3 = r2Configurado
  ? new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
  })
  : null;

export function urlPublica(chave: string) {
  return s3 ? `${R2_PUBLIC_URL!.replace(/\/$/, '')}/${chave}` : `/uploads/${chave}`;
}

export async function salvarArquivo(chave: string, conteudo: Buffer, tipo: string): Promise<string> {
  if (s3) {
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: chave,
      Body: conteudo,
      ContentType: tipo,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    return urlPublica(chave);
  }

  if (!armazenamentoDisponivel) throw new Error('Armazenamento de fotos não configurado (R2_*)');
  const destino = path.join(PASTA_LOCAL, chave);
  await fs.promises.mkdir(path.dirname(destino), { recursive: true });
  await fs.promises.writeFile(destino, conteudo);
  return urlPublica(chave);
}

// Link temporário para o navegador enviar o arquivo direto ao R2.
// O tamanho entra na assinatura: o R2 recusa um arquivo diferente do combinado.
export async function linkDeEnvio(chave: string, tipo: string, tamanho: number) {
  if (!s3) throw new Error('Envio direto exige o R2 configurado');
  return getSignedUrl(s3, new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: chave,
    ContentType: tipo,
    ContentLength: tamanho,
  }), { expiresIn: 15 * 60 });
}

// Tamanho do arquivo já guardado (null se não existir)
export async function tamanhoDoArquivo(chave: string): Promise<number | null> {
  if (s3) {
    try {
      const r = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: chave }));
      return r.ContentLength ?? null;
    } catch {
      return null;
    }
  }
  try {
    return (await fs.promises.stat(path.join(PASTA_LOCAL, chave))).size;
  } catch {
    return null;
  }
}

export async function removerArquivo(chave: string) {
  if (s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: chave }));
    return;
  }
  await fs.promises.rm(path.join(PASTA_LOCAL, chave), { force: true });
}
