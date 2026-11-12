/* =========================================================
   TRẠNG THÁI & TIỆN ÍCH
   ========================================================= */
const SAVE_KEY = 'lcs-tuan-dau-tien-v6';
let S = null;
let current = null;

const $ = s => document.querySelector(s);
const fmt = n => Math.round(n).toLocaleString('vi-VN') + 'đ';
const fmtTr = n => (n/1e6).toLocaleString('vi-VN', { maximumFractionDigits:1 }) + ' triệu';
const clamp = (v, a=0, b=100) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const P = (...ls) => ls.filter(Boolean).map(l => `<p>${l}</p>`).join('');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(a){ a = a.slice(); for (let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function fmtH(h){ const H = Math.floor(h), M = Math.round((h-H)*60); return M ? `${H} tiếng ${M} phút` : `${H} tiếng`; }
function clock(h){ h = ((h % 24) + 24) % 24; const H = Math.floor(h), M = Math.round((h-H)*60); return String(H).padStart(2,'0') + ':' + String(M).padStart(2,'0'); }

function rel(k, d){ S.rel[k] = (S.rel[k] ?? 50) + d; }
function eat(v){ logMeal(v >= 20 ? 'home' : v >= 10 ? 'cook' : v > 0 ? 'ot' : 'skip'); }
function note(t){ S.notes.push(t); }
function memo(t){ S.memo.push({ day:S.day, text:t }); }
function co(){ return COMPANIES[S.job ? S.job.co : S.applied]; }
function isWorkday(d = S.day){ return !!S.job && d >= S.job.start && !isDayOff(d) && !leaveOn(d); }
function goingOut(d = S.day){ return isWorkday(d) || d === S.ivDay || d === S.backupDay; }
function snap(){ return { money:S.money, energy:S.energy, health:S.health, mood:S.mood, tech:S.tech, soft:S.soft, rel:{ ...S.rel } }; }
function clampAll(){
  ['health','mood','tech','soft'].forEach(k => S[k] = clamp(Math.round(S[k]))); S.energy = clamp(Math.round(S.energy), 0, energyCap());
  Object.keys(S.rel).forEach(k => S.rel[k] = clamp(Math.round(S.rel[k])));
  S.money = Math.round(S.money);
}
function save(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e) {} }
function load(){ try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch(e) { return null; } }
function wipe(){ try { localStorage.removeItem(SAVE_KEY); } catch(e) {} }

