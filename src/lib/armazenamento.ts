// Onde as fotos ficam guardadas.
// - Produção: Cloudflare R2 (variáveis R2_*). O banco guarda só o link.
// - Desenvolvimento sem R2: pasta local "uploads/", servida em /uploads.
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const {
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL,
} = process.env;

const r2Configurado = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_URL);

export const PASTA_LOCAL = path.join(process.cwd(), 'uploads');

// Na Vercel o disco é somente leitura: sem R2 não há onde guardar
export const armazenamentoDisponivel = r2Configurado || !process.env.VERCEL;

export const origemPublicaFotos = r2Configurado ? new URL(R2_PUBLIC_URL!).origin : null;

const s3 = r2Configurado
  ? new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
  })
  : null;

export async function salvarArquivo(chave: string, conteudo: Buffer, tipo: string): Promise<string> {
  if (s3) {
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: chave,
      Body: conteudo,
      ContentType: tipo,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    return `${R2_PUBLIC_URL!.replace(/\/$/, '')}/${chave}`;
  }

  if (!armazenamentoDisponivel) throw new Error('Armazenamento de fotos não configurado (R2_*)');
  const destino = path.join(PASTA_LOCAL, chave);
  await fs.promises.mkdir(path.dirname(destino), { recursive: true });
  await fs.promises.writeFile(destino, conteudo);
  return `/uploads/${chave}`;
}

export async function removerArquivo(chave: string) {
  if (s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: chave }));
    return;
  }
  await fs.promises.rm(path.join(PASTA_LOCAL, chave), { force: true });
}
