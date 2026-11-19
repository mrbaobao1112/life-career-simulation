import json, sys, glob, collections, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ket-qua'))
names = sys.argv[1:] or sorted(f[2:-5] for f in glob.glob('r_*.json') if not any(k in f for k in ('play', 'di-chuyen', 'tri-nho', 'smoke', 'perf')))
def hm(t): t = int(t) % 1440; return f'{t//60:02d}:{t%60:02d}'
for n in names:
    r = json.load(open(f'r_{n}.json'))
    print(f'===== {n}  {hm(r["t0"])}→{hm(r["t1"])}  mẫu {r["samples"]}  tối đa hiện {r["maxVis"]}  lỗi {len(r["errs"])}')
    ap, va = r['appear'], r['vanish']
    sud = [a for a in ap if a['view'] and not a.get('edge')]; svan = [a for a in va if a['view'] and not a.get('edge')]
    print(f'  hiện ra {len(ap)} (trong khung nhìn, không ở cửa/mép: {len(sud)}) | biến mất {len(va)} (bất thường: {len(svan)})')
    for a in (sud[:4] + svan[:4]): print('    ', a)
    ov = {k: v for k, v in r['overlap'].items() if (v['n'] if isinstance(v, dict) else v) >= 5}
    print('  chồng lấn khi đứng yên (≥1 giây):', {k: ('tổng %.0fs, đợt dài nhất %.1fs' % (v['n']/5, v.get('maxS', 0)), v['ex'][:2]) for k, v in ov.items()} if ov else 'không')
    print('  đi xuyên đồ vật (số mẫu):', r['through'] or 'không')
    print('  đứng yên lâu nhất (phút game):', [(s['who'], s['max']) for s in r['still'][:6]])
    said = r['said']; c = collections.Counter(t for _, t in said)
    print(f'  câu nói: {len(said)}, khác nhau {len(c)}, lặp nhiều nhất: {c.most_common(3)}')
    print('  dấu hiệu:', dict(sorted(r['signs'].items(), key=lambda x: -x[1])[:10]))
    tl = r['tl']; step = max(1, len(tl) // 10)
    for x in tl[::step]: print('   ', hm(x['t']), 'hiện', x['vis'], x['named'])
    if r.get('wev'): print('  sự kiện thế giới:', r['wev'])
