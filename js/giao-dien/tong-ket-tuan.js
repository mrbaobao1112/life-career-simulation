/* =========================================================
   TỔNG KẾT TUẦN
   ========================================================= */
const BADGES = [
  { icon:'🍜', name:'Vua mì tôm', desc:'Ăn mì tôm từ 3 bữa', test:() => S.stat.miTom >= 3 },
  { icon:'🦉', name:'Cú đêm', desc:'Ngủ sau 0 giờ từ 3 đêm', test:() => S.stat.lateNights >= 3 },
  { icon:'🌙', name:'Chiến binh OT', desc:'OT từ 2 buổi', test:() => S.stat.ot >= 2 },
  { icon:'✨', name:'Code sạch', desc:'Làm từ 4 task mà không để lại lỗi', test:() => S.stat.tasks >= 4 && S.stat.bugsMade === 0 },
  { icon:'💐', name:'Con ngoan', desc:'Quan hệ với bố mẹ từ 75', test:() => S.rel.family >= 75 },
  { icon:'🧊', name:'Đại sứ trà đá', desc:'Có 3 mối quan hệ từ 70', test:() => Object.values(S.rel).filter(v => v >= 70).length >= 3 },
  { icon:'⏰', name:'Chưa từng đi muộn', desc:'Đi làm từ 2 ngày, không muộn lần nào', test:() => S.job && S.stat.workDays >= 2 && S.stat.lateWork === 0 },
  { icon:'📈', name:'Ham học', desc:'Tăng từ 10 điểm chuyên môn', test:() => S.tech - S.w0.tech >= 10 },
  { icon:'🏃', name:'Chạy quanh hồ', desc:'Chạy bộ từ 2 lần', test:() => S.stat.run >= 2 },
  { icon:'🕊️', name:'Tự do', desc:'Hết tuần vẫn chưa có việc', test:() => !S.job },
];

const midName = k => PEOPLE[k].name.replace(/^(Chị|Anh|Bố) /, m => m.toLowerCase());

function renderWeek(){
  updateHUD();
  $('#bars').hidden = true;
  const w0 = S.w0, b = BAL.BG[S.bg];
  const spent = w0.money - S.money;
  const avgSleep = S.sleepLog.length ? S.sleepLog.reduce((x, y) => x + y, 0) / S.sleepLog.length : 8;
  const c = S.job ? COMPANIES[S.job.co] : null;

  // Công việc
  let jobHTML;
  if (c) {
    const perf = S.perf >= 8 ? 'Xuất sắc. Chị Hạnh nhắc tên bạn trong buổi họp cuối tuần.' : S.perf >= 4 ? 'Ổn, có tiềm năng. Chị Hạnh thấy bạn chịu khó.'
               : S.perf >= 1 ? 'Tạm được. Còn đang làm quen.' : 'Chị Hạnh bắt đầu hỏi thăm bạn hơi nhiều.';
    jobHTML = P(`${c.icon} ${c.name} (${c.type}), lương ${fmtTr(S.job.salary)}/tháng.`,
                `Số task đã làm: ${S.stat.tasks}. Lỗi để lại: ${S.stat.bugsMade}. Buổi OT: ${S.stat.ot}. Số lần đi muộn: ${S.stat.lateWork}.`,
                `Đánh giá của trưởng nhóm: ${perf}`,
                S.flags.bugMonday ? 'Còn một lỗi đang chờ bạn vào sáng thứ Hai.' : '');
  } else jobHTML = P('Bạn chưa có việc sau tuần đầu tiên.', S.flags.jobSearch ? 'Bạn đã lưu lại một loạt tin tuyển dụng cho tuần sau.' : 'Tuần sau sẽ là một tuần tìm việc nghiêm túc hơn.');

  // Tài chính
  const st = finStage(), rwN = runway(st.avg), rsN = runway(saverDaily());
  const upB = (S.bills || []).filter(x => !x.paid).sort((x, y) => x.due - y.due).slice(0, 4);
  const finLabel = st.label;
  let finHTML = P(`Đầu tuần ${fmt(w0.money)}, cuối tuần ${fmt(S.money)}. Đã tiêu ${fmt(Math.max(spent, 0))}, trung bình khoảng ${fmt(st.avg)} mỗi ngày.`,
    `Theo cách chi tiêu hiện tại, bạn duy trì được ${rwTxt(rwN)}; nếu tiết kiệm tối đa, ${rwTxt(rsN)}.`,
    c ? `Lương tháng 11 dự kiến ${fmt(payFor(25).amount)} (${payFor(25).days} ngày công, thử việc 85%), về ngày 10/12.` : 'Bạn chưa có thu nhập.');
  if (upB.length) finHTML += `<p class="muted">Các khoản sắp đến hạn:</p><div class="food">${billsHTML(upB)}</div>`;
  finHTML += P(`Tình trạng tài chính: <b>${finLabel}</b>.`, S.flags.loanTung ? `Tùng đang nợ bạn ${fmt(S.flags.loanTung)}. Hạn trả: “cuối tháng”.` : '');

  // Quan hệ
  const met = Object.keys(PEOPLE).filter(k => !PEOPLE[k].work || (S.job && S.day >= S.job.start));
  const relRows = met.map(k => { const d = S.rel[k] - w0.rel[k]; const v = S.rel[k];
    return `<div class="rel-row"><span aria-hidden="true">${PEOPLE[k].icon}</span><span>${PEOPLE[k].name}</span>
      <div class="bar"><i class="${v < 30 ? 'low' : v < 55 ? 'mid' : ''}" style="width:${v}%"></i></div>
      <span class="dv ${d > 0 ? 'good' : d < 0 ? 'bad' : ''}">${d > 0 ? '+' : d < 0 ? '−' : ''}${d ? Math.abs(d) : '0'}</span></div>`; }).join('');
  const deltas = met.map(k => [k, S.rel[k] - w0.rel[k]]).sort((x, y) => y[1] - x[1]);

  // Câu chuyện
  const story = [];
  story.push(c ? `Tuần đầu tiên sau tốt nghiệp khép lại với một công việc ở ${c.name}.` : 'Tuần đầu tiên sau tốt nghiệp khép lại mà bạn vẫn chưa có việc, nhưng ít nhất bạn đã biết phỏng vấn trông như thế nào.');
  story.push(avgSleep < 6 ? `Trung bình mỗi đêm bạn ngủ ${fmtH(avgSleep)}, ít như dân kế toán mùa quyết toán.`
            : avgSleep >= 7.5 ? `Bạn ngủ trung bình ${fmtH(avgSleep)} mỗi đêm, đều đặn đến mức đáng ngưỡng mộ.`
            : `Giấc ngủ trung bình ${fmtH(avgSleep)} mỗi đêm, ở mức “tạm chấp nhận được”.`);
  if (deltas[0] && deltas[0][1] > 0) story.push(`Người thân thiết với bạn hơn nhiều nhất tuần này là ${midName(deltas[0][0])}.`);
  const worst = deltas[deltas.length - 1];
  if (worst && worst[1] < 0) story.push(`Còn ${midName(worst[0])} thì có vẻ hơi phật lòng.`);
  if (S.stat.miTom >= 3) story.push('Mì tôm đã trở thành một phần quan trọng của cuộc sống.');
  else if (S.nutr >= 65) story.push('Bạn ăn uống khá tử tế, điều mà không phải người mới ra trường nào cũng làm được.');
  if (S.flags.liedSalary) story.push('Cả xóm đang tin rằng lương của bạn cao hơn thực tế. Áp lực đã bắt đầu.');
  story.push('Tuần sau sẽ ra sao? Đó là câu hỏi của bản đầy đủ.');

  const badges = BADGES.filter(x => x.test());
  const memoHTML = S.memo.length ? `<ul class="memo">${S.memo.map(m => `<li><b>${DAYS[m.day].dow}:</b> ${m.text}</li>`).join('')}</ul>` : P('Một tuần trôi qua khá êm ả.');
  const statLine = (k, ic) => { const d = S[k] - w0[k]; return `<span class="chip ${d > 0 ? 'good' : d < 0 ? 'bad' : ''}">${ic} ${LBL[k]} ${S[k]} (${d >= 0 ? '+' : '−'}${Math.abs(d)})</span>`; };

  $('#stage').innerHTML = `<article class="scene report">
    <div class="hero">${chibiSVG(playerLook('casual'), S.mood >= 60 ? 'happy' : S.mood < 35 ? 'sad' : 'neutral', { label:'Nhân vật cuối tuần' })}</div>
    <h2>Tổng kết tuần đầu tiên</h2>
    <p style="color:var(--muted)">${esc(S.name)}, 22 tuổi, Hà Thành.</p>
    <div class="journal story"><p>${story.join(' ')}</p></div>
    <h3>Công việc</h3>${jobHTML}
    <h3>Tiền bạc</h3>${finHTML}
    <h3>Bản thân</h3>
    <div class="chips">${statLine('health','❤️')}${statLine('mood','🙂')}${statLine('tech','🧠')}${statLine('soft','🗣️')}</div>
    <p>Ăn uống: ${nutrWord()}. Mì tôm: ${S.stat.miTom} bữa. Số đêm ngủ sau 0 giờ: ${S.stat.lateNights}.</p>
    ${foodHTML()}
    <h3>Các mối quan hệ</h3>${relRows}
    <h3>Danh hiệu</h3>
    ${badges.length ? `<div class="badges">${badges.map(x => `<div class="badge"><b>${x.icon} ${x.name}</b><span>${x.desc}</span></div>`).join('')}</div>` : P('Chưa có danh hiệu nào. Thử một cách sống khác xem sao.')}
    <p style="color:var(--muted);font-size:14px">Đã mở ${badges.length}/${BADGES.length} danh hiệu.</p>
    <h3>Những quyết định đáng nhớ</h3>${memoHTML}
    <button class="btn" type="button" id="again">Chơi lại với lựa chọn khác</button>
  </article>`;
  $('#again').addEventListener('click', () => { wipe(); S = null; renderTitle(); });
  window.scrollTo({ top:0 });
}

