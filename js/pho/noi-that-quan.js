/* =========================================================
   v16: BÊN TRONG CÁC QUÁN – cà phê, trà đá vỉa hè, bia hơi, cơm bụi
   Mỗi nơi khai báo bằng dữ liệu (PHO_ROOMS): bề rộng, hình vẽ, đồ vật và người có mặt.
   Đồ vật kiểu 'act' nối với các lựa chọn có sẵn: acts (việc lúc rảnh, theo actId) hoặc meals (bữa ăn, theo key).
   ========================================================= */
const PHO_ROOMS = {};
const PASSER = i => PASSER_LOOKS[i % PASSER_LOOKS.length];
// Dựng bản đồ một nơi từ dữ liệu: thêm cửa ra phố, tường, sàn
function phoRoom(id){
  const R = PHO_ROOMS[id]; if (R._map && R._map.day === S.day) return R._map;
  const exitTo = R.exitTo || phoDoorSpot(phoDoor(id));
  const objs = [obj('exit', 'go', R.exitName || 'Ra phố', '🚪', [10, 50, 60, 146], [8, 0, 58, 150], { x:40, y:166 }, { to:'street', enter:exitTo }), ...R.objs()];
  const paint = () => PFURN.wall(0, R.W, R.wall[0], R.wall[1]) + (R.floor === 'tiles' ? PFURN.tiles(0, R.W, R.fl[0], R.fl[1]) : PFURN.floor(0, R.W, R.fl[0], R.fl[1])) + R.paint() + PFURN.exit(14, R.exitName || 'Ra phố');
  R._map = { day:S.day, key:id, name:R.name, W:R.W, x0:8, x1:R.W - 8, parts:[], objs, rooms:[[R.name, 0, R.W]], spawn:{ x:62, y:172 }, paint, deco:() => '' };
  return R._map;
}

/* ----- Quán cà phê trứng: quầy, bàn, Linh ngồi chờ, ban công nhìn xuống phố ----- */
PHO_ROOMS['in:cafe'] = { name:'Quán cà phê trứng', W:460, wall:['#F3E3CF','#D9C2A3'], floor:'floor', fl:['#B08968','#9C7757'],
  paint:() => PFURN.counter(80, 90) + `<rect x="96" y="70" width="16" height="28" rx="2" fill="#3A3F4B"/><rect x="120" y="76" width="40" height="22" rx="2" fill="#F4F1EA" stroke="#C9BFAE"/><text x="140" y="90" text-anchor="middle" font-size="6.5" font-weight="700" fill="#8C5A3C" font-family="Be Vietnam Pro,Arial">CÀ PHÊ TRỨNG 35K</text>`
    + PFURN.cafeTable(230) + FURN.chair(222, 152) + FURN.chair(282, 152) + PFURN.cafeTable(320) + FURN.win(370, 70, 60, 24) + FURN.plant(440, 150) + FURN.lamp(250) + FURN.lamp(340),
  objs:() => [obj('counter', 'minor', 'Quầy pha chế', '☕', [80, 66, 170, 152], [78, 0, 172, 154], { x:125, y:166 }, { minor:'takeaway' }),
              obj('table', 'act', 'Bàn bên cửa sổ', '🪑', [222, 110, 290, 156], [226, 0, 278, 152], { x:254, y:168 }, { acts:['cafe'], act:'act-sip' }),
              obj('balcony', 'minor', 'Ban công tầng 3', '🌆', [366, 22, 434, 96], null, { x:400, y:162 }, { minor:'view' })],
  npcs:() => [{ who:'linh', x:300, y:156, act:'act-sip', left:true, need:'cafe' }, { who:'p', x:150, y:150, act:'', look:PASSER(1), label:'Chị pha chế', left:true }],
};
/* ----- Trà đá vỉa hè: ghế nhựa xanh, ấm trà, đĩa hướng dương, Tùng ngồi sẵn ----- */
PHO_ROOMS['in:trada'] = { name:'Quán trà đá vỉa hè', W:400, wall:['#E9DCC4','#CDBB9A'], floor:'tiles', fl:['#D9CDB8','#C9BCA4'], exitName:'Ra phố',
  paint:() => PFURN.house(80, 140, '#D8C8A8', 3) + `<path d="M70 86 H330 L320 100 H80Z" fill="#2E9E5B"/>` + PFURN.tree(350, 90)
    + PFURN.lowTable(180, 60) + PFURN.stool(170) + PFURN.stool(254, '#E07A5F') + PFURN.stool(214, '#3E8ED0') + `<rect x="110" y="128" width="24" height="24" rx="4" fill="#B9C2CC"/><path d="M134 136 q8 0 8 8" stroke="#B9C2CC" stroke-width="3" fill="none"/>`,
  objs:() => [obj('stools', 'act', 'Ghế nhựa, ấm trà', '🧊', [160, 120, 270, 166], [168, 0, 246, 158], { x:210, y:174 }, { acts:['trada'], act:'act-drink' }),
              obj('kettle', 'minor', 'Ấm trà đá', '🫖', [104, 120, 140, 156], [106, 0, 138, 156], { x:122, y:168 }, { minor:'sipTea' })],
  npcs:() => [{ who:'tung', x:262, y:160, act:'act-talk', left:true, need:'trada' }, { who:'p', x:112, y:150, act:'', look:PASSER(4), label:'Bác bán trà đá' }],
};
/* ----- Bia hơi: bàn nhựa dài, két bia, TV bóng đá; chiều mới mở ----- */
PHO_ROOMS['in:bia'] = { name:'Bia hơi Hà Thành', W:440, wall:['#F6E7C8','#E0C68E'], floor:'tiles', fl:['#C9BCA4','#B9AC94'],
  paint:() => PFURN.tv(190, 30) + PFURN.keg(90) + PFURN.keg(124) + PFURN.lowTable(200, 120, '#3E8ED0') + PFURN.stool(196) + PFURN.stool(330, '#E07A5F') + PFURN.sign(220, 82, 'BIA HƠI 15K', '#E9A23B') + FURN.lamp(220),
  objs:() => [obj('tv', 'minor', 'TV bóng đá', '⚽', [186, 26, 254, 80], null, { x:220, y:170 }, { minor:'football' }),
              obj('kegs', 'minor', 'Két bia', '🍺', [86, 96, 158, 152], [86, 0, 158, 154], { x:122, y:166 }, { minor:'beer' })],
  npcs:() => [{ who:'p', x:300, y:162, act:'act-drink', look:PASSER(2), left:true }, { who:'p', x:240, y:162, act:'act-laugh', look:PASSER(0) }],
};
/* ----- Cơm bụi đầu ngõ: tủ kính thức ăn, cô bán hàng, bàn ghế ----- */
PHO_ROOMS['in:com'] = { name:'Cơm bụi đầu ngõ', W:400, wall:['#FBE9D2','#E7C9A3'], floor:'tiles', fl:['#E8DCC8','#D6C7AE'],
  paint:() => PFURN.glassCase(90, 110) + PFURN.lowTable(240, 70, '#3E8ED0') + PFURN.stool(232) + PFURN.stool(322, '#E07A5F') + PFURN.sign(145, 76, 'CƠM 35K · THÊM TRỨNG 5K', '#C0392B'),
  objs:() => [obj('case', 'act', 'Tủ cơm', '🍛', [86, 96, 204, 152], [86, 0, 204, 154], { x:146, y:166 }, { meals:['rice','tab'], act:'act-eat', x:270, y:160 })],
  npcs:() => [{ who:'p', x:180, y:150, act:'', look:PASSER(3), label:'Cô bán cơm', left:true }],
};
