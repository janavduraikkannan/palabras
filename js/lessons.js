/* ---------- Lessons: the mechanics (shared by every practice site) ----------
   A site has lessons if it has site/lessons.js, which defines LESSONS: the lessons themselves, their question banks and the XP values.
   A site without that file simply never shows the Lessons tab, so this file can be copied everywhere.

   Lesson text is written in a small markup, read by lsBlocks():
     # heading   ## smaller heading   > history note   ! tip   - list item   ?1 question spot number 1
     : Latin = English      an example line (lines next to each other form one group)
     |a|b|                  a table row (the first row of a table is its header); |~ caption goes before a table
   and inside any line (lsInline):
     *Latin*   **bold**   [[ending]]   {word|hover definition}   ^{underlined words|what the pop-up says}

   A question is {k,p,a,w}: k is mc (multiple choice: o holds the options, a the index of the right one), la (typed Latin),
   en (typed English) or tx (a short typed answer). a lists every accepted answer, p is the prompt, w is the written explanation.
   m:1 means macrons decide the answer. ord:1 means Latin word order matters. g lists the words the question uses, as [word, meaning] pairs. */
const LS_ON=typeof LESSONS!=='undefined'&&!!(LESSONS.courses&&LESSONS.courses.length);
const lsAll=LS_ON?LESSONS.courses.flatMap(c=>c.units.flatMap(u=>u.lessons.map(l=>Object.assign(l,{unit:u.title,course:c.id})))):[];
lsAll.forEach((l,i)=>{l.num=i+1});
const lsById=id=>lsAll.find(l=>l.id===id);
const ls={cur:null,spots:[],fn:[],miss:[],chats:{},open:false};
const lsData=()=>{const d=store.get('lessons',{})||{};return{f:d.f||{},q:d.q||{},n:d.n||{}}};
const lsNext=()=>{const f=lsData().f;return lsAll.find(l=>!f[l.id])||null};
/* a lesson is shaded when the class has covered every practice topic it teaches (l.t, checked against TAUGHT in site/config.js) */
const lsTaught=l=>!!(l.t&&l.t.length)&&l.t.every(x=>TAUGHT.has(x));
const lsSw=t=>`<p class="legend"><span><span class="sw"></span>${t}</span></p>`;
const lsQX=()=>LESSONS.xp.question,lsFX=()=>LESSONS.xp.finish;

/* ---------- reading the lesson markup ---------- */
function lsInline(s){
  let t=esc(String(s));
  t=t.replace(/\^\{([^{}|]+)\|([^{}]+)\}/g,(_,w,n)=>{ls.fn.push(n);return`<button type="button" class="lfn" data-fn="${ls.fn.length-1}">${w}</button>`});
  t=t.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i class="la">$1</i>').replace(/\[\[([^\]]+)\]\]/g,'<b class="end">$1</b>');
  return t.replace(LW,(_,w,d)=>`<span class="lw" tabindex="0" data-en="${d}">${w}</span>`);
}
function lsBlocks(text){
  const out=[];let tbl=null,ex=null,list=null;
  const flush=()=>{tbl=ex=list=null};
  for(const raw of String(text).split('\n')){
    const line=raw.trim();
    if(!line){flush();continue}
    if(line.startsWith('|~ ')){flush();out.push(tbl={t:'table',cap:line.slice(3),rows:[]});continue}
    if(line.startsWith('|')){if(!tbl)out.push(tbl={t:'table',cap:'',rows:[]});tbl.rows.push(line.replace(/^\||\|$/g,'').split(/\|(?![^{]*\})/).map(c=>c.trim()));continue}
    if(line.startsWith(': ')){if(!ex){flush();out.push(ex={t:'ex',rows:[]})}const i=line.indexOf(' = ');ex.rows.push(i<0?[line.slice(2),'']:[line.slice(2,i),line.slice(i+3)]);continue}
    if(line.startsWith('- ')){if(!list){flush();out.push(list={t:'list',items:[]})}list.items.push(line.slice(2));continue}
    flush();
    let m;
    if((m=line.match(/^\?(\d+)$/)))out.push({t:'q',i:+m[1]-1});
    else if(line.startsWith('## '))out.push({t:'h3',s:line.slice(3)});
    else if(line.startsWith('# '))out.push({t:'h2',s:line.slice(2)});
    else if(line.startsWith('> '))out.push({t:'hist',s:line.slice(2)});
    else if(line.startsWith('! '))out.push({t:'tip',s:line.slice(2)});
    else out.push({t:'p',s:line});
  }
  return out;
}
function lsBlockHTML(b){
  switch(b.t){
    case'h2':return`<h2>${lsInline(b.s)}</h2>`;
    case'h3':return`<h3>${lsInline(b.s)}</h3>`;
    case'p':return`<p>${lsInline(b.s)}</p>`;
    case'hist':return`<aside class="lhist"><b>History note</b><p>${lsInline(b.s)}</p></aside>`;
    case'tip':return`<aside class="ltip"><b>Remember</b><p>${lsInline(b.s)}</p></aside>`;
    case'list':return`<ul class="llist">${b.items.map(i=>`<li>${lsInline(i)}</li>`).join('')}</ul>`;
    case'ex':return`<dl class="lex">${b.rows.map(r=>`<div><dt>${lsInline(r[0])}</dt><dd>${lsInline(r[1])}</dd></div>`).join('')}</dl>`;
    case'table':{const[h,...rows]=b.rows;return`<div class="ltable"><table>${b.cap?`<caption>${lsInline(b.cap)}</caption>`:''}<thead><tr>${(h||[]).map(c=>`<th>${lsInline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${lsInline(c)}</td>`:`<th>${lsInline(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`}
    case'q':return`<section class="lq" data-q="${b.i}"></section>`;
  }
  return'';
}
const lsPlain=s=>String(s).replace(/\^\{([^{}|]+)\|([^{}]+)\}/g,'$1 ($2)').replace(LW,'$1').replace(/\*\*|\*|\[\[|\]\]/g,'').replace(/^\?\d+$/gm,'').replace(/^(\|~ |[#>!:-]+ ?)/gm,'').replace(/\n{3,}/g,'\n\n').trim();
/* true when a question's answer is printed in its own lesson; tools/lessons/check.js holds the written questions to the same rule */
const lsFold=s=>' '+String(s).normalize('NFC').toLowerCase().replace(LW,'$1').replace(/\[\[|\]\]|\*/g,'').replace(/[^\p{L}\p{M}]+/gu,' ').trim()+' ';
function lsInLesson(l,c){const body=lsFold(l.body),segs=t=>[...String(t).matchAll(/\*([^*]+)\*/g)].map(m=>m[1]);
  return(c.k==='la'?[c.a[0]]:c.k==='en'?segs(c.p):c.k==='mc'?segs(c.o[c.a]):[]).some(x=>{const n=lsFold(x);return n.trim()&&body.includes(n)})}
const lsContext=l=>lsPlain(l.body).slice(0,9000);
const lsEarlier=l=>lsAll.slice(0,l.num-1).map(x=>`${x.id}: ${x.title}`).join('\n')||'(this is the first lesson)';

/* ---------- the Lessons tab ---------- */
function lessonsPane(){
  const pane=$('paneLessons');if(!pane||!LS_ON)return;
  const f=lsData().f,done=lsAll.filter(l=>f[l.id]).length,next=lsNext(),pct=Math.round(100*done/lsAll.length);
  const row=l=>{const st=f[l.id]===1?'done':f[l.id]===2?'marked':l===next?'next':'';
    return`<li><a class="lrow ${st}${lsTaught(l)?' taught':''}" href="#l/${encodeURIComponent(l.id)}"><span class="lnum">${st==='done'||st==='marked'?'✓':l.num}</span><span class="ltxt"><b>${lsInline(l.title)}</b><small>${lsInline(l.blurb)}</small></span>${st==='next'?'<span class="tag ok">Up next</span>':st==='marked'?'<span class="tag edit">Marked</span>':''}</a></li>`};
  pane.innerHTML=`<div class="lstop"><div><p class="intro">Read a lesson, try its questions, and press Finish. Later lessons assume you know the earlier ones. Every question is optional.</p>
    <p class="lsum"><b>${done}</b> of ${lsAll.length} lessons complete</p>${bar(pct,'Lessons complete')}${lsAll.some(lsTaught)?lsSw('Shaded lessons are already covered in your class notes.'):''}</div>${next?`<a class="btn lgo" href="#l/${encodeURIComponent(next.id)}">${done?'Continue':'Start'}: Lesson ${next.num}</a>`:''}</div>`+
  LESSONS.courses.map(c=>`<h2 class="lcourse">${esc(c.title)}</h2>`+c.units.map(u=>`<section class="lunit"><h3>${lsInline(u.title)}</h3><ol>${u.lessons.map(row).join('')}</ol></section>`).join('')).join('');
}

/* ---------- a lesson page ---------- */
function renderLesson(id){
  const l=LS_ON?lsById(id):null,pv=$('pageview');
  if(!l){pv.innerHTML=pvTop()+`<section class="pv"><h1>Lesson not found</h1><p>This lesson doesn’t exist. Open the Lessons tab to see them all.</p></section>`;pvBind();return}
  ls.cur=l;ls.fn=[];ls.spots=[];ls.miss=[];
  pv.innerHTML=pvTop()+`<article class="pv lesson"><p class="lkick">Lesson ${l.num} · ${lsInline(l.unit)}</p><h1>${lsInline(l.title)}</h1><p class="lblurb">${lsInline(l.blurb)}</p>${lsTaught(l)?lsSw('Covered in your class notes'):''}<div class="lstat" id="lsTop"></div>
    ${lsBlocks(l.body).map(lsBlockHTML).join('')}
    <section class="lend"><h2>Finished reading?</h2><div class="lstat" id="lsEnd"></div>${lsNav(l)}</section></article>`;
  pvBind();lsStatus();
  pv.querySelectorAll('.lq').forEach(el=>lsSpot(el,l,+el.dataset.q));
  lsChatShow(true);
}
function lsNav(l){const next=lsAll[l.num];
  return`<div class="lnav"><button type="button" class="btn quiet" data-ls="practice">To practice</button>${next?`<a class="btn" href="#l/${encodeURIComponent(next.id)}">Next lesson: ${esc(lsPlain(next.title))} →</a>`:''}</div>`}
/* To practice: everything the class has covered is ticked, plus this lesson, and this lesson's topics are put in focus */
function lsPractice(l){
  const focus=(l.t||[]).filter(id=>TOPICS.some(t=>t.id===id)),ids=TOPICS.filter(t=>TAUGHT.has(t.id)).map(t=>t.id);
  selected.clear();[...ids,...focus].forEach(id=>selected.add(id));tFocus.clear();focus.forEach(id=>tFocus.add(id));
  store.set('topics',[...selected]);store.set('tFocus',focus);
  history.replaceState(null,'',location.pathname+location.search);route();
  $('tabTopics').click();refreshFromStore();tryStart();
}
function lsStatus(){
  const l=ls.cur;if(!l)return;
  const st=lsData().f[l.id];
  const go='<button type="button" class="kbtn" data-ls="practice">To practice</button> ';
  const top=go+(st===1?'<span class="tag ok">Completed</span>':st===2?'<span class="tag edit">Marked complete</span> <button type="button" class="kbtn" data-ls="unmark">Unmark</button>':'<button type="button" class="kbtn" data-ls="mark">Mark complete (no XP)</button>');
  const end=st===1?'<p class="lfin"><span class="tag ok">Completed</span> You’ve finished this lesson.</p>':`<button type="button" class="btn" data-ls="finish">Finish lesson (+${lsFX()} XP)</button>`+(st===2?' <button type="button" class="kbtn" data-ls="unmark">Unmark</button>':' <button type="button" class="kbtn" data-ls="mark">Mark complete (no XP)</button>');
  $('lsTop').innerHTML=top;$('lsEnd').innerHTML=end;
}
function lsEdit(fn){const d=lsData();fn(d);store.set('lessons',d)}
function lsAct(a,btn){
  const l=ls.cur;if(!l)return;
  if(a==='practice'){lsPractice(l);return}
  if(a==='mark')lsEdit(d=>{d.f[l.id]=2});
  else if(a==='unmark')lsEdit(d=>{if(d.f[l.id]===2)delete d.f[l.id]});
  else if(a==='finish'){if(lsData().f[l.id]===1)return;lsEdit(d=>{d.f[l.id]=1});award(1,lsFX(),btn);boom(false);toast('fish',`Lesson ${l.num} complete! ${TXT.wellDone}!`)}
  lsStatus();
}

/* ---------- question spots ---------- */
function lsSpot(el,l,k){
  const b=(l.q||[])[k];if(!b){el.remove();return}
  const key=l.id+'.'+k,n=lsData().n[key]||0,s={el,l,k,key,b,i:n,cur:null,done:false,busy:false,seen:[]};
  ls.spots[k]=s;
  if(n<b.b.length){s.cur=b.b[n];lsDraw(s)}else lsDrawUsed(s);
}
const lsHead=s=>{const got=lsData().q[s.key];return`<div class="lqhead"><b>Try it</b><span class="hint">${got?'XP earned':`+${lsQX()} XP the first time you get one right`}</span></div>`};
function lsDrawUsed(s){
  s.cur=null;s.done=true;
  s.el.innerHTML=lsHead(s)+`<p class="lqp">You’ve used all ${s.b.b.length} written questions here.</p><div class="lqbtns"><button type="button" class="btn quiet" data-a="new">New question</button></div><div class="lqfb" aria-live="polite"></div>`;
}
const lsShuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const lsWordsBox=c=>c.g&&c.g.length?`<dl class="lqg" aria-label="Word meanings">${c.g.map(([w,m])=>`<div><dt>${esc(w)}</dt><dd>${esc(m)}</dd></div>`).join('')}</dl>`:'';
function lsDraw(s){
  const c=s.cur;s.done=false;s.seen.push(c.p);
  const input=c.k==='mc'?`<div class="choices">${lsShuffle(c.o.map((t,i)=>[t,i])).map(([t,i])=>`<button type="button" data-o="${i}">${lsInline(t)}</button>`).join('')}</div>`
    :`<div class="lqrow"><input type="text" class="lqin${c.k==='la'?' la':''}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" placeholder="${c.k==='en'?'Type it in English':c.k==='la'?`Type it in ${LANG_NAME}`:'Type your answer'}"><button type="button" class="btn" data-a="check">Check</button></div>${c.k==='en'?'':`<div class="macrons" aria-label="${esc(HTML.macLabel)}">${LS_MARKS().map(m=>`<button type="button" data-m="${m}">${m}</button>`).join('')}</div>`}`;
  s.el.innerHTML=lsHead(s)+`<p class="lqp">${lsInline(c.p)}</p>${lsWordsBox(c)}${input}<div class="lqfb" aria-live="polite"></div><div class="lqbtns" hidden><button type="button" class="btn quiet" data-a="new">New question</button></div>`;
}
/* the buttons that insert letters come from the site's own bar, so each language keeps its own letters */
const LS_MARKS=()=>[...$('macrons').querySelectorAll('button')].map(b=>b.textContent);
const lsClean=s=>String(s).normalize('NFC').toLowerCase().replace(/[.,!?;:"“”‘’'()[\]]/g,' ').replace(/\s+/g,' ').trim();
const lsWords=(s,en,ord)=>{let w=lsClean(s).split(' ').filter(Boolean);if(en)w=w.filter(x=>!['the','a','an'].includes(x));if(!ord)w=w.sort();return w.join(' ')};
function lsLocal(c,raw){
  const en=c.k==='en',ord=c.ord||en||c.k==='tx',typed=lsWords(raw,en,ord),fold=foldWord(typed);
  for(const a of c.a){const w=lsWords(a,en,ord);if(w===typed)return{ok:true}}
  for(const a of c.a){if(foldWord(lsWords(a,en,ord))===fold){return c.m?{ok:false,essential:true}:{ok:true,mac:a}}}
  return{ok:false};
}
const lsShown=c=>c.k==='mc'?c.o[c.a]:c.a[0];
function lsXP(s,anchor){
  if(lsData().q[s.key])return 0;
  lsEdit(d=>{d.q[s.key]=1});award(1,lsQX(),anchor);return lsQX();
}
const lsBubble=(mood,html)=>`<div class="arow"><img src="${faceImg(mood)}" alt=""><div class="ca">${html}</div></div>`;
function lsAdvance(s){if(!s.cur||s.cur.ai)return;const i=s.b.b.indexOf(s.cur);if(i<0)return;lsEdit(d=>{d.n[s.key]=Math.max(d.n[s.key]||0,i+1)});s.i=lsData().n[s.key]}
function lsResult(s,ok,html,mood,older,anchor){
  s.done=true;const fb=s.el.querySelector('.lqfb');
  const pts=ok?lsXP(s,anchor):0;
  s.el.querySelectorAll('input,[data-a=check],.choices button,.macrons button').forEach(x=>{x.disabled=true});
  const inp=s.el.querySelector('.lqin');if(inp)inp.classList.add(ok?'ok':'bad');
  const o=older&&lsById(older)&&lsById(older).num<s.l.num?lsById(older):null;
  fb.innerHTML=`<div class="lqres ${ok?'ok':'bad'}">${lsBubble(mood||(ok?'delighted':'sad'),html)}${o?`<p class="lsug"><b>${esc(SITE.cat)} suggests a review:</b> <a href="#l/${encodeURIComponent(o.id)}">Lesson ${o.num}, ${esc(lsPlain(o.title))}</a>. Read it and do its practice questions.</p>`:''}</div>`;
  if(pts){const h=s.el.querySelector('.lqhead .hint');if(h)h.textContent='XP earned'}
  lsAdvance(s);
  s.el.querySelector('.lqbtns').hidden=false;
}
const lsAnswerLine=c=>`<br><b>Answer:</b> ${lsInline(lsShown(c))}`;
async function lsCheck(s,raw,anchor){
  const c=s.cur;if(!c||s.done||s.busy)return;
  const fb=s.el.querySelector('.lqfb');
  if(c.k==='mc'){
    const ok=+raw===c.a;
    s.el.querySelectorAll('.choices button').forEach(b=>{if(+b.dataset.o===c.a)b.classList.add('ok');else if(b.dataset.o===String(raw))b.classList.add('bad')});
    if(ok){lsResult(s,true,`<b class="ok">Correct.</b> ${lsInline(c.w)}`,null,null,anchor);return}
    await lsWrong(s,lsInline(c.o[+raw]),c.o[+raw],anchor);return;
  }
  if(!raw.trim()){fb.innerHTML='<p class="hint">Type an answer first.</p>';return}
  const r=lsLocal(c,raw);
  if(r.ok){lsResult(s,true,`<b class="ok">Correct${r.mac?`, but check the ${TXT.marks}`:''}.</b> ${r.mac?`The full form is ${lsInline('*'+r.mac+'*')}. `:''}${lsInline(c.w)}`,r.mac?'cheeky':null,null,anchor);return}
  if(r.essential){lsMiss(s,raw);lsResult(s,false,`<b class="bad">Not quite: ${TXT.markMatters} matters here.</b>${lsAnswerLine(c)}<br>${lsInline(c.w)}`,'sad',null,anchor);return}
  await lsWrong(s,esc(raw),raw,anchor);
}
const lsMiss=(s,a)=>{ls.miss.push({q:lsPlain(s.cur.p),a,right:lsPlain(lsShown(s.cur))});if(ls.miss.length>6)ls.miss.shift()};
const lsHasAI=()=>{try{return activeSlots().length>0}catch(e){return false}};
async function lsWrong(s,shown,raw,anchor){
  const c=s.cur,fb=s.el.querySelector('.lqfb'),written=`<b class="bad">Not quite.</b>${lsAnswerLine(c)}<br>${lsInline(c.w)}`;
  if(!lsHasAI()){lsMiss(s,raw);lsResult(s,false,written+`<br><small>Add a free AI key and ${esc(SITE.cat)} can explain your exact mistake. <button type="button" class="kbtn" data-a="key">Set up a key</button></small>`,'sad',null,anchor);return}
  s.busy=true;s.el.querySelectorAll('input,[data-a=check],.choices button').forEach(x=>{x.disabled=true});
  fb.innerHTML=`<div class="lqres">${lsBubble('thinking',`<i>${latH(R(THINKING))}</i><span class="typing"><i></i><i></i><i></i></span>`)}</div>`;
  let v=null,err='';
  try{v=await lsAskGrade(s,raw)}catch(e){err=e.message||'the AI could not be reached'}
  s.busy=false;
  if(!document.body.contains(s.el))return;
  if(!v){lsMiss(s,raw);lsResult(s,false,written+`<br><small>${esc(SITE.cat)} couldn’t be reached (${esc(err)}), so this is the written explanation.</small>`,'sad',null,anchor);return}
  if(v.correct&&c.k!=='mc'){lsResult(s,true,`<b class="ok">Correct.</b> ${mdL(v.reply)}`,v.mood,null,anchor);lsGloss(s,v);return}
  lsMiss(s,raw);
  lsResult(s,false,`<b class="bad">Not quite.</b> ${mdL(v.reply)}${lsAnswerLine(c)}`,v.mood,v.older,anchor);lsGloss(s,v);
}
const lsGloss=(s,v)=>{if(v.latin){const el=s.el.querySelector('.lqres .ca');if(el)glossify(el,v.latin)}};

/* ---------- what the AI is told ---------- */
const LS_TRUTH="Never make anything up. Base what you say on the lesson text below and on Latin grammar you are certain of. Never invent forms, vocabulary, rules, quotations, sources or facts about the site. If you are not sure of something, say so plainly. ";
const lsBase=l=>`Lesson ${l.num}, "${lsPlain(l.title)}", the lesson the student is reading right now:\n---\n${lsContext(l)}\n---\nEarlier lessons, which the student is assumed to know (id: title):\n${lsEarlier(l)}`;
const lsMissText=()=>ls.miss.length?ls.miss.map((m,i)=>`${i+1}. ${m.q} | wrote: ${m.a} | expected: ${m.right}`).join('\n'):'(none yet)';
const lsOlderRule="Also decide if the student is struggling with a specific EARLIER lesson. Look at this mistake together with the recent mistakes. Set \"older\" to that lesson's id only if the mistake really comes from that earlier topic, not from this lesson and not from a typo; otherwise set it to null. Only use an id from the list of earlier lessons. ";
async function lsAskGrade(s,answer){
  const c=s.cur,l=s.l,mc=c.k==='mc';
  const sys=PERSONA+`You are correcting one question inside a ${LANG_NAME} lesson for an English-speaking high school student. `+LS_TRUTH+
    (mc?"The student chose a wrong option, so correct is false. ":"First decide whether the answer is correct: it must mean the same as an accepted answer. Accept any valid phrasing, any valid word order, and either English article. Ignore capitalization and punctuation. Forgive obvious spelling typos only if they do not change the grammar. Macrons never decide the answer unless the expected answer depends on them. ")+
    "If the answer is wrong for a reason THIS lesson teaches, explain in depth, in 4 to 7 sentences: name the exact rule from this lesson, say what the student's answer actually means or why it fails, and walk step by step to the correct answer. "+
    "If it is wrong for a reason this lesson does not teach, do NOT go in depth: in 1 or 2 sentences name the mistake and move on. "+lsOlderRule+
    "If the answer is correct, say why in one short sentence. Reply only with JSON: {\"correct\": true or false, \"reply\": \"what you say to the student\", \"older\": null or \"lesson id\", \"mood\": \"one of the expressions\"}.";
  const user=`${lsBase(l)}\n\nThe question: ${lsPlain(c.p)}\n${mc?`Options: ${c.o.map(lsPlain).join(' / ')}\n`:''}Accepted answer${c.a.length>1&&!mc?'s':''}: ${mc?lsPlain(c.o[c.a]):c.a.slice(0,8).map(lsPlain).join(' / ')}\nWhy: ${lsPlain(c.w)}\nThe student's answer: ${answer}\nThe student's recent mistakes in this lesson:\n${lsMissText()}`;
  const t=await aiChat([{role:'system',content:sys},{role:'user',content:user}]),j=parseJ(t);
  return{correct:j.correct===true,reply:String(j.reply||''),older:typeof j.older==='string'?j.older.trim():null,mood:MOODS[j.mood]?j.mood:'sad',latin:cleanG(j.latin)};
}
async function lsAskNew(s){
  const l=s.l,ex=lsShuffle(s.b.b).slice(0,3).map(({k,p,o,a,w,g})=>({k,p:lsPlain(p),o,a,w:lsPlain(w),g}));
  const sys=`You write one new practice question for a ${LANG_NAME} lesson for English-speaking high school students. `+LS_TRUTH+
    "The question must test the skill given, use only grammar from this lesson and the earlier ones, and use common vocabulary from the examples. Every form must be correct: if you cannot be sure of a form, choose a different word. Do not repeat a question already asked. Never use a sentence, phrase or word form that is printed in the lesson text: choose different words, so the student can't copy the answer from the lesson. "+
    "Use the same kind of question as one of the examples. k is \"mc\" (options in \"o\", \"a\" is the index of the right option), \"la\" (typed Latin), \"en\" (typed English) or \"tx\" (a short typed answer); for la, en and tx, \"a\" is a list of every accepted answer. \"w\" is one sentence explaining the answer using this lesson. \"g\" lists every Latin word the question uses as [dictionary entry, English meaning] pairs, as in the examples, with correct macrons; leave out a word only if listing it would give away the answer. Write Latin in the prompt between single asterisks, like *puella*, with macrons. Reply only with JSON: {\"k\":\"\",\"p\":\"\",\"o\":[],\"a\":null,\"w\":\"\",\"g\":[[\"\",\"\"]]}.";
  const user=`${lsBase(l)}\n\nSkill to test: ${s.b.s}\nExamples: ${JSON.stringify(ex)}\nAlready asked, do not repeat:\n${s.seen.slice(-12).map(lsPlain).join('\n')}`;
  const j=parseJ(await aiChat([{role:'system',content:sys},{role:'user',content:user}]));
  return lsValid(j);
}
function lsValid(j){
  const k=j&&j.k,p=j&&typeof j.p==='string'?j.p.trim():'',w=j&&typeof j.w==='string'?j.w.trim():'',g=(Array.isArray(j&&j.g)?j.g:[]).filter(x=>Array.isArray(x)&&x.length===2&&x.every(y=>typeof y==='string'&&y.trim())).slice(0,12);
  if(!p||!w||!['mc','la','en','tx'].includes(k))throw new Error('the AI wrote an unusable question');
  if(k==='mc'){const o=Array.isArray(j.o)?j.o.map(String).filter(Boolean):[],a=Number(j.a);if(o.length<2||o.length>6||!Number.isInteger(a)||a<0||a>=o.length||new Set(o).size!==o.length)throw new Error('the AI wrote an unusable question');return{k,p,o,a,w,g,ai:true}}
  const a=(Array.isArray(j.a)?j.a:[j.a]).filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim());
  if(!a.length)throw new Error('the AI wrote an unusable question');return{k,p,a,w,g,ai:true};
}
async function lsNew(s){
  if(s.busy)return;
  const b=s.b.b,n=lsData().n[s.key]||0;
  if(n<b.length){s.cur=b[n];lsDraw(s);lsFocus(s);return}
  const fb=s.el.querySelector('.lqfb');
  if(!lsHasAI()){
    if(fb)fb.innerHTML=`<p class="hint">That’s every written question here. Add a free AI key and ${esc(SITE.cat)} can write more, or start the written ones again. <button type="button" class="kbtn" data-a="key">Set up a key</button> <button type="button" class="kbtn" data-a="again">Start again</button></p>`;
    return;
  }
  s.busy=true;const btn=s.el.querySelector('[data-a=new]');if(btn)btn.disabled=true;
  if(fb)fb.innerHTML=`<div class="lqres">${lsBubble('thinking',`<i>${latH(R(THINKING))}</i><span class="typing"><i></i><i></i><i></i></span>`)}</div>`;
  try{let c=null;for(let i=0;i<3&&!c;i++){const t=await lsAskNew(s);if(!lsInLesson(s.l,t))c=t}
    if(!c)throw new Error('its questions were already answered in the lesson');
    s.busy=false;if(!document.body.contains(s.el))return;s.cur=c;lsDraw(s);lsFocus(s)}
  catch(e){s.busy=false;if(btn)btn.disabled=false;if(fb)fb.innerHTML=`<p class="hint">${esc(SITE.cat)} couldn’t write a question (${esc(e.message||'the AI could not be reached')}). <button type="button" class="kbtn" data-a="again">Start the written ones again</button></p>`}
}
const lsFocus=s=>{const i=s.el.querySelector('input');if(i)i.focus({preventScroll:true})};

/* ---------- chatting with the cat about the lesson ---------- */
function lsChatShow(on){
  let b=$('lchatbtn'),p=$('lchat');
  if(!on){if(b)b.hidden=true;if(p)p.hidden=true;ls.open=false;return}
  if(!b){
    b=document.createElement('button');b.id='lchatbtn';b.type='button';b.className='lchatbtn';b.innerHTML=`<img src="${faceImg('happy')}" alt=""><span>Ask ${esc(SITE.cat)}</span>`;document.body.appendChild(b);
    p=document.createElement('section');p.id='lchat';p.className='lchat';p.hidden=true;p.setAttribute('aria-label',`Chat with ${SITE.cat}`);
    p.innerHTML=`<header><img src="${faceImg('happy')}" alt=""><b>Ask ${esc(SITE.cat)}</b><button type="button" class="x" id="lchatX" aria-label="Close">×</button></header><ul class="chat" id="lchatLog" aria-live="polite"></ul><div class="askrow"><input type="text" id="lchatIn" autocomplete="off" placeholder="Ask about this lesson" aria-label="${esc(`Your question for ${SITE.cat}`)}"><button type="button" class="btn quiet" id="lchatGo">Ask</button></div>`;
    document.body.appendChild(p);
    b.addEventListener('click',()=>{ls.open=!ls.open;p.hidden=!ls.open;b.setAttribute('aria-expanded',ls.open);if(ls.open){lsChatDraw();$('lchatIn').focus()}});
    $('lchatX').addEventListener('click',()=>{ls.open=false;p.hidden=true;b.focus()});
    $('lchatGo').addEventListener('click',lsChatSend);
    $('lchatIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lsChatSend()}});
    lsMacronKeys($('lchatIn'));
  }
  b.hidden=false;p.hidden=!ls.open;if(ls.open)lsChatDraw();
}
const lsChatLog=()=>ls.chats[ls.cur.id]||(ls.chats[ls.cur.id]=[]);
function lsChatDraw(){
  const log=$('lchatLog'),h=lsChatLog(),hasKey=localMsgFirst()||messageSlots().length>0;
  log.innerHTML=`<li class="greet">${lsBubble('happy',`Ask me anything about ${esc(lsPlain(ls.cur.title))}.${hasKey?'':` First you’ll need a free AI key. <button type="button" class="kbtn" id="lchatKey">Set up a key</button>`}`)}</li>`+h.map((x,i)=>`<li><p class="cq">${esc(x.q)}</p>${lsBubble(x.pending?'thinking':x.err?'sad':x.mood,x.pending?(x.live?esc(x.live):`<i>${latH(x.thinking)}</i><span class="typing"><i></i><i></i><i></i></span>`):x.err?`<span class="tag bad">Couldn’t ask</span> ${esc(x.err)}`:mdL(x.a)+(lsById(x.older)&&lsById(x.older).num<ls.cur.num?`<br><a href="#l/${encodeURIComponent(x.older)}">Review Lesson ${lsById(x.older).num}: ${esc(lsPlain(lsById(x.older).title))}</a>`:''))}</li>`).join('');
  log.querySelectorAll('.ca').forEach((el,i)=>{const x=h[i-1];if(x&&x.latin)glossify(el,x.latin)});
  log.scrollTop=log.scrollHeight;const k=$('lchatKey');if(k)k.addEventListener('click',lsOpenKey);
}
const lsOpenKey=()=>{$('keysdlg').showModal();renderKeys()};
async function lsChatSend(){
  const inp=$('lchatIn'),text=inp.value.trim(),l=ls.cur;if(!text||!l)return;
  const h=lsChatLog(),item={q:text,pending:true,thinking:R(THINKING)};h.push(item);inp.value='';lsChatDraw();
  try{Object.assign(item,await lsAskChat(l,h.slice(0,-1).filter(x=>!x.err),text,p=>{item.live=p;if(ls.cur===l)lsChatDraw()}))}catch(e){item.err=e.message||'The AI could not be reached'}
  item.pending=false;if(ls.cur===l)lsChatDraw();
}
async function lsAskChat(l,past,question,onLive){
  if(localMsgFirst()){try{return await LAI.askLesson(l,past,question,onLive)}catch(e){if(!messageSlots().length)throw e}}
  const sys=PERSONA+`You are tutoring an English-speaking high school student who is reading a ${LANG_NAME} lesson. `+LS_TRUTH+"Answer the newest question clearly in 2 to 6 short sentences, in terms of this lesson. Assume the student knows the earlier lessons, and do not teach later material unless asked. If the student asks you to answer a practice question for them, guide them to it first. "+lsOlderRule+"Reply only with JSON: {\"reply\": \"your answer\", \"older\": null or \"lesson id\", \"mood\": \"one of the expressions\"}.";
  const hist=past.map((x,i)=>`Q${i+1}: ${x.q}\nA${i+1}: ${x.a}`).join('\n')||'(none)';
  const t=await aiChat([{role:'system',content:sys},{role:'user',content:`${lsBase(l)}\n\nThe student's recent mistakes in this lesson:\n${lsMissText()}\n\nEarlier conversation:\n${hist}\n\nNewest question: ${question}`}],{noGonka:true});
  try{const j=parseJ(t);return{a:String(j.reply||''),older:typeof j.older==='string'?j.older.trim():null,mood:MOODS[j.mood]?j.mood:'happy',latin:cleanG(j.latin)}}catch(e){return{a:t.trim(),mood:'happy',older:null}}
}

/* ---------- typing helpers and clicks ---------- */
/* the same shortcut as the practice box: a vowel, then a hyphen, makes the long vowel */
function lsMacronKeys(el){const MAC={a:'ā',e:'ē',i:'ī',o:'ō',u:'ū',A:'Ā',E:'Ē',I:'Ī',O:'Ō',U:'Ū'};
  el.addEventListener('input',()=>{if(!LS_MARKS().includes('ā'))return;const p=el.selectionStart,v=el.value;if(p>1&&(v[p-1]==='-'||v[p-1]==='_')&&MAC[v[p-2]]){el.value=v.slice(0,p-2)+MAC[v[p-2]]+v.slice(p);el.setSelectionRange(p-1,p-1)}})}
function lsFootnote(i){
  let d=$('lfoot');
  if(!d){d=document.createElement('dialog');d.id='lfoot';d.className='acct lfoot';d.innerHTML=`<button class="x" type="button" aria-label="Close">×</button><div id="lfootBody"></div>`;document.body.appendChild(d);
    d.querySelector('.x').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()})}
  const n=ls.fn.length;$('lfootBody').innerHTML=`<p>${lsInline(ls.fn[i])}</p>`;ls.fn.length=n;d.showModal();
}
function lessonsLeave(){if(LS_ON&&ls.cur){ls.cur=null;lsChatShow(false)}lessonsPane()}
function lessonsSetup(){
  if(!LS_ON)return;
  $('tabLessons').hidden=false;lessonsPane();
  /* the fixed bar changes height as it wraps, so the list keeps exactly enough room to scroll clear of it */
  if(window.ResizeObserver)new ResizeObserver(([e])=>{if(e.target.offsetHeight)document.documentElement.style.setProperty('--barh',e.target.offsetHeight+'px')}).observe($('bar'));
  const pv=$('pageview');
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#l/"]');if(a)page.inside=true});
  pv.addEventListener('click',e=>{
    const fn=e.target.closest('.lfn');if(fn){lsFootnote(+fn.dataset.fn);return}
    const a=e.target.closest('[data-ls]');if(a){lsAct(a.dataset.ls,a);return}
    const box=e.target.closest('.lq');if(!box)return;
    const s=ls.spots[+box.dataset.q];if(!s)return;
    const m=e.target.closest('[data-m]');
    if(m){const i=box.querySelector('.lqin');if(i&&!i.disabled){const p=i.selectionStart??i.value.length;i.value=i.value.slice(0,p)+m.dataset.m+i.value.slice(i.selectionEnd??p);i.focus();i.setSelectionRange(p+1,p+1)}return}
    const o=e.target.closest('[data-o]');if(o){lsCheck(s,o.dataset.o,o);return}
    const b=e.target.closest('[data-a]');if(!b)return;
    if(b.dataset.a==='check')lsCheck(s,box.querySelector('.lqin').value,b);
    else if(b.dataset.a==='new')lsNew(s);
    else if(b.dataset.a==='key')lsOpenKey();
    else if(b.dataset.a==='again'){lsEdit(d=>{delete d.n[s.key]});s.i=0;s.cur=s.b.b[0];lsDraw(s);lsFocus(s)}
  });
  pv.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('lqin')){e.preventDefault();const box=e.target.closest('.lq'),s=ls.spots[+box.dataset.q];if(s)lsCheck(s,e.target.value,box.querySelector('[data-a=check]'))}});
  pv.addEventListener('focusin',e=>{const t=e.target;if(t.classList&&t.classList.contains('lqin')&&!t.dataset.mk){t.dataset.mk='1';if(!t.closest('.lq').querySelector('.macrons'))return;lsMacronKeys(t)}});
}
