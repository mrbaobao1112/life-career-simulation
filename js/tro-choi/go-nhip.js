/* =========================================================
   v17.7: ⌨️ GÕ THEO NHỊP – kiểu chạm theo nhịp (thay "Gõ lệnh")
   3 làn, mỗi phách một phím rơi xuống một làn. Chạm nút của làn đó (hoặc phím A S D, mũi tên ← ↓ →) đúng lúc phím chạm vạch vàng.
   Đúng liên tiếp thì có combo. Chạm sai lúc (không có phím ở gần vạch) không bị trừ, chỉ mất combo.
   Điểm = số phím trúng / số phím đã tới vạch.
   Chạy theo api.onFrame của khung (không thêm vòng lặp). Khung logic rộng 300 × cao 260; vạch ở 200.
   ========================================================= */
MG_MOI.nhip = { icon:'⌨️', name:'Gõ theo nhịp', demo:'nhip',
  make(body, o, api){
    const R = MGM.nhip, W = 300, VACH = 200, ROI = R.roi * (api.still ? 1.3 : 1), PHACH = 60 / R.bpm[o.lv] * (api.still ? 1.3 : 1), LECH = R.lech, MAU = ['#2F6FD1', '#E9A23B', '#2E9E5B'];
    body.innerHTML = `<div class="mgm-san mgm-nhip" role="application" aria-label="Chạm đúng làn khi phím tới vạch vàng">
      <div class="mgm-combo" aria-live="polite"></div><div class="mgm-lan"><i></i><i></i><i></i></div><div class="mgm-vach"></div></div>
      <div class="mgm-nut">${['A', 'S', 'D'].map((c, i) => `<button type="button" data-l="${i}" style="--c:${MAU[i]}" aria-label="Làn ${i + 1}">${c}</button>`).join('')}</div>`;
    const san = body.querySelector('.mgm-san'), comboEl = body.querySelector('.mgm-combo'), nut = [...body.querySelectorAll('.mgm-nut button')];
    let k = 1, t = 0, sau = .6, trung = 0, toi = 0, combo = 0, max = 0;
    const not = [];                                                     // { lan, tDen (lúc chạm vạch), el, xong }
    const doK = () => { k = (san.clientWidth || W) / W; };
    doK();
    const cham = lan => {
      api.endDemo(); const b = nut[lan]; b.classList.remove('an'); void b.offsetWidth; b.classList.add('an');
      const n = not.filter(x => !x.xong && x.lan === lan && Math.abs(x.tDen - t) <= LECH).sort((a, b) => Math.abs(a.tDen - t) - Math.abs(b.tDen - t))[0];
      if (n) { n.xong = true; trung++; combo++; max = Math.max(max, combo); n.el.classList.add('trung'); setTimeout(() => n.el.remove(), 160); api.feedback(true); }
      else { combo = 0; }
      comboEl.textContent = combo >= 3 ? `combo ×${combo}` : '';
    };
    nut.forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); cham(+b.dataset.l); }));
    nut.forEach(b => b.addEventListener('click', e => { if (!e.detail) cham(+b.dataset.l); }));          // bàn phím (Enter, Space trên nút)
    api.onKey(e => { const l = { a:0, s:1, d:2, ArrowLeft:0, ArrowDown:1, ArrowRight:2 }[e.key.length === 1 ? e.key.toLowerCase() : e.key]; if (l === undefined) return false; cham(l); return true; });
    api.onFrame(dt => {
      t += dt; doK();
      sau -= dt;
      if (sau <= 0 && t < MG.GIAY_MOI - ROI) { sau += PHACH; const lan = Math.floor(Math.random() * 3), el = document.createElement('div'); el.className = 'mgm-not'; el.style.setProperty('--c', MAU[lan]); san.appendChild(el); not.push({ lan, tDen:t + ROI, el, xong:false }); }
      for (let i = not.length - 1; i >= 0; i--) {
        const n = not[i]; if (n.xong) { not.splice(i, 1); toi++; continue; }
        const y = VACH - (n.tDen - t) / ROI * (VACH + 20);
        n.el.style.transform = `translate(${((n.lan * 100 + 22) * k).toFixed(1)}px, ${((y - 11) * k).toFixed(1)}px)`;
        if (t - n.tDen > LECH) { n.el.remove(); not.splice(i, 1); toi++; combo = 0; comboEl.textContent = ''; }
      }
    });
    return { score:() => toi ? trung / toi : 0, result:() => `Trúng ${trung}/${toi} phím${max >= 5 ? `, combo ×${max}` : ''}`,
      // dành cho kiểm thử: phím sắp tới vạch (làn, còn bao lâu), và chạm
      gan:() => { const n = not.filter(x => !x.xong).sort((a, b) => a.tDen - b.tDen)[0]; return n ? { lan:n.lan, con:n.tDen - t } : null; }, cham };
  } };
