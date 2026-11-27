"""Uso: python scripts/gerar-vinha.py public/assets/brand/guirlanda.jpg saida.png  (depois converter para .webp)
Gera uma vinha vertical (PNG transparente, repetível na vertical) a partir dos raminhos da guirlanda."""
import math, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
ESC = 2                      # 2x para telas retina
W, H = 200 * ESC, 1000 * ESC  # tamanho do bloco que se repete (CSS: 200 x 1000)
BG = np.array([254, 249, 211], dtype=float)

im = np.asarray(Image.open(SRC).convert('RGB')).astype(float)

def recorte(box, fade_topo=0.35):
    x0, y0, x1, y1 = box
    a = im[y0:y1, x0:x1]
    dist = np.sqrt(((a - BG) ** 2).sum(-1))
    alpha = np.clip((dist - 10) / 45, 0, 1)
    lum = a @ np.array([0.299, 0.587, 0.114])
    alpha *= np.clip((208 - lum) / 24, 0, 1)   # tira pedaços claros (rosas brancas)
    # esmaece a borda de cima (onde o raminho saía das flores) e as laterais
    h, w = alpha.shape
    ys = np.linspace(0, 1, h)[:, None]
    alpha *= np.clip(ys / fade_topo, 0, 1)
    xs = np.linspace(0, 1, w)[None, :]
    alpha *= np.clip(np.minimum(xs, 1 - xs) / 0.08, 0, 1)
    rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, 'RGBA')
    return img.resize((w * ESC, h * ESC), Image.LANCZOS)

# (caixa na guirlanda 1600x500)
RAMOS = [
    (88, 340, 160, 448),     # A: raminho comprido à esquerda
    (605, 262, 695, 345),    # B
    (893, 268, 975, 350),    # C
    (1200, 285, 1295, 368),  # D: com florzinhas azuis
    (1455, 400, 1545, 500),  # E: com florzinhas azuis
    (392, 275, 445, 335),    # F: eucalipto pequeno
    (150, 360, 200, 425),    # G: florzinhas azuis
]
ramos = [recorte(b) for b in RAMOS]

random.seed(7)
tela = Image.new('RGBA', (W, H), (0, 0, 0, 0))

# caule: senoide periódica em H (emenda perfeita no topo/base)
cx, amp = W * 0.42, W * 0.12
def caule_x(y):
    return cx + amp * math.sin(2 * math.pi * y / H * 2) + amp * 0.35 * math.sin(2 * math.pi * y / H * 3 + 1)

d = ImageDraw.Draw(tela)
pts = [(caule_x(y), y) for y in range(-10, H + 11, 4)]
for i in range(len(pts) - 1):
    larg = int(ESC * (2.2 + 0.8 * math.sin(i / 9)))
    d.line([pts[i], pts[i + 1]], fill=(108, 128, 96, 210), width=larg)
tela = tela.filter(ImageFilter.GaussianBlur(ESC * 0.6))

def colar(r, x, y, ang):
    rr = r.rotate(ang, resample=Image.BICUBIC, expand=True)
    # ponto de fixação = topo-centro do raminho, aproximado pelo centro do topo da imagem girada
    px = int(x - rr.width / 2 + math.sin(math.radians(ang)) * r.height * 0.42)
    py = int(y - rr.height / 2 + math.cos(math.radians(ang)) * r.height * 0.42)
    for dy in (-H, 0, H):    # repete além das bordas para emendar
        tela.alpha_composite(rr, (px, py + dy)) if 0 <= px and px + rr.width <= W else tela.paste(rr, (px, py + dy), rr)

n = 13
for k in range(n):
    y = (k + 0.5) * H / n + random.uniform(-20, 20) * ESC
    x = caule_x(y)
    lado = 1 if k % 2 else -1
    r = ramos[k % len(ramos)]
    if lado > 0:
        r = r.transpose(Image.FLIP_LEFT_RIGHT)
    ang = lado * random.uniform(35, 60)   # inclinado para fora e para baixo
    colar(r, x, y, ang)

# leve transparência geral para não brigar com o texto
arr = np.asarray(tela).copy()
arr[..., 3] = (arr[..., 3] * 0.92).astype(np.uint8)
Image.fromarray(arr, 'RGBA').save(OUT, optimize=True)
print(OUT, Image.open(OUT).size)
