#!/usr/bin/env python3
"""Dựng ảnh phụ cho trang sản phẩm từ thông tin sản phẩm – đúng phong cách web.

Hai mẫu:
  diem-noi-bat : chip thương hiệu + tiêu đề + ảnh sản phẩm + 4 ô điểm nổi bật
  thong-tin    : chip + tiêu đề + ảnh tròn + bảng thông số + ô ghi chú

Dùng:  python3 tools/anh-thong-tin.py <file-mo-ta.json>
Mỗi mục trong JSON: {mau, ra, chip, tieuDe, anh, y[], bang[], ghiChu, nen}
Font Be Vietnam Pro tải sẵn, đường dẫn truyền qua biến môi trường FONT_DIR.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT = os.environ.get('FONT_DIR', 'tools/font')
W = 800
def f(ten, co): return ImageFont.truetype(f'{FONT}/BeVietnamPro-{ten}.ttf', co)

def hoa(hex_): return tuple(int(hex_[i:i + 2], 16) for i in (1, 3, 5))

EMOJI = '/System/Library/Fonts/Apple Color Emoji.ttc'
def ve_icon(im, tam, ico, mau):
    """Emoji vẽ ở cỡ 96 (cỡ duy nhất macOS cho phép) rồi thu nhỏ; chữ/số thì vẽ thường."""
    if ico and max(ico) > '\u2100':
        try:
            lop = Image.new('RGBA', (120, 120), (0, 0, 0, 0))
            ImageDraw.Draw(lop).text((6, 4), ico, font=ImageFont.truetype(EMOJI, 96), embedded_color=True)
            lop = lop.crop(lop.getbbox()).resize((26, 26), Image.LANCZOS)
            im.paste(lop, (tam[0] - 13, tam[1] - 13), lop); return
        except Exception: pass
    d = ImageDraw.Draw(im); phong = f('Bold', 21)
    d.text((tam[0] - d.textlength(ico, font=phong) / 2, tam[1] - 15), ico, font=phong, fill=mau)

def nen_dốc(c1, c2):
    g = Image.new('RGB', (1, W))
    d = ImageDraw.Draw(g)
    a, b = hoa(c1), hoa(c2)
    for y in range(W):
        t = y / (W - 1)
        d.point((0, y), tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)))
    return g.resize((W, W))

def xuong_dong(d, chu, phong, rong):
    ra, dong = [], ''
    for tu in chu.split():
        thu = (dong + ' ' + tu).strip()
        if d.textlength(thu, font=phong) <= rong: dong = thu
        else: ra.append(dong); dong = tu
    if dong: ra.append(dong)
    return ra

def ve_chu(d, xy, chu, phong, mau, rong=None, cao_dong=1.32):
    x, y = xy
    for dong in (xuong_dong(d, chu, phong, rong) if rong else [chu]):
        d.text((x, y), dong, font=phong, fill=mau)
        y += int(phong.size * cao_dong)
    return y

def anh_bo_goc(duong, w, h, r, hop=None):
    """Khung ảnh ngang: ảnh gốc vừa trọn trong khung (không cắt mất sản phẩm),
       phía sau là chính ảnh đó phóng to và làm mờ cho kín khung."""
    im = Image.open(duong).convert('RGB')
    if hop:
        im = im.crop((int(hop[0] * im.width), int(hop[1] * im.height), int(hop[2] * im.width), int(hop[3] * im.height)))
    ty = max(w / im.width, h / im.height)
    nen = im.resize((int(im.width * ty) + 1, int(im.height * ty) + 1), Image.LANCZOS)
    nen = nen.crop(((nen.width - w) // 2, (nen.height - h) // 2, (nen.width - w) // 2 + w, (nen.height - h) // 2 + h))
    nen = nen.filter(ImageFilter.GaussianBlur(16))
    nen = Image.blend(nen, Image.new('RGB', (w, h), (255, 255, 255)), .35)
    ty2 = min(w / im.width, h / im.height)
    sp = im.resize((max(1, int(im.width * ty2)), max(1, int(im.height * ty2))), Image.LANCZOS)
    nen.paste(sp, ((w - sp.width) // 2, (h - sp.height) // 2))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255)
    ra = Image.new('RGBA', (w, h)); ra.paste(nen, (0, 0), m); return ra

def anh_tron(duong, d_, hop=None):
    im = Image.open(duong).convert('RGB')
    if hop:
        im = im.crop((int(hop[0] * im.width), int(hop[1] * im.height), int(hop[2] * im.width), int(hop[3] * im.height)))
    ty = max(d_ / im.width, d_ / im.height)
    im = im.resize((int(im.width * ty) + 1, int(im.height * ty) + 1), Image.LANCZOS)
    im = im.crop(((im.width - d_) // 2, (im.height - d_) // 2, (im.width - d_) // 2 + d_, (im.height - d_) // 2 + d_))
    m = Image.new('L', (d_, d_), 0); ImageDraw.Draw(m).ellipse([0, 0, d_ - 1, d_ - 1], fill=255)
    ra = Image.new('RGBA', (d_, d_)); ra.paste(im, (0, 0), m); return ra

def dau_trang(im, d, c, chip, tieuDe):
    phong_chip, phong_td = f('SemiBold', 19), f('Bold', 33)
    w = int(d.textlength(chip, font=phong_chip)) + 36
    d.rounded_rectangle([40, 30, 40 + w, 74], 22, fill=c)
    d.text((40 + 18, 42), chip, font=phong_chip, fill=(255, 255, 255))
    return ve_chu(d, (40, 92), tieuDe, phong_td, c, rong=W - 90, cao_dong=1.28)

def chan(d, c):
    p = f('SemiBold', 17)
    d.text((W - 40 - d.textlength('huongchatkids.vn', font=p), W - 46), 'huongchatkids.vn', font=p, fill=c)

def bong(im, hop, r=22):
    l = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(l).rounded_rectangle([hop[0] + 2, hop[1] + 5, hop[2] + 2, hop[3] + 7], r, fill=(140, 110, 80, 40))
    return Image.alpha_composite(im, l.filter(ImageFilter.GaussianBlur(7)))

def diem_noi_bat(m, ra):
    c, c2 = hoa(m['mau']), hoa(m.get('mauPhu', m['mau']))
    im = nen_dốc(*m.get('nen', ['#FDF6EC', '#F6E2C5'])).convert('RGBA')
    d = ImageDraw.Draw(im)
    y = dau_trang(im, d, c, m['chip'], m['tieuDe']) + 16
    if m.get('anh'):
        a = anh_bo_goc(m['anh'], W - 80, 300, 22, m.get('anhHop'))
        im = bong(im, (40, y, W - 40, y + 300)); im.paste(a, (40, y), a); d = ImageDraw.Draw(im)
        y += 300 + 24
    rong, cao = (W - 80 - 16) // 2, 92
    for i, (ten, mo, ico) in enumerate([(x['ten'], x.get('mo', ''), x.get('icon', '●')) for x in m['y'][:4]]):
        x0 = 40 + (i % 2) * (rong + 16); y0 = y + (i // 2) * (cao + 14)
        im = bong(im, (x0, y0, x0 + rong, y0 + cao), 18); d = ImageDraw.Draw(im)
        d.rounded_rectangle([x0, y0, x0 + rong, y0 + cao], 18, fill=(255, 255, 255))
        d.ellipse([x0 + 16, y0 + 24, x0 + 60, y0 + 68], fill=tuple(min(255, v + 150) for v in c2))
        ve_icon(im, (x0 + 38, y0 + 46), ico, c); d = ImageDraw.Draw(im)
        d.text((x0 + 74, y0 + 24), ten, font=f('Bold', 19), fill=(58, 46, 38))
        ve_chu(d, (x0 + 74, y0 + 50), mo, f('Regular', 15), (122, 108, 96), rong=rong - 92, cao_dong=1.2)
    chan(d, c); im.convert('RGB').save(ra, quality=93, subsampling=0)

def thong_tin(m, ra):
    c = hoa(m['mau'])
    im = nen_dốc(*m.get('nen', ['#FDF6EC', '#F6E2C5'])).convert('RGBA')
    d = ImageDraw.Draw(im)
    y = dau_trang(im, d, c, m['chip'], m['tieuDe']) + 20
    if m.get('anh'):
        a = anh_tron(m['anh'], 290, m.get('anhHop')); im.paste(a, (40, y + 10), a); d = ImageDraw.Draw(im)
    bx = 360
    hang = m['bang']
    phong_k, phong_v = f('SemiBold', 17), f('Medium', 18)
    cao = 28
    for k, v in hang:
        cao += len(xuong_dong(d, v, phong_v, W - bx - 72)) * 25 + 30
    im = bong(im, (bx, y, W - 40, y + cao), 22); d = ImageDraw.Draw(im)
    d.rounded_rectangle([bx, y, W - 40, y + cao], 22, fill=(255, 255, 255))
    yy = y + 24
    for i, (k, v) in enumerate(hang):
        if i: d.line([bx + 24, yy - 14, W - 64, yy - 14], fill=(238, 228, 214), width=1)
        d.text((bx + 24, yy), k, font=phong_k, fill=c)
        n = ve_chu(d, (bx + 150, yy - 2), v, phong_v, (58, 46, 38), rong=W - bx - 190, cao_dong=1.35)
        yy = max(yy + 30, n + 16)
    if m.get('ghiChu'):
        gy = y + 330
        dong = xuong_dong(d, m['ghiChu'], f('SemiBold', 17), 270)
        gh = 34 + len(dong) * 26
        d.rounded_rectangle([40, gy, 330, gy + gh], 18, fill=c)
        ve_chu(d, (62, gy + 17), m['ghiChu'], f('SemiBold', 17), (255, 255, 255), rong=270, cao_dong=1.5)
    chan(d, c); im.convert('RGB').save(ra, quality=93, subsampling=0)

if __name__ == '__main__':
    for m in json.load(open(sys.argv[1], encoding='utf-8')):
        (diem_noi_bat if m['mau_the'] == 'diem-noi-bat' else thong_tin)(m, m['ra'])
        print('đã dựng', m['ra'])
