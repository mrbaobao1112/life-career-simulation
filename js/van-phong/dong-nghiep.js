/* =========================================================
   v15: ĐỒNG NGHIỆP TRONG VĂN PHÒNG ĐI LẠI ĐƯỢC
   Mỗi người ngồi ở bàn mình (người nghỉ phép thì vắng, theo lịch văn phòng có sẵn: officeDay()).
   Thỉnh thoảng một người ra pantry lấy nước rồi quay về; mỗi lúc chỉ một người rời bàn nên không ai đứng trùng chỗ.
   Đường đi tìm bằng cùng hàm với nhân vật chính (roamPath), nên không đi xuyên bàn ghế.
   ========================================================= */
const VP_NPC = {
  WANDER:[12000, 24000],     // khoảng nghỉ giữa hai lần có người rời bàn (mili giây ngoài đời)
  PANTRY_MS:[3500, 6000],    // đứng ở pantry bao lâu
  SPEED:52,                  // tốc độ đi của đồng nghiệp
};
// Tư thế ngồi làm việc theo tính cách: chị Hạnh hay đọc tài liệu, anh Dũng gõ phím chăm chú, Phong hay nghĩ
const VP_SIT = { boss:'act-read', dung:'act-type', mai:'act-type', phong:'act-think' };
const vpRnd = (a, b) => a + Math.random() * (b - a);

function officeCastMount(W, api){
  const M = W.H, C = api.C;
  W.npcs = [];
  DESK_ORDER.filter(k => k !== 'me' && !M.absent.includes(k)).forEach(who => {
    const d = M.desks[who], a = C.add(who, d.x, d.y, 'world', VP_SIT[who], undefined, { s:roamScale(d.y) });
    C.face(a, true); a.speed = VP_NPC.SPEED; a.home = { x:d.x, y:d.y, name:VP_SIT[who], lie:false };
    api.put(a, d.x, d.y); W.npcs.push(a);
  });
  api.depthSort();
  if (C.still) return;
  (async () => {                                             // lịch nhỏ: thỉnh thoảng một người ra pantry
    while (await api.wait(vpRnd(...VP_NPC.WANDER))) {
      if (W.npcAway || W.busy) continue;
      const free = W.npcs.filter(a => a.who !== 'boss' || Math.random() < .3);
      const a = pick(free); if (!a) continue;
      W.npcAway = a; await npcTrip(W, api, a, M.pantry, 'act-drink', vpRnd(...VP_NPC.PANTRY_MS)); W.npcAway = null;
    }
  })();
}
// Đi theo đường tìm được, từng đoạn; đổi cỡ theo chiều sâu ở mỗi điểm
async function npcWalk(W, api, a, to){
  const path = roamPath(W.H, { x:a.x, y:a.y }, to) || [to];
  for (const p of path) {
    a.s = roamScale(p.y);
    if (!await api.C.walk(a, p.x, p.y)) return false;
    a.el.dataset.y = p.y; api.depthSort();
  }
  return api.alive();
}
async function npcTrip(W, api, a, to, act, ms){
  const back = { x:a.home.x, y:a.home.y };
  if (!await npcWalk(W, api, a, { x:to.x + (Math.random() - .5) * 30, y:to.y })) return;
  api.C.act(a, act); if (!await api.wait(ms)) return;
  api.C.act(a, ''); if (!await npcWalk(W, api, a, back)) return;
  api.C.face(a, true); api.C.act(a, a.home.name);
}
// Chị Hạnh đi đến chỗ bạn (khi bỏ bàn quá lâu), nói một câu rồi về bàn
async function bossVisit(W, api, line){
  const b = W.npcs.find(n => n.who === 'boss'); if (!b) return;
  while (W.npcAway && W.npcAway !== b) { if (!await api.wait(400)) return; }
  W.npcAway = b;
  const side = W.me.x > b.x ? -28 : 28;
  if (await npcWalk(W, api, b, { x:W.me.x + side, y:Math.max(ROAM.Y0, Math.min(ROAM.Y1, W.me.y)) })) {
    api.C.face(b, W.me.x < b.x); api.C.face(W.me, b.x < W.me.x); api.C.act(b, 'act-talk');
    api.say(b, line, 2400); SFX.play('dun');
    if (await api.wait(api.C.still ? 0 : 2400)) { api.C.act(b, ''); if (await npcWalk(W, api, b, { x:b.home.x, y:b.home.y })) { api.C.face(b, true); api.C.act(b, b.home.name); } }
  }
  W.npcAway = null;
}
