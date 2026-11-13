/* =========================================================
   v14: ĐIỀU KHIỂN – bàn phím (WASD, mũi tên, E), joystick ảo trên điện thoại
   Chỉ ghi lại người chơi đang muốn đi hướng nào; việc di chuyển nằm ở di-chuyen.js.
   ========================================================= */
const ROAM_KEYS = { KeyW:[0, -1], ArrowUp:[0, -1], KeyS:[0, 1], ArrowDown:[0, 1], KeyA:[-1, 0], ArrowLeft:[-1, 0], KeyD:[1, 0], ArrowRight:[1, 0] };
const INPUT = {
  on:false,            // đang ở trong thế giới tự do (chỉ khi đó mới bắt phím)
  held:new Set(),      // các phím hướng đang giữ
  joy:null,            // hướng của joystick: { x, y } trong khoảng −1…1
  onKey:null,          // thế giới xử lý các phím khác (E, Esc, số 1–9); trả về true nếu đã dùng phím
  onMove:null,         // gọi khi người chơi bắt đầu tự đi (để hủy việc đang tự đi đến đồ vật)
};
// Đang gõ chữ hoặc đang mở hộp thoại (điện thoại, cài đặt…) thì không bắt phím
function inputBusy(e){
  const t = e && e.target;
  if (t && t.tagName && (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)) return true;
  const d = document.getElementById('dlg'); return !!(d && (d.open || d.hasAttribute('open')));
}
// Hướng đi hiện tại: cộng các phím đang giữ và joystick; đi chéo được chuẩn hóa để không nhanh hơn đi thẳng
function inputDir(){
  let x = 0, y = 0;
  INPUT.held.forEach(c => { const v = ROAM_KEYS[c]; if (v) { x += v[0]; y += v[1]; } });
  if (INPUT.joy) { x += INPUT.joy.x; y += INPUT.joy.y; }
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  return { x, y };
}
// Thả hết phím: khi mất focus, chuyển tab, mở hộp thoại, rời thế giới
function inputClear(){ INPUT.held.clear(); INPUT.joy = null; document.querySelectorAll('.w-knob').forEach(k => { k.style.transform = ''; }); }

document.addEventListener('keydown', e => {
  if (!INPUT.on || e.ctrlKey || e.metaKey || e.altKey) return;
  if (inputBusy(e)) { inputClear(); return; }
  if (ROAM_KEYS[e.code]) { e.preventDefault(); if (!INPUT.held.has(e.code)) { INPUT.held.add(e.code); if (INPUT.onMove) INPUT.onMove(); } return; }
  if (!e.repeat && INPUT.onKey && INPUT.onKey(e)) e.preventDefault();
});
document.addEventListener('keyup', e => { INPUT.held.delete(e.code); });
window.addEventListener('blur', inputClear);
document.addEventListener('visibilitychange', () => { if (document.hidden) inputClear(); });

// Joystick ảo: kéo trong vòng tròn, càng kéo xa tâm càng đi nhanh
function joyMount(el){
  const knob = el.querySelector('.w-knob'); let id = null, cx = 0, cy = 0, R = 1;
  const set = e => {
    let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy);
    if (m > R) { dx *= R / m; dy *= R / m; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    INPUT.joy = m < R * .2 ? null : { x:dx / R, y:dy / R };
  };
  el.addEventListener('pointerdown', e => {
    const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = Math.max(10, r.width / 2 - 12);
    id = e.pointerId; try { el.setPointerCapture(id); } catch (err) {}
    set(e); if (INPUT.onMove) INPUT.onMove(); e.preventDefault();
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) set(e); });
  const end = e => { if (e.pointerId !== id) return; id = null; INPUT.joy = null; knob.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
}
// Máy có màn hình cảm ứng (để hiện joystick và nút dùng đồ)
const touchFirst = () => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };
