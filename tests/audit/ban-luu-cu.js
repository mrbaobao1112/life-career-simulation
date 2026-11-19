// Audit v17.3: chơi bằng bản cũ đến giữa game, lấy bản lưu, mở bằng bản v17.3 và chơi tiếp đến hết 56 ngày
const path = require('path');
const { JSDOM } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const [oldDir, stopDay, seedStr] = process.argv.slice(2);
let seed = +seedStr || 7; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
function make(dir, save){
  const html = require(path.join(dir, 'tests/nap-game.js'))(path.join(dir, 'index.html'));
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = Math.random;
      if (save) w.localStorage.setItem(save.k, save.v); } });
  const errs = []; dom.window.addEventListener('error', e => errs.push(e.message)); return { w:dom.window, d:dom.window.document, errs };
}
function play(g, until){
  const { w, d } = g; let steps = 0;
  while (steps++ < 9000) {
    const S = w.eval('typeof S !== "undefined" ? S : null');
    if (S && S.day >= until) break;
    if (d.querySelector('#again')) break;
    const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
    if (!ch.length) { g.errs.push('kẹt: ' + d.querySelector('#stage').textContent.slice(0, 120)); break; }
    ch[Math.floor(Math.random() * ch.length)].click();
  }
  return steps;
}
const old = make(oldDir);
old.d.querySelector('#fresh').click(); old.d.querySelectorAll('.bgopt[data-f]')[1].click(); old.d.querySelectorAll('.bgopt[data-b]')[1].click(); old.d.querySelector('#go').click();
play(old, +stopDay || 15);
const key = old.w.eval('SAVE_KEY'); old.w.eval('save()'); const v = old.w.localStorage.getItem(key);
const oS = JSON.parse(v); old.w.close();
const g = make(path.join(__dirname, '..', '..'), { k:key, v });
const res = g.d.querySelector('#resume'); if (res) res.click();
const S0 = g.w.eval('JSON.parse(JSON.stringify({ day:S.day, money:S.money, job:S.job && S.job.co, energy:S.energy, health:S.health }))');
const steps = play(g, 999);
const S = g.w.eval('S');
const html = g.d.querySelector('#app').innerHTML;
console.log(JSON.stringify({ banCu:path.basename(oldDir), ngayLuu:oS.day, tienLuu:oS.money, coViec:!!oS.job, moBangMoi:S0, buoc:steps, ketThuc:!!g.d.querySelector('#again'), ngayCuoi:S.day,
  loi:old.errs.concat(g.errs).slice(0, 4), NaN:/NaN|undefined/.test(html), npcMem:(S.npcMem || []).length, npcRel:Object.keys(S.npcRel || {}).length }));
g.w.close();
