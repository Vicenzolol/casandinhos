// Compressão no navegador antes do envio: a foto sai com o lado maior em 2560px (JPEG)
// e uma miniatura de ~480px para a galeria. Assim cabe no limite de ~4,5MB da Vercel.
const LADO_FOTO = 2560;
const LADO_MINIATURA = 480;
const LIMITE_BYTES = 3.6 * 1024 * 1024;

export interface FotoComprimida {
  foto: Blob;
  miniatura: Blob;
  largura: number;
  altura: number;
}

async function carregar(arquivo: File): Promise<CanvasImageSource & { width: number; height: number }> {
  // createImageBitmap respeita a rotação EXIF das fotos do celular
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

function redimensionar(img: CanvasImageSource & { width: number; height: number }, lado: number) {
  const escala = Math.min(1, lado / Math.max(img.width, img.height));
  const largura = Math.round(img.width * escala);
  const altura = Math.round(img.height * escala);
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não conseguiu processar a foto');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, largura, altura);
  return canvas;
}

function paraJpeg(canvas: HTMLCanvasElement, qualidade: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Falha ao comprimir a foto'))), 'image/jpeg', qualidade);
  });
}

export async function comprimirFoto(arquivo: File): Promise<FotoComprimida> {
  if (!arquivo.type.startsWith('image/')) throw new Error('Envie só fotos');

  const img = await carregar(arquivo);
  try {
    const canvas = redimensionar(img, LADO_FOTO);
    let foto = await paraJpeg(canvas, 0.86);
    for (const qualidade of [0.76, 0.66, 0.56]) {
      if (foto.size <= LIMITE_BYTES) break;
      foto = await paraJpeg(canvas, qualidade);
    }
    if (foto.size > LIMITE_BYTES) throw new Error('Foto grande demais');

    const miniatura = await paraJpeg(redimensionar(img, LADO_MINIATURA), 0.78);
    return { foto, miniatura, largura: canvas.width, altura: canvas.height };
  } finally {
    if ('close' in img && typeof img.close === 'function') img.close();
  }
}
