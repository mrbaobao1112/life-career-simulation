// Tạo bản lưu mẫu từ một phiên bản cũ của game (để kiểm thử tương thích bản lưu: npm run luu-tai).
// Chỉ cần chạy lại khi muốn thêm bản lưu của một phiên bản mới; các file .json đã tạo được đưa lên git.
// Dùng:
//   git worktree add /tmp/cu <commit của bản cũ>
//   node tao-ban-luu.js /tmp/cu 17.4            → ban-luu-17.4-ngay-<N>.json (chơi bằng nút bấm đến ngày 12 và 30, jsdom)
//   node tao-ban-luu.js /tmp/cu 17.4 dang-di    → ban-luu-17.4-dang-di.json (lưu giữa lúc đang đi lại ngoài phố, cần Playwright)
const path = require('path'), fs = require('fs');
const [dir, ver, kieu] = process.argv.slice(2);
if (!dir || !ver) { console.log('Dùng: node tao-ban-luu.js <thư mục bản cũ> <phiên bản> [dang-di]'); process.exit(1); }
const OUT = __dirname;
const ghi = (ten, o) => { fs.writeFileSync(path.join(OUT, ten), JSON.stringify(o) + '\n'); console.log('Đã ghi', ten, Math.round(o.value.length / 1024) + ' KB'); };

if (kieu === 'dang-di') {
  const { chromium } = require('playwright');
  (async () => {
    const b = await chromium.launch(), ctx = await b.newContext({ viewport:{ width:520, height:900 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto('file://' + path.join(path.resolve(dir), 'index.html'));
    await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b="ghep"]'); await page.click('#go');
    // ngày 6 (thứ Bảy) buổi chiều, đang ở ngoài phố; đi bộ vài giây rồi để game tự lưu như người chơi thật
    await page.evaluate(() => { S.once.roamTut = true; S.day = 6; S.slot = 'afternoon'; S.roam = { d:6, t:15 * 60 }; S.roamPos = {};
      S.where = typeof whereAt === 'function' ? { d:6, slot:'afternoon', at:'street', bike:null } : null; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = null; advance(); });
    await page.waitForTimeout(800); await page.keyboard.down('d'); await page.waitForTimeout(2500); await page.keyboard.up('d'); await page.waitForTimeout(3600);
    const o = await page.evaluate(() => { if (typeof saveRoam === 'function') saveRoam(); save(); return { key:SAVE_KEY, value:localStorage.getItem(SAVE_KEY), day:S.day, place:typeof WORLD !== 'undefined' && WORLD ? WORLD.id || (WORLD.ref && WORLD.ref.id) : null }; });
    if (errs.length) { console.log('Bản cũ báo lỗi:', errs[0]); process.exit(1); }
    ghi(`ban-luu-${ver}-dang-di.json`, { ver, kieu:'dang-di', ...o }); await b.close();
  })();
} else {
  const { JSDOM } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
  for (const [ngay, seed0] of [[12, 7], [30, 11]]) {
    let seed = seed0; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const html = require(path.join(path.resolve(dir), 'tests/nap-game.js'))(path.join(path.resolve(dir), 'index.html'));
    const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
      beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; } });
    const w = dom.window, d = w.document; const errs = []; w.addEventListener('error', e => errs.push(e.message));
    d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[1].click(); d.querySelectorAll('.bgopt[data-b]')[ngay === 12 ? 0 : 2].click(); d.querySelector('#go').click();
    for (let i = 0; i < 9000; i++) {
      const S = w.eval('S'); if (S && S.day >= ngay) break;
      const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
      const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
      const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
      const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
      if (!ch.length) { errs.push('kẹt'); break; }
      ch[Math.floor(rnd() * ch.length)].click();
    }
    w.eval('save()'); const key = w.eval('SAVE_KEY'), value = w.localStorage.getItem(key), S = JSON.parse(value);
    if (errs.length) { console.log('Bản cũ báo lỗi:', errs[0]); process.exit(1); }
    ghi(`ban-luu-${ver}-ngay-${ngay}.json`, { ver, kieu:'nut-bam', key, value, day:S.day });
    w.close();
  }
}
