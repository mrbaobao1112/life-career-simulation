/* =========================================================
   v14: DI CHUYỂN – va chạm với tường và đồ đạc, tìm đường khi chạm vào đồ vật
   Mọi hàm ở đây chỉ tính toán trên bản đồ (ban-do-nha.js), không đụng đến hình vẽ hay luật chơi.
   ========================================================= */
// Bàn chân đứng ở (x, y) có bị vướng không
function roamFree(H, x, y){
  const [fw, fh] = ROAM.FOOT;
  if (x - fw < H.x0 || x + fw > H.x1 || y < ROAM.Y0 || y > ROAM.Y1) return false;
  for (const b of roamBlocks(H)) if (x + fw > b[0] && x - fw < b[2] && y + fh > b[1] && y - fh < b[3]) return false;
  return true;
}
// Vùng vướng: đồ đạc có khai báo block, cộng các vách ngăn giữa hai phòng
function roamBlocks(H){
  if (!H._blocks) H._blocks = [ ...H.objs.filter(o => o.block).map(o => o.block), ...(H.parts || []).map(x => [x - 6, 0, x + 6, 166]) ];
  return H._blocks;
}
// Đi một bước: vướng theo chiều nào thì trượt theo chiều còn lại (đi chéo vào tường vẫn trượt dọc được)
function roamStep(H, p, dx, dy){
  let moved = false;
  if (dx && roamFree(H, p.x + dx, p.y)) { p.x += dx; moved = true; }
  if (dy && roamFree(H, p.x, p.y + dy)) { p.y += dy; moved = true; }
  return moved;
}
function roamLine(H, a, b){
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3);
  for (let i = 1; i <= n; i++) if (!roamFree(H, a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false;
  return true;
}
// Điểm đi được gần nhất với một điểm bất kỳ (khi bấm trúng tường hay đồ đạc)
function roamNearestFree(H, p){
  if (roamFree(H, p.x, p.y)) return { x:p.x, y:p.y };
  for (let r = 3; r < 80; r += 3)
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, q = { x:p.x + Math.cos(a) * r, y:Math.max(ROAM.Y0, Math.min(ROAM.Y1, p.y + Math.sin(a) * r * .6)) }; if (roamFree(H, q.x, q.y)) return q; }
  return null;
}
// Tìm đường trên lưới ô nhỏ (A*), rồi bỏ bớt các điểm có thể đi thẳng qua. Trả về danh sách điểm cần đi qua, hoặc null.
function roamPath(H, from, to){
  const goal = roamNearestFree(H, to); if (!goal) return null;
  if (roamLine(H, from, goal)) return [goal];
  const C = ROAM.CELL, nx = Math.ceil((H.x1 - H.x0) / C) + 1, ny = Math.ceil((ROAM.Y1 - ROAM.Y0) / C) + 1;
  const pos = n => ({ x:H.x0 + (n % nx) * C, y:ROAM.Y0 + Math.floor(n / nx) * C });
  const idx = p => Math.max(0, Math.min(ny - 1, Math.round((p.y - ROAM.Y0) / C))) * nx + Math.max(0, Math.min(nx - 1, Math.round((p.x - H.x0) / C)));
  const free = new Map(), ok = n => { if (!free.has(n)) { const q = pos(n); free.set(n, roamFree(H, q.x, q.y)); } return free.get(n); };
  let s = idx(from); const t = idx(goal);
  if (!ok(s)) {                                                     // đang đứng sát đồ đạc: bắt đầu từ ô trống gần nhất
    let best = -1, bd = Infinity; const sj = Math.floor(s / nx), si = s % nx;
    for (let dj = -3; dj <= 3; dj++) for (let di = -3; di <= 3; di++) { const i = si + di, j = sj + dj; if (i < 0 || j < 0 || i >= nx || j >= ny) continue; const n = j * nx + i, q = pos(n), d = Math.hypot(q.x - from.x, q.y - from.y); if (d < bd && ok(n) && roamLine(H, from, q)) { bd = d; best = n; } }
    if (best < 0) return null; s = best;
  }
  const g = new Map([[s, 0]]), came = new Map(), open = new Set([s]), done = new Set();
  const h = n => { const a = pos(n), b = pos(t); const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y); return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy); };
  const f = new Map([[s, h(s)]]);
  let found = false;
  for (let guard = 0; open.size && guard < 6000; guard++) {
    let cur = null, best = Infinity; open.forEach(n => { const v = f.get(n); if (v < best) { best = v; cur = n; } });
    if (cur === t) { found = true; break; }
    open.delete(cur); done.add(cur);
    const ci = cur % nx, cj = Math.floor(cur / nx);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= nx || j >= ny) continue;
      const n = j * nx + i; if (done.has(n) || !ok(n)) continue;
      if (di && dj && (!ok(cj * nx + i) || !ok(j * nx + ci))) continue;      // không cắt góc qua đồ đạc
      const ng = g.get(cur) + (di && dj ? Math.SQRT2 : 1) * C;
      if (ng < (g.has(n) ? g.get(n) : Infinity)) { g.set(n, ng); f.set(n, ng + h(n)); came.set(n, cur); open.add(n); }
    }
  }
  if (!found) return null;
  const pts = []; for (let n = t; n !== s; n = came.get(n)) pts.unshift(pos(n));
  pts.unshift(pos(s)); pts[pts.length - 1] = goal;
  // rút gọn: từ mỗi điểm, nhảy thẳng tới điểm xa nhất còn nhìn thấy
  const out = []; let a = from, i = 0;
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !roamLine(H, a, pts[j])) j--; out.push(pts[j]); a = pts[j]; i = j + 1; }
  return out;
}
