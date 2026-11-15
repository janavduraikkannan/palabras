/* ---------- Local AI: Qwen runs in the browser and grades translations on this device ----------
   Only on sites whose SITE.localAI is true. Code grades first (js/vendor/localgrader.js). Whatever code can't settle gets two
   checks from Qwen: one tries to prove the answer wrong, one tries to prove it right. If they disagree, the tie goes to the
   next key that is on, or to Verba's own tie-break, or to Qwen itself when the student ticks that option or nothing else answers.
   The AI library (6 MB) and the model (about 2.4 GB) load only after the student agrees to the download. */
const LAI={
  model:'Qwen3.5-4B-q4f16_1-MLC',engine:null,loading:null,G:{},groundFor:null,turn:Promise.resolve(),
  run(fn){const p=this.turn.then(fn,fn);this.turn=p.catch(()=>{});return p}, // one request at a time: grading and messages share the model
  choice(){return lsGet('verba-local-choice',null)}, // 'yes', 'no', or null when the student hasn't been asked
  setChoice(v){lsSet('verba-local-choice',v)},
  downloaded(){return lsGet('verba-local-ready',false)===true},
  usable(){return !!SITE.localAI&&this.choice()==='yes'&&this.downloaded()},
  script(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('The local AI files could not be loaded'));document.head.appendChild(s)})},
  async libs(){if(!window.leading)await this.script('js/vendor/localgrader.js');if(typeof webllm==='undefined'&&!window.webllm)await this.script('js/vendor/webllm.js')},
  async supported(){
    if(!SITE.localAI)return false;
    try{if(!navigator.gpu)return false;const a=await navigator.gpu.requestAdapter();return !!a&&a.features.has('shader-f16')&&a.limits.maxStorageBuffersPerShaderStage>=10}catch(e){return false}
  },
  async route(){ // Hugging Face first; the school filter blocks it, so the relay is the second way in
    const direct='https://huggingface.co/mlc-ai/'+this.model,relay=AI_RELAY+'/hf/mlc-ai/'+this.model,saved=lsGet('verba-local-route',null);
    if(saved===direct||saved===relay)return saved;
    try{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),8000),r=await fetch(direct+'/resolve/main/tensor-cache.json',{method:'HEAD',signal:ac.signal});clearTimeout(t);if(r.ok)return direct}catch(e){}
    return relay;
  },
  async start(onProgress){
    if(this.engine)return this.engine;if(this.loading)return this.loading;
    this.loading=(async()=>{
      await this.libs();
      const W=window.__testWebllm||webllm,rec=W.prebuiltAppConfig.model_list.find(m=>m.model_id===this.model),url=await this.route();
      const lib=url.startsWith(AI_RELAY)?rec.model_lib.replace('https://raw.githubusercontent.com/',AI_RELAY+'/wasm/'):rec.model_lib;
      const cfg={...W.prebuiltAppConfig,cacheBackend:'cache',model_list:[{...rec,model:url,model_lib:lib}]};
      this.engine=await W.CreateMLCEngine(this.model,{appConfig:cfg,initProgressCallback:p=>{if(onProgress)onProgress(p)}});
      lsSet('verba-local-route',url);lsSet('verba-local-ready',true);return this.engine;
    })();
    try{return await this.loading}catch(e){this.loading=null;throw e}
  },
  ask(msgs,max){return this.run(async()=>{
    const e=await this.start();await e.resetChat();
    const a=await e.chat.completions.create({messages:msgs,temperature:0,seed:1,max_tokens:max,extra_body:{enable_thinking:false}});
    return(a.choices&&a.choices[0]&&a.choices[0].message&&a.choices[0].message.content)||'';
  })},
  /* Messages: a short prompt, a required JSON shape and a low cap keep Qwen quick and stop it looping. The reply streams as it's written. */
  stream(messages,cap,schema,onLive){return this.run(async()=>{
    const e=await this.start(),base={messages,temperature:0,seed:1,max_tokens:cap,repetition_penalty:1.1,stream:true,extra_body:{enable_thinking:false}};
    const go=async body=>{await e.resetChat();let t='',last=0;
      for await(const ch of await e.chat.completions.create(body)){const d=ch.choices&&ch.choices[0];if(d&&d.delta&&d.delta.content){t+=d.delta.content;const p=this.partial(t);if(p&&onLive&&performance.now()-last>120){last=performance.now();onLive(p)}}}
      return t};
    try{return await go({...base,response_format:{type:'json_object',schema:JSON.stringify(schema)}})}catch(x){return go(base)}
  })},
  partial(t){const m=t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);if(!m)return'';try{return JSON.parse('"'+m[1].replace(/\\$/,'')+'"')}catch(e){return m[1]}},
  sentences(t){const m=t.match(/^[\s\S]*[.!?](?=\s|$)/);return m?m[0]:t},
  read(t){let j=null;try{j=JSON.parse(t)}catch(e){}
    const mood0=j?j.mood:(t.match(/"mood"\s*:\s*"(\w+)"/)||[])[1],edit=j?j.edit:(t.match(/"edit"\s*:\s*"((?:[^"\\]|\\.)*)"/)||[])[1];
    const raw=j?j.reply:this.sentences(this.partial(t)||t.replace(/<think>[\s\S]*?<\/think>/g,''));
    const a=String(raw||'').replace(/\{([^{}|]+)(\|[^{}]*)?\}/g,'$1').trim();if(!a||/^\{/.test(a))throw new Error('the local AI gave an unreadable reply');
    return{a,mood:MOODS[mood0]?mood0:'happy',leading:j?j.leading===true:/"leading"\s*:\s*true/.test(t),edit:typeof edit==='string'&&edit.trim()?edit.trim():null};
  },
  base(){return `You are ${SITE.cat}, the friendly cat tutor on ${SITE.name}, a ${LANG_NAME} practice site. Answer the newest question in at most 2 short sentences, with the answer in the first sentence. Use only the facts you are given. Never guess, and never correct yourself. If the facts do not cover it, say you are not sure. Do not repeat yourself. Choose a mood from: ${Object.entries(MOODS).map(([k,v])=>`${k} (${v.split(':')[0]})`).join(', ')}. `},
  schema(extra){return{type:'object',properties:{...extra,mood:{type:'string',enum:Object.keys(MOODS)},reply:{type:'string'}},required:[...Object.keys(extra),'mood','reply'],additionalProperties:false}},
  facts(q){return(q.tokens||[]).map(t=>{const m=((t.vocab||'').split(' : ')[1]||'').trim(),id=t.cids&&t.cids[0],u=id&&(TOPICS.find(x=>x.id===id)||{}).name;return t.concept?`${t.la} = ${t.concept} of ${t.lemma}${m?` (${m})`:''}${u?`, use: ${u}`:''}`:`${t.la}${m?` = ${m}`:''}`}).join('\n')},
  gloss(q,t){const low=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),map={};(q.tokens||[]).forEach(x=>{const m=((x.vocab||'').split(' : ')[1]||'').trim();if(m)map[low(x.la)]=m.replace(/[{}|]/g,'')});return t.replace(/\p{L}[\p{L}\p{M}]*/gu,w=>map[low(w)]?`{${w}|${map[low(w)]}}`:w)},
  async askExercise(q,c,question,draft,after,onLive){
    const hist=q.chat.filter(x=>!x.pending&&!x.err).slice(-2).map(x=>`Student: ${x.q}\n${SITE.cat}: ${String(x.a).replace(/\{([^{}|]+)\|[^{}]*\}/g,'$1')}`).join('\n')||'(none)';
    const sys=this.base()+(after?'The student has submitted, so explain openly.':`The student has not submitted yet. Set leading using these rules. ${LEAD_RULES[levelOf(q)]} If leading is false, do not say which form a word takes in this exercise and do not write its translation. Only if the student asks you to correct or fill in their answer, put the full corrected answer in edit; otherwise edit is null.`);
    const user=`Facts:\n${this.facts(q)}\nSentence: ${c.src}\nCorrect answer: ${c.model}\n${after?`Student's submitted answer: ${q.submitted||'(none)'}\nResult: ${q.result||''}`:`Student's current draft: ${draft||'(empty)'}`}\nEarlier conversation:\n${hist}\nNewest question: ${question}`;
    const v=this.read(await this.stream([{role:'system',content:sys},{role:'user',content:user}],after?110:130,this.schema(after?{}:{leading:{type:'boolean'},edit:{type:['string','null']}}),onLive));
    const a=this.gloss(q,v.a);if(after)return{a,mood:v.mood,after:true};
    const edit=!q.choice?v.edit:null;return{a,leading:v.leading||!!edit||askingForCheck(question),why:'',edit,mood:v.mood};
  },
  async askLesson(l,past,question,onLive){
    const hist=past.slice(-2).map(x=>`Student: ${x.q}\n${SITE.cat}: ${x.a}`).join('\n')||'(none)';
    const user=`Facts (the lesson the student is reading):\n${lsPlain(l.body).slice(0,6000)}\nEarlier conversation:\n${hist}\nNewest question: ${question}`;
    const v=this.read(await this.stream([{role:'system',content:this.base()+'If the student asks you to answer a practice question for them, guide them to it first.'},{role:'user',content:user}],130,this.schema({}),onLive));
    return{a:v.a,mood:v.mood,older:null};
  },
  async words(list){ // Whitaker's Words, kept on this device so each word is looked up once
    if(!this.groundFor){this.groundFor=1;try{this.G=JSON.parse(localStorage.getItem('verba-lw')||'{}')}catch(e){this.G={}}}
    const todo=[...new Set(list)].filter(w=>this.G[w]===undefined);
    for(let i=0;i<todo.length;i+=50){
      const part=todo.slice(i,i+50),body=JSON.stringify({words:part}),opt={method:'POST',headers:{'Content-Type':'application/json'},body};
      let r=null;for(const u of ['https://latin.71m.us/latin/batch',AI_RELAY+'/latin-api/latin/batch']){try{r=await fetch(u,opt);if(r.ok)break}catch(e){r=null}}
      if(!r||!r.ok)continue;
      for(const x of (await r.json()).results||[])this.G[x.word]=x.success?leading.parseEntries(x.data,x.word):[];
    }
    const keys=Object.keys(this.G);if(keys.length>4000)keys.slice(0,keys.length-4000).forEach(k=>delete this.G[k]);
    try{localStorage.setItem('verba-lw',JSON.stringify(this.G))}catch(e){}
  },
  async verbaTie(c,ans){ // Verba's own tie-break: the Worker holds the key and only ever sends this one grading prompt
    const r=await fetch(AI_RELAY+'/verba-tiebreak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({e2l:!!c.e2l,src:c.src,model:c.model,ans})});
    if(!r.ok)throw new Error('tie-break '+r.status);
    const v=leading.readServer((await r.json()).text);if(v.got===null)throw new Error('tie-break unreadable');return v;
  },
  async localTie(c,ans,quote){const ch=leading.readTie(await this.ask(leading.tieMessages(c,ans,this.G,quote),12));return{got:ch===false,reason:''}},
  async grade(c,ans){
    await this.libs();
    const want=c.e2l?[ans,c.model]:[c.src];await this.words(want.flatMap(t=>leading.lookupWords(t)));
    const pre=leading.preGrade(c,ans,this.G);if(pre)return{ok:pre.got,reason:pre.reason};
    const wm=leading.wrongMessages(c,ans,this.G),proof=leading.readProof(await this.ask(wm,30),wm[1].content);
    const right=leading.readGrade(await this.ask(leading.rightMessages(c,ans,this.G),12)).got,wrongOk=!proof.found;
    let got,reason='';
    if(right===wrongOk)got=wrongOk;
    else{
      const quote=proof.found?proof.quote:'',slot=slots.find(s=>s.local),keys=activeSlots();let v=null;
      if(!(slot&&slot.tie)){
        if(keys.length){try{v=leading.readServer(await aiChat(leading.serverMessages(c,ans)));if(v.got===null)v=null}catch(e){v=null}}
        else{try{v=await this.verbaTie(c,ans)}catch(e){v=null}}
      }
      if(!v)v=await this.localTie(c,ans,quote);
      got=v.got;reason=v.reason||'';
    }
    if(!got&&!reason)reason=proof.found?`Check this: “${proof.quote}”.`:leading.rejectReason(c,ans,this.G);
    return{ok:got,reason};
  },
  // Asked once per browser, on first launch and on the next open for existing accounts.
  ask1(done){
    const d=document.createElement('dialog');d.className='acct';d.setAttribute('aria-labelledby','laiT');
    d.innerHTML=`<h2 id="laiT">Grade your answers on this device?</h2><p>${esc(SITE.name)} can download a free AI that runs on this device. It’s a one-time download of about 2.4 GB, so use Wi-Fi.</p><p><b>If you skip it, you’ll need your own AI key to have your answers graded.</b> You can download it later under Edit keys.</p><p class="msg" id="laiMsg" role="status"></p><div class="row"><button class="btn" type="button" id="laiYes">Download (2.4 GB)</button><button class="btn quiet" type="button" id="laiNo">Not now, I’ll use a key</button></div>`;
    document.body.appendChild(d);d.addEventListener('cancel',e=>e.preventDefault());d.showModal();
    const fin=()=>{d.close();d.remove();done()};
    d.querySelector('#laiNo').onclick=()=>{this.setChoice('no');fin()};
    d.querySelector('#laiYes').onclick=async()=>{
      const y=d.querySelector('#laiYes'),n=d.querySelector('#laiNo'),m=d.querySelector('#laiMsg');y.disabled=true;n.disabled=true;this.setChoice('yes');
      try{await this.start(p=>{m.textContent=`Downloading: ${Math.round((p.progress||0)*100)}%. Please keep this page open.`});try{keysUI(true)}catch(e){}fin()}
      catch(e){this.setChoice(null);m.textContent='The download didn’t finish: '+(e.message||'unknown error')+'. You can try again or use a key.';y.disabled=false;n.disabled=false}
    };
  },
  async firstRun(done){
    if(!SITE.localAI||this.choice()!==null)return done();
    if(!(await this.supported())){this.setChoice('unsupported');return done()}
    this.ask1(done);
  },
  async download(){ // from the Local AI row under Edit keys
    if(!(await this.supported())){toast('shocked','This browser or device can’t run the local AI. Add an AI key instead.');return}
    this.setChoice('yes');const st=document.querySelector('.krow[data-local] .kstat');
    try{await this.start(p=>{if(st)st.textContent=`Downloading: ${Math.round((p.progress||0)*100)}%`});keysUI(true)}
    catch(e){this.setChoice(null);if(st)st.textContent='The download didn’t finish: '+(e.message||'unknown error')}
  },
};
// The site's rules count checking or giving the answer as too leading, so code catches the plain cases Qwen misses.
const askingForCheck=s=>/\b(is|are|was|does|did)\s+(my|this|that|it)\b.*\b(right|correct|wrong|good|ok|okay)\b|\b(check|fix|correct)\s+(my|this)\b|\b(what|tell me|give me)\b.*\b(the\s+)?(answer|translation)\b|\bhow (do|would) (i|you) (say|translate|write) (this|that|it|the sentence)\b/i.test(s);
// Messages use the local AI when its messages option is on and no key that is on is ranked above it.
function localMsgFirst(){
  if(!LAI.usable())return false;
  const s=slots.find(x=>x.local);if(!s||!s.on||!s.msg)return false;
  if(!advanced)return true;
  const i=slots.indexOf(s);return !slots.slice(0,i).some(x=>!x.local&&x.on&&x.key.trim()&&!isGonka(x));
}
// Local AI grades when it's on, downloaded, and no key that is on is ranked above it.
function localFirst(q){
  if(!LAI.usable()||!q||q.choice||(q.mode!=='e2l'&&q.mode!=='l2e'))return false;
  const s=slots.find(x=>x.local);if(!s||!s.on)return false;
  if(!advanced)return true;
  const i=slots.indexOf(s);return !slots.slice(0,i).some(x=>!x.local&&x.on&&x.key.trim());
}
