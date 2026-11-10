/* ----- v5: Gia cảnh, lối ra khi thiếu tiền, ngày lương ----- */
const FAMILY = {
  kha: { name:'Gia đình khá giả', icon:'🏡', desc:'Bố mẹ có điều kiện và nhiều mối quen. Hỗ trợ được khi cần, đổi lại là những kỳ vọng không nhỏ.',
    helpDesc:'Bố mẹ hỗ trợ được khá nhiều, nhưng mỗi lần xin là một lần thấy mình chưa tự lập.',
    help:{ max:3000000, mood:-6, rel:-1, text:(a, ok) => `Bố chuyển khoản ${fmt(a)} ngay, kèm câu: “Bao giờ con mới tự lo được hả con?”${ok ? '' : ' Vẫn chưa đủ để trả hóa đơn.'}` } },
  tb:  { name:'Gia đình bình thường', icon:'🏠', desc:'Bố mẹ đủ sống, hỗ trợ được một ít khi thật cần. Phần lớn con đường phía trước là của bạn.',
    helpDesc:'Bố mẹ hỗ trợ được một khoản nhỏ, kèm nhiều lời dặn dò.',
    help:{ max:1500000, mood:-3, rel:-2, text:(a, ok) => `Mẹ chuyển ${fmt(a)}, dặn: “Tiêu cho cẩn thận, bố mẹ cũng phải tính.”${ok ? '' : ' Vẫn chưa đủ để trả hóa đơn.'}` } },
  kho: { name:'Gia đình khó khăn', icon:'🌱', desc:'Bố mẹ vất vả, khó hỗ trợ tiền bạc. Bù lại, bạn có một động lực rất rõ ràng để cố gắng.',
    helpDesc:'Bố mẹ gần như không thể hỗ trợ, và xin tiền khiến bạn rất áy náy.',
    help:{ max:300000, mood:-8, rel:0, text:(a, ok) => `Mẹ gom được ${fmt(a)} gửi lên. Bạn biết đó là tiền mẹ để dành mua thuốc.${ok ? '' : ' Vẫn chưa đủ để trả hóa đơn.'}` } },
};
SC.bill_short = (id) => {
  const b = (S.bills || []).find(x => x.id === id);
  if (!b || b.paid) return { icon:'✅', title:'Hóa đơn đã được trả', html:P('Khoản này đã được thanh toán.'), choices:[{ icon:'👍', label:'Tiếp tục', fx:() => ({ silent:true }) }] };
  const need = b.amount - S.money, c = [];
  for (const o of planOptions(true)) if (o.key !== 'landlord' && !(o.key === 'tung' && b.kind !== 'rent')) c.push({ icon:o.icon, label:o.label, desc:o.desc, hints:o.hints, noSpend:true, fx:() => { const t = o.run(); const ok = payBill(b); return (typeof t === 'string' ? t : t.text || '') + (b.paid ? ` Đã trả xong ${b.name.toLowerCase()}.` : ` Vẫn còn thiếu ${fmt(b.amount - S.money)}.`); } });
  if (b.kind === 'rent' && !b.delayed) {
    c.push({ icon:'🙏', label:`Xin ${LANDLORD()} nộp chậm 5 ngày`, noSpend:true, hints:[`💸 Hỏi sát hạn: phí ${Math.round(FIN.LATE_FEE * 100)}% (+${fmt(Math.round(b.amount * FIN.LATE_FEE))})`, '🙂 −3'],
      fx:() => { b.delayed = 'late'; b.due = S.day + 5; b.amount = Math.round(b.amount * (1 + FIN.LATE_FEE)); b.alerted = false; S.mood -= 3; memo(`Xin nộp chậm ${b.name.toLowerCase()} sát hạn`);
        return `${cap1(LANDLORD())} đồng ý, kèm một bài giảng ngắn về “tuổi trẻ phải biết lo xa” và phí chậm. Hạn mới: ${fmtD(b.due)}.`; } });
  }
  c.push({ icon:'📝', label:'Chưa trả được, xin khất', noSpend:true, hints:['🙂 −10','Tự trả khi đủ tiền'],
    fx:() => { S.mood -= 10; b.debt = true; memo(`Khất ${b.name.toLowerCase()}`);
      return 'Bạn nhắn xin khất. Cả ngày hôm đó, mỗi lần điện thoại rung bạn lại giật mình.'; } });
  return { icon:'🧾', title:`Không đủ tiền trả ${b.name.toLowerCase()}`,
    html:P(`Hôm nay đến hạn ${b.name.toLowerCase()}: <b>${fmt(b.amount)}</b>. Bạn chỉ có ${fmt(S.money)}, còn thiếu <b>${fmt(need)}</b>.`, '<span class="tip">Nhờ vả vào phút chót thường đắt hơn và khó được đồng ý hơn thu xếp sớm.</span>'), choices:c };
};
SC.payday = () => ({ icon:'💰', title:'Ngày nhận lương',
  html:P(`Tin nhắn ngân hàng: tài khoản <b>+${fmt((S.lastPay || {}).amount || 0)}</b>. Bạn đọc đi đọc lại con số ba lần.`, S.lastPay ? `Bảng lương: ${payLine(S.lastPay)}.` : '', S.lastPay && S.lastPay.days < S.lastPay.full ? 'Tháng đầu đi làm chưa đủ ngày công, lại đang thử việc, nên con số khiêm tốn hơn bạn tưởng.' : ''),
  choices:[{ icon:'🎉', label:'Tuyệt vời!', fx:() => ({ text:'Lần đầu tiên trong đời, bạn có một khoản tiền do chính mình làm ra.', meExpr:'happy' }) }] });
SC.house_contrib = () => ({ icon:'🍲', title:'Tiền chợ',
  html:P(`Tối hôm nhận lương, mẹ ngồi xuống cạnh bạn: “Giờ con đi làm rồi, góp với bố mẹ ít tiền chợ nhé. ${fmtTr(FIN.HOUSE_CONTRIB)} một tháng thôi.”`),
  choices:[
    { icon:'💵', label:`Góp ${fmtTr(FIN.HOUSE_CONTRIB)}`, cost:FIN.HOUSE_CONTRIB, hints:['🤝 +Bố mẹ'], fx:() => { rel('family',6); S.mood += 3; memo('Góp tiền chợ với bố mẹ');
      return 'Mẹ cầm tiền, không nói gì, nhưng tối đó mâm cơm có thêm đĩa thịt kho trứng.'; } },
    { icon:'🪙', label:`Góp ${fmt(FIN.HOUSE_CONTRIB / 2)} thôi ạ`, cost:FIN.HOUSE_CONTRIB / 2, fx:() => { rel('family',1); return 'Mẹ gật đầu: “Ừ, tháng đầu còn nhiều khoản.”'; } },
    { icon:'⏳', label:'Xin để tháng sau', hints:['🤝 −Bố mẹ'], fx:() => { rel('family',-6); S.mood -= 2; return 'Mẹ bảo “ừ”. Bố không nói gì cả bữa cơm.'; } },
  ] });
SC.fam_send = () => ({ icon:'📮', title:'Gửi tiền về nhà',
  html:P('Lương về. Bạn nhớ lời hứa với mẹ về học phí của em.'),
  choices:[
    { icon:'💵', label:'Gửi về 1.000.000đ', cost:1000000, hints:['🙂 +8','🤝 +Bố mẹ'], fx:() => { rel('family',6); S.mood += 8; memo('Gửi tiền về giúp gia đình');
      return { text:'Mẹ gọi lại ngay, giọng nghèn nghẹn. Em bạn nhắn: “Em cảm ơn!” kèm mười cái sticker.', meExpr:'happy' }; } },
    { icon:'🪙', label:'Gửi về 500.000đ', cost:500000, hints:['🙂 +4'], fx:() => { rel('family',3); S.mood += 4; return 'Mẹ bảo thế là quý lắm rồi.'; } },
    { icon:'😔', label:'Tháng này chưa gửi được', hints:['🙂 −4'], fx:() => { rel('family',-4); S.mood -= 4; return 'Mẹ bảo không sao. Bạn thì thấy có sao.'; } },
  ] });
Object.assign(EVENTS, {
  fam_kha: { build:() => ({ icon:'🏡', title:'Bố có một mối quen', html:'', choices:[
    { icon:'💪', label:'“Con cảm ơn bố, nhưng con muốn tự mình thử đã.”', fx:() => { rel('family',-1); S.mood += 4; S.flags.selfMade = true; memo('Từ chối nhờ quan hệ của bố');
      return 'Bố im lặng một lúc rồi bảo: “Ừ, tùy con. Nhưng đừng để bố mẹ phải lo.” Bạn thấy nhẹ nhõm, kèm một chút áp lực.'; } },
    { icon:'🤔', label:'“Để con suy nghĩ thêm ạ.”', fx:() => { rel('family',1); return 'Bố gật gù. Bạn biết câu chuyện này sẽ còn quay lại.'; } },
    { icon:'🤝', label:'“Bố nói giúp con với.”', fx:() => { rel('family',5); S.mood -= 2; S.flags.famConnect = true; memo('Nhờ bố giới thiệu việc ở ngân hàng');
      return 'Bố vui ra mặt. Mẹ đã kịp gọi cho bác Hùng trước khi bạn ăn xong bát cơm.'; } },
  ] }) },
  fam_tb: { build:() => ({ icon:'🏠', title:'Mẹ hỏi chuyện chi tiêu', html:'', choices:[
    { icon:'🧮', label:'Kể thật số tiền đã tiêu', fx:() => { rel('family',3); const t = Object.values(S.spend || {}).reduce((a, b) => a + b, 0);
      return `Bạn kể: từ đầu tuần đã tiêu ${fmt(t)}. Mẹ không trách, chỉ dặn bớt gọi đồ ăn qua ứng dụng.`; } },
    { icon:'✉️', label:'Cùng mẹ lập kế hoạch chi tiêu', fx:() => { rel('family',4); S.soft += 1; S.mood += 2;
      return 'Mẹ chỉ cho bạn cách chia tiền vào ba phong bì: ăn uống, tiền nhà, để dành. Một phương pháp không cần ứng dụng nào.'; } },
    { icon:'😶', label:'Ậm ừ cho qua', fx:() => { rel('family',-2); return 'Mẹ thở dài: “Thôi, lớn rồi, tự biết.” Câu này nghe nhẹ mà không nhẹ.'; } },
  ] }) },
  fam_kho: { build:() => ({ icon:'🌱', title:'Học phí của em', html:'', choices:[
    { icon:'🤞', label:'“Có lương con gửi về mẹ nhé.”', fx:() => { rel('family',5); S.mood += 4; S.flags.dutyPromise = true; memo('Hứa gửi tiền về đóng học phí cho em');
      return 'Mẹ bảo không cần, nhưng giọng mẹ nhẹ hẳn đi. Bạn có thêm một lý do để cố gắng.'; } },
    { icon:'💵', label:'Gửi ngay 300.000đ', cost:300000, fx:() => { rel('family',6); S.mood += 6;
      return 'Số tiền không nhiều, nhưng mẹ nhắn lại một tin rất dài. Bạn đọc đến cuối thì cay mắt.'; } },
    { icon:'⏳', label:'“Mẹ đợi con ổn định đã nhé.”', fx:() => { rel('family',-1); S.mood -= 3;
      return 'Mẹ bảo “ừ, con lo cho mình trước”. Bạn biết mẹ nói thật, nhưng vẫn thấy áy náy.'; } },
  ] }) },
});

/* ----- v6: kế hoạch tháng đầu, trả nợ ----- */
const LANDLORD = () => S.bg === 'tro' ? 'bà chủ trọ' : 'chủ nhà';
const cap1 = t => t[0].toUpperCase() + t.slice(1);
function planOptions(late){
  const mk = monthKey(), F = FAMILY[S.fam] || FAMILY.tb, opts = [], rb = nextRentBill();
  if (!(S.famHelp || {})[mk]) {
    const mood = late ? F.help.mood : Math.round(F.help.mood * FIN.FAM_EARLY_MOOD);
    opts.push({ key:'family', icon:'👪', label: late ? 'Gọi điện xin bố mẹ hỗ trợ' : 'Gọi về nhà xin hỗ trợ tháng đầu', desc:F.helpDesc, noSpend:true,
      hints:[`💰 ${S.fam === 'tb' ? 'Mẹ cho vay' : 'Tối đa'} ${fmt(F.help.max)}`, `🙂 ${mood}`, ...(S.fam === 'tb' ? ['Hẹn trả khi có lương'] : [])],
      run:() => { S.famHelp = { ...(S.famHelp || {}), [mk]:true }; const amt = F.help.max; S.money += amt; S.mood += mood; rel('family', late ? F.help.rel : Math.ceil(F.help.rel / 2));
        if (S.fam === 'tb') addLoan('family', amt, nextPaydayAfter(S.day), 'Mẹ cho vay');
        memo(`${late ? 'Xin' : 'Chủ động xin'} bố mẹ ${fmt(amt)}`);
        return late ? F.help.text(amt, true) : { kha:`Bố chuyển ${fmt(amt)} kèm lời dặn: “Tự lập thì tốt, nhưng đừng để đói.” Bạn hơi ngại, nhưng nhẹ người hẳn.`,
          tb:`Mẹ chuyển ${fmt(amt)}: “Mẹ cho vay, có lương thì trả mẹ. Tiêu cẩn thận nhé.”`, kho:`Mẹ gửi lên ${fmt(amt)} và một túi gạo. Bạn hứa với lòng sẽ sớm gửi lại gấp đôi.` }[S.fam]; } });
  }
  if (rb && !rb.delayed && !rb.paid) {
    const left = rb.due - S.day;
    if (!late && left >= FIN.EARLY_DAYS) {
      const nd = nextPaydayAfter(rb.due) + 1;
      opts.push({ key:'landlord', icon:'🙏', label:`Hẹn ${LANDLORD()} đóng ${rb.name.toLowerCase()} vào ngày lương (${fmtD(nd)})`, noSpend:true, hints:['✅ Hỏi sớm: không mất phí', `📅 Hạn cũ ${fmtD(rb.due)}`],
        run:() => { rb.delayed = 'early'; rb.due = nd; memo(`Hẹn ${LANDLORD()} đóng tiền nhà vào ngày lương`);
          return `${cap1(LANDLORD())} gật đầu: “Ừ, báo sớm thế là tốt. Ngày ${fmtD(nd)} nhớ đóng đủ nhé.”`; } });
    }
    if (S.bg === 'ghep' && !rb.tungAsked) {
      opts.push({ key:'tung', icon:'🍺', label:`Nhờ Tùng ứng trước phần tiền nhà ${fmt(rb.amount)}`, noSpend:true, hints:['🎲 Tùng cũng có thể đang kẹt', 'Hẹn trả khi có lương'],
        run:() => { rb.tungAsked = true;
          if (S.flags.loanTung) { const off = Math.min(S.flags.loanTung, rb.amount); rb.paid = true; rb.paidDay = S.day; rb.paidBy = 'tung'; if (rb.amount - off > 0) addLoan('tung', rb.amount - off, nextPaydayAfter(S.day), 'Tùng ứng tiền nhà'); S.flags.loanTung = 0; rel('tung', 2);
            return 'Tùng vỗ đùi: “Tao đang nợ mày mà! Để tao đóng phần của mày, coi như trừ nợ.” Hiếm khi nợ nần lại hữu ích như thế.'; }
          if (chance(late ? .45 : .7)) { rb.paid = true; rb.paidDay = S.day; rb.paidBy = 'tung'; addLoan('tung', rb.amount, nextPaydayAfter(S.day), 'Tùng ứng tiền nhà'); rel('tung', late ? -3 : 0); memo('Nhờ Tùng ứng tiền nhà');
            return late ? 'Tùng thở dài, rút ví: “Lần sau báo sớm hộ tao.” Tiền nhà đã được đóng.' : 'Tùng gật đầu luôn: “Ok, có lương thì trả tao, không vội.” Tiền nhà tháng này coi như xong.'; }
          rel('tung', -1); return 'Tùng gãi đầu: “Tao cũng đang kẹt mày ạ, tháng này tao còn phải trả góp điện thoại.” Phải tìm cách khác thôi.'; } });
    }
  }
  if (!(S.loans || []).some(L => L.from === 'linh' && L.mk === mk) && S.rel.linh >= 40) {
    opts.push({ key:'linh', icon:'📚', label:'Vay Linh 1.000.000đ, hẹn trả khi có lương', noSpend:true, hints:['🤝 Trả đúng hẹn để giữ quan hệ'],
      run:() => { S.money += 1000000; addLoan('linh', 1000000, nextPaydayAfter(S.day), 'Vay Linh'); rel('linh', late ? -2 : 0); memo('Vay Linh 1 triệu');
        return 'Linh chuyển khoản luôn: “Có gì cứ nói tao. Nhưng nhớ trả đúng hẹn nhé.”'; } });
  }
  if (canAdvance()) {
    opts.push({ key:'advance', icon:'🧭', label:'Xin chị Hạnh tạm ứng lương', noSpend:true, hints:[`💰 Khoảng ${fmt(Math.round(earnedSoFar() * FIN.ADVANCE_RATE / 100000) * 100000)}`, 'Trừ vào lương tháng sau', '🤝 −Chị Hạnh'],
      run:() => { const a = takeAdvance(); return `Chị Hạnh ký giấy tạm ứng ${fmt(a)}, kèm câu: “Đầu đi làm ai cũng thế, em đừng ngại.” Bạn vẫn ngại.`; } });
  }
  return opts;
}
SC.plan = (arg) => {
  const avg = avgDaily(), r = runway(avg), rb = nextRentBill(), np = S.job ? nextPaydayAfter(S.day - 1) : null;
  const p = np ? payFor(np) : null, loans = openLoans();
  const lines = [
    `<div class="hb"><span>Hiện có</span><span>${fmt(S.money)}</span></div>`,
    `<div class="hb"><span>Chi tiêu trung bình</span><span>~${fmt(avg)}/ngày</span></div>`,
    ...(S.bills || []).filter(b => !b.paid).sort((a, b) => a.due - b.due).slice(0, 4).map(b => `<div class="hb"><span>${b.name}, hạn ${fmtD(b.due)}</span><span>−${fmt(b.amount)}</span></div>`),
    ...loans.map(L => `<div class="hb"><span>${L.label}, hẹn trả ${fmtD(L.due)}</span><span>−${fmt(L.amount)}</span></div>`),
    p && p.amount ? `<div class="hb"><span>Lương ngày ${fmtD(np)} (${p.days} ngày công${p.rate < 1 ? ', thử việc 85%' : ''})</span><span>+${fmt(p.amount)}</span></div>` : '',
  ].join('');
  const verdict = r >= 60 ? '<span class="lv good">Đủ sống đến kỳ lương sau, còn dư.</span>'
    : `<span class="lv ${r < 15 ? 'bad' : 'ok'}">Theo dự báo, bạn sẽ hết tiền vào khoảng ngày ${fmtD(S.day + r)}.</span>`;
  const opts = planOptions(false);
  return { icon:'🧮', title:'Tính toán tháng đầu',
    html: P(arg === 'manual' ? 'Bạn mở sổ ghi chép và ngồi tính lại tiền nong.' : 'Tối nay bạn ngồi tính thử tiền nong cho tháng đầu. Tháng đầu đi thuê nhà, chẳng ai dư dả cả.')
      + `<div class="food">${lines}<p class="muted">${verdict}</p></div>`
      + (opts.length ? P('<span class="tip">Thu xếp sớm thì nhẹ nhàng hơn để đến phút chót.</span>') : ''),
    choices: [ ...opts.map(o => ({ icon:o.icon, label:o.label, desc:o.desc, hints:o.hints, noSpend:true, fx:() => { const t = o.run(); S.queue.unshift({ id:'plan', arg }); return t; } })),
      { icon:'👍', label: opts.length ? 'Tạm thời vậy đã, tự xoay tiếp' : 'Đóng sổ', fx:() => { if (arg === 'manual') S.queue.unshift({ id:'activity', arg:S.slot }); return { silent:true }; } } ] };
};
SC.repay = () => {
  const due = openLoans().filter(L => L.due <= S.day), sum = due.reduce((a, L) => a + L.amount, 0);
  if (!due.length) return { icon:'✅', title:'Không có khoản nợ đến hạn', html:'', choices:[{ icon:'👍', label:'Tiếp tục', fx:() => ({ silent:true }) }] };
  const who = L => L.from === 'family' ? 'mẹ' : PEOPLE[L.from].name;
  return { icon:'📒', title:'Các khoản cần trả',
    html: P('Đến hẹn trả những khoản đã nhờ vả:') + `<div class="food">${due.map(L => `<div class="hb"><span>${L.label} (${who(L)})</span><span>${fmt(L.amount)}</span></div>`).join('')}<div class="hb"><b>Tổng</b><b>${fmt(sum)}</b></div></div>` + P(`Bạn đang có ${fmt(S.money)}.`),
    choices:[
      { icon:'✅', label:'Trả hết', noSpend:true, disabled: S.money < sum, hints: S.money < sum ? ['Chưa đủ tiền'] : ['🤝 Giữ chữ tín'], fx:() => { due.forEach(L => { S.money -= L.amount; L.repaid = true; rel(L.from, 3); }); S.mood += 3; memo('Trả hết nợ đúng hẹn');
        return 'Bạn chuyển khoản từng người, kèm lời cảm ơn. Cảm giác hết nợ nhẹ như vừa ngủ đủ tám tiếng.'; } },
      { icon:'➗', label:'Trả trước một nửa mỗi khoản', noSpend:true, disabled: S.money < Math.ceil(sum / 2), fx:() => { due.forEach(L => { const h = Math.round(L.amount / 2); S.money -= h; L.amount -= h; L.due = S.day + 14; rel(L.from, -1); });
        return 'Bạn trả trước một nửa và hẹn phần còn lại sau hai tuần. Mọi người bảo “không sao”, bằng giọng “không sao”.'; } },
      { icon:'⏳', label:'Xin khất thêm một tuần', noSpend:true, hints:['🤝 Ảnh hưởng quan hệ','🙂 −4'], fx:() => { due.forEach(L => { L.due = S.day + 7; rel(L.from, L.extended ? -8 : -4); L.extended = true; }); S.mood -= 4;
        return 'Bạn nhắn xin khất. Tin nhắn “Ừ” trả lời lại ngắn đến mức đáng sợ.'; } },
    ] };
};
ACTS.push({ id:'budget', icon:'🧮', label:'Tính toán tiền nong tháng này', slots:['afternoon','evening'], hints:['📊 Xem dự báo','🤝 Thu xếp sớm'],
  fx:() => { S.queue.unshift({ id:'plan', arg:'manual' }); return { silent:true }; } });

