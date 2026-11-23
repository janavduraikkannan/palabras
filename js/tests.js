/* SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 janavduraikkannan and Linguae contributors */
/* ---------- Practice Test mode: the mechanics (shared by every practice site) ----------
   A site has this mode if it has site/tests.js, which defines PTESTS: the groups of pages, the study guide pages and the tests
   (see that file). A site without it never shows the Practice Test tab, so this file can be copied everywhere.

   Pages open at #t/<page id>, like lessons open at #l/<lesson id>. A test is graded by code; the AI only explains what was missed.
   The student chooses when answers are checked: "As I go" (each answer right after it is written) or "At the end".  */
const PT_ON=typeof PTESTS!=='undefined'&&!!(PTESTS.groups&&PTESTS.groups.length);
const ptPages=PT_ON?PTESTS.groups.flatMap(g=>g.pages.map(p=>Object.assign({group:g.title},p))):[];
const ptById=id=>ptPages.find(p=>p.id===id);
const ptx={t:null,qs:[],mode:'end',strict:false,tok:0};
const ptIcon=p=>p.kind==='test'?'quill-ink':'scroll-unfurled';

/* ---------- the Practice Test tab: groups of pages ---------- */
function testsPane(){
  const pane=$('paneTests');if(!pane||!PT_ON)return;
  pane.innerHTML=`<p class="intro">Pick a page to open. Use the study guide to learn a topic, then take the practice test.</p>`+
    PTESTS.groups.map(g=>`<section class="ptgroup"><h2 class="lcourse">${esc(g.title)}</h2><ol>${g.pages.map(p=>
      `<li><a class="lrow" href="#t/${encodeURIComponent(p.id)}"><span class="lnum"><svg class="gi" aria-hidden="true"><use href="#gi-${ptIcon(p)}"/></svg></span><span class="ltxt"><b>${esc(p.title)}</b><small>${esc(p.blurb||'')}</small></span></a></li>`).join('')}</ol></section>`).join('');
}
function testsLeave(){ptx.tok++;ptx.t=null}
function testsSetup(){
  if(!PT_ON)return;
  $('tabTests').hidden=false;testsPane();
  if(window.ResizeObserver)new ResizeObserver(([e])=>{if(e.target.offsetHeight)document.documentElement.style.setProperty('--barh',e.target.offsetHeight+'px')}).observe($('bar'));
  const pv=$('pageview');
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#t/"]');if(a)page.inside=true});
  pv.addEventListener('click',e=>{
    const j=e.target.closest('[data-jump]');if(j){e.preventDefault();const el=$(j.dataset.jump);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(!ptx.t)return;
    const m=e.target.closest('[data-m]');
    if(m){const i=ptx.last&&ptx.last.isConnected&&!ptx.last.disabled?ptx.last:null;if(i)ptInsert(i,m.dataset.m);return}
    const b=e.target.closest('[data-pt]');if(!b)return;
    const a=b.dataset.pt;
    if(a==='one')ptCheckOne(+b.dataset.i);
    else if(a==='all')ptCheckAll();
    else if(a==='retry')ptStart(false);
    else if(a==='new')ptStart(true);
    else if(a==='key')lsOpenKey();
  });
  pv.addEventListener('change',e=>{
    if(e.target.name==='ptwhen'){ptx.mode=e.target.value;lsSet('verba-ptwhen',ptx.mode);ptModeUI()}
    else if(e.target.id==='ptStrict'){ptx.strict=e.target.checked;lsSet('verba-ptstrict',ptx.strict)}
  });
  pv.addEventListener('keydown',e=>{
    const el=e.target;if(e.key!=='Enter'||!el.classList||!el.classList.contains('ptin'))return;
    e.preventDefault();const i=+el.dataset.i;
    if(ptx.mode==='go'&&!ptx.qs[i].done){ptCheckOne(i);return}
    if(i===ptx.qs.length-1){$('ptAll').focus();return}
    ptFocusAfter(i);
  });
  pv.addEventListener('focusin',e=>{const t=e.target;if(t.classList&&t.classList.contains('ptin')){ptx.last=t;if(!t.dataset.mk){t.dataset.mk='1';if(window.typeAssist)t.addEventListener('input',()=>window.typeAssist(t))}}});
}
function ptInsert(el,ch){const p=el.selectionStart??el.value.length;el.value=el.value.slice(0,p)+ch+el.value.slice(el.selectionEnd??p);el.focus();el.setSelectionRange(p+ch.length,p+ch.length)}
function ptFocusAfter(i){
  const next=ptx.qs.slice(i+1).find(q=>!q.done)||ptx.qs.find(q=>!q.done);
  if(next)next.input.focus();else{const b=document.querySelector('[data-pt=retry]');if(b)b.focus()}
}

/* ---------- a page: the study guide, or a test ---------- */
function renderTestPage(id){
  const p=ptById(id),pv=$('pageview');
  if(!p){pv.innerHTML=pvTop()+`<section class="pv"><h1>Page not found</h1><p>This page doesn’t exist. Open the Practice Test tab to see them all.</p></section>`;pvBind();return}
  ptx.tok++;
  if(p.kind==='guide'){ptx.t=null;pv.innerHTML=pvTop()+`<article class="pv ptpage ptguide">${PTESTS.guide[p.id]()}</article>`;pvBind();return}
  ptx.t=PTESTS.tests[p.test];ptx.page=p;
  ptx.mode=lsGet('verba-ptwhen','end')==='go'?'go':'end';ptx.strict=lsGet('verba-ptstrict',false)===true;
  pv.innerHTML=pvTop()+`<article class="pv ptpage pttest">
    <p class="lkick">${esc(p.group)} · Practice Test</p><h1>${esc(ptx.t.title)}</h1><p class="lblurb">${esc(ptx.t.intro)}</p>
    <section class="ptbank"><h2>${esc(ptx.t.bankTitle||'Word bank')}</h2><div class="ptbankgrid">${ptx.t.bank?ptx.t.bank():''}</div></section>
    <fieldset class="ptwhen"><legend>When should answers be checked?</legend>
      <label><input type="radio" name="ptwhen" value="go"><span><b>As I go</b><small>Check each answer right after you write it, and see what went wrong before the next one.</small></span></label>
      <label><input type="radio" name="ptwhen" value="end"><span><b>At the end</b><small>Answer everything first, then check all of it at once.</small></span></label>
    </fieldset>
    <div class="ptopts"><label class="advsw"><input type="checkbox" id="ptStrict"> Count missing ${esc(TXT.marks)} as wrong</label>
      <span class="hint">Tap a letter below, ${esc(HTML.macHint)}</span></div>
    <div class="ptscore" id="ptScore" aria-live="polite" hidden></div>
    <ol class="ptqs" id="ptQs"></ol>
    <div class="ptactions"><button type="button" class="btn" data-pt="all" id="ptAll">Check answers</button><button type="button" class="btn quiet" data-pt="retry">Retry same test</button><button type="button" class="btn quiet" data-pt="new">New test</button></div>
    <p class="hint ptstatus" id="ptStatus" aria-live="polite"></p>
    <div class="macrons ptmac" aria-label="${esc(HTML.macLabel)}">${LS_MARKS().map(m=>`<button type="button" data-m="${m}">${m}</button>`).join('')}</div>
  </article>`;
  pvBind();
  pv.querySelector(`input[name=ptwhen][value=${ptx.mode}]`).checked=true;$('ptStrict').checked=ptx.strict;
  ptStart(true);
}
function ptStart(fresh){
  if(!ptx.t)return;
  ptx.tok++;
  if(fresh||!ptx.qs.length)ptx.qs=ptx.t.make();
  ptx.qs.forEach(q=>{q.done=false;q.res=null;q.raw='';q.ai=null});
  $('ptQs').innerHTML=ptx.qs.map((q,i)=>`<li id="ptq${i}"><label class="ptp" for="ptin${i}">${esc(q.en)}${ptx.t.hint?` <span class="pthint la">(${esc(ptx.t.hint(q))})</span>`:''}</label><div class="ptrow"><input class="ptin la" id="ptin${i}" data-i="${i}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="${SITE.langKey||'la'}" aria-label="${LANG_NAME} for: ${esc(q.en)}${ptx.t.hint?' ('+esc(ptx.t.hint(q))+')':''}"><button type="button" class="btn quiet ptone" data-pt="one" data-i="${i}">Check</button></div><div class="ptfb" aria-live="polite"></div></li>`).join('');
  ptx.qs.forEach((q,i)=>{const li=$('ptq'+i);q.li=li;q.input=li.querySelector('input');q.fb=li.querySelector('.ptfb')});
  ptx.focus='';$('ptScore').hidden=true;$('ptStatus').textContent='';
  ptModeUI();window.scrollTo({top:0,behavior:'smooth'});
  if(ptx.qs[0])ptx.qs[0].input.focus({preventScroll:true});
}
function ptModeUI(){
  const a=$('ptAll');if(!a)return;
  a.textContent=ptx.mode==='go'?'Check all that are left':'Check answers';
  $('ptQs').classList.toggle('go',ptx.mode==='go');
}

/* ---------- checking (code) ---------- */
function ptGrade(i){
  const q=ptx.qs[i];if(q.done)return false;
  q.raw=q.input.value;q.res=ptx.t.grade(q,q.raw,ptx.strict);q.done=true;q.input.disabled=true;
  q.li.classList.remove('ok','bad','warn');q.li.classList.add('done',q.res.status);
  const g=q.res,verdict=g.status==='ok'?'Correct':g.status==='warn'?'Correct, but missing '+TXT.marks:'Not quite';
  let h=`<span class="ptv">${verdict}.</span> `;
  if(g.status!=='ok')h+=`Answer: <span class="ptright la">${q.answers.map(esc).join(' <span class="or">or</span> ')}</span>`;
  q.fb.innerHTML=h;
  if(g.note&&g.status==='bad'){const n=document.createElement('span');n.className='ptnote2';n.textContent=g.note;q.fb.appendChild(n)}
  return true;
}
const ptWrong=()=>ptx.qs.map((q,i)=>({q,n:i+1})).filter(x=>x.q.done&&x.q.res.status==='bad');
function ptScoreUI(){
  const done=ptx.qs.filter(q=>q.done),right=done.filter(q=>q.res.status!=='bad').length,mac=done.filter(q=>q.res.status==='warn').length,all=done.length===ptx.qs.length;
  const box=$('ptScore');box.hidden=!done.length;
  box.innerHTML=`<div class="ptbig">${right}<span> / ${all?ptx.qs.length:done.length}</span></div><p>${all?(ptx.qs.length-right?`${ptx.qs.length-right} to fix.`:'Every answer is right.'):`${done.length} of ${ptx.qs.length} checked so far.`}${mac?` ${mac} counted right but missing ${TXT.marks}.`:''}</p><p class="ptfocus" id="ptFocus"></p>`;
  if(ptx.focus&&all)$('ptFocus').textContent=ptx.focus;
}
function ptCheckOne(i){
  const q=ptx.qs[i];if(!q||q.done)return;
  ptGrade(i);ptx.focus='';ptScoreUI();
  const finished=ptx.qs.every(x=>x.done),w=ptWrong();
  /* the last answer in "As I go" also asks for the one pattern to review, in the same request as its own explanation */
  ptExplain(q.res.status==='bad'?[{q,n:i+1}]:[],finished&&w.length>1,w);
  if(finished)$('ptScore').scrollIntoView({behavior:'smooth',block:'nearest'});else ptFocusAfter(i);
}
function ptCheckAll(){
  const fresh=[];ptx.qs.forEach((q,i)=>{if(ptGrade(i))fresh.push({q,n:i+1})});
  if(!fresh.length)return;
  ptx.focus='';ptScoreUI();
  const w=ptWrong();
  ptExplain(fresh.filter(x=>x.q.res.status==='bad'),w.length>1,w);
  $('ptScore').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---------- the AI explains what the checker marked wrong ---------- */
const ptAIready=()=>activeSlots().length>0||LAI.usable();
async function ptAsk(messages){
  if(activeSlots().length)return aiChat(messages);
  return LAI.ask(messages,900);
}
/* wrong: items to explain now; wantFocus: also name the one pattern to review; all: every miss so far, for the focus line */
async function ptExplain(wrong,wantFocus,all){
  const tok=ptx.tok,status=$('ptStatus');
  if(!wrong.length&&!wantFocus)return;
  if(!ptAIready()){
    status.innerHTML=`To get explanations of what you missed, add an AI key or turn on the local AI. <button type="button" class="kbtn" data-pt="key">AI keys</button>`;return}
  wrong.forEach(w=>{const s=document.createElement('span');s.className='ptai wait';s.textContent='Thinking…';w.q.fb.appendChild(s);w.ai=s});
  status.textContent=wrong.length?'The AI is looking over your mistakes…':'The AI is picking what to review…';
  const T=ptx.t,list=(all||wrong).map(w=>T.describe(w.q,w.n,w.q.raw.trim(),w.q.res.note));
  const mine=new Set(wrong.map(w=>w.n)),items=list.filter(x=>mine.has(x.n));
  const user=(items.length?`Missed items to explain (JSON):\n${JSON.stringify(items,null,1)}\n\n`:'')+
    (wantFocus?`${items.length?'All':'The'} missed items on this test, for the "focus" line (JSON):\n${JSON.stringify(list.map(({n,target,student,correct})=>({n,target,student,correct})),null,1)}\n\n`:'')+
    `Reply with JSON only, exactly this shape: {"items":[${items.length?'{"n":<number>,"why":"<text>"}':''}]${wantFocus?',"focus":"<text>"':''}}`;
  const sys=T.tutor+' A code checker has ALREADY graded the answers; its verdicts and the correct forms are final, so never dispute them or offer different correct forms.\n\n'+
    'The rules the class uses:\n'+T.rules+'\n\n'+
    (items.length?'For each missed item, write one or two short sentences (under 40 words) explaining exactly which piece went wrong (conjugation and vowel, tense sign, personal ending, voice, or person/number) and the rule that fixes it. Name the student’s actual mistake; do not just restate the answer. Plain text, no markdown, address the student as "you".\n':'')+
    (wantFocus?'"focus" is one sentence naming the single pattern most worth reviewing across the mistakes.\n':'');
  try{
    const j=parseJ(await ptAsk([{role:'system',content:sys},{role:'user',content:user}]));
    if(tok!==ptx.tok)return;
    const by={};(Array.isArray(j.items)?j.items:[]).forEach(it=>{if(it&&it.n!=null)by[it.n]=it.why});
    wrong.forEach(w=>{if(by[w.n]){w.ai.classList.remove('wait');w.ai.textContent=String(by[w.n])}else w.ai.remove()});
    if(wantFocus&&j.focus){ptx.focus='What to review: '+String(j.focus);const f=$('ptFocus');if(f)f.textContent=ptx.focus}
    status.textContent='';
  }catch(e){
    if(tok!==ptx.tok)return;
    wrong.forEach(w=>w.ai.remove());
    status.textContent='The AI couldn’t explain these answers this time ('+(e&&e.message||'unknown error')+'). Your grades are still correct.';
  }
}
