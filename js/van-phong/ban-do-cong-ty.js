/* =========================================================
   v15: BẢN ĐỒ VĂN PHÒNG – bốn kiểu văn phòng, mỗi công ty trang trí riêng
   Văn phòng được ghép từ bốn khu đặt cạnh nhau: sảnh → khu làm việc → chỗ họp → pantry.
   Mỗi kiểu (OFFICE_TYPE) quy định bề rộng và đồ đạc từng khu; mỗi công ty (CO_LOOK) quy định màu và đồ riêng.
   Bàn làm việc xếp theo thứ tự DESK_ORDER; người ngồi đứng bên phải bàn, quay sang trái để gõ máy (như bàn học ở nhà).
   Kết quả cùng dạng với bản đồ nhà (ban-do-nha.js) nên dùng chung bộ máy đi lại, va chạm, tìm đường.
   ========================================================= */
const DESK_ORDER = ['me','phong','dung','mai','boss'];
// Công ty → kiểu văn phòng
const CO_OFFICE = { hotay:'lon', songhong:'lon', banhmi:'sp', trasua:'sp', cudem:'st', xeom:'st', loren:'nho', giaytot:'nho' };
const OFFICE_TYPE = {
  lon: { name:'Văn phòng lớn', lobby:170, deskW:64, step:90, meet:150, pantry:130, wall:['#EEF2F7','#D3DBE6'], floor:['#B7C0CC','#A6B0BD'], carpet:true },
  sp:  { name:'Không gian mở', lobby:110, deskW:62, step:88, meet:140, pantry:150, wall:['#FFF7EC','#EAD9BF'], floor:['#D9B98C','#C7A576'] },
  st:  { name:'Startup', lobby:90, deskW:56, step:78, meet:120, pantry:110, wall:['#2F2A45','#241F38'], floor:['#5B5470','#4D4762'], dark:true },
  nho: { name:'Văn phòng nhỏ', lobby:120, deskW:58, step:80, meet:100, pantry:80, wall:['#F1E9DA','#D8CBB4'], floor:['#B8A88E','#A69579'] },
};
// Màu và đồ trang trí riêng của từng công ty
const CO_LOOK = {
  hotay:    { c:'#2F6FD1', food:null },
  songhong: { c:'#2A9D8F', food:null },
  banhmi:   { c:'#E9A23B', food:'banhmi' },
  trasua:   { c:'#9D4EDD', food:'trasua' },
  cudem:    { c:'#7B61FF', neon:['CÚ ĐÊM', '#C77DFF'], cat:true },
  xeom:     { c:'#2E9E5B', neon:['XE ÔM XANH', '#57E389'], helmets:true },
  loren:    { c:'#8C5A3C', fan:true },
  giaytot:  { c:'#6C757D', fan:true },
};

function buildOffice(k){
  const T = OFFICE_TYPE[CO_OFFICE[k] || 'lon'], L = CO_LOOK[k] || CO_LOOK.hotay, c = L.c;
  const absent = (typeof officeDay === 'function' && S.job && S.job.co === k ? officeDay().absent : []) || [];
  const objs = [], parts = [], rooms = [], desks = {}, wall = [], deco = [];
  let x = 8;
  const room = (name, w, wc = T.wall, fl = T.floor, carpet = T.carpet) => {
    rooms.push([name, x, x + w]);
    wall.push(FURN.wall(x - (x === 8 ? 8 : 0), x + w + 8, wc[0], wc[1]), carpet ? FURN.tiles(x - (x === 8 ? 8 : 0), x + w + 8, fl[0], fl[1]) : FURN.floor(x - (x === 8 ? 8 : 0), x + w + 8, fl[0], fl[1]));
    const x0 = x; x += w; return x0;
  };

  /* --- sảnh: cửa ra vào, biển tên công ty --- */
  const lx = room('Sảnh', T.lobby, ['#F4F6F9','#DCE3EC'], ['#E3E8EF','#CCD4DE'], true);
  deco.push(FURN.door(lx + 4, c), OFURN.sign(lx + 52, k, c), FURN.plant(lx + T.lobby - 14, 152));
  objs.push(obj('door', 'door', 'Cửa ra vào', '🚪', [lx + 2, 52, lx + 42, 146], [lx, 0, lx + 42, 150], { x:lx + 22, y:166 }, { exit:true }));
  if (CO_OFFICE[k] === 'lon') {
    deco.push(OFURN.reception(lx + 58, c), OFURN.timeclock(lx + 140));
    objs.push(obj('reception', 'deco', 'Quầy lễ tân', '🛎️', [lx + 58, 90, lx + 132, 152], [lx + 56, 0, lx + 134, 154], { x:lx + 96, y:168 }),
              obj('timeclock', 'clock', 'Máy chấm công', '⏱️', [lx + 138, 66, lx + 164, 102], null, { x:lx + 150, y:166 }));
  } else if (CO_OFFICE[k] === 'nho') {
    deco.push(OFURN.printer(lx + 66));
    objs.push(obj('printer', 'printer', 'Máy in', '🖨️', [lx + 64, 84, lx + 108, 152], [lx + 64, 0, lx + 108, 154], { x:lx + 86, y:166 }));
  }
  if (L.neon) deco.push(OFURN.neon(lx + T.lobby / 2 + 20, 84, L.neon[0], L.neon[1]));   // v17.9: hạ chữ neon xuống (biển tên đã dời xuống dưới thanh thời gian)
  if (L.helmets) deco.push(OFURN.helmets(lx + 50));
  parts.push(x);

  /* --- khu làm việc: năm bàn, bàn của bạn ở đầu --- */
  const wx = room('Khu làm việc', T.step * DESK_ORDER.length + 20);
  if (CO_OFFICE[k] === 'st') deco.push(OFURN.longTable(wx + 8, T.step * DESK_ORDER.length - 14));
  if (CO_OFFICE[k] === 'sp') deco.push(OFURN.board(wx + 40, 120), OFURN.board(wx + 250, 100));
  else wall.push(FURN.win(wx + 60, 60), FURN.win(wx + 260, 60));
  if (CO_OFFICE[k] === 'nho') deco.push(OFURN.papers(wx + T.step * 2 - 18), OFURN.papers(wx + T.step * 4 - 18));
  DESK_ORDER.forEach((who, i) => {
    const dx = wx + 10 + i * T.step, w = T.deskW, me = who === 'me';
    deco.push(CO_OFFICE[k] === 'st' ? OFURN.desk(dx, w, me, 'transparent') : OFURN.desk(dx, w, me), FURN.chair(dx + w + 10, 152));
    if (absent.includes(who)) deco.push(OFURN.away(dx));
    desks[who] = { x:dx + w + 10, y:158, dx, w };
    if (me) objs.push(obj('mydesk', 'mydesk', 'Bàn của bạn', '💻', [dx, 80, dx + w, 156], [dx, 0, dx + w, 156], { x:dx + w + 10, y:164, face:true }, { act:'act-type', x:dx + w + 10, y:156, face:true, scr:true }));
    else objs.push(obj('desk_' + who, 'deco', 'Bàn của ' + NPC[who].name, '🖥️', [dx, 80, dx + w, 156], [dx, 0, dx + w, 156], { x:dx + w + 10, y:170 }));
  });
  parts.push(x);

  /* --- chỗ họp --- */
  const mx = room(CO_OFFICE[k] === 'lon' ? 'Phòng họp' : 'Góc họp', T.meet, CO_OFFICE[k] === 'st' ? ['#3A3356','#2F2A45'] : T.wall);
  if (CO_OFFICE[k] === 'lon') { deco.push(OFURN.board(mx + 30, 90), OFURN.meetTable(mx + 34, 82)); }
  else if (CO_OFFICE[k] === 'sp') { deco.push(OFURN.wallTv(mx + 34), FURN.sofa(mx + 26, 86, '#2F6FD1')); }
  else if (CO_OFFICE[k] === 'st') { deco.push(OFURN.neon(mx + T.meet / 2, 54, '★ STANDUP ★', '#F6C85F'), OFURN.beanbag(mx + 14, '#E07A5F'), OFURN.beanbag(mx + 64, '#57E389')); }
  else { deco.push(OFURN.board(mx + 12, 70), OFURN.meetTable(mx + 26, 46)); }
  objs.push(obj('meet', 'meet', CO_OFFICE[k] === 'lon' ? 'Phòng họp' : 'Chỗ họp', '🗣️', [mx + 10, 24, mx + T.meet - 10, 156], CO_OFFICE[k] === 'st' ? null : [mx + 18, 0, mx + T.meet - 18, 152], { x:mx + T.meet / 2, y:174 }));
  parts.push(x);

  /* --- pantry: máy nước, cà phê (hoặc quầy đồ ăn của công ty) --- */
  const px = room('Pantry', T.pantry, ['#F4EFE6','#DCD2C0'], ['#E8DCC8','#D6C7AE'], true);
  deco.push(OFURN.water(px + 8));
  objs.push(obj('water', 'water', 'Máy nước', '🚰', [px + 6, 70, px + 36, 152], [px + 6, 0, px + 36, 154], { x:px + 22, y:166 }, { act:'act-drink' }));
  if (T.pantry >= 110) {
    const cw = T.pantry - 50; deco.push(OFURN.counter(px + 42, cw), OFURN.coffee(px + 48));
    if (L.food) deco.push(OFURN.food(px + 78, L.food));
    objs.push(obj('coffee', 'coffee', L.food ? 'Quầy cà phê, đồ ăn' : 'Máy pha cà phê', '☕', [px + 42, 78, px + 42 + cw, 152], [px + 42, 0, px + 42 + cw, 154], { x:px + 42 + cw / 2, y:166 }, { act:'act-drink', steam:true }));
  }
  if (L.fan) deco.push(OFURN.fan(px + T.pantry - 26));
  x += 8;

  const W = x;
  return { key:'office:' + k, name:COMPANIES[k].name, kind:T.name, W, x0:8, x1:W - 8, rooms, parts, objs, desks, absent,
    spawn:{ x:lx + 46, y:176 }, pantry:{ x:px + T.pantry / 2, y:176 }, meetSpot:{ x:mx + T.meet / 2, y:176 },
    cat: L.cat ? [wx + 20, mx + T.meet - 20] : null,
    paint:() => wall.join(''), deco:() => parts.map(p => CO_OFFICE[k] === 'lon' ? OFURN.glass(p) : FURN.part(p)).join('') + deco.join('') + (L.cat ? OFURN.cat(wx + 20, mx + T.meet - 20) : '') };
}
// Bản đồ văn phòng của công ty đang làm (tính lại mỗi ngày vì người nghỉ phép thay đổi)
let OFFICE_MAP = null;
function officeMap(){
  const k = S.job ? S.job.co : 'hotay', tag = k + ':' + S.day;
  if (!OFFICE_MAP || OFFICE_MAP.tag !== tag) { OFFICE_MAP = buildOffice(k); OFFICE_MAP.tag = tag; }
  return OFFICE_MAP;
}
