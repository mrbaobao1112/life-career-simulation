const { JSDOM } = require('jsdom');
const html = require('fs').readFileSync(process.env.GAME || require("path").join(__dirname, "..", "index.html"),'utf8');
const mk = () => new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
  beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; } }).window;
// kiểm tra lương và chống trừ trùng
{ const w = mk(); console.log('LƯƠNG:', w.eval(`newGame('A','nam','tro', defaultLook('nam'), 'tb'); S.job={co:'hotay',salary:10000000,start:3};
  const p1=payFor(25), p2=payFor(56); S.money=20e6; for(let d=2; d<=56; d++){ S.day=d; processFinance(); if(d===25){ const sv=JSON.parse(JSON.stringify(S)); S=sv; S.finDay=0; processFinance(); } }
  JSON.stringify({ luong10_12:p1.amount+' ('+p1.days+'/'+p1.full+' ngày)', luong10_1:p2.amount+' ('+p2.days+'/'+p2.full+')', soLanNhanLuong:S.flags.paidCount, hoaDonTrung: S.bills.filter(b=>b.paid).length !== new Set(S.bills.filter(b=>b.paid).map(b=>b.id)).size })`)); w.close(); }
const SP = { 'Tiết kiệm':'SAVER', 'Bình thường':'NORMAL', 'Thoải mái':275000 };
const rows = [];
for (const bg of ['nha','tro','ghep']) for (const sp of Object.keys(SP)) for (const job of [true,false]) for (const fam of ['tb','kha','kho']) for (const strat of ['sớm','phút chót']) {
  const w = mk();
  const r = JSON.parse(w.eval(`(() => { newGame('A','nam','${bg}', defaultLook('nam'), '${fam}'); S.rel.tung=60; S.rel.linh=60;
    if (${job}) S.job = { co:'hotay', salary:10000000, start:3 };
    const daily = ${typeof SP[sp]==='string' ? `FIN.${SP[sp]}['${bg}']` : SP[sp]};
    const o = { nho:[], phi:0, doi:0, min:S.money, d31:0, d56:0, no:0 };
    const pickRun = (sc, prefer) => { for (const k of prefer) { const c = sc.choices.find(c => !c.disabled && c.label.includes(k)); if (c) { c.fx(); return c.label; } } const c = sc.choices.find(c => !c.disabled); c.fx(); return c.label; };
    const plan = () => { for (let i=0;i<6;i++){ S.queue=[]; const sc = SC.plan(); const opt = sc.choices.filter(c => !c.label.startsWith('Tạm thời') && !c.label.startsWith('Đóng sổ'));
      const want = ['Hẹn','Nhờ Tùng','Gọi về nhà','Vay Linh'].map(k => opt.find(c => c.label.includes(k))).filter(Boolean);
      const proj = runway(avgDaily()); if (proj >= 40 || !want.length) break; o.nho.push(fmtD(S.day)+' '+want[0].label.slice(0,26)); want[0].fx(); } };
    for (let d = 2; d <= 56; d++) {
      S.day = d; const wd = dateOf(d).getDay();
      if (S.job && d >= 3 && wd >= 1 && wd <= 5) { const f = Math.min(FIN.FUEL, S.money); S.money -= f; spendLog(f); }
      if ('${strat}' === 'sớm' && '${bg}' !== 'nha' && (d === 3 || d === 26 || d === 45)) plan();
      const ev = processFinance();
      for (const e of ev) {
        if (e.id === 'payday' && '${bg}' === 'nha') { S.money -= Math.min(S.money, FIN.HOUSE_CONTRIB); }
        if (e.id === 'repay') pickRun(SC.repay(), ['Trả hết','Trả trước','Xin khất']);
        if (e.id === 'bill_short') { const b = S.bills.find(x => x.id === e.arg); const before = b.amount; const l = pickRun(SC.bill_short(e.arg), ['Gọi','Nhờ Tùng','Vay Linh','tạm ứng','nộp chậm','khất']); o.nho.push(fmtD(d)+' (phút chót) '+l.slice(0,24)); o.phi += Math.max(0, b.amount - before); }
      }
      const spend = Math.min(daily, Math.max(0, S.money)); if (spend < daily) o.doi++; S.money -= spend; spendLog(spend);
      o.min = Math.min(o.min, S.money); if (d === 31) o.d31 = S.money; if (d === 56) o.d56 = S.money;
    }
    o.no = openLoans().reduce((a,L)=>a+L.amount,0) + S.bills.filter(b=>!b.paid && b.due<=56).reduce((a,b)=>a+b.amount,0);
    return JSON.stringify(o); })()`));
  rows.push({ bg, sp, job, fam, strat, ...r }); w.close();
}
require('fs').writeFileSync(require("path").join(__dirname, "ket-qua-hai-thang.json"), JSON.stringify(rows, null, 1));
const T = { nha:'Bố mẹ', tro:'Thuê trọ', ghep:'Ở ghép' }, k = v => Math.round(v/1000)+'k';
console.log('Nơi ở | Chi tiêu | Việc | Cách | Số lần nhờ | Phí chậm | Ngày thiếu ăn | Thấp nhất | 16/12 | 10/1 | Nợ còn');
rows.filter(r => r.fam === 'tb').forEach(r => console.log([T[r.bg], r.sp, r.job?'Có':'Chưa', r.strat, r.nho.length, k(r.phi), r.doi, k(r.min), k(r.d31), k(r.d56), k(r.no)].join(' | ')));
console.log('\nCHI TIẾT NHỜ VẢ (tb, có việc, bình thường):');
rows.filter(r => r.fam==='tb' && r.job && r.sp==='Bình thường').forEach(r => console.log(T[r.bg], r.strat, '→', r.nho.join('; ') || '–'));
console.log('\nGIA CẢNH (thuê trọ, có việc, bình thường, phút chót):');
rows.filter(r => r.bg==='tro' && r.job && r.sp==='Bình thường' && r.strat==='phút chót').forEach(r => console.log(r.fam, '→', r.nho.join('; ')||'–', '| 10/1:', k(r.d56)));
