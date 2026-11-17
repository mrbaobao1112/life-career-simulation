/* =========================================================
   v15: 🔌 NỐI DÂY API – nối mỗi ô bên trái với ô đúng bên phải
   Chọn một ô bên trái, rồi chọn ô bên phải. Nối đúng thì hai ô cùng màu, có dấu ✓. Task khó thì nhiều cặp hơn.
   Điểm = số cặp đúng / tổng, mỗi lần nối sai trừ 0,15. Làm kỹ: một cặp được nối sẵn.
   ========================================================= */
const MG_WIRE = ['#2F6FD1', '#E07A5F', '#2E9E5B', '#9D4EDD', '#E9A23B'];
MG_GAMES.match = { icon:'🔌', name:'Nối dây API', hint:'Chọn một ô bên trái, rồi chọn ô đúng bên phải.',
  make(body, data, o, api){
    const pairs = data.pairs.slice(0, Math.min(data.pairs.length, 2 + o.d)), n = pairs.length;
    const rightOrder = mgShuffle(pairs.map((_, i) => i)), done = new Set(); let sel = null, wrong = 0;
    body.innerHTML = `<div class="mg-match"><div class="mg-col">${pairs.map((p, i) => `<button type="button" class="mg-cell L" data-i="${i}" aria-pressed="false"><code>${esc(p[0])}</code></button>`).join('')}</div>
      <div class="mg-col">${rightOrder.map(i => `<button type="button" class="mg-cell R" data-i="${i}">${esc(pairs[i][1])}</button>`).join('')}</div></div>`;
    const L = i => body.querySelector(`.mg-cell.L[data-i="${i}"]`), R = i => body.querySelector(`.mg-cell.R[data-i="${i}"]`);
    const link = i => { done.add(i); const c = MG_WIRE[done.size % MG_WIRE.length]; [L(i), R(i)].forEach(b => { b.classList.add('linked'); b.style.setProperty('--wire', c); b.disabled = true; b.setAttribute('aria-pressed', 'false'); }); };
    api.showDone(true);                                        // dừng sớm được, tính điểm theo phần đã làm
    if (o.careful) link(0);
    body.querySelectorAll('.mg-cell.L').forEach(b => b.addEventListener('click', () => {
      if (sel !== null) L(sel).setAttribute('aria-pressed', 'false');
      sel = +b.dataset.i; b.setAttribute('aria-pressed', 'true');
    }));
    body.querySelectorAll('.mg-cell.R').forEach(b => b.addEventListener('click', () => {
      if (sel === null) { api.feedback(false, b); return; }
      const i = +b.dataset.i;
      if (i === sel) { link(i); api.feedback(true, b); sel = null; if (done.size === n) api.done(); else { const nx = body.querySelector('.mg-cell.L:not([disabled])'); if (nx) nx.focus({ preventScroll:true }); } }
      else { wrong++; api.feedback(false, b); }
    }));
    const pre = o.careful ? 1 : 0;
    return { score:() => (done.size - pre) / Math.max(1, n - pre) - wrong * .15, result:() => `Nối đúng ${done.size}/${n} cặp${wrong ? `, nối nhầm ${wrong} lần` : ''}` };
  } };
