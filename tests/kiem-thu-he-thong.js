const { JSDOM } = require('jsdom');
const html = require('./nap-game')();
// v17.6: thêm kiểm tra đạt/không đạt (trước đây chỉ in số liệu)
let fail = 0; const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
const mk = () => { const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
  beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; } }); return dom.window; };
// 1. Tái hiện ca năng lượng
for (const [label, opt, hang] of [['22:30 + bia hơi',0,true],['22:30 không bia',0,false],['00:30 + bia hơi',2,true]]) {
  const w = mk();
  const r = w.eval(`newGame('A','nam','nha'); S.applied='hotay'; S.ivDay=2; S.energy=56; S.hangover=${hang};
    const sc = SC.bedtime(); const hint = sc.choices[${opt}].hints.join(' | '); sc.choices[${opt}].fx(); startDay();
    JSON.stringify({ hint, energy:S.energy, rows:S.wakeInfo.map(r=>r[0]+': '+r[1]).join('; '), arrive: S.am ? hm(S.am.arrive) : null })`);
  console.log(label, '=>', r); w.close();
  const o = JSON.parse(r), want = +(o.hint.match(/khoảng (\d+)/) || [])[1];
  check(`Đi ngủ (${label}): năng lượng sáng hôm sau đúng như gợi ý lúc chọn`, o.energy === want && o.energy >= 0 && o.energy <= 100, `gợi ý ${want}, thật ${o.energy}`);
}
// 2. Ngẫu nhiên theo giới tính
const w = mk(); const d = w.document; d.querySelector('#fresh').click();
let bad = 0;
for (const g of ['nam','nu']) { d.querySelector(`.gopt[data-g="${g}"]`).click();
  for (let i=0;i<60;i++){ d.querySelector('#rnd').click(); const sel = d.querySelector('.hairopt[aria-pressed="true"]').dataset.id; if (!w.eval(`CAT['${sel}'].fit.includes('${g}')`)) bad++; } }
d.querySelector('.gopt[data-g="nam"]').click(); d.querySelectorAll('.hairopt')[0].click();
check('Chọn ngẫu nhiên ngoại hình: kiểu tóc luôn hợp giới tính (120 lần)', bad === 0, bad + ' lần lệch');
console.log('random hair lệch giới tính:', bad, '| thứ tự kiểu tóc khi chọn Nữ:', (d.querySelector('.gopt[data-g="nu"]').click(), [...d.querySelectorAll('.hairopt span')].map(x=>x.textContent).join(', ')));
// 3. Bữa ăn: một bữa mì tôm không làm dinh dưỡng giảm mạnh
const w3 = mk(); const dd = JSON.parse(w3.eval(`newGame('A','nam','tro'); const a=S.nutr; logMeal('noodle'); const b=S.nutr; for(let i=0;i<6;i++) logMeal('noodle'); JSON.stringify({start:a, sau1MiTom:b, sau7MiTom:S.nutr, hoso:foodProfile().rows.map(r=>r[0]+': '+r[2]).join('; ')})`)); console.log('dinh dưỡng:', JSON.stringify(dd));
check('Bữa ăn: một bữa mì tôm chỉ giảm dinh dưỡng một chút (tối đa 6), ăn mãi thì giảm dần', dd.start - dd.sau1MiTom > 0 && dd.start - dd.sau1MiTom <= 6 && dd.sau7MiTom < dd.sau1MiTom, JSON.stringify(dd));
w3.close(); w.close();   // đóng cửa sổ: thế giới tự do có vòng lặp hình chạy liên tục, không đóng thì kiểm thử không tự thoát
console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt'); process.exitCode = fail ? 1 : 0;
