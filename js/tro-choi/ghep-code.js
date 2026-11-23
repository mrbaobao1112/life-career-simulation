/* =========================================================
   v17.7: 🧩 GHÉP CODE – kiểu ghép 3 (thay "Xếp code")
   Bảng 6×6 khối code nhiều màu. Vuốt một khối sang ô bên cạnh (hoặc chạm hai ô cạnh nhau) để đổi chỗ;
   3 khối cùng màu trở lên thẳng hàng thì nổ, khối phía trên rơi xuống, khối mới rơi từ trên vào (có thể nổ dây chuyền).
   Đổi chỗ mà không nổ thì hai khối quay về chỗ cũ. Không còn nước đi thì bảng tự xếp lại.
   Điểm = số khối đã dọn / mục tiêu (MGM.ghep.muc). Đủ mục tiêu thì xong sớm.
   Bàn phím: mũi tên để di chuyển, Enter hoặc Space để chọn ô.
   ========================================================= */
const MGM_KHOI = [['{ }', '#2F6FD1'], ['( )', '#E07A5F'], ['</>', '#2E9E5B'], [';', '#9D4EDD'], ['#', '#E9A23B']];
MG_MOI.ghep = { icon:'🧩', name:'Ghép code', demo:'vuot',
  make(body, o, api){
    const N = 6, K = MGM.ghep.mau[o.lv], goal = MGM.ghep.muc[o.lv], r = () => Math.floor(Math.random() * K);
    let g = [], sel = null, cleared = 0, busy = false, start = null;
    const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N) ? -1 : g[y * N + x];
    // tìm mọi ô thuộc hàng ngang hoặc cột dọc có từ 3 khối cùng màu
    const doc = (x, y, c, hit) => { let k = y; while (at(x, k) === c) { hit.add(k * N + x); k++; } };
    const tim = () => { const hit = new Set(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const c = at(x, y); if (c < 0) continue;
      if (at(x + 1, y) === c && at(x + 2, y) === c) { let k = x; while (at(k, y) === c) hit.add(y * N + k++); }
      if (at(x, y + 1) === c && at(x, y + 2) === c) doc(x, y, c, hit); } return hit; };
    const swap = (a, b) => { const t = g[a]; g[a] = g[b]; g[b] = t; };
    const coNuoc = () => { for (let i = 0; i < N * N; i++) for (const j of [i + 1, i + N]) { if (j >= N * N || (j === i + 1 && i % N === N - 1)) continue; swap(i, j); const ok = tim().size > 0; swap(i, j); if (ok) return true; } return false; };
    const tao = () => { do { g = Array.from({ length:N * N }, r); let n = 0; while (tim().size && n++ < 50) tim().forEach(i => { g[i] = r(); }); } while (tim().size || !coNuoc()); };
    tao();
    body.innerHTML = `<div class="mgm-muc" aria-live="polite">🎯 <b>0</b>/${goal}</div><div class="mgm-luoi" role="grid" style="--n:${N}"></div>`;
    const luoi = body.querySelector('.mgm-luoi'), so = body.querySelector('.mgm-muc b');
    const ve = (moi = new Set(), no = new Set()) => {
      luoi.innerHTML = g.map((c, i) => `<button type="button" class="mgm-o${sel === i ? ' chon' : ''}${moi.has(i) ? ' moi' : ''}${no.has(i) ? ' no' : ''}" data-i="${i}" style="--c:${MGM_KHOI[c][1]}" aria-label="Khối ${i % N + 1},${Math.floor(i / N) + 1}">${esc(MGM_KHOI[c][0])}</button>`).join('');
    };
    // Nổ, rơi, lấp đầy; lặp đến khi hết hàng 3 (dây chuyền)
    const xuLy = async () => {
      busy = true;
      for (let vong = 0; vong < 20; vong++) {
        const hit = tim(); if (!hit.size) break;
        cleared += hit.size; so.textContent = Math.min(cleared, 999); api.feedback(true);
        ve(new Set(), hit); if (!api.still) await new Promise(res => setTimeout(res, 160));
        const moi = new Set();
        for (let x = 0; x < N; x++) { const cot = []; for (let y = N - 1; y >= 0; y--) if (!hit.has(y * N + x)) cot.push(g[y * N + x]);
          for (let y = N - 1, k = 0; y >= 0; y--, k++) { if (k < cot.length) g[y * N + x] = cot[k]; else { g[y * N + x] = r(); moi.add(y * N + x); } } }
        ve(moi);
        if (cleared >= goal) { busy = false; return api.done(); }
      }
      if (!coNuoc()) { tao(); ve(new Set(g.map((_, i) => i))); }
      busy = false;
    };
    const thu = async (a, b) => {
      if (busy || a === b) return;
      const ke = Math.abs(a - b) === N || (Math.abs(a - b) === 1 && Math.floor(a / N) === Math.floor(b / N)); if (!ke) { sel = b; ve(); return; }
      sel = null; swap(a, b);
      if (tim().size) return xuLy();
      ve(); const ea = luoi.querySelector(`[data-i="${a}"]`), eb = luoi.querySelector(`[data-i="${b}"]`); api.feedback(false, ea); api.feedback(false, eb);
      busy = true; if (!api.still) await new Promise(res => setTimeout(res, 180)); swap(a, b); ve(); busy = false;
    };
    // Chạm: chọn ô thứ nhất rồi ô cạnh nó. Vuốt: kéo một ô sang hướng nào thì đổi với ô bên đó.
    luoi.addEventListener('pointerdown', e => { const b = e.target.closest('.mgm-o'); if (!b) return; start = { i:+b.dataset.i, x:e.clientX, y:e.clientY }; });
    luoi.addEventListener('pointerup', e => {
      if (!start) return; const dx = e.clientX - start.x, dy = e.clientY - start.y, i = start.i; start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 16) { const x = i % N, y = Math.floor(i / N); const j = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? (x < N - 1 ? i + 1 : -1) : (x > 0 ? i - 1 : -1)) : (dy > 0 ? (y < N - 1 ? i + N : -1) : (y > 0 ? i - N : -1)); if (j >= 0) thu(i, j); return; }
      if (sel === null) { sel = i; ve(); } else thu(sel, i);
    });
    luoi.addEventListener('click', e => { if (e.detail) return; const b = e.target.closest('.mgm-o'); if (!b) return; const i = +b.dataset.i; if (sel === null) { sel = i; ve(); } else thu(sel, i); });   // bàn phím (Enter, Space)
    api.onKey(e => {
      const f = document.activeElement && document.activeElement.closest && document.activeElement.closest('.mgm-o'); if (!f) return false;
      const i = +f.dataset.i, d = { ArrowLeft:-1, ArrowRight:1, ArrowUp:-N, ArrowDown:N }[e.key]; if (d === undefined) return false;
      const j = i + d; if (j < 0 || j >= N * N || (Math.abs(d) === 1 && Math.floor(j / N) !== Math.floor(i / N))) return true;
      const b = luoi.querySelector(`[data-i="${j}"]`); if (b) b.focus({ preventScroll:true }); return true;
    });
    ve();
    return { score:() => Math.min(1, cleared / goal), result:() => `Dọn ${cleared}/${goal} khối`,
      // dành cho kiểm thử: một nước đi đúng (nếu có)
      goiY:() => { for (let i = 0; i < N * N; i++) for (const j of [i + 1, i + N]) { if (j >= N * N || (j === i + 1 && i % N === N - 1)) continue; swap(i, j); const ok = tim().size > 0; swap(i, j); if (ok) return [i, j]; } return null; },
      thu };
  } };
