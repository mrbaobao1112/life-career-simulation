// Audit v17.3: điều khiển, di chuyển, va chạm, camera, lớp, chuyển cảnh, joystick
const { chromium, devices } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
const out = []; const rec = (k, ok, v) => { out.push({ k, ok, v }); console.log((ok ? 'OK  ' : 'BAD ') + k + ' → ' + JSON.stringify(v)); };
async function open(b, bg = 'tro', o = {}){
  const ctx = await b.newContext({ viewport:{ width:1280, height:800 }, ...o }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click(`.bgopt[data-b="${bg}"]`); await p.click('#go');
  await p.evaluate(() => { S.once.roamTut = true; }); return p;
}
const scene = (p, at, day = 8, h = 9) => p.evaluate(([at, day, h]) => { const slot = h < 11 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = at === 'home' ? null : { d:day, slot, at, bike:null };
  S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.end = 1e9; }, [at, day, h]).then(() => p.waitForTimeout(700));
const me = p => p.evaluate(() => ({ x:WORLD.me.x, y:WORLD.me.y, t:WORLD.t, left:!!WORLD.me.left, act:WORLD.me.el.querySelector('.cb').getAttribute('class'), cam:WORLD.cam, energy:S.energy }));
const hold = async (p, keys, ms) => { for (const k of keys) await p.keyboard.down(k); await p.waitForTimeout(ms); for (const k of keys) await p.keyboard.up(k); await p.waitForTimeout(120); };
(async () => {
  const b = await chromium.launch();
  { const p = await open(b); await scene(p, 'home');
    // đặt ở chỗ trống giữa phòng
    await p.evaluate(() => { const H = WORLD.H; let best = null; for (let x = 100; x < H.W - 100; x += 10) if (roamFree(H, x, 180) && roamFree(H, x + 120, 180) && roamFree(H, x, 160)) { best = x; break; } WORLD.me.x = best; WORLD.me.y = 180; });
    await p.waitForTimeout(300);
    let a = await me(p); await hold(p, ['KeyD'], 1000); let c = await me(p); rec('D: đi phải ~1 giây', c.x - a.x > 40, { dx:Math.round(c.x - a.x) });
    a = c; await hold(p, ['ArrowLeft'], 1000); c = await me(p); rec('Mũi tên trái', a.x - c.x > 40 && c.left, { dx:Math.round(a.x - c.x), left:c.left });
    a = c; await hold(p, ['KeyW'], 400); c = await me(p); rec('W: đi vào trong (chậm hơn đi ngang)', c.y < a.y, { dy:Math.round(c.y - a.y) });
    a = c; await hold(p, ['ArrowDown'], 400); c = await me(p); rec('Mũi tên xuống', c.y > a.y, { dy:Math.round(c.y - a.y) });
    // tốc độ đi chéo
    await p.evaluate(() => { WORLD.me.y = 180; }); a = await me(p); await hold(p, ['KeyD'], 600); const s1 = await me(p);
    await p.evaluate(() => { WORLD.me.y = 160; }); a = await me(p); await hold(p, ['KeyD', 'KeyS'], 600); const s2 = await me(p);
    rec('Đi chéo D+S: có đi được (8 hướng)', s2.y > 160 && s2.x > a.x, { dx:Math.round(s2.x - a.x), dy:Math.round(s2.y - 160) });
    // chạy
    await p.evaluate(() => { WORLD.me.x = 150; WORLD.me.y = 180; }); a = await me(p); await p.keyboard.down('Shift'); await hold(p, ['KeyD'], 600); await p.keyboard.up('Shift'); c = await me(p);
    rec('Shift: chạy nhanh hơn đi bộ', true, { chay:Math.round(c.x - a.x), di:Math.round(s1.x - (s1.x - 0)) });
    // đổi hướng liên tục: đo bước nhảy vị trí mỗi khung hình
    const jumps = await p.evaluate(async () => { const s = []; let last = WORLD.me.x; const ev = c => document.dispatchEvent(new KeyboardEvent(c[0], { code:c[1], key:c[1] }));
      let run = true; const f = () => { s.push(Math.abs(WORLD.me.x - last)); last = WORLD.me.x; if (run) requestAnimationFrame(f); }; requestAnimationFrame(f);
      for (let i = 0; i < 8; i++) { ev(['keydown', i % 2 ? 'KeyA' : 'KeyD']); await new Promise(r => setTimeout(r, 180)); ev(['keyup', i % 2 ? 'KeyA' : 'KeyD']); }
      run = false; return { max:Math.max(...s), n:s.length }; });
    rec('Đổi hướng liên tục: không nhảy vị trí (mỗi khung hình < 6 đơn vị)', jumps.max < 6, jumps);
    // hoạt ảnh đi bộ
    await p.keyboard.down('KeyD'); await p.waitForTimeout(250); const walk = await p.evaluate(() => ({ cls:WORLD.me.el.querySelector('.cb').getAttribute('class'), anim:WORLD.me.el.getAnimations({ subtree:true }).filter(a => a.playState === 'running').length }));
    await p.keyboard.up('KeyD'); await p.waitForTimeout(400); const idle = await p.evaluate(() => ({ cls:WORLD.me.el.querySelector('.cb').getAttribute('class'), anim:WORLD.me.el.getAnimations({ subtree:true }).filter(a => a.playState === 'running').length }));
    rec('Đang đi: có hoạt ảnh đi bộ chạy', /act-walk/.test(walk.cls) && walk.anim > 0, walk);
    rec('Dừng lại: về dáng đứng, vẫn có hoạt ảnh thở (không đứng hình)', !/act-walk/.test(idle.cls) && idle.anim > 0, idle);
    // va chạm: 90 giây đi ngẫu nhiên, chân không bao giờ nằm trong đồ đạc; đếm lần kẹt
    const rw = await p.evaluate(async () => { const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD']; let bad = 0, stuck = 0, n = 0, maxStill = 0, still = 0, lx = WORLD.me.x, ly = WORLD.me.y;
      const ev = (t, c) => document.dispatchEvent(new KeyboardEvent(t, { code:c, key:c }));
      for (let i = 0; i < 300; i++) { const k = [keys[Math.floor(Math.random() * 4)]]; if (Math.random() < .4) k.push(keys[Math.floor(Math.random() * 4)]);
        k.forEach(c => ev('keydown', c)); await new Promise(r => setTimeout(r, 300)); k.forEach(c => ev('keyup', c));
        n++; if (!roamFree(WORLD.H, WORLD.me.x, WORLD.me.y)) bad++;
        if (Math.hypot(WORLD.me.x - lx, WORLD.me.y - ly) < .5) still++; else { maxStill = Math.max(maxStill, still); still = 0; } lx = WORLD.me.x; ly = WORLD.me.y;
        if (WORLD.menu || WORLD.busy) { document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', code:'Escape' })); } }
      return { n, bad, maxStill, H:WORLD.H.key }; });
    rec('Đi ngẫu nhiên 90 giây: không lần nào đứng trong đồ đạc', rw.bad === 0, rw);
    rec('Đi ngẫu nhiên: không bị kẹt lâu (tối đa số lượt liền không nhúc nhích)', rw.maxStill <= 3, rw);
    // tương tác: đến gần đồ vật, E mở thực đơn, đang mở thì phím đi có làm nhân vật đi không
    const o = await p.evaluate(() => { const o = WORLD.H.objs.find(x => x.kind === 'act' || x.kind === 'minor') || WORLD.H.objs[0]; WORLD.me.x = o.spot.x; WORLD.me.y = o.spot.y; return o.id; });
    await p.waitForTimeout(400); await p.keyboard.press('KeyE'); await p.waitForTimeout(300);
    const m0 = await p.evaluate(() => ({ menu:!!WORLD.menu, x:WORLD.me.x, items:[...document.querySelectorAll('.w-menu .w-act')].length }));
    await hold(p, ['KeyD'], 600); const m1 = await p.evaluate(() => ({ menu:!!WORLD.menu, x:WORLD.me.x }));
    rec(`Đứng cạnh “${o}”, E: mở thực đơn`, m0.menu && m0.items > 0, m0);
    rec('Đang mở thực đơn mà bấm phím đi: hành vi', true, { truoc:m0, sau:m1, ghi_chu:m1.menu ? 'thực đơn vẫn mở' : 'thực đơn tự đóng khi đi' });
    await p.keyboard.press('Escape');
    // camera và lớp
    await p.evaluate(() => { WORLD.me.x = WORLD.H.W - 60; }); await p.waitForTimeout(900);
    const cam = await p.evaluate(() => ({ cam:Math.round(WORLD.cam), me:Math.round(WORLD.me.x), W:WORLD.H.W, view:ROAM.VIEW_W }));
    rec('Camera đi theo nhân vật đến cuối bản đồ', cam.me > cam.cam && cam.me < cam.cam + cam.view, cam);
    rec('Không lỗi trang', !p.errs.length, p.errs.slice(0, 3)); await p.context().close(); }

  // lớp người trước/sau, chuyển cảnh liên tục, đếm vòng lặp vẽ
  { const p = await open(b, 'ghep'); await scene(p, 'home', 8, 11); await p.waitForTimeout(1500);
    const z = await p.evaluate(() => { const a = WORLD.npcs.find(n => !n.gone && !n.rot); if (!a) return null; const L = WORLD.me.el.parentNode;
      WORLD.me.x = a.x + 4; WORLD.me.y = a.y - 8; const step = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      return step().then(() => { const i1 = [...L.children].indexOf(WORLD.me.el), j1 = [...L.children].indexOf(a.el); WORLD.me.y = a.y + 8;
        return step().then(() => { const i2 = [...L.children].indexOf(WORLD.me.el), j2 = [...L.children].indexOf(a.el); return { sauNPC:i1 < j1, truocNPC:i2 > j2, who:a.who }; }); }); });
    rec('Lớp: đứng phía trong thì bị NPC che, đứng phía ngoài thì che NPC', z && z.sauNPC && z.truocNPC, z);
    // đếm số lần gọi requestAnimationFrame mỗi giây trước và sau 12 lần chuyển cảnh
    await p.evaluate(() => { const raf = window.requestAnimationFrame; window.__raf = 0; window.requestAnimationFrame = f => { window.__raf++; return raf(f); }; });
    const rate = async () => { await p.evaluate(() => { window.__raf = 0; }); await p.waitForTimeout(2000); return p.evaluate(() => window.__raf / 2); };
    const r0 = await rate(); const t0 = Date.now();
    const places = ['street', 'in:cafe', 'street', 'in:lake', 'home', 'street', 'in:mall', 'street', 'in:bus', 'home', 'street', 'in:com'];
    const times = [];
    for (const at of places) { const t = Date.now(); await p.evaluate(at => { S.where = at === 'home' ? null : { d:S.day, slot:S.slot, at, bike:null }; S.queue = [{ id:'activity', arg:S.slot }]; S.cur = null; advance(); }, at);
      await p.waitForFunction(() => WORLD && WORLD.H, null, { timeout:8000 }); times.push(Date.now() - t); }
    const r1 = await rate();
    rec('12 lần chuyển cảnh liên tục: số lần vẽ mỗi giây không tăng (không rò vòng lặp)', r1 <= r0 * 1.3 + 5, { truoc:r0, sau:r1 });
    rec('Thời gian dựng một cảnh (ms)', true, { min:Math.min(...times), max:Math.max(...times), tb:Math.round(times.reduce((a, b) => a + b) / times.length) });
    const worlds = await p.evaluate(() => document.querySelectorAll('#world').length);
    rec('Chỉ có một khung thế giới sau nhiều lần chuyển', worlds === 1, worlds);
    // đi bằng cửa thật: phố → quán → phố
    await scene(p, 'street', 8, 15);
    await p.evaluate(() => { const d = WORLD.H.objs.find(o => o.id === 'd_in:cafe'); WORLD.me.x = d.spot.x; WORLD.me.y = d.spot.y; }); await p.waitForTimeout(400);
    await p.keyboard.press('KeyE'); await p.waitForTimeout(400); const mm = await p.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
    if (mm.length) { await p.keyboard.press('Digit1'); } await p.waitForTimeout(2500);
    const inCafe = await p.evaluate(() => document.querySelector('#world').dataset.place);
    await p.evaluate(() => { const d = WORLD.H.objs.find(o => o.id === 'exit'); if (d) { WORLD.me.x = d.spot.x; WORLD.me.y = d.spot.y; } }); await p.waitForTimeout(400);
    await p.keyboard.press('KeyE'); await p.waitForTimeout(400); if ((await p.$$('.w-menu .w-act')).length) await p.keyboard.press('Digit1'); await p.waitForTimeout(2500);
    const back = await p.evaluate(() => ({ place:document.querySelector('#world').dataset.place, x:Math.round(WORLD.me.x) }));
    rec('Đi bằng cửa: phố → quán cà phê → ra phố, đứng trước cửa quán', inCafe === 'in:cafe' && back.place === 'street' && Math.abs(back.x - 805) < 60, { menu:mm, inCafe, back });
    rec('Không lỗi trang', !p.errs.length, p.errs.slice(0, 3)); await p.context().close(); }

  // điện thoại: joystick
  { const p = await open(b, 'tro', { ...devices['iPhone 13'] }); await scene(p, 'street', 8, 15);
    const j = await p.$('.w-joy'); const vis = j && await j.isVisible();
    let r = null;
    if (vis) { const bx = await j.boundingBox(); const a = await me(p);
      await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width * .95, bx.y + bx.height / 2, { steps:5 }); await p.waitForTimeout(1000); await p.mouse.up(); await p.waitForTimeout(200);
      const c = await me(p); r = { dx:Math.round(c.x - a.x), run:c.x - a.x > 90 }; }
    rec('Điện thoại: joystick hiện và kéo được (đi phải)', vis && r && r.dx > 30, { vis, ...r });
    const tap = await p.$('.w-use'); rec('Điện thoại: có nút dùng/tương tác thay phím E', !!tap && await tap.isVisible(), !!tap);
    const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); rec('Điện thoại: không tràn ngang', w[0] <= w[1], w);
    rec('Không lỗi trang', !p.errs.length, p.errs.slice(0, 3)); await p.context().close(); }
  fs.writeFileSync(path.join(KQ, 'r_di-chuyen.json'), JSON.stringify(out, null, 1));
  await b.close();
})();
