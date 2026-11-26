// Tempo de resposta do quiz: "42s" ou "1min 05s"
export function formatarTempo(ms: number) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}min ${String(s % 60).padStart(2, '0')}s`;
}
