// Remove os metadados de um JPEG sem recomprimir a imagem (qualidade idêntica à original).
//
// Sai: EXIF (GPS, modelo do aparelho, data), XMP, IPTC, comentários, miniatura embutida,
//      segmentos de fabricante e tudo depois do fim da imagem (ex.: mapa de ganho HDR do iPhone).
// Fica: os dados da imagem, o perfil de cor (ICC, para as cores não mudarem) e só a orientação,
//       num EXIF mínimo, para a foto não aparecer deitada.

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const APP0 = 0xe0;
const APP1 = 0xe1;
const APP2 = 0xe2;

function ehTexto(dados: Uint8Array, inicio: number, texto: string) {
  for (let i = 0; i < texto.length; i++) {
    if (dados[inicio + i] !== texto.charCodeAt(i)) return false;
  }
  return true;
}

// Lê o campo Orientation (0x0112) de um segmento APP1 "Exif"
function lerOrientacao(dados: Uint8Array, inicio: number, fim: number): number {
  const tiff = inicio + 6; // depois de "Exif\0\0"
  if (fim - tiff < 8) return 1;
  const le = dados[tiff] === 0x49; // "II" little-endian, "MM" big-endian
  const u16 = (p: number) => (le ? dados[p] | (dados[p + 1] << 8) : (dados[p] << 8) | dados[p + 1]);
  const u32 = (p: number) => (le
    ? (dados[p] | (dados[p + 1] << 8) | (dados[p + 2] << 16) | (dados[p + 3] << 24)) >>> 0
    : ((dados[p] << 24) | (dados[p + 1] << 16) | (dados[p + 2] << 8) | dados[p + 3]) >>> 0);

  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > fim) return 1;
  const entradas = u16(ifd);
  for (let i = 0; i < entradas; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > fim) break;
    if (u16(e) === 0x0112) {
      const valor = u16(e + 8);
      return valor >= 1 && valor <= 8 ? valor : 1;
    }
  }
  return 1;
}

// APP1 com um EXIF mínimo contendo só a orientação (big-endian)
function exifSoOrientacao(orientacao: number) {
  return new Uint8Array([
    0xff, APP1, 0x00, 0x22,                         // marcador e tamanho (34 bytes)
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,             // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // cabeçalho TIFF "MM", IFD0 no offset 8
    0x00, 0x01,                                     // 1 entrada
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, // Orientation, SHORT, 1 valor
    0x00, orientacao, 0x00, 0x00,                   // valor
    0x00, 0x00, 0x00, 0x00,                         // sem próximo IFD
  ]);
}

// Devolve o JPEG limpo, ou null se o arquivo não for um JPEG que dê para ler com segurança
export function limparJpeg(original: ArrayBuffer): Uint8Array | null {
  const d = new Uint8Array(original);
  if (d.length < 4 || d[0] !== 0xff || d[1] !== SOI) return null;

  const partes: Uint8Array[] = [d.subarray(0, 2)];
  let orientacao = 1;
  let posExif = 1; // onde inserir o EXIF mínimo (depois do APP0, se houver)
  let p = 2;

  while (p < d.length) {
    if (d[p] !== 0xff) return null;
    let marcador = d[p + 1];
    while (marcador === 0xff) { p++; marcador = d[p + 1]; } // bytes de preenchimento

    if (marcador === EOI) {
      partes.push(d.subarray(p, p + 2));
      break; // ignora tudo o que vem depois (mapa de ganho, dados extras)
    }
    if (marcador >= 0xd0 && marcador <= 0xd7) { // RST sem tamanho
      partes.push(d.subarray(p, p + 2));
      p += 2;
      continue;
    }

    const tamanho = (d[p + 2] << 8) | d[p + 3];
    const fim = p + 2 + tamanho;
    if (tamanho < 2 || fim > d.length) return null;
    const segmento = d.subarray(p, fim);

    if (marcador === SOS) {
      // Depois do cabeçalho vêm os dados comprimidos, até o próximo marcador real
      let q = fim;
      while (q < d.length - 1 && !(d[q] === 0xff && d[q + 1] !== 0x00 && !(d[q + 1] >= 0xd0 && d[q + 1] <= 0xd7))) q++;
      partes.push(d.subarray(p, q));
      p = q;
      continue;
    }

    if (marcador === APP1 && ehTexto(d, p + 4, 'Exif\0')) {
      orientacao = lerOrientacao(d, p + 4, fim);
    } else if (marcador === APP0 && ehTexto(d, p + 4, 'JFIF\0')) {
      partes.push(segmento);
      posExif = partes.length;
    } else if (marcador === APP2 && ehTexto(d, p + 4, 'ICC_PROFILE\0')) {
      partes.push(segmento); // perfil de cor
    } else if ((marcador >= APP0 && marcador <= 0xef) || marcador === 0xfe) {
      // demais APPn (XMP, IPTC, MPF, fabricante) e comentários: descarta
    } else {
      partes.push(segmento); // tabelas, cabeçalho do quadro etc.
    }
    p = fim;
  }

  if (orientacao !== 1) partes.splice(posExif, 0, exifSoOrientacao(orientacao));

  const total = partes.reduce((s, x) => s + x.length, 0);
  const saida = new Uint8Array(total);
  let o = 0;
  for (const parte of partes) { saida.set(parte, o); o += parte.length; }
  return saida;
}
