/* =========================================================
   v16: BẢN ĐỒ PHỐ – ngõ nhà (mỗi hoàn cảnh một kiểu) nối ra phố chính Bán Nguyệt
   Phố chính dùng chung: các cửa dẫn vào địa điểm (PHO_DOORS). Đồ vật kiểu 'go' là lối đi sang nơi khác.
   ========================================================= */
const PHO = {
  LANE:400,                  // bề rộng ngõ nhà
  W:2080,                    // tổng bề rộng (ngõ + phố chính)
};
// Cửa các địa điểm trên phố chính: x là mép trái mặt tiền, w là bề rộng, to là nơi dẫn vào
const PHO_DOORS = [
  { to:'in:com',   x:420,  w:130, name:'Cơm bụi', icon:'🍛', c:'#C0392B' },
  { to:'in:trada', x:580,  w:120, name:'Trà đá', icon:'🧊', c:'#2E9E5B', stall:true },
  { to:'in:cafe',  x:730,  w:150, name:'Cà phê trứng', icon:'☕', c:'#8C5A3C', floors:4 },
  { to:'in:bia',   x:910,  w:130, name:'Bia hơi', icon:'🍺', c:'#E9A23B' },
  { to:'phuong',   x:1070, w:150, name:'UBND phường', icon:'🏛️', c:'#B5462E', floors:3 },
  { to:'in:lib',   x:1250, w:150, name:'Thư viện quận', icon:'📚', c:'#2F6FD1', floors:3 },
  { to:'in:lake',  x:1430, w:170, name:'Hồ Bán Nguyệt', icon:'🌳', c:'#4F9D69', park:true },
  { to:'in:mall',  x:1630, w:220, name:'Trung tâm thương mại', icon:'🛍️', c:'#9D4EDD', floors:5 },
  { to:'in:bus',   x:1880, w:180, name:'Bến xe khách', icon:'🚌', c:'#E07A5F' },
];
const phoDoor = to => PHO_DOORS.find(d => d.to === to);
const phoDoorSpot = d => ({ x:d.x + d.w / 2, y:166 });
// Ngõ nhà theo hoàn cảnh
const PHO_LANE = {
  nha:  { name:'Ngõ nhà bố mẹ', wall:'#F1DCC4', paint:x => PFURN.gate(x + 34, '#59606C') + PFURN.bougain(x + 104) + PFURN.tree(x + 330, 70), door:'Cổng nhà' },
  tro:  { name:'Ngõ dãy trọ', wall:'#E2D9C6', paint:x => PFURN.house(x + 20, 100, '#D8C8A8', 3) + PFURN.house(x + 130, 120, '#CFC0A0', 3) + `<rect x="${x + 50}" y="100" width="40" height="40" fill="#5B5B5B"/>` + PFURN.sign(x + 70, 86, 'Phòng trọ', '#8C5A3C'), door:'Cửa phòng trọ' },
  ghep: { name:'Sảnh chung cư mini', wall:'#DCE6F0', paint:x => PFURN.house(x + 10, 220, '#C9D6E3', 3) + `<rect x="${x + 44}" y="96" width="44" height="46" fill="#9AA3AF"/><rect x="${x + 48}" y="100" width="17" height="42" fill="#D5DAE1"/><rect x="${x + 67}" y="100" width="17" height="42" fill="#D5DAE1"/>` + PFURN.sign(x + 66, 82, 'Thang máy', '#2F6FD1'), door:'Cửa thang máy' },
};

let PHO_MAP = null;
function phoMap(){
  const bg = S.bg in PHO_LANE ? S.bg : 'tro', tag = bg;
  if (PHO_MAP && PHO_MAP.tag === tag) return PHO_MAP;
  const L = PHO_LANE[bg], objs = [], back = [], front = [];
  // ngõ
  back.push(PFURN.sky(0, PHO.LANE), PFURN.laneWall(0, PHO.LANE, L.wall), L.paint(0), `<path d="M0 24 Q200 48 ${PHO.LANE} 26" stroke="#2B2B2B" stroke-width="1.2" fill="none"/>`);
  objs.push(obj('home', 'go', L.door, '🏠', [36, 64, 96, 146], null, { x:66, y:164 }, { to:'home' }),
            obj('xe', 'bike', 'Chỗ để xe máy', '🛵', [130, 120, 200, 182], null, { x:166, y:178 }));
  // phố chính
  back.push(PFURN.sky(PHO.LANE, PHO.W));
  PHO_DOORS.forEach(d => {
    back.push(PFURN.house(d.x, d.w, shade(d.c, .45), d.floors || 3));
    if (d.park) back.push(`<rect x="${d.x}" y="60" width="${d.w}" height="80" fill="#9FD8A8"/>` + PFURN.tree(d.x + 30, 90) + PFURN.tree(d.x + d.w - 30, 80) + `<rect x="${d.x + d.w / 2 - 30}" y="76" width="60" height="64" fill="none" stroke="#59606C" stroke-width="5"/>` + PFURN.sign(d.x + d.w / 2, 60, d.icon + ' ' + d.name, d.c));
    else if (d.stall) back.push(`<path d="M${d.x - 6} 86 H${d.x + d.w + 6} L${d.x + d.w} 100 H${d.x}Z" fill="${d.c}"/>` + PFURN.sign(d.x + d.w / 2, 70, d.icon + ' ' + d.name, d.c) + PFURN.lowTable(d.x + 30, 56, '#E07A5F') + PFURN.stool(d.x + 20) + PFURN.stool(d.x + 98, '#E07A5F'));
    else back.push(PFURN.shop(d.x, d.w, d.name, d.c, d.icon, d.to === 'in:mall' ? 70 : 40));
    const sp = phoDoorSpot(d);
    objs.push(obj('d_' + d.to, d.to === 'phuong' ? 'phuong' : 'go', d.name, d.icon, [d.x + d.w / 2 - 34, 56, d.x + d.w / 2 + 34, 150], null, sp, { to:d.to }));
  });
  for (let x = PHO.LANE + 150; x < PHO.W; x += 300) back.push(PFURN.pole(x));
  for (let x = PHO.LANE + 40; x < PHO.W; x += 230) back.push(PFURN.lamp(x));
  back.push(PFURN.road(0, PHO.W), `<rect x="${PHO.LANE - 6}" y="140" width="6" height="40" fill="#B9AC94"/>`);
  front.push(PFURN.sign(PHO.LANE - 90, 104, 'Ra phố Bán Nguyệt →', '#2E9E5B'));
  PHO_MAP = { tag, key:'street:' + bg, name:'Phố Hà Thành', W:PHO.W, x0:8, x1:PHO.W - 8, parts:[], objs,
    rooms:[[L.name, 0, PHO.LANE], ['Phố Bán Nguyệt', PHO.LANE, PHO.W]], spawn:{ x:66, y:170 },
    paint:() => back.join(''), deco:() => front.join('') };
  return PHO_MAP;
}
