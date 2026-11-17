/* =========================================================
   v15: ĐỒ ĐẠC VĂN PHÒNG – chỉ có hình vẽ (SVG), không có luật chơi
   Cùng quy ước với nhà (ban-do-nha.js): tường phía sau y = 0…140, sàn y = 140…220, x là mép trái.
   Phần có chuyển động (màn hình sáng, hơi cà phê) gắn data-x để bộ máy thế giới tìm đúng món đồ.
   ========================================================= */
const OFURN = {
  // bàn làm việc có màn hình, bàn phím, cốc; mine: thêm giấy nhớ vàng
  desk: (x, w = 64, mine = false, tint = '#9AA3AF') => `<rect x="${x}" y="112" width="${w}" height="6" rx="2" fill="${tint}"/><rect x="${x + 4}" y="118" width="4" height="36" fill="#6B7280"/><rect x="${x + w - 8}" y="118" width="4" height="36" fill="#6B7280"/>
    <g class="w-scr" data-x="${x}"><rect x="${x + 14}" y="84" width="30" height="22" rx="2" fill="${INK}"/><rect class="w-glow" x="${x + 16}" y="86" width="26" height="17" fill="#9FC2F2"/>
      <path class="ln" d="M${x + 19} 91 h12 M${x + 19} 95 h18 M${x + 19} 99 h9" stroke="#2F6FD1" stroke-width="1.6"/><rect x="${x + 27}" y="106" width="4" height="6" fill="${INK}"/></g>
    <rect x="${x + 12}" y="109" width="30" height="3" rx="1" fill="#59606C"/><rect x="${x + w - 16}" y="104" width="7" height="8" rx="1.5" fill="#fff" stroke="#B9C2CC"/>
    ${mine ? `<rect x="${x + 46}" y="86" width="9" height="9" fill="#F6C85F" transform="rotate(8 ${x + 50} 90)"/>` : ''}`,
  // biển “Nghỉ phép” trên bàn người vắng mặt
  away: x => `<g class="away-sign"><rect x="${x + 12}" y="96" width="40" height="13" rx="3" fill="#fff" stroke="#E07A5F"/><text x="${x + 32}" y="105.5" text-anchor="middle" font-size="7" font-weight="700" fill="#B5462E" font-family="Be Vietnam Pro,Arial">Nghỉ phép</text></g>`,
  glass: x => `<rect x="${x - 4}" y="10" width="8" height="154" fill="#BFE0FF" opacity=".55"/><rect x="${x - 4}" y="10" width="8" height="154" fill="none" stroke="#8FB8DE"/><ellipse cx="${x}" cy="164" rx="9" ry="2.5" fill="#00000022"/>`,
  reception: (x, c) => `<rect x="${x}" y="108" width="74" height="44" rx="4" fill="#F4F1EA" stroke="#C9BFAE"/><rect x="${x}" y="104" width="74" height="7" rx="3" fill="${c}"/><rect x="${x + 50}" y="90" width="16" height="14" rx="2" fill="${INK}"/><circle cx="${x + 16}" cy="100" r="5" fill="#81B29A"/>`,
  timeclock: x => `<rect x="${x}" y="70" width="22" height="30" rx="3" fill="#59606C"/><rect x="${x + 4}" y="74" width="14" height="9" rx="1" fill="#9FE3B5"/><circle cx="${x + 11}" cy="91" r="4" fill="#2B3240" stroke="#9AA3AF"/>`,
  board: (x, w = 90) => `<rect x="${x}" y="24" width="${w}" height="56" rx="3" fill="#fff" stroke="#9AA3AF" stroke-width="2.5"/><rect x="${x + 8}" y="34" width="22" height="12" rx="2" fill="none" stroke="#2F6FD1" stroke-width="1.5"/><rect x="${x + w - 32}" y="34" width="22" height="12" rx="2" fill="none" stroke="#E07A5F" stroke-width="1.5"/>
    <path d="M${x + 30} 40 H${x + w - 32} M${x + 19} 46 V62 H${x + w / 2}" stroke="#59606C" stroke-width="1.2" fill="none"/><path d="M${x + w / 2 - 6} 58 h20 v10 h-20Z" fill="none" stroke="#2E9E5B" stroke-width="1.5"/><rect x="${x + 6}" y="80" width="${w - 12}" height="3" fill="#B9C2CC"/>`,
  meetTable: (x, w = 80) => `<rect x="${x}" y="118" width="${w}" height="7" rx="3" fill="#8C6E54"/><rect x="${x + w / 2 - 4}" y="125" width="8" height="28" fill="#6E5440"/><rect x="${x + w / 2 - 18}" y="150" width="36" height="4" rx="2" fill="#6E5440"/>
    ${FURN.chair(x - 8, 154)}${FURN.chair(x + w + 8, 154)}<rect x="${x + 12}" y="112" width="14" height="6" rx="1" fill="#fff"/><rect x="${x + w - 30}" y="110" width="20" height="8" rx="1" fill="#2B3240"/>`,
  wallTv: x => `<rect x="${x}" y="40" width="70" height="42" rx="3" fill="${INK}"/><rect x="${x + 4}" y="44" width="62" height="34" fill="#2F6FD1"/><path d="M${x + 10} 70 l12 -12 l10 6 l14 -16 l14 10" stroke="#9FE3B5" stroke-width="2" fill="none"/>`,
  water: x => `<rect x="${x}" y="104" width="26" height="48" rx="3" fill="#E8ECF2" stroke="#B9C2CC"/><rect x="${x + 3}" y="72" width="20" height="32" rx="8" fill="#9FD3F2" opacity=".85"/><rect x="${x + 8}" y="112" width="4" height="6" fill="#2F6FD1"/><rect x="${x + 14}" y="112" width="4" height="6" fill="#E07A5F"/>`,
  counter: (x, w = 80) => `<rect x="${x}" y="112" width="${w}" height="40" rx="2" fill="#F4F6F9" stroke="#B9C2CC"/><rect x="${x}" y="108" width="${w}" height="6" fill="#59606C"/><rect x="${x + 6}" y="120" width="${w / 2 - 9}" height="26" rx="2" fill="#E3E8EF"/><rect x="${x + w / 2 + 3}" y="120" width="${w / 2 - 9}" height="26" rx="2" fill="#E3E8EF"/>`,
  coffee: x => `<rect x="${x}" y="82" width="26" height="26" rx="3" fill="#3A3F4B"/><rect x="${x + 5}" y="86" width="16" height="6" rx="1" fill="#9FE3B5"/><rect x="${x + 9}" y="98" width="8" height="10" rx="1" fill="#fff"/>
    <g class="w-steam" data-x="${x}" opacity="0"><path d="M${x + 11} 80 q-3 -6 0 -12 M${x + 16} 80 q3 -6 0 -12" stroke="#C9C2B8" stroke-width="2" fill="none"/></g>`,
  food: (x, kind) => kind === 'trasua'
    ? `<rect x="${x}" y="92" width="10" height="16" rx="2" fill="#E9C46A"/><rect x="${x + 14}" y="90" width="10" height="18" rx="2" fill="#C77DFF"/><rect x="${x + 28}" y="92" width="10" height="16" rx="2" fill="#F7A1A8"/><text x="${x + 19}" y="84" text-anchor="middle" font-size="7" font-weight="800" fill="#7B2CBF" font-family="Be Vietnam Pro,Arial">TRÀ SỮA</text>`
    : `<path d="M${x} 104 q20 -12 40 0 l-2 4 h-36Z" fill="#E9A23B"/><path d="M${x + 6} 100 l28 0" stroke="#B5762B" stroke-width="1.4"/><text x="${x + 20}" y="88" text-anchor="middle" font-size="7" font-weight="800" fill="#B5462E" font-family="Be Vietnam Pro,Arial">BÁNH MÌ</text>`,
  beanbag: (x, c) => `<path d="M${x} 152 q-2 -26 22 -30 q24 4 22 30Z" fill="${c}"/><path d="M${x + 8} 134 q14 -6 28 0" stroke="#00000022" stroke-width="2" fill="none"/>`,
  neon: (x, y, t, c) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="800" fill="${c}" font-family="Be Vietnam Pro,Arial" style="filter:drop-shadow(0 0 3px ${c})">${t}</text>`,
  longTable: (x, w) => `<rect x="${x}" y="112" width="${w}" height="7" rx="3" fill="#B08968"/>${Array.from({ length:Math.max(2, Math.round(w / 90)) }, (_, i) => `<rect x="${x + 6 + i * (w - 16) / Math.max(1, Math.round(w / 90) - 1)}" y="119" width="5" height="35" fill="#8C6E54"/>`).join('')}`,
  printer: x => `<rect x="${x}" y="112" width="40" height="40" rx="2" fill="#8C6E54"/><rect x="${x + 2}" y="92" width="36" height="20" rx="3" fill="#D5DAE1" stroke="#9AA3AF"/><rect x="${x + 8}" y="86" width="24" height="7" fill="#fff" stroke="#C9BFAE"/><circle cx="${x + 31}" cy="101" r="2" fill="#E07A5F"/>`,
  papers: x => `<rect x="${x}" y="130" width="22" height="22" fill="#F4F1EA" stroke="#C9BFAE"/><rect x="${x + 2}" y="120" width="20" height="10" fill="#fff" stroke="#C9BFAE" transform="rotate(-4 ${x + 12} 125)"/><rect x="${x}" y="112" width="20" height="9" fill="#F4F1EA" stroke="#C9BFAE" transform="rotate(5 ${x + 10} 116)"/>`,
  fan: x => `<path d="M${x} 152 h18 M${x + 9} 152 V100" stroke="#59606C" stroke-width="3"/><circle cx="${x + 9}" cy="94" r="15" fill="none" stroke="#9AA3AF" stroke-width="2"/><g class="w-fan" style="transform-origin:${x + 9}px 94px"><path d="M${x + 9} 94 l-3 -12 q3 -3 6 0Z M${x + 9} 94 l11 6 q0 4 -4 5Z M${x + 9} 94 l-9 8 q-4 -2 -2 -6Z" fill="#81B29A"/></g>`,
  helmets: x => `<rect x="${x}" y="96" width="44" height="4" fill="#59606C"/><path d="M${x + 4} 96 q8 -14 16 0Z" fill="#2E9E5B"/><path d="M${x + 24} 96 q8 -14 16 0Z" fill="#2E9E5B"/>`,
  // biển tên công ty trên tường sảnh
  sign: (x, k, c) => { const nm = COMPANIES[k].name, w = Math.max(80, nm.length * 6.4 + 34);
    return `<rect x="${x}" y="22" width="${w}" height="24" rx="5" fill="${c}"/><text x="${x + 13}" y="38.5" font-size="12" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${COMPANIES[k].icon}</text><text x="${x + 26}" y="38.5" font-size="10.5" font-weight="800" fill="#fff" font-family="Be Vietnam Pro,Arial">${esc(nm)}</text>`; },
  // con mèo của Cú Đêm Lab: đi qua đi lại dọc sàn (chỉ để trang trí, chạm vào thì kêu)
  cat: (x1, x2) => `<g class="w-cat" style="--cx1:${x1}px;--cx2:${x2}px"><g class="w-cat-b"><ellipse cx="0" cy="-8" rx="13" ry="7" fill="#3A3F4B"/><circle cx="12" cy="-15" r="6" fill="#3A3F4B"/><path d="M8 -20 l2 -6 l3 5Z M14 -20 l3 -5 l1 6Z" fill="#3A3F4B"/>
    <circle cx="14" cy="-16" r="1.2" fill="#F6C85F"/><path d="M-13 -9 q-8 -10 -4 -16" stroke="#3A3F4B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6 -2 v3 M6 -2 v3" stroke="#3A3F4B" stroke-width="3" stroke-linecap="round"/></g></g>`,
};
