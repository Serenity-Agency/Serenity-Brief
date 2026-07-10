#!/usr/bin/env python3
"""
Генератор OG-превью (1200x630) для клиентских материалов Serenity.
Фирменная палитра, тот же визуальный язык, что и в materials/assets/v1/theme.css.

Использование (запускать из корня репозитория, --out всегда внутри materials/):
    python3 materials-tools/generate-og.py --client "ACME Corp" --subtitle "Возможности роста проекта" --out materials/acme-corp/x7k2p9/og.jpg

Требует Pillow: pip3 install --user Pillow
Шрифты берутся из системных (macOS: /System/Library/Fonts/Supplemental/Arial*.ttf).
Если запускаете не на macOS — поправьте FONT_DIR и имена файлов ниже.
"""
import argparse
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
BG = (13, 13, 13)
WHITE = (255, 255, 255)
GRAY = (166, 166, 166)
PURPLE = (123, 47, 190)
GREEN = (46, 125, 82)
ORANGE = (212, 96, 26)
GOLD = (212, 160, 23)

FONT_DIR = "/System/Library/Fonts/Supplemental/"


def add_blob(canvas_rgb, cx, cy, r, color, opacity):
    layer_mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(layer_mask)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    layer_mask = layer_mask.filter(ImageFilter.GaussianBlur(70))
    solid = Image.new("RGB", (W, H), color)
    canvas_rgb.paste(solid, (0, 0), layer_mask.point(lambda p: int(p * opacity)))


def build(client: str, subtitle: str, out_path: str):
    img = Image.new("RGB", (W, H), BG)
    add_blob(img, 980, 40, 260, PURPLE, 0.55)
    add_blob(img, 120, 620, 220, GREEN, 0.45)

    draw = ImageDraw.Draw(img)
    f_logo = ImageFont.truetype(FONT_DIR + "Arial Bold.ttf", 30)
    f_title = ImageFont.truetype(FONT_DIR + "Arial Black.ttf", 88 if len(client) < 16 else 64)
    f_sub = ImageFont.truetype(FONT_DIR + "Arial.ttf", 30)
    f_eyebrow = ImageFont.truetype(FONT_DIR + "Arial Bold.ttf", 20)

    draw.text((72, 56), "serenity", font=f_logo, fill=WHITE)

    eyebrow_text = f"SERENITY  ×  {client.upper()}"
    bbox = draw.textbbox((0, 0), eyebrow_text, font=f_eyebrow)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pill_pad_x, pill_pad_y = 22, 14
    pill_x0, pill_y0 = 72, 190
    pill_x1, pill_y1 = pill_x0 + tw + pill_pad_x * 2, pill_y0 + th + pill_pad_y * 2
    draw.rounded_rectangle([pill_x0, pill_y0, pill_x1, pill_y1], radius=(pill_y1 - pill_y0) // 2,
                            outline=(178, 140, 220), width=2, fill=(30, 20, 40))
    draw.text((pill_x0 + pill_pad_x, pill_y0 + pill_pad_y - 2), eyebrow_text, font=f_eyebrow, fill=(199, 154, 240))

    draw.text((70, 250), client, font=f_title, fill=WHITE)
    draw.text((74, 400), f"{subtitle} · Serenity", font=f_sub, fill=GRAY)

    grad_h = 8
    grad = Image.new("RGB", (W, grad_h))
    stops = [PURPLE, GREEN, ORANGE, GOLD]
    seg = W / (len(stops) - 1)
    for x in range(W):
        pos = x / seg
        i = min(int(pos), len(stops) - 2)
        t = pos - i
        c0, c1 = stops[i], stops[i + 1]
        r = int(c0[0] + (c1[0] - c0[0]) * t)
        g = int(c0[1] + (c1[1] - c0[1]) * t)
        b = int(c0[2] + (c1[2] - c0[2]) * t)
        for y in range(grad_h):
            grad.putpixel((x, y), (r, g, b))
    img.paste(grad, (0, H - grad_h))

    img.save(out_path, quality=92)
    print("Saved:", out_path)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--client", required=True, help="Название клиента, например 'ACME Corp'")
    p.add_argument("--subtitle", default="Возможности роста проекта", help="Подзаголовок под названием")
    p.add_argument("--out", required=True, help="Путь для сохранения внутри materials/, например materials/acme-corp/x7k2p9/og.jpg")
    args = p.parse_args()
    build(args.client, args.subtitle, args.out)
