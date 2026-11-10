/* =========================================================
   BỐI CẢNH (360 x 180), màu trời đổi theo buổi
   ========================================================= */
const SKY = { morning:'#CFE7FF', noon:'#B9E0FF', afternoon:'#FFE1B8', evening:'#FFB48A', night:'#2A3360' };
const T = (x, y, txt, fill = '#fff', size = 11) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${fill}" font-family="Be Vietnam Pro,Arial,sans-serif">${txt}</text>`;
function win(x, y, w, h){
  const sky = SKY[S.slot] || SKY.morning, n = S.slot === 'night' || S.slot === 'evening';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${sky}"/>
    <circle cx="${x + w * .72}" cy="${y + h * .32}" r="7" fill="${n ? '#FFF3B0' : '#FFF7D1'}"/>
    <path d="M${x} ${y + h * .78} L${x + w * .2} ${y + h * .55} L${x + w * .38} ${y + h * .72} L${x + w * .6} ${y + h * .5} L${x + w * .82} ${y + h * .7} L${x + w} ${y + h * .6} V${y + h} H${x}Z" fill="${n ? '#3B456E' : '#9BB7A6'}" opacity=".7"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="#fff" stroke-width="5"/><path d="M${x + w / 2} ${y} V${y + h}" stroke="#fff" stroke-width="4"/>`;
}
function moto(x, y, c){ return `<circle cx="${x}" cy="${y}" r="5" fill="#2B2B2B"/><circle cx="${x + 22}" cy="${y}" r="5" fill="#2B2B2B"/><path d="M${x} ${y - 4} Q${x + 11} ${y - 14} ${x + 22} ${y - 4}Z" fill="${c}"/><circle cx="${x + 14}" cy="${y - 18}" r="5" fill="${c}"/>`; }
function bgSVG(key){
  if (!key || key === 'home') key = 'room_' + S.bg;
  const [kind, sub] = key.split('_');
  const sky = SKY[S.slot] || SKY.morning;
  let s = '';
  if (kind === 'room') {
    const W = { nha:['#F6E5CE','#C59A6D'], tro:['#E6E0D2','#B8A88E'], ghep:['#DCE6F0','#A9B7C6'] }[sub] || ['#F6E5CE','#C59A6D'];
    s = `<rect width="360" height="180" fill="${W[0]}"/><rect y="146" width="360" height="34" fill="${W[1]}"/>` + win(150, 22, 76, 62);
    if (sub === 'nha') s += `<rect x="34" y="34" width="46" height="36" fill="#fff" stroke="#8B6B4A" stroke-width="4"/><path d="M38 66 L52 48 L62 60 L68 54 L76 66Z" fill="#81B29A"/><circle cx="300" cy="42" r="14" fill="#fff" stroke="#8B6B4A" stroke-width="3"/><path d="M300 42 V34 M300 42 L306 45" stroke="#3B2B2B" stroke-width="2"/><rect x="306" y="114" width="30" height="32" rx="3" fill="#B5603F"/><ellipse cx="314" cy="104" rx="8" ry="16" fill="#3E9B6A"/><ellipse cx="329" cy="100" rx="8" ry="18" fill="#2F8257"/>`;
    if (sub === 'tro') s += `<ellipse cx="62" cy="40" rx="26" ry="13" fill="#D3CBB9" opacity=".8"/><path d="M110 0 V26" stroke="#5B5B5B" stroke-width="1.5"/><circle cx="110" cy="32" r="7" fill="#FFE58A"/><rect x="296" y="92" width="42" height="54" rx="4" fill="#E9EEF2" stroke="#B9C2CC" stroke-width="2"/><path d="M296 112 H338" stroke="#B9C2CC" stroke-width="2"/>`;
    if (sub === 'ghep') s += `<rect x="30" y="28" width="40" height="54" fill="#E07A5F"/><circle cx="50" cy="50" r="10" fill="#F4F1DE"/><rect x="278" y="84" width="64" height="40" rx="3" fill="#2B3240"/><rect x="283" y="89" width="54" height="30" fill="#5B8DEF" opacity=".75"/><rect x="294" y="124" width="32" height="22" fill="#6B5B4B"/>`;
  } else if (kind === 'office' || kind === 'lobby') {
    const co_ = sub || (S.job ? S.job.co : S.applied) || 'hotay';
    const C = { hotay:'#E3ECF6', banhmi:'#FFF0D8', cudem:'#ECE6F7', loren:'#EFE6D8' }[co_] || '#E3ECF6';
    const sign = { hotay:['#2F6FD1','Hồ Tây Soft'], banhmi:['#E9A23B','Bánh Mì Pay'], cudem:['#4B3F72','Cú Đêm Lab'], loren:['#8C5A3C','Lò Rèn'] }[co_] || ['#2F6FD1','Công ty'];
    s = `<rect width="360" height="180" fill="${C}"/>` + win(122, 16, 116, 46) + `<rect y="148" width="360" height="32" fill="#C9D1DB"/>
      <rect x="16" y="24" width="78" height="52" rx="3" fill="#fff" stroke="#B9C2CC" stroke-width="2"/><rect x="24" y="32" width="14" height="12" fill="#F6C85F"/><rect x="44" y="32" width="14" height="12" fill="#9FD3B4"/><rect x="64" y="32" width="14" height="12" fill="#F7A1A8"/><rect x="24" y="52" width="14" height="12" fill="#9FC2F2"/><rect x="44" y="52" width="14" height="12" fill="#F6C85F"/>
      <rect x="262" y="22" width="84" height="22" rx="4" fill="${sign[0]}"/>${T(304, 37, sign[1])}
      <rect x="0" y="112" width="360" height="8" fill="#8C6E54"/><rect x="40" y="88" width="34" height="24" rx="2" fill="#2B3240"/><rect x="43" y="91" width="28" height="17" fill="#9FC2F2"/><rect x="286" y="88" width="34" height="24" rx="2" fill="#2B3240"/><rect x="289" y="91" width="28" height="17" fill="#B8E0C2"/>`;
    if (co_ === 'cudem') s += `<rect x="322" y="62" width="30" height="50" fill="#3A3F4B"/><circle cx="328" cy="72" r="2" fill="#4CC38A"/><circle cx="328" cy="82" r="2" fill="#4CC38A"/><circle cx="328" cy="92" r="2" fill="#F5C04A"/><ellipse cx="337" cy="58" rx="12" ry="6" fill="#F2A65A"/><circle cx="346" cy="52" r="6" fill="#F2A65A"/><path d="M341 49 L343 42 L346 48 L349 42 L351 49Z" fill="#F2A65A"/>`;
    if (co_ === 'banhmi') s += `<ellipse cx="320" cy="108" rx="18" ry="6" fill="#D9A15B"/><path d="M305 106 Q320 99 335 106" stroke="#B9813E" stroke-width="2" fill="none"/>`;
    if (co_ === 'loren') s += `<path d="M300 74 L318 56" stroke="#6B6B6B" stroke-width="5" stroke-linecap="round"/><rect x="312" y="48" width="16" height="10" rx="2" fill="#6B6B6B" transform="rotate(-45 320 53)"/>`;
    if (kind === 'lobby') s += `<ellipse cx="334" cy="122" rx="18" ry="22" fill="#2F8257"/><g fill="#F5A623"><circle cx="326" cy="114" r="3.5"/><circle cx="340" cy="120" r="3.5"/><circle cx="332" cy="130" r="3.5"/><circle cx="344" cy="108" r="3.5"/></g><rect x="324" y="140" width="20" height="10" fill="#B5603F"/>`;
  } else if (kind === 'street') {
    const rain = sub === 'rain';
    s = `<rect width="360" height="180" fill="${rain ? '#8C9AAE' : sky}"/>`;
    [['#F2C14E',0,50,46],['#E07A5F',44,36,42],['#81B29A',84,58,54],['#F4E1C1',136,42,46],['#3D5A80',180,54,50],['#F2A65A',228,40,46],['#C3B1E1',272,60,54],['#9CC5A1',324,44,36]]
      .forEach(([c, x, t, w]) => s += `<rect x="${x}" y="${t}" width="${w}" height="${140 - t}" fill="${c}"/><rect x="${x + 10}" y="${t + 12}" width="12" height="14" fill="#fff" opacity=".7"/><rect x="${x + 10}" y="${t + 40}" width="12" height="14" fill="#fff" opacity=".7"/>`);
    s += `<path d="M0 30 Q90 52 180 34 T360 36" stroke="#2B2B2B" stroke-width="1.5" fill="none"/><path d="M0 40 Q100 64 200 44 T360 48" stroke="#2B2B2B" stroke-width="1.2" fill="none"/>
      <rect y="140" width="360" height="40" fill="${rain ? '#6F87A0' : '#7A8290'}"/><path d="M0 162 H360" stroke="#fff" stroke-width="2" stroke-dasharray="14 12" opacity=".6"/>` + moto(250, 134, '#E5484D') + moto(300, 137, '#2F6FD1') + moto(8, 135, '#4CC38A');
    if (rain) for (let i = 0; i < 26; i++) { const x = (i * 37) % 360, y = (i * 53) % 150; s += `<path d="M${x} ${y} l-4 12" stroke="#E3F0FF" stroke-width="1.5" opacity=".8"/>`; }
  } else if (kind === 'sidewalk') {
    s = `<rect width="360" height="180" fill="${sky}"/><rect y="40" width="360" height="104" fill="#E9D8BE"/><rect y="40" width="360" height="10" fill="#C8B293"/><rect x="34" y="66" width="62" height="78" fill="#6E8B74"/><rect x="246" y="60" width="78" height="44" fill="#fff" opacity=".55"/>${T(285, 87, 'Tạp hóa', '#8C5A3C', 12)}
      <rect x="168" y="0" width="14" height="144" fill="#7A5A3F"/><ellipse cx="175" cy="8" rx="76" ry="34" fill="#4E9B5E"/><ellipse cx="128" cy="18" rx="42" ry="22" fill="#3E8A50"/>
      <rect y="144" width="360" height="36" fill="#BFB6A8"/><rect x="156" y="140" width="48" height="5" rx="1" fill="#2F6FD1"/><rect x="160" y="145" width="4" height="22" fill="#2F6FD1"/><rect x="196" y="145" width="4" height="22" fill="#2F6FD1"/>
      <rect x="166" y="129" width="8" height="11" fill="#E3A447" opacity=".9"/><rect x="186" y="129" width="8" height="11" fill="#E3A447" opacity=".9"/><rect x="176" y="133" width="8" height="7" fill="#C0392B"/>`;
  } else if (kind === 'biahoi') {
    s = `<rect width="360" height="180" fill="#3A2E4A"/><rect y="146" width="360" height="34" fill="#5A4A3A"/><path d="M0 22 Q90 44 180 26 T360 28" stroke="#2B2B2B" stroke-width="1.5" fill="none"/>`;
    for (let i = 0; i < 12; i++) { const x = 14 + i * 30; s += `<circle cx="${x}" cy="${30 + Math.sin(i * 1.1) * 7}" r="4" fill="#FFE58A"/>`; }
    s += `<rect x="120" y="48" width="120" height="28" rx="4" fill="#C0392B"/>${T(180, 67, 'Bia hơi Hà Thành', '#FFE58A', 13)}
      <rect x="154" y="138" width="52" height="6" rx="1" fill="#E5484D"/><rect x="158" y="144" width="4" height="22" fill="#E5484D"/><rect x="198" y="144" width="4" height="22" fill="#E5484D"/>
      <rect x="162" y="120" width="11" height="18" rx="2" fill="#F5C04A"/><rect x="162" y="117" width="11" height="5" rx="2" fill="#fff"/><rect x="186" y="120" width="11" height="18" rx="2" fill="#F5C04A"/><rect x="186" y="117" width="11" height="5" rx="2" fill="#fff"/>`;
  } else if (kind === 'cafe') {
    s = `<rect width="360" height="180" fill="#F3E1CF"/>` + win(24, 20, 100, 70) + `<rect y="146" width="360" height="34" fill="#A9785A"/>
      <path d="M190 0 V24 M250 0 V30 M310 0 V22" stroke="#5B4636" stroke-width="1.5"/><path d="M180 24 h20 l-4 10 h-12z M240 30 h20 l-4 10 h-12z M300 22 h20 l-4 10 h-12z" fill="#E9A23B"/>
      <rect x="232" y="62" width="110" height="6" fill="#8B5A3C"/><rect x="242" y="48" width="12" height="14" rx="2" fill="#fff"/><rect x="262" y="50" width="12" height="12" rx="2" fill="#E07A5F"/><rect x="282" y="46" width="12" height="16" rx="2" fill="#81B29A"/>
      <circle cx="180" cy="139" r="22" fill="#8B5A3C"/><rect x="177" y="139" width="6" height="28" fill="#5B4636"/><rect x="168" y="124" width="10" height="9" rx="2" fill="#FFF3D6"/><rect x="183" y="124" width="10" height="9" rx="2" fill="#FFF3D6"/>`;
  } else if (kind === 'lake') {
    s = `<rect width="360" height="180" fill="${sky}"/><path d="M0 92 Q60 70 120 88 T240 84 T360 86 V120 H0Z" fill="#6FA37C"/><rect y="104" width="360" height="40" fill="#7FB8D6"/><path d="M20 118 h40 M110 128 h50 M220 116 h40 M300 130 h40" stroke="#fff" stroke-width="2" opacity=".6"/>
      <rect y="144" width="360" height="36" fill="#D9C9A3"/><rect x="40" y="40" width="10" height="104" fill="#6B5040"/><ellipse cx="45" cy="44" rx="40" ry="26" fill="#5FA36C"/><path d="M15 50 Q12 90 18 110 M30 54 Q28 96 32 118 M62 54 Q66 96 60 116 M76 50 Q80 86 74 104" stroke="#5FA36C" stroke-width="5" fill="none"/>
      <rect x="290" y="128" width="54" height="6" fill="#8B5A3C"/><rect x="294" y="134" width="4" height="14" fill="#8B5A3C"/><rect x="336" y="134" width="4" height="14" fill="#8B5A3C"/>`;
  } else if (kind === 'library') {
    s = `<rect width="360" height="180" fill="#EDE3D2"/><rect y="146" width="360" height="34" fill="#B89B7A"/>`;
    for (let r = 0; r < 3; r++) { s += `<rect x="10" y="${24 + r * 38}" width="340" height="5" fill="#8B5A3C"/>`;
      for (let i = 0; i < 26; i++) { const c = ['#E07A5F','#3D5A80','#81B29A','#F2CC8F','#9C89B8','#E9A23B'][(i + r) % 6]; s += `<rect x="${14 + i * 13}" y="${6 + r * 38}" width="10" height="18" fill="${c}"/>`; } }
    s += `<rect x="150" y="134" width="60" height="6" fill="#8B5A3C"/><rect x="164" y="124" width="16" height="10" fill="#fff"/>`;
  } else if (kind === 'mall') {
    s = `<rect width="360" height="180" fill="#F1F4F9"/><rect y="146" width="360" height="34" fill="#D9DFE8"/>`;
    [['#E07A5F',10],['#3D5A80',130],['#81B29A',250]].forEach(([c, x]) => s += `<rect x="${x}" y="30" width="100" height="90" fill="#fff" stroke="#C9D1DB" stroke-width="2"/><path d="M${x} 30 h100 v16 q-12 8 -25 0 q-12 8 -25 0 q-12 8 -25 0 q-12 8 -25 0z" fill="${c}"/><rect x="${x + 30}" y="70" width="40" height="50" fill="#E9EEF5"/>`);
  }
  return s;
}
function tintSVG(){
  if (S.slot === 'evening') return '<rect width="360" height="180" fill="#FF8A4C" opacity=".10"/>';
  if (S.slot === 'night') return '<rect width="360" height="180" fill="#121836" opacity=".32"/>';
  return '';
}
