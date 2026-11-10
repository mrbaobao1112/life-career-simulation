/* =========================================================
   MÀN MỞ ĐẦU
   ========================================================= */
function hideHUD(){ $('#top').hidden = true; $('#bars').hidden = true; $('#foot').hidden = true; $('#phoneFab').hidden = true; }

function renderTitle(){
  hideHUD();
  const saved = load();
  const canResume = saved && saved.v === 6 && saved.phase;
  const demo = { hair:'hair_short', hairColor:'#2B2321', skin:'#FFD6BA', outfit:{ kind:'shirt', color:'#FFFFFF' }, tie:true, acc:[] };
  $('#stage').innerHTML = `<section class="title-wrap">
    <div class="title-art">
      <div class="title-cal"><div class="cal-page"><div class="cal-bind"><span></span><span></span></div>
        <div class="cal-month">Tháng 11, 2026</div><div class="cal-num">16</div><div class="cal-dow">Thứ Hai</div></div></div>
      <div class="title-chibi" role="button" tabindex="0" aria-label="Chạm vào nhân vật">${chibiSVG(demo, 'happy', { label:'Nhân vật chính' })}</div>
    </div>
    <h1>Life &amp; Career Simulation</h1>
    <p class="lead">Bản chơi thử: tuần đầu tiên sau khi tốt nghiệp. Bảy ngày, một tấm bằng, một khoản tiền tiết kiệm nhỏ, và rất nhiều lựa chọn.</p>
    ${canResume ? '<button class="btn" type="button" id="resume">Chơi tiếp</button><button class="btn alt" type="button" id="fresh">Bắt đầu tuần mới</button>'
                : '<button class="btn" type="button" id="fresh">Bắt đầu</button>'}
  </section>`;
  if (canResume) $('#resume').addEventListener('click', () => { S = saved; resume(); });
  $('#fresh').addEventListener('click', renderSetup);
}

function resume(){
  if (S.phase === 'end') return renderWeek();
  if (S.cur) renderScene(); else advance();
}

function renderSetup(){
  hideHUD();
  const st = { gender:'nam', bg:null, look:defaultLook('nam'), hairTouched:false };
  const BGS = [
    { k:'nha',  icon:'🏠', label:'Ở cùng bố mẹ trong thành phố', desc:'Không tốn tiền nhà, có cơm mẹ nấu. Đổi lại, mỗi bữa cơm là một buổi phỏng vấn về tương lai.', hints:['💰 4 triệu','🏠 0đ/tháng'] },
    { k:'tro',  icon:'🏚️', label:'Sinh viên tỉnh, thuê trọ một mình', desc:'Đã đóng cọc và tiền trọ tháng đầu (16/11–15/12). Tự do tuyệt đối, kể cả tự do ăn mì tôm. Dễ cô đơn.', hints:['💰 4,5 triệu','🏠 3,5 triệu/tháng, hạn ngày 16'] },
    { k:'ghep', icon:'🛋️', label:'Ở ghép với Tùng, bạn cùng lớp', desc:'Chi phí vừa phải, luôn có người để nói chuyện. Tùng là bạn tốt, và là chuyên gia rủ rê.', hints:['💰 3,5 triệu','🏠 2 triệu/tháng, hạn ngày 16'] },
  ];
  $('#stage').innerHTML = `<article class="scene">
    <header class="sh"><span class="si" aria-hidden="true">🎓</span><h2>Tạo nhân vật</h2></header>
    <p>Bạn 22 tuổi, vừa tốt nghiệp ngành Công nghệ thông tin, đang sống ở Hà Thành.</p>
    <div class="field"><label for="nm">Tên nhân vật</label><input id="nm" maxlength="24" value="${pick(['Minh','An','Khánh','Ngọc','Hà','Long'])}" autocomplete="off"></div>
    <div class="field"><span class="lab">Giới tính</span><div class="gopts">
      <button type="button" class="gopt" data-g="nam" aria-pressed="true">Nam</button>
      <button type="button" class="gopt" data-g="nu" aria-pressed="false">Nữ</button></div></div>
    <div class="field"><span class="lab">Ngoại hình</span>
      <div class="look">
        <div class="look-pv" id="pv"></div>
        <div class="look-opts">
          <span class="sub">Kiểu tóc</span><div class="hairs" id="hairs"></div>
          <span class="sub">Màu tóc</span><div class="sws" id="hcs"></div>
          <span class="sub">Màu da</span><div class="sws" id="sks"></div>
          <button type="button" class="ghost sm" id="rnd">🎲 Ngẫu nhiên</button>
        </div>
      </div></div>
    <div class="field"><span class="lab">Gia cảnh</span>
      <p class="hint" style="text-align:left;margin:0 0 4px">Gia cảnh ảnh hưởng đến kỳ vọng, sự hỗ trợ và trách nhiệm trong gia đình, không ảnh hưởng đến tiền khởi đầu.</p>
      ${Object.entries(FAMILY).map(([k, f]) => `<button type="button" class="bgopt" data-f="${k}" aria-pressed="false"><span class="cl">${f.icon} ${f.name}</span><span class="cd">${f.desc}</span></button>`).join('')}</div>
    <div class="field"><span class="lab">Nơi ở</span>
      <p class="hint" style="text-align:left;margin:0 0 4px">Số tiền khởi đầu là tiền tiết kiệm từ làm thêm thời sinh viên và tiền mừng tốt nghiệp.</p>
      ${BGS.map(b => `<button type="button" class="bgopt" data-b="${b.k}" aria-pressed="false">
        <span class="cl">${b.icon} ${b.label}</span><span class="cd">${b.desc}</span>
        <span class="chips">${b.hints.map(h => `<span class="chip">${h}</span>`).join('')}</span></button>`).join('')}</div>
    <button class="btn" type="button" id="go" disabled>Bắt đầu tuần mới</button>
    <p class="hint" id="goHint">Chọn gia cảnh và nơi ở để bắt đầu.</p>
  </article>`;
  const go = $('#go');
  const refresh = () => {
    $('#pv').innerHTML = chibiSVG(lookToL(st.look, 'casual', st.gender), 'happy', { label:'Xem trước nhân vật' });
    const base = lookToL(st.look, 'casual', st.gender);
    const fitH = catBy('hair').filter(h => h.fit.includes(st.gender)), altH = catBy('hair').filter(h => !h.fit.includes(st.gender));
    $('#hairs').innerHTML = [...fitH, ...altH].map(h => `<button type="button" class="hairopt${h.fit.includes(st.gender) ? '' : ' alt'}" data-id="${h.id}" aria-pressed="${st.look.hair === h.id}" aria-label="Kiểu tóc ${h.name}">${headSVG({ ...base, hair:h.id })}<span>${h.name}</span></button>`).join('');
    $('#hcs').innerHTML = catBy('hairColor').map(c => `<button type="button" class="sw" data-id="${c.id}" style="background:${c.value}" aria-pressed="${st.look.hairColor === c.id}" aria-label="Màu tóc ${c.name}" title="${c.name}"></button>`).join('');
    $('#sks').innerHTML = catBy('skin').map(c => `<button type="button" class="sw" data-id="${c.id}" style="background:${c.value}" aria-pressed="${st.look.skin === c.id}" aria-label="Màu da ${c.name}" title="${c.name}"></button>`).join('');
    $('#hairs').querySelectorAll('.hairopt').forEach(b => b.addEventListener('click', () => { st.look.hair = b.dataset.id; st.hairTouched = true; refresh(); }));
    $('#hcs').querySelectorAll('.sw').forEach(b => b.addEventListener('click', () => { st.look.hairColor = b.dataset.id; refresh(); }));
    $('#sks').querySelectorAll('.sw').forEach(b => b.addEventListener('click', () => { st.look.skin = b.dataset.id; refresh(); }));
  };
  refresh();
  $('#rnd').addEventListener('click', () => {
    st.look.hair = pick(catBy('hair').filter(h => h.fit.includes(st.gender))).id; st.look.hairColor = pick(catBy('hairColor')).id; st.look.skin = pick(catBy('skin')).id;
    st.hairTouched = true; refresh();
  });
  document.querySelectorAll('.gopt').forEach(b => b.addEventListener('click', () => {
    st.gender = b.dataset.g; document.querySelectorAll('.gopt').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (!CAT[st.look.hair].fit.includes(st.gender)) st.look.hair = defaultLook(st.gender).hair;
    refresh();
  }));
  const ready = () => { go.disabled = !(st.bg && st.fam); $('#goHint').hidden = !go.disabled; };
  document.querySelectorAll('.bgopt[data-b]').forEach(b => b.addEventListener('click', () => {
    st.bg = b.dataset.b; document.querySelectorAll('.bgopt[data-b]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); ready();
  }));
  document.querySelectorAll('.bgopt[data-f]').forEach(b => b.addEventListener('click', () => {
    st.fam = b.dataset.f; document.querySelectorAll('.bgopt[data-f]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); ready();
  }));
  go.addEventListener('click', () => {
    const name = ($('#nm').value || '').trim() || 'Minh';
    if (!st.bg || !st.fam) return;
    newGame(name, st.gender, st.bg, { ...st.look }, st.fam);
  });
}

/* ----- Hồ sơ ----- */
function openProfile(){
  if (!S) return;
  const bgName = { nha:'Ở cùng bố mẹ', tro:'Thuê trọ một mình', ghep:'Ở ghép với Tùng' }[S.bg];
  const job = S.job ? `${COMPANIES[S.job.co].name}, ${fmtTr(S.job.salary)}/tháng` : 'Chưa có việc';
  const met = Object.keys(PEOPLE).filter(k => !PEOPLE[k].work || (S.job && S.day >= S.job.start));
  const skill = (k, ic) => `<div style="margin-top:8px"><div class="bar-l"><span>${ic} ${LBL[k]}</span><b>${S[k]}</b></div><div class="bar"><i style="width:${S[k]}%"></i></div></div>`;
  $('#dlgBody').innerHTML = `<div class="prof-top"><span class="ph-av big">${headSVG(playerLook('casual'), playerExpr())}</span><h2>${esc(S.name)}</h2></div>
    <div class="kv" style="margin-top:10px">
      <span>Nơi ở</span><span>${bgName}</span>
      <span>Gia cảnh</span><span>${(FAMILY[S.fam] || FAMILY.tb).name}</span>
      <span>Công việc</span><span>${job}</span>
      <span>Giấc ngủ gần nhất</span><span>${S.day > 1 ? fmtH(S.sleep) : 'Chưa có'}</span>
      <span>Ăn uống dạo này</span><span>${nutrWord()}</span>
    </div>
    <h3>Kỹ năng</h3>${skill('tech','🧠')}${skill('soft','🗣️')}
    <h3>Tài chính</h3>${finCardHTML()}
    <h3>CV đã nộp</h3>${cvHTML()}
    <h3>Hồ sơ ăn uống</h3>${foodHTML()}
    <h3>Các mối quan hệ</h3>
    ${met.map(k => `<div class="rel-row" style="grid-template-columns:26px 1fr 90px 34px"><span aria-hidden="true">${PEOPLE[k].icon}</span>
      <span>${PEOPLE[k].name}<br><small style="color:var(--muted)">${PEOPLE[k].note}</small></span>
      <div class="bar"><i class="${S.rel[k] < 30 ? 'low' : S.rel[k] < 55 ? 'mid' : ''}" style="width:${S.rel[k]}%"></i></div><span class="dv">${S.rel[k]}</span></div>`).join('')}
    <button class="btn alt" type="button" id="closeDlg">Đóng</button>`;
  const dlg = $('#dlg'); dlg.classList.remove('phone-dlg');
  $('#closeDlg').addEventListener('click', closeDlg);
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}
$('#btnProfile').addEventListener('click', openProfile);
const soundLabel = () => { $('#btnSound').textContent = SFX.on ? '🔊 Âm thanh' : '🔇 Tắt tiếng'; $('#btnSound').setAttribute('aria-pressed', String(SFX.on)); };
soundLabel(); $('#btnSound').addEventListener('click', () => { SFX.toggle(); soundLabel(); if (SFX.on) SFX.play('pop'); });
$('#phoneFab').addEventListener('click', openPhone);
$('#dlg').addEventListener('click', e => { if (e.target.id === 'dlg') closeDlg(); });

let restartArmed = null;
$('#btnRestart').addEventListener('click', e => {
  const b = e.currentTarget;
  if (restartArmed) { clearTimeout(restartArmed); restartArmed = null; b.textContent = 'Chơi lại từ đầu'; wipe(); S = null; renderTitle(); return; }
  b.textContent = 'Bấm lần nữa để xác nhận';
  restartArmed = setTimeout(() => { restartArmed = null; b.textContent = 'Chơi lại từ đầu'; }, 3000);
});

renderTitle();
