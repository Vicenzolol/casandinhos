import { useEffect, useRef } from 'react';

// Pétalas caindo sobre a capa do convite, desenhadas num <canvas>.
// Respeita "reduzir movimento" do sistema e pausa quando a aba fica oculta.

const CORES = [
  ['#FFFDF3', '#F7EDC4'], // creme (rosas)
  ['#FFF8E7', '#F3DDB8'], // pêssego claro
  ['#E6EFF6', '#BBD3E6'], // azul delicado (hortênsias)
  ['#D7E6F1', '#9FC3DD'],
];

interface Petala {
  x: number; y: number; tamanho: number;
  vy: number; fase: number; amplitude: number;
  giro: number; vGiro: number; virada: number; vVirada: number;
  cor: string[];
}

function novaPetala(largura: number, altura: number, inicio: boolean): Petala {
  return {
    x: Math.random() * largura,
    y: inicio ? Math.random() * altura : -20 - Math.random() * altura * 0.3,
    tamanho: 7 + Math.random() * 9,
    vy: 0.35 + Math.random() * 0.6,
    fase: Math.random() * Math.PI * 2,
    amplitude: 0.4 + Math.random() * 0.9,
    giro: Math.random() * Math.PI * 2,
    vGiro: (Math.random() - 0.5) * 0.03,
    virada: Math.random() * Math.PI * 2,
    vVirada: 0.01 + Math.random() * 0.03,
    cor: CORES[Math.floor(Math.random() * CORES.length)],
  };
}

function desenhar(ctx: CanvasRenderingContext2D, p: Petala) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.giro);
  // "virar" no ar: achata a pétala num eixo
  ctx.scale(1, 0.35 + Math.abs(Math.cos(p.virada)) * 0.65);

  const t = p.tamanho;
  const grad = ctx.createLinearGradient(0, -t, 0, t);
  grad.addColorStop(0, p.cor[0]);
  grad.addColorStop(1, p.cor[1]);
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.92;

  // formato de pétala: ponta fina embaixo, arredondada em cima
  ctx.beginPath();
  ctx.moveTo(0, t);
  ctx.bezierCurveTo(t * 0.95, t * 0.35, t * 0.75, -t * 0.9, 0, -t * 0.75);
  ctx.bezierCurveTo(-t * 0.75, -t * 0.9, -t * 0.95, t * 0.35, 0, t);
  ctx.fill();

  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = p.cor[1];
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, t * 0.85);
  ctx.quadraticCurveTo(t * 0.1, 0, 0, -t * 0.55);
  ctx.stroke();
  ctx.restore();
}

export function Petalas({ quantidade = 28 }: { quantidade?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let largura = 0;
    let altura = 0;
    let petalas: Petala[] = [];
    let quadro = 0;

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = largura * dpr;
      canvas.height = altura * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // menos pétalas em telas pequenas
      const total = Math.round(quantidade * Math.min(1, Math.max(0.5, largura / 1100)));
      if (petalas.length === 0) {
        petalas = Array.from({ length: total }, () => novaPetala(largura, altura, true));
      } else {
        petalas.length = Math.min(petalas.length, total);
        while (petalas.length < total) petalas.push(novaPetala(largura, altura, false));
      }
    };

    const passo = () => {
      ctx.clearRect(0, 0, largura, altura);
      for (let i = 0; i < petalas.length; i++) {
        const p = petalas[i];
        p.fase += 0.012;
        p.y += p.vy;
        p.x += Math.sin(p.fase) * p.amplitude + 0.15; // leve brisa para a direita
        p.giro += p.vGiro;
        p.virada += p.vVirada;
        if (p.y > altura + 20 || p.x > largura + 30) petalas[i] = novaPetala(largura, altura, false);
        desenhar(ctx, p);
      }
      quadro = requestAnimationFrame(passo);
    };

    const visibilidade = () => {
      cancelAnimationFrame(quadro);
      if (!document.hidden) quadro = requestAnimationFrame(passo);
    };

    redimensionar();
    quadro = requestAnimationFrame(passo);
    window.addEventListener('resize', redimensionar);
    document.addEventListener('visibilitychange', visibilidade);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('resize', redimensionar);
      document.removeEventListener('visibilitychange', visibilidade);
    };
  }, [quantidade]);

  return <canvas ref={ref} className="petalas" aria-hidden="true" />;
}
