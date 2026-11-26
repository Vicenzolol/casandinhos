// Pix "copia e cola" (BR Code estático, padrão EMV do Banco Central).
// Gerado no navegador, sem banco intermediário e sem taxa.

// Dados extraídos do código Pix dos noivos. O nome e a cidade seguem exatamente o
// código original do banco (até 25 e 15 caracteres, sem acentos).
export const recebedorPix = {
  chave: 'vicenzo.ap@gmail.com',
  nome: 'VICENZO_DE_ALMEIDA_PRUCOL',
  cidade: 'Muqui',
  cep: '29480-000',
};

function campo(id: string, valor: string) {
  return id + String(valor.length).padStart(2, '0') + valor;
}

// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no campo 63
export function crc16(texto: string) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

interface OpcoesPix {
  valorCentavos?: number;
  // Identificador da cobrança: até 25 letras/números. Ajuda a achar o pagamento no extrato.
  txid?: string;
  descricao?: string;
}

export function gerarPix({ valorCentavos, txid, descricao }: OpcoesPix = {}) {
  const contaPix = campo('00', 'br.gov.bcb.pix')
    + campo('01', recebedorPix.chave)
    + (descricao ? campo('02', semAcento(descricao).slice(0, 40)) : '');

  const id = (txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  const semCrc = campo('00', '01')
    + campo('26', contaPix)
    + campo('52', '0000')
    + campo('53', '986')
    + (valorCentavos ? campo('54', (valorCentavos / 100).toFixed(2)) : '')
    + campo('58', 'BR')
    + campo('59', semAcento(recebedorPix.nome).slice(0, 25))
    + campo('60', semAcento(recebedorPix.cidade).slice(0, 15))
    + campo('61', recebedorPix.cep)
    + campo('62', campo('05', id))
    + '6304';

  return semCrc + crc16(semCrc);
}

export function formatarReais(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
