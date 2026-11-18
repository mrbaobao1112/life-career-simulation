/* =========================================================
   THẾ GIỚI SỐNG – PHASE 3: PHỐ VÀ NGÕ CÓ NHỊP
   - Người đi bộ hai chiều trên vỉa hè; có người rẽ vào quán; trời mưa thì chạy vào mái hiên trú.
   - Xe máy chạy dưới lòng đường; giờ cao điểm đông hơn hẳn; có xe dừng trước quán một lát rồi đi tiếp.
   - Trong ngõ nhà: hàng xóm đứng nói chuyện, trẻ con chơi, người dắt chó đi dạo.
   - Hai người đi ngược chiều gặp nhau thì thỉnh thoảng dừng lại nói vài câu.
   Dựng sẵn một nhóm nhỏ nhân vật lúc vào phố rồi dùng lại (không tạo thêm); ngoài khung nhìn thì dịch chuyển thẳng.
   ========================================================= */
const PS = {
  WALK:H24('0,0,0,0,0,.2,.5,.9,.8,.5,.4,.5,.6,.5,.4,.5,.7,.9,.9,.7,.5,.3,.1,0'), WALK_CAP:6, WALK_WE:1.2,   // mật độ người đi bộ theo giờ
  BIKE:H24('0,0,0,0,0,.3,.6,1,.9,.5,.4,.5,.6,.5,.4,.5,.8,1,.9,.6,.4,.2,.1,0'), BIKE_CAP:3, BIKE_WE:.7,      // xe máy: cao điểm 7–8h và 17–18h
  ENTER:.18,                 // người đi bộ rẽ vào một quán
  STOP:.2,                   // xe máy dừng trước một quán
  MEET:.3,                   // hai người đi ngược chiều gặp nhau thì dừng nói chuyện
  STEP:140,                  // người đi bộ đi từng quãng chừng này (để dừng được giữa đường)
  SHELTER:[10, 25],          // trú mưa chừng này phút game
  SPAWN:.18, TICK:.5,
  LANES:[152, 166], ROAD:[198, 208],
};
const psWant = (arr, cap, we, t) => Math.round(Math.min(1, arr[Math.floor((t / 60) % 24)] * (songWeekend() ? we : 1)) * cap);
const psRain = () => S.flags.rainDay === S.day;
const psGreet = () => [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }];
function psAddSvg(a, cls, html){
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', cls); g.innerHTML = html;
  const flip = a.el.querySelector('.flip'); flip.insertBefore(g, flip.firstChild); return g;
}
function streetMount(W, api){
  const G = W.street = { acc:0, walk:[], bike:[], lane:[] };
  for (let k = 0; k < PS.WALK_CAP; k++) { const a = api.npc('p', -40, 152, '', false, { id:'w' + k, look:dsLook('pho' + k), speed:46 + k * 3, label:'Người đi đường' }); a.entries = psGreet; a.crowd = true; songHide(a, true); a.vis = null; G.walk.push(a); }
  for (let k = 0; k < PS.BIKE_CAP; k++) {
    const a = api.npc('p', -60, PS.ROAD[0], 'act-ride', false, { id:'b' + k, look:dsLook('xe' + k), speed:150, label:'Người đi xe máy' });
    psAddSvg(a, 'w-bike', `<g transform="scale(2.5)">${bikeSVG().replace('#E5484D', ['#2F6FD1', '#2E9E5B', '#3B4252'][k])}</g>`).setAttribute('transform', `translate(60 ${140 - XE.DY / a.s})`);
    a.dy = XE.DY; a.entries = () => []; a.crowd = a.ghost = true; songHide(a, true); a.vis = null; G.bike.push(a);
  }
  laneMount(W, api);
  const r = songRng('pfill' + Math.round(W.t / 30));                          // vào phố: đã có sẵn vài người đang đi
  for (let k = 0; k < Math.round(psWant(PS.WALK, PS.WALK_CAP, PS.WALK_WE, W.t) * .7); k++) psWalker(W, api, r, true);
}
// Một người đi bộ: từ một đầu phố sang đầu kia (hoặc rẽ vào quán), đi từng quãng
async function psWalker(W, api, r, mid){
  const a = W.street.walk.find(x => !x.vis); if (!a) return;
  const right = r() < .5, y = PS.LANES[right ? 0 : 1] + Math.round(r() * 6);
  const x0 = mid ? PHO.LANE + 40 + r() * (PHO.W - PHO.LANE - 120) : right ? PHO.LANE + 10 : PHO.W - 20, end = right ? PHO.W - 20 : PHO.LANE + 10;
  const door = r() < PS.ENTER ? PHO_DOORS.filter(d => (d.x + d.w / 2 - x0) * (right ? 1 : -1) > 80)[0] : null;
  const v = a.vis = { right, end:door ? door.x + door.w / 2 : end, y:door ? 162 : y, door:!!door, stop:null, met:false, shelter:false };
  songHide(a, false); a.rot = 0; a.s = roamScale(y); api.put(a, x0, y); api.C.face(a, !right); api.depthSort();
  while (a.vis === v && api.alive()) {
    if (v.stop) { await v.stop; v.stop = null; continue; }                   // đang dừng nói chuyện
    if (psRain() && !v.shelter) {                                            // mưa: chạy vào mái hiên gần nhất, trú một lúc
      v.shelter = true; api.C.act(a, 'act-run'); a.speed *= 1.8;
      const d = PHO_DOORS.reduce((b, x) => Math.abs(x.x + x.w / 2 - a.x) < Math.abs(b.x + b.w / 2 - a.x) ? x : b);
      const ok = await songWalk(W, api, a, { x:d.x + d.w / 2 + Math.round(r() * 30 - 15), y:158 }); a.speed /= 1.8; api.C.act(a, ''); if (!ok) return;
      songSign(a, '☔'); const until = W.t + PS.SHELTER[0] + r() * (PS.SHELTER[1] - PS.SHELTER[0]);
      while (W.t < until && api.alive()) if (!await api.wait(400)) return;
      songSign(a, ''); continue;
    }
    const dx = v.end - a.x; if (Math.abs(dx) < 4) break;
    const nx = Math.abs(dx) <= PS.STEP ? v.end : a.x + Math.sign(dx) * PS.STEP;
    if (!await songWalk(W, api, a, { x:nx, y:Math.abs(dx) <= PS.STEP ? v.y : a.y })) return;
  }
  if (a.vis === v) psDone(a);
}
function psDone(a){ songHide(a, true); a.vis = null; }
// Một xe máy chạy qua (có khi dừng trước quán một lát rồi đi tiếp)
async function psBike(W, api, r){
  const a = W.street.bike.find(x => !x.vis); if (!a) return;
  const right = r() < .5, y = PS.ROAD[right ? 0 : 1], from = right ? 10 : PHO.W - 10, to = right ? PHO.W - 10 : 10;
  a.vis = { right }; songHide(a, false); a.s = roamScale(y); api.put(a, from, y); api.C.face(a, !right); api.C.act(a, 'act-ride'); api.depthSort();
  const stop = r() < PS.STOP ? PHO_DOORS[Math.floor(r() * PHO_DOORS.length)] : null;
  if (stop) {
    if (!await songWalk(W, api, a, { x:stop.x + stop.w / 2, y })) return; api.C.act(a, 'act-ride'); songSign(a, '🛍️');
    if (!await api.wait(api.C.still ? 0 : 2500 + r() * 2500)) return; songSign(a, '');
  }
  if (await songWalk(W, api, a, { x:to, y })) { songHide(a, true); a.vis = null; }
}
function streetFrame(W, dt, api){
  const G = W.street; if (!G) return;
  G.acc += dt; if (G.acc < PS.TICK) return; G.acc = 0;
  const r = songRng('ps' + Math.round(W.t * 4));
  if (G.walk.filter(a => a.vis).length < psWant(PS.WALK, PS.WALK_CAP, PS.WALK_WE, W.t) && r() < PS.SPAWN) psWalker(W, api, r);
  if (G.bike.filter(a => a.vis).length < psWant(PS.BIKE, PS.BIKE_CAP, PS.BIKE_WE, W.t) && r() < PS.SPAWN) psBike(W, api, r);
  psMeetTick(W, api, r); laneFrame(W, api, r);
}
// Hai người đi ngược chiều gặp nhau: thỉnh thoảng dừng lại nói vài câu rồi đi tiếp (đứng yên giữa hai quãng đi)
function psMeetTick(W, api, r){
  const list = W.street.walk.filter(a => a.vis && !a.vis.door && !a.vis.stop && !a.vis.met && !a.vis.shelter && songInView(W, a.x));
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j]; if (a.vis.met || b.vis.met || a.vis.right === b.vis.right || Math.abs(a.x - b.x) > 60) continue;
    a.vis.met = b.vis.met = true; if (r() > PS.MEET || !wevAllow(W, 'street')) continue;
    wevMark(W, 'street');
    const l = pickLine(XG.greet.than.concat(GENERIC_CHAT), 'psmeet', r);
    const talk = (async () => {
      api.C.face(a, b.x < a.x); api.C.face(b, a.x < b.x); songSign(a, '💬'); songSign(b, '💬'); api.C.act(a, 'act-talk'); api.C.act(b, 'act-listen');
      for (let k = 0; k < l.length; k++) { if (!api.C.still) api.say(k % 2 ? b : a, l[k], 1400); if (!await api.wait(api.C.still ? 0 : 1500)) return; }
      [a, b].forEach(x => { songSign(x, ''); api.C.act(x, ''); if (x.vis) api.C.face(x, !x.vis.right); });
    })();
    a.vis.stop = b.vis.stop = talk;
  }
}

/* ----- Ngõ nhà: hàng xóm nói chuyện, trẻ con chơi, người dắt chó (giờ tính theo giờ trong ngày) ----- */
const LANE = { CHAT:[[6.5, 9], [16.5, 20]], KIDS:[[15.5, 18.5]], KIDS_WE:[[8.5, 11.5], [15, 18.5]], DOG:[[6, 7.5], [18, 20]], DOG_P:.05 };
const inH = (ranges, t) => ranges.some(([a, b]) => (t / 60) % 24 >= a && (t / 60) % 24 < b);
const DOG_SVG = '<g transform="translate(96 140)"><ellipse cx="0" cy="-14" rx="18" ry="9" fill="#C97B57"/><circle cx="17" cy="-22" r="8" fill="#C97B57"/><path d="M13 -29 l3 -8 l5 6Z" fill="#8C5A3C"/><circle cx="20" cy="-23" r="1.6" fill="#2B2B2B"/><path d="M-10 -6 v8 M10 -6 v8" stroke="#8C5A3C" stroke-width="4"/><path d="M-18 -16 q-9 -9 -6 -15" stroke="#C97B57" stroke-width="3.5" fill="none"/><path d="M60 -60 L14 -26" stroke="#59606C" stroke-width="1.5"/></g>';
function laneMount(W, api){
  const G = W.street, mk = (id, x, y, left, label, s) => { const a = api.npc('p', x, y, '', left, { id, look:dsLook('ngo' + id), label }); a.fixed = true; a.crowd = true; if (s) { a.s = s; api.put(a, x, y); } a.entries = psGreet; songHide(a, true); return a; };
  G.lane = [mk('hx1', 236, 166, false, 'Bác hàng xóm'), mk('hx2', 272, 168, true, 'Cô hàng xóm'), mk('kid1', 300, 192, false, 'Bé hàng xóm', .36), mk('kid2', 340, 198, true, 'Bé hàng xóm', .36), mk('dog', 20, 190, false, 'Người dắt chó')];
  psAddSvg(G.lane[4], 'w-dog', DOG_SVG); G.lane[4].fixed = false;
  laneFrame(W, api, songRng('lane'), true);
}
function laneFrame(W, api, r, first){
  const G = W.street, [h1, h2, k1, k2, dw] = G.lane; if (!h1) return;
  const t = W.t, rain = psRain(), chat = !rain && inH(LANE.CHAT, t), kids = !rain && inH(songWeekend() ? LANE.KIDS_WE : LANE.KIDS, t), dog = !rain && inH(LANE.DOG, t);
  if (first || h1.gone === chat) { [h1, h2].forEach(a => songHide(a, !chat)); if (chat) { api.C.act(h1, 'act-talk'); api.C.act(h2, 'act-listen'); songSign(h1, '💬'); } }
  if (chat && !first && !api.C.still && songInView(W, h1.x) && r() < .03) { const l = pickLine(XG.family, 'hx', r); api.say(h1, l[0], 1500); api.C.later(() => api.say(h2, l[1], 1500), 1600); }
  if (first || k1.gone === kids) [k1, k2].forEach(a => songHide(a, !kids));
  if (kids && !first && !api.C.still && songInView(W, k1.x) && r() < .15) api.C.react(r() < .5 ? k1 : k2, 'jump');
  if (dog && !dw.vis && r() < (first ? .5 : LANE.DOG_P)) {                   // người dắt chó đi từ đầu ngõ ra phố rồi khuất
    dw.vis = {}; songHide(dw, false); api.put(dw, 20, 190); api.C.face(dw, false); songSign(dw, '🐕');
    songWalk(W, api, dw, { x:PHO.LANE + 360, y:190 }).then(ok => { if (ok) { songHide(dw, true); dw.vis = null; } });
  }
}
