/* ---------- Spanish: how the language behaves in the shared practice code ----------
   Each piece here is called by a shared script (named beside it). Grammar itself is in engine.js. */
/* js/core.js glossify(): fold a word so accents don't stop a hover definition from matching */
const foldWord=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC').toLowerCase();
/* capitalize the first letter, after any opening ¿ ¡ or highlight marker */
const capES=s=>String(s).replace(/^([¿¡\u0001]*)(\p{L})/u,(m,a,b)=>a+b.toUpperCase());
/* js/drill.js next(): the sentence as shown, without its end mark */
const sentenceText=q=>capES(q.display);
/* js/drill.js: get a new question ready */
function prep(x){x.mode=(x.choice||x.form)?'blank':modeSel();if(!x.choice)x.latin=capES(x.display)+x.end;x.greeting=R(GREETINGS);return x}
/* ---------- charts beside the sentence: buildCharts() runs once at start-up, renderCharts(q) on every new sentence ---------- */
function buildCharts(){
  const set=h=>{$('cbody').hidden=h;$('ctoggle').textContent=h?'Show':'Hide';store.set('chartsHidden',h)};
  $('ctoggle').addEventListener('click',()=>set(!$('cbody').hidden));set(store.get('chartsHidden',false));
}
const PRS=['yo','tú','él, ella, usted','nosotros','vosotros','ellos, ellas, ustedes'];
function conjT(cap_,verbs,t,note){
  return `<div class="cwrap"><table><caption>${cap_}</caption><tr><th></th>${verbs.map(v=>`<th>${v}</th>`).join('')}</tr>${[0,1,2,3,4,5].map(p=>`<tr${p===4?' class="vos"':''}><th>${PRS[p]}</th>${verbs.map(v=>`<td>${esc(vphrase(vb(v),t,p))}</td>`).join('')}</tr>`).join('')}</table>${note?`<p class="hint">${note}</p>`:''}</div>`}
function listT(cap_,head,rows,note){return `<div class="cwrap"><table><caption>${cap_}</caption><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${c}</td>`:`<th>${c}</th>`).join('')}</tr>`).join('')}</table>${note?`<p class="hint">${note}</p>`:''}</div>`}
const CHARTS={
  pres:()=>conjT('Present tense: regular verbs',['hablar','comer','vivir'],'pres','Stem changers change in every form except nosotros and vosotros: pienso, puedo, pido. Irregular yo forms: hago, pongo, salgo, traigo, conozco, veo. -ger/-gir → -jo (escojo), -cer/-cir after a vowel → -zco (ofrezco, conduzco), -guir → -go (distingo, sigo), -uir adds y (construyo, construyes).'),
  irrpres:()=>conjT('Present tense: key irregular verbs',['ser','estar','ir','tener'],'pres',''),
  prog:()=>listT('Present progressive: estar + -ndo',['','estar','+ gerund'],[['yo','estoy','hablando'],['tú','estás','comiendo'],['él, ella, usted','está','viviendo'],['nosotros','estamos','leyendo'],['ellos, ellas, ustedes','están','durmiendo']],'-ar → -ando, -er/-ir → -iendo. A vowel before the ending makes -yendo (leyendo, trayendo). -ir stem changers: durmiendo, pidiendo. Pronouns go first or attach with an accent: lo estoy comiendo = estoy comiéndolo.'),
  pret:()=>conjT('Preterite: regular verbs',['hablar','comer','vivir'],'pret','-car, -gar, -zar change in the yo form: busqué, llegué, empecé. Irregular stems take -e, -iste, -o, -imos, -isteis, -ieron with no accents: tuv-, estuv-, pud-, pus-, sup-, quis-, vin-, hic- (hizo), dij-, traj- (dijeron, trajeron). ser and ir share fui, fuiste, fue, fuimos, fuisteis, fueron. -ir stem changers change in the él and ellos forms: pidió, durmieron. -aer, -eer, -oír and -uir change i to y there too: leyó, oyeron, construyeron. -ducir has a j stem: conduje, tradujeron.'),
  hora:()=>listT('Telling time',['','Spanish'],[['1:00','Es la una (en punto).'],['2:10','Son las dos y diez.'],['3:15','Son las tres y cuarto.'],['4:30','Son las cuatro y media.'],['5:45','Son las seis menos cuarto.'],['12:00 p.m.','Es mediodía.'],['12:00 a.m.','Es medianoche.'],['at 8:00','a las ocho']],'Es for one o’clock, noon and midnight; son for every other hour. Add minutes with y; after the half hour, take them away from the next hour with menos. de la mañana = a.m., de la tarde = afternoon, de la noche = evening and night.'),
  fecha:()=>listT('Days, months and dates',['',''],[['Days','lunes, martes, miércoles, jueves, viernes, sábado, domingo'],['Months','enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre'],['The date','Es el doce de marzo. (el + number + de + month)'],['The 1st','Es el primero de abril.'],['On Monday','el lunes (every Monday: los lunes)']],'Days and months are not capitalized. Dates use plain numbers, except primero for the 1st.'),
  clima:()=>listT('Weather: ¿Qué tiempo hace?',['','Spanish'],[['hace + noun','Hace calor, frío, fresco, sol, viento, buen tiempo, mal tiempo.'],['está + adjective','Está nublado, despejado, soleado, húmedo.'],['right now','Está lloviendo (llueve). Está nevando (nieva).'],['hay + noun','Hay una tormenta. Hay niebla.'],['Seasons','la primavera, el verano, el otoño, el invierno']],'“Very” with hace is mucho: hace mucho frío.'),
  nums:()=>listT('Numbers',['',''],[['16–19','dieciséis, diecisiete, dieciocho, diecinueve'],['21–29','veintiuno, veintidós, veintitrés … veintinueve'],['31–99','treinta y uno, cuarenta y dos … (y only between the tens and the ones)'],['100','cien; 101–199: ciento uno, ciento veinte …'],['200–900','doscientos, trescientos, cuatrocientos, quinientos, seiscientos, setecientos, ochocientos, novecientos'],['1000','mil']],'Uno becomes un before a masculine noun (veintiún libros) and una before a feminine one (veintiuna sillas). The hundreds agree too: doscientas sillas.'),
  impf:()=>conjT('Imperfect',['hablar','comer','ser','ir'],'impf','Only three verbs are irregular: ser, ir and ver (veía).'),
  futcond:()=>listT('Future and conditional: endings on the whole infinitive',['','Future','Conditional'],[0,1,2,3,4,5].map(p=>[PRS[p],'hablar'+T6(FUT_END)[p],'hablar'+T6(COND_END)[p]]),'Irregular stems (same for both): tendr-, pondr-, saldr-, vendr-, podr-, sabr-, querr-, har-, dir-, habr-.'),
  perf:()=>listT('haber, the helper for perfect tenses (+ past participle)',['','present','imperfect','future','conditional','pres. subj.','impf. subj.'],[0,1,2,3,4,5].map(p=>[PRS[p],...['pres','impf','fut','cond','spres','simpf'].map(t=>vf(vb('haber'),t,p))]),'Participles: -ado, -ido; -aer, -eer, -oír take an accent (caído, creído, leído, oído, traído). The ten common irregulars (All Corn Dies Early However Many People Replant Various Vegetables): abierto, cubierto, dicho, escrito, hecho, muerto, puesto, roto, visto, vuelto.'),
  subj:()=>conjT('Present subjunctive',['hablar','comer','vivir'],'spres','Start from the yo form, drop -o, add the opposite vowel: hago → haga, tengo → tenga. Irregular: dar (dé), ir (vaya), ser (sea), haber (haya), estar (esté), saber (sepa). Triggers (WEIRDO): wishes, emotions, impersonal expressions, recommendations, doubt or denial, ojalá.'),
  simpf:()=>conjT('Imperfect subjunctive',['hablar','comer','tener'],'simpf','Take the ellos preterite, drop -ron, add -ra, -ras, -ra, -ramos, -rais, -ran: tuvieron → tuviera, fueron → fuera.'),
  cmd:()=>listT('Commands',['','affirmative','negative'],[['tú','habla, come (él form)','no hables, no comas'],['usted','hable, coma','no hable, no coma'],['ustedes','hablen, coman','no hablen, no coman'],['nosotros','hablemos (let’s speak)','no hablemos']],'Irregular tú commands: di, haz, ve, pon, sal, sé, ten, ven. Pronouns attach to affirmative commands (cómelo, levántate) and go before negative ones (no lo comas).'),
  agree:()=>listT('Articles, adjectives and determiners',['','masc. sing.','fem. sing.','masc. pl.','fem. pl.'],[['the','el','la','los','las'],['a, some','un','una','unos','unas'],['adjective in -o','alto','alta','altos','altas'],['adjective in -e or a consonant','grande','grande','grandes','grandes'],['this, these','este','esta','estos','estas'],['that, those','ese','esa','esos','esas'],['my','mi','mi','mis','mis'],['our','nuestro','nuestra','nuestros','nuestras']],'Adjectives usually go after the noun. a + el = al, de + el = del.'),
  pron:()=>listT('Pronouns',['','subject','direct object','indirect object','reflexive'],[['I / me','yo','me','me','me'],['you','tú','te','te','te'],['he, she, you (formal)','él, ella, usted','lo, la','le (se)','se'],['we / us','nosotros','nos','nos','nos'],['you all (Spain)','vosotros','os','os','os'],['they, you all','ellos, ellas, ustedes','los, las','les (se)','se']],'Order: reflexive, indirect, direct (me lo da). le and les become se before lo, la, los, las: se lo doy.')
};
function renderCharts(qq){
  const ids=(qq&&qq.charts&&qq.charts.length?qq.charts:['pres']).filter(id=>CHARTS[id]);
  $('cbody').innerHTML=ids.map(id=>CHARTS[id]()).join('');
  $('cbody').classList.toggle('novos',!VOS);
}
/* ---------- identify the use (js/identify.js) ---------- */
const normU=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\b(ser|estar|por|para|the|preterite|imperfect|subjunctive|subj|use|usage|of|a|an|it|is|its|this|type|for a|for an)\b/g,' ').replace(/\s+/g,' ').trim();
/* the highlighted words: the token itself plus any words it governs (por el parque) */
function spanIdx(qq,tok){const i=qq.tokens.indexOf(tok);return[i,i+(tok.span||0)]}
function phraseOf(qq,tok){const[a,b]=spanIdx(qq,tok);return contract(qq.tokens.slice(a,b+1).filter(t=>!t.hide).map(t=>t.la).join(' '))}
function latinMarked(qq,tok){
  const[a,b]=spanIdx(qq,tok),pre=qq.end==='?'?'¿':qq.end==='!'?'¡':'';
  const words=[];qq.tokens.forEach((t,j)=>{if(t.hide)return;words.push({w:t.la+(t.post||''),m:j>=a&&j<=b})});
  let txt=words.map((x,i)=>(x.m?'\u0001':'')+x.w+(x.m?'\u0002':'')).join(' ');
  txt=contract(txt.replace(/\u0002 \u0001/g,' '));txt=capES(pre+txt.replace(/^\u0001/,'').replace(/^/,txt.startsWith('\u0001')?'\u0001':''));
  return esc(txt).replace(/\u0001/g,'<mark>').replace(/\u0002/g,'</mark>')+qq.end;
}
function pickXC(qq){
  if(!qq||qq.choice||!qq.tokens)return null;
  const c=qq.tokens.filter(t=>t.cids&&TY(t.cids[0])&&!XC_SKIP(t,qq));if(!c.length)return null;
  const pref=qq.topic&&ID_TOPIC[qq.topic.id],a=pref&&c.find(t=>pref.includes(TY(t.cids[0])));if(a)return a;
  return R(c);
}
function makeIdentify(){
  const fromIds=ids=>[...new Set(ids.flatMap(t=>ID_TOPIC[t]||[]))];
  const ft=fromIds([...tFocus]);let types=tab==='uses'?[...uSel]:tab==='build'?[]:(ft.length?ft:fromIds([...selected]));
  if(!types.length)types=Object.keys(TYPES).filter(x=>!/^sj/.test(x)||[...selected].some(t=>/^sj|ojala/.test(t)));
  for(let tries=0;tries<200;tries++){
    const ty=R(types);ALT=[];let qq;try{qq=TYPES[ty].gen?TYPES[ty].gen():idQuestion(ty)}catch(e){continue}
    const tok=qq.tokens.find(t=>t.cids&&TY(t.cids[0])===ty);if(!tok)continue;
    qq.idType=ty;qq.idTok=tok;if(!useEnMark(qq))continue;qq.topic={id:'identify',level:{ser:'I',estar:'I',por:'II',para:'II',pret:'II',impf:'II',subj:'III'}[TYPES[ty].c],name:'Identify: uses of '+USES[TYPES[ty].c].name};
    qq.topic.level=TYPES[ty].level||USES[TYPES[ty].c].level||qq.topic.level||'I';
    return qq;
  }
  return makeQuestion(selected.size?selected:new Set(['serest']));
}
/* js/check.js checkT(): the feedback line for a checked translation (r: the grader's result) */
function resultLine(r,model,why,order,e2l,inp){
  let li;
  if(r.ok&&!r.macron)li=`<li class="ok"><b class="ok">Correct.</b> ${model}</li>`;
  else if(r.ok)li=`<li class="mac"><b class="ok">Correct</b>, <b class="mac">but check the accents.</b> With every accent mark: ${model}</li>`;
  else if(r.essential)li=`<li class="bad"><b class="bad">Incorrect: an accent mark matters here.</b> <span class="la">${esc(r.essential.join(', '))}</span> is a different form. The answer is ${model}</li>`;
  else li=`<li class="bad"><b class="bad">${r.empty?'No answer given.':'Incorrect.'}</b>${why}${why?'<br>':' '}One correct answer: ${model}${order}${r.empty?'':'<br><button class="btn quiet" id="override">Count my answer as correct</button>'}</li>`;
  return li;
}
/* js/check.js: typing helpers in the answer box and the question box, and the letter buttons */
function setupTyping(){
  const MAC={"a'":'á',"e'":'é',"i'":'í',"o'":'ó',"u'":'ú',"A'":'Á',"E'":'É',"I'":'Í',"O'":'Ó',"U'":'Ú',"a´":'á',"e´":'é',"i´":'í',"o´":'ó',"u´":'ú',"n~":'ñ',"N~":'Ñ','u"':'ü','U"':'Ü'};
  const accType=(t,only)=>{const p=t.selectionStart,v=t.value,k=v.slice(p-2,p);if(p>1&&MAC[k]&&(!only||only.includes(k[1]))){t.value=v.slice(0,p-2)+MAC[k]+v.slice(p);t.setSelectionRange(p-1,p-1)}};
  $('qbody').addEventListener('input',e=>{const t=e.target;if(t.tagName!=='INPUT'||q.mode==='l2e'||q.mode==='id')return;accType(t)});
  $('macrons').innerHTML=['á','é','í','ó','ú','ñ','ü','¿','¡'].map(c=>`<button type="button" aria-label="Insert ${c}">${c}</button>`).join('');
  $('askq').addEventListener('input',e=>accType(e.target,'~´'));
}
/* js/vocab.js: the word to type when a vocabulary line is clicked */
function vocabWords(v){
  const i=v.indexOf(' : '),la=(i<0?v:v.slice(0,i)).trim(),en=i<0?'':v.slice(i+3).trim();
  let laW;const plain=la.replace(/\s*\([^)]*\)/g,'').trim();
  if(/^(el|la|los|las) \S+$/.test(plain))laW=plain.split(' ')[1];
  else if(!/[,;/]/.test(plain)&&plain.split(' ').length<=3&&!/…/.test(plain))laW=plain;
  else laW=(plain.match(/^[^\s,(/]+/)||[plain])[0];
  const enW=en.split(/[;,]/)[0].replace(/\([^)]*\)/g,'').replace(/^to /,'').replace(/\s+/g,' ').trim()||en;
  return{la:laW,en:enW};
}
