/* =========================================================
   v15: 🧩 XẾP CODE – đưa các dòng về đúng thứ tự
   Kéo một dòng lên hoặc xuống (chuột, ngón tay), hoặc bấm ▲ ▼ (dễ hơn trên điện thoại, dùng được bằng bàn phím).
   Điểm = số dòng đứng đúng chỗ / tổng số dòng. Xếp đúng hết thì tự xong; muốn dừng sớm thì bấm “Xong”.
   Làm kỹ: dòng đầu tiên được đặt sẵn đúng chỗ, và dòng nào đúng chỗ thì có dấu ✓.
   ========================================================= */
MG_GAMES.order = { icon:'🧩', name:'Xếp code', hint:'Kéo các dòng (hoặc bấm ▲ ▼) về đúng thứ tự.',
  make(body, data, o, api){
    const lines = data.lines, pin = o.careful ? 1 : 0;
    let cur = mgShuffle(lines.map((_, i) => i));
    if (pin) { const j = cur.indexOf(0); [cur[0], cur[j]] = [cur[j], cur[0]]; if (cur.every((k, i) => k === i)) [cur[1], cur[2]] = [cur[2], cur[1]]; }
    const draw = focus => {
      body.innerHTML = `<ol class="mg-order">${cur.map((k, p) => `<li class="mg-row${pin && p < pin ? ' pin' : ''}${o.careful && k === p ? ' ok' : ''}" data-p="${p}">
        <span class="mg-grip" aria-hidden="true">⋮⋮</span><code>${esc(lines[k])}</code>
        <span class="mg-mv"><button type="button" data-mv="-1" aria-label="Đưa dòng ${p + 1} lên" ${p <= pin ? 'disabled' : ''}>▲</button><button type="button" data-mv="1" aria-label="Đưa dòng ${p + 1} xuống" ${p < pin || p === cur.length - 1 ? 'disabled' : ''}>▼</button></span></li>`).join('')}</ol>`;
      body.querySelectorAll('.mg-mv button').forEach(b => b.addEventListener('click', () => move(+b.closest('.mg-row').dataset.p, +b.dataset.mv, true)));
      body.querySelectorAll('.mg-row:not(.pin)').forEach(r => r.addEventListener('pointerdown', drag));
      if (focus) { const b = body.querySelector(`.mg-row[data-p="${focus[0]}"] [data-mv="${focus[1]}"]`); if (b && !b.disabled) b.focus({ preventScroll:true }); }
      api.showDone(true);
    };
    const check = () => { if (cur.every((k, i) => k === i)) api.done(); };
    function move(p, d, keepFocus){
      const to = Math.max(pin, Math.min(cur.length - 1, p + d)); if (to === p) return;
      const [k] = cur.splice(p, 1); cur.splice(to, 0, k); api.feedback(true); draw(keepFocus ? [to, d] : null); check();
    }
    // kéo thả: thả ra thì dòng nhảy đến vị trí gần nhất
    function drag(e){
      if (e.target.closest('button')) return;
      const row = e.currentTarget, p0 = +row.dataset.p, h = row.getBoundingClientRect().height + 6, y0 = e.clientY;
      row.setPointerCapture && row.setPointerCapture(e.pointerId); row.classList.add('drag'); e.preventDefault();
      const mv = ev => { row.style.transform = `translateY(${ev.clientY - y0}px)`; };
      const up = ev => { row.removeEventListener('pointermove', mv); row.removeEventListener('pointerup', up); row.removeEventListener('pointercancel', up);
        row.classList.remove('drag'); row.style.transform = ''; const d = Math.round((ev.clientY - y0) / h); if (d) move(p0, d); };
      row.addEventListener('pointermove', mv); row.addEventListener('pointerup', up); row.addEventListener('pointercancel', up);
    }
    draw();
    const right = () => cur.filter((k, i) => k === i).length;
    return { score:() => right() / lines.length, result:() => `Xếp đúng ${right()}/${lines.length} dòng` };
  } };
