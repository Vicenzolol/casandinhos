// Gera o convite de calendário (.ics) e o link do Google Agenda, sem serviço externo.

interface Evento {
  titulo: string;
  descricao: string;
  local: string;
  inicio: Date;
  fim: Date;
}

// 2027-04-24T18:00:00.000Z -> 20270424T180000Z
function formatoUtc(data: Date) {
  return data.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escaparIcs(texto: string) {
  return texto.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

export function baixarIcs(evento: Evento, nomeArquivo = 'casamento.ics') {
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Casandinhos//Site do casamento//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:casamento-${formatoUtc(evento.inicio)}@casandinhos.vercel.app`,
    `DTSTAMP:${formatoUtc(new Date())}`,
    `DTSTART:${formatoUtc(evento.inicio)}`,
    `DTEND:${formatoUtc(evento.fim)}`,
    `SUMMARY:${escaparIcs(evento.titulo)}`,
    `DESCRIPTION:${escaparIcs(evento.descricao)}`,
    `LOCATION:${escaparIcs(evento.local)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escaparIcs(evento.titulo)} é amanhã`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([linhas.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function linkGoogleAgenda(evento: Evento) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${formatoUtc(evento.inicio)}/${formatoUtc(evento.fim)}`,
    details: evento.descricao,
    location: evento.local,
    ctz: 'America/Sao_Paulo',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
