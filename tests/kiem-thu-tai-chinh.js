const { JSDOM } = require('jsdom');
const html = require("fs").readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
const mk = () => new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
  beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; } }).window;
// 1. Sổ hóa đơn: không trừ hai lần
{ const w = mk(); const r = w.eval(`newGame('A','nam','tro', defaultLook('nam'), 'tb'); S.money = 10e6; const log=[];
  for (let d=2; d<=31; d++){ S.day=d; processFinance(); if (d===16||d===31){ const before=S.money; const saved=JSON.parse(JSON.stringify(S)); S.finDay=0; processFinance(); const again=S.money; S=saved; S.finDay=0; processFinance(); log.push({d, sauTaiLai:S.money, lan2:again, truoc:before}); } }
  JSON.stringify({ hoaDon:S.bills.map(b=>b.id+':'+(b.paid?'đã trả ngày '+b.paidDay:'chưa')), soDu:S.money, kiemTraTaiLai:log })`);
  console.log('SỔ HÓA ĐƠN:', r); }
// số dư đúng bằng hóa đơn, nhiều hóa đơn cùng ngày
{ const w = mk(); console.log('BIÊN:', w.eval(`newGame('A','nam','tro', defaultLook('nam'), 'tb'); S.day=16; S.money=500000; const e=processFinance(); JSON.stringify({ soDu:S.money, suKien:e.map(x=>x.id), traDu:S.bills.filter(b=>b.paid).length })`)); }
// 2. Mô phỏng cả tháng
const SPEND = { 'Tiết kiệm':'SAVER', 'Bình thường':'NORMAL', 'Thoải mái':275000 };
const rows = [], famRows = [];
for (const bg of ['nha','tro','ghep']) for (const sp of Object.keys(SPEND)) for (const job of [true,false]) for (const fam of ['tb','kha','kho']) {
  const w = mk();
  const r = JSON.parse(w.eval(`(() => { newGame('A','nam','${bg}', defaultLook('nam'), '${fam}'); S.rel.tung = 60; S.rel.linh = 60;
    if (${job}) S.job = { co:'hotay', salary:10000000, start:3 };
    const daily = ${typeof SPEND[sp]==='string' ? `FIN.${SPEND[sp]}['${bg}']` : SPEND[sp]};
    const out = { worried:null, tense:null, short:null, d25:null, d31:null, loiRa:[], doiBua:0 };
    for (let d = 2; d <= 31; d++) {
      S.day = d; const wd = dateOf(d).getDay(); 
      if (S.job && d >= 3 && wd >= 1 && wd <= 5) { const f = Math.min(FIN.FUEL, S.money); S.money -= f; spendLog(f); }
      const ev = processFinance();
      if (ev.some(e => e.id === 'payday') && '${bg}' === 'nha') { S.money -= FIN.HOUSE_CONTRIB; spendLog(FIN.HOUSE_CONTRIB); }
      for (const e of ev.filter(e => e.id === 'bill_short')) {
        const sc = SC.bill_short(e.arg); const ch = sc.choices.find(c => !c.disabled); out.loiRa.push(fmtD(d) + ' ' + ch.label.replace(/ \\d.*$/,'').slice(0,28)); ch.fx();
      }
      const spend = Math.min(daily, Math.max(0, S.money)); if (spend < daily) out.doiBua++; S.money -= spend; spendLog(spend);
      const st = finStage().key;
      if (st !== 'stable' && out.worried === null) out.worried = fmtD(d);
      if ((st === 'tense' || st === 'short') && out.tense === null) out.tense = fmtD(d);
      if (st === 'short' && out.short === null) out.short = fmtD(d);
      if (d === 25) out.d25 = S.money; if (d === 31) out.d31 = S.money;
    }
    out.trungLap = S.bills.filter(b => b.paid).length !== new Set(S.bills.filter(b => b.paid).map(b => b.id)).size;
    return JSON.stringify(out); })()`));
  const tag = { nha:'Bố mẹ', tro:'Thuê trọ', ghep:'Ở ghép' }[bg];
  if (fam === 'tb') rows.push({ 'Nơi ở':tag, 'Chi tiêu':sp, 'Việc':job?'Có việc sớm':'Chưa có việc', 'Bắt đầu lo':r.worried||'–', 'Căng thẳng':r.tense||'–', 'Thiếu tiền':r.short||'–', 'Số dư 10/12':Math.round(r.d25/1000)+'k', 'Số dư 16/12':Math.round(r.d31/1000)+'k', 'Ngày thiếu tiền ăn':r.doiBua, 'Lối ra đã dùng':r.loiRa.join('; ')||'–', 'Trừ trùng':r.trungLap?'CÓ':'không' });
  if (r.loiRa.length) famRows.push({ 'Nơi ở':tag, 'Chi tiêu':sp, 'Việc':job?'Có việc':'Chưa', 'Gia cảnh':fam, 'Số dư 16/12':Math.round(r.d31/1000)+'k', 'Lối ra':r.loiRa.join('; ') });
  w.close();
}
require('fs').writeFileSync('" + require("path").join(__dirname, "ket-qua-tai-chinh.json") + "', JSON.stringify({ rows, famRows }, null, 1));
console.table(rows.map(r => { const { ['Lối ra đã dùng']:x, ...rest } = r; return rest; }));
console.log('LỐI RA (gia đình bình thường):'); rows.filter(r => r['Lối ra đã dùng'] !== '–').forEach(r => console.log(' ', r['Nơi ở'], r['Chi tiêu'], r['Việc'], '→', r['Lối ra đã dùng']));
