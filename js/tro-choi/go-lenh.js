/* =========================================================
   v15: ⌨️ GÕ LỆNH – gõ đúng từng lệnh rồi nhấn Enter
   Task càng khó càng nhiều lệnh. Điểm = số lệnh gõ đúng (cộng phần đang gõ dở) / tổng, mỗi lần Enter sai trừ 0,05.
   Làm kỹ: không phân biệt chữ hoa chữ thường, bỏ qua khoảng trắng thừa.
   ========================================================= */
MG_GAMES.type = { icon:'⌨️', name:'Gõ lệnh', hint:'Gõ đúng từng lệnh vào ô bên dưới rồi nhấn Enter.',
  make(body, data, o, api){
    const cmds = data.cmds.slice(0, Math.min(data.cmds.length, 2 + o.d)); let k = 0, typos = 0;
    const norm = s => o.careful ? s.trim().replace(/\s+/g, ' ').toLowerCase() : s;
    body.innerHTML = `<ol class="mg-cmds">${cmds.map((c, i) => `<li data-i="${i}"><code>${esc(c)}</code></li>`).join('')}</ol>
      <label class="mg-term"><span aria-hidden="true">$</span><input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" aria-label="Gõ lệnh"></label>
      <button type="button" class="ghost sm mg-enter">Chạy lệnh ↵</button>`;
    const inp = body.querySelector('input'), items = [...body.querySelectorAll('.mg-cmds li')];
    const mark = () => items.forEach((li, i) => { li.classList.toggle('done', i < k); li.classList.toggle('now', i === k); });
    const partial = () => { if (k >= cmds.length) return 0; const v = norm(inp.value), c = norm(cmds[k]); let n = 0; while (n < v.length && v[n] === c[n]) n++; return n / c.length; };
    const submit = () => {
      if (k >= cmds.length) return;
      if (norm(inp.value) === norm(cmds[k])) { k++; inp.value = ''; api.feedback(true, items[k - 1]); mark(); if (k === cmds.length) api.done(); }
      else { typos++; api.feedback(false, inp.parentNode); }
    };
    inp.addEventListener('input', () => { inp.parentNode.classList.toggle('err', k < cmds.length && !norm(cmds[k]).startsWith(norm(inp.value))); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    body.querySelector('.mg-enter').addEventListener('click', () => { submit(); inp.focus({ preventScroll:true }); });
    api.showDone(true);                                        // dừng sớm được, tính điểm theo phần đã làm
    mark(); setTimeout(() => inp.focus({ preventScroll:true }), 50);
    return { score:() => (k + partial()) / cmds.length - typos * .05, result:() => `Gõ đúng ${k}/${cmds.length} lệnh${typos ? `, gõ sai ${typos} lần` : ''}` };
  } };
