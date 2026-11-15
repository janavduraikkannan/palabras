
/* ---------- Optional onboarding: the site's cat explains privacy, accounts and how the site works ---------- */
const ONB_PRIV=`<div class="onbtri">
  <section class="ok"><h3>Private</h3><ul>
    <li>Your AI key, unless you choose to save it. ${SITE.name} never stores it: it goes from your browser to the AI company, passing through the ${SITE.name} relay (a small server on Cloudflare that saves nothing) unless you switch the relay off.</li>
    <li>Without an account, your progress stays in this browser only.</li></ul></section>
  <section class="maybe"><h3>Up to other companies</h3><ul>
    <li>On this device, the local AI grades your translations and answers your messages, and they stay here. If you use an AI key, the sentence, your answer and your question go to that AI company, and what they keep is up to their privacy policy. If the local AI’s two checks disagree and you have no key on, that exercise and your answer go through the ${SITE.name} relay to Gonka Broker to settle it.</li>
    <li>GitHub hosts this site, Google Firebase stores accounts, and Cloudflare runs the relay. They may keep basic logs, like your IP address.</li></ul></section>
  <section class="no"><h3>Not private</h3><ul>
    <li>The leaderboard and anything you put in your profile can be seen by other people.</li>
    <li>Account data isn’t encrypted: anyone with your account key can open it, and the site’s owner can see it.</li>
    <li>If you set a password, it’s never stored anywhere, so a forgotten password can’t be recovered. Your username is public.</li>
    <li>A key you save in your browser or account is stored as plain text.</li></ul></section></div>
  <p class="hint">Never type personal details (your address, phone number, passwords) into the chat or your profile.</p>`;
let onb={i:0,newAcct:''};
const ONB=[
 {face:'delighted',say:TXT.onbHello,
  body:()=>`<p class="onbstep">Welcome</p><h2 id="onbTitle">Practice ${LANG_NAME} sentences, one at a time</h2>
   <p>Pick the topics your class has covered, translate sentences between English and ${LANG_NAME}, and earn XP for a daily streak.</p>
   <div class="row"><button type="button" class="onblink" id="onbLogin">${TXT.onbLogin}</button></div>`,
  next:'Next'},
 {face:'sly',say:'Here’s the honest truth about privacy.',
  body:()=>`<p class="onbstep">Step 1 of 2 · Privacy</p><h2 id="onbTitle">What’s private, and what isn’t</h2>${ONB_PRIV}`,next:'Got it'},
 {face:'adoring',say:'Last thing, and it’s optional: an account keeps your XP and streak on every device.',skip:()=>{try{return!acctReady()}catch(e){return true}},
  body:()=>acct.key?`<p class="onbstep">Step 2 of 2 · Account (optional)</p><h2 id="onbTitle">You have an account</h2>
   ${onb.newAcct?`<p class="onbbig">Here’s your account key. Save it too, separately from your AI key. It’s the only way to sign in on another device.</p><div class="keybox">${esc(showKey(onb.newAcct))}</div><div class="row"><button class="btn quiet" type="button" id="onbACopy">Copy account key</button><span class="msg" id="onbAMsg"></span></div>`:'<p>This browser is already signed in.</p>'}
   <label class="chk"><input type="checkbox" id="onbRemA"${keyRemA?' checked':''}> Also save my AI key to my account</label>
   <p class="hint">Then it follows you to every device you log in on. It’s stored as plain text in your account, so keep your account key (and password) private.</p>
   ${loginOn()?`<p>You can also log in with <b>@${esc(board.handle||loginOn().hid)}</b> and your password.</p>`:`<details class="onbemail"${onb.emailOpen?' open':''}><summary>Optional: pick a username and password</summary><p>Easier than typing your account key on a new device. Your account key will still work too.</p>${pwSetHTML('oS',false)}</details>`}`
  :`<p class="onbstep">Step 2 of 2 · Account (optional)</p><h2 id="onbTitle">Make a free account?</h2>
   <p>An account saves your XP, streak, topics and settings, so you can pick up on any device, and it puts you on the leaderboard (you choose a username later).</p>
   <p>You get an <b>account key</b>, and that key is your account. Save it somewhere safe, just like your AI key. After that you can pick a username and password too, so logging in on another device is easier.</p>
   <div class="row"><button class="btn" type="button" id="onbMake">Create my account</button><button type="button" class="onblink" id="onbSignin">I already have an account: log in</button><span class="msg" id="onbAMsg"></span></div>
   <p class="hint">You can skip this and make an account later with the Account button at the top.</p>`,next:()=>acct.key?'Next':'Skip for now'},
 {face:SITE.proudFace,say:TXT.onbDone,
  body:()=>`<p class="onbstep">All done</p><h2 id="onbTitle">How ${SITE.name} works</h2><ul>
   <li>Pick the topics your class has covered, then click <b>Start practice</b>.</li>
   <li>Click a word under <b>Vocabulary</b> to type it into your answer.</li>
   <li>Hover over (or tap) a ${LANG_NAME} word with a dotted underline to see what it means.</li>
   ${TXT.onbTyping}<li>Ask me anything in <b>Ask ${SITE.cat}</b>. But a question that gives away the answer before you submit makes that sentence count as wrong!</li>
   <li>Need this guide again? Click <b>Start onboarding</b> under the key box.</li></ul>`,next:'Start learning'},
 {face:'happy',say:TXT.onbBack,skip:()=>!onb.login,backTo:0,
  body:()=>`<p class="onbstep">Log in</p><h2 id="onbTitle">Log in to your account</h2>
   <p>Use your username and password, or your account key. Either one works.</p>${loginFormHTML('oL')}
   <p class="hint">Forgot your password? Log in with your account key, then set a new password in Account. Without either one, the account can’t be recovered.</p>`,
  next:'I’m new: set me up',go:()=>{onb.login=false;onbGo(1)}}
];
const ONB_LOGIN=ONB.length-1,ONB_ACCT=2;
const onbFace=m=>`img/${SITE.catDir}/${m}.svg?v=${SITE.catV}`;
function onbShow(){
  const st=ONB[onb.i];$('onbFelix').src=onbFace(st.face);$('onbSay').innerHTML=latH(st.say);
  $('onbBody').innerHTML=st.body();
  const shown=ONB.filter(x=>!(x.skip&&x.skip()));$('onbDots').innerHTML=shown.map(x=>`<i class="${x===st?'on':''}"></i>`).join('');
  $('onbBack').style.visibility=onb.i?'visible':'hidden';
  $('onbNext').textContent=typeof st.next==='function'?st.next():st.next;
  const lg=$('onbLogin');if(lg)lg.onclick=()=>{onb.login=true;onbGo(ONB_LOGIN)};
  if(onb.i===ONB_LOGIN)bindLoginForm('oL',onbLoggedIn);
  if(onb.i===ONB_ACCT)onbAcctStep();
  $('onb').scrollTop=0;
}
function onbGo(i){const d=i>onb.i?1:-1;while(ONB[i]&&ONB[i].skip&&ONB[i].skip())i+=d;onb.i=Math.max(0,Math.min(ONB.length-1,i));onbShow()}
function onbAcctStep(){
  const msg=(t,c)=>{const m=$('onbAMsg');if(m){m.className='msg '+(c||'');m.textContent=t}};
  const mk=$('onbMake');if(mk)mk.onclick=async()=>{msg('Creating…');mk.disabled=true;try{onb.newAcct=await makeAccount();$('onbFelix').src=onbFace(SITE.proudFace);onbShow();$('onbNext').textContent='Next'}catch(e){mk.disabled=false;msg(e.message,'bad')}};
  const si=$('onbSignin');if(si)si.onclick=()=>{onb.login=true;onbGo(ONB_LOGIN)};
  const em=$('oSGo');if(em){bindPwSet('oS',()=>{onb.emailOpen=false;$('onbFelix').src=onbFace('delighted');setTimeout(()=>{if($('onb').open&&onb.i===ONB_ACCT)onbShow()},1800)});const d=document.querySelector('.onbemail');if(d)d.ontoggle=()=>onb.emailOpen=d.open}
  const cp=$('onbACopy');if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(showKey(onb.newAcct));msg('Copied! Now paste it somewhere safe.','ok')}catch(e){msg('Select the key above and copy it.','bad')}};
  const ra=$('onbRemA');if(ra)ra.onchange=e=>{keyRemA=e.target.checked;lsSet('verba-keys-account',keyRemA);try{pushNow()}catch(x){}keysUI()};
}
function onbLoggedIn(){onb.login=false;$('onbFelix').src=onbFace('delighted');onbGo(ONB.length-2);$('onbSay').innerHTML=latH(TXT.helloAgain+' You’re logged in. All set!')}
function onbDone(){lsSet(SITE.id+'-onboarded',true);if(lsGet('verba-relay',null)===null)lsSet('verba-relay',relayOn());if($('onb').open)$('onb').close()}
function openOnb(i=0){$('onb').showModal();onbGo(i);$('onbNext').focus()}
// First visit: one question. Onboarding is optional and stays available from the Start onboarding button.
function askOnb(){
  const d=document.createElement('dialog');d.className='acct';d.setAttribute('aria-labelledby','onbAskT');
  d.innerHTML=`<h2 id="onbAskT">Start Onboarding (optional and can be accessed any time)?</h2><div class="row"><button class="btn" type="button" id="onbYes">Yes</button><button class="btn quiet" type="button" id="onbNo">No</button></div>`;
  document.body.appendChild(d);d.addEventListener('cancel',e=>e.preventDefault());d.showModal();
  const fin=()=>{d.close();d.remove()};
  d.querySelector('#onbYes').onclick=()=>{fin();openOnb(0)};
  d.querySelector('#onbNo').onclick=()=>{fin();onbDone();if(AI_RELAY&&lsGet('verba-relay',null)===null)relayNotice()};
}
function setupOnboarding(){
  $('onbNext').onclick=()=>{const st=ONB[onb.i];if(st.go)return st.go();if(onb.i>=ONB_LOGIN-1){onbDone();return}onbGo(onb.i+1)};
  $('onbBack').onclick=()=>{const st=ONB[onb.i];if(st.backTo!==undefined){onb.login=false;return onbGo(st.backTo)}onbGo(onb.i-1)};
  $('onbClose').onclick=()=>onbDone();
  $('onb').addEventListener('close',()=>{lsSet(SITE.id+'-onboarded',true);if(lsGet('verba-relay',null)===null)lsSet('verba-relay',relayOn())});
  $('kguide').addEventListener('click',()=>openOnb(0));
  // First visit: no key anywhere and not signed in.
  LAI.firstRun(()=>{
    if(!lsGet(SITE.id+'-onboarded',false)&&!slots.some(x=>x.key)&&!acct.key){askOnb();return}
    if(AI_RELAY&&lsGet('verba-relay',null)===null&&!$('onb').open)relayNotice();
  });
}
