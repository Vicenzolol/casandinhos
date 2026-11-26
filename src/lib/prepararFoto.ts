// Prepara a foto no navegador antes do envio, sem perder qualidade:
// - JPEG (fotos de celular): o próprio arquivo, só sem metadados (limparJpeg), sem recomprimir.
// - Outros formatos (HEIC, PNG, WebP): convertidos para JPEG na resolução original (qualidade 0,92).
// Além do original, gera uma versão de tela (2048px, para galeria e telão) e uma miniatura (~480px).
import { limparJpeg } from './limparJpeg';

const LADO_TELA = 2048;
const LADO_MINIATURA = 480;
// O Safari do iPhone não desenha canvas acima de ~16,7 milhões de pixels
const AREA_MAXIMA_CANVAS = 16_000_000;

export interface FotoPreparada {
  foto: Blob;
  tela: Blob;
  miniatura: Blob;
  largura: number;
  altura: number;
}

type Imagem = CanvasImageSource & { width: number; height: number };

async function carregar(arquivo: File): Promise<Imagem> {
  // createImageBitmap aplica a rotação EXIF: largura/altura saem como a foto aparece
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
    } catch {
      // formato não suportado pelo createImageBitmap: tenta pelo <img>
    }
  }
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function desenhar(img: Imagem, escala: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * escala));
  canvas.height = Math.max(1, Math.round(img.height * escala));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não conseguiu processar a foto');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const escalaPara = (img: Imagem, lado: number) => Math.min(1, lado / Math.max(img.width, img.height));

function paraJpeg(canvas: HTMLCanvasElement, qualidade: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Falha ao processar a foto'))), 'image/jpeg', qualidade);
  });
}

export async function prepararFoto(arquivo: File): Promise<FotoPreparada> {
  if (!arquivo.type.startsWith('image/') && !/\.(heic|heif)$/i.test(arquivo.name)) {
    throw new Error('Envie só fotos');
  }

  const img = await carregar(arquivo);
  try {
    let foto: Blob | null = null;
    if (arquivo.type === 'image/jpeg' || /\.jpe?g$/i.test(arquivo.name)) {
      const limpo = limparJpeg(await arquivo.arrayBuffer());
      if (limpo) foto = new Blob([limpo as BlobPart], { type: 'image/jpeg' });
    }
    if (!foto) {
      // Não é JPEG (ou não deu para ler): converte na maior resolução que o navegador aguenta
      const escala = Math.min(1, Math.sqrt(AREA_MAXIMA_CANVAS / (img.width * img.height)));
      foto = await paraJpeg(desenhar(img, escala), 0.92);
    }

    const tela = await paraJpeg(desenhar(img, escalaPara(img, LADO_TELA)), 0.85);
    const miniatura = await paraJpeg(desenhar(img, escalaPara(img, LADO_MINIATURA)), 0.78);
    return { foto, tela, miniatura, largura: img.width, altura: img.height };
  } finally {
    if ('close' in img && typeof img.close === 'function') img.close();
  }
}
