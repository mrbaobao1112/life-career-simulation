const { JSDOM } = require('jsdom');
const html = require('./nap-game')();
const PREF = {
  'Ăn chơi': ['Đi luôn','Trà đá','Cà phê','Rủ ai','Rủ ','Chơi game','Thêm một trận','Mời cả team','Gọi đồ ăn','Bún chả','Tâm sự','Có! Để tao','02:00','00:30','Đi trung tâm'],
  'Chăm học': ['Viết lại cẩn thận','Ôn câu hỏi','Học thêm','Làm kỹ','Đi học cùng','Ghi lại','Hỏi anh Dũng','23:30','Cơm','Tự nấu','Nấu chung','Đo xem','So sánh'],
  'Ngủ sớm': ['22:30','Nằm nghỉ','Dậy ngay','Dậy thôi','Chạy bộ','Cơm','Tự nấu','Nấu chung','Từ chối','Hẹn hôm khác'],
  'Tiết kiệm': ['Mì tôm','Từ chối','Hẹn hôm khác','Giả vờ','Về nhà thôi','Nằm nghỉ','Dọn phòng','Kệ','Giữ nguyên','Cơm mẹ','23:30'],
  'Ngẫu nhiên': [],
};
const res = {};
for (const [name, pref] of Object.entries(PREF)) {
  const rows = [];
  for (let run = 0; run < 10; run++) {
    const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
      beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; } });
    const w = dom.window, d = w.document;
    d.querySelector('#fresh').click(); d.querySelectorAll(".bgopt[data-f]")[run % 3].click(); d.querySelectorAll(".bgopt[data-b]")[run % 3].click(); d.querySelector('#go').click();
    let mood100 = 0;
    for (let i = 0; i < 900; i++) {
      if (d.querySelector('#again')) break;
      const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
      const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
      const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
      if (!ch.length) break;
      let pickB = null;
      if (name === 'Tiết kiệm') { const free = ch.filter(b => !b.querySelector('.chip.cost')); for (const k of pref) { pickB = free.find(b => b.textContent.includes(k)); if (pickB) break; } if (!pickB) pickB = free[0]; }
      else for (const k of pref) { pickB = ch.find(b => b.textContent.includes(k)); if (pickB) break; }
      (pickB || ch[Math.floor(Math.random() * ch.length)]).click();
      if (w.eval('S && S.mood') >= 100) mood100++;
    }
    const S = w.eval('S');
    rows.push({ money:S.money, energy:S.energy, health:S.health, mood:S.mood, tech:S.tech, soft:S.soft, rel:Math.round(Object.values(S.rel).reduce((a,b)=>a+b,0)/7), nutr:S.nutr, job:S.job?1:0, mood100, debt:S.sleepDebt||0 });
    w.close();
  }
  const avg = k => Math.round(rows.reduce((a, r) => a + r[k], 0) / rows.length * 10) / 10;
  res[name] = { 'Tiền (nghìn)':Math.round(avg('money')/1000), 'Năng lượng':avg('energy'), 'Sức khỏe':avg('health'), 'Tinh thần':avg('mood'), 'Chuyên môn':avg('tech'), 'Kỹ năng mềm':avg('soft'), 'Quan hệ TB':avg('rel'), 'Dinh dưỡng':avg('nutr'), 'Tỷ lệ có việc':avg('job'), 'Số bước tinh thần =100':avg('mood100'), 'Nợ ngủ':avg('debt') };
}
console.table(res);
require('fs').writeFileSync(require('path').join(__dirname, 'ket-qua-can-bang.json'), JSON.stringify(res, null, 1));
