/* =========================================================
   v17.7: 📦 HỨNG DỮ LIỆU – kiểu hứng đồ rơi (thay "Nối dây API")
   Gói dữ liệu rơi từ trên xuống. Kéo máy chủ qua lại (ngón tay, chuột, hoặc mũi tên trái phải) để hứng gói xanh, né gói đỏ.
   Điểm = gói xanh hứng được / gói xanh đã rơi, trừ 0,12 cho mỗi gói đỏ hứng phải.
   Chạy theo api.onFrame của khung (không thêm vòng lặp). Khung logic rộng 300 × cao 260.
   ========================================================= */
MG_MOI.hung = { icon:'📦', name:'Hứng dữ liệu', demo:'keo',
  make(body, o, api){
    const R = MGM.hung, W = 300, DAY = 228, RONG = 74, ROI = R.roi[o.lv] * (api.still ? .75 : 1);
    body.innerHTML = `<div class="mgm-san mgm-hung" role="application" aria-label="Kéo máy chủ qua lại">
      <div class="mgm-diem" aria-live="polite">✅ <b>0</b> · ❌ <i>0</i></div><div class="mgm-may">🖥️</div></div>`;
    const san = body.querySelector('.mgm-san'), may = body.querySelector('.mgm-may'), tot = body.querySelector('.mgm-diem b'), xau = body.querySelector('.mgm-diem i');
    let k = 1, x = W / 2, dich = W / 2, phim = 0, toi = .4, roiTot = 0, hung = 0, hungXau = 0;
    const goi = [];
    const doK = () => { k = (san.clientWidth || W) / W; };
    doK();
    const dat = (el, xx, yy) => { el.style.transform = `translate(${(xx * k).toFixed(1)}px, ${(yy * k).toFixed(1)}px)`; };
    const theo = e => { const r = san.getBoundingClientRect(); dich = Math.max(RONG / 2, Math.min(W - RONG / 2, (e.clientX - r.left) / k)); };
    san.addEventListener('pointerdown', e => { e.preventDefault(); san.setPointerCapture && san.setPointerCapture(e.pointerId); theo(e); });
    san.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') theo(e); });
    api.onKey(e => { if (e.key === 'ArrowLeft') { phim = -1; return true; } if (e.key === 'ArrowRight') { phim = 1; return true; } return false; });
    san.closest('.mg').addEventListener('keyup', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') phim = 0; });
    api.onFrame(dt => {
      doK();
      if (phim) dich = Math.max(RONG / 2, Math.min(W - RONG / 2, dich + phim * 260 * dt));
      x += (dich - x) * Math.min(1, dt * 14); dat(may, x - RONG / 2, DAY);
      toi -= dt;
      if (toi <= 0) { toi = R.cach[o.lv] * (.8 + Math.random() * .4);
        const xauGoi = Math.random() < R.xau[o.lv], el = document.createElement('div'); el.className = 'mgm-goi' + (xauGoi ? ' xau' : ''); el.textContent = xauGoi ? '✕' : '✓'; san.appendChild(el);
        goi.push({ x:20 + Math.random() * (W - 40), y:-24, xau:xauGoi, el }); if (!xauGoi) roiTot++; }
      for (let i = goi.length - 1; i >= 0; i--) {
        const g = goi[i]; g.y += ROI * dt; dat(g.el, g.x - 14, g.y);
        if (g.y > DAY - 20 && g.y < DAY + 6 && Math.abs(g.x - x) < RONG / 2 + 6) {
          if (g.xau) { hungXau++; xau.textContent = hungXau; api.feedback(false, may); } else { hung++; tot.textContent = hung; api.feedback(true); }
          g.el.remove(); goi.splice(i, 1); continue;
        }
        if (g.y > 280) { g.el.remove(); goi.splice(i, 1); }
      }
    });
    return { score:() => (roiTot ? hung / roiTot : 0) - hungXau * .12, result:() => `Hứng ${hung}/${roiTot} gói${hungXau ? `, dính ${hungXau} gói lỗi` : ''}`,
      // dành cho kiểm thử: gói gần đáy nhất, và đặt vị trí máy chủ
      gan:() => goi.filter(g => g.y < DAY).sort((a, b) => b.y - a.y).map(g => ({ x:g.x, y:g.y, xau:g.xau }))[0] || null,
      toi:xx => { dich = Math.max(RONG / 2, Math.min(W - RONG / 2, xx)); } };
  } };
