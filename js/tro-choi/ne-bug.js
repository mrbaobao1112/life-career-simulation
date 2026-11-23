/* =========================================================
   v17.7: 🐞 NÉ BUG – kiểu chạy và nhảy tránh vật cản (thay "Bắt bug")
   Nhân vật tự chạy trên dải bàn phím. Chạm vào khung (hoặc Space, mũi tên lên) để nhảy qua con bọ; nhặt cốc cà phê.
   Va vào bọ thì mất một tim và nháy trong chốc lát (không bị va thêm). Không có "thua": hết tim vẫn chạy tiếp đến hết giờ.
   Điểm = 0,9 − 0,15 × số lần va (thấp nhất 0,25) + tới 0,1 theo số cà phê nhặt được. Chơi dở chỉ thiệt nhẹ.
   Chạy theo api.onFrame của khung (không thêm vòng lặp). Khung logic rộng 300 × cao 200.
   ========================================================= */
MG_MOI.ne = { icon:'🐞', name:'Né bug', demo:'cham',
  make(body, o, api){
    const R = MGM.ne, W = 300, H = 200, DAT = 160, X0 = 54, NHAY = 430, TROI = 1250, TOC = R.toc[o.lv] * (api.still ? .75 : 1);
    body.innerHTML = `<div class="mgm-san mgm-ne" role="application" aria-label="Chạm để nhảy">
      <div class="mgm-mang" aria-live="polite">❤️❤️❤️</div><div class="mgm-cf">☕ <b>0</b></div>
      <div class="mgm-phim"></div><div class="mgm-nv">${typeof headSVG === 'function' ? headSVG(playerLook('casual'), 'happy') : ''}<i></i></div></div>`;
    const san = body.querySelector('.mgm-san'), nv = body.querySelector('.mgm-nv'), mangEl = body.querySelector('.mgm-mang'), cfEl = body.querySelector('.mgm-cf b');
    let k = 1, y = 0, vy = 0, mang = 3, va = 0, cf = 0, cfTong = 0, het = 0, t = 0, toi = .9, toiCf = R.ca_phe * .6;
    const vat = [];                                                              // { x, kind:'bo'|'cf', el, y }
    const doK = () => { k = (san.clientWidth || W) / W; };
    doK();
    const dat = (el, x, yy) => { el.style.transform = `translate(${(x * k).toFixed(1)}px, ${(yy * k).toFixed(1)}px)`; };
    const nhay = () => { if (y >= 0) { vy = -NHAY; api.endDemo(); } };
    san.addEventListener('pointerdown', e => { e.preventDefault(); nhay(); });
    api.onKey(e => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { nhay(); return true; } return false; });
    const them = (kind) => { const el = document.createElement('div'); el.className = 'mgm-vat ' + kind; el.textContent = kind === 'bo' ? '🐞' : '☕'; san.appendChild(el);
      vat.push({ x:W + 10, kind, el, y:kind === 'bo' ? DAT - 22 : DAT - 92 }); if (kind === 'cf') cfTong++; };
    api.onFrame(dt => {
      t += dt; doK();
      vy += TROI * dt; y = Math.min(0, y + vy * dt); if (y === 0) vy = Math.max(0, vy);
      het = Math.max(0, het - dt); nv.classList.toggle('nhay', y < 0); nv.classList.toggle('dau', het > 0);
      dat(nv, X0 - 18, DAT - 46 + y);
      toi -= dt; if (toi <= 0) { them('bo'); toi = R.cach[o.lv] * (.75 + Math.random() * .6); }
      toiCf -= dt; if (toiCf <= 0) { them('cf'); toiCf = R.ca_phe * (.8 + Math.random() * .4); }
      for (let i = vat.length - 1; i >= 0; i--) {
        const v = vat[i]; v.x -= TOC * dt; dat(v.el, v.x - 12, v.y);
        const chamX = Math.abs(v.x - X0) < (v.kind === 'bo' ? 18 : 22), chanY = DAT + y;                  // y < 0 khi đang ở trên không
        if (v.kind === 'bo' && chamX && chanY > DAT - 20 && het <= 0) {
          mang = Math.max(0, mang - 1); va++; het = 1.1; mangEl.textContent = '❤️'.repeat(mang) + '🤍'.repeat(3 - mang); api.feedback(false, nv);
        }
        if (v.kind === 'cf' && chamX && chanY < DAT - 40 && chanY > DAT - 130) { cf++; cfEl.textContent = cf; api.feedback(true); v.el.remove(); vat.splice(i, 1); continue; }
        if (v.x < -30) { v.el.remove(); vat.splice(i, 1); }
      }
    });
    const score = () => Math.max(.25, .9 - .15 * va) + .1 * (cfTong ? cf / cfTong : 0);
    return { score, result:() => va ? `Va ${va} lần, ☕ ${cf}` : `Không va lần nào, ☕ ${cf}`,
      // dành cho kiểm thử: con bọ gần nhất phía trước (để bot nhảy đúng lúc), và nhảy
      gan:() => { const b = vat.filter(v => v.kind === 'bo' && v.x > X0 - 10).sort((a, b) => a.x - b.x)[0]; return b ? b.x - X0 : null; }, nhay };
  } };
