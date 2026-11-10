// So sánh 5 cách sống trong trọn 56 ngày để kiểm tra cân bằng.
// Mỗi cách sống gồm: nếp sinh hoạt (ăn, ngủ, cách làm việc) và thứ tự ưu tiên khi gặp lựa chọn.
const { JSDOM, VirtualConsole } = require('jsdom');
const html = require('./nap-game')();
const MEAL = { nha:'home', tro:'cook', ghep:'cook' };
const STRAT = {
  'Ăn chơi':   { habit:bg => ({ meal:'app', lunchWork:'bun', bed:24.5, work:'fast', free:'game' }), pref:['Đi luôn','Trà đá','Cà phê','Chơi game','Thêm một trận','Mời cả team','Đi mua sắm','Có! Để tao'] },
  'Chăm học':  { habit:bg => ({ meal:MEAL[bg], lunchWork:'team', bed:23.5, work:'careful', free:'study' }), pref:['Viết lại cẩn thận','Ôn phỏng vấn','Học thêm','Làm kỹ','Đi học cùng','Ghi lại','việc khó hơn','Sửa lại CV'] },
  'Ngủ sớm':   { habit:bg => ({ meal:MEAL[bg], lunchWork:'team', bed:22.5, work:'careful', free:'rest' }), pref:['Nằm nghỉ','Dậy ngay','Dậy thôi','Chạy bộ','Từ chối','Hẹn hôm khác','xin phép tối nay'] },
  'Tiết kiệm': { habit:bg => ({ meal: bg === 'nha' ? 'home' : 'noodle', lunchWork:'bread', bed:23.5, work:'careful', free:'rest' }), pref:['Từ chối','Hẹn hôm khác','Giả vờ','Về nhà thôi','Nằm nghỉ','Dọn phòng','Kệ','Xem phim'], free:true },
  'Ngẫu nhiên': { habit:() => ({}), pref:[] },
};
const res = {};
for (const [name, st] of Object.entries(STRAT)) {
  const rows = [];
  for (let run = 0; run < (+process.env.RUNS || 6); run++) {
    const vc = new VirtualConsole();
    const dom = new JSDOM(html, { virtualConsole:vc, runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
      beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; } });
    const w = dom.window, d = w.document, bg = ['nha','tro','ghep'][run % 3];
    d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[1].click(); d.querySelector(`.bgopt[data-b="${bg}"]`).click(); d.querySelector('#go').click();
    w.eval(`Object.assign(S.habit, ${JSON.stringify(st.habit(bg))})`);
    w.eval("window.S_ = () => S"); let clicks = 0, lowE = 0, days = 0, lastDay = 0; const t0 = Date.now();
    for (let i = 0; i < 9000; i++) {
      if (d.querySelector('#again') || clicks > 2500) break;
      const S = w.S_(); if (S.day !== lastDay) { lastDay = S.day; days++; if (S.energy < 30) lowE++; }
      const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
      const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
      const nx = d.querySelector('#next'); if (nx) { nx.click(); clicks++; continue; }
      let ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]') && !b.textContent.includes('Tua đến'));
      if (!ch.length) break;
      if (st.free) { const f = ch.filter(b => !b.querySelector('.chip.cost, .tc')); if (f.length) ch = f; }
      let b = null; for (const k of st.pref) { b = ch.find(x => x.textContent.includes(k)); if (b) break; }
      (b || (st.pref.length ? ch[0] : ch[Math.floor(Math.random() * ch.length)])).click(); clicks++;
    }
    if (process.env.DEBUG) console.log(name, run, 'bấm', clicks, 'ms', Date.now() - t0, 'MB', Math.round(process.memoryUsage().heapUsed / 1e6));
    const S = w.eval('S');
    rows.push({ money:S.money, health:S.health, mood:S.mood, tech:S.tech, soft:S.soft, rel:Object.values(S.rel).reduce((a, b) => a + b, 0) / 7, nutr:S.nutr, job:S.job ? 1 : 0, debt:S.sleepDebt || 0, clicks:clicks / 56, lowE,
      owe: S.loans.filter(L => !L.repaid).reduce((a, L) => a + L.amount, 0) + S.bills.filter(b => !b.paid && b.due <= 56).reduce((a, b) => a + b.amount, 0), end:S.day });
    w.close();
  }
  const avg = k => Math.round(rows.reduce((a, r) => a + r[k], 0) / rows.length * 10) / 10;
  res[name] = { 'Tiền (nghìn)':Math.round(avg('money') / 1000), 'Nợ còn (nghìn)':Math.round(avg('owe') / 1000), 'Sức khỏe':avg('health'), 'Tinh thần':avg('mood'), 'Chuyên môn':avg('tech'), 'Kỹ năng mềm':avg('soft'), 'Quan hệ TB':avg('rel'),
    'Dinh dưỡng':avg('nutr'), 'Tỷ lệ có việc':avg('job'), 'Nợ ngủ (giờ)':avg('debt'), 'Ngày kiệt sức':avg('lowE'), 'Lần bấm/ngày':avg('clicks'), 'Ngày kết thúc':avg('end') };
}
console.table(res);
require('fs').writeFileSync(require('path').join(__dirname, 'ket-qua-can-bang.json'), JSON.stringify(res, null, 1));
