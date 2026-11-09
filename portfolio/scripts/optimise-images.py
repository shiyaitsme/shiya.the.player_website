"""Builds the portfolio's derived images (needs Pillow).

  python3 scripts/optimise-images.py

* BLING phone captures (.cache/bling/*.png from capture-bling.mjs) -> public/portfolio/img/bling/*.jpg (752px wide, q82)
* 640px thumbnails of existing works for the "other works" index -> public/portfolio/img/thumbs/*.jpg
Full-size artwork is NOT copied: pages reference public/assets/works/* directly.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "portfolio/.cache/bling"
OUT = ROOT / "public/portfolio/img"
WORKS = ROOT / "public/assets/works"

BLING = ["home", "community", "discover", "shop", "music", "muse-intro", "muse-answer",
         "print-1-program", "print-2-mood", "print-3-pattern", "print-4-product", "print-5-preview", "arc-1"]
THUMBS = ["works_1992_manga_shards", "works_p06_the-vanishing-tree", "works_p07_vocalize", "works_p08_star-girl",
          "works_p09_see-you-in-spring", "works_p10_fake-touch", "works_p01_heart-of-empire",
          "works_p02_between-two-infinites", "works_p05_blue-lava", "works_p03_limited-night",
          "works_psyche-and-cupid", "works_black-sand-rite", "works_Akarsz-e-játszani", "works_fragile",
          "works_loves-taste", "works_exclusive-summer", "works_roses-of-transcendent-love",
          "works_black-funeral", "works_coral-dream"]

(OUT / "bling").mkdir(parents=True, exist_ok=True)
(OUT / "thumbs").mkdir(parents=True, exist_ok=True)

for n in BLING:
    im = Image.open(CACHE / f"{n}.png").convert("RGB")
    im.save(OUT / "bling" / f"{n}.jpg", quality=82, optimize=True, progressive=True)

for n in THUMBS:
    im = Image.open(WORKS / f"{n}.jpg").convert("RGB")
    im.thumbnail((640, 640), Image.LANCZOS)
    im.save(OUT / "thumbs" / f"{n}.jpg", quality=82, optimize=True, progressive=True)
print("ok")
