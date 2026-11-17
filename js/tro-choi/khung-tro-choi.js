/* =========================================================
   v15: KHUNG TRÒ CHƠI NHỎ KHI LÀM TASK
   Mỗi trò (bat-bug.js, xep-code.js, go-lenh.js, noi-day.js) đăng ký vào MG_GAMES và chỉ lo phần chơi.
   Khung này lo phần chung: mở cửa sổ, đếm giờ, nút “Để nhân vật tự làm”, chấm điểm và đổi điểm ra mức cộng trừ.
   Điểm 0…1 → cộng trừ vào xác suất làm task thành công, tối đa ±MG.MAX (chỉ nhích nhẹ).
   Bỏ qua, tua nhanh, chế độ danh sách: cộng trừ 0, nên kết quả y như trước khi có trò chơi.
   ========================================================= */
const MG = {
  MAX:.06,                   // chơi giỏi nhất / kém nhất: xác suất thành công ±6 điểm phần trăm
  TIME:{ bug:30, order:40, type:35, match:32 },   // thời gian gốc của mỗi trò (giây)
  FAST:.75,                  // chọn “làm nhanh”: thời gian còn chừng này
  HARD:.1,                   // mỗi bậc độ khó của task (●) bớt chừng này thời gian
  TECH:[.85, 1.2],           // Chuyên môn thấp → ít thời gian hơn, cao → nhiều hơn (khoảng)
};
let MG_BONUS = 0;            // mức cộng trừ của lần làm task đang tính (khác 0 chỉ trong lúc áp dụng lựa chọn)
const mgBonus = () => MG_BONUS;
const MG_GAMES = {};         // các trò đăng ký vào đây: { icon, name, hint, make(box, data, opts, api) }

// Chơi trò ứng với task; trả về { score, bonus, line }. Đóng sớm / bỏ qua: bonus = 0.
function mgPlay(mg){
  const kind = MG_FOR_TASK[mg.tid] || 'bug', G = MG_GAMES[kind], data = MG_DATA[kind][mg.tid] || Object.values(MG_DATA[kind])[0], t = TASK[mg.tid] || TASKS[0];
  const careful = mg.how === 'careful', still = reduceMotion();
  const techK = Math.max(MG.TECH[0], Math.min(MG.TECH[1], .7 + S.tech / 100 * .6));
  const secs = Math.round(MG.TIME[kind] * (careful ? 1 : MG.FAST) * (1 - (t.d - 1) * MG.HARD) * techK);
  return new Promise(resolve => {
    const box = document.createElement('div'); box.className = 'mg'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', G.name);
    box.innerHTML = `<div class="mg-box"><header class="mg-head"><span class="mg-ic" aria-hidden="true">${G.icon}</span><div class="mg-tt"><b>${G.name}</b><small>${t.icon} ${esc(t.title)}</small></div>
        <span class="mg-time" aria-live="off">${secs}s</span></header>
      <div class="mg-bar"><i></i></div><p class="mg-hint">${G.hint}${careful ? ' <b>Làm kỹ:</b> có gợi ý.' : ''}</p>
      <div class="mg-body"></div>
      <footer class="mg-foot"><button type="button" class="ghost mg-skip">Để nhân vật tự làm</button><button type="button" class="btn mg-done" hidden>Xong ▸</button></footer></div>`;
    document.body.appendChild(box);
    let left = secs, finished = false, last = performance.now(), raf = 0;
    const api = {
      careful, still,
      done:() => finish(),                                  // trò tự báo xong (đã giải hết)
      showDone:(on = true) => { box.querySelector('.mg-done').hidden = !on; },
      feedback:(ok, el) => { SFX.play(ok ? 'pop' : 'dun'); if (el && !still) { el.classList.remove('mg-ok', 'mg-bad'); void el.offsetWidth; el.classList.add(ok ? 'mg-ok' : 'mg-bad'); } },
    };
    const game = G.make(box.querySelector('.mg-body'), data, { careful, d:t.d }, api);
    const bar = box.querySelector('.mg-bar i'), tl = box.querySelector('.mg-time');
    const tick = now => {
      if (finished) return;
      const dt = Math.min(.2, (now - last) / 1000); last = now;
      if (!document.hidden) left -= dt;
      bar.style.width = Math.max(0, left / secs * 100) + '%'; tl.textContent = Math.max(0, Math.ceil(left)) + 's';
      box.classList.toggle('mg-hurry', left < 6);
      if (left <= 0) return finish();
      raf = requestAnimationFrame(tick);
    };
    function finish(skip){
      if (finished) return; finished = true; cancelAnimationFrame(raf);
      const score = skip ? null : Math.max(0, Math.min(1, game.score()));
      const bonus = score === null ? 0 : Math.round((score - .5) * 2 * MG.MAX * 1000) / 1000;
      const pct = Math.round(bonus * 100);
      const line = score === null ? '' : `${G.icon} ${game.result ? game.result() : ''} · khả năng làm tốt ${pct >= 0 ? '+' : '−'}${Math.abs(pct)}%.`;
      box.classList.add('mg-end');
      const end = () => { box.remove(); resolve({ score, bonus, line }); };
      if (skip || still) return end();
      box.querySelector('.mg-body').insertAdjacentHTML('beforeend', `<div class="mg-result">${score >= .8 ? '🎉' : score >= .5 ? '👍' : '😅'} ${esc(line)}</div>`);
      setTimeout(end, 1300);
    }
    box.querySelector('.mg-skip').addEventListener('click', () => finish(true));
    box.querySelector('.mg-done').addEventListener('click', () => finish());
    box.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); finish(true); } });
    const f = box.querySelector('.mg-body button, .mg-body input'); if (f) f.focus({ preventScroll:true });
    raf = requestAnimationFrame(tick);
  });
}
// Xáo trộn một mảng (bản sao), bảo đảm khác thứ tự ban đầu nếu có thể
function mgShuffle(a){ const b = a.slice(); for (let n = 0; n < 6; n++) { for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } if (b.some((x, i) => x !== a[i])) break; } return b; }
