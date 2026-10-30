/* ===================== ENGINE ===================== */
const R=a=>a[Math.floor(Math.random()*a.length)], chance=p=>Math.random()<p;
const T6=s=>s.split(' ');
let VOS=false; // also use vosotros forms ("you all" in Spain)
function setLimit(on){VOS=!!on}
let ALT=[];
const GN={m:'masculine',f:'feminine'};
const TN={pres:'present',pret:'preterite',impf:'imperfect',fut:'future',cond:'conditional',prog:'present progressive',perf:'present perfect',plup:'pluperfect',futp:'future perfect',condp:'conditional perfect',spres:'present subjunctive',simpf:'imperfect subjunctive',sperf:'present perfect subjunctive',splup:'pluperfect subjunctive',ira:'ir a + infinitive'};
const PERS=['yo','tú','él / ella / usted','nosotros','vosotros','ellos / ellas / ustedes'];

/* ---------- accents ---------- */
const ACC={a:'á',e:'é',i:'í',o:'ó',u:'ú'};
const stripA=s=>String(s).normalize('NFD').replace(/[\u0301\u0308\u0303]/g,'').normalize('NFC');
const hasAcc=s=>/[áéíóú]/.test(s);
const vg=w=>[...w.matchAll(/[iuü]*[aeoáéó][iuü]*|[iuüíú]+/g)];
const strongIn=s=>{const i=s.search(/[aeo]/);return i<0?s.length-1:i};
/* add pronouns to the end of a command, gerund or infinitive, with the written accent Spanish needs */
function attach(w,pr){
  if(!pr)return w;const out=w+pr;if(hasAcc(w))return out;
  const gs=vg(w);if(!gs.length)return out;
  const si=gs.length===1?0:(/[aeiouns]$/.test(w)?gs.length-2:gs.length-1);
  if(vg(out).length-si<=2)return out;
  const g=gs[si],pos=g.index+strongIn(g[0]);return out.slice(0,pos)+ACC[out[pos]]+out.slice(pos+1);
}
const accLast=b=>{const i=Math.max(...[...'aeiou'].map(c=>b.lastIndexOf(c)));return i<0?b:b.slice(0,i)+ACC[b[i]]+b.slice(i+1)};

/* ---------- verbs ---------- */
const PRES_END={ar:'o as a amos áis an',er:'o es e emos éis en',ir:'o es e imos ís en'};
const PRET_END={ar:'é aste ó amos asteis aron',er:'í iste ió imos isteis ieron',ir:'í iste ió imos isteis ieron'};
const IMPF_END={ar:'aba abas aba ábamos abais aban',er:'ía ías ía íamos íais ían',ir:'ía ías ía íamos íais ían'};
const FUT_END='é ás á emos éis án',COND_END='ía ías ía íamos íais ían',STRONG='e iste o imos isteis ieron';
const SUBJ_END={ar:'e es e emos éis en',er:'a as a amos áis an'};
function lastSwap(s,from,to){const i=s.lastIndexOf(from);return i<0?s:s.slice(0,i)+to+s.slice(i+from.length)}
function chg(s,sc){return sc==='ie'?lastSwap(s,'e','ie'):sc==='ue'?lastSwap(s,'o','ue'):sc==='i'?lastSwap(s,'e','i'):sc==='u'?lastSwap(s,'u','ue'):s}
function chg2(s){const e=s.lastIndexOf('e'),o=s.lastIndexOf('o');return o>e?lastSwap(s,'o','u'):lastSwap(s,'e','i')}
/* inf|english|past|past participle|-ing|object tags|flags|stem change   flags: T takes an object, M motion to (a), F motion from (de), S activity in a place (en), D can take an indirect object, R reflexive */
const VERBS=`hablar|speak|spoke|spoken|speaking|L|TS|
comprar|buy|bought|bought|buying|tfwi|TD|
mirar|watch|watched|watched|watching|v|T|
buscar|look for|looked for|looked for|looking for|tpaw$|T|
necesitar|need|needed|needed|needing|tfw$|T|
llevar|carry|carried|carried|carrying|t|T|
preparar|prepare|prepared|prepared|preparing|f|TD|
cocinar|cook|cooked|cooked|cooking|f|TS|
tocar|play|played|played|playing|i|T|
escuchar|listen to|listened to|listened to|listening to|m|T|
ayudar|help|helped|helped|helping|p|T|
visitar|visit|visited|visited|visiting|pc|T|
llamar|call|called|called|calling|p|T|
esperar|wait for|waited for|waited for|waiting for|p|T|
usar|use|used|used|using|t|T|
lavar|wash|washed|washed|washing|t|T|
pagar|pay for|paid for|paid for|paying for|tf|T|
tomar|drink|drank|drunk|drinking|d|T|
entregar|turn in|turned in|turned in|turning in|wh|TD|
contestar|answer|answered|answered|answering|q|T|
memorizar|memorize|memorized|memorized|memorizing|w|T|
dibujar|draw|drew|drawn|drawing|al|T|
ganar|win|won|won|winning|g|T|
gastar|spend|spent|spent|spending|$|T|
grabar|record|recorded|recorded|recording|mu|T|
practicar|practice|practiced|practiced|practicing|gi|T|
depositar|deposit|deposited|deposited|depositing|$|T|
cuidar|take care of|took care of|taken care of|taking care of|pa|T|
patinar|skate|skated|skated|skating||S|
ensayar|rehearse|rehearsed|rehearsed|rehearsing||S|
caminar|walk|walked|walked|walking||M|
viajar|travel|traveled|traveled|traveling||M|
llegar|arrive|arrived|arrived|arriving||M|
trabajar|work|worked|worked|working||S|
estudiar|study|studied|studied|studying|s|TS|
bailar|dance|danced|danced|dancing||S|
cantar|sing|sang|sung|singing|u|T|
nadar|swim|swam|swum|swimming||S|
descansar|rest|rested|rested|resting||S|
enseñar|teach|taught|taught|teaching|y|TD|
mandar|send|sent|sent|sending|wt|TD|
mostrar|show|showed|shown|showing|tw|TD|ue
explicar|explain|explained|explained|explaining|y|TD|
prestar|lend|lent|lent|lending|tw$|TD|
comer|eat|ate|eaten|eating|f|TS|
beber|drink|drank|drunk|drinking|d|T|
leer|read|read|read|reading|w|T|
aprender|learn|learned|learned|learning|y|T|
vender|sell|sold|sold|selling|tf|TD|
correr|run|ran|run|running||MS|
comprender|understand|understood|understood|understanding|s|T|
romper|break|broke|broken|breaking|t|T|
escribir|write|wrote|written|writing|w|TD|
vivir|live|lived|lived|living||S|
abrir|open|opened|opened|opening|o|T|
recibir|receive|received|received|receiving|tw$|T|
compartir|share|shared|shared|sharing|f|T|
escoger|choose|chose|chosen|choosing|tr|T|
recoger|pick up|picked up|picked up|picking up|tr|T|
proteger|protect|protected|protected|protecting|pa|T|
ofrecer|offer|offered|offered|offering|tf|TD|
conducir|drive|drove|driven|driving|z|T|
traducir|translate|translated|translated|translating|w|T|
construir|build|built|built|building|c|T|
destruir|destroy|destroyed|destroyed|destroying|c|T|
cerrar|close|closed|closed|closing|o|T|ie
empezar|start|started|started|starting|s|T|ie
entender|understand|understood|understood|understanding|s|T|ie
perder|lose|lost|lost|losing|t$|T|ie
preferir|prefer|preferred|preferred|preferring|fd|T|ie
querer|want|wanted|wanted|wanting|tfd|T|ie
encontrar|find|found|found|finding|tpa$|T|ue
dormir|sleep|slept|slept|sleeping||S|ue
volver|return|returned|returned|returning||MF|ue
devolver|return|returned|returned|returning|wt|TD|ue
seguir|follow|followed|followed|following|pa|T|i
almorzar|eat lunch|ate lunch|eaten lunch|eating lunch||S|ue
jugar|play|played|played|playing|g|T|u
pedir|order|ordered|ordered|ordering|f|T|i
servir|serve|served|served|serving|f|TD|i
ir|go|went|gone|going||M|
tener|have|had|had|having|ta$|T|ie
hacer|make|made|made|making|fh|TD|
poner|put|put|put|putting|t|T|
salir|leave|left|left|leaving||F|
traer|bring|brought|brought|bringing|tfw|TD|
decir|say|said|said|saying|||i
venir|come|came|come|coming||MF|ie
saber|know|knew|known|knowing|||
conocer|know|knew|known|knowing|pc|T|
dar|give|gave|given|giving|tfw$|TD|
ver|see|saw|seen|seeing|tpacv|T|
poder|be able|was able|been able|being able|||ue
deber|should|should|should|should|||
ser|be|was|been|being|||
estar|be|was|been|being|||
haber|have|had|had|having|||
levantarse|get up|got up|gotten up|getting up||R|
acostarse|go to bed|went to bed|gone to bed|going to bed||R|ue
ducharse|take a shower|took a shower|taken a shower|taking a shower||R|
despertarse|wake up|woke up|woken up|waking up||R|ie
vestirse|get dressed|got dressed|gotten dressed|getting dressed||R|i
lavarse|wash $P hands|washed $P hands|washed $P hands|washing $P hands||R|
cepillarse|brush $P teeth|brushed $P teeth|brushed $P teeth|brushing $P teeth||R|
divertirse|have fun|had fun|had fun|having fun||R|ie
gustar|like|liked|liked|liking|||
encantar|love|loved|loved|loving|||
interesar|interest|interested|interested|interesting|||
fascinar|fascinate|fascinated|fascinated|fascinating|||
molestar|bother|bothered|bothered|bothering|||
aburrir|bore|bored|bored|boring|||
doler|hurt|hurt|hurt|hurting|||ue
alegrarse|be glad|was glad|been glad|being glad||R|
dudar|doubt|doubted|doubted|doubting|||
recomendar|recommend|recommended|recommended|recommending|||ie
sugerir|suggest|suggested|suggested|suggesting|||ie
temer|fear|feared|feared|fearing|||
creer|believe|believed|believed|believing|||
pensar|think|thought|thought|thinking|||ie
celebrar|celebrate|celebrated|celebrated|celebrating||S|`.split('\n').map(l=>{
  const[inf,e,past,pp,ing,obj,fl,sc]=l.split('|');const refl=fl.includes('R'),base=refl?inf.slice(0,-2):inf;
  return{inf,base,refl,e,past,pp,ing,obj,fl,sc:sc||'',cls:base.slice(-2),stem:base.slice(0,-2),irr:null};
});
const vb=x=>VERBS.find(v=>v.inf===x);
const IRR={
  ser:{pres:T6('soy eres es somos sois son'),pret:T6('fui fuiste fue fuimos fuisteis fueron'),impf:T6('era eras era éramos erais eran'),spres:T6('sea seas sea seamos seáis sean'),cmd:'sé'},
  ir:{pres:T6('voy vas va vamos vais van'),pret:T6('fui fuiste fue fuimos fuisteis fueron'),impf:T6('iba ibas iba íbamos ibais iban'),spres:T6('vaya vayas vaya vayamos vayáis vayan'),ger:'yendo',cmd:'ve'},
  estar:{pres:T6('estoy estás está estamos estáis están'),pst:'estuv',spres:T6('esté estés esté estemos estéis estén')},
  dar:{pres:T6('doy das da damos dais dan'),pret:T6('di diste dio dimos disteis dieron'),spres:T6('dé des dé demos deis den')},
  ver:{pres:T6('veo ves ve vemos veis ven'),ys:'ve',pret:T6('vi viste vio vimos visteis vieron'),impf:T6('veía veías veía veíamos veíais veían'),pp:'visto'},
  haber:{pres:T6('he has ha hemos habéis han'),pst:'hub',fs:'habr',ys:'hay'},
  tener:{yo:'tengo',pst:'tuv',fs:'tendr',cmd:'ten'},
  venir:{yo:'vengo',pst:'vin',fs:'vendr',ger:'viniendo',cmd:'ven'},
  decir:{yo:'digo',pst:'dij',fs:'dir',pp:'dicho',ger:'diciendo',cmd:'di'},
  poder:{pst:'pud',fs:'podr',ger:'pudiendo'},
  querer:{pst:'quis',fs:'querr'},
  hacer:{yo:'hago',pst:'hic',fs:'har',pp:'hecho',cmd:'haz'},
  poner:{yo:'pongo',pst:'pus',fs:'pondr',pp:'puesto',cmd:'pon'},
  salir:{yo:'salgo',fs:'saldr',cmd:'sal'},
  traer:{yo:'traigo',pst:'traj'},
  saber:{yo:'sé',pst:'sup',fs:'sabr',ys:'sep'},
  conocer:{yo:'conozco'},
  escribir:{pp:'escrito'},abrir:{pp:'abierto'},romper:{pp:'roto'},volver:{pp:'vuelto'},devolver:{pp:'devuelto'},
  // present irregulars, list 2: -ger/-gir → -jo, -cer/-cir → -zco, -guir → -go, -uir → y; -ducir also has a j preterite
  escoger:{yo:'escojo'},recoger:{yo:'recojo'},proteger:{yo:'protejo'},ofrecer:{yo:'ofrezco'},seguir:{yo:'sigo'},
  conducir:{yo:'conduzco',pst:'conduj'},traducir:{yo:'traduzco',pst:'traduj'},
  construir:{yo:'construyo',pres:T6('construyo construyes construye construimos construís construyen'),pret:T6('construí construiste construyó construimos construisteis construyeron'),ger:'construyendo'},
  destruir:{yo:'destruyo',pres:T6('destruyo destruyes destruye destruimos destruís destruyen'),pret:T6('destruí destruiste destruyó destruimos destruisteis destruyeron'),ger:'destruyendo'}
};
VERBS.forEach(v=>v.irr=IRR[v.base]||null);
function vf(v,t,p){
  const I=v.irr||{},cls=v.cls,st=v.stem,boot=p===0||p===1||p===2||p===5;
  if(Array.isArray(I[t]))return I[t][p];
  switch(t){
    case'pres':{if(p===0&&I.yo)return I.yo;const s=boot&&v.sc?chg(st,v.sc):st;return s+T6(PRES_END[cls])[p]}
    case'pret':{
      if(I.pst){let e=T6(STRONG)[p];if(I.pst.endsWith('j')&&p===5)e='eron';return(p===2&&I.pst==='hic'?'hiz':I.pst)+e}
      let e=T6(PRET_END[cls])[p],s=st;
      if(p===0&&cls==='ar'){if(/c$/.test(s))s=s.slice(0,-1)+'qu';else if(/g$/.test(s))s+='u';else if(/z$/.test(s))s=s.slice(0,-1)+'c'}
      if(cls!=='ar'&&/[aeo]$/.test(s))e=['í','íste','yó','ímos','ísteis','yeron'][p];
      if(cls==='ir'&&v.sc&&(p===2||p===5))s=chg2(s);
      return s+e}
    case'impf':return st+T6(IMPF_END[cls])[p];
    case'fut':return(I.fs||v.base)+T6(FUT_END)[p];
    case'cond':return(I.fs||v.base)+T6(COND_END)[p];
    case'spres':{
      let s;
      if(I.ys)s=I.ys;else if(I.yo)s=I.yo.slice(0,-1);
      else{s=st;if(boot&&v.sc)s=chg(st,v.sc);else if(cls==='ir'&&v.sc)s=chg2(st)}
      if(cls==='ar'){if(/c$/.test(s))s=s.slice(0,-1)+'qu';else if(/g$/.test(s))s+='u';else if(/z$/.test(s))s=s.slice(0,-1)+'c'}
      return s+T6(SUBJ_END[cls==='ar'?'ar':'er'])[p]}
    case'simpf':{const b=vf(v,'pret',5).slice(0,-3);return(p===3?accLast(b):b)+T6('ra ras ra ramos rais ran')[p]}
  }
  return'';
}
const ger=v=>{const I=v.irr||{};if(I.ger)return I.ger;if(v.cls==='ar')return v.stem+'ando';if(/[aeo]$/.test(v.stem))return v.stem+'yendo';return(v.cls==='ir'&&v.sc?chg2(v.stem):v.stem)+'iendo'};
const ppl=v=>{const I=v.irr||{};if(I.pp)return I.pp;if(v.cls==='ar')return v.stem+'ado';if(/[aeo]$/.test(v.stem))return v.stem+'ído';return v.stem+'ido'};
const HAB={perf:'pres',plup:'impf',futp:'fut',condp:'cond',sperf:'spres',splup:'simpf'};
const REFL=T6('me te se nos os se');
/* the full verb phrase (one string, may be two words): any tense, including compound ones and the progressive */
function vphrase(v,t,p){
  if(HAB[t])return vf(vb('haber'),HAB[t],p)+' '+ppl(v);
  if(t==='prog')return vf(vb('estar'),'pres',p)+' '+ger(v);
  if(t==='ira')return vf(vb('ir'),'pres',p)+' a '+v.base;
  return vf(v,t,p);
}
const SIMPLE=['pres','pret','impf','fut','cond','spres','simpf'];
const vforms=v=>SIMPLE.flatMap(t=>[0,1,2,3,4,5].map(p=>vf(v,t,p)));
const SCV={ie:'(ie)',ue:'(ue)',i:'(i, i)',u:'(ue)'};
function verbV(v){
  const e=v.e.replace('$P','one’s');let tag='';
  if(v.irr&&!['escribir','abrir','romper','volver','conocer'].includes(v.base))tag=' (irreg.)';
  else if(v.sc)tag=' '+(v.cls==='ir'&&v.sc==='ue'?'(ue, u)':v.cls==='ir'&&v.sc==='ie'?'(ie, i)':SCV[v.sc]);
  else if(v.base==='conocer')tag=' (-zco)';
  const extra=v.base==='lavar'&&v.refl?' las manos':v.base==='cepillar'?' los dientes':'';
  return`${v.inf}${extra}${tag} : to ${v.base==='poder'?'be able to, can':e}`;
}

/* ---------- English verb phrases ---------- */
function s3(b){const[w,...r]=b.split(' ');const x=w==='have'?'has':w==='be'?'is':/(s|sh|ch|x|o|z)$/.test(w)?w+'es':/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':w+'s';return[x,...r].join(' ')}
const BE=['am','are','is','are','are','are'],WAS=['was','were','was','were','were','were'];
const POSS_E=['my','your','his','our','your','their'];
function fixP(s,ep,g){return s.replace(/\$P/g,ep===2?(g==='f'?'her':'his'):POSS_E[ep])}
/* every acceptable English verb phrase for a tense (first = the model answer). ep: 0 I, 1 you, 2 he/she/it, 3 we, 4 you all, 5 they */
function ev(v,t,ep,neg,g){
  const b=v.e,s=ep===2,be=BE[ep],was=WAS[ep],has=s?'has':'have',dO=s?'does':'do',pp=v.pp,ing=v.ing,P=a=>a.map(x=>fixP(x,ep,g));
  if(v.base==='ser'||v.base==='estar')return P(evBe(t,ep,neg));
  const X={
    pres:neg?[`${dO} not ${b}`,`${be} not ${ing}`]:[s?s3(b):b,`${be} ${ing}`,`${dO} ${b}`],
    prog:neg?[`${be} not ${ing}`]:[`${be} ${ing}`],
    pret:neg?[`did not ${b}`]:[v.past,`did ${b}`],
    impf:neg?[`did not use to ${b}`,`used to not ${b}`,`${was} not ${ing}`,`did not ${b}`,`would not ${b}`]:[`used to ${b}`,`${was} ${ing}`,v.past,`would ${b}`],
    fut:neg?[`will not ${b}`,`${be} not going to ${b}`]:[`will ${b}`,`${be} going to ${b}`,`shall ${b}`],
    cond:neg?[`would not ${b}`]:[`would ${b}`],
    perf:neg?[`${has} not ${pp}`]:[`${has} ${pp}`],
    plup:neg?[`had not ${pp}`]:[`had ${pp}`],
    futp:neg?[`will not have ${pp}`]:[`will have ${pp}`],
    condp:neg?[`would not have ${pp}`]:[`would have ${pp}`],
    ira:neg?[`${be} not going to ${b}`,`will not ${b}`]:[`${be} going to ${b}`,`will ${b}`]
  }[t]||[b];
  return P(X);
}
function evBe(t,ep,neg){
  const be=BE[ep],was=WAS[ep],n=neg?' not':'',has=ep===2?'has':'have';
  return{pres:[be+n],prog:[`${be}${n} being`],pret:[was+n],impf:[was+n,...(neg?[]:['used to be'])],fut:[`will${n} be`],cond:[`would${n} be`],perf:[`${has}${n} been`],plup:[`had${n} been`],ira:[`${be}${n} going to be`,`will${n} be`]}[t]||[be+n];
}
/* question order: [helper, rest of verb] */
function evQ(v,t,ep,g){
  const b=v.e,s=ep===2,be=BE[ep],was=WAS[ep],P=a=>a.map(([x,y])=>[x,fixP(y,ep,g)]);
  if(v.base==='ser'||v.base==='estar')return{pres:[[be,'']],pret:[[was,'']],impf:[[was,'']],fut:[['will','be']],cond:[['would','be']],perf:[[s?'has':'have','been']]}[t]||[[be,'']];
  return P({pres:[[s?'does':'do',b],[be,v.ing]],prog:[[be,v.ing]],pret:[['did',b]],impf:[['did','use to '+b],[was,v.ing]],fut:[['will',b],[be,'going to '+b]],cond:[['would',b]],perf:[[s?'has':'have',v.pp]],plup:[['had',v.pp]],ira:[[be,'going to '+b],['will',b]]}[t]||[[s?'does':'do',b]]);
}

/* ---------- nouns ---------- */
/* singular|plural|gender|english|english plural|tags|flags   tags: p person, k family, a animal, w written, o opens, s school, h homework, c building, l outdoor place, f food, d drink, t thing, i instrument, m music, v something to watch, g sport, q problem, b hand   flags: S usually singular, T surprising gender, N no article in English */
const NOUNS=`chico|chicos|m|boy|boys|p
chica|chicas|f|girl|girls|p
hombre|hombres|m|man|men|p
mujer|mujeres|f|woman|women|p
amigo|amigos|m|friend|friends|p
amiga|amigas|f|friend (f.)|friends (f.)|p
hermano|hermanos|m|brother|brothers|pk
hermana|hermanas|f|sister|sisters|pk
primo|primos|m|cousin|cousins|pk
prima|primas|f|cousin (f.)|cousins (f.)|pk
abuelo|abuelos|m|grandfather|grandfathers|pk|S
abuela|abuelas|f|grandmother|grandmothers|pk
padre|padres|m|father|fathers|pk|S
madre|madres|f|mother|mothers|pk|S
hijo|hijos|m|son|sons|pk|S
hija|hijas|f|daughter|daughters|pk
profesor|profesores|m|teacher|teachers|p
profesora|profesoras|f|teacher (f.)|teachers (f.)|p
estudiante|estudiantes|m|student|students|p
vecino|vecinos|m|neighbor|neighbors|p
vecina|vecinas|f|neighbor (f.)|neighbors (f.)|p
niño|niños|m|child|children|p
perro|perros|m|dog|dogs|a
gato|gatos|m|cat|cats|a
pájaro|pájaros|m|bird|birds|a
libro|libros|m|book|books|wo
carta|cartas|f|letter|letters|w
revista|revistas|f|magazine|magazines|w
periódico|periódicos|m|newspaper|newspapers|w
lección|lecciones|f|lesson|lessons|sy
examen|exámenes|m|test|tests|s
tarea|tareas|f|homework|homework|h|S
clase|clases|f|class|classes|sy
casa|casas|f|house|houses|c
escuela|escuelas|f|school|schools|c
biblioteca|bibliotecas|f|library|libraries|c
tienda|tiendas|f|store|stores|c
mercado|mercados|m|market|markets|c
museo|museos|m|museum|museums|c
restaurante|restaurantes|m|restaurant|restaurants|c
cine|cines|m|movie theater|movie theaters|c
parque|parques|m|park|parks|l
playa|playas|f|beach|beaches|l
ciudad|ciudades|f|city|cities|l
plaza|plazas|f|square|squares|l
banco|bancos|m|bank|banks|c
farmacia|farmacias|f|pharmacy|pharmacies|c
supermercado|supermercados|m|supermarket|supermarkets|c
gimnasio|gimnasios|m|gym|gyms|c
laboratorio|laboratorios|m|lab|labs|c
teatro|teatros|m|theater|theaters|c
cafetería|cafeterías|f|cafeteria|cafeterias|c
manzana|manzanas|f|apple|apples|f
pan|panes|m|bread|bread|f|S
queso|quesos|m|cheese|cheese|f|S
pastel|pasteles|m|cake|cakes|f
sopa|sopas|f|soup|soups|f
pizza|pizzas|f|pizza|pizzas|f
galleta|galletas|f|cookie|cookies|f
hamburguesa|hamburguesas|f|hamburger|hamburgers|f
ensalada|ensaladas|f|salad|salads|f
empanada|empanadas|f|empanada|empanadas|f
helado|helados|m|ice cream|ice cream|f|S
pollo|pollos|m|chicken|chicken|f|S
fruta|frutas|f|fruit|fruit|f|S
café|cafés|m|coffee|coffee|d|S
leche|leches|f|milk|milk|d|S
jugo|jugos|m|juice|juice|d|S
mesa|mesas|f|table|tables|t
silla|sillas|f|chair|chairs|t
computadora|computadoras|f|computer|computers|t
teléfono|teléfonos|m|phone|phones|t
mochila|mochilas|f|backpack|backpacks|t
lápiz|lápices|m|pencil|pencils|t
regalo|regalos|m|gift|gifts|t
camisa|camisas|f|shirt|shirts|tr
coche|coches|m|car|cars|tz
pregunta|preguntas|f|question|questions|q
informe|informes|m|report|reports|wh
proyecto|proyectos|m|project|projects|h
palabra|palabras|f|word|words|w
carpeta|carpetas|f|folder|folders|t
grapadora|grapadoras|f|stapler|staplers|t
toalla|toallas|f|towel|towels|t
cepillo|cepillos|m|brush|brushes|t
peine|peines|m|comb|combs|t
sello|sellos|m|stamp|stamps|t
raqueta|raquetas|f|racket|rackets|t
chaqueta|chaquetas|f|jacket|jackets|tr
falda|faldas|f|skirt|skirts|tr
vestido|vestidos|m|dress|dresses|tr
suéter|suéteres|m|sweater|sweaters|tr
abrigo|abrigos|m|coat|coats|tr
sombrero|sombreros|m|hat|hats|tr
zapato|zapatos|m|shoe|shoes|tr
bota|botas|f|boot|boots|tr
blusa|blusas|f|blouse|blouses|tr
camiseta|camisetas|f|T-shirt|T-shirts|tr
corbata|corbatas|f|tie|ties|tr
bufanda|bufandas|f|scarf|scarves|tr
calcetín|calcetines|m|sock|socks|tr
cinturón|cinturones|m|belt|belts|tr
gorra|gorras|f|cap|caps|tr
pelota|pelotas|f|ball|balls|t
puerta|puertas|f|door|doors|o
ventana|ventanas|f|window|windows|o
dinero|dineros|m|money|money|$|S
guitarra|guitarras|f|guitar|guitars|i
piano|pianos|m|piano|pianos|i
canción|canciones|f|song|songs|mu
música|músicas|f|music|music|m|S
película|películas|f|movie|movies|v
fútbol|fútbol|m|soccer|soccer|g|SN
béisbol|béisbol|m|baseball|baseball|g|SN
básquetbol|básquetbol|m|basketball|basketball|g|SN
día|días|m|day|days|x|T
mapa|mapas|m|map|maps|t|T
problema|problemas|m|problem|problems|qx|T
programa|programas|m|show|shows|v|T
mano|manos|f|hand|hands|b|T
foto|fotos|f|photo|photos|t|T
radio|radios|f|radio|radios|m|TS
idioma|idiomas|m|language|languages|sy|T`.split('\n').map(l=>{const[es,pl,g,e,ep,tag,fl='']=l.split('|');return{es,pl,g,e,ep,tag,sgOnly:fl.includes('S'),tricky:fl.includes('T'),bare:fl.includes('N')}});
const NAMES=`Juan|m
María|f
Carlos|m
Ana|f
Luis|m
Sofía|f
Diego|m
Elena|f
Pablo|m
Lucía|f`.split('\n').map(l=>{const[es,g]=l.split('|');return{es,pl:es,g,e:es,ep:es,tag:'pn',name:true,sgOnly:true}});
const PLACES=['México','España','Madrid','Bogotá','Lima','Puerto Rico','Buenos Aires','Chile'].map(x=>({es:x,e:{México:'Mexico',España:'Spain',Bogotá:'Bogota'}[x]||x}));
const ALLN=[...NOUNS,...NAMES];
const nn=x=>ALLN.find(n=>n.es===x);
const PEOPLE=ALLN.filter(n=>n.tag.includes('p'));
const nounV=n=>n.name?`${n.es} : ${n.e}`:`${n.g==='m'?'el':'la'} ${n.es}${n.pl!==n.es&&!/s$/.test(n.pl.slice(n.es.length))||n.pl.length-n.es.length>2||stripA(n.pl).slice(0,n.es.length)!==stripA(n.es)?` (pl. ${n.pl})`:''} : ${n.e}`;
const aAn=w=>/^[aeiou]/i.test(w)&&!/^(uni|use|eu)/i.test(w)?'an':'a';

/* ---------- adjectives ---------- */
/* masculine|english|tags|s (characteristic: ser) or e (condition: estar)|comparative|superlative */
const ADJ=`alto|tall|p|s|taller|tallest
bajo|short|p|s|shorter|shortest
simpático|nice|p|s|nicer|nicest
antipático|mean|p|s|meaner|meanest
inteligente|smart|p|s|smarter|smartest
trabajador|hard-working|p|s|more hard-working|most hard-working
perezoso|lazy|p|s|lazier|laziest
divertido|fun|pv|s|more fun|most fun
aburrido|boring|vsw|s|more boring|most boring
guapo|good-looking|p|s|better-looking|best-looking
bonito|pretty|tclo|s|prettier|prettiest
cansado|tired|p|e|more tired|most tired
contento|happy|p|e|happier|happiest
enfermo|sick|p|e|sicker|sickest
nervioso|nervous|p|e|more nervous|most nervous
ocupado|busy|p|e|busier|busiest
enojado|angry|p|e|angrier|angriest
triste|sad|p|e|sadder|saddest
nuevo|new|tcwio|s|newer|newest
viejo|old|tcwa|s|older|oldest
grande|big|tclao|s|bigger|biggest
pequeño|small|tclao|s|smaller|smallest
rojo|red|t|s|redder|reddest
azul|blue|to|s|bluer|bluest
verde|green|t|s|greener|greenest
blanco|white|tao|s|whiter|whitest
negro|black|ta|s|blacker|blackest
amarillo|yellow|t|s|yellower|yellowest
anaranjado|orange|t|s|more orange|most orange
morado|purple|t|s|more purple|most purple
rosado|pink|t|s|pinker|pinkest
gris|gray|t|s|grayer|grayest
famoso|famous|p|s|more famous|most famous
generoso|generous|p|s|more generous|most generous
responsable|responsible|p|s|more responsible|most responsible
popular|popular|pv|s|more popular|most popular
cómico|funny|pv|s|funnier|funniest
atlético|athletic|p|s|more athletic|most athletic
elegante|elegant|pr|s|more elegant|most elegant
cómodo|comfortable|r|s|more comfortable|most comfortable
furioso|furious|p|e|more furious|most furious
delicioso|delicious|f|s|more delicious|most delicious
caro|expensive|tfcw|s|more expensive|most expensive
barato|cheap|tfw|s|cheaper|cheapest
interesante|interesting|wvs|s|more interesting|most interesting
difícil|difficult|s|s|more difficult|most difficult
fácil|easy|s|s|easier|easiest
largo|long|xwvs|s|longer|longest
importante|important|xqs|s|more important|most important`.split('\n').map(l=>{const[m,e,tags,kind,ce,se]=l.split('|');
  let f=m,mp,fp;if(/o$/.test(m)){f=m.slice(0,-1)+'a';mp=m+'s';fp=f+'s'}else if(/or$/.test(m)){f=m+'a';mp=m+'es';fp=f+'s'}else if(/e$/.test(m)){mp=m+'s';fp=mp}else{mp=m+'es';fp=mp}
  return{m,f,mp,fp,e,tags,kind,ce,se}});
const adjF=(a,g,k)=>k?(g==='f'?a.fp:a.mp):(g==='f'?a.f:a.m);
const adjV=a=>(a.m===a.f?a.m:/o$/.test(a.m)?`${a.m}, -a`:`${a.m}, -a`)+' : '+a.e;
const adjTok=(a,g,k,cid='adj',both)=>{const t={la:adjF(a,g,k),lemma:a.m,cids:[cid],concept:`adjective, ${GN[g]} ${k?'plural':'singular'}`,forms:[a.m,a.f,a.mp,a.fp],vocab:adjV(a)};if(both&&a.m!==a.f)t.alt=[adjF(a,g==='f'?'m':'f',k)];return t};
const fitsN=(a,n)=>[...n.tag].some(c=>a.tags.includes(c==='k'||c==='n'?'p':c));
const adjFor=(n,kind)=>{const c=ADJ.filter(a=>fitsN(a,n)&&(!kind||a.kind===kind));return c.length?R(c):null};

/* ---------- determiners and pronouns ---------- */
const POSS=[['mi','mis','my'],['tu','tus','your'],['su','sus','his'],['nuestro','nuestros','our'],['vuestro','vuestros','your'],['su','sus','their']];
const DEMO=[['este','esta','estos','estas','this','these','este, esta : this'],['ese','esa','esos','esas','that','those','ese, esa : that'],['aquel','aquella','aquellos','aquellas','that','those','aquel, aquella : that (over there)']];
const SUBJS=[
 {es:'yo',en:'I',eo:'me',p:0,ep:0},{es:'tú',en:'you',eo:'you',p:1,ep:1},
 {es:'él',en:'he',eo:'him',p:2,ep:2,g:'m'},{es:'ella',en:'she',eo:'her',p:2,ep:2,g:'f'},
 {es:'usted',en:'you (formal)',eo:'you (formal)',p:2,ep:1,formal:1},
 {es:'nosotros',en:'we',eo:'us',p:3,ep:3,alt:['nosotras']},{es:'vosotros',en:'you all',eo:'you all',p:4,ep:4,alt:['vosotras'],vos:1},
 {es:'ustedes',en:'you all',eo:'you all',p:5,ep:4},{es:'ellos',en:'they',eo:'them',p:5,ep:5,g:'m',alt:['ellas']},{es:'ellas',en:'they',eo:'them',p:5,ep:5,g:'f',alt:['ellos']}];
const SUBJV={'you all':['you all','you',"y'all",'you guys'],'you (formal)':['you (formal)','you']};
const DOP={m:['lo','los'],f:['la','las']},IOP=T6('me te le nos os les'),IOE=['me','you','him','us','you all','them'];
const W=(la,vocab,cids,concept)=>({la,lemma:la,cids:cids||[],concept:concept||'',forms:[],vocab:vocab||null});
const SMALL={a:'a : to',en:'en : in, on, at',de:'de : of, from',con:'con : with',no:'no : not',que:'que : that, which, who',y:'y : and',si:'si : if',para:'para : for, in order to',por:'por : through, for, by'};
const SW=(la,cids)=>W(la,SMALL[la]||null,cids);

/* noun phrase. o: det def|indef|poss|demo|none, pp possessor 0-5, pg possessor gender, dd 0-2, adj, cid, both (adjective may be either gender) */
function np(n,k,o={}){
  if(n.sgOnly)k=0;if(o.adj==='auto')o=Object.assign({},o,{adj:adjFor(n)});
  const g=n.g,toks=[],det=n.bare?'def':(n.sgOnly&&o.det==='indef')?'def':(o.det||'def'),noun={la:k?n.pl:n.es,lemma:n.es,cids:[o.cid||'noun'],concept:`noun, ${GN[g]} ${k?'plural':'singular'}`,forms:[n.es,n.pl],vocab:nounV(n),n};
  let en=[];const eN=k?n.ep:n.e,ad=o.adj?o.adj.e+' ':'';
  if(n.name){toks.push(noun);en=[n.e]}
  else{
    if(det==='def'){toks.push({la:k?(g==='m'?'los':'las'):(g==='m'?'el':'la'),lemma:'el',cids:['art'],concept:`definite article, ${GN[g]} ${k?'plural':'singular'}`,forms:['el','la','los','las'],vocab:null});en=n.bare?[ad+eN]:['the '+ad+eN]}
    else if(det==='indef'){toks.push({la:k?(g==='m'?'unos':'unas'):(g==='m'?'un':'una'),lemma:'un',cids:['art'],concept:`indefinite article, ${GN[g]} ${k?'plural':'singular'}`,forms:['un','una','unos','unas'],vocab:null});en=k?['some '+ad+eN,ad+eN]:[aAn(ad+eN)+' '+ad+eN]}
    else if(det==='poss'){const P=POSS[o.pp];let la=k?P[1]:P[0];if(o.pp===3||o.pp===4)la=la.replace(/o(s?)$/,(g==='f'?'a':'o')+'$1');
      toks.push({la,lemma:P[0],cids:['poss'],concept:'possessive adjective',forms:[P[0],P[1]],vocab:{0:'mi, mis : my',1:'tu, tus : your',2:'su, sus : his, her, its, your (formal), their',3:'nuestro, -a : our',4:'vuestro, -a : your (all)',5:'su, sus : his, her, its, your (formal), their'}[o.pp]});
      const pe=o.pp===2?(o.pg==='f'?'her':o.pg==='u'?'your':'his'):o.pp===4?'your':POSS[o.pp][2];
      en=[pe+' '+ad+eN];if(o.pp===2||o.pp===5)en.push(...['his','her','their','your','its'].filter(x=>x!==pe).map(x=>x+' '+ad+eN))}
    else if(det==='demo'){const D=DEMO[o.dd||0];toks.push({la:D[(k?2:0)+(g==='f'?1:0)],lemma:D[0],cids:['demo'],concept:'demonstrative adjective',forms:D.slice(0,4),vocab:D[6],alt:o.dd===1?[DEMO[2][(k?2:0)+(g==='f'?1:0)]]:o.dd===2?[DEMO[1][(k?2:0)+(g==='f'?1:0)]]:null});
      en=[D[k?5:4]+' '+ad+eN+(o.dd===2?' over there':''),D[k?5:4]+' '+ad+eN]}
    else en=[ad+eN];
    toks.push(noun);
  }
  if(o.adj)toks.push(adjTok(o.adj,g,k,o.adjCid||'adj'));
  return{toks,en,g,k,n,p:k?5:2,ep:k?5:2,person:n.tag.includes('p')||n.tag.includes('a'),
    dop:DOP[g][k],doE:n.tag.includes('p')?(k?'them':g==='f'?'her':'him'):(k?'them':'it'),eo:en};
}
const num=n=>n.sgOnly?0:(chance(.4)?1:0);
const pick=(arr,ex=[])=>{const c=arr.filter(x=>!ex.includes(x));return c.length?R(c):null};
const tidy=s=>s.replace(/\s+/g,' ').replace(/ ,/g,',').replace(/,+/g,',').replace(/^[, ]+|[, ]+$/g,'').trim();
function cross(...parts){let out=[''];for(const p of parts){const a=Array.isArray(p)?p:[p];out=out.flatMap(x=>a.map(y=>x+' '+y));if(out.length>240)out=out.slice(0,240)}return[...new Set(out.map(tidy))]}
/* a subject: a pronoun (o.ps = which persons are allowed) or a noun phrase */
function subject(o={}){
  const used=o.used||[];
  if(o.kind==='pron'||(o.kind!=='noun'&&chance(o.pron==null?.5:o.pron))){
    let c=SUBJS.filter(s=>(!s.vos||VOS)&&(!s.formal||o.formal)&&(!o.ps||o.ps.includes(s.p)));if(!c.length)c=SUBJS.filter(s=>!s.vos&&!s.formal);
    const s=R(c),tok={la:s.es,lemma:s.es,cids:['subj'],concept:'subject pronoun',forms:[],vocab:null,opt:true,hide:[0,1,3,4].includes(s.p)&&!o.show&&chance(.6),alt:s.alt||null,pron:1};
    return{toks:[tok],en:SUBJV[s.en]||[s.en],eo:[s.eo],p:s.p,ep:s.ep,g:s.g||(chance(.5)?'m':'f'),gKnown:!!s.g&&s.p===2,pron:s,k:s.p>2?1:0};
  }
  const n=o.n||pick(o.pool||PEOPLE,used);used.push(n);const k=o.k!=null&&!n.sgOnly?o.k:num(n);
  const r=np(n,k,o.np||{});return Object.assign(r,{gKnown:true});
}
/* the verb token (a full phrase in one token, so pronouns can go in front of it) */
function vtok(v,t,p,o={}){
  const la=vphrase(v,t,p),tok={la,lemma:v.inf,cids:[...(o.cids||[]),t],concept:`${PERS[p]}, ${TN[t]}`,forms:vforms(v),vocab:verbV(v),vb:v,t,p};
  if(o.vos)tok.alt=[vphrase(v,t,4)];
  return tok;
}
/* clitics in Spanish order: reflexive, indirect, direct; le/les becomes se before lo/la */
function clitics(refl,io,dop){const a=[];if(refl!=null)a.push(refl);if(io!=null)a.push(dop&&/^l/.test(io)?'se':io);if(dop)a.push(dop);return a}
const clTok=(c,role)=>({la:c,lemma:c,cids:[role],concept:{refl:'reflexive pronoun',io:'indirect object pronoun',do:'direct object pronoun'}[role],forms:['me','te','se','nos','os','lo','la','los','las','le','les'],vocab:{refl:'me, te, se, nos, os : myself, yourself, himself …',io:'me, te, le, nos, os, les : (to) me, you, him/her …',do:'me, te, lo, la, nos, os, los, las : me, you, him/her/it …'}[role]});

const TIMEADV={pres:[['hoy','today'],['todos los días','every day'],['los sábados','on Saturdays']],prog:[['ahora','now'],['hoy','today']],pret:[['ayer','yesterday'],['anoche','last night'],['la semana pasada','last week'],['anteayer','the day before yesterday'],['el mes pasado','last month'],['el año pasado','last year'],['hace dos días','two days ago'],['el otro día','the other day'],['ayer por la tarde','yesterday afternoon']],
  impf:[['todos los días','every day'],['a menudo','often'],['los sábados','on Saturdays']],fut:[['mañana','tomorrow'],['la próxima semana','next week']],ira:[['mañana','tomorrow'],['esta noche','tonight']],perf:[['hoy','today'],['esta semana','this week']],cond:[]};
const MENTE=[['rápidamente','quickly'],['lentamente','slowly'],['fácilmente','easily'],['cuidadosamente','carefully'],['tranquilamente','calmly']];
const advTok=(es,en,cid='adv')=>({la:es,lemma:es,cids:[cid],concept:'adverb',forms:[],vocab:`${es} : ${en}`});
const objFor=v=>[...NOUNS,...NAMES].filter(n=>[...n.tag].some(c=>v.obj.includes(c==='k'||c==='n'?'p':c)));
const MV=VERBS.filter(v=>/M/.test(v.fl)),FROMV=VERBS.filter(v=>/F/.test(v.fl)),SV=VERBS.filter(v=>/S/.test(v.fl)&&!v.refl);
const TV=VERBS.filter(v=>v.fl.includes('T')),DV=VERBS.filter(v=>v.fl.includes('D')),RV=VERBS.filter(v=>v.refl&&v.fl.includes('R')&&!['alegrarse'].includes(v.inf));
const PLACE_IN=()=>NOUNS.filter(n=>/[cl]/.test(n.tag));
const HACER_DO={tarea:['do','did','done','doing']};
const IO_FOR=['comprar','preparar','hacer','cocinar'];
const PLACE_FOR={vivir:['casa','ciudad'],dormir:['casa'],nadar:['playa'],descansar:['casa','parque','playa'],almorzar:['restaurante','casa','escuela','parque'],trabajar:['tienda','restaurante','escuela','biblioteca','museo','mercado','ciudad'],estudiar:['biblioteca','casa','escuela'],bailar:['casa','plaza','escuela','restaurante'],cocinar:['casa','restaurante'],comer:['restaurante','casa','escuela','parque','playa']};
const IN_E={playa:['at','on'],escuela:['at','in'],casa:['at','in'],cine:['at','in']};

/* one clause. returns its Spanish pieces (S subject, CL clitics, V verb, A after the verb) and English pieces */
function clause(o={}){
  const t=o.t||'pres',used=o.used||[];
  let v=o.v;
  if(!v){let pool=o.pool||TV;if(o.need)pool=pool.filter(x=>[...o.need].every(f=>x.fl.includes(f)));if(o.obj!==false&&!o.pool&&o.need!=='M'&&o.need!=='S'&&o.need!=='F')pool=pool.filter(x=>x.obj);if(o.vf)pool=pool.filter(o.vf);v=R(pool)}
  const sb=o.subj||subject({used,ps:o.ps,kind:o.sk,pron:o.pron,k:o.k,formal:o.formal,np:o.subjNp,pool:o.subjPool,show:o.show});
  const p=sb.p,ep=sb.ep,A=[],rest=[];let dopla=null,iola=null,refl=v.refl?REFL[p]:null,ioPhrase=null,altA=null;
  let eV=null; // verb override for English (hacer la tarea = do homework)
  /* direct object */
  let ob=null;
  if(v.obj&&o.obj!==false&&v.fl.includes('T')){
    let pool=objFor(v).filter(n=>!used.includes(n)&&(!o.objTag||[...n.tag].some(c=>o.objTag.includes(c))));
    if(o.objPool){const fo=objFor(v);pool=o.objPool.filter(n=>!used.includes(n)&&fo.includes(n))}
    if(!pool.length)pool=objFor(v);
    const n=o.objN||R(pool);used.push(n);let k=o.ok!=null?o.ok:num(n);
    const det=o.objDet||(n.bare?'def':R(['def','def','indef','poss']));
    ob=np(n,k,Object.assign({det,pp:R([0,1,2,3,5]),pg:R(['m','f']),dd:R([0,1,2])},o.objNp||{}));
    if(v.base==='hacer'&&HACER_DO[n.es])eV=HACER_DO[n.es];
    const persA=ob.person&&v.base!=='tener';
    if(o.dop||o.io==='both'){dopla=ob.dop;rest.push([ob.doE])}
    else{
      if(n.tag==='g'&&v.base==='jugar'){A.push(SW('a',['jugara']));A.push(...ob.toks)}
      else if(persA){A.push(Object.assign(SW('a',['pera']),{vocab:'a (personal a) : marks a person or pet as the direct object',concept:'personal a'}));A.push(...ob.toks)}
      else A.push(...ob.toks);
      rest.push(ob.en);
    }
  }
  /* indirect object */
  if(o.io&&v.fl.includes('D')){
    let iop=o.io==='pron'||o.io==='both'?R([0,1,2,3,5].filter(x=>x!==p&&!(p===2&&x===2&&!sb.pron))):2;
    if(o.io==='noun'){const n=pick(PEOPLE,used);used.push(n);const ik=num(n),inp=np(n,ik,{det:R(['def','poss']),pp:R([0,1,3]),pg:'m'});iola=ik?'les':'le';
      const aTok=SW('a',['io']);aTok.concept='a before the indirect object';
      ioPhrase={toks:[aTok,...inp.toks],en:inp.en};}
    else{iola=IOP[iop];ioPhrase={en:[IOE[iop]==='him'?R(['him','her']):IOE[iop]]}}
    if(o.io==='both'&&ob){dopla=ob.dop}
  }
  /* English after-verb pieces */
  let eRest=[];
  const obE=ob?(dopla?[ob.doE]:ob.en):null;
  if(ioPhrase){
    const pr=IO_FOR.includes(v.base)?'for':'to';
    if(ioPhrase.toks){const ioE=ioPhrase.en;A.push(...ioPhrase.toks);altA=ob&&!dopla?[...ioPhrase.toks,...ob.toks]:null;
      eRest=obE?(dopla?cross(obE,pr,ioE):[...cross(obE,pr,ioE),...cross(ioE,obE)]):cross(pr,ioE)}
    else eRest=obE?(dopla?cross(obE,pr,ioPhrase.en):[...cross(ioPhrase.en,obE),...cross(obE,pr,ioPhrase.en)]):[...cross(pr,ioPhrase.en),ioPhrase.en[0]];
  }else if(obE)eRest=obE;
  /* place */
  let plE=null;
  if(o.place){
    const toward=v.fl.includes('M')&&(o.place==='to'||!v.fl.includes('F')),from=v.fl.includes('F')&&!toward;
    const allow=!toward&&!from&&PLACE_FOR[v.base];const n=pick(allow?allow.map(nn):PLACE_IN(),used)||nn('casa');used.push(n);const k=0,pn=np(n,k,{det:/^(casa|escuela)$/.test(n.es)?R(['def','poss']):R(['def','def','def','demo']),pp:R([0,1,3]),dd:R([0,1])});
    const pr=toward?'a':from?'de':'en';A.push(SW(pr,['place'+pr]),...pn.toks);
    const ep_=toward?(v.base==='llegar'?['at','in','to']:['to']):from?(v.base==='salir'?['','from']:['from']):(IN_E[n.es]||['in','at']);
    plE=cross(ep_,pn.en);
  }
  if(o.con){const n=pick(PEOPLE,used);used.push(n);const k=num(n),cn=np(n,k,{det:R(['def','poss']),pp:R([0,1,3])});A.push(SW('con',['con']),...cn.toks);plE=plE?cross(plE,'with',cn.en):cross('with',cn.en)}
  if(v.base==='poner'&&!o.place){const pl=np(nn(R(['mesa','silla'])),0,{det:'def'});A.push(SW('en',['placeen']),...pl.toks);plE=plE?cross(plE,'on',pl.en):cross('on',pl.en)}
  let advE=null,advT=null;
  if(o.adv){const L=o.adv==='mente'?MENTE:(TIMEADV[t]||[]);if(L.length){const[a,e]=R(L);advT=advTok(a,e,o.adv==='mente'?'mente':'adv');advE=e}}
  const vt=vtok(v,t,p,{cids:o.vcids,vos:sb.pron&&sb.pron.es==='ustedes'&&!VOS});
  const negT=o.neg?SW('no',['neg']):null;
  const clT=[];if(refl!=null)clT.push(clTok(refl,'refl'));if(iola!=null)clT.push(clTok(dopla&&/^l/.test(iola)?'se':iola,'io'));if(dopla)clT.push(clTok(dopla,'do'));
  if(v.base==='lavar'&&v.refl)A.unshift(Object.assign(W('las manos','las manos : hands',['refl'],'body part'),{}));
  if(v.base==='cepillar')A.unshift(W('los dientes','los dientes : teeth',['refl'],'body part'));
  const vE=eV?{e:eV[0],past:eV[1],pp:eV[2],ing:eV[3],base:'x'}:v;
  const eRestAll=[eRest.length?eRest:'',plE||''];
  return{v,vE,t,p,ep,g:sb.g,sb,ob,negT,clT,vt,A,altA,advT,advE,eRest:eRestAll,used,refl,dopla,iola};
}
/* Spanish statement order and English versions; returns {tokens, ens, altTokens} */
function stmtOf(c,o={}){
  const S0=c.sb.toks,base=[...S0,...(c.negT?[c.negT]:[]),...c.clT,c.vt];
  const tokens=[...base,...c.A,...(c.advT?[c.advT]:[])];
  const alts=[];
  if(c.altA)alts.push([...base,...c.altA,...(c.advT?[c.advT]:[])]);
  if(c.advT){alts.push([c.advT,...base,...c.A]);if(c.altA)alts.push([c.advT,...base,...c.altA])}
  if(o.attach&&c.clT.length&&/ /.test(c.vt.la)){ // progressive: estoy comiéndolo
    const[aux,main]=c.vt.la.split(' '),joined=attach(main,c.clT.map(x=>x.la).join(''));
    const vt2=Object.assign({},c.vt,{la:aux+' '+joined,alt:null});alts.push([...S0,...(c.negT?[c.negT]:[]),vt2,...c.A,...(c.advT?[c.advT]:[])]);}
  const vp=ev(c.vE,c.t,c.ep,!!c.negT,c.g);
  const subjE=c.sb.en;
  let ens=cross(subjE,vp,c.eRest[0],c.eRest[1],c.advE||'');
  if(c.advE)ens=[...ens,...cross(c.advE+',',subjE,vp,c.eRest[0],c.eRest[1])];
  return{tokens,ens,altTokens:alts};
}

/* ---------- finishing a sentence ---------- */
const contract=s=>s.replace(/(^|\s)([aA]) el(?=\s|$)/g,'$1$2l').replace(/(^|\s)([dD]e) el(?=\s|$)/g,'$1$2l');
const esJoin=ts=>contract(ts.filter(t=>!t.hide).map(t=>t.la+(t.post||'')).join(' '));
function S(tokens,ens,end='.',o={}){return Object.assign({tokens,en:ens[0],enAlt:ens.slice(1),end,altTokens:[]},o)}
const st=(c,o)=>{const r=stmtOf(c,o);return S(r.tokens,r.ens,'.',{altTokens:r.altTokens})};
const ACT=VERBS.filter(v=>/[TMFSR]/.test(v.fl)&&!['alegrarse','celebrar'].includes(v.inf));
const isRegPres=v=>!v.irr&&!v.sc&&!v.refl;
const isRegPret=v=>!v.irr&&!(v.cls==='ir'&&v.sc)&&!/[aeo]$/.test(v.stem)&&!v.refl;
/* any clause: picks a verb, then adds what that verb needs (a place for verbs of motion and activity) */
function anyC(o={}){
  const pool=(o.pool||ACT).filter(v=>!o.vf||o.vf(v));const v=o.v||R(pool.length?pool:ACT);
  const tr=v.fl.includes('T')&&o.obj!==false;
  const place=o.place!=null?o.place:(!tr&&!v.refl&&/[MFS]/.test(v.fl))||(tr&&v.fl.includes('S')&&chance(.2));
  return clause(Object.assign({},o,{v,place:place&&/[MFS]/.test(v.fl)?(o.place||true):false}));
}
const gC=o=>st(anyC(o),o);
const possO=()=>({det:'poss',pp:R([0,1,2,3,5]),pg:R(['m','f'])}),demoO=()=>({det:'demo',dd:R([0,1,2])});

/* ser and estar, with the use each one shows */
const JOBS=[['profesor','profesora','profesores','profesoras','teacher','teachers'],['médico','médica','médicos','médicas','doctor','doctors'],['estudiante','estudiante','estudiantes','estudiantes','student','students'],['abogado','abogada','abogados','abogadas','lawyer','lawyers'],['cocinero','cocinera','cocineros','cocineras','cook','cooks'],['enfermero','enfermera','enfermeros','enfermeras','nurse','nurses'],['cantante','cantante','cantantes','cantantes','singer','singers']];
const NUMS=['','una','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce'],NUMSE=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
function beTok(base,t,p,use){const v=vb(base),tok=vtok(v,t,p);tok.cids=[use,t];return tok}
function predSubj(o={}){const s=subject(Object.assign({pron:.45,np:{det:R(['def','def','poss','demo']),pp:R([0,1,3]),dd:R([0,1])}},o));return s}
function gSer(use,t){
  t=t||'pres';use=use||R(['serDesc','serDesc','serOcc','serOrig','serTime','serRel']);
  if(use==='serTime'){const h=R([1,2,3,4,5,6,7,8,9,10,11,12]),half=chance(.3),pl=h>1,tt=t==='pres'?'pres':'impf';
    const tok=beTok('ser',tt,pl?5:2,'serTime');
    const toks=[tok,W(pl?'las':'la'),W(NUMS[h],`${NUMS[h]} : ${NUMSE[h]}`),...(half?[W('y'),W('media','y media : thirty, half past')]:[])];
    const is=tt==='pres'?'it is':'it was',e=half?[`${is} ${NUMSE[h]} thirty`,`${is} half past ${NUMSE[h]}`,`${is} ${NUMSE[h]}-thirty`]:[`${is} ${NUMSE[h]} o'clock`,`${is} ${NUMSE[h]}`];
    return S(toks,[...e,...e.map(x=>x.replace(/^it is/,"it's"))])}
  const s=use==='serRel'?subject({kind:'noun',pool:NAMES}):predSubj({pool:use==='serDesc'?ALLN.filter(n=>n.tag&&n.tag!=='h'):PEOPLE,ps:[0,1,2,3,5]});
  const tok=beTok('ser',t,s.p,use),be=evBe(t,s.ep,false),A=[];let rest;
  if(use==='serDesc'){const n=s.n||{tag:'p'},a=adjFor(n,'s')||R(ADJ.filter(x=>x.kind==='s'&&x.tags.includes('p')));A.push(adjTok(a,s.g,s.k,'adj',!s.gKnown));rest=a.e}
  else if(use==='serOcc'){const j=R(JOBS),f=s.g==='f';const jt={la:s.k?j[f?3:2]:j[f?1:0],lemma:j[0],cids:['job'],concept:'noun (no article after ser)',forms:j.slice(0,4),vocab:`${j[0]}${j[1]!==j[0]?', '+j[1]:''} : ${j[4]}`};if(!s.gKnown&&j[1]!==j[0])jt.alt=[s.k?j[f?2:3]:j[f?0:1]];A.push(jt);rest=s.k?j[5]:aAn(j[4])+' '+j[4]}
  else if(use==='serOrig'){const pl=R(PLACES);A.push(SW('de'),W(pl.es,`${pl.es} : ${pl.e}`));rest='from '+pl.e}
  else{const fam=R(NOUNS.filter(n=>n.tag==='pk'&&n.g===s.g)),pp=R([0,1,3]),f=np(fam,0,{det:'poss',pp});A.push(...f.toks);rest=f.en}
  return S([...s.toks,tok,...A],cross(s.en,be,rest))
}
const ESTAR_PLACE=()=>R([...PLACE_IN(),nn('mesa'),nn('silla'),nn('mochila')]);
function gEstar(use,t){
  t=t||'pres';use=use||R(['estLoc','estLoc','estCond','estCond','estProg']);
  if(use==='estProg')return gC({t:'prog',vcids:['estProg'],adv:chance(.3)?'time':null});
  if(use==='estLoc'){const s=predSubj({pool:ALLN.filter(n=>/[ptwaif]/.test(n.tag)&&!n.bare)}),tok=beTok('estar',t,s.p,'estLoc'),pl=ESTAR_PLACE(),pn=np(pl,0,{det:R(['def','def','poss']),pp:R([0,1,3])});
    const on=/^(mesa|silla)$/.test(pl.es);return S([...s.toks,tok,SW('en'),...pn.toks],cross(s.en,evBe(t,s.ep),on?['on','in']:(IN_E[pl.es]||['in','at']),pn.en))}
  const s=predSubj({pool:PEOPLE}),tok=beTok('estar',t,s.p,'estCond'),a=R(ADJ.filter(x=>x.kind==='e'));
  return S([...s.toks,tok,adjTok(a,s.g,s.k,'adj',!s.gKnown)],cross(s.en,evBe(t,s.ep),a.e))
}
/* tener */
const TENER_X=[['hambre','hungry'],['sed','thirsty'],['frío','cold'],['calor','hot'],['sueño','sleepy'],['miedo','afraid'],['prisa','in a hurry']];
function gTener(){
  const r=R([0,1,2]);
  if(r===0)return gC({v:vb('tener'),objDet:R(['indef','indef','def','poss'])});
  if(r===1)return gModal({mods:['tenerque']});
  const s=predSubj({pool:PEOPLE}),tok=vtok(vb('tener'),'pres',s.p);
  if(chance(.3)){const n=R([8,10,12,15,16,17,40]),w={8:'ocho',10:'diez',12:'doce',15:'quince',16:'dieciséis',17:'diecisiete',40:'cuarenta'}[n];
    return S([...s.toks,tok,W(w,`${w} : ${n}`),W('años','el año : year')],cross(s.en,BE[s.ep],[`${n} years old`,`${n}`]))}
  const[x,e]=R(TENER_X);return S([...s.toks,tok,W(x,`tener ${x} : to be ${e}`)],cross(s.en,BE[s.ep],e))
}
/* verb + infinitive */
function modalE(m,t,ep,neg){
  const s=ep===2,be=BE[ep],was=WAS[ep],dO=s?'does':'do',n=neg;
  const T={querer:{pres:n?[`${dO} not want to`]:[s?'wants to':'want to'],pret:n?['did not want to']:['wanted to'],impf:n?['did not want to']:['wanted to','used to want to'],fut:n?['will not want to']:['will want to']},
    poder:{pres:n?['cannot',`${be} not able to`]:['can',`${be} able to`],pret:n?['could not',`${was} not able to`]:['could',`${was} able to`,'managed to'],impf:n?['could not',`${was} not able to`]:['could',`${was} able to`],fut:n?['will not be able to']:['will be able to'],cond:n?['could not','would not be able to']:['could','would be able to']},
    necesitar:{pres:n?[`${dO} not need to`]:[s?'needs to':'need to'],pret:n?['did not need to']:['needed to'],impf:n?['did not need to']:['needed to'],fut:n?['will not need to']:['will need to']},
    deber:{pres:n?['should not','must not']:['should','must','ought to'],cond:n?['should not']:['should','ought to']},
    preferir:{pres:n?[`${dO} not prefer to`]:[s?'prefers to':'prefer to',"would rather"],pret:n?['did not prefer to']:['preferred to']},
    tenerque:{pres:n?[`${dO} not have to`]:[s?'has to':'have to','must'],pret:n?['did not have to']:['had to'],impf:n?['did not have to']:['had to'],fut:n?['will not have to']:['will have to']},
    ira:{pres:n?[`${be} not going to`,'will not']:[`${be} going to`,'will'],impf:n?[`${was} not going to`]:[`${was} going to`]}};
  return(T[m][t]||T[m].pres);
}
const MODV={querer:'querer',poder:'poder',necesitar:'necesitar',deber:'deber',preferir:'preferir',tenerque:'tener',ira:'ir'};
function gModal(o={}){
  const m=R(o.mods||['querer','poder','necesitar','deber','preferir','tenerque']),tense=o.t&&modalE(m,o.t,0,false)!==modalE(m,'pres',0,false)?o.t:'pres';
  const c=o.c||anyC(Object.assign({},o.co||{},{t:'pres',pool:(o.co&&o.co.pool)||ACT.filter(v=>v.base!=='ir'||m!=='ira')}));
  const mv=vb(MODV[m]),mt=vtok(mv,tense,c.p,{cids:[m==='ira'?'ira':'modal']});
  if(m==='deber')mt.vocab='deber : should, ought to, must';if(m==='poder')mt.vocab='poder (ue) : can, to be able to';
  const link=m==='tenerque'?[Object.assign(SW('que'),{vocab:'tener que (+ infinitive) : to have to'})]:m==='ira'?[Object.assign(SW('a'),{vocab:'ir a (+ infinitive) : to be going to'})]:[];
  const cl=c.clT.map(x=>x.la).join(''),inf={la:c.v.refl?attach(c.v.base,REFL[c.p]):attach(c.v.base,c.v.refl?'':cl),lemma:c.v.inf,cids:['inf'],concept:'infinitive',forms:[c.v.base],vocab:verbV(c.v)};
  const infPlain={la:c.v.base,lemma:c.v.inf,cids:['inf'],concept:'infinitive',forms:[c.v.base],vocab:verbV(c.v)};
  const S0=c.sb.toks,ng=c.negT?[c.negT]:[],adv=c.advT?[c.advT]:[];
  const tokens=[...S0,...ng,mt,...link,inf,...c.A,...adv];
  const altTokens=c.clT.length?[[...S0,...ng,...c.clT,mt,...link,infPlain,...c.A,...adv]]:[];
  if(c.altA)altTokens.push([...S0,...ng,mt,...link,inf,...c.altA,...adv]);
  if(c.advT)altTokens.push([c.advT,...S0,...ng,mt,...link,inf,...c.A]);
  const base=fixP(c.vE.e,c.ep,c.g);
  let ens=cross(c.sb.en,modalE(m,tense,c.ep,!!c.negT),base,c.eRest[0],c.eRest[1],c.advE||'');
  if(m==='preferir')ens=ens.map(e=>e.replace('would rather '+base.split(' ')[0]+' to',''));
  return S(tokens,ens,'.',{altTokens});
}
function gIr(){return chance(.5)?gC({v:vb('ir'),place:'to',adv:chance(.4)?'time':null}):gModal({mods:['ira'],co:{adv:chance(.4)?'time':null}})}
/* gustar and verbs like it */
const BODY=[['cabeza','f','head','heads'],['estómago','m','stomach','stomachs'],['mano','f','hand','hands'],['pie','m','foot','feet']];
const PREP_PRON=T6('mí ti él nosotros vosotros ellos');
function gGustar(verbs){
  const vbase=R(verbs||['gustar']),v=vb(vbase),pE=R([0,1,2,2,3,5]),noun=pE===2&&chance(.5);
  let who,whoE,whoEp=pE,whoG=R(['m','f']),aPh=[],show=false;
  if(noun){const n=R(PEOPLE),k=num(n),w=np(n,k,{det:R(['def','poss']),pp:R([0,1,3])});who=w;whoE=w.en;whoEp=k?5:2;
    aPh=[Object.assign(SW('a',['gustA']),{concept:'a + the person who likes it'}),...w.toks];}
  else{const pp=pE===2?(whoG==='f'?'ella':'él'):pE===5?(whoG==='f'?'ellas':'ellos'):PREP_PRON[pE];whoE=[[...['I','you','he','we','you all','they']][pE]==='he'?(whoG==='f'?'she':'he'):['I','you','he','we','you all','they'][pE]];
    show=pE===2||pE===5;aPh=[Object.assign(SW('a',['gustA']),{opt:!show,hide:!show}),{la:pp,lemma:pp,cids:['gustA'],concept:'pronoun after a preposition',forms:[],vocab:null,opt:!show,hide:!show}];}
  const ioc=noun?(whoEp===5?'les':'le'):IOP[pE];
  let thing,thingE,k=0,isInf=false,toks2=[];
  if(vbase==='doler'){const b=R(BODY);k=chance(.3)?1:0;thing=np({es:b[0],pl:b[0]+(b[0]==='pie'?'s':'s'),g:b[1],e:b[2],ep:b[3],tag:'b'},k,{det:'def'});toks2=thing.toks;}
  else if(['gustar','encantar'].includes(vbase)&&chance(.35)){isInf=true;const iv=R(['nadar','bailar','cantar','cocinar','leer','viajar','correr','dormir','dibujar','patinar','trabajar','escribir','estudiar','descansar'].map(vb));toks2=[{la:iv.base,lemma:iv.inf,cids:['inf'],concept:'infinitive',forms:[],vocab:verbV(iv)}];thingE=[`to ${iv.e}`,iv.ing]}
  else{const n=R(NOUNS.filter(x=>/[fdwmvgsi]/.test(x.tag)&&x.tag!=='h')),kk=num(n);k=kk;thing=np(n,kk,{det:n.bare?'def':R(['def','def','poss','demo']),pp:R([0,1,3]),dd:R([0,1])});toks2=thing.toks;thingE=thing.en}
  const t='pres',vt=vtok(v,t,k?5:2,{cids:['gustar']});vt.vocab=verbV(v).replace(/: to .*/,{gustar:': to be pleasing (I like = me gusta)',encantar:': to love (me encanta = I love it)',interesar:': to interest',doler:'(ue) : to hurt',fascinar:': to fascinate',molestar:': to bother',aburrir:': to bore'}[vbase]);
  const neg=chance(.25),ng=neg?[SW('no',['neg'])]:[],cl=clTok(ioc,'io');
  const tokens=[...aPh,...ng,cl,vt,...toks2];
  const ep=whoEp,s=ep===2,dO=s?'does':'do';let ens;
  if(vbase==='doler'){const pos=noun?[`${who.en[0]}'s`]:[POSS_E[pE]==='his'?(whoG==='f'?'her':'his'):POSS_E[pE]];const bE=k?thing.n.ep:thing.n.e,hurt=k?'hurt':'hurts';
    ens=cross(pos,bE,neg?(k?'do not hurt':'does not hurt'):hurt);if(noun)ens.push(...cross(who.en[0],"'s",bE,neg?(k?'do not hurt':'does not hurt'):hurt))}
  else if(vbase==='interesar'){const be=BE[ep];ens=[...cross(whoE,neg?be+' not interested in':be+' interested in',thingE),...cross(thingE,neg?(k?'do not interest':'does not interest'):(k?'interest':'interests'),noun?whoE:[['me','you','him','us','you all','them'][pE]==='him'?(whoG==='f'?'her':'him'):['me','you','him','us','you all','them'][pE]])]}
  else if(LIKEG_E[vbase]){const vE=LIKEG_E[vbase],oE=noun?whoE:[['me','you','him','us','you all','them'][pE]==='him'?(whoG==='f'?'her':'him'):['me','you','him','us','you all','them'][pE]];ens=cross(thingE,neg?(k?`do not ${vE}`:`does not ${vE}`):(k?vE:vE+'s'),oE)}
  else{const vE=vbase==='gustar'?'like':'love';ens=cross(whoE,neg?`${dO} not ${vE}`:(s?vE+'s':vE),thingE);if(isInf)ens=ens.map(e=>e)}
  const alts=[];if(!noun&&!show)alts.push([...ng,cl,vt,...toks2]);
  return S(tokens,ens,'.',{altTokens:alts});
}
/* verbs like gustar where the thing does the action in English: los libros me aburren = books bore me */
const LIKEG_E={fascinar:'fascinate',molestar:'bother',aburrir:'bore'};
/* hay */
function gHay(t='pres'){
  const people=chance(.5),n=R(people?PEOPLE.filter(x=>!x.name&&!x.sgOnly&&!x.tag.includes('k')):NOUNS.filter(x=>/[twf]/.test(x.tag)&&!x.sgOnly)),k=chance(.6)?1:0;
  const pl=people?R(NOUNS.filter(x=>/[cl]/.test(x.tag))):R([nn('mesa'),nn('mochila'),nn('casa'),nn('tienda')]),pn=np(pl,0,{det:'def'});
  const hay={la:t==='pres'?'hay':'había',lemma:'haber',cids:['hay'],concept:'there is / there are',forms:['hay','había','hubo'],vocab:'hay : there is, there are (había: there was, there were)'};
  let toks,e;
  if(k){const q=R([2,3,4,5,10]),w=NUMS[q]||'diez';toks=[hay,W(w,`${w} : ${NUMSE[q]}`),{la:n.pl,lemma:n.es,cids:['noun'],concept:'plural noun',forms:[n.es,n.pl],vocab:nounV(n)}];e=`${NUMSE[q]} ${n.ep}`}
  else{const a=np(n,0,{det:'indef'});toks=[hay,...a.toks];e=a.en[0]}
  const on=/^(mesa)$/.test(pl.es);
  return S([...toks,SW('en'),...pn.toks],cross(`there ${k?(t==='pres'?'are':'were'):(t==='pres'?'is':'was')}`,e,on?['on','in']:['in','at'],pn.en))
}
/* questions */
function gQues(o={}){
  const kind=o.kind||R(['yn','yn','que','quien','donde','cuando']);
  if(kind==='yn'){const c=o.c||anyC(Object.assign({adv:chance(.2)?'time':null},o.co||{}));const ng=c.negT?[c.negT]:[];
    const inv=[...ng,...c.clT,c.vt,...c.sb.toks,...c.A,...(c.advT?[c.advT]:[])],plain=[...c.sb.toks,...ng,...c.clT,c.vt,...c.A,...(c.advT?[c.advT]:[])];
    const toks=c.sb.pron?plain:inv,alts=c.sb.pron?[inv]:[plain];
    const ens=evQ(c.vE,c.t,c.ep,c.g).flatMap(([h,m])=>cross(c.negT?h+' not':h,c.sb.en,m,c.eRest[0],c.eRest[1],c.advE||''));
    if(c.negT)ens.push(...evQ(c.vE,c.t,c.ep,c.g).flatMap(([h,m])=>cross(h+"n't",c.sb.en,m,c.eRest[0],c.eRest[1],c.advE||'')));
    return S(toks,ens,'?',{altTokens:alts});}
  if(kind==='quien'){const c=anyC(Object.assign({},o.co||{},{subj:{toks:[],en:['who'],p:2,ep:2,g:'m',k:0}}));const q=W('quién','quién : who?',['qw']);
    return S([q,...c.clT,c.vt,...c.A],cross('who',ev(c.vE,c.t,2,false,c.g),c.eRest[0],c.eRest[1]),'?');}
  const qw={que:['qué','what','qué : what?'],donde:['dónde','where','dónde : where?'],cuando:['cuándo','when','cuándo : when?']}[kind];
  const co=Object.assign({},o.co||{});
  if(kind==='que')Object.assign(co,{vf:v=>v.fl.includes('T')&&!/p/.test(v.obj),obj:true});
  if(kind==='donde'){co.pool=SV.filter(v=>!v.refl);co.place=false;}
  const c=anyC(co);
  let A=c.A,rest=[c.eRest[0],c.eRest[1]];
  if(kind==='que'){A=c.A.filter(t=>!c.ob||!c.ob.toks.includes(t));rest=['',c.eRest[1]];if(c.dopla)return gQues(o)}
  let qtok=W(qw[0],qw[2],['qw']),qE=qw[1];
  if(kind==='donde'&&c.v.base==='ir'){qtok=Object.assign(W('adónde','adónde : (to) where?',['qw']),{alt:['a dónde','dónde']})}
  const ng=c.negT?[c.negT]:[];
  const toks=[qtok,...ng,...c.clT,c.vt,...c.sb.toks.map(t=>Object.assign({},t,{hide:t.hide})),...A];
  const ens=evQ(c.vE,c.t,c.ep,c.g).flatMap(([h,m])=>cross(qE,c.negT?h+' not':h,c.sb.en,m,rest[0],rest[1]));
  return S(toks,ens,'?');
}
/* tricky-gender nouns and adjective agreement */
function gTricky(){
  const n=R(NOUNS.filter(x=>x.tricky)),a=adjFor(n,'s');
  const vs=TV.filter(v=>v.obj&&objFor(v).includes(n));
  if(vs.length&&chance(.6))return gC({v:R(vs),objN:n,objNp:{det:'def',adj:a},objDet:'def',vcids:[]});
  const k=n.sgOnly?0:num(n),s=np(n,k,{det:R(['def','def','demo']),dd:R([0,1])}),tok=vtok(vb('ser'),'pres',k?5:2,{cids:['serDesc']}),ad=a||ADJ.find(x=>x.m==='bonito');
  return S([...s.toks,tok,adjTok(ad,n.g,k,'tricky')],cross(s.en,BE[k?5:2],ad.e));
}
function gAdj(){
  if(chance(.4))return gSer('serDesc');
  return chance(.5)?gC({sk:'noun',subjNp:{adj:'auto',det:R(['def','indef'])},vf:v=>v.fl.includes('T')}):gC({vf:v=>v.fl.includes('T'),objNp:{adj:'auto'},objDet:R(['def','indef'])});
}
/* preterite vs imperfect */
function gPvI(use){
  use=use||R(['int','int','hab','desc','seq']);
  const past2=(c,form)=>cross(c.sb.en,form,c.eRest[0],c.eRest[1]);
  if(use==='seq'){const used=[],s=subject({used,pron:.4,show:true}),vs=[];const pool=ACT.filter(v=>!v.refl);
    const cs=[0,1,2].map(i=>{const c=anyC({subj:i?{toks:[],en:[''],p:s.p,ep:s.ep,g:s.g,k:s.k}:s,used,t:'pret',vcids:['pretSeq'],vf:v=>!vs.includes(v.base)&&pool.includes(v)});vs.push(c.v.base);return c});
    const toks=[...cs[0].sb.toks,cs[0].vt,...cs[0].A],t1=cs[1],t2=cs[2];toks[toks.length-1]=Object.assign({},toks[toks.length-1],{post:','});
    const tail=[t1.vt,...t1.A,SW('y'),t2.vt,...t2.A];
    const e=cs.map(c=>cross(ev(c.vE,'pret',c.ep,false,c.g)[0],c.eRest[0],c.eRest[1]));
    return S([...toks,...tail],cross(s.en,e[0].map(x=>x+','),e[1],'and',e[2]).concat(cross(s.en,e[0],e[1].map(x=>x+','),'and',e[2])));}
  if(use==='hab'){const used=[],c1=anyC({used,t:'impf',vcids:['impfHab'],vf:v=>v.fl.includes('T')}),c2=clause({used,v:c1.v,t:'pret',vcids:['pretDone'],subj:{toks:[],en:[''],p:c1.p,ep:c1.ep,g:c1.g,k:c1.sb.k}});
    const td=advTok('todos los días','every day'),ay=advTok('ayer','yesterday');
    const toks=[td,...c1.sb.toks,c1.vt,...c1.A],last=toks.length-1;toks[last]=Object.assign({},toks[last],{post:','});
    const e1=cross(c1.sb.en,['used to '+fixP(c1.vE.e,c1.ep,c1.g),c1.vE.past,'would '+fixP(c1.vE.e,c1.ep,c1.g)],c1.eRest[0]);
    const e2=cross(c1.sb.en,c1.vE.past,c2.eRest[0]);
    return S([...toks,W('pero','pero : but'),ay,c2.vt,...c2.A],cross('every day,',e1.map(x=>x+','),'but yesterday',e2).concat(cross(e1,'every day, but yesterday',e2)));}
  const used=[];let c1,e1,toks1;
  if(use==='desc'){const h=R([2,3,4,5,6,7,8,9,10]),tok=beTok('ser','impf',5,'impfDesc');toks1=[tok,W('las'),W(NUMS[h],`${NUMS[h]} : ${NUMSE[h]}`)];e1=[`it was ${NUMSE[h]} o'clock`,`it was ${NUMSE[h]}`]}
  else{c1=anyC({used,t:'impf',vcids:['impfBg'],vf:v=>!v.refl});toks1=[...c1.sb.toks,c1.vt,...c1.A];e1=past2(c1,`${WAS[c1.ep]} ${fixP(c1.vE.ing,c1.ep,c1.g)}`)}
  const c2=anyC({used,t:'pret',vcids:['pretInt'],sk:'noun',vf:v=>/[MF]/.test(v.fl)&&!v.refl,place:true});
  const e2=cross(c2.sb.en,ev(c2.vE,'pret',c2.ep,false,c2.g)[0],c2.eRest[0],c2.eRest[1]);
  const cu=W('cuando','cuando : when');
  return S([...toks1,cu,...c2.sb.toks,c2.vt,...c2.A],cross(e1,'when',e2));
}
/* commands */
function cmdForm(v,kind,neg){
  const I=v.irr||{};
  if(kind==='tu')return neg?vf(v,'spres',1):(I.cmd||vf(v,'pres',2));
  if(kind==='nos'&&v.base==='ir'&&!neg)return'vamos';
  return vf(v,'spres',{ud:2,uds:5,nos:3}[kind]);
}
function gCmd(kind,o={}){
  kind=kind||'tu';
  const neg=o.neg!=null?o.neg:chance(.35),c=o.c||anyC(Object.assign({pool:ACT.filter(v=>!['poder','deber','haber','tener','poner'].includes(v.base)),objDet:R(['def','def','indef'])},o.co||{},{subj:{toks:[],en:[''],p:{tu:1,ud:2,uds:5,nos:3}[kind],ep:kind==='nos'?3:1,g:'m',k:kind==='uds'||kind==='nos'?1:0}}));
  const v=c.v,refl=v.refl?{tu:'te',ud:'se',uds:'se',nos:'nos'}[kind]:'';
  const dop=c.dopla||(!neg&&!v.refl&&c.ob&&chance(o.dopChance||0)?c.ob.dop:null);
  const pr=refl+(c.iola?(c.dopla&&/^l/.test(c.iola)?'se':c.iola):'')+(dop||'');
  let form=cmdForm(v,kind,neg);
  let vt;
  if(neg)vt=[SW('no',['neg']),...(pr?[{la:[...(refl?[refl]:[]),...(c.iola?[c.dopla&&/^l/.test(c.iola)?'se':c.iola]:[]),...(dop?[dop]:[])].join(' '),lemma:'pron',cids:['do'],concept:'pronoun before a negative command',forms:[],vocab:null}]:[]),{la:form,lemma:v.inf,cids:['cmd'+kind],concept:`${neg?'negative ':''}${{tu:'tú',ud:'usted',uds:'ustedes',nos:'nosotros'}[kind]} command`,forms:vforms(v),vocab:verbV(v)}];
  else{if(kind==='nos'&&refl)form=form.slice(0,-1);vt=[{la:attach(form,pr),lemma:v.inf,cids:['cmd'+kind],concept:`${{tu:'tú',ud:'usted',uds:'ustedes',nos:'nosotros'}[kind]} command${pr?' with pronoun attached':''}`,forms:vforms(v),vocab:verbV(v)}]}
  const A=dop&&!c.dopla?c.A.filter(t=>!c.ob.toks.includes(t)&&t.cids[0]!=='pera'):c.A;
  let voc=[],vE='';
  if(kind!=='nos'&&chance(o.vocChance==null?.4:o.vocChance)){const who=kind==='tu'?R(NAMES):kind==='ud'?R([['señor','sir'],['señora',"ma'am"],['profesor','teacher']]):R([['estudiantes','students'],['chicos','guys'],['amigos','friends']]);
    const la=who.es||who[0];voc=[Object.assign(W(la,who.es?null:`${who[0]} : ${who[1]}`),{post:','})];vE=(who.e||who[1])+','}
  const base=fixP(c.vE.e,1,'m'),dE=dop&&!c.dopla?[c.ob.doE]:c.eRest[0];
  let ens;
  if(kind==='nos')ens=cross(neg?["let's not",'let us not']:["let's",'let us'],base,dE,c.eRest[1]);
  else ens=cross(vE,neg?["don't",'do not']:[''],base,dE,c.eRest[1]);
  const tag={tu:'',ud:' (usted)',uds:' (ustedes)',nos:''}[kind];
  if(tag)ens=[ens[0]+tag,...ens];
  const alts=kind==='nos'&&!neg?[[...voc,Object.assign(W('vamos a','ir a : to be going to; vamos a … : let’s …')),{la:v.refl?attach(v.base,'nos'):attach(v.base,dop||''),lemma:v.inf,cids:['inf'],concept:'infinitive',forms:[],vocab:verbV(v)},...A]]:[];
  return S([...voc,...vt,...A],ens,kind==='nos'?'.':'!',{altTokens:alts,cmdKind:kind});
}
/* comparisons and superlatives */
const COMPIRR=[['mejor','mejores','better','bueno, -a : good (mejor: better)','best'],['peor','peores','worse','malo, -a : bad (peor: worse)','worst'],['mayor','mayores','older','mayor : older','oldest'],['menor','menores','younger','menor : younger','youngest']];
function gComp(){
  const people=chance(.7),pool=people?PEOPLE:NOUNS.filter(x=>/[wfsv]/.test(x.tag)&&x.tag!=='h');
  const used=[];
  const s=subject({kind:'noun',pool,used,np:{det:R(['def','poss']),pp:R([0,1,3])}}),a=adjFor(s.n,'s')||R(ADJ.filter(x=>x.kind==='s'&&x.tags.includes('p'))),s2n=pick(pool.filter(n=>n.tag===s.n.tag||people),used),s2=np(s2n,s.k&&!s2n.sgOnly?1:0,{det:R(['def','poss']),pp:R([0,1,3])});
  const tok=vtok(vb('ser'),'pres',s.p),be=BE[s.ep],kind=R(people?['mas','mas','menos','tan','irr']:['mas','menos','tan']);
  if(kind==='irr'){const c=R(COMPIRR);return S([...s.toks,tok,{la:s.k?c[1]:c[0],lemma:c[0],cids:['comp'],concept:'irregular comparative',forms:[c[0],c[1]],vocab:c[3]},Object.assign(SW('que'),{vocab:'que : than'}),...s2.toks],cross(s.en,be,c[2],'than',s2.en))}
  const w={mas:['más','que','más … que : more … than'],menos:['menos','que','menos … que : less … than'],tan:['tan','como','tan … como : as … as']}[kind];
  const aE=kind==='mas'?a.ce:kind==='menos'?'less '+a.e:'as '+a.e,link=kind==='tan'?'as':'than';
  return S([...s.toks,tok,W(w[0],w[2],['comp']),adjTok(a,s.g,s.k),Object.assign(W(w[1],w[2]),{}),...s2.toks],cross(s.en,be,aE,link,s2.en).concat(kind==='menos'?cross(s.en,be,'not as',a.e,'as',s2.en):[]))
}
function gSup(){
  const n=R(PEOPLE.filter(x=>!x.name)),k=num(n),a=R(ADJ.filter(x=>x.kind==='s'&&x.tags.includes('p'))),who=subject({kind:'noun',pool:NAMES,k:0});
  const irr=chance(.25)?R(COMPIRR.slice(0,2)):null;
  const kk=who.k,gt=who.g===n.g?n:pick(PEOPLE.filter(x=>!x.name&&x.g===who.g))||n,grp=gt.tag.includes('k')?['familia','family']:R([['clase','class'],['escuela','school']]);
  const art2=gt.g==='m'?'el':'la',nt={la:gt.es,lemma:gt.es,cids:['noun'],concept:'noun',forms:[],vocab:nounV(gt)};
  const tok0=0,tok=vtok(vb('ser'),'pres',2),gpTok=[SW('de'),W(grp[0]==='familia'?'la':'la'),W(grp[0],`la ${grp[0]} : ${grp[1]}`)];
  if(irr)return S([...who.toks,tok,W(art2,null,['art']),{la:irr[0],lemma:irr[0],cids:['sup'],concept:'irregular superlative',forms:[],vocab:irr[3]},nt,...gpTok],cross(who.en,'is the',irr[4],gt.e,['in the','of the'],grp[1]));
  return S([...who.toks,tok,W(art2,null,['art']),nt,W('más','el/la … más … de : the most … in',['sup']),adjTok(a,gt.g,0),...gpTok],cross(who.en,'is the',/^most /.test(a.se)?a.se:a.se,gt.e,['in the','of the'],grp[1]));
}
/* por and para */
const HOURS=[['dos','two'],['tres','three'],['cuatro','four'],['cinco','five']];
function ppTok(w,use,span){return{la:w,lemma:w,cids:[use],concept:`${w}: ${TYPES[use]?TYPES[use].n.toLowerCase():''}`,forms:[],vocab:SMALL[w],span}}
function gPorPara(use){
  use=use||R(['paraDest','paraRec','paraPurp','paraDead','porThru','porExch','porDur','porDay','porMeans']);
  const pool=o=>gC(o);
  if(use==='paraDest'){const s=subject({pron:.6,ps:[0,1,2,3,5]}),t=R(['pres','pret','fut']),pl=R(PLACES),vt=vtok(vb('salir'),t,s.p);
    return S([...s.toks,vt,ppTok('para',use,1),W(pl.es,`${pl.es} : ${pl.e}`)],cross(s.en,ev(vb('salir'),t,s.ep),['for','to'],pl.e))}
  if(use==='paraRec'){const c=anyC({vf:v=>['comprar','preparar','cocinar','escribir','hacer','traer'].includes(v.base)&&v.fl.includes('T'),obj:true}),n=pick(PEOPLE,c.used),k=num(n),r=np(n,k,{det:R(['def','poss']),pp:R([0,1,3])});
    const q=stmtOf(c);return S([...q.tokens,ppTok('para',use,r.toks.length),...r.toks],cross(q.ens.slice(0,3),'for',r.en))}
  if(use==='paraPurp'){const s=subject({pron:.6}),m=R([['ir','biblioteca','estudiar','study'],['ir','tienda','comprar pan','buy bread'],['estudiar',null,'aprender','learn'],['trabajar',null,'ganar dinero','earn money'],['ir','parque','jugar al fútbol','play soccer'],['ir','cine','ver una película','see a movie']]);
    const v=vb(m[0]),vt=vtok(v,'pres',s.p),toks=[...s.toks,vt];let e=ev(v,'pres',s.ep);
    if(m[1]){const pn=np(nn(m[1]),0,{det:'def'});toks.push(SW('a'),...pn.toks);e=cross(e,'to',pn.en)}
    const words=m[2].split(' ');return S([...toks,ppTok('para',use,words.length),...words.map(w=>W(w,w===words[0]?verbV(vb(w)||vb('ir')):null))],cross(e,['to','in order to'],m[3]))}
  if(use==='paraDead'){const n=R([nn('tarea'),nn('carta'),nn('examen')]),s=np(n,0,{det:R(['def','poss']),pp:R([0,1,3])}),d=R([['mañana','tomorrow'],['el lunes','Monday'],['el viernes','Friday']]);
    const ds=d[0].split(' ');return S([...s.toks,vtok(vb('ser'),'pres',2),ppTok('para',use,ds.length),...ds.map(x=>W(x,x==='el'?null:`${d[0]} : ${d[1]}`))],cross(s.en,'is',['for','due'],d[1].replace(/^(Monday|Friday)$/,x=>x)).concat(cross(s.en,'is due on',d[1])))}
  if(use==='porThru'){const c=anyC({pool:MV.filter(v=>['caminar','correr','viajar'].includes(v.base)),place:false}),pl=R(NOUNS.filter(x=>x.tag==='l')),pn=np(pl,0,{det:'def'});const q=stmtOf(c);
    return S([...q.tokens,ppTok('por',use,pn.toks.length),...pn.toks],cross(q.ens.slice(0,3),['through','around','along'],pn.en))}
  if(use==='porExch'){const c=anyC({v:vb(R(['comprar','vender','pagar'])),objDet:'def',ok:0}),q=stmtOf(c),[n,e]=R([['diez','ten'],['veinte','twenty'],['cinco','five'],['cincuenta','fifty']]);
    return S([...q.tokens,ppTok('por',use,2),W(n,`${n} : ${e}`),W('dólares','el dólar : dollar')],cross(q.ens.slice(0,3),'for',e,'dollars'))}
  if(use==='porDur'){const c=anyC({pool:SV.filter(v=>(v.fl==='S'||v.base==='estudiar')&&v.base!=='vivir'),obj:false,place:false}),q=stmtOf(c),[n,e]=R(HOURS);
    return S([...q.tokens,ppTok('por',use,2),W(n,`${n} : ${e}`),W('horas','la hora : hour')],cross(q.ens.slice(0,3),['for',''],e,'hours'))}
  if(use==='porDay'){const c=anyC({pool:SV.filter(v=>v.fl.includes('S')&&v.base!=='vivir'),obj:false,place:false}),q=stmtOf(c),[w,e]=R([['mañana','in the morning'],['tarde','in the afternoon'],['noche','at night']]);
    return S([...q.tokens,ppTok('por',use,2),W('la'),W(w,`por la ${w} : ${e}`)],cross(q.ens.slice(0,3),e).concat(w==='noche'?cross(q.ens.slice(0,2),'in the evening'):[]))}
  const s=subject({pron:.6}),n=pick(PEOPLE),k=num(n),w=np(n,k,{det:R(['def','poss']),pp:R([0,1,3])}),how=R([['teléfono','el teléfono : phone',['on the phone','by phone','over the phone']],['correo electrónico','el correo electrónico : email',['by email']]]);
  const hv=vtok(vb('hablar'),'pres',s.p),words=how[0].split(' ');
  return S([...s.toks,hv,SW('con'),...w.toks,ppTok('por','porMeans',words.length),...words.map((x,i)=>W(x,i?null:how[1]))],cross(s.en,ev(vb('hablar'),'pres',s.ep),['with','to'],w.en,how[2]))
}
/* saber and conocer */
const KNOW_N=[['respuesta','f','answer'],['número','m','number'],['dirección','f','address']];
function gSabCon(){
  const s=subject({pron:.6,ps:[0,1,2,3,5]}),r=R([0,1,2]);
  if(r===0){const v=R(['nadar','bailar','cantar','cocinar'].map(vb));return S([...s.toks,vtok(vb('saber'),'pres',s.p,{cids:['saber']}),{la:v.base,lemma:v.inf,cids:['inf'],concept:'infinitive',forms:[],vocab:verbV(v)}],cross(s.en,ev(vb('saber'),'pres',s.ep),'how to',v.e).concat(cross(s.en,s.ep===2?'can':'can',v.e)))}
  if(r===1){const[x,g,e]=R(KNOW_N);return S([...s.toks,vtok(vb('saber'),'pres',s.p,{cids:['saber']}),W(g==='m'?'el':'la'),W(x,`${g==='m'?'el':'la'} ${x} : ${e}`)],cross(s.en,ev(vb('saber'),'pres',s.ep),'the',e))}
  return gC({subj:s,v:vb('conocer'),vcids:['conocer']});
}
/* relative pronouns */
function gRel(){
  const r=R([0,1,2,3]),used=[];
  if(r===2){const s=subject({pron:1,ps:[0,3]}),s2=R(SUBJS.filter(x=>!x.vos&&!x.formal&&x.p!==s.p)),v2=R(['decir','hacer','escribir','leer'].map(vb)),vt2=vtok(v2,'pres',s2.p);
    const lq=W('lo que','lo que : what, that which',['rel']);
    return S([...s.toks,SW('no',['neg']),vtok(vb(R(['entender','comprender'])),'pres',s.p),lq,{la:s2.es,lemma:s2.es,cids:['subj'],concept:'subject pronoun',forms:[],vocab:null,opt:true,hide:s2.p!==2&&s2.p!==5},vt2],
      cross(s.en,ev(vb('entender'),'pres',s.ep,true),'what',SUBJV[s2.en]||[s2.en],ev(v2,'pres',s2.ep)))}
  const ant=R(r===0?NOUNS.filter(n=>/[wfvm]/.test(n.tag)&&n.tag!=='h'):PEOPLE.filter(n=>!n.name)),k=num(ant),a=np(ant,k,{det:'def'});used.push(ant);
  let mid,mE;
  if(r===0){const v=R(TV.filter(x=>objFor(x).includes(ant))),s=subject({used,pron:.5,show:true}),vt=vtok(v,'pres',s.p);mid=[W('que','que : that, which, who',['rel']),...s.toks.map(t=>Object.assign({},t,{hide:false})),vt];mE=cross(['that','which',''],s.en,ev(v,'pres',s.ep))}
  else if(r===1){const v=R(ACT.filter(x=>/[S]/.test(x.fl)&&!x.fl.includes('T')&&!x.refl)),vt=vtok(v,'pres',k?5:2);mid=[W('que','que : that, which, who',['rel']),vt];mE=cross(['who','that'],ev(v,'pres',k?5:2))}
  else{const s=subject({used,pron:.6,show:true}),v=vb('hablar'),vt=vtok(v,'pres',s.p);mid=[SW('con'),W(k?'quienes':'quien','quien, quienes : who, whom (after a preposition)',['rel']),...s.toks.map(t=>Object.assign({},t,{hide:false})),vt];
    mE=[...cross(['who','whom','that',''],s.en,ev(v,'pres',s.ep),'with'),...cross('with whom',s.en,ev(v,'pres',s.ep))]}
  const s2=R([0,1]),tail=s2===0?(()=>{const ad=adjFor(ant,'s')||R(ADJ.filter(x=>x.kind==='s'&&x.tags.includes('p')));return{t:[vtok(vb('ser'),'pres',k?5:2),adjTok(ad,ant.g,k)],e:cross(BE[k?5:2],ad.e)}})():(()=>{const fam=R(NOUNS.filter(n=>n.tag==='pk'&&n.g===ant.g&&(!k||!n.sgOnly))),f=np(fam,k,{det:'poss',pp:R([0,1,3])});return ant.tag.includes('p')?{t:[vtok(vb('ser'),'pres',k?5:2),...f.toks],e:cross(BE[k?5:2],f.en)}:{t:[vtok(vb('estar'),'pres',k?5:2,{cids:['estLoc']}),SW('en'),...np(nn('mesa'),0,{det:'def'}).toks],e:cross(BE[k?5:2],'on the table')}})();
  return S([...a.toks,...mid,...tail.t],cross(a.en,mE,tail.e));
}
/* se: impersonal and passive */
function gSe(){
  if(chance(.3)){const lang=R([['español','Spanish'],['inglés','English'],['francés','French']]),pl=R(['aquí','en la tienda','en la escuela']),plE={aquí:'here','en la tienda':'in the store','en la escuela':'at school'}[pl];
    return S([W('se','se (impersonal) : one, people, they',['se']),vtok(vb('hablar'),'pres',2),W(lang[0],`${lang[0]} : ${lang[1]}`),...pl.split(' ').map(w=>W(w,w==='aquí'?'aquí : here':null))],[...cross(lang[1],'is spoken',plE),...cross(['they speak','people speak','one speaks'],lang[1],plE)])}
  const v=R(['vender','servir','necesitar','comprar'].map(vb)),n=R(objFor(v).filter(x=>!x.name&&!x.tag.includes('p')&&x.tag!=='$')),k=n.sgOnly?0:1,obj=np(n,k,{det:'none'}),pl=np(nn(R({vender:['tienda','mercado'],comprar:['tienda','mercado'],servir:['restaurante','casa'],necesitar:['escuela','restaurante','tienda','casa']}[v.base])),0,{det:'def'});
  const vt=vtok(v,'pres',k?5:2);vt.concept+=' (agrees with the thing)';
  const eN=k?n.ep:n.e;
  return S([W('se','se (passive) : is / are + past participle',['se']),vt,...obj.toks,SW('en'),...pl.toks],[...cross(eN,k?'are':'is',v.pp,['in','at'],pl.en),...cross(['they','people'],v.e,eN,['in','at'],pl.en)])
}

/* ---------- the subjunctive ---------- */
const EV=(e,past,pp,ing)=>({e,past,pp,ing,base:'x'});
const HOPE=EV('hope','hoped','hoped','hoping'),ASK=EV('ask','asked','asked','asking'),THINK=EV('think','thought','thought','thinking');
const IMPERS=[['importante','important'],['necesario','necessary'],['bueno','good'],['posible','possible'],['mejor','better']];
function subParts(c,mode){ // English for the clause that has the subjunctive
  const subj=c.sb.en,eo=c.sb.eo||c.sb.en,base=fixP(c.vE.e,c.ep,c.g),rest=[c.eRest[0],c.eRest[1],c.advE||''];
  const pres=ev(c.vE,'pres',c.ep,false,c.g),past=fixP(c.vE.past,c.ep,c.g),has=c.ep===2?'has':'have';
  return{subj,eo,base,rest,pres:[pres[0],pres[1]],past,will:'will '+base,would:'would '+base,perf:[`${has} ${c.vE.pp}`,past]};
}
function gSubj(kind,o={}){
  kind=kind||R(['W','R','E','I','D']);
  const past=!!o.past,perf=!!o.perf,used=[];
  const ms=kind==='I'?null:subject({pron:.6,ps:[0,1,2,3,5],used});
  const subT=past?'simpf':perf?'sperf':'spres';
  const c=anyC({t:subT,used,pron:.55,show:true,ps:[0,1,2,3,5].filter(x=>!ms||x!==ms.p),vcids:['sj'+kind],vf:v=>!v.refl||chance(.3)});
  if(ms&&ms.p===c.p&&!c.sb.pron&&ms.pron)return gSubj(kind,o);
  const sp=subParts(c),q=stmtOf(c),mt=past?(kind==='E'?R(['pret','impf']):'impf'):'pres',que=Object.assign(SW('que',['que']),{vocab:'que : that'});
  let head=[],hE=[],body=[];
  if(kind==='W'){const tr=R([['querer',vb('querer'),'to'],['preferir',vb('preferir'),'both'],['esperar',HOPE,'that']]),v=vb(tr[0]);head=[...ms.toks,vtok(v,mt,ms.p),que];
    const mv=past?[tr[1].past]:ev(tr[1],'pres',ms.ep).slice(0,1);
    if(tr[2]!=='that')body.push(...cross(ms.en,mv,sp.eo,'to',sp.base,...sp.rest));
    if(tr[2]!=='to')body.push(...cross(ms.en,mv,['that',''],sp.subj,past?[sp.past,sp.would]:[...sp.pres,sp.will,sp.base],...sp.rest));}
  else if(kind==='R'){const tr=R([['recomendar',vb('recomendar')],['sugerir',vb('sugerir')],['pedir',ASK]]),v=vb(tr[0]);head=[...ms.toks,vtok(v,mt,ms.p),que];
    const mv=past?[tr[1].past]:ev(tr[1],'pres',ms.ep).slice(0,1);
    body.push(...cross(ms.en,mv,['that',''],sp.subj,[sp.base,...sp.pres,'should '+sp.base,...(past?[sp.past]:[])],...sp.rest));
    if(tr[0]==='pedir')body.unshift(...cross(ms.en,mv,sp.eo,'to',sp.base,...sp.rest));}
  else if(kind==='E'){if(chance(.6)){const v=vb('alegrarse');head=[...ms.toks,clTok(REFL[ms.p],'refl'),vtok(v,mt,ms.p),SW('de'),que];
      body.push(...cross(ms.en,past?WAS[ms.ep]:BE[ms.ep],['glad','happy'],['that',''],sp.subj,past?[sp.past,`${WAS[c.ep]} ${c.vE.ing}`]:perf?sp.perf:[...sp.pres,sp.will],...sp.rest));}
    else{const v=vb('temer');head=[...ms.toks,vtok(v,mt,ms.p),que];
      body.push(...cross(ms.en,past?['feared',`${WAS[ms.ep]} afraid`]:[ev(v,'pres',ms.ep)[0],BE[ms.ep]+' afraid'],['that',''],sp.subj,past?[sp.past,sp.would]:perf?sp.perf:[...sp.pres,sp.will],...sp.rest));}}
  else if(kind==='I'){const[a,e]=R(IMPERS),v=vb('ser');head=[vtok(v,past?'impf':'pres',2),W(a,`${a} : ${e}`),que];
    const it=past?'it was':'it is';
    body.push(...cross(it,e,'that',sp.subj,[sp.base,...sp.pres,'should '+sp.base,...(past?[sp.past]:[])],...sp.rest),...cross(it,e,'for',sp.eo,'to',sp.base,...sp.rest),...cross(past?"it was":"it's",e,'that',sp.subj,[sp.base,...sp.pres],...sp.rest));}
  else{if(chance(.6)){const v=vb('dudar');head=[...ms.toks,vtok(v,mt,ms.p),que];
      body.push(...cross(ms.en,past?['doubted']:[ev(v,'pres',ms.ep)[0]],['that',''],sp.subj,past?[sp.past,sp.would]:perf?sp.perf:[...sp.pres,sp.will],...sp.rest));}
    else{const v=vb('creer');head=[...ms.toks,SW('no',['neg']),vtok(v,mt,ms.p),que];
      const dn=past?['did not']:[ms.ep===2?'does not':'do not'];
      body.push(...cross(ms.en,dn,['believe','think'],['that',''],sp.subj,past?[sp.past,sp.would]:perf?sp.perf:[...sp.pres,sp.will],...sp.rest));}}
  return S([...head,...q.tokens],body);
}
function gOjala(){
  if(chance(.25)){const s=subject({kind:'noun',pool:PEOPLE}),v=R(['hablar','vivir','cantar','trabajar'].map(vb)),a=R(ADJ.filter(x=>x.kind==='s'&&x.tags.includes('p'))),pr=s.k?'they':s.g==='f'?'she':'he';
    return S([...s.toks,vtok(v,'pres',s.p),W('como si','como si (+ imperfect subjunctive) : as if',['sjO']),Object.assign(vtok(vb('ser'),'simpf',s.p),{cids:['sjO','simpf']}),adjTok(a,s.g,s.k)],cross(s.en,ev(v,'pres',s.ep)[0],['as if','as though'],pr,'were',a.e))}
  const wish=chance(.3),c=anyC({t:wish?'simpf':'spres',pron:.6,show:true,ps:wish?[0,3]:[1,2,3,5],vcids:['sjO'],adv:chance(.3)?'time':null}),sp=subParts(c),q=stmtOf(c);
  const oj=W('ojalá','ojalá (que) : I hope, hopefully; (+ imperfect subjunctive) I wish',['ojala']),que=Object.assign(SW('que'),{opt:true,hide:chance(.5)});
  const ens=wish?cross('I wish',['that',''],sp.subj,c.v.base==='tener'?'had':sp.past,...sp.rest):[...cross('I hope',['that',''],sp.subj,[...sp.pres,sp.will],...sp.rest),...cross('hopefully',sp.subj,[...sp.pres,sp.will],...sp.rest)];
  return S([oj,que,...q.tokens],ens);
}
function gSjAdj(){
  const s=subject({pron:.6,ps:[0,1,2,3,5]}),mv=R(['buscar','necesitar','querer'].map(vb)),people=chance(.5);
  const n=people?R(PEOPLE.filter(x=>!x.name&&!x.sgOnly&&!x.tag.includes('k'))):R(NOUNS.filter(x=>/[wt]/.test(x.tag)&&!x.sgOnly)),a=np(n,0,{det:'indef'});
  const que=Object.assign(SW('que',['rel']),{vocab:'que : that, who'});let sub,sE;
  if(people){const r=R([['hablar','español','speaks Spanish','Spanish'],['saber','cocinar','knows how to cook'],['vivir','cerca','lives nearby'],['trabajar','mucho','works hard']]),v=vb(r[0]),vt=vtok(v,'spres',2,{cids:['sjA']});
    sub=[vt,W(r[1],{español:'español : Spanish',cocinar:'cocinar : to cook',cerca:'cerca : near, nearby',mucho:'mucho : a lot, hard'}[r[1]])];sE=[r[2]];}
  else{const ad=adjFor(n,'s')||ADJ.find(x=>x.m==='barato'),vt=vtok(vb('ser'),'spres',2,{cids:['sjA']});sub=[vt,adjTok(ad,n.g,0)];sE=['is '+ad.e];}
  const mtok=vtok(mv,'pres',s.p),mE=mv.base==='querer'?ev(mv,'pres',s.ep).slice(0,1):ev(mv,'pres',s.ep).slice(0,2);
  if(n.tag.includes('p'))return S([...s.toks,mtok,Object.assign(SW('a',['pera']),{opt:true,hide:true}),...a.toks,que,...sub],cross(s.en,mE,a.en,people?['who','that']:['that','which'],sE));
  return S([...s.toks,mtok,...a.toks,que,...sub],cross(s.en,mE,a.en,people?['who','that']:['that','which'],sE));
}
function gSjAdv(){
  const k=R(['para','antes','cuando']),used=[];
  if(k==='cuando'){const c2=anyC({t:'spres',used,vcids:['sjAdv'],pron:.6,show:true,ps:[1,2,3,5]}),c1=anyC({t:'fut',used,pron:.5}),q2=stmtOf(c2),q1=stmtOf(c1),sp=subParts(c2);
    const last=q2.tokens.length-1;q2.tokens[last]=Object.assign({},q2.tokens[last],{post:','});
    return S([W('cuando','cuando (+ subjunctive, for the future) : when',['cuando']),...q2.tokens,...q1.tokens],cross('when',sp.subj,sp.pres[0],...sp.rest).flatMap(a=>q1.ens.slice(0,3).map(b=>a+', '+b)));}
  const c1=anyC({t:'pres',used,pron:.6}),c2=anyC({t:'spres',used,vcids:['sjAdv'],pron:.5,show:true,ps:[0,1,2,3,5].filter(x=>x!==c1.p)}),q1=stmtOf(c1),q2=stmtOf(c2),sp=subParts(c2);
  const conj=k==='para'?W('para que','para que (+ subjunctive) : so that',['paraque']):W('antes de que','antes de que (+ subjunctive) : before',['antesque']);
  const e2=k==='para'?cross(['so that','so'],sp.subj,[...sp.pres,'can '+sp.base,sp.will],...sp.rest):cross('before',sp.subj,sp.pres[0],...sp.rest);
  return S([...q1.tokens,conj,...q2.tokens],q1.ens.slice(0,4).flatMap(a=>e2.map(b=>a+' '+b)));
}
function gSi(kind){
  kind=kind||'hyp';const used=[];
  const t1={open:'pres',hyp:'simpf',past:'splup'}[kind],t2={open:R(['fut','pres']),hyp:'cond',past:'condp'}[kind];
  const c1=anyC({t:t1,used,vcids:['si'],pron:.6}),c2=anyC({t:t2,used,pron:.5,vcids:['siR']}),q1=stmtOf(c1),q2=stmtOf(c2);
  const sp=subParts(c1),f1=kind==='open'?sp.pres.slice(0,1):kind==='hyp'?[c1.v.base==='tener'?'had':sp.past]:[`had ${c1.vE.pp}`];
  const e1=cross('if',sp.subj,f1,...sp.rest),e2=kind==='open'?q2.ens.slice(0,3):q2.ens.slice(0,2);
  const last=q1.tokens.length-1,tk1=q1.tokens.map((t,i)=>i===last?Object.assign({},t,{post:','}):t);
  const si=W('si','si : if',['si']);
  return S([si,...tk1,...q2.tokens],e1.flatMap(a=>e2.map(b=>a+', '+b)),'.',{altTokens:[[...q2.tokens,si,...q1.tokens]]});
}
function gPass(){
  const v=R(['escribir','abrir','hacer','romper','leer','preparar','comprar','vender','lavar','mandar','ver','cocinar'].map(vb)),n=R(objFor(v).filter(x=>!x.tag.includes('p')&&!x.name)),k=num(n),s=np(n,k,{det:R(['def','poss']),pp:R([0,1,3])});
  const a=R(PEOPLE),ak=num(a),ag=np(a,ak,{det:R(['def','poss']),pp:R([0,1,3])}),t=R(['pres','pret']);
  const pp=ppl(v),ppA=pp.replace(/o$/,(n.g==='f'?'a':'o')+(k?'s':''));
  const be=vtok(vb('ser'),t,k?5:2,{cids:['pass']});be.concept+=' (passive voice)';
  return S([...s.toks,be,{la:ppA,lemma:v.inf,cids:['pp'],concept:'past participle, agrees with the subject',forms:[pp],vocab:verbV(v)},SW('por',['agent']),...ag.toks],cross(s.en,t==='pres'?(k?'are':'is'):(k?'were':'was'),v.pp,'by',ag.en))
}
function gReported(){
  const s=subject({kind:'noun',pool:PEOPLE}),same=chance(.6),pr=s.k?'they':s.g==='f'?'she':'he';
  const subj=same?{toks:[],en:[pr],eo:[pr],p:s.p,ep:s.ep,g:s.g,k:s.k}:null,t=R(['impf','cond','plup']);
  const c=anyC({subj,t,used:[s.n],pron:.6,show:true,vcids:['reported']}),q=stmtOf(c);
  const f={impf:[`${WAS[c.ep]} ${fixP(c.vE.ing,c.ep,c.g)}`,fixP(c.vE.past,c.ep,c.g)],cond:['would '+fixP(c.vE.e,c.ep,c.g)],plup:['had '+c.vE.pp]}[t];
  return S([...s.toks,vtok(vb('decir'),'pret',s.p),Object.assign(SW('que'),{vocab:'que : that'}),...q.tokens],cross(s.en,'said',['that',''],c.sb.en,f,c.eRest[0],c.eRest[1],c.advE||''));
}
const FORM_V=()=>VERBS.filter(v=>!['haber','deber','gustar','encantar','interesar','doler','fascinar','molestar','aburrir'].includes(v.base));
function gForm(tenses){
  const v=R(FORM_V()),t=R(tenses),p=R([0,1,2,3,...(VOS?[4]:[]),5]),la=(v.refl?REFL[p]+' ':'')+vphrase(v,t,p);
  const tok={la,lemma:v.inf,cids:['form',t],concept:`${PERS[p]}, ${TN[t]}`,forms:vforms(v),vocab:verbV(v),vb:v,t,p};
  const s=S([tok],[`Write the ${TN[t]} of ${v.inf} (“to ${v.e.replace('$P','one’s')}”) for ${PERS[p]}`]);s.form=1;return s;
}


/* ---------- everyday Spanish (Spanish I Honors notes): numbers, telling time, dates, weather, clothes ---------- */
const NU=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
const NT={3:'treinta',4:'cuarenta',5:'cincuenta',6:'sesenta',7:'setenta',8:'ochenta',9:'noventa'};
const NH={1:'ciento',2:'doscientos',3:'trescientos',4:'cuatrocientos',5:'quinientos',6:'seiscientos',7:'setecientos',8:'ochocientos',9:'novecientos'};
/* a number in Spanish, 0-1000. g = gender of the noun it counts (uno → un / una, doscientos → doscientas) */
function numEs(n,g){
  if(n===1000)return'mil';if(n===100)return'cien';
  const h=Math.floor(n/100),r=n%100,out=[];
  if(h){let w=NH[h];if(g==='f'&&h>1)w=w.replace(/os$/,'as');out.push(w)}
  if(r||!h){let w=r<30?NU[r]:NT[Math.floor(r/10)]+(r%10?' y '+NU[r%10]:'');
    if(g&&/uno$/.test(w))w=g==='f'?w.replace(/uno$/,'una'):w.replace(/^veintiuno$/,'veintiún').replace(/uno$/,'un');out.push(w)}
  return out.join(' ')}
const EN1=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],EN10=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numE(n){if(n>=1000)return n===1000?'one thousand':String(n);const h=Math.floor(n/100),r=n%100,s=[];if(h)s.push(EN1[h]+' hundred');if(r||!h)s.push(r<20?EN1[r]:EN10[Math.floor(r/10)]+(r%10?'-'+EN1[r%10]:''));return s.join(' ')}
const ORD1={one:'first',two:'second',three:'third',five:'fifth',eight:'eighth',nine:'ninth',twelve:'twelfth'};
function numOrd(n){const w=numE(n),m=w.match(/([a-z]+)$/),last=m[1];const o=ORD1[last]||(/y$/.test(last)?last.slice(0,-1)+'ieth':last+'th');return w.slice(0,-last.length)+o}
const numTok=(n,g,cid='num')=>{const w=numEs(n,g);return W(w,`${w} : ${n}`,[cid],'number')};

/* telling time: (es / son) + (la / las) + hour + (y / menos) + minutes + (de la mañana / tarde / noche) */
const PART={m:['de la mañana','in the morning','a.m.'],t:['de la tarde','in the afternoon','p.m.'],n:['de la noche','at night','p.m.','in the evening']};
const hourW=h=>h===1?'una':numEs(h);
function timeToks(h,conn,mm,pk,lead){
  const pl=h!==1,t=[];
  if(lead)t.push(...lead);else t.push(beTok('ser','pres',pl?5:2,'serTime'));
  t.push(W(pl?'las':'la',null,['hora'],'la hora: la / las before the hour'),W(hourW(h),`${hourW(h)} : ${numE(h)} (the hour)`,['hora']));
  if(mm===0)t.push(Object.assign(W('en punto','en punto : on the dot, exactly',['hora']),{opt:true}));
  else{t.push(W(conn,conn==='y'?'y : and (minutes after the hour)':'menos : minus (minutes before the hour)',['hora']));
    const w=mm===15?'cuarto':mm===30?'media':numEs(mm),tk=W(w,mm===15?'cuarto : quarter (y cuarto: quarter past)':mm===30?'media : half (y media: half past)':`${w} : ${numE(mm)} (minutes)`,['hora']);
    if(mm===15)tk.alt=['quince'];if(mm===30)tk.alt=['treinta'];t.push(tk)}
  if(pk)t.push(W(PART[pk][0],`${PART[pk][0]} : ${PART[pk][1]}`,['hora']));
  return t}
function timeE(h,m){
  const H=numE(h),N=numE(h%12+1),out=[];
  if(m===0){out.push(`${h}:00`,`${H} o'clock`,H)}
  else{out.push(`${h}:${String(m).padStart(2,'0')}`,`${H} ${m<10?'oh '+numE(m):numE(m)}`);
    if(m===15)out.push(`a quarter past ${H}`,`quarter past ${H}`,`a quarter after ${H}`,`quarter after ${H}`);
    else if(m===30)out.push(`half past ${H}`);
    else if(m<30)out.push(`${numE(m)} past ${H}`,`${numE(m)} after ${H}`,`${numE(m)} minutes past ${H}`,`${numE(m)} minutes after ${H}`);
    if(m===45)out.push(`a quarter to ${N}`,`quarter to ${N}`,`a quarter till ${N}`,`quarter till ${N}`,`a quarter of ${N}`);
    else if(m>30)out.push(`${numE(60-m)} to ${N}`,`${numE(60-m)} till ${N}`,`${numE(60-m)} minutes to ${N}`,`${numE(60-m)} of ${N}`)}
  return out}
const EVENTS=[['clase','f','the class'],['fiesta','f','the party'],['examen','m','the test'],['partido','m','the game'],['concierto','m','the concert']];
function gHora(){
  if(chance(.1)){const mid=chance(.5);return S([beTok('ser','pres',2,'serTime'),W(mid?'mediodía':'medianoche',mid?'el mediodía : noon':'la medianoche : midnight',['hora'])],mid?['It is noon.','it is twelve noon','it is midday']:['It is midnight.','it is twelve midnight'])}
  const h=R([1,2,3,4,5,6,7,8,9,10,11,12]),m=R([0,0,5,10,15,15,20,25,30,30,35,40,45,45,50,55]);
  const ok={m:h>=5&&h<=11,t:h===12||h<=6,n:h>=7&&h<=11};const pk=chance(.55)?R(Object.keys(ok).filter(k=>ok[k])):null;
  const h2=h%12+1,menos=m>30;
  let lead=null,leadE=['it is'];
  if(chance(.35)){const [ev,g,e]=R(EVENTS);const a={la:g==='m'?'el':'la',lemma:'el',cids:['art'],concept:'definite article',forms:['el','la'],vocab:null};
    lead=[a,W(ev,`${g==='m'?'el':'la'} ${ev} : ${e.replace('the ','')}`,['noun']),beTok('ser','pres',2,'serTime'),SW('a',['hora'])];leadE=[`${e} is at`]}
  const main=timeToks(menos?h2:h,menos?'menos':'y',menos?60-m:m,pk,lead),alt=menos?[timeToks(h,'y',m,pk,lead)]:[];
  if(lead&&m===0)main.forEach(t=>{if(t.la==='en punto')t.opt=true});
  const pe=pk?PART[pk].slice(1).map(x=>' '+x):[''];
  const ens=cross(leadE,timeE(h,m),pe);
  return S(main,ens,'.',{altTokens:alt})}

/* days, months and dates: el + number + de + month (el primero for the 1st) */
const DIAS=[['lunes','Monday'],['martes','Tuesday'],['miércoles','Wednesday'],['jueves','Thursday'],['viernes','Friday'],['sábado','Saturday'],['domingo','Sunday']];
const MESES=[['enero','January'],['febrero','February'],['marzo','March'],['abril','April'],['mayo','May'],['junio','June'],['julio','July'],['agosto','August'],['septiembre','September'],['octubre','October'],['noviembre','November'],['diciembre','December']];
function dateToks(d,mi){const[mes]=MESES[mi];const dt=d===1?Object.assign(W('primero','el primero : the first (of the month)',['fecha']),{alt:['uno']}):W(numEs(d),`${numEs(d)} : ${numE(d)}`,['fecha']);
  return[W('el',null,['fecha'],'el before the date'),dt,SW('de',['fecha']),W(mes,`${mes} : ${MESES[mi][1]}`,['fecha'])]}
function dateE(d,mi){const M=MESES[mi][1];return[`${M} ${d}`,`${M} ${numE(d)}`,`${M} ${numOrd(d)}`,`the ${numOrd(d)} of ${M}`]}
function gFecha(){
  const r=R([0,1,1,2,2,3]);
  const hoy=chance(.6),dayTok=hoy?W('hoy','hoy : today',['fecha']):W('mañana','mañana : tomorrow',['fecha']),dayE=hoy?'today':'tomorrow';
  if(r===0){const[di,dE]=R(DIAS);return S([dayTok,beTok('ser','pres',2,'serTime'),W(di,`${di} : ${dE}`,['fecha'])],cross(dayE,'is',dE))}
  const d=R([1,1,2,3,5,7,8,9,10,12,14,15,16,20,21,22,23,24,25,28,30,31]),mi=R([0,1,2,3,4,5,6,7,8,9,10,11]);
  if(mi===1&&d>28)return gFecha();if([3,5,8,10].includes(mi)&&d===31)return gFecha();
  if(r===1)return S([dayTok,beTok('ser','pres',2,'serTime'),...dateToks(d,mi)],cross(dayE,'is',dateE(d,mi)));
  if(r===2){const pp=R([0,1,2,3]),P=POSS[pp],who=pp===2?R([['his','m'],['her','f']]):[POSS[pp][2]];
    const pt={la:P[0],lemma:P[0],cids:['poss'],concept:'possessive adjective',forms:[P[0],P[1]],vocab:{0:'mi, mis : my',1:'tu, tus : your',2:'su, sus : his, her, your (formal), their',3:'nuestro, -a : our'}[pp]};
    const possE=pp===2?['his','her','your','their']:[who[0]],noun=pp===3?'birthday':'birthday';
    return S([pt,W('cumpleaños','el cumpleaños : birthday',['noun']),beTok('ser','pres',2,'serTime'),...dateToks(d,mi)],cross(possE,noun,'is',[...dateE(d,mi),...dateE(d,mi).map(x=>'on '+x)]))}
  const[ev,g,e]=R(EVENTS),[di,dE]=R(DIAS),pl=chance(.25);
  const a={la:g==='m'?'el':'la',lemma:'el',cids:['art'],concept:'definite article',forms:['el','la'],vocab:null};
  return S([a,W(ev,`${g==='m'?'el':'la'} ${ev} : ${e.replace('the ','')}`,['noun']),beTok('ser','pres',2,'serTime'),W(pl?'los':'el',pl?'los + day : on (every) …':'el + day : on …',['fecha']),W(pl?(/s$/.test(di)?di:di+'s'):di,`${di} : ${dE}`,['fecha'])],
    pl?cross(e,'is',[`on ${dE}s`,`every ${dE}`]):cross(e,'is',[`on ${dE}`,dE]))}

/* weather: hace + noun, está + adjective or -ndo, hay + noun; seasons */
const WX=[
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['calor','el calor : heat (hace calor: it is hot)']],e:['hot'],many:1,s:'v'},
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['frío','el frío : cold (hace frío: it is cold)']],e:['cold'],many:1,s:'i'},
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['fresco','fresco : cool (hace fresco: it is cool)']],e:['cool'],s:'po'},
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['sol','el sol : sun (hace sol: it is sunny)']],e:['sunny'],many:1,s:'v'},
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['viento','el viento : wind (hace viento: it is windy)']],e:['windy'],many:1,s:'oi'},
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['buen tiempo','buen tiempo : good weather (hace buen tiempo: it is nice out)']],e:['nice out','nice','good weather','nice weather'],alsoE:['the weather is nice','the weather is good'],s:'pv'},
  {t:[['hace','hacer : to make (hace + weather: it is …)'],['mal tiempo','mal tiempo : bad weather (hace mal tiempo: the weather is bad)']],e:['bad out','bad weather'],alsoE:['the weather is bad'],s:'io'},
  {t:[['está','estar : to be (weather right now)'],['nublado','nublado : cloudy']],e:['cloudy'],s:'oip'},
  {t:[['está','estar : to be (weather right now)'],['despejado','despejado : clear']],e:['clear'],s:'v'},
  {t:[['está','estar : to be (weather right now)'],['húmedo','húmedo : humid']],e:['humid'],s:'v'},
  {t:[['está','estar : to be (weather right now)'],['lloviendo','llover (ue) : to rain (está lloviendo: it is raining)']],e:['raining'],s:'p'},
  {t:[['llueve','llover (ue) : to rain (llueve: it rains, it is raining)']],e:['raining'],alsoE:['it rains'],s:'p'},
  {t:[['está','estar : to be (weather right now)'],['nevando','nevar (ie) : to snow (está nevando: it is snowing)']],e:['snowing'],s:'i'},
  {t:[['nieva','nevar (ie) : to snow (nieva: it snows, it is snowing)']],e:['snowing'],alsoE:['it snows'],s:'i'},
  {t:[['hay','hay : there is, there are'],['una','un, una : a'],['tormenta','la tormenta : storm']],e:null,alsoE:['there is a storm','there is a thunderstorm'],s:'v'},
  {t:[['hay','hay : there is, there are'],['niebla','la niebla : fog']],e:['foggy'],alsoE:['there is fog'],s:'o'}];
const SEASONS={p:['primavera','f','spring'],v:['verano','m','summer'],o:['otoño','m','fall','autumn'],i:['invierno','m','winter']};
function gClima(){
  const w=R(WX),many=w.many&&chance(.3),toks=w.t.map(([la,v],i)=>W(la,v,['clima'],'weather expression'));
  if(many)toks.splice(1,0,W('mucho','mucho : a lot (hace mucho frío: it is very cold)',['clima']));
  const base=[...(w.e?cross('it is',many?['very','really']:[''],w.e):[]),...(many?[]:(w.alsoE||[]))];
  const c=R([null,null,'s','hoy','place']);let pre=null,preE=[];
  if(c==='s'){const k=R([...w.s]),[es,g,...en]=SEASONS[k];pre=[SW('en'),W(g==='m'?'el':'la',null,['art']),W(es,`${g==='m'?'el':'la'} ${es} : ${en.join(', ')}`,['clima'])];preE=en.flatMap(x=>['in '+x,'in the '+x])}
  else if(c==='hoy'){pre=[W('hoy','hoy : today',['adv'])];preE=['today']}
  else if(c==='place'){const pl=R(['Madrid','Chicago','Lima','Buenos Aires','Bogotá']);pre=[SW('en'),W(pl,`${pl} : ${pl==='Bogotá'?'Bogota':pl}`)];preE=['in '+(pl==='Bogotá'?'Bogota':pl)]}
  if(!pre)return S(toks,base);
  return S([...pre,...toks],[...cross(preE,base),...cross(base,preE)],'.',{altTokens:[[...toks,...pre]]})}

/* numbers 0-1000: hay + number + noun, tener … años, costar … dólares, simple math */
const bigN=()=>chance(.5)?R([16,17,18,19,21,22,23,24,25,26,27,28,29,31,34,38,41,45,52,57,63,66,71,78,84,89,93,99]):R([100,101,115,120,150,200,201,245,300,365,400,450,500,525,600,700,750,800,875,900,999,1000]);
function gNum(){
  const r=R([0,0,1,2,2,3]);
  if(r===0){const n=R(NOUNS.filter(x=>/[twfp]/.test(x.tag)&&!x.sgOnly&&!x.tag.includes('k'))),q=bigN();
    const pl=R(NOUNS.filter(x=>/[cl]/.test(x.tag))),pn=np(pl,0,{det:'def'});
    const hay={la:'hay',lemma:'haber',cids:['hay'],concept:'there is / there are',forms:['hay'],vocab:'hay : there is, there are'};
    return S([hay,numTok(q,n.g),{la:n.pl,lemma:n.es,cids:['noun'],concept:'plural noun',forms:[n.es,n.pl],vocab:nounV(n)},SW('en'),...pn.toks],cross('there are',[numE(q),String(q)],n.ep,['in','at'],pn.en))}
  if(r===1){const s=predSubj({pool:PEOPLE}),q=R([13,14,15,16,17,18,21,25,31,40,44,50,61,72,85,99]),tok=vtok(vb('tener'),'pres',s.p);
    return S([...s.toks,tok,numTok(q,'m'),W('años','el año : year (tener … años: to be … years old)',['num'])],cross(s.en,BE[s.ep],[numE(q),String(q)],['years old','']))}
  if(r===2){const n=R(NOUNS.filter(x=>/[tr]/.test(x.tag)&&!x.sgOnly&&!x.tag.includes('$'))),k=chance(.3)?1:0,q=R([2,5,10,12,15,20,21,25,30,31,40,45,50,60,75,80,99,100,120,150,200,300,500]);
    const o=np(n,k,{det:R(['def','def','demo','poss']),pp:R([0,1,3]),dd:R([0,1]),adj:chance(.3)?adjFor(n):null});
    const v=W(k?'cuestan':'cuesta','costar (ue) : to cost',['num'],k?'ellos form, present':'él form, present');
    return S([...o.toks,v,numTok(q,'m'),W(q===1?'dólar':'dólares','el dólar : dollar',['num'])],cross(o.en,k?'cost':'costs',[numE(q),String(q)],'dollars'))}
  const a=R([10,20,30,40,50,100,200,300]),b=R([5,7,12,15,25,50,100]),plus=chance(.6)||b>=a,c=plus?a+b:a-b;
  return S([numTok(a),W(plus?'más':'menos',plus?'más : plus':'menos : minus',['num']),numTok(b),W('son','son : are (in math: equals)',['num']),numTok(c)],
    cross(numE(a),plus?'plus':'minus',numE(b),['is','equals','are','makes'],numE(c)))}

/* clothes and colors: llevar (to wear) + article + piece of clothing + color */
const COLORS=['rojo','azul','verde','blanco','negro','amarillo','anaranjado','morado','rosado','gris'];
function gRopa(){
  const cloth=R(NOUNS.filter(n=>n.tag.includes('r')));
  if(chance(.3))return(()=>{const k=chance(.35)?1:0,q=R([10,15,20,25,30,35,40,50,60,75,80,100,120,150,200]),cm=R(COLORS),col=ADJ.find(a=>a.m===cm);
    const o=np(cloth,k,{det:'def',adj:col}),v=W(k?'cuestan':'cuesta','costar (ue) : to cost',['num'],k?'ellos form, present':'él form, present');
    return S([...o.toks,v,numTok(q,'m'),W('dólares','el dólar : dollar',['num'])],cross(o.en,k?'cost':'costs',[numE(q),String(q)],'dollars'))})();
  const s=subject({pool:PEOPLE}),k=chance(.35)?1:0,cm=R(COLORS),col=ADJ.find(a=>a.m===cm);
  const o=np(cloth,k,{det:R(['indef','indef','def','poss']),pp:R([0,1,3]),adj:col});
  const tok=vtok(vb('llevar'),'pres',s.p);tok.vocab='llevar : to wear, to carry';
  const wear=s.ep===2?['wears','is wearing']:s.ep===0?['wear','am wearing']:['wear','are wearing'],today=chance(.35);
  const toks=[...s.toks,tok,...o.toks,...(today?[W('hoy','hoy : today',['adv'])]:[])];
  return S(toks,[...cross(s.en,wear,o.en,today?'today':''),...(today?cross('today',s.en,wear,o.en):[])])}

/* ---------- uses (identify mode, extra credit, use charts) ---------- */
const USES={
 ser:{name:'ser',word:'ser',list:[
  {id:'serDesc',full:'ser for a description or characteristic',n:'Description',syn:['description','describe','describing','characteristic','characteristics','trait','traits','personality','physical','appearance','what someone is like','permanent','inherent','quality'],what:'what someone or something is like: looks, personality, traits',la:'Ana es alta',en:'Ana is tall'},
  {id:'serOcc',full:'ser for an occupation',n:'Occupation',syn:['occupation','job','profession','career','work','role'],what:'what someone does for a living (no article: es profesor)',la:'Juan es médico',en:'Juan is a doctor'},
  {id:'serOrig',full:'ser for origin',n:'Origin',syn:['origin','from','nationality','where from','where someone is from','hometown'],what:'where someone or something is from: ser de',la:'Luis es de México',en:'Luis is from Mexico'},
  {id:'serTime',full:'ser for telling time',n:'Time and date',syn:['time','telling time','date','hour','clock','dates','day','what time'],what:'the time or the date',la:'Son las tres',en:'It is three o’clock'},
  {id:'serRel',full:'ser for a relationship',n:'Relationship',syn:['relationship','relationships','relation','family','related','relative'],what:'how people are related',la:'Ana es mi hermana',en:'Ana is my sister'}]},
 estar:{name:'estar',word:'estar',list:[
  {id:'estLoc',full:'estar for location',n:'Location',syn:['location','place','where','position','located','place where'],what:'where someone or something is (but events use ser)',la:'El libro está en la mesa',en:'The book is on the table'},
  {id:'estCond',full:'estar for a condition or emotion',n:'Condition or emotion',syn:['condition','emotion','emotions','feeling','feelings','mood','state','temporary','health','how someone feels','conditions'],what:'how someone feels or is right now',la:'Estoy cansado',en:'I am tired'},
  {id:'estProg',full:'estar + -ndo for an action in progress',n:'Action in progress',syn:['action in progress','progressive','present progressive','in progress','action','ongoing','gerund','continuous','happening now'],what:'an action happening right now: estar + -ando / -iendo',la:'Estamos comiendo',en:'We are eating'}]},
 por:{name:'por',word:'por',list:[
  {id:'porThru',full:'por for movement through or along',n:'Through or along',syn:['through','along','around','movement','movement through','by way of','across','motion'],what:'moving through, along or around a place',la:'Camino por el parque',en:'I walk through the park'},
  {id:'porExch',full:'por for an exchange',n:'Exchange or price',syn:['exchange','price','trade','cost','in exchange','payment','pay','money'],what:'trading one thing for another, or a price',la:'Compro el libro por diez dólares',en:'I buy the book for ten dollars'},
  {id:'porDur',full:'por for duration',n:'Duration',syn:['duration','how long','length of time','period','time span','amount of time','length'],what:'how long something lasts',la:'Estudio por dos horas',en:'I study for two hours'},
  {id:'porDay',full:'por for a part of the day',n:'Part of the day',syn:['part of the day','time of day','part of day','morning','afternoon','evening','night','general time'],what:'in the morning, afternoon or at night',la:'Trabajo por la mañana',en:'I work in the morning'},
  {id:'porMeans',full:'por for means of communication',n:'Means of communication',syn:['means','communication','means of communication','by phone','method','by means of','mode','medium'],what:'how something is sent or communicated: por teléfono',la:'Hablo por teléfono',en:'I talk on the phone'}]},
 para:{name:'para',word:'para',list:[
  {id:'paraDest',full:'para for a destination',n:'Destination',syn:['destination','toward','towards','headed','going to','heading','direction','where to'],what:'where someone is headed',la:'Salgo para Madrid',en:'I leave for Madrid'},
  {id:'paraRec',full:'para for a recipient',n:'Recipient',syn:['recipient','receiver','for someone','intended for','beneficiary','who it is for','receive'],what:'who something is for',la:'El regalo es para ti',en:'The gift is for you'},
  {id:'paraPurp',full:'para + infinitive for a purpose',n:'Purpose (in order to)',syn:['purpose','in order to','goal','intention','reason','why','objective','order to'],what:'the goal of an action: in order to',la:'Estudio para aprender',en:'I study in order to learn'},
  {id:'paraDead',full:'para for a deadline',n:'Deadline',syn:['deadline','due','due date','by a time','date due','due by','time limit'],what:'when something is due',la:'La tarea es para mañana',en:'The homework is due tomorrow'}]},
 pret:{name:'Preterite',word:'the preterite',list:[
  {id:'pretDone',full:'the preterite for a completed action',n:'Completed action',syn:['completed','complete','completed action','specific time','finished','one time','single','once','specific','ended','done'],what:'an action finished at a specific time (ayer, anoche)',la:'Ayer comí pan',en:'Yesterday I ate bread'},
  {id:'pretSeq',full:'the preterite for a series of actions',n:'Series of actions',syn:['series','sequence','list','one after another','series of events','chain','steps','order','succession'],what:'actions done one after another',la:'Llegó, comió y salió',en:'He arrived, ate and left'},
  {id:'pretInt',full:'the preterite for an interrupting action',n:'Interrupting action',syn:['interrupting','interrupt','interrupts','interruption','sudden','interrupter','new action','cuts in'],what:'the action that interrupts something already going on',la:'Leía cuando él llegó',en:'I was reading when he arrived'}]},
 impf:{name:'Imperfect',word:'the imperfect',list:[
  {id:'impfHab',full:'the imperfect for a habitual action',n:'Habitual or repeated',syn:['habitual','habit','repeated','routine','used to','always','every day','repetition','often','would','regularly'],what:'what used to happen again and again (todos los días)',la:'Todos los días comía pan',en:'Every day I used to eat bread'},
  {id:'impfBg',full:'the imperfect for an ongoing action',n:'Ongoing (background) action',syn:['ongoing','background','in progress','was ing','interrupted','while','continuous','progressive','setting','scene'],what:'an action that was in progress when something else happened',la:'Leía cuando él llegó',en:'I was reading when he arrived'},
  {id:'impfDesc',full:'the imperfect for time, age or description in the past',n:'Time, age or description',syn:['time','age','description','telling time','weather','clock','describing','past description','feelings'],what:'the time, someone’s age, or a description in the past',la:'Eran las tres',en:'It was three o’clock'}]},
 subj:{name:'Subjunctive',word:'the subjunctive',list:[
  {id:'sjW',full:'the subjunctive after a wish',n:'Wish or want (W)',syn:['wish','wishes','want','wants','desire','will','willing','hope','hopes','preference','prefer'],what:'someone wants, prefers or hopes that someone else does something: quiero que …',la:'Quiero que estudies',en:'I want you to study'},
  {id:'sjR',full:'the subjunctive after a recommendation or request',n:'Recommendation or request',syn:['recommendation','recommend','request','advice','suggest','suggestion','ask','insist','order','command','influence'],what:'someone recommends, suggests or asks that someone do something',la:'Recomiendo que estudies',en:'I recommend that you study'},
  {id:'sjE',full:'the subjunctive after an emotion',n:'Emotion (E)',syn:['emotion','emotions','feeling','feelings','glad','happy','fear','afraid','sad','reaction'],what:'someone has feelings about what someone else does: me alegro de que …',la:'Me alegro de que vengas',en:'I’m glad you’re coming'},
  {id:'sjI',full:'the subjunctive after an impersonal expression',n:'Impersonal expression (I)',syn:['impersonal','impersonal expression','es importante','opinion','expression','es necesario'],what:'es importante que, es necesario que, es bueno que …',la:'Es importante que estudies',en:'It is important that you study'},
  {id:'sjD',full:'the subjunctive after doubt or denial',n:'Doubt or denial (D)',syn:['doubt','denial','deny','uncertainty','disbelief','not believe','unsure','dudar','doubting'],what:'someone doubts or doesn’t believe something: dudo que, no creo que',la:'Dudo que venga',en:'I doubt he will come'},
  {id:'sjO',full:'the subjunctive after ojalá or como si',n:'Ojalá or como si (O)',syn:['ojala','ojalá','como si','as if','as though'],what:'ojalá (que) … (I hope / I wish) and como si (as if)',la:'Ojalá que vengas',en:'I hope you come'},
  {id:'sjA',full:'the subjunctive in an adjective clause',n:'Unknown or nonexistent person or thing',syn:['adjective clause','nonexistent','unknown','indefinite','hypothetical','antecedent','unspecified','does not exist','looking for','relative clause'],what:'describing someone or something that may not exist: busco un libro que sea …',la:'Busco un libro que sea barato',en:'I’m looking for a book that is cheap'},
  {id:'sjAdv',full:'the subjunctive after a conjunction',n:'Conjunction (para que, antes de que, cuando)',syn:['conjunction','adverb clause','para que conjunction','antes de que','cuando','so that','before','future','adverbial','time clause'],what:'para que, antes de que, and cuando about the future',la:'Estudio para que estés contento',en:'I study so that you’re happy'}]}
};
const TYPES={};Object.entries(USES).forEach(([c,u])=>u.list.forEach(x=>TYPES[x.id]=Object.assign(x,{c})));
const TY=cid=>TYPES[cid]?cid:null;
function idQuestion(ty){
  const c=TYPES[ty].c;let q;
  if(c==='ser')q=gSer(ty);else if(c==='estar')q=gEstar(ty);else if(c==='por'||c==='para')q=gPorPara(ty);
  else if(c==='pret'||c==='impf')q=gPvI({pretDone:'hab',impfHab:'hab',pretSeq:'seq',pretInt:'int',impfBg:'int',impfDesc:'desc'}[ty]);
  else q={sjW:()=>gSubj('W'),sjR:()=>gSubj('R'),sjE:()=>gSubj('E'),sjI:()=>gSubj('I'),sjD:()=>gSubj('D'),sjO:gOjala,sjA:gSjAdj,sjAdv:gSjAdv}[ty]();
  return finish(q);
}
/* which uses each topic practices, for identify mode */
const ID_TOPIC={ser:['serDesc','serOcc','serOrig','serTime','serRel'],estar:['estLoc','estCond','estProg'],prog:['estProg'],porpara:Object.keys(TYPES).filter(x=>/^(por|para)/.test(x)),
  pvi:['pretDone','pretSeq','pretInt','impfHab','impfBg','impfDesc'],sjwish:['sjW','sjR'],sjemo:['sjE'],sjimp:['sjI'],sjdoubt:['sjD'],sjadj:['sjA'],sjadv:['sjAdv'],ojala:['sjO'],sjimpf:['sjW','sjR','sjE'],sjperf:['sjE']};
ID_TOPIC.serest=[...ID_TOPIC.ser,...ID_TOPIC.estar];ID_TOPIC.hora=['serTime'];ID_TOPIC.fecha=['serTime'];

/* ---------- topics by course ---------- */
const TOPICS=[
['art','I','Nouns and adjectives','Articles and gender (el, la, un, una)',()=>gC({vf:v=>v.fl.includes('T'),objDet:R(['def','indef']),subjNp:{det:R(['def','indef'])},pron:.3})],
['plur','I','Nouns and adjectives','Plural nouns',()=>gC({vf:v=>v.fl.includes('T'),k:1,ok:1,pron:.15})],
['tricky','I','Nouns and adjectives','Nouns with a surprising gender (el día, la mano)',gTricky],
['adj','I','Nouns and adjectives','Adjective agreement',gAdj],
['poss','I','Nouns and adjectives','Possessive adjectives (mi, tu, su, nuestro)',()=>chance(.5)?gC({vf:v=>v.fl.includes('T'),objNp:possO(),objDet:'poss',pron:.6}):gC({sk:'noun',subjNp:possO(),subjPool:PEOPLE.filter(x=>!x.name)})],
['demo','I','Nouns and adjectives','Demonstratives (este, ese, aquel)',()=>chance(.5)?gC({vf:v=>v.fl.includes('T'),objNp:demoO(),objDet:'demo',pron:.6}):gC({sk:'noun',subjNp:demoO(),subjPool:PEOPLE.filter(x=>!x.name)})],
['par','I','Verbs','Present tense: regular -ar verbs',()=>gC({vf:v=>v.cls==='ar'&&isRegPres(v),pron:.6})],
['per','I','Verbs','Present tense: regular -er verbs',()=>gC({vf:v=>v.cls==='er'&&isRegPres(v),pron:.6})],
['pir','I','Verbs','Present tense: regular -ir verbs',()=>gC({vf:v=>v.cls==='ir'&&isRegPres(v),pron:.6})],
['ser','I','Verbs','ser',()=>gSer()],
['estar','I','Verbs','estar',()=>gEstar()],
['serest','I','Verbs','ser vs. estar',()=>chance(.5)?gSer():gEstar()],
['tener','I','Verbs','tener, tener que and tener expressions',gTener],
['ira','I','Verbs','ir and ir a + infinitive',gIr],
['stem','I','Verbs','Stem-changing verbs (e→ie, o→ue, e→i)',()=>gC({vf:v=>!!v.sc&&!v.refl&&!['poder','decir','tener','venir'].includes(v.base),pron:.6})],
['yogo','I','Verbs','Irregular yo forms (hago, conozco, escojo, sigo, construyo …)',()=>gC({vf:v=>['hacer','poner','salir','traer','conocer','ver','tener','venir','dar','ofrecer','conducir','traducir','escoger','recoger','proteger','seguir','construir','destruir'].includes(v.base),ps:chance(.7)?[0]:null,pron:.8})],
['gustar','I','Verbs','gustar',()=>gGustar(['gustar'])],
['prog','I','Verbs','Present progressive (estar + -ndo)',()=>gC({t:'prog',vcids:['estProg'],adv:chance(.4)?'time':null})],
['inf','I','Verbs','Verb + infinitive (querer, poder, necesitar …)',()=>gModal({mods:['querer','poder','necesitar','preferir','deber']})],
['neg','I','Sentences','Negative sentences',()=>gC({neg:true})],
['ques','I','Sentences','Questions: yes or no, and question words',()=>gQues()],
['hay','I','Sentences','hay (there is, there are)',()=>gHay()],
['pera','I','Sentences','Personal a',()=>gC({vf:v=>/[pa]/.test(v.obj)&&v.base!=='tener',objPool:[...PEOPLE,nn('perro'),nn('gato')]})],
['prep','I','Sentences','Places: a, en, de (al and del)',()=>gC({pool:[...MV,...FROMV,...SV].filter(v=>!v.refl),obj:false,place:true})],
['adv','I','Sentences','Time expressions (hoy, mañana, todos los días)',()=>gC({adv:'time',t:R(['pres','pres','prog','ira'])})],
['hora','I','Everyday Spanish','Telling time (son las tres y cuarto)',gHora],
['fecha','I','Everyday Spanish','Days, months and dates (el primero de mayo)',gFecha],
['clima','I','Everyday Spanish','Weather and seasons (hace frío, está nublado)',gClima],
['nums','I','Everyday Spanish','Numbers to 1,000 (doscientas sillas)',gNum],
['ropa','I','Everyday Spanish','Clothes and colors (llevo una camisa azul)',gRopa],
['pret','II','Past tenses','Preterite: regular verbs',()=>gC({t:'pret',vf:isRegPret,adv:chance(.5)?'time':null})],
['pretsp','II','Past tenses','Preterite: -car, -gar, -zar (yo)',()=>gC({t:'pret',vf:v=>/[cgz]ar$/.test(v.base)&&!v.irr&&!v.refl,ps:chance(.75)?[0]:null,pron:.85})],
['pretirr','II','Past tenses','Preterite: irregular verbs (ir, ser, hacer, tener …)',()=>chance(.15)?gSer(null,'pret'):gC({t:'pret',vf:v=>v.irr&&(v.irr.pst||v.irr.pret)&&!['haber','ser','estar','poder','querer','saber'].includes(v.base)})],
['pretsc','II','Past tenses','Preterite: stem-changing -ir verbs',()=>gC({t:'pret',vf:v=>v.cls==='ir'&&v.sc&&(!v.irr||v.base==='seguir'),ps:[2,5],pron:.4})],
['pretiy','II','Past tenses','Preterite: i → y (leyó, construyeron)',()=>gC({t:'pret',vf:v=>['leer','construir','destruir'].includes(v.base),ps:chance(.75)?[2,5]:null,pron:.4,adv:chance(.4)?'time':null})],
['impf','II','Past tenses','Imperfect',()=>chance(.2)?gSer('serDesc','impf'):gC({t:'impf',adv:chance(.7)?'time':null})],
['pvi','II','Past tenses','Preterite vs. imperfect',()=>gPvI()],
['pperf','II','Past tenses','Present perfect (he comido)',()=>gC({t:'perf',adv:chance(.3)?'time':null})],
['plup','II','Past tenses','Past perfect (había comido)',()=>gC({t:'plup'})],
['presirr','II','Present tense review','Present irregulars, lists 1 and 2 (sé, conozco, juego, escojo, conduzco …)',()=>gC({vf:v=>!!(v.irr||v.sc)&&!['haber','deber'].includes(v.base),pron:.6})],
['refl','II','Pronouns','Reflexive verbs',()=>gC({pool:RV,t:R(['pres','pres','pret']),adv:chance(.5)?'time':null})],
['dop','II','Pronouns','Direct object pronouns (lo, la, los, las)',()=>chance(.25)?gModal({co:{dop:true,vf:v=>v.fl.includes('T')&&!v.refl}}):st(anyC({vf:v=>v.fl.includes('T')&&!v.refl,dop:true,t:R(['pres','pret','prog'])}),{attach:true})],
['iop','II','Pronouns','Indirect object pronouns (me, te, le, les)',()=>gC({pool:DV,io:R(['pron','pron','noun'])})],
['dbl','II','Pronouns','Double object pronouns (se lo, me la)',()=>gC({pool:DV,io:'both',t:R(['pres','pret'])})],
['cmdt','II','Commands','tú commands: affirmative and negative',()=>gCmd('tu',{dopChance:.3})],
['comp','II','Adjectives and adverbs','Comparisons (más … que, tan … como)',gComp],
['sup','II','Adjectives and adverbs','Superlatives',gSup],
['mente','II','Adjectives and adverbs','Adverbs in -mente',()=>gC({adv:'mente'})],
['porpara','II','Sentences','por vs. para',()=>gPorPara()],
['sabcon','II','Sentences','saber vs. conocer',gSabCon],
['likeg','II','Sentences','Verbs like gustar (encantar, fascinar, molestar, aburrir, doler)',()=>gGustar(['encantar','interesar','doler','fascinar','molestar','aburrir'])],
['fut','III','Tenses','Future tense',()=>gC({t:'fut',adv:chance(.5)?'time':null})],
['cond','III','Tenses','Conditional',()=>gC({t:'cond'})],
['sjforms','III','Subjunctive','Present subjunctive: forms',()=>gForm(['spres'])],
['sjwish','III','Subjunctive','Subjunctive: wishes and recommendations',()=>gSubj(R(['W','R']))],
['sjemo','III','Subjunctive','Subjunctive: emotion',()=>gSubj('E')],
['sjimp','III','Subjunctive','Subjunctive: impersonal expressions',()=>gSubj('I')],
['sjdoubt','III','Subjunctive','Subjunctive: doubt and denial',()=>gSubj('D')],
['cmdu','III','Commands','usted, ustedes and nosotros commands',()=>gCmd(R(['ud','uds','nos']))],
['rel','III','Sentences','Relative pronouns (que, quien, lo que)',gRel],
['sepas','III','Sentences','Impersonal and passive se',gSe],
['sjimpf','IV','Subjunctive','Imperfect subjunctive',()=>gSubj(R(['W','R','E','I','D']),{past:true})],
['si','IV','Subjunctive','si clauses (si tuviera …, haría …)',()=>gSi('hyp')],
['sjadj','IV','Subjunctive','Subjunctive in adjective clauses',gSjAdj],
['sjadv','IV','Subjunctive','Subjunctive after para que, antes de que, cuando',gSjAdv],
['sjperf','IV','Subjunctive','Present perfect subjunctive (haya comido)',()=>gSubj('E',{perf:true})],
['futperf','IV','Tenses','Future perfect and conditional perfect',()=>gC({t:R(['futp','condp'])})],
['pass','IV','Sentences','Passive voice (ser + participle)',gPass],
['sipast','AP','Advanced structures','si clauses in the past (si hubiera …, habría …)',()=>gSi('past')],
['ojala','AP','Advanced structures','ojalá and como si',gOjala],
['reported','AP','Advanced structures','Reported speech (dijo que …)',gReported],
['forms','AP','Review','Conjugation sprint: every tense',()=>gForm(['pres','pret','impf','fut','cond','spres','simpf','perf'])],
['mixed','AP','Review','Mixed review: everything',null]
].map(([id,level,group,name,gen])=>({id,level,group,name,gen}));
TOPICS.find(t=>t.id==='mixed').gen=()=>R(TOPICS.filter(t=>t.id!=='mixed'&&t.id!=='forms')).gen();

/* ---------- build your own sentence type ---------- */
const FRAMES=[['stmt','Plain statement'],['neg','Negative statement'],['yn','Yes or no question'],['qw','Question with a question word'],['modal','Verb + infinitive (querer, poder …)'],['ira','ir a + infinitive'],['cmd','tú command'],['si','si clause (si + present)']];
const ING_ALL=[['adj','Adjective agreement','Nouns'],['poss','Possessive adjectives','Nouns'],['demo','Demonstratives','Nouns'],['plur','Plural nouns','Nouns'],['tricky','Nouns with a surprising gender','Nouns'],
 ['pera','Personal a','Objects and extras'],['dop','Direct object pronoun','Objects and extras'],['iop','Indirect object pronoun','Objects and extras'],['place','Place: a, en, de','Objects and extras'],['con','con + a person','Objects and extras'],['adv','Time expression','Objects and extras'],['mente','Adverb in -mente','Objects and extras'],
 ['pres','Present','Tense'],['prog','Present progressive','Tense'],['pret','Preterite','Tense'],['impf','Imperfect','Tense'],['fut','Future','Tense'],['perf','Present perfect','Tense']];
const FRAME_ONLY={},FRAME_NOT={ira:['pret','impf','fut','perf','prog'],cmd:['pret','impf','fut','perf','prog','pres'],si:['pret','impf','fut','perf','prog'],modal:['prog','perf']};
const ingName=id=>(ING_ALL.find(x=>x[0]===id)||[0,id])[1];
function optsFor(set){
  const o={},vf=[];const tense=['pres','prog','pret','impf','fut','perf'].filter(x=>set.has(x));o.t=tense.length?R(tense):'pres';
  const subjObj=()=>chance(.5)?'s':'o';
  if(set.has('adj')){if(subjObj()==='s'){o.sk='noun';o.subjNp=Object.assign(o.subjNp||{},{adj:'auto'})}else{o.objNp=Object.assign(o.objNp||{},{adj:'auto'});vf.push(v=>v.fl.includes('T'))}}
  for(const d of['poss','demo'])if(set.has(d)){const x=d==='poss'?possO():demoO();if(subjObj()==='s'&&!o.subjNp?.det){o.sk='noun';o.subjNp=Object.assign(o.subjNp||{},x);o.subjPool=PEOPLE.filter(n=>!n.name)}else{o.objNp=Object.assign(o.objNp||{},x);o.objDet=x.det;vf.push(v=>v.fl.includes('T'))}}
  if(set.has('plur')){o.k=1;o.ok=1;if(o.sk!=='noun'&&chance(.5))o.sk='noun'}
  if(set.has('tricky')){o.objPool=NOUNS.filter(n=>n.tricky);vf.push(v=>v.fl.includes('T')&&objFor(v).some(n=>n.tricky))}
  if(set.has('pera')){o.objPool=[...PEOPLE,nn('perro'),nn('gato')];vf.push(v=>/[pa]/.test(v.obj)&&v.base!=='tener')}
  if(set.has('dop')){o.dop=true;vf.push(v=>v.fl.includes('T'))}
  if(set.has('iop')){o.io='pron';vf.push(v=>v.fl.includes('D'))}
  if(set.has('place')&&!set.has('iop')){o.place=true;vf.push(v=>/[MFS]/.test(v.fl))}
  if(set.has('con'))o.con=true;
  if(set.has('mente'))o.adv='mente';else if(set.has('adv'))o.adv='time';
  if(vf.length)o.vf=v=>vf.every(f=>f(v))&&!v.refl;
  return o;
}
function B(frame,ings,must){
  let list=[...ings].filter(x=>!(FRAME_NOT[frame]||[]).includes(x));
  for(let tries=0;tries<40;tries++){
    const set=new Set(list);ALT=[];
    try{
      const o=optsFor(set);let q;
      if(frame==='stmt')q=gC(o);
      else if(frame==='neg')q=gC(Object.assign(o,{neg:true}));
      else if(frame==='yn')q=gQues({kind:'yn',co:o});
      else if(frame==='qw')q=gQues({kind:R(set.has('dop')?['quien','cuando']:['que','quien','donde','cuando']),co:o});
      else if(frame==='modal')q=gModal({co:Object.assign(o,{t:'pres'}),t:o.t});
      else if(frame==='ira')q=gModal({mods:['ira'],co:o});
      else if(frame==='cmd')q=gCmd('tu',{co:o});
      else if(frame==='si')q=gSi('open');
      if(q&&q.tokens.length){q.built=[frame,...list];return q}
    }catch(e){if(typeof console!=='undefined'&&tries>35)console.warn(e)}
    if(tries>8&&tries%4===0&&list.length>1){const drop=list.map((x,i)=>i).filter(i=>list[i]!==must);if(drop.length)list.splice(R(drop),1)}
  }
  const q=gC({});q.built=[frame];return q;
}
const fitsFrame=(f,x)=>!(FRAME_NOT[f]||[]).includes(x);
function makeBuilt(frames,ings,per,focus){
  const fF=[...frames].filter(f=>focus&&focus.has(f)),fI=[...ings].filter(x=>focus&&focus.has(x));
  let frame=R([...frames]),must=null;const opts=[...fF.map(f=>['f',f]),...fI.map(x=>['i',x])];
  if(opts.length){const[k,v]=R(opts);if(k==='f')frame=v;else{must=v;const ok=[...frames].filter(f=>fitsFrame(f,v));if(ok.length&&!fitsFrame(frame,v))frame=R(ok)}}
  let pool=[...ings].filter(x=>x!==must).sort(()=>Math.random()-.5);
  const n=per==='all'?pool.length+(must?1:0):Math.min(pool.length+(must?1:0),+per);
  if(must)pool=[must,...pool];
  const q=B(frame,pool.slice(0,n),must),fn=FRAMES.find(f=>f[0]===q.built[0])[1],used=q.built.slice(1);
  q.topic={id:'built',level:'I',name:fn+(used.length?' + '+used.map(ingName).join(' + '):'')};
  return finish(q);
}
const TOPIC_PLAN={adj:{ing:['adj']},poss:{ing:['poss']},demo:{ing:['demo']},plur:{ing:['plur']},tricky:{ing:['tricky']},pera:{ing:['pera']},dop:{ing:['dop']},iop:{ing:['iop']},prep:{ing:['place']},adv:{ing:['adv']},mente:{ing:['mente']},
  prog:{ing:['prog']},pret:{ing:['pret']},impf:{ing:['impf']},fut:{ing:['fut']},pperf:{ing:['perf']},neg:{frame:'neg'},ques:{frame:'yn|qw'},inf:{frame:'modal'},ira:{frame:'ira'},cmdt:{frame:'cmd'}};
function makeFocused(selected,focus){
  const foc=[...focus].filter(x=>selected.has(x));if(!foc.length)return makeQuestion(selected);
  const fid=R(foc),ft=TOPICS.find(t=>t.id===fid),plan=TOPIC_PLAN[fid];
  const extras=[...selected].filter(x=>x!==fid&&TOPIC_PLAN[x]&&TOPIC_PLAN[x].ing);
  if(plan&&extras.length&&chance(.65)){
    const ex=TOPIC_PLAN[R(extras)],frame=plan.frame?R(plan.frame.split('|')):'stmt';
    const q=B(frame,[...new Set([...(plan.ing||[]),...ex.ing])],plan.ing?plan.ing[0]:null);
    const extraNames=q.built.slice(1).filter(x=>!(plan.ing||[]).includes(x)).map(ingName);
    q.topic=Object.assign({},ft,{name:ft.name+(extraNames.length?' + '+extraNames.join(' + '):'')});return finish(q);
  }
  return makeQuestion(new Set([fid]));
}
function makeQuestion(selected){
  ALT=[];const pid=R([...selected]),topic=TOPICS.find(t=>t.id===pid)||TOPICS[0];let q;
  for(let i=0;i<12;i++){try{q=topic.gen();if(q&&q.tokens&&q.tokens.length)break}catch(e){if(i>10)console.warn(e)}}
  if(!q)q=gC({});
  q.topic=topic;
  if(q.form)q.tokens[0].blank=true;
  return finish(q);
}
/* final touches: the displayed sentence, which charts fit it */
const CHART_OF={pres:'pres',prog:'prog',pret:'pret',impf:'impf',fut:'futcond',cond:'futcond',perf:'perf',plup:'perf',futp:'perf',condp:'perf',sperf:'perf',splup:'perf',spres:'subj',simpf:'simpf',ira:'pres'};
function finish(q){
  q.altTokens=q.altTokens||[];q.alts=q.alts||[];
  q.display=(q.end==='?'?'¿':q.end==='!'?'¡':'')+esJoin(q.tokens);
  const ch=new Set();
  for(const t of q.tokens){if(t.t&&CHART_OF[t.t])ch.add(CHART_OF[t.t]);if(t.cids&&t.cids.some(c=>/^cmd/.test(c)))ch.add('cmd');if(t.cids&&t.cids.some(c=>['art','adj','poss','demo','tricky'].includes(c)))ch.add('agree');if(t.cids&&t.cids.some(c=>['do','io','refl'].includes(c)))ch.add('pron');
    if(t.vb&&['ser','estar','ir','tener'].includes(t.vb.base)&&t.t==='pres')ch.add('irrpres');
    if(t.cids)for(const[c,k]of[['hora','hora'],['fecha','fecha'],['clima','clima'],['num','nums']])if(t.cids.includes(c))ch.add(k);}
  if(q.tokens.some(t=>t.cids&&t.cids.includes('gustar')))ch.add('pron');
  q.charts=[...ch].slice(0,4);if(!q.charts.length)q.charts=['pres'];
  return q;
}

/* ---------- checking answers ---------- */
const CLASH=new Set('el tu mi si se te de mas que como donde cuando quien esta este ese esa estas estos solo aun ano sabia hablo hable compro llego llegue mire mira tome tomo'.split(' '));
const wordsS=s=>contract(String(s).toLowerCase().normalize('NFC').replace(/[.,!?;:"“”¿¡«»()]/g,' ').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim()).split(' ').filter(Boolean);
function candsOf(ts,cap=600){let c=[[]];for(const t of ts){const opts=[t.la,...(t.alt||[])];if(t.opt)opts.push('');c=c.flatMap(x=>opts.map(o=>[...x,o]));if(c.length>cap)c=c.slice(0,cap)}return c.map(x=>wordsS(x.filter(Boolean).join(' ')))}
function gradeTokens(sets,input){
  const u=wordsS(input);if(!u.length)return{ok:false,empty:true};
  const cands=sets.flatMap(ts=>candsOf(ts)),uk=u.join(' '),us=stripA(uk);
  if(cands.some(c=>c.join(' ')===uk))return{ok:true};
  const c=cands.find(c=>stripA(c.join(' '))===us);if(!c)return{ok:false};
  const forms=new Set(sets.flat().flatMap(t=>(t.forms||[]).map(f=>f.toLowerCase())));
  const clash=u.filter((w,i)=>w!==c[i]&&(CLASH.has(w)||forms.has(w)));
  return clash.length?{ok:false,essential:clash}:{ok:true,macron:true,missing:u.filter((w,i)=>w!==c[i]).map((w,i)=>w)};
}
const grade=(tok,input)=>gradeTokens([[tok]],input);
const gradeLatin=(q,input)=>gradeTokens([q.tokens,...(q.altTokens||[])],input);
const normE=s=>(' '+String(s).toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[’‘]/g,"'")+' ')
  .replace(/\bwon't\b/g,'will not').replace(/\bcan't\b/g,'cannot').replace(/\bshan't\b/g,'shall not').replace(/n't\b/g,' not').replace(/\bcannot\b/g,'can not')
  .replace(/\bi'm\b/g,'i am').replace(/'re\b/g,' are').replace(/\b(he|she|it|that|what|who|there|here|where|when)'s\b/g,'$1 is').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will').replace(/'d\b/g,' would')
  .replace(/\bgonna\b/g,'going to').replace(/\by'all\b|\byou guys\b|\byou all\b/g,'you').replace(/\bin order to\b/g,'to').replace(/\bo'clock\b/g,'oclock')
  .replace(/\b(\d{1,2}):(\d\d)\b/g,(m,h,mm)=>' '+numE(+h)+' '+(mm==='00'?'oclock':(mm[0]==='0'?'oh ':'')+numE(+mm))+' ').replace(/\b(\d{1,4})(st|nd|rd|th)\b/g,(m,d)=>' '+numOrd(+d)+' ')
  .replace(/\b\d{1,3},\d{3}\b|\b\d{1,4}\b/g,m=>{const n=+m.replace(',','');return n<=1000?' '+numE(n)+' ':m}).replace(/\ba (hundred|thousand)\b/g,'one $1').replace(/\b([ap])\.?\s?m\b\.?/g,' $1m ').replace(/\bhundred and\b/g,'hundred')
  .replace(/[^a-z' ]/g,' ').replace(/\b(the|a|an)\b/g,' ').replace(/\s+/g,' ').trim();
function gradeEnglish(q,input){
  const u=normE(input);if(!u)return{ok:false,empty:true};
  return[q.en,...(q.enAlt||[])].some(v=>normE(v)===u)?{ok:true}:{ok:false};
}
const latinOf=ts=>esJoin(ts);
if(typeof module!=='undefined')module.exports={setLimit,makeBuilt,makeFocused,makeQuestion,TOPIC_PLAN,FRAMES,ING_ALL,TOPICS,B,grade,gradeLatin,gradeEnglish,idQuestion,USES,TYPES,VERBS,NOUNS,ADJ,vf,vphrase,finish};

