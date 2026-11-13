/* =========================================================
   v14: BẢN ĐỒ NHÀ – ba căn nhà cho ba hoàn cảnh (ở với bố mẹ, ở trọ, ở ghép với Tùng)
   Chỉ có DỮ LIỆU và HÌNH VẼ: tường, đồ đạc, chỗ đứng để dùng đồ, ai sống ở đâu.
   Không có luật chơi ở đây: mỗi đồ vật chỉ là một lối vào cho các lựa chọn có sẵn (xem tuong-tac.js).
   Toạ độ: khung nhìn rộng 360, cao 220. Tường phía sau từ y=0 đến 140, sàn từ 140 đến 220.
   Chân nhân vật đi trong dải y = ROAM.Y0…ROAM.Y1 (càng lớn càng gần người xem, nhân vật to hơn).
   ========================================================= */
const ROAM = {
  VIEW_W:360, VIEW_H:220,
  Y0:148, Y1:212,            // dải sàn chân nhân vật đi được (phía trong → phía ngoài)
  S0:.44, SK:.0019,           // cỡ nhân vật ở phía trong cùng, và mức to thêm mỗi đơn vị đi ra phía ngoài
  SPEED:74,                  // tốc độ đi bộ (đơn vị hình mỗi giây, theo chiều ngang)
  DEPTH:.62,                 // đi vào trong / ra ngoài chậm hơn đi ngang (vì là chiều sâu)
  FOOT:[6, 3],               // nửa bề ngang và nửa bề sâu của bàn chân khi tính va chạm
  NEAR:24,                   // đứng gần đồ vật chừng này thì hiện gợi ý [E]
  CELL:6,                    // cỡ một ô lưới khi tìm đường
  MIN_PER_SEC:2,             // đồng hồ trong game: 1 giây ngoài đời = 2 phút trong game (buổi sáng chừng 1,5–2 phút chơi)
  ACT_MS:1500,               // thời gian diễn động tác khi dùng đồ (đồng hồ quay nhanh đến cuối buổi)
  SHOWER_MIN:20, SHOWER_MOOD:2,   // tắm: mất 20 phút, tinh thần +2, mỗi ngày tính một lần
  SIP_MIN:5, LOOK_MIN:10,    // uống cốc nước, ngắm phố qua cửa sổ: chỉ tốn ít phút, không đổi chỉ số
  GREET_R:46,                // người nhà chào khi bạn đi đến gần chừng này
};
const roamScale = y => Math.round((ROAM.S0 + (Math.max(ROAM.Y0, Math.min(ROAM.Y1, y)) - ROAM.Y0) * ROAM.SK) * 1000) / 1000;

/* ----- Đồ đạc vẽ sẵn (x là mép trái; đáy đồ đạc chạm sàn phía trong ở y≈140) ----- */
const WOOD = '#8C6E54', WOOD_D = '#6E5440', INK = '#2B3240';
const FURN = {
  wall: (x1, x2, c, c2) => `<rect x="${x1}" y="0" width="${x2 - x1}" height="140" fill="${c}"/><rect x="${x1}" y="0" width="${x2 - x1}" height="8" fill="${c2}"/><rect x="${x1}" y="132" width="${x2 - x1}" height="8" fill="${c2}"/>`,
  floor: (x1, x2, c, line) => { let s = `<rect x="${x1}" y="140" width="${x2 - x1}" height="80" fill="${c}"/>`;
    for (let y = 152; y < 220; y += 14) s += `<path d="M${x1} ${y} H${x2}" stroke="${line}" stroke-width="1"/>`;
    for (let x = x1 + 30; x < x2; x += 60) s += `<path d="M${x} 140 V152 M${x + 30} 152 V166 M${x} 166 V180 M${x + 30} 180 V194 M${x} 194 V208" stroke="${line}" stroke-width="1"/>`;
    return s; },
  tiles: (x1, x2, c, line) => { let s = `<rect x="${x1}" y="140" width="${x2 - x1}" height="80" fill="${c}"/>`;
    for (let y = 154; y < 220; y += 16) s += `<path d="M${x1} ${y} H${x2}" stroke="${line}"/>`; for (let x = x1 + 16; x < x2; x += 16) s += `<path d="M${x} 140 V220" stroke="${line}"/>`; return s; },
  wallTiles: (x1, x2) => { let s = `<rect x="${x1}" y="40" width="${x2 - x1}" height="92" fill="#DDEFF3"/>`; for (let y = 52; y < 132; y += 12) s += `<path d="M${x1} ${y} H${x2}" stroke="#B9D7DE"/>`; for (let x = x1 + 12; x < x2; x += 12) s += `<path d="M${x} 40 V132" stroke="#B9D7DE"/>`; return s; },
  // vách ngăn hai phòng: nhìn từ mặt cắt là một khối tường mỏng, đi qua được ở phần sàn phía ngoài
  part: x => `<rect x="${x - 5}" y="0" width="10" height="164" fill="#C9BFAE"/><rect x="${x - 5}" y="0" width="3" height="164" fill="#00000014"/><ellipse cx="${x}" cy="164" rx="9" ry="2.5" fill="#00000022"/>`,
  win: (x, w = 56, h = 46, y = 30) => `<g class="w-win"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#8B6B4A" stroke-width="4"/><rect class="w-sky" x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="#BFE0FF"/>
    <path d="M${x + 4} ${y + h - 4} l10 -12 l8 7 l6 -5 l10 10Z" fill="#9DB4C9" opacity=".7"/><rect x="${x + w / 2 - 1.5}" y="${y}" width="3" height="${h}" fill="#8B6B4A"/><rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="5" rx="2" fill="#A07E5E"/></g>`,
  bed: (x, c = '#9FC2F2') => `<rect x="${x}" y="98" width="10" height="62" rx="3" fill="${WOOD}"/><rect x="${x + 98}" y="120" width="8" height="40" rx="3" fill="${WOOD}"/>
    <rect x="${x + 4}" y="140" width="100" height="16" rx="2" fill="${WOOD_D}"/><rect x="${x + 6}" y="126" width="96" height="16" rx="6" fill="#F4F1EA" stroke="#D8CFC0"/>
    <rect x="${x + 11}" y="119" width="26" height="11" rx="5" fill="#fff" stroke="#D8CFC0"/><path class="w-blanket" d="M${x + 42} 124 Q${x + 70} 118 ${x + 101} 125 L${x + 103} 144 L${x + 40} 144Z" fill="${c}" stroke="#00000018"/>`,
  mattress: (x, c = '#F2C48D') => `<rect x="${x}" y="134" width="96" height="16" rx="5" fill="#EFE7D6" stroke="#CDBFA6"/><rect x="${x + 6}" y="127" width="24" height="10" rx="5" fill="#fff" stroke="#D8CFC0"/><path class="w-blanket" d="M${x + 36} 132 Q${x + 64} 126 ${x + 94} 133 L${x + 95} 148 L${x + 34} 148Z" fill="${c}" stroke="#00000018"/>`,
  desk: (x, w = 70) => `<rect x="${x}" y="114" width="${w}" height="6" rx="2" fill="${WOOD}"/><rect x="${x + 4}" y="120" width="5" height="34" fill="${WOOD_D}"/><rect x="${x + w - 9}" y="120" width="5" height="34" fill="${WOOD_D}"/>
    <rect x="${x + w - 30}" y="120" width="22" height="18" rx="2" fill="#7A5E47"/><circle cx="${x + w - 19}" cy="129" r="1.6" fill="#E9D9C2"/>
    <g class="w-scr" data-x="${x}"><rect x="${x + 16}" y="96" width="28" height="18" rx="2" fill="${INK}"/><rect class="w-glow" x="${x + 18}" y="98" width="24" height="13" fill="#9FC2F2"/><rect x="${x + 12}" y="113" width="36" height="2.5" rx="1" fill="#59606C"/></g>
    <path d="M${x + 56} 114 V94 L${x + 50} 88" stroke="#59606C" stroke-width="2" fill="none"/><path d="M${x + 44} 86 L${x + 56} 84 L${x + 54} 92Z" fill="#E9A23B"/>`,
  chair: (x, y = 150) => `<rect x="${x - 9}" y="${y - 30}" width="18" height="22" rx="4" fill="#4A5568"/><rect x="${x - 11}" y="${y - 10}" width="22" height="5" rx="2" fill="#5B6779"/><path d="M${x} ${y - 5} V${y + 4} M${x - 7} ${y + 5} H${x + 7}" stroke="#2B3240" stroke-width="2"/>`,
  tv: (x, console_) => `<rect x="${x}" y="126" width="70" height="26" rx="3" fill="${WOOD}"/><rect x="${x + 4}" y="131" width="28" height="16" rx="2" fill="${WOOD_D}"/><rect x="${x + 38}" y="131" width="28" height="16" rx="2" fill="${WOOD_D}"/>
    <g class="w-scr" data-x="${x}"><rect x="${x + 6}" y="84" width="58" height="38" rx="3" fill="${INK}"/><rect class="w-glow" x="${x + 9}" y="87" width="52" height="32" fill="#3B4252"/><rect x="${x + 31}" y="122" width="8" height="4" fill="${INK}"/></g>
    ${console_ ? `<rect x="${x + 44}" y="121" width="18" height="5" rx="2" fill="#E8ECF2"/><circle cx="${x + 59}" cy="123.5" r="1" fill="#5B8DEF"/>` : ''}`,
  sofa: (x, w = 90, c = '#6D8B74') => `<rect x="${x}" y="110" width="${w}" height="30" rx="10" fill="${c}"/><rect x="${x + 6}" y="132" width="${w - 12}" height="16" rx="5" fill="${shade(c, .12)}"/>
    <rect x="${x - 4}" y="124" width="14" height="26" rx="6" fill="${shade(c, -.1)}"/><rect x="${x + w - 10}" y="124" width="14" height="26" rx="6" fill="${shade(c, -.1)}"/><rect x="${x + 4}" y="148" width="5" height="6" fill="${WOOD_D}"/><rect x="${x + w - 9}" y="148" width="5" height="6" fill="${WOOD_D}"/>
    <rect x="${x + 16}" y="118" width="18" height="16" rx="5" fill="#F2C48D" transform="rotate(-8 ${x + 25} 126)"/>`,
  teaTable: x => `<rect x="${x}" y="132" width="46" height="6" rx="2" fill="${WOOD}"/><rect x="${x + 5}" y="138" width="4" height="14" fill="${WOOD_D}"/><rect x="${x + 37}" y="138" width="4" height="14" fill="${WOOD_D}"/>
    <path d="M${x + 14} 132 q0 -9 7 -9 q7 0 7 9Z" fill="#7FB3A4"/><path d="M${x + 28} 126 q5 -1 5 3" stroke="#7FB3A4" stroke-width="2" fill="none"/><rect x="${x + 32}" y="127" width="5" height="5" rx="1" fill="#fff" stroke="#C9BFAE"/><rect x="${x + 8}" y="127" width="5" height="5" rx="1" fill="#fff" stroke="#C9BFAE"/>`,
  stove: (x, w = 78) => `<rect x="${x}" y="112" width="${w}" height="40" rx="2" fill="#E8ECF2" stroke="#B9C2CC"/><rect x="${x}" y="108" width="${w}" height="6" fill="#59606C"/>
    <rect x="${x + 6}" y="120" width="${w / 2 - 9}" height="26" rx="2" fill="#D5DAE1"/><rect x="${x + w / 2 + 3}" y="120" width="${w / 2 - 9}" height="26" rx="2" fill="#D5DAE1"/>
    <ellipse cx="${x + 20}" cy="106" rx="11" ry="3" fill="#3A3F4B"/><rect x="${x + 11}" y="96" width="18" height="10" rx="3" fill="#7C8AA5"/><g class="w-steam" data-x="${x}" opacity="0"><path d="M${x + 16} 92 q-3 -6 0 -12 M${x + 23} 92 q3 -6 0 -12" stroke="#fff" stroke-width="2" fill="none"/></g>
    <rect x="${x + w - 28}" y="99" width="18" height="9" rx="4" fill="#fff" stroke="#B9C2CC"/>
    <rect x="${x + 6}" y="40" width="${w - 12}" height="34" rx="3" fill="#C9BFAE"/><path d="M${x + 6} 74 L${x + 14} 86 H${x + w - 14} L${x + w - 6} 74Z" fill="#B9C2CC"/>`,
  fridge: x => `<rect x="${x}" y="62" width="36" height="90" rx="5" fill="#F4F6F9" stroke="#B9C2CC"/><path d="M${x} 96 H${x + 36}" stroke="#B9C2CC"/><rect x="${x + 28}" y="74" width="3" height="14" rx="1.5" fill="#9AA3AF"/><rect x="${x + 28}" y="102" width="3" height="18" rx="1.5" fill="#9AA3AF"/>
    <rect x="${x + 6}" y="70" width="8" height="8" rx="1" fill="#F7A1A8"/><rect x="${x + 15}" y="72" width="8" height="6" rx="1" fill="#F6C85F"/>`,
  miniFridge: x => `<rect x="${x}" y="104" width="32" height="48" rx="4" fill="#F4F6F9" stroke="#B9C2CC"/><rect x="${x + 24}" y="112" width="3" height="14" rx="1.5" fill="#9AA3AF"/><rect x="${x + 4}" y="98" width="20" height="6" rx="2" fill="#E07A5F"/>`,
  table: (x, w = 64) => `<rect x="${x}" y="118" width="${w}" height="6" rx="2" fill="${WOOD}"/><rect x="${x + 5}" y="124" width="5" height="30" fill="${WOOD_D}"/><rect x="${x + w - 10}" y="124" width="5" height="30" fill="${WOOD_D}"/>
    <g class="w-dish" data-x="${x}" opacity="0"><ellipse cx="${x + 18}" cy="117" rx="9" ry="2.6" fill="#fff" stroke="#C9BFAE"/><ellipse cx="${x + w - 18}" cy="117" rx="9" ry="2.6" fill="#fff" stroke="#C9BFAE"/><ellipse cx="${x + w / 2}" cy="115" rx="8" ry="4" fill="#E9A23B"/></g>
    <rect x="${x + w / 2 - 4}" y="110" width="8" height="8" rx="2" fill="#E07A5F"/>`,
  stool: (x, y = 150) => `<rect x="${x - 9}" y="${y - 12}" width="18" height="4" rx="2" fill="#4F86C6"/><path d="M${x - 6} ${y - 8} L${x - 8} ${y + 4} M${x + 6} ${y - 8} L${x + 8} ${y + 4}" stroke="#3A6EA5" stroke-width="2.4"/>`,
  floorTable: x => `<rect x="${x}" y="134" width="52" height="5" rx="2" fill="#B08968"/><path d="M${x + 6} 139 l-3 13 M${x + 46} 139 l3 13" stroke="#8C6E54" stroke-width="3"/>
    <g class="w-dish" data-x="${x}" opacity="0"><ellipse cx="${x + 26}" cy="133" rx="9" ry="3" fill="#fff" stroke="#C9BFAE"/></g><rect x="${x + 36}" y="126" width="9" height="8" rx="1" fill="#F6C85F"/><text x="${x + 37}" y="132.5" font-size="5" font-weight="800" fill="#B5462E">MÌ</text>`,
  shower: x => `<path d="M${x + 30} 40 V50 Q${x + 30} 54 ${x + 24} 54" stroke="#9AA3AF" stroke-width="3" fill="none"/><ellipse cx="${x + 22}" cy="56" rx="8" ry="3" fill="#9AA3AF"/>
    <g class="w-water" data-x="${x}" opacity="0">${[0, 1, 2, 3, 4].map(i => `<path d="M${x + 16 + i * 3} 60 l-1 70" stroke="#9FD3F2" stroke-width="1.2" stroke-dasharray="4 5"/>`).join('')}</g>
    <rect x="${x - 4}" y="136" width="56" height="8" rx="3" fill="#E8ECF2" stroke="#B9C2CC"/><path d="M${x - 6} 36 H${x + 54}" stroke="#9AA3AF" stroke-width="2.5"/>
    <path class="w-curtain" d="M${x + 36} 37 Q${x + 41} 80 ${x + 36} 128 L${x + 54} 128 Q${x + 50} 80 ${x + 54} 37Z" fill="#F7A1A8" opacity=".9"/>`,
  sink: x => `<rect x="${x}" y="104" width="34" height="8" rx="3" fill="#F4F6F9" stroke="#B9C2CC"/><rect x="${x + 13}" y="112" width="8" height="40" fill="#E8ECF2"/><path d="M${x + 17} 104 V96 H${x + 24}" stroke="#9AA3AF" stroke-width="2.4" fill="none"/>
    <rect x="${x + 4}" y="58" width="26" height="32" rx="3" fill="#CFE7FF" stroke="#9AA3AF" stroke-width="2"/>`,
  door: (x, c = '#A0522D') => `<rect x="${x - 3}" y="54" width="42" height="88" fill="#6E5440"/><rect x="${x}" y="58" width="36" height="82" fill="#2B2321"/><g class="door"><rect x="${x}" y="58" width="36" height="82" fill="${c}"/><rect x="${x + 5}" y="64" width="26" height="30" rx="2" fill="${shade(c, .14)}"/><rect x="${x + 5}" y="100" width="26" height="32" rx="2" fill="${shade(c, .14)}"/><circle cx="${x + 30}" cy="102" r="2.4" fill="#F6C85F"/></g>
    <rect x="${x - 8}" y="142" width="52" height="5" rx="2" fill="#8C5A3C"/>`,
  shoes: x => `<rect x="${x}" y="128" width="30" height="20" rx="2" fill="${WOOD}"/><ellipse cx="${x + 8}" cy="127" rx="6" ry="2.6" fill="#3B4252"/><ellipse cx="${x + 21}" cy="127" rx="6" ry="2.6" fill="#E07A5F"/>`,
  broom: x => `<path d="M${x} 70 L${x + 6} 132" stroke="#B08968" stroke-width="3" stroke-linecap="round"/><path d="M${x - 2} 128 L${x + 14} 128 L${x + 18} 150 L${x - 4} 150Z" fill="#E9C46A" stroke="#C9A24B"/>`,
  wardrobe: (x, c = '#B08968') => `<rect x="${x}" y="40" width="50" height="112" rx="3" fill="${c}"/><path d="M${x + 25} 44 V148" stroke="${shade(c, -.2)}" stroke-width="2"/><circle cx="${x + 21}" cy="96" r="2" fill="#F6C85F"/><circle cx="${x + 29}" cy="96" r="2" fill="#F6C85F"/>`,
  plant: (x, y = 152) => `<path d="M${x - 8} ${y - 16} L${x + 8} ${y - 16} L${x + 6} ${y} L${x - 6} ${y}Z" fill="#C97B57"/><path d="M${x} ${y - 16} Q${x - 14} ${y - 34} ${x - 10} ${y - 44} M${x} ${y - 16} Q${x + 4} ${y - 40} ${x + 12} ${y - 46} M${x} ${y - 16} Q${x - 2} ${y - 30} ${x + 2} ${y - 52}" stroke="#4F9D69" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  poster: (x, y, c = '#E07A5F', txt = '') => `<rect x="${x}" y="${y}" width="34" height="44" fill="${c}"/><circle cx="${x + 17}" cy="${y + 18}" r="8" fill="#F4F1DE" opacity=".9"/>${txt ? `<text x="${x + 17}" y="${y + 38}" text-anchor="middle" font-size="6" font-weight="800" fill="#fff" font-family="Be Vietnam Pro,Arial">${txt}</text>` : ''}`,
  clock: (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="#59606C" stroke-width="2"/><path class="w-hand-h" d="M${x} ${y} V${y - 5}" stroke="#2B2321" stroke-width="2" stroke-linecap="round"/><path class="w-hand-m" d="M${x} ${y} V${y - 7}" stroke="#59606C" stroke-width="1.4" stroke-linecap="round"/>`,
  altar: x => `<rect x="${x}" y="52" width="56" height="6" fill="#8B2E1F"/><rect x="${x + 4}" y="58" width="48" height="4" fill="#6B2318"/><rect x="${x + 10}" y="30" width="16" height="22" fill="#F6E7C8" stroke="#C9A24B"/><rect x="${x + 32}" y="40" width="12" height="12" rx="6" fill="#E9A23B"/><circle cx="${x + 40}" cy="38" r="4" fill="#F28C28"/>
    <path d="M${x + 28} 52 V36 M${x + 30} 52 V34" stroke="#B5462E" stroke-width="1"/><g class="w-smoke"><path d="M${x + 29} 33 q3 -5 0 -10 q-3 -5 0 -9" stroke="#C9C2B8" stroke-width="1.2" fill="none" opacity=".7"/></g>`,
  calendar: (x, y) => `<rect x="${x}" y="${y}" width="22" height="28" fill="#fff" stroke="#C9BFAE"/><rect x="${x}" y="${y}" width="22" height="8" fill="#D7263D"/><text x="${x + 11}" y="${y + 22}" text-anchor="middle" font-size="10" font-weight="800" fill="#2B2321" font-family="Be Vietnam Pro,Arial">${S ? dayInfo().date : 16}</text>`,
  rug: (x, w, c = '#E9C46A') => `<ellipse cx="${x + w / 2}" cy="186" rx="${w / 2}" ry="14" fill="${c}" opacity=".55"/><ellipse cx="${x + w / 2}" cy="186" rx="${w / 2 - 8}" ry="9" fill="none" stroke="#fff" stroke-opacity=".5" stroke-dasharray="4 4"/>`,
  line: (x1, x2) => `<path d="M${x1} 44 Q${(x1 + x2) / 2} 54 ${x2} 44" stroke="#59606C" stroke-width="1.2" fill="none"/><path d="M${x1 + 14} 48 h14 l-2 22 h-10Z" fill="#5B8DEF"/><path d="M${x1 + 36} 51 h12 v16 h-12Z" fill="#F7A1A8"/><path d="M${x2 - 26} 48 h12 l2 18 h-16Z" fill="#81B29A"/>`,
  lamp: x => `<path d="M${x} 0 V22" stroke="#59606C" stroke-width="1.4"/><path d="M${x - 10} 32 L${x - 5} 22 H${x + 5} L${x + 10} 32Z" fill="#F6C85F"/><ellipse class="w-lampglow" cx="${x}" cy="60" rx="46" ry="40" fill="#FFF3B0" opacity="0"/>`,
  boxes: x => `<rect x="${x}" y="124" width="26" height="28" fill="#D9B98C" stroke="#B89A6E"/><rect x="${x + 4}" y="104" width="20" height="20" fill="#E5C9A0" stroke="#B89A6E"/><path d="M${x} 136 H${x + 26}" stroke="#B89A6E"/>`,
  sign: (x, y, t) => `<rect x="${x - t.length * 2.6 - 6}" y="${y}" width="${t.length * 5.2 + 12}" height="13" rx="6" fill="#ffffffcc"/><text x="${x}" y="${y + 9.4}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#59606C" font-family="Be Vietnam Pro,Arial">${t}</text>`,
};

/* ----- Đồ vật tương tác -----
   kind: loại đồ (quyết định những lựa chọn nào hiện ở đây, xem tuong-tac.js)
   hit:  vùng bấm/chạm [x1, y1, x2, y2] · block: vùng chân không đi vào được [x1, y1, x2, y2]
   spot: chỗ đứng để dùng đồ · use: tư thế khi dùng (act: động tác, face: quay trái, lie: nằm, x/y: chỗ diễn) */
const obj = (id, kind, name, icon, hit, block, spot, use = {}) => ({ id, kind, name, icon, hit, block, spot, use });

const HOUSES = {
  /* Phòng trọ: một phòng chính khép kín, nhà tắm nhỏ, góc bếp sát cửa */
  tro: { name:'Phòng trọ', W:560, x0:8, x1:552,
    rooms:[['Nhà tắm', 8, 118], ['Phòng trọ', 118, 552]],
    spawn:{ x:236, y:170 },
    parts:[118],
    paint(){
      return FURN.wall(0, 118, '#E7F1F4', '#C9DCE2') + FURN.wallTiles(0, 118) + FURN.wall(118, 560, '#E6E0D2', '#CFC6B4')
        + FURN.tiles(0, 118, '#D5E3E8', '#BFD0D6') + FURN.floor(118, 560, '#B8A88E', '#A69579')
        + `<ellipse cx="300" cy="38" rx="30" ry="12" fill="#D3CBB9" opacity=".7"/>` + FURN.line(340, 420)
        + FURN.win(252, 58) + FURN.poster(146, 34, '#5B8DEF', 'CODE') + FURN.calendar(206, 40) + FURN.clock(445, 30) + FURN.lamp(300)
        + FURN.boxes(530) + FURN.rug(200, 120, '#E9C46A');
    },
    objs:[
      obj('shower', 'shower', 'Vòi sen', '🚿', [10, 30, 70, 150], [8, 0, 66, 158], { x:42, y:168 }, { x:46, y:150, hide:true }),
      obj('sink', 'sink', 'Bồn rửa mặt', '🚰', [76, 56, 112, 152], [74, 0, 112, 156], { x:94, y:166 }, { act:'act-sip' }),
      obj('bed', 'bed', 'Giường', '🛏️', [124, 96, 232, 160], [122, 0, 232, 162], { x:180, y:172 }, { lie:true, x:200, y:136 }),
      obj('desk', 'desk', 'Bàn học, laptop', '💻', [240, 84, 312, 156], [240, 0, 312, 156], { x:326, y:160, face:true }, { act:'act-type', x:322, y:156, face:true, scr:true }),
      obj('window', 'window', 'Cửa sổ', '🪟', [252, 28, 312, 80], null, { x:282, y:162 }, { act:'act-phone' }),
      obj('table', 'table', 'Bàn gấp ăn cơm', '🍽️', [336, 118, 392, 156], [334, 0, 392, 154], { x:364, y:166 }, { act:'act-eat', dish:true }),
      obj('fridge', 'kitchen', 'Tủ lạnh mini', '🧊', [404, 96, 438, 154], [402, 0, 438, 156], { x:420, y:166 }, { act:'act-drink' }),
      obj('stove', 'kitchen', 'Bếp điện', '🍳', [444, 80, 508, 154], [442, 0, 508, 156], { x:476, y:166 }, { act:'act-cook', steam:true }),
      obj('broom', 'broom', 'Chổi', '🧹', [396, 66, 404, 150], null, { x:400, y:168 }, { act:'act-sweep', sweep:[300, 460] }),
      obj('door', 'door', 'Cửa ra vào', '🚪', [512, 52, 552, 146], [512, 0, 552, 150], { x:530, y:164 }, { exit:true }),
    ],
    deco(){ return FURN.part(118) + FURN.shower(14) + FURN.sink(76) + FURN.mattress(128) + FURN.desk(240) + FURN.chair(328, 152)
      + FURN.floorTable(338) + FURN.miniFridge(404) + FURN.stove(444, 64) + FURN.broom(396) + FURN.door(514, '#7A8B99'); },
    cast:{},
  },

  /* Căn hộ ghép: nhà tắm, phòng ngủ của bạn, phòng khách có TV và máy chơi game của Tùng, bếp và cửa ra vào */
  ghep: { name:'Căn hộ ghép', W:760, x0:8, x1:752,
    rooms:[['Nhà tắm', 8, 110], ['Phòng ngủ', 110, 330], ['Phòng khách', 330, 596], ['Bếp', 596, 752]],
    spawn:{ x:210, y:172 },
    parts:[110, 330],
    paint(){
      return FURN.wall(0, 110, '#E7F1F4', '#C9DCE2') + FURN.wallTiles(0, 110) + FURN.wall(110, 330, '#DCE6F0', '#BCCADA') + FURN.wall(330, 596, '#F1E9DA', '#D8CBB4') + FURN.wall(596, 760, '#F4EFE6', '#DCD2C0')
        + FURN.tiles(0, 110, '#D5E3E8', '#BFD0D6') + FURN.floor(110, 596, '#A9B7C6', '#97A6B6') + FURN.tiles(596, 760, '#E8DCC8', '#D6C7AE')
        + FURN.win(232, 56) + FURN.poster(130, 30, '#E07A5F', 'GAME') + FURN.clock(390, 30) + FURN.calendar(560, 40) + FURN.win(436, 64, 44, 26)
        + FURN.lamp(220) + FURN.lamp(470) + FURN.rug(380, 150, '#8FBF9F');
    },
    objs:[
      obj('shower', 'shower', 'Vòi sen', '🚿', [10, 30, 66, 150], [8, 0, 64, 158], { x:40, y:168 }, { x:44, y:150, hide:true }),
      obj('sink', 'sink', 'Bồn rửa mặt', '🚰', [70, 56, 104, 152], [68, 0, 104, 156], { x:88, y:166 }, { act:'act-sip' }),
      obj('bed', 'bed', 'Giường', '🛏️', [118, 96, 226, 160], [116, 0, 226, 162], { x:172, y:172 }, { lie:true, x:192, y:136 }),
      obj('window', 'window', 'Cửa sổ', '🪟', [232, 28, 290, 78], null, { x:258, y:162 }, { act:'act-phone' }),
      obj('desk', 'desk', 'Bàn học, laptop', '💻', [236, 84, 306, 156], [236, 0, 306, 156], { x:316, y:162, face:true }, { act:'act-type', x:316, y:156, face:true, scr:true }),
      obj('tv', 'tv', 'TV và máy chơi game', '📺', [344, 82, 416, 154], [342, 0, 416, 154], { x:430, y:168, face:true }, { act:'act-game', x:452, y:150, face:true, scr:true }),
      obj('sofa', 'sofa', 'Sofa', '🛋️', [430, 106, 528, 154], [426, 0, 532, 150], { x:480, y:168 }, { act:'act-phone', x:470, y:150 }),
      obj('broom', 'broom', 'Chổi', '🧹', [540, 66, 548, 150], null, { x:546, y:168 }, { act:'act-sweep', sweep:[350, 580] }),
      obj('fridge', 'kitchen', 'Tủ lạnh', '🧊', [602, 60, 640, 154], [600, 0, 640, 156], { x:620, y:168 }, { act:'act-drink' }),
      obj('stove', 'kitchen', 'Bếp', '🍳', [644, 38, 712, 154], [642, 0, 712, 156], { x:676, y:168 }, { act:'act-cook', steam:true }),
      obj('table', 'table', 'Bàn ăn', '🍽️', [560, 108, 598, 156], [552, 0, 598, 152], { x:576, y:170 }, { act:'act-eat', dish:true }),
      obj('door', 'door', 'Cửa ra vào', '🚪', [714, 52, 752, 146], [714, 0, 752, 150], { x:732, y:164 }, { exit:true }),
    ],
    deco(){ return FURN.part(110) + FURN.part(330) + FURN.shower(12) + FURN.sink(70) + FURN.bed(118, '#9FC2F2') + FURN.desk(236) + FURN.chair(320, 152)
      + FURN.tv(344, true) + FURN.sofa(432, 94, '#E07A5F') + FURN.broom(540) + FURN.fridge(602) + FURN.stove(644, 68) + FURN.table(556, 40) + FURN.door(716, '#5B8DEF') + FURN.plant(422, 148); },
    cast:{ tung:{ morning:[['sofa','sleep']], noon:[['tvPlay','act-game']], afternoon:[['tvPlay','act-game'],['kitchen','act-phone']], evening:[['tvPlay','act-game'],['tableR','act-eat']], night:[['tvPlay','act-game']] } },
    spots:{ sofa:{ x:480, y:136, lie:true }, tvPlay:{ x:500, y:152, face:true }, kitchen:{ x:690, y:178 }, tableR:{ x:590, y:160, face:true } },
  },

  /* Nhà bố mẹ: rộng hơn, có bàn thờ, bộ ấm chén, mẹ hay ở trong bếp, bố đọc báo ở phòng khách */
  nha: { name:'Nhà bố mẹ', W:820, x0:8, x1:812,
    rooms:[['Nhà tắm', 8, 110], ['Phòng mình', 110, 330], ['Phòng khách', 330, 610], ['Bếp', 610, 812]],
    spawn:{ x:210, y:172 },
    parts:[110, 330, 610],
    paint(){
      return FURN.wall(0, 110, '#E7F1F4', '#C9DCE2') + FURN.wallTiles(0, 110) + FURN.wall(110, 330, '#FDEBD3', '#E8CBA6') + FURN.wall(330, 610, '#F6E5CE', '#DDBF97') + FURN.wall(610, 820, '#F3EEDF', '#D9CDB0')
        + FURN.tiles(0, 110, '#D5E3E8', '#BFD0D6') + FURN.floor(110, 330, '#C59A6D', '#B0865B') + FURN.tiles(330, 610, '#E6D3B3', '#D3BD98') + FURN.tiles(610, 820, '#E8DCC8', '#D6C7AE')
        + FURN.win(236, 56) + FURN.poster(132, 30, '#81B29A', 'ĐH') + FURN.altar(352) + FURN.clock(450, 28) + FURN.calendar(500, 34) + FURN.win(660, 56, 40, 22)
        + FURN.lamp(220) + FURN.lamp(470) + FURN.lamp(730) + FURN.rug(390, 160, '#E07A5F');
    },
    objs:[
      obj('shower', 'shower', 'Vòi sen', '🚿', [10, 30, 66, 150], [8, 0, 64, 158], { x:40, y:168 }, { x:44, y:150, hide:true }),
      obj('sink', 'sink', 'Bồn rửa mặt', '🚰', [70, 56, 104, 152], [68, 0, 104, 156], { x:88, y:166 }, { act:'act-sip' }),
      obj('bed', 'bed', 'Giường', '🛏️', [118, 96, 226, 160], [116, 0, 226, 162], { x:172, y:172 }, { lie:true, x:192, y:136 }),
      obj('window', 'window', 'Cửa sổ', '🪟', [236, 28, 292, 78], null, { x:262, y:162 }, { act:'act-phone' }),
      obj('desk', 'desk', 'Bàn học, máy tính', '💻', [240, 84, 310, 156], [240, 0, 310, 156], { x:317, y:162, face:true }, { act:'act-type', x:318, y:156, face:true, scr:true }),
      obj('sofa', 'sofa', 'Bộ bàn ghế uống trà', '🫖', [416, 104, 554, 156], [412, 0, 556, 152], { x:480, y:170 }, { act:'act-talk', x:470, y:152 }),
      obj('tv', 'tv', 'TV', '📺', [342, 82, 412, 154], [340, 0, 412, 154], { x:398, y:170 }, { act:'act-phone', x:430, y:152, face:true, scr:true }),
      obj('door', 'door', 'Cửa chính', '🚪', [566, 52, 604, 146], [566, 0, 604, 150], { x:584, y:164 }, { exit:true }),
      obj('broom', 'broom', 'Chổi', '🧹', [226, 66, 236, 150], null, { x:232, y:170 }, { act:'act-sweep', sweep:[140, 300] }),
      obj('fridge', 'kitchen', 'Tủ lạnh', '🧊', [618, 60, 656, 154], [616, 0, 656, 156], { x:636, y:168 }, { act:'act-drink' }),
      obj('stove', 'kitchen', 'Bếp', '🍳', [660, 38, 730, 154], [658, 0, 730, 156], { x:694, y:168 }, { act:'act-cook', steam:true }),
      obj('table', 'table', 'Mâm cơm', '🍽️', [738, 108, 806, 156], [736, 0, 806, 152], { x:756, y:172 }, { act:'act-eat', x:752, y:160, dish:true }),
    ],
    deco(){ return FURN.part(110) + FURN.part(330) + FURN.part(610) + FURN.shower(12) + FURN.sink(70) + FURN.bed(118, '#F6C85F') + FURN.desk(240) + FURN.chair(322, 152)
      + FURN.tv(342) + FURN.sofa(420, 80, '#8C5A3C') + FURN.teaTable(506) + FURN.door(568, '#8B2E1F') + FURN.broom(226) + FURN.fridge(618) + FURN.stove(660, 70) + FURN.table(740, 64)
      + FURN.stool(746, 156) + FURN.stool(798, 156) + FURN.plant(324, 150); },
    cast:{ mom:{ morning:[['stove','act-cook'],['mid','act-sweep']], noon:[['stove','act-cook']], afternoon:[['sofaR','act-read'],['stove','act-cook']], evening:[['stove','act-cook']], night:[['sofaR','act-phone']] },
           dad:{ morning:[['sofaL','act-read']], noon:[['tableR','act-eat']], afternoon:[['sofaL','act-read'],['tea','act-drink']], evening:[['tea','act-drink'],['sofaL','act-read']], night:[['sofaL','act-phone']] } },
    spots:{ stove:{ x:700, y:160 }, mid:{ x:470, y:180 }, sofaL:{ x:446, y:150 }, sofaR:{ x:486, y:150, face:true }, tea:{ x:540, y:150, face:true }, tableR:{ x:790, y:160, face:true } },
  },
};
const house = () => HOUSES[S && HOUSES[S.bg] ? S.bg : 'tro'];
