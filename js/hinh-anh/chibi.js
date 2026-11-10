/* =========================================================
   VẼ NHÂN VẬT CHIBI THEO LỚP
   Khung gốc: đầu tâm (60,52) bán kính 40, chân chạm y≈140
   ========================================================= */
const HAIR = {
  hair_short: { front:'M18 56 Q14 8 60 8 Q106 8 102 56 Q98 36 84 28 Q74 38 56 32 Q36 34 18 56Z' },
  hair_spiky: { front:'M18 54 L15 26 L30 29 L29 9 L45 18 L56 -1 L67 16 L85 5 L87 24 L104 24 L102 54 Q96 34 80 30 Q66 40 48 32 Q30 36 18 54Z' },
  hair_side:  { front:'M18 58 Q12 8 62 6 Q108 8 102 58 Q100 38 92 30 Q72 22 40 44 Q38 32 34 34 Q24 40 18 58Z' },
  hair_bob:   { back:'M13 56 Q9 4 60 4 Q111 4 107 56 L109 94 Q97 102 86 92 L34 92 Q23 102 11 94Z',
                front:'M20 52 Q20 12 60 10 Q100 12 100 52 Q99 38 93 34 L27 34 Q21 38 20 52Z' },
  hair_long:  { back:'M13 56 Q7 2 60 2 Q113 2 107 56 L113 128 Q95 135 86 121 L34 121 Q25 135 7 128Z',
                front:'M20 56 Q16 10 60 8 Q104 10 100 56 Q96 32 76 26 Q60 40 34 36 Q24 42 20 56Z' },
  hair_bun:   { back:'M45 4 A15 15 0 1 1 75 4 A15 15 0 1 1 45 4Z',
                front:'M18 56 Q16 10 60 10 Q104 10 102 56 Q94 30 60 26 Q26 30 18 56Z' },
  hair_pixie: { front:'M18 58 Q14 8 60 8 Q106 8 102 58 Q102 40 94 32 Q80 24 66 32 Q56 42 42 36 Q30 36 24 46 Q20 52 18 58Z' },
};
function shade(hex, p){
  const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * (1 + p))));
  return '#' + ((1 << 24) + (f(n >> 16) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
}
function armsSVG(L){
  const c = L.outfit.color, sk = L.skin, dk = shade(c === '#FFFFFF' ? '#D8DEE6' : c, -.2);
  return `<g class="cb-armL"><ellipse cx="33" cy="104" rx="8" ry="13" fill="${c}" stroke="${dk}" stroke-width="1.2" transform="rotate(18 33 104)"/><circle cx="28" cy="115" r="6" fill="${sk}"/></g><g class="cb-armR"><ellipse cx="87" cy="104" rx="8" ry="13" fill="${c}" stroke="${dk}" stroke-width="1.2" transform="rotate(-18 87 104)"/><circle cx="92" cy="115" r="6" fill="${sk}"/></g>`;
}
function bodySVG(L){
  const o = L.outfit, c = o.color, sk = L.skin, dk = shade(c === '#FFFFFF' ? '#D8DEE6' : c, -.2);
  const pants = { pajama:c, shirt:'#3A4A5E', blazer:'#2E3646', tee:'#4A6FA5', jersey:'#2E3A59', hoodie:'#3B4252', polo:'#5C5146', cardigan:'#6B5B73' }[o.kind] || '#3A4A5E';
  let s = `<rect x="45" y="118" width="12" height="17" rx="5" fill="${pants}"/><rect x="63" y="118" width="12" height="17" rx="5" fill="${pants}"/>
    <ellipse cx="50" cy="136" rx="8" ry="4" fill="#3A3A44"/><ellipse cx="70" cy="136" rx="8" ry="4" fill="#3A3A44"/>
    <g class="cb-backarms">${armsSVG(L)}</g>
    
    <path class="cb-torso" d="M35 99 Q35 88 47 88 L73 88 Q85 88 85 99 L87 124 Q60 130 33 124Z" fill="${c}" stroke="${dk}" stroke-width="1.2"/>`;
  switch (o.kind) {
    case 'pajama': s += `<path d="M47 91 V126 M60 90 V128 M73 91 V126" stroke="#fff" stroke-opacity=".55" stroke-width="3"/><circle cx="60" cy="98" r="2" fill="#fff"/>`; break;
    case 'shirt':
      s += `<path d="M50 88 L60 99 L70 88" fill="#fff" stroke="#C3CBD6" stroke-width="1.5"/><circle cx="60" cy="106" r="1.6" fill="#AEB7C2"/><circle cx="60" cy="114" r="1.6" fill="#AEB7C2"/>`;
      if (L.tie) s += `<path d="M57.5 98 L62.5 98 L64.5 116 L60 121 L55.5 116Z" fill="#2F5FB3"/>`;
      if (L.badge) s += `<path d="M50 89 L57 108 M70 89 L63 108" stroke="#2F6FD1" stroke-width="2"/><rect x="53" y="107" width="14" height="16" rx="2" fill="#fff" stroke="#9AA7B6"/><rect x="53" y="107" width="14" height="5" rx="2" fill="${L.badgeColor || '#2F6FD1'}"/><rect x="56" y="114" width="8" height="5" rx="1" fill="#9FC2F2"/>`;
      break;
    case 'tee': s += `<path d="M52 88 Q60 96 68 88" stroke="${dk}" fill="none" stroke-width="2.2"/>`; break;
    case 'jersey': s += `<path d="M51 88 L60 95 L69 88" fill="none" stroke="#F5C04A" stroke-width="3"/><text x="60" y="119" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Be Vietnam Pro,Arial,sans-serif">10</text>`; break;
    case 'blazer': s += `<path d="M50 88 L60 112 L70 88Z" fill="#fff"/><path d="M50 88 L57 108 M70 88 L63 108" stroke="${dk}" stroke-width="2"/>`; break;
    case 'hoodie': s += `<path d="M44 90 Q60 101 76 90" stroke="${dk}" stroke-width="4" fill="none"/><path d="M56 97 V108 M64 97 V108" stroke="#fff" stroke-width="1.6"/><rect x="48" y="112" width="24" height="9" rx="3" fill="${dk}" opacity=".5"/>`; break;
    case 'polo': s += `<path d="M51 88 L57 96 L60 90 L63 96 L69 88" fill="#fff" stroke="${dk}" stroke-width="1.2"/><circle cx="60" cy="100" r="1.5" fill="${dk}"/>`; break;
    case 'cardigan': s += `<path d="M52 88 L60 127 L68 88Z" fill="#FFF6EC"/><circle cx="56" cy="104" r="1.6" fill="${dk}"/><circle cx="57" cy="114" r="1.6" fill="${dk}"/>`; break;
  }
  return s;
}
function faceSVG(expr, sk, o = {}){
  const ink = '#2B2321', mc = '#9B3D3D', st = `stroke="${ink}" stroke-width="3" stroke-linecap="round" fill="none"`;
  const eye = x => `<g class="cb-eye"><ellipse cx="${x}" cy="58" rx="7" ry="9" fill="${ink}"/><circle cx="${x + 2.6}" cy="54.6" r="3" fill="#fff"/><circle cx="${x - 2.2}" cy="61.5" r="1.4" fill="#fff"/></g>`;
  const ck = (col = '#F7A1A8', op = .7) => `<ellipse cx="32" cy="70" rx="7" ry="4.5" fill="${col}" opacity="${op}"/><ellipse cx="88" cy="70" rx="7" ry="4.5" fill="${col}" opacity="${op}"/>`;
  let s;
  switch (expr) {
    case 'happy': s = `<path d="M37 60 Q44 50 51 60" ${st}/><path d="M69 60 Q76 50 83 60" ${st}/>${ck()}<path d="M51 70 Q60 84 69 70Z" fill="${mc}"/>`; break;
    case 'tired': s = `<path d="M37 59 Q44 63 51 59" ${st}/><path d="M69 59 Q76 63 83 59" ${st}/>${ck('#F7A1A8', .35)}<path d="M55 75 L65 75" ${st}/>`; break;
    case 'sad': s = `${eye(44)}${eye(76)}<path d="M36 46 L50 42" ${st}/><path d="M70 42 L84 46" ${st}/>${ck('#F7A1A8', .4)}<path d="M53 77 Q60 71 67 77" ${st}/><path d="M37 67 Q36 72 38 75" stroke="#8CC8F2" stroke-width="3" stroke-linecap="round" fill="none"/>`; break;
    case 'sick': s = `<path d="M37 55 L50 59 L37 63" ${st}/><path d="M83 55 L70 59 L83 63" ${st}/><ellipse cx="32" cy="70" rx="8" ry="5" fill="#A8D5A2" opacity=".75"/><ellipse cx="88" cy="70" rx="8" ry="5" fill="#A8D5A2" opacity=".75"/><path d="M51 76 Q55 72 60 76 Q65 80 69 76" ${st}/>`; break;
    case 'yawn': s = `<path d="M37 58 Q44 62 51 58" ${st}/><path d="M69 58 Q76 62 83 58" ${st}/>${ck('#F7A1A8', .4)}<ellipse cx="60" cy="77" rx="7" ry="9" fill="${mc}"/><path d="M34 62 q-2 4 0 7" stroke="#8CC8F2" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; break;
    case 'panic': s = `<circle cx="44" cy="58" r="8.5" fill="#fff" stroke="${ink}" stroke-width="2.4"/><circle cx="76" cy="58" r="8.5" fill="#fff" stroke="${ink}" stroke-width="2.4"/><circle cx="44" cy="59" r="2.6" fill="${ink}"/><circle cx="76" cy="59" r="2.6" fill="${ink}"/>${ck('#F7A1A8', .5)}<ellipse cx="60" cy="76" rx="4.5" ry="5.5" fill="${mc}"/>`; break;
    case 'drunk': s = `<path d="M38 58 a6 6 0 1 1 6 6 a3 3 0 1 1 -1 -3" ${st} stroke-width="2.4"/><path d="M70 58 a6 6 0 1 1 6 6 a3 3 0 1 1 -1 -3" ${st} stroke-width="2.4"/>${ck('#F26B7A', .85)}<path d="M51 75 Q55 71 60 75 Q65 79 69 75" ${st}/>`; break;
    case 'annoyed': s = `${eye(44)}${eye(76)}<rect x="35" y="47" width="18" height="8" fill="${sk}"/><rect x="67" y="47" width="18" height="8" fill="${sk}"/><path d="M36 55 L52 55" ${st}/><path d="M68 55 L84 55" ${st}/><path d="M54 76 L66 76" ${st}/>`; break;
    default: s = `${eye(44)}${eye(76)}${ck()}<path d="M54 73 Q60 78 66 73" ${st}/>`;
  }
  const bc = o.hc || ink;
  if (expr !== 'sad' && expr !== 'annoyed') {
    if (o.g === 'nam') s += `<path d="M36 45 Q44 41 52 45" stroke="${bc}" stroke-width="3.6" stroke-linecap="round" fill="none"/><path d="M68 45 Q76 41 84 45" stroke="${bc}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
    if (o.g === 'nu') s += `<path d="M38 46 Q44 43 50 46" stroke="${bc}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".85"/><path d="M70 46 Q76 43 82 46" stroke="${bc}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".85"/>`;
  }
  if (o.g === 'nu') s += ['happy','tired'].includes(expr)
    ? `<path d="M37 59 L33 56 M83 59 L87 56" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
    : ['sick','drunk'].includes(expr) ? '' : `<path d="M37.5 54 L33 50.5 M39 51 L35.5 47 M82.5 54 L87 50.5 M81 51 L84.5 47" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
  if (o.dark) s += `<path d="M37 68 Q44 71 51 68 M69 68 Q76 71 83 68" stroke="#8E6FA6" stroke-opacity=".6" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return s;
}
const EXTRA = {
  sparkle:`<path d="M104 14 L107 21 L114 24 L107 27 L104 34 L101 27 L94 24 L101 21Z" fill="#F5C04A"/><path d="M14 30 L16 34 L20 36 L16 38 L14 42 L12 38 L8 36 L12 34Z" fill="#F5C04A"/>`,
  zzz:`<text x="99" y="18" font-size="16" font-weight="800" fill="#7C8DB5" font-family="Be Vietnam Pro,Arial,sans-serif">z</text><text x="110" y="5" font-size="12" font-weight="800" fill="#7C8DB5" font-family="Be Vietnam Pro,Arial,sans-serif">z</text>`,
  cloud:`<g fill="#8A94A6"><ellipse cx="96" cy="0" rx="12" ry="8"/><ellipse cx="106" cy="-4" rx="10" ry="8"/><ellipse cx="114" cy="2" rx="9" ry="7"/></g><path d="M98 11 L96 17 M106 11 L104 17 M114 10 L112 16" stroke="#8CC8F2" stroke-width="2" stroke-linecap="round"/>`,
  sweat:`<path d="M105 24 Q112 35 105 39 Q98 35 105 24Z" fill="#8CC8F2" stroke="#5FA8DA" stroke-width="1"/>`,
  anger:`<path d="M98 12 q4 4 0 8 M106 12 q-4 4 0 8 M96 18 q5 -4 10 0 M96 14 q5 4 10 0" stroke="#E5484D" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  bubbles:`<circle cx="104" cy="22" r="4" fill="none" stroke="#9FC2F2" stroke-width="1.6"/><circle cx="112" cy="12" r="3" fill="none" stroke="#9FC2F2" stroke-width="1.6"/><circle cx="117" cy="3" r="2" fill="none" stroke="#9FC2F2" stroke-width="1.6"/>`,
};
EXTRA.alarm = `<g class="cb-alarm"><circle cx="-12" cy="10" r="4" fill="#E5484D"/><circle cx="4" cy="10" r="4" fill="#E5484D"/><circle cx="-4" cy="20" r="11" fill="#E5484D"/><circle cx="-4" cy="20" r="8" fill="#fff"/><path d="M-4 20 V14 M-4 20 L0 22" stroke="#2B2321" stroke-width="1.6"/></g>`;
EXTRA.excl = `<text x="100" y="20" font-size="24" font-weight="800" fill="#E5484D" font-family="Be Vietnam Pro,Arial,sans-serif">!</text>`;
const EXPR_EXTRA = { yawn:['zzz'], happy:['sparkle'], tired:['zzz'], sad:['cloud'], sick:['sweat'], panic:['sweat'], drunk:['bubbles'], annoyed:['anger'] };
const ACC = {
  glasses:`<g fill="#fff" fill-opacity=".18" stroke="#2B2321" stroke-width="2.4"><circle cx="44" cy="58" r="11.5"/><circle cx="76" cy="58" r="11.5"/></g><path d="M55.5 57 Q60 54 64.5 57" stroke="#2B2321" stroke-width="2.4" fill="none"/>`,
  headphones:`<path d="M15 60 Q13 2 60 2 Q107 2 105 60" stroke="#3A3F4B" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="7" y="49" width="15" height="24" rx="7" fill="#E25B5B"/><rect x="98" y="49" width="15" height="24" rx="7" fill="#E25B5B"/>`,
  book:`<g transform="rotate(-12 92 110)"><rect x="80" y="96" width="24" height="28" rx="2" fill="#5B8DEF"/><rect x="83" y="99" width="18" height="22" fill="#fff" opacity=".25"/></g>`,
  magnifier:`<circle cx="99" cy="98" r="10" fill="#DDF1FF" fill-opacity=".7" stroke="#6B4F2A" stroke-width="3"/><path d="M95 107 L90 118" stroke="#6B4F2A" stroke-width="4" stroke-linecap="round"/>`,
  coffee:`<rect x="86" y="104" width="15" height="17" rx="3" fill="#fff" stroke="#C9A27A" stroke-width="1.5"/><rect x="86" y="108" width="15" height="4" fill="#8B5A3C"/>`,
  notebook:`<rect x="17" y="102" width="17" height="21" rx="2" fill="#F2B851"/><path d="M20 108 H31 M20 113 H31" stroke="#fff" stroke-width="1.5"/>`,
  mustache:`<path d="M48 69 Q54 64 60 68 Q66 64 72 69 Q66 72 60 70 Q54 72 48 69Z" fill="#3B2B2B"/>`,
  phone:`<rect x="86" y="101" width="11" height="19" rx="2.5" fill="#2B3240"/><rect x="88" y="104" width="7" height="12" rx="1" fill="#9FC2F2"/>`,
};
const HELD = ['book','magnifier','coffee','notebook','phone'];
function chibi(L, expr = 'neutral', o = {}){
  const H = HAIR[L.hair] || HAIR.hair_short, hc = L.hairColor, sk = L.skin, acc = L.acc || [];
  const held = acc.filter(a => HELD.includes(a)).map(a => ACC[a]).join('');
  const faceAcc = acc.filter(a => a === 'mustache' || a === 'glasses').map(a => ACC[a]).join('');
  const top = acc.includes('headphones') ? ACC.headphones : '';
  const extras = o.noExtras ? '' : (o.extras || EXPR_EXTRA[expr] || []).map(e => EXTRA[e] || '').join('');
  return `${H.back ? `<path d="${H.back}" fill="${hc}"/>` : ''}${bodySVG(L)}${held}
    <g class="cb-head"><circle cx="19" cy="58" r="8" fill="${sk}"/><circle cx="101" cy="58" r="8" fill="${sk}"/>
    <circle cx="60" cy="52" r="40" fill="${sk}" stroke="${shade(sk, -.18)}" stroke-width="1.4"/>
    ${faceSVG(expr, sk, { ...o, g:L.g, hc:L.hairColor })}${faceAcc}<path d="${H.front}" fill="${hc}" stroke="${shade(hc, -.3)}" stroke-width="1" stroke-opacity=".5"/>${top}</g><g class="cb-front">${armsSVG(L)}</g>${extras}`;
}
function chibiSVG(L, expr, o = {}){
  return `<svg viewBox="-14 -18 148 158" role="img" aria-label="${o.label || 'Nhân vật'}"><g class="cb cb-idle">${chibi(L, expr, o)}</g></svg>`;
}
function headSVG(L, expr = 'neutral'){
  return `<svg viewBox="4 -6 112 100" aria-hidden="true">${chibi({ ...L, acc:(L.acc || []).filter(a => !HELD.includes(a)) }, expr, { noExtras:true })}</svg>`;
}

/* ----- Nhân vật phụ ----- */
const NPC = {
  tung:   { name:'Tùng', base:'happy', look:{ g:'nam', hair:'hair_spiky', hairColor:'#2B2321', skin:'#E8B48C', outfit:{ kind:'jersey', color:'#D7263D' } } },
  linh:   { name:'Linh', look:{ g:'nu', hair:'hair_long', hairColor:'#3A2A22', skin:'#FFE6D5', outfit:{ kind:'cardigan', color:'#8FBF9F' }, acc:['glasses','book'] } },
  boss:   { name:'Chị Hạnh', look:{ g:'nu', hair:'hair_bob', hairColor:'#4A3226', skin:'#FFD6BA', outfit:{ kind:'blazer', color:'#3D5A80' }, acc:['coffee','notebook'] } },
  dung:   { name:'Anh Dũng', look:{ g:'nam', hair:'hair_side', hairColor:'#2B2321', skin:'#E8B48C', outfit:{ kind:'hoodie', color:'#5E6A7D' }, acc:['headphones'] } },
  mai:    { name:'Chị Mai', look:{ g:'nu', hair:'hair_bun', hairColor:'#7A2E40', skin:'#FFE6D5', outfit:{ kind:'tee', color:'#F6C85F' }, acc:['magnifier'] } },
  phong:  { name:'Phong', base:'panic', look:{ g:'nam', hair:'hair_short', hairColor:'#4A3226', skin:'#FFD6BA', outfit:{ kind:'shirt', color:'#FFFFFF' }, badge:true } },
  hr:     { name:'Chị HR', look:{ g:'nu', hair:'hair_bob', hairColor:'#2B2321', skin:'#FFE6D5', outfit:{ kind:'blazer', color:'#B5838D' }, acc:['notebook'] } },
  lead:   { name:'Anh trưởng nhóm', look:{ g:'nam', hair:'hair_short', hairColor:'#2B2321', skin:'#E8B48C', outfit:{ kind:'hoodie', color:'#2F3B52' }, acc:['glasses'] } },
  giamdoc:{ name:'Anh giám đốc', base:'happy', look:{ g:'nam', hair:'hair_side', hairColor:'#2B2321', skin:'#E8B48C', outfit:{ kind:'polo', color:'#E9C46A' }, acc:['mustache'] } },
  mom:    { name:'Mẹ', look:{ g:'nu', hair:'hair_bun', hairColor:'#2B2321', skin:'#FFD6BA', outfit:{ kind:'cardigan', color:'#C77D8E' } } },
  dad:    { name:'Bố', look:{ g:'nam', hair:'hair_side', hairColor:'#5A5A62', skin:'#E8B48C', outfit:{ kind:'polo', color:'#6D8B74' }, acc:['mustache'] } },
};
function defaultNpcExpr(k){
  const base = (NPC[k] && NPC[k].base) || 'neutral';
  if (S && S.rel && S.rel[k] !== undefined) { const v = S.rel[k]; if (v < 35) return 'annoyed'; if (v >= 72) return 'happy'; }
  return base;
}

/* ----- Nhân vật chính ----- */
function playerCtx(){
  const id = S.cur && S.cur.id;
  if (id === 'wake' || id === 'bedtime' || S.slot === 'night') return 'sleep';
  if (S.slot === 'evening') return S.otTonight === true ? 'work' : 'casual';
  return goingOut() ? 'work' : 'casual';
}
function playerLook(ctx = playerCtx()){
  const L = lookToL(S.look, ctx, S.gender);
  if (ctx === 'work') { L.badge = isWorkday(); L.tie = !isWorkday(); L.badgeColor = S.job ? CO_COLOR[S.job.co] : null; }
  return L;
}
function playerExpr(){
  if (S.flags.hangoverToday && S.slot === 'morning') return 'drunk';
  if (S.health < 35) return 'sick';
  if (S.energy < 25) return 'tired';
  if (S.mood < 35) return 'sad';
  if (S.mood >= 75 && S.energy >= 45) return 'happy';
  return 'neutral';
}
const darkCircles = () => S.day > 1 && S.sleep < 6 && S.slot !== 'night';

