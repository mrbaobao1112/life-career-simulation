const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
let st = {runs:0, errors:0, jobs:{}, noJob:0, fail:[], scenes:{}, replies:0, hang:0, msgs:0, steps:[]};
const N = +process.argv[2] || 300;
for (let run=0; run<N; run++){
  const errs=[];
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; } });
  const w = dom.window, d = w.document;
  w.addEventListener('error', e => errs.push(e.message + ' @' + (e.lineno||'')));
  try {
    d.querySelector('#fresh').click();
    const hs=d.querySelectorAll('.hairopt'); hs[run%hs.length].click();
    d.querySelectorAll('#hcs .sw')[run%6].click();
    if (run%4===0) d.querySelector('#rnd').click();
    if (run%2) d.querySelector('.gopt[data-g="nu"]').click();
    d.querySelectorAll('.bgopt[data-f]')[run%3].click(); d.querySelectorAll('.bgopt[data-b]')[run%3].click();
    d.querySelector('#go').click();
    let steps=0;
    while(steps<900){
      steps++;
      if (d.querySelector('#again')) break;
      // điện thoại
      if (Math.random()<.15 && !d.querySelector('#phoneFab').hidden){
        d.querySelector('#phoneFab').click();
        const items=[...d.querySelectorAll('.ph-item')];
        if (items.length){ items[Math.floor(Math.random()*items.length)].click(); const rs=[...d.querySelectorAll('.reply')]; if(rs.length && Math.random()<.8){ rs[Math.floor(Math.random()*rs.length)].click(); st.replies++; } const back=d.querySelector('#phBack'); if(back) back.click(); }
        const c=d.querySelector('#phClose'); if(c) c.click();
      }
      const tn = d.querySelector('#tNext'); if (tn && Math.random()<.7){ tn.click(); continue; }
      const ts = d.querySelector('#tSkip'); if (ts){ ts.click(); continue; }
      const next = d.querySelector('#next'); if (next){ next.click(); continue; }
      const ch=[...d.querySelectorAll('#stage .choice')].filter(b=>!b.disabled && !b.closest('[hidden]'));
      if(!ch.length){ errs.push('stuck: '+d.querySelector('#stage').textContent.slice(0,160)); break; }
      const S = w.eval('S'); if (S && S.cur){ st.scenes[S.cur.id]=(st.scenes[S.cur.id]||0)+1; if(S.cur.id==='hangout') st.hang++; }
      ch[Math.floor(Math.random()*ch.length)].click();
    }
    st.steps.push(steps);
    if (!d.querySelector('#again')) errs.push('no end');
    const S = w.eval('S');
    if (S){ if (S.job) st.jobs[S.job.co]=(st.jobs[S.job.co]||0)+1; else st.noJob++;
      st.msgs += Object.values(S.phone.threads).reduce((a,t)=>a+t.length,0);
      const h=d.querySelector('#app').innerHTML+d.querySelector('#dlg').innerHTML; if(/undefined|NaN/.test(h)) errs.push('undefined/NaN: '+h.match(/.{60}(undefined|NaN).{40}/)?.[0]); }
  } catch(e){ errs.push(e.stack.split('\n').slice(0,3).join(' | ')); }
  st.runs++;
  if (errs.length){ st.errors++; if (st.fail.length<6) st.fail.push(errs.slice(0,3)); }
  w.close();
}
const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
console.log(JSON.stringify({runs:st.runs, errors:st.errors, jobs:st.jobs, noJob:st.noJob, replies:st.replies, hang:st.hang, avgMsgsPerRun:Math.round(st.msgs/st.runs), avgSteps:avg(st.steps), fail:st.fail, scenes:st.scenes},null,1));
