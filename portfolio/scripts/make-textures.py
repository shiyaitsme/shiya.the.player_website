"""Generates the page ground textures (photocopy black, dusty blue paper, bone paper).
   python3 scripts/make-textures.py   (needs numpy + Pillow) -> public/portfolio/img/tex-*.jpg
Seeds are fixed so the output is reproducible."""
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parents[2] / "public/portfolio/img"
W, H = 1800, 1012


def blur(a, r):
    im = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype="float32")


def clouds(rng, scale, amp):
    small = rng.random((H // scale + 2, W // scale + 2)).astype("float32") * 255
    big = Image.fromarray(small.astype("uint8")).resize((W, H), Image.BICUBIC)
    return (np.asarray(big, dtype="float32") - 128) / 128 * amp


def specks(rng, n, rmax, base):
    layer = np.zeros((H, W), "float32")
    ys, xs = rng.integers(0, H, n), rng.integers(0, W, n)
    for y, x in zip(ys, xs):
        r = int(rng.choice([1, 1, 1, 2, 2, 3, rmax]))
        layer[max(0, y - r):y + r, max(0, x - r):x + r] = rng.uniform(0.4, 1.0) * base
    return blur(layer, 0.8)


def crease(a, rng, x=None, y=None, light=60, dark=40):
    if x is not None:
        jitter = np.cumsum(rng.normal(0, 0.25, H))
        for row in range(H):
            c = int(x + jitter[row])
            a[row, max(0, c - 5):c - 1] -= dark * 0.5
            a[row, c - 1:c + 2] += light
            a[row, c + 2:c + 6] -= dark * 0.35
    if y is not None:
        jitter = np.cumsum(rng.normal(0, 0.25, W))
        for col in range(W):
            c = int(y + jitter[col])
            a[max(0, c - 5):c - 1, col] -= dark * 0.5
            a[c - 1:c + 2, col] += light
            a[c + 2:c + 6, col] -= dark * 0.35
    return a


def save(rgb, name, q=80):
    Image.fromarray(np.clip(rgb, 0, 255).astype("uint8")).save(OUT / name, quality=q, optimize=True, progressive=True)


def paper(seed, base, grain, mottle, creases):
    rng = np.random.default_rng(seed)
    lum = np.zeros((H, W), "float32") + clouds(rng, 220, mottle) + clouds(rng, 60, mottle * 0.5)
    lum += rng.normal(0, grain, (H, W)).astype("float32")
    lum += blur(rng.normal(0, 18, (H, W)).astype("float32"), 1.2) * 0.8
    lum -= specks(rng, 2600, 4, 70)
    for kw in creases:
        lum = crease(lum, rng, **kw)
    vig = np.linspace(-1, 1, W)[None, :] ** 2 + np.linspace(-1, 1, H)[:, None] ** 2
    lum -= vig * 10
    return np.stack([lum * 1.0 + base[0], lum * 1.0 + base[1], lum * 1.05 + base[2]], -1)


# dusty blue-grey paper with folded creases
save(paper(3, (166, 184, 199), 8, 14, [dict(x=int(W * 0.76)), dict(y=int(H * 0.5))]), "tex-blue.jpg")
# warm bone paper
save(paper(5, (231, 226, 214), 6, 9, [dict(x=int(W * 0.31), light=30, dark=26)]), "tex-bone.jpg")

# black photocopy: crushed black, white dust, scratches
rng = np.random.default_rng(9)
lum = np.zeros((H, W), "float32") + 14 + clouds(rng, 140, 7) + rng.normal(0, 9, (H, W)).astype("float32")
lum += specks(rng, 5200, 4, 235) * 0.55
big = specks(rng, 140, 9, 255)
lum += blur(big, 2.2) * 0.35
for _ in range(14):
    x0, y0 = rng.integers(0, W), rng.integers(0, H)
    ang, ln = rng.uniform(0, np.pi), rng.integers(60, 320)
    for t in range(ln):
        x, y = int(x0 + np.cos(ang) * t), int(y0 + np.sin(ang) * t)
        if 0 <= x < W and 0 <= y < H:
            lum[y, x] += 90
lum = blur(lum, 0.5)
vig = np.linspace(-1, 1, W)[None, :] ** 2 + np.linspace(-1, 1, H)[:, None] ** 2
lum -= vig * 6
save(np.stack([lum, lum, lum * 1.02], -1), "tex-black.jpg", 78)
print("ok")
