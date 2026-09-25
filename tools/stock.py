#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bật/tắt tồn kho cho website Hương Chất Kids.

Cách dùng (chạy trong thư mục dự án):
    python3 tools/stock.py list                 # xem tất cả sản phẩm + trạng thái
    python3 tools/stock.py het 26156646705      # đánh dấu HẾT hàng (nhiều id cách nhau bởi dấu cách)
    python3 tools/stock.py con 26156646705      # đánh dấu CÒN hàng
    python3 tools/stock.py het "gạc hươu"       # tìm theo tên, không cần id
    python3 tools/stock.py con --all            # tất cả còn hàng
    thêm --push để tự commit & đẩy lên web luôn
"""
import io, json, os, re, subprocess, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STOCK = os.path.join(ROOT, 'data', 'stock.json')


def products():
    t = io.open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf-8').read()
    b = t[t.index('window.PRODUCTS = ['):t.index('window.FEEDBACKS')]
    out = []
    for m in re.finditer(r'\n  \{ id: "(\d+)"(.*?)(?=\n  \{ id: "|\n\];)', b, re.S):
        s = re.search(r'short: "([^"]*)"', m.group(2))
        out.append((m.group(1), s.group(1) if s else ''))
    return out


def load():
    if os.path.exists(STOCK):
        return json.load(io.open(STOCK, encoding='utf-8'))
    return {'items': {}}


def save(data, push=False):
    data['updatedAt'] = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S+07:00')
    data.setdefault('source', 'manual')
    data['note'] = 'true = con hang, false = het hang'
    io.open(STOCK, 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print('Đã ghi', os.path.relpath(STOCK, ROOT))
    if push:
        subprocess.check_call(['git', 'add', 'data/stock.json'], cwd=ROOT)
        subprocess.check_call(['git', 'commit', '-q', '-m', 'Cập nhật tồn kho'], cwd=ROOT)
        subprocess.check_call(['git', 'push', '-q'], cwd=ROOT)
        print('Đã đẩy lên web – khách thấy sau ~1 phút.')


def match(args, prods):
    ids = []
    for a in args:
        if a.isdigit():
            ids.append(a)
            continue
        hits = [p for p in prods if a.lower() in p[1].lower()]
        if not hits:
            sys.exit('Không tìm thấy sản phẩm nào khớp "%s"' % a)
        if len(hits) > 1:
            print('"%s" khớp nhiều sản phẩm:' % a)
            for pid, name in hits:
                print('   ', pid, name)
            sys.exit('Hãy dùng mã id cho chính xác.')
        ids.append(hits[0][0])
    return ids


def main():
    argv = [a for a in sys.argv[1:] if a != '--push']
    push = '--push' in sys.argv
    if not argv:
        sys.exit(__doc__)
    cmd, rest = argv[0], argv[1:]
    prods = products()
    data = load()
    items = data.setdefault('items', {})
    for pid, _ in prods:
        items.setdefault(pid, True)

    if cmd == 'list':
        for pid, name in prods:
            print(('CÒN ' if items.get(pid, True) else 'HẾT '), pid, name)
        return
    if cmd not in ('con', 'het'):
        sys.exit(__doc__)
    value = cmd == 'con'
    ids = [p[0] for p in prods] if '--all' in rest else match([r for r in rest if r != '--all'], prods)
    if not ids:
        sys.exit('Thiếu id hoặc tên sản phẩm.')
    names = dict(prods)
    for pid in ids:
        items[pid] = value
        print(('CÒN ' if value else 'HẾT '), pid, names.get(pid, ''))
    save(data, push)


if __name__ == '__main__':
    main()
