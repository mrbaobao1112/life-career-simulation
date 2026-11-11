/* =========================================================
   TỔNG KẾT TUẦN
   ========================================================= */
const BADGES = [
  { icon:'🍜', name:'Vua mì tôm', desc:'Ăn mì tôm từ 3 bữa trong tuần', test:() => W('miTom') >= 3 },
  { icon:'🦉', name:'Cú đêm', desc:'Ngủ sau 0 giờ từ 3 đêm trong tuần', test:() => W('lateNights') >= 3 },
  { icon:'🌙', name:'Chiến binh OT', desc:'OT từ 2 buổi trong tuần', test:() => W('ot') >= 2 },
  { icon:'✨', name:'Code sạch', desc:'Làm từ 4 task mà không để lại lỗi', test:() => W('tasks') >= 4 && W('bugsMade') === 0 },
  { icon:'💐', name:'Con ngoan', desc:'Quan hệ với bố mẹ từ 75', test:() => S.rel.family >= 75 },
  { icon:'🧊', name:'Đại sứ trà đá', desc:'Có 3 mối quan hệ từ 70', test:() => Object.values(S.rel).filter(v => v >= 70).length >= 3 },
  { icon:'⏰', name:'Chưa từng đi muộn', desc:'Đi làm từ 2 ngày, không muộn lần nào', test:() => S.job && W('workDays') >= 2 && W('lateWork') === 0 },
  { icon:'📈', name:'Ham học', desc:'Tăng từ 10 điểm chuyên môn trong tuần', test:() => S.tech - S.w0.tech >= 10 },
  { icon:'🏃', name:'Chạy quanh hồ', desc:'Chạy bộ từ 2 lần', test:() => W('run') >= 2 },
  { icon:'🕊️', name:'Tự do', desc:'Hết tuần vẫn chưa có việc', test:() => !S.job },
];

const midName = k => PEOPLE[k].name.replace(/^(Chị|Anh|Bố) /, m => m.toLowerCase());

function renderWeek(){
  stageStop();
  updateHUD();
  $('#bars').hidden = true;
  const w0 = S.w0, b = BAL.BG[S.bg];
  const spent = w0.money - S.money;
  const wk = weekOf(), ws = weekStart(), end = S.phase === 'end', g0 = S.g0 || w0;
  const sl = S.sleepLog.slice(Math.max(0, ws - 2)), avgSleep = sl.length ? sl.reduce((x, y) => x + y, 0) / sl.length : 8;
  const perfW = S.perf - ((S.ws0 || {}).perf || 0), lvW = workLevel(workScore(perfW, W('workDays'), W('lateWork')));
  const c = S.job ? COMPANIES[S.job.co] : null;

  // Công việc
  let jobHTML;
  if (c) {
    const perf = !W('workDays') ? 'Tuần này chưa có ngày công nào.' : lvW === 'good' ? 'Xuất sắc. Chị Hạnh nhắc tên bạn trong buổi họp cuối tuần.' : lvW === 'ok' ? 'Ổn, có tiềm năng. Chị Hạnh thấy bạn chịu khó.'
               : perfW >= 1 ? 'Tạm được. Còn đang làm quen.' : 'Chị Hạnh bắt đầu hỏi thăm bạn hơi nhiều.';
    jobHTML = P(`${c.icon} ${c.name} (${c.type}), lương ${fmtTr(S.job.salary)}/tháng.`,
                `Tuần này: ${W('workDays')} ngày công, ${W('tasks')} task. Lỗi để lại: ${W('bugsMade')}. Buổi OT: ${W('ot')}. Đi muộn: ${W('lateWork')} lần.`,
                `Trưởng nhóm: ${perf}`,
                S.flags.bugMonday ? 'Còn một lỗi đang chờ bạn vào sáng thứ Hai.' : '');
  } else jobHTML = P(wk === 1 ? 'Bạn chưa có việc sau tuần đầu tiên.' : 'Bạn vẫn chưa có việc.', end ? '' : reapplyList().length ? 'Thứ Hai tới có đợt tin tuyển dụng mới.' : 'Các tin tuyển dụng phù hợp đã hết. Đành chờ thêm.');

  // Tài chính
  const st = finStage(), rwN = runway(st.avg), rsN = runway(saverDaily());
  const upB = (S.bills || []).filter(x => !x.paid).sort((x, y) => x.due - y.due).slice(0, 4);
  const finLabel = st.label;
  let finHTML = P(`Đầu tuần ${fmt(w0.money)}, cuối tuần ${fmt(S.money)}. Đã tiêu ${fmt(Math.max(spent, 0))}, trung bình khoảng ${fmt(st.avg)} mỗi ngày.`,
    `Theo cách chi tiêu hiện tại, bạn duy trì được ${rwTxt(rwN)}; nếu tiết kiệm tối đa, ${rwTxt(rsN)}.`,
    c ? (() => { const np = nextPaydayAfter(S.day), pp = payFor(np); return `Kỳ lương tới (${fmtD(np)}) dự kiến ${fmt(pp.amount)}: ${pp.days} ngày công${pp.rate < 1 ? ', thử việc 85%' : ''}.`; })() : 'Bạn chưa có thu nhập.');
  if (upB.length) finHTML += `<p class="muted">Các khoản sắp đến hạn:</p><div class="food">${billsHTML(upB)}</div>`;
  finHTML += P(`Tình trạng tài chính: <b>${finLabel}</b>.`, S.flags.loanTung ? `Tùng đang nợ bạn ${fmt(S.flags.loanTung)}. Hẹn trả: ${fmtD(S.tungDue || 15)}.` : '');

  // Quan hệ
  const met = Object.keys(PEOPLE).filter(k => !PEOPLE[k].work || (S.job && S.day >= S.job.start));
  const relRows = met.map(k => { const d = S.rel[k] - w0.rel[k]; const v = S.rel[k];
    return `<div class="rel-row"><span aria-hidden="true">${PEOPLE[k].icon}</span><span>${PEOPLE[k].name}</span>
      <div class="bar"><i class="${v < 30 ? 'low' : v < 55 ? 'mid' : ''}" style="width:${v}%"></i></div>
      <span class="dv ${d > 0 ? 'good' : d < 0 ? 'bad' : ''}">${d > 0 ? '+' : d < 0 ? '−' : ''}${d ? Math.abs(d) : '0'}</span></div>`; }).join('');
  const deltas = met.map(k => [k, S.rel[k] - w0.rel[k]]).sort((x, y) => y[1] - x[1]);

  // Câu chuyện
  const story = [];
  if (wk === 1) story.push(c ? `Tuần đầu tiên sau tốt nghiệp khép lại với một công việc ở ${c.name}.` : 'Tuần đầu tiên sau tốt nghiệp khép lại mà bạn vẫn chưa có việc, nhưng ít nhất bạn đã biết phỏng vấn trông như thế nào.');
  else story.push(c ? `Tuần thứ ${wk} ở Hà Thành, tuần này bạn đi làm ${W('workDays')} ngày ở ${c.name}.` : `Tuần thứ ${wk} ở Hà Thành trôi qua, bạn vẫn đang tìm việc.`);
  story.push(avgSleep < 6 ? `Trung bình mỗi đêm bạn ngủ ${fmtH(avgSleep)}, ít như dân kế toán mùa quyết toán.`
            : avgSleep >= 7.5 ? `Bạn ngủ trung bình ${fmtH(avgSleep)} mỗi đêm, đều đặn đến mức đáng ngưỡng mộ.`
            : `Giấc ngủ trung bình ${fmtH(avgSleep)} mỗi đêm, ở mức “tạm chấp nhận được”.`);
  if (deltas[0] && deltas[0][1] > 0) story.push(`Người thân thiết với bạn hơn nhiều nhất tuần này là ${midName(deltas[0][0])}.`);
  const worst = deltas[deltas.length - 1];
  if (worst && worst[1] < 0) story.push(`Còn ${midName(worst[0])} thì có vẻ hơi phật lòng.`);
  if (W('miTom') >= 3) story.push('Mì tôm đã trở thành một phần quan trọng của cuộc sống.');
  else if (S.nutr >= 65) story.push('Bạn ăn uống khá tử tế, điều mà không phải người mới ra trường nào cũng làm được.');
  if (S.flags.liedSalary) story.push('Cả xóm đang tin rằng lương của bạn cao hơn thực tế. Áp lực đã bắt đầu.');
  if (end) story.push('Bản chơi thử dừng ở đây: tám tuần đầu tiên của một người mới ra trường.');
  else if (wk === 1) story.push('Phía trước là tháng đầu tiên tự lo: hóa đơn ngày 1, lương ngày 10, tiền nhà ngày 16.');

  const badges = BADGES.filter(x => x.test());
  const memos = S.memo.filter(m => m.day >= ws);
  const memoHTML = memos.length ? `<ul class="memo">${memos.map(m => `<li><b>${dayInfo(m.day).dow}:</b> ${m.text}</li>`).join('')}</ul>` : P('Một tuần trôi qua khá êm ả.');
  const statLine = (k, ic) => { const d = S[k] - w0[k]; return `<span class="chip ${d > 0 ? 'good' : d < 0 ? 'bad' : ''}">${ic} ${LBL[k]} ${S[k]} (${d >= 0 ? '+' : '−'}${Math.abs(d)})</span>`; };

  $('#stage').innerHTML = `<article class="scene report">
    <div class="hero">${chibiSVG(playerLook('casual'), S.mood >= 60 ? 'happy' : S.mood < 35 ? 'sad' : 'neutral', { label:'Nhân vật cuối tuần' })}</div>
    <h2>${end ? 'Kết thúc bản chơi thử' : wk === 1 ? 'Tổng kết tuần đầu tiên' : `Tổng kết tuần ${wk}`}</h2>
    <p style="color:var(--muted)">${esc(S.name)}, 22 tuổi, Hà Thành. ${fmtD(ws)} đến ${fmtD(S.day)}.</p>
    <div class="journal story"><p>${story.join(' ')}</p></div>
    <h3>Công việc</h3>${jobHTML}
    <h3>Tiền bạc</h3>${finHTML}
    <h3>Bản thân</h3>
    <div class="chips">${statLine('health','❤️')}${statLine('mood','🙂')}${statLine('tech','🧠')}${statLine('soft','🗣️')}</div>
    <p>Ăn uống: ${nutrWord()}. Mì tôm: ${W('miTom')} bữa. Số đêm ngủ sau 0 giờ: ${W('lateNights')}.</p>
    ${foodHTML()}
    <h3>Các mối quan hệ</h3>${relRows}
    <h3>Danh hiệu</h3>
    ${badges.length ? `<div class="badges">${badges.map(x => `<div class="badge"><b>${x.icon} ${x.name}</b><span>${x.desc}</span></div>`).join('')}</div>` : P('Chưa có danh hiệu nào. Thử một cách sống khác xem sao.')}
    <p style="color:var(--muted);font-size:14px">Đã mở ${badges.length}/${BADGES.length} danh hiệu.</p>
    <h3>Những quyết định đáng nhớ</h3>${memoHTML}
    ${end ? `<h3>Cả chặng đường, từ 16/11 đến ${fmtD(S.day)}</h3>
      <div class="food"><div class="hb"><span>Số dư lúc bắt đầu</span><span>${fmt(g0.money)}</span></div><div class="hb"><span>Số dư bây giờ</span><span>${fmt(S.money)}</span></div>
      <div class="hb"><span>Số lần nhận lương</span><span>${S.flags.paidCount || 0}</span></div><div class="hb"><span>Tổng ngày công</span><span>${S.stat.workDays}</span></div>
      <div class="hb"><span>Chuyên môn</span><span>${g0.tech} → ${S.tech}</span></div><div class="hb"><span>Kỹ năng mềm</span><span>${g0.soft} → ${S.soft}</span></div>
      <div class="hb"><span>Nợ còn lại</span><span>${fmt(openLoans().reduce((s, L) => s + L.amount, 0))}</span></div></div>
      <button class="btn" type="button" id="again">Chơi lại với lựa chọn khác</button>`
      : '<button class="btn" type="button" id="nextWeek">Sang tuần mới</button>'}
  </article>`;
  if (end) $('#again').addEventListener('click', () => { wipe(); S = null; renderTitle(); });
  else $('#nextWeek').addEventListener('click', () => { S.phase = 'play'; startDay(); updateHUD(true); });
  window.scrollTo({ top:0 });
}

