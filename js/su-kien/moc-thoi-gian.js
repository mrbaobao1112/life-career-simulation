/* =========================================================
   CÁC MỐC THEO THỜI GIAN: nhận xét của trưởng nhóm, Tùng trả nợ, tổng kết tháng
   (các mốc tiền bạc: hóa đơn, lương, tiền nhà, trả nợ nằm ở tai-chinh.js và gia-canh-nho-va.js)
   ========================================================= */
BAL.REVIEW_GOOD = 2.6;         // điểm làm việc trung bình mỗi ngày công từ mức này: nhận xét tốt
BAL.REVIEW_OK = 1.6;           // từ mức này: ổn; thấp hơn: bị nhắc nhở
BAL.TUNG_REPAY = { ask:[.45, .35], wait:[.2, .2], again:10 };   // [xác suất trả đủ, xác suất trả một nửa] khi nhắc / không nhắc; hẹn lại sau số ngày

/* ----- Nhận xét của trưởng nhóm (bản ngắn; đánh giá thử việc đầy đủ để dành cho bản sau) ----- */
function reviewDue(){ return !!S.job && !S.flags.review && S.day >= BAL.REVIEW_DAY && dayInfo().wd === 5 && S.stat.workDays >= BAL.REVIEW_MIN_DAYS; }
// Điểm làm việc trung bình mỗi ngày công, trừ bớt khi hay đi muộn
function workScore(perf, days, late){ return perf / Math.max(1, days) - late * .3; }
const workLevel = v => v >= BAL.REVIEW_GOOD ? 'good' : v >= BAL.REVIEW_OK ? 'ok' : 'warn';
SC.review = () => {
  const st = S.stat, lv = workLevel(workScore(S.perf, st.workDays, st.lateWork));
  const open = { good:'“Chị nói nhanh thôi: em làm tốt. Việc giao là xong, ít phải nhắc.”',
                 ok:'“Nhìn chung em bắt nhịp ổn. Còn vài chỗ cần chắc tay hơn.”',
                 warn:'“Chị nói thẳng nhé: mấy tuần đầu của em chưa ổn lắm.”' }[lv];
  const detail = [ st.bugsMade >= 2 ? `Có ${st.bugsMade} lần code của em để lại lỗi.` : st.tasks >= 4 && !st.bugsMade ? 'Code của em đến giờ chưa để lại lỗi nào.' : '',
                   st.lateWork >= 2 ? `Em đi muộn ${st.lateWork} lần rồi.` : '', st.ot >= 2 ? 'Chị có để ý những buổi em ở lại muộn.' : '' ].filter(Boolean).join(' ');
  const done = () => { S.flags.review = lv; if (lv === 'good') { S.mood += 6; rel('boss', 3); } else if (lv === 'warn') S.mood -= 6;
    memo({ good:'Được chị Hạnh khen trong buổi nhận xét đầu tiên', ok:'Buổi nhận xét đầu tiên: tạm ổn', warn:'Bị nhắc nhở trong buổi nhận xét đầu tiên' }[lv]); };
  return { icon:'🧭', title:'Chị Hạnh nhận xét',
    html: P('Chiều thứ Sáu, chị Hạnh gọi bạn vào phòng họp nhỏ.', open, detail),
    choices: [
      { icon:'🙋', label:'“Em muốn thử việc khó hơn ạ.”', fx:() => { done(); rel('boss', 3); S.tech += 1; S.mood -= 1; S.flags.stretch = true;
        return { text:'Chị Hạnh nhướng mày, rồi gật đầu: “Được. Tuần sau chị giao.” Bạn vừa tự thêm việc cho mình.', npcExpr:'happy' }; } },
      { icon:'📝', label:'“Em cần sửa điều gì trước ạ?”', fx:() => { done(); S.soft += 2; rel('boss', 2);
        return st.lateWork >= 2 ? 'Chị nói ngắn gọn: “Đến đúng giờ đã.” Bạn ghi lại, gạch chân hai lần.'
             : st.bugsMade >= 2 ? '“Chậm một chút cũng được, miễn là chắc.” Bạn ghi lại.' : '“Hỏi sớm khi bị kẹt, đừng ôm một mình.” Bạn ghi lại.'; } },
      { icon:'🙂', label:'Cảm ơn chị rồi về chỗ', fx:() => { done(); S.mood += 2; return 'Bạn về chỗ ngồi. Phong nhìn sang, giơ ngón cái hỏi thăm.'; } },
    ] };
};

/* ----- Tùng trả nợ: có thể trả đủ, trả một nửa, hoặc xin khất ----- */
SC.tung_repay = () => {
  const amt = S.flags.loanTung, R = BAL.TUNG_REPAY;
  const settle = ([pFull, pHalf], asked) => {
    const bonus = (S.rel.tung - 50) / 100, r = Math.random();
    if (r < pFull + bonus) { S.money += amt; S.flags.loanTung = 0; rel('tung', 2); memo(`Tùng trả đủ ${fmt(amt)}`);
      return { text:`Tùng chuyển khoản đủ ${fmt(amt)}, kèm một sticker cúi đầu. Hóa ra cũng có ngày này.`, npcExpr:'happy' }; }
    if (r < pFull + pHalf + bonus) { const half = Math.round(amt / 2 / 50000) * 50000 || amt; S.money += half; S.flags.loanTung = amt - half; S.tungDue = S.day + R.again;
      if (!S.flags.loanTung) return `Tùng trả ${fmt(half)}. Coi như xong.`;
      return `Tùng đưa trước ${fmt(half)}: “Chỗ còn lại mười hôm nữa nhé, tao thề.”`; }
    S.tungDue = S.day + R.again; S.mood -= 3; if (asked) rel('tung', -1);
    return asked ? 'Tùng gãi đầu: “Tháng này tao kẹt quá. Mười hôm nữa nhé?” Bạn gật đầu, hơi bực.' : 'Tùng không nhắc gì đến khoản tiền. Bạn cũng chưa mở lời.';
  };
  return { icon:'💰', title:'Khoản Tùng mượn',
    html: P(`Đến hẹn rồi. Tùng còn nợ bạn ${fmt(amt)}.`),
    choices: [
      { icon:'💬', label:'Nhắc khéo Tùng', fx:() => settle(R.ask, true) },
      { icon:'🤐', label:'Chờ Tùng tự nhớ', fx:() => settle(R.wait, false) },
      { icon:'🎁', label:'Bảo Tùng khỏi phải trả', fx:() => { S.flags.loanTung = 0; rel('tung', 8); S.mood += 2; memo(`Cho Tùng luôn ${fmt(amt)}`);
        return { text:'Tùng sững lại, rồi ôm bạn một cái: “Mày là nhất.” Tiền thì mất, bạn thì còn.', npcExpr:'happy' }; } },
    ] };
};

/* ----- Tổng kết tháng: hiện vào sáng ngày 1 ----- */
SC.monthReport = () => {
  const m = S.mPrev || { day:1, ...(S.g0 || S.w0), stat:{} }, end = S.m0 || { ...snap() };
  const x = dateOf(S.day - 1), a = m.day, b = S.day - 1;
  const inRange = d => d >= a && d <= b;
  const spent = Object.entries(S.spend || {}).filter(([d]) => inRange(+d)).reduce((s, [, v]) => s + v, 0);
  const bills = (S.bills || []).filter(z => z.paid && inRange(z.paidDay) && !z.paidBy).reduce((s, z) => s + z.amount, 0);
  const pay = Object.entries(S.income || {}).filter(([d]) => inRange(+d)).reduce((s, [, v]) => s + v, 0);
  const other = end.money - m.money + spent + bills - pay;
  const sl = (S.sleepLog || []).slice(Math.max(0, a - 2), Math.max(0, b - 1)), avgSleep = sl.length ? sl.reduce((p, q) => p + q, 0) / sl.length : 0;
  const wd = (end.stat ? end.stat.workDays || 0 : S.stat.workDays) - (m.stat.workDays || 0);
  const rels = Object.keys(end.rel).map(k => [k, end.rel[k] - (m.rel[k] ?? end.rel[k])]).sort((p, q) => q[1] - p[1]);
  const row = (l, v, sign) => `<div class="hb"><span>${l}</span><span>${sign || ''}${fmt(Math.abs(v))}</span></div>`;
  const st = finStage();
  return { kind:'journal', title:`Tổng kết tháng ${x.getMonth() + 1}`,
    html: `<div class="food">${row('Đầu tháng', m.money)}${pay ? row('Lương', pay, '+') : ''}${row('Ăn uống, đi lại, tiêu vặt', spent, '−')}${bills ? row('Hóa đơn, tiền nhà', bills, '−') : ''}${Math.abs(other) >= 1000 ? row('Vay mượn, hỗ trợ, khoản khác', other, other > 0 ? '+' : '−') : ''}${row('Cuối tháng', end.money)}</div>
      <p>${S.job ? `Đi làm ${wd} ngày.` : 'Vẫn chưa có việc.'}${avgSleep ? ` Ngủ trung bình ${fmtH(Math.round(avgSleep * 4) / 4)} mỗi đêm.` : ''}</p>
      <p>${rels[0] && rels[0][1] > 0 ? `Thân hơn với ${midName(rels[0][0])}.` : ''}${rels.length && rels[rels.length - 1][1] < 0 ? ` Xa hơn với ${midName(rels[rels.length - 1][0])}.` : ''}</p>
      <p>Tình trạng tài chính: ${st.label.toLowerCase()}. Tháng này: hóa đơn ngày 1${S.job ? ', lương ngày 10' : ''}${BAL.BG[S.bg].rent ? ', tiền nhà ngày 16' : ''}.</p>`,
    choices: [{ icon:'📆', label:'Sang tháng mới', fx:() => ({ silent:true }) }] };
};

Object.assign(ART, {
  review: () => ({ bg:'office', npc:'boss' }),
  tung_repay: () => ({ bg:'home', npc:'tung' }),
});
