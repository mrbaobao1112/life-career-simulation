/* =========================================================
   v15: 🐞 BẮT BUG – chạm đúng những dòng code sai
   Điểm = số lỗi bắt được / tổng số lỗi, mỗi lần chạm nhầm trừ 0,2.
   Làm kỹ: có một câu gợi ý. Bàn phím: Tab hoặc mũi tên lên xuống để chọn dòng, Enter để chạm.
   ========================================================= */
MG_GAMES.bug = { icon:'🐞', name:'Bắt bug', hint:'Chạm vào những dòng code sai.',
  make(body, data, o, api){
    const bad = new Set(data.bad), found = new Set(); let wrong = 0;
    body.innerHTML = `<p class="mg-goal">Đoạn code này có <b>${bad.size}</b> dòng sai.</p>${o.careful ? `<p class="mg-tip">💡 ${esc(data.hint)}</p>` : ''}
      <ol class="mg-code">${data.lines.map((l, i) => `<li><button type="button" class="mg-line" data-i="${i}"><span class="mg-no">${i + 1}</span><code>${esc(l)}</code></button></li>`).join('')}</ol>`;
    api.showDone(true);                                        // dừng sớm được, tính điểm theo phần đã làm
    const btns = [...body.querySelectorAll('.mg-line')];
    btns.forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i; if (b.classList.contains('hit') || b.classList.contains('miss')) return;
      if (bad.has(i)) { found.add(i); b.classList.add('hit'); b.setAttribute('aria-label', `Dòng ${i + 1}: đúng là lỗi`); api.feedback(true, b); if (found.size === bad.size) api.done(); }
      else { wrong++; b.classList.add('miss'); b.setAttribute('aria-label', `Dòng ${i + 1}: dòng này không sai`); api.feedback(false, b); }
    }));
    body.addEventListener('keydown', e => {
      const k = btns.indexOf(document.activeElement); if (k < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); btns[(k + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length].focus(); }
    });
    return { score:() => found.size / bad.size - wrong * .2, result:() => `Bắt được ${found.size}/${bad.size} lỗi${wrong ? `, chạm nhầm ${wrong} lần` : ''}` };
  } };
