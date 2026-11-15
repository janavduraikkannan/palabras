/* Grader v4: code compares words using Whitaker's grammar and definitions, and the model only judges whether two plain sentences mean the same. */
(function(root){
const FAM={
 noun:'nom acc dat datref placeTo placeFrom sep means accomp manner placeWhere cause town voc appos gen gendat genpart genso genmat d1 d2 d2er d3 d45 tricky medsum pron demo datposs ablcomp partgen ddat',
 adj:'adj12 adj3 comp sup adv',
 tense:'pa1 pa2 pa3 pa3i pa4 fut impf perf plup sum esse dep irr sync',
 passive:'agent ppas fpas ipas perfpas pperi',
 inf:'inf pinf indst indst2 indst3',
 clause:'purpose result indcmd indq cumcl fear cond sjpres sjimpf sjperf hort relpurp supine gerv pcond fcond',
 question:'ques',relative:'rel',participle:'ppart abs',conj:'conj gap imp devices'};
const familyOf={};for(const f in FAM)FAM[f].split(' ').forEach(t=>familyOf[t]=f);
const HINT={
 noun:'Who does what, and singular or plural, must match. "Gives X to Y" and "gives Y X" are the same.',
 adj:'The adjective must describe the same noun, and positive, comparative and superlative must match.',
 tense:'The tense must match.',
 passive:'Passive must stay passive. Progressive English such as "are being helped" is fine.',
 inf:'Infinitive constructions keep the same time relation. English may drop "that".',
 clause:'The clause must keep its meaning. Equivalent constructions are fine.',
 question:'A question must stay a question.',
 relative:'The relative pronoun must play the same role in its clause.',
 participle:'Timing and who does what must match. A clause may replace a participle.',
 conj:'-que and et both mean and.'};
/* Extra hints for question types where the model is known to fail. */
const TOPIC={
 indcmd:['English: "ordered X to do Y" is right; "ordered X and did Y" is wrong.','Right: imperō + dative + ut + subjunctive, or iubeō + accusative + infinitive. Wrong: mixing the two.'],
 result:['"So X that Y" must stay a result. "Because" is wrong.','Tam or ita with ut + subjunctive is required.'],
 purpose:['"To", "in order to" and "so that" all show purpose. "Because" is wrong.','Right: ut, quī, ad + gerundive, or causā + gerundive. Wrong: indicative, or a bare infinitive.'],
 fear:['"Fear that X may" is positive and "fear that X may not" is negative.','After a verb of fearing, nē means that, and ut means that not.'],
 cumcl:['"When" and "while" both fit an imperfect clause. The verb tense must still match.','Right: cum, dum, postquam, or an ablative absolute, with the same time relation. Wrong: a different time relation.'],
 abs:['Keep it literal: "with X doing Y". A while, when or after clause is wrong.','Right: cum or dum clause, or ablative noun with ablative participle. Wrong: nominative noun and participle.'],
 indst:['English may drop "that".','Accusative and infinitive only. Wrong: quod, or an indicative verb.'],
 indst2:['English may drop "that".','Accusative and infinitive only. Wrong: quod, or an indicative verb.'],
 indst3:['English may drop "that".','Accusative and infinitive only. Wrong: quod, or an indicative verb.'],
 comp:['','Right: quam, or the ablative without quam.'],
 genpart:['"Many of the kings" and "many kings" are the same.','Right: partitive genitive, or ex + ablative.'],
 means:['"Using" and "with" are the same. "And" is wrong.','Means takes the bare ablative. Cum is wrong.'],
 accomp:['"Together with" and "with" are the same. "And" is wrong.',''],
 hort:['"Let" and "may" are the same.','Must be subjunctive.'],
 rel:['Commas and "who are" phrasing do not matter.',''],
 imp:['Word order does not matter for a person being addressed.',''],
 ppart:['A participle may become "who are doing". Tense must match.','']};
/* What each question type must keep when an instruction names a construction. */
const STRICT=new Set('datposs ablcomp supine gerv ddat relpurp pperi'.split(' '));
const VERBS='rule govern reign control|conquer defeat overcome beat vanquish|free liberate release|frighten scare terrify|delight please charm entertain amuse|warn advise caution|kill slay murder|capture seize catch take|carry bring bear transport|lead guide bring take|leave depart exit withdraw|hurry rush hasten|receive take get accept obtain|give present grant deliver|deliver hand give|show display reveal|return restore|recall summon|call summon|find discover locate|notice spot observe perceive see|watch observe|await expect|scold blame reproach criticize rebuke reprimand chastise castigate|praise commend|destroy ruin demolish wreck|save rescue|protect guard defend|hinder impede block hamper|throw hurl fling cast|admire wonder|fear dread|think believe suppose|want wish desire|love like|order command|tell narrate relate|stay remain|walk stroll|seek|deceive trick fool|help aid assist|teach instruct|prevent keep stop|live dwell|work labor toil|hope|touch|prepare ready|announce report|defend protect|encourage urge|beg plead';
const WORDS='bad evil wicked|sad gloomy sorrowful unhappy|wretched miserable unhappy poor|happy glad joyful cheerful|famous renowned celebrated well-known|fierce savage|brave courageous|wise|huge enormous large big great|small little tiny|annoying irritating bothersome|swift fast quick|tired weary exhausted|greedy|lucky fortunate|honest upright|charioteer driver|townsperson townsman|stranger foreigner newcomer visitor|inn shop tavern|wagon cart|story tale|enemy foe|inhabitant resident|harbor port|house cottage hut home|road way street|leader general commander|slave servant|ship boat|farmhouse villa|gift present|anger rage|neighbor neighbour|friend ally|spear javelin|grandfather grandpa|forest woods|sailor seaman|citizen|poison venom';
const LATIN='super vinc|interfic nec occid|disced ab exi exe abi abe|iuv adiuv|epistul litter|don dan dar dat dab ded trad|delect oblect|inven reper|serv conserv|port fer tul|tang atting attig|fall decip|tim meta verer|narr dic|spect vid|prohib arc|custod defend|reprehend vitupera castig|ambul|mon admon|regn reg|cont ten|voc arcess';
const IRREG={took:'take',taken:'take',brought:'bring',led:'lead',caught:'catch',gave:'give',given:'give',held:'hold',told:'tell',taught:'teach',found:'find',kept:'keep',left:'leave',ran:'run',sat:'sit',saw:'see',seen:'see',went:'go',knew:'know',known:'know',fought:'fight',slew:'slay',slain:'slay',sought:'seek',sent:'send',threw:'throw',thrown:'throw',overcame:'overcome',beat:'beat',beaten:'beat',said:'say',heard:'hear',thought:'think',bore:'bear',borne:'bear',got:'get',won:'win',cast:'cast',came:'come',ate:'eat',began:'begin',bought:'buy',built:'build',chose:'choose',did:'do',drew:'draw',drove:'drive',fell:'fall',felt:'feel',flew:'fly',grew:'grow',hid:'hide',lay:'lie',lost:'lose',made:'make',meant:'mean',met:'meet',paid:'pay',rode:'ride',rose:'rise',rang:'ring',slept:'sleep',spoke:'speak',stood:'stand',stole:'steal',swam:'swim',wept:'weep',wore:'wear',wrote:'write',written:'write',broke:'break',spent:'spend',shot:'shoot',sang:'sing',led:'lead'};
/* Extra synonyms from WordNet (Princeton), limited to the English glosses in Verba's vocabulary. */
const WN='abandon vacate empty wantonness unconstraint wildness|able capable|absent remove lacking missing wanting|ancient antediluvian|anger choler ire angriness|angry furious raging tempestuous wild|announce denote declare|annoying bothersome galling irritating nettlesome pesky pestering pestiferous plaguy plaguey teasing vexatious vexing annoyance irritation vexation|arrow pointer|ask require expect|athens athinai|await expect look wait|bad big badness|barbarian barbaric savage uncivilized uncivilised wild peasant boor churl goth tyke tike|beg implore pray solicit tap|believe think consider conceive trust|blame fault pick charge blasted blamed blessed damn damned darned deuced goddam goddamn goddamned infernal incrimination inculpation rap|body personify|brave weather endure courageous audacious dauntless fearless hardy intrepid unfearing|bring convey take work play wreak|call name telephone phone ring|capture enamour trance catch becharm enamor captivate beguile charm fascinate bewitch entrance enchant get seizure|care wish like attention aid tending caution precaution forethought|carry transport pack take impart conduct transmit convey channel|cart haul hale drag handcart pushcart|cave undermine spelunk|charioteer auriga|city metropolis|come arrive get semen seed ejaculate cum|concern refer pertain relate touch interest occupy worry care fear|conquer suppress subdue appropriate capture seize|corinth korinthos|crete kriti|crowd herd crew gang bunch|crown coronate top|cup transfuse cupful|danger risk peril|daughter girl|deceive delude cozen betray|defeat overcome kill licking frustration|defend support guard hold|delight please enjoy revel enchant enrapture transport enthrall ravish enthral delectation joy pleasure|depart deviate vary diverge part start|desire want hope trust|destroy destruct ruin demolish|dog chase trail tail tag track frump|encourage promote advance boost further|enemy foe foeman opposition|famous celebrated famed illustrious notable noted renowned|farmer husbandman granger sodbuster|father beget get engender mother sire generate begetter forefather|fear dread fearfulness fright concern care|fierce ferocious furious savage tearing vehement violent|fight contend struggle oppose defend battle conflict engagement fighting combat scrap|find happen chance bump encounter detect observe discover notice regain discovery breakthrough uncovering|follow postdate|food nutrient|forest afforest wood woods woodland timberland timber|fortify strengthen fort arm gird|forum assembly|free liberate release unloose unloosen loose rid disembarrass dislodge|friend ally|frighten fright scare affright|gift endow indue empower invest endue give present endowment talent|girl miss missy fille|give yield afford spring springiness|god deity divinity immortal|gold golden gilded aureate gilt amber|good full goodness|grandfather gramps granddad grandad granddaddy grandpa|great outstanding|greedy avaricious covetous grabby grasping prehensile avid devouring esurient|greek grecian hellenic hellene|guard ward defend hold|hand pass reach give manus mitt paw|happy felicitous|harbor harbour hold entertain nurse seaport haven|hear learn discover see try|help assist aid facilitate assistance assistant helper supporter|hinder impede obstruct blockade block stymie stymy embarrass handicap hamper back hind|hindrance hinderance deterrent impediment balk baulk check handicap hitch preventive preventative encumbrance incumbrance interference|hold keep maintain throw have make give clasp clench clutch clutches grasp grip appreciation|honest honorable|hope trust desire|horn tusk|house domiciliate firm|huge immense vast brobdingnagian|hurry speed zip rush hasten festinate haste hastiness hurriedness precipitation|inhabitant habitant dweller denizen indweller|inn hostel hostelry lodge auberge|joke jest gag laugh jape jocularity|joy rejoice gladden joyousness joyfulness delight pleasure|keep maintain hold continue proceed support livelihood living sustenance donjon dungeon|kill defeat killing|king rex queen|know cognize cognise|land bring ground soil|lead take direct conduct guide leave result|letter missive|lie dwell consist prevarication|live populate dwell inhabit survive last endure unrecorded|love enjoy passion|master overcome subdue surmount dominate chief main primary principal maestro overlord lord|messenger courier|middle mediate center halfway midway centre heart eye|monster giant goliath behemoth colossus|mother fuss overprotect beget get engender father sire generate|mountain mount batch deal flock hatful heap lot mass mess mickle mint muckle passel peck pile plenty pot raft sight slew spate stack wad|near approach close nigh|neighbor neighbour|new fresh novel|notice detect observe find discover mark note comment remark observation observance|order tell enjoin say prescribe dictate|part separate split break depart start portion component constituent|pirate commandeer hijack highjack plagiarist plagiarizer plagiariser buccaneer|poison envenom toxicant|praise congratulations kudos extolment|prepare fix ready set cook make|present show demo exhibit demonstrate represent stage nowadays|punish penalize penalise|read say|receive have get find obtain incur|refuse decline reject defy resist garbage scraps|rhodes rodhos|road route|roman romanic|rome roma|rose roseate rosaceous rosebush|rule govern decree predominate dominate reign prevail regulation convention normal pattern formula|run scat scarper lam bunk escape pass lead extend tally test trial|safety refuge|sail sweep canvas canvass sheet cruise|sailor crewman bluejacket|save salvage salve relieve preserve|say state tell allege aver suppose|scold rebuke rag trounce lecture reprimand jaw chide berate remonstrate lambaste lambast grouch grumble scolder nag nagger|sea ocean|see understand realize realise witness find|seek search try attempt essay assay|send direct mail post|ship transport send embark|show demo exhibit present demonstrate prove establish shew testify evidence display|silver silvern silvery|sister sis|slave striver|sleep kip slumber sopor|slow decelerate retard slack slacken|small little minor modest|son boy word logos|spear lance shaft gig fizgig fishgig|stay remain rest stick bide abide arrest check halt hitch stop stoppage|story narrative narration tale|stranger alien unknown|student pupil educatee scholar bookman|swift fleet|sword blade brand steel|teach learn instruct thatch blackbeard|tell state say narrate recount recite|think believe consider conceive opine suppose imagine reckon guess cogitate cerebrate|through done|throw shed cast drop|time clock clip|tired banal commonplace hackneyed shopworn stock threadbare timeworn trite|topmost uppermost upmost|touch stir touching|town townspeople townsfolk|tree corner|vergil virgil|victory triumph|wagon waggon|walk walking pass|want desire need require privation deprivation neediness lack deficiency|warn discourage admonish monish|watch observe follow view see catch ticker|water irrigate|why wherefore|wicked sinful unholy|wide broad blanket encompassing extensive panoptic|wise judicious heady|wish care like wishing want|work act|write compose pen indite';
const SYN={};for(const g of (VERBS+'|'+WORDS+'|'+WN).split('|')){const ws=g.split(' ');ws.forEach(w=>{(SYN[w]=SYN[w]||new Set()).add(g)})}
const STEM=LATIN.split('|').map(g=>g.split(' '));
const strip=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const words=s=>strip(s).replace(/[^a-z'\- ]+/g,' ').replace(/ - |^- | -$/g,' ').split(/\s+/).filter(Boolean);
function lev(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
const prefix=(a,b)=>{let i=0;while(i<a.length&&a[i]===b[i])i++;return i};
const suffix=(a,b)=>{let i=0;while(i<a.length&&i<b.length&&a[a.length-1-i]===b[b.length-1-i])i++;return i};
const ART=new Set(['a','an','the']);
const CLOSED=new Set('sum es est sumus estis sunt eram eras erat eramus eratis erant ero eris erit erimus eritis erunt sim sis sit simus sitis sint essem esses esset essemus essetis essent fui fuit fuerunt qui quae quod cuius cui quem quam quo qua quos quas quibus quorum quarum'.split(' '));
const ALT={di:'dei',dis:'deis',diis:'deis',mi:'mihi',nil:'nihil'};
function lemma(w){
 if(IRREG[w])return[IRREG[w]];const o=[w];
 for(const [re,to] of [[/iest$/,'y'],[/ier$/,'y'],[/est$/,''],[/est$/,'e'],[/er$/,''],[/er$/,'e'],[/ies$/,'y'],[/es$/,''],[/s$/,''],[/ied$/,'y'],[/ed$/,''],[/ed$/,'e'],[/d$/,''],[/ing$/,''],[/ing$/,'e']])if(re.test(w))o.push(w.replace(re,to));
 for(const x of [...o])if(/(.)\1$/.test(x))o.push(x.slice(0,-1));
 return o;
}
const groups=w=>{const out=new Set();for(const l of lemma(w))if(SYN[l])SYN[l].forEach(g=>out.add(g));return out};
const inflect=w=>IRREG[w]?'past':/ing$/.test(w)?'ing':/(ed)$/.test(w)?'past':/[^s]s$/.test(w)?'s':'bare';
const sameGroup=(a,b)=>{const g=groups(b);for(const x of groups(a))if(g.has(x))return true;return false};
const plural=(a,b)=>a+'s'===b||a+'es'===b||b+'s'===a||b+'es'===a||a.replace(/y$/,'ies')===b||b.replace(/y$/,'ies')===a;
const latinStem=(a,b)=>{for(const g of STEM){const hit=w=>g.some(s=>w.startsWith(s)||w.includes(s)&&w.indexOf(s)<=3);if(g.some(s=>s.length>=3&&a.startsWith(s))&&g.some(s=>s.length>=3&&b.startsWith(s))&&!g.some(s=>a.startsWith(s)&&b.startsWith(s)))return true;if(hit(a)&&hit(b)&&a!==b&&suffix(a,b)>=4)return true}return false};
const degree=(w,e)=>w.endsWith('e')?w+e.slice(1):w.endsWith('y')?w.slice(0,-1)+'i'+e:w+e;
const tidy=s=>tidy0(s).replace(/\blet's\b/gi,'let us').replace(/^\s*let us\b/i,'we').replace(/^\s*may we\b/i,'we').replace(/^\s*(let|may)\s+/i,'').replace(/^\s*(do|does|is|are|am)\s+(?=(the|a|an|you|we|i|he|she|they)\b)/i,'').replace(/\b(find|finds)\s+out\b/gi,(m,v)=>v.toLowerCase()==='finds'?'discovers':'discover').replace(/\bfound\s+out\b/gi,'discovered').replace(/\bused to\s+/gi,'').replace(/\b(was|were)\s+(?=\w+ing\b)/gi,'').replace(/\b(is|are|am) going to\b/gi,'will').replace(/\bshall\b/gi,'will').replace(/\b(am|is|are) able to\b/gi,'can').replace(/\b(was|were) able to\b/gi,'could').replace(/\b(go|goes)\s+away\s+from\b/gi,(m,v)=>v.toLowerCase()==='goes'?'departs from':'depart from').replace(/\baway from\b/gi,'from').replace(/\b(many|few|some) of\b/gi,'$1').replace(/\bout of\b/gi,'from').replace(/\bbecause of\b/gi,'from').replace(/\bget(s?)\s+(\w+\s+\w+)\s+ready\b/gi,(m,e,o)=>`prepare${e} ${o}`).replace(/\blook(s?|ing)? for\b/gi,(m,e)=>'seek'+(e||'')).replace(/\bwatch(es|ing)? over\b/gi,(m,e)=>e==='es'?'guards':e?'guarding':'guard').replace(/\bgo(es)? away\b/gi,(m,e)=>e?'departs':'depart').replace(/\bmarvel(s?) at\b/gi,(m,e)=>'admire'+e).replace(/\bplead(s?) with\b/gi,(m,e)=>'beg'+e).replace(/\balong with\b/gi,'with').replace(/\b(cups?) of (gold|silver)\b/gi,(m,c,g)=>`${g.toLowerCase()==='gold'?'golden':'silver'} ${c}`).replace(/\bmore ([a-z]+)\b/gi,(m,w)=>degree(w.toLowerCase(),'er')).replace(/\bmost ([a-z]+)\b/gi,(m,w)=>degree(w.toLowerCase(),'est')).replace(/\bso that (?:he|she|it|they|we|you|i) (?:may|might) /gi,'to ').replace(/\b(am|is|are)\s+being\s+(?=\w)/gi,'$1 ').replace(/\b(am|is|are)\s+(?=\w+ing\b)(?!going to)/gi,'').replace(/\b(have|has)\s+been\b/gi,m=>/have/i.test(m)?'were':'was').replace(/\b(have|has)\s+(?=\w+(ed|en|ght|t)\b)/gi,'').replace(/\b(his|her|their|its|my|your|our)\b/gi,' ').replace(/\bdinner guest/gi,'guest').replace(/\b(know|knows|think|thinks|say|says|hope|hopes|believe|believes|that)\s+that\b/gi,'$1');
const tidy0=s=>s.replace(/\((pl|sg)\.?\)/gi,' ').replace(/\([^)]*\)/g,' ').replace(/\byou all\b/gi,'you')
 .replace(/\bwell-known\b/gi,'famous').replace(/\bneighbour/gi,'neighbor').replace(/\bharbour/gi,'harbor')
 .replace(/\b([A-Za-z]+)'s\s+(?:(few|many|new|old|good|bad)\s+)?([a-z]+)\b/g,(m,o,x,n)=>`${x?x+' ':''}${n} of ${o}`).replace(/\b([A-Za-z]+s)'\s+([a-z]+)\b/g,'$2 of $1')
 .replace(/\b(call|calls|called|calling)\s+(\w+)\s+back\b/gi,(m,v,o)=>`${v.replace(/call/i,'recall')} ${o}`).replace(/\b(call|calls|called|calling)\s+back\b/gi,(m,v)=>v.replace(/call/i,'recall'))
 .replace(/\b(give|gives|gave|given|giving)\s+back\b/gi,(m,v)=>({give:'return',gives:'returns',gave:'returned',given:'returned',giving:'returning'}[v.toLowerCase()]))
 .replace(/\b(hand|hands|handed|handing)\s+over\b/gi,(m,v)=>v.toLowerCase().replace('hand','deliver'))
 .replace(/\b(be|being|been|is|are|was|were|am)\s+set\s+free\b/gi,'$1 freed').replace(/\b(set|sets|setting)\s+(?:(\w+\s+\w+)\s+)?free\b/gi,(m,v,o)=>`${v.toLowerCase()==='sets'?'frees':v.toLowerCase()==='setting'?'freeing':'free'}${o?' '+o:''}`)
 .replace(/\b(wait|waits|waited|waiting)\s+for\b/gi,(m,v)=>v.toLowerCase().replace('wait','await'))
 .replace(/\bcatch(es)? sight of\b/gi,(m,e)=>e?'notices':'notice').replace(/\bcaught sight of\b/gi,'noticed')
 .replace(/\b(am|is|are)\s+afraid\s+(of|that)\b/gi,(m,v,p)=>`fear${p.toLowerCase()==='that'?' that':''}`).replace(/\b(was|were)\s+afraid\s+of\b/gi,'feared').replace(/\b(was|were)\s+afraid\s+that\b/gi,'$1 fearing that').replace(/\b(wonder|wonders|wondered)\s+at\b/gi,(m,v)=>v)
 .replace(/\bin order to\b/gi,'to').replace(/\btogether with\b/gi,'with').replace(/\bin front of\b/gi,'before')
 .replace(/\bwith care\b/gi,'carefully').replace(/\bwith anger\b/gi,'angrily').replace(/\bwith joy\b/gi,'joyfully').replace(/\bwith sadness\b/gi,'sadly');
function pairUp(s,r,kind,syn){
 s=[...s];r=[...r];const out=[];
 for(let i=s.length-1;i>=0;i--){const j=r.indexOf(s[i]);if(j>=0){s.splice(i,1);r.splice(j,1)}}
 for(let i=s.length-1;i>=0;i--)for(let j=0;j<r.length;j++){const v=syn(s[i],r[j]);if(v){if(v!==true)out.push(v);s.splice(i,1);r.splice(j,1);break}}
 const cand=[];s.forEach(a=>r.forEach(b=>{const p=prefix(a,b),l=lev(a,b);if(p>=3||l<=2&&Math.min(a.length,b.length)>=4)cand.push({a,b,score:p*2-l})}));
 cand.sort((x,y)=>y.score-x.score);
 for(const c of cand){if(!s.includes(c.a)||!r.includes(c.b))continue;s.splice(s.indexOf(c.a),1);r.splice(r.indexOf(c.b),1);out.push(kind(c.a,c.b))}
 if(s.length===1&&r.length===1)out.push({t:'meaning',a:s[0],b:r[0]});
 else{s.forEach(a=>out.push({t:'added',a}));r.forEach(b=>out.push({t:'missing',b}))}
 return out;
}
const undouble=w=>w.replace(/(.)\1/g,'$1');
const kindLa=(x,y)=>({t:lev(x,y)<=2&&suffix(x,y)>=4||x!==y&&undouble(x)===undouble(y)||lev(x,y)===1&&Math.abs(x.length-y.length)===1&&suffix(x,y)>=3?'slip':'ending',a:x,b:y});
const sortL=w=>[...w].sort().join('');
const degBase=w=>w.replace(/(iest|ier|est|er|y|e)$/,'').replace(/(.)\1$/,'$1');
const swapped=(x,y)=>{if(x.length!==y.length||x.length<5)return false;const d=[];for(let i=0;i<x.length;i++)if(x[i]!==y[i])d.push(i);return d.length===2&&d[1]===d[0]+1&&x[d[0]]===y[d[1]]&&x[d[1]]===y[d[0]]};
const kindEn=(x,y)=>{
 if(x!==y&&x.length>=5&&(undouble(x)===undouble(y)||swapped(x,y)))return{t:'typo',a:x,b:y};
 if(plural(x,y))return{t:'number',a:x,b:y};
 const shared=lemma(x).some(l=>lemma(y).includes(l)),past=w=>inflect(w)==='past';
 if(shared&&past(x)!==past(y))return{t:'tense',a:x,b:y};
 if(degBase(x)===degBase(y)&&/(er|est)$/.test(x+' '+y)&&(/(er|est)$/.test(x)||/(er|est)$/.test(y)))return{t:'degree',a:x,b:y};
 if(x[0]===y[0]&&x.length>=4&&sortL(x)===sortL(y))return{t:'typo',a:x,b:y};
 return{t:Math.min(x.length,y.length)>=6&&lev(x,y)<=2&&suffix(x,y)>=2?'typo':'form',a:x,b:y}};
/* Whitaker's readings, kept as {l: lemma, t: grammar tags, d: definition words}. */
const NUMB={1:'sg',2:'pl',s:'sg',p:'pl',singular:'sg',plural:'pl'};
const STOP=new Set('the and for with from away out make made have has get one man thing things who that this which into upon not etc put let very come goes used also person off over back'.split(' '));
function parseEntries(data,word){
 const real=f=>word==null||String((f.stem||'')+(f.ending||'')).replace(/j/g,'i').replace(/v/g,'u')===String(word).replace(/j/g,'i').replace(/v/g,'u');
 const tr=(data&&(data.translations||(data.data&&data.data.translations)))||[],out=[];
 for(const t of tr.slice(0,4)){
  const tags=[];
  for(const f of (t.inflections||[])){
   const n=f.number==null?'':(NUMB[String(f.number).toLowerCase()]||f.number),adj=/adj|part/.test(String(f.pos));
   const tag=[f.pos,f.case,f.tense,f.voice,f.mood,f.person?'p'+f.person:'',n,adj?String(f.gender||'').slice(0,1):''].filter(Boolean).join(' ').toLowerCase();
   if(tag&&!tags.includes(tag))tags.push(tag);
  }
  const defs=(t.definitions||[]).filter(x=>!/syncop/i.test(x)).join('; ').toLowerCase();
  out.push({l:String((t.forms||[])[0]||'').toLowerCase(),t:tags.slice(0,10),d:defs.slice(0,400),r:(t.inflections||[]).some(real),s:Math.min(99,...(t.inflections||[]).filter(real).map(f=>String(f.stem||'').length))});
 }
 return out;
}
const defWords=e=>new Set(e.d.replace(/\([^)]*\)/g,' ').split(/[;,]/).filter(p=>!/\b(back|away|off|out|up|down|over|forth|on)\s*$/.test(p.trim())).join(' ').replace(/[^a-z ]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)));
const sameLemma=(A,B)=>A.some(a=>a.l&&B.some(b=>b.l===a.l));
const shareTag=(A,B)=>A.some(a=>B.some(b=>a.l!==undefined&&a.t.some(t=>b.t.includes(t))));
const defsOverlap=(A,B)=>A.some(a=>{const w=[...defWords(a)];return B.some(b=>a.l!==b.l&&[...defWords(b)].some(x=>w.includes(x)||w.some(y=>x.length>3&&y.length>3&&sameGroup(x,y))))});
const definedAs=(e,w)=>{const d=defWords(e);return lemma(w).some(l=>d.has(l))};
function compare(q,ans,G){
 G=G||{};
 if(q.e2l){
  const fix=w=>ALT[w]||w,r=words(q.model).map(fix),st=words(ans).map(fix);
  const split=(arr,other)=>arr.flatMap(w=>{if((q.topic==='ques'||(G[w.slice(0,-2)]||[]).length&&!CLOSED.has(w)&&w.length>=7)&&w.length>4&&w.endsWith('ne'))return[w.slice(0,-2),'-ne'];for(const e of['que','ne','ve'])if(w.length>e.length+2&&w.endsWith(e)&&!other.includes(w)&&other.includes(w.slice(0,-e.length)))return[w.slice(0,-e.length),'-'+e];return[w]});
  const a=split(st,r),b=split(r,st),ea=a.filter(w=>CLOSED.has(w)&&!b.includes(w)),eb=b.filter(w=>CLOSED.has(w)&&!a.includes(w));
  const syn=(x,y)=>{
   const X=(G[x]||[]).filter(e=>e.r!==false),Y=G[y]||[];
   if(!X.length&&!Y.length&&undouble(x)!==undouble(y)&&!latinStem(x,y))return{t:'ending',a:x,b:y};
   /* One letter added or lost inside the stem is a spelling slip; inside the ending it isn't. */
   if(Math.abs(x.length-y.length)===1&&lev(x,y)===1&&y.length>=5&&Y.length){
    const short=x.length<y.length?x:y,long=x.length<y.length?y:x;let at=0;while(at<short.length&&short[at]===long[at])at++;
    const uv=t=>t.replace(/v/g,'u').replace(/[^a-z]/g,''),e=Y[0],l=uv(e.l),yy=uv(y);let n=0;while(n<l.length&&n<yy.length&&l[n]===yy[n])n++;
    const stem=e.s&&e.s<99?e.s:n;if(at>0&&at<stem&&at<y.length-1)return{t:'slip',a:x,b:y};
   }
   {const pv=w=>(G[w]||[]).slice(0,1).some(e=>e.t.some(t=>/passive/.test(t)&&/p2 sg/.test(t))),pf=w=>(G[w]||[]).some(e=>e.t.some(t=>/perfect/.test(t)&&/p3 pl/.test(t))),vb=w=>(G[w]||[]).slice(0,1).some(e=>e.t.some(t=>/^verb/.test(t)));if(y.endsWith('erunt')&&x===y.slice(0,-3)+'e'&&pf(y)||x.endsWith('erunt')&&y===x.slice(0,-3)+'e'&&pf(x)||y.endsWith('ris')&&x===y.slice(0,-2)+'e'&&pv(y)&&vb(x)||x.endsWith('ris')&&y===x.slice(0,-2)+'e'&&pv(x)&&vb(y))return true}
   if(X.length&&Y.length&&sameLemma(X,Y)&&!shareTag(X,Y)&&undouble(x)!==undouble(y)){
    if(sameLemma(X,Y)&&(q.topic==='cond'||q.topic==='fcond')&&ans.split(',')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(x)&&X.some(e=>e.t.some(t=>/future perfect/.test(t)&&Y.some(f=>f.t.some(u=>/\bfuture active/.test(u)&&u.slice(-5)===t.slice(-5))))))return true;
    const firstPerson=words(q.model).some(w=>/^(sum|es|sumus|estis|eram|eras|eramus|eratis|ero|eris|erimus|eritis|sim|sis|simus|sitis|essem|esses|essemus|essetis)$/.test(w)),bare=t=>t.replace(/ [mfnc]$/,'');
    if(firstPerson&&!/^(sum|es|sumus|estis|sim|sis|simus|sitis)$/.test(y)&&X.some(a=>a.t.some(t=>/^(adjective|participle) nom/.test(t)&&Y.some(b=>b.t.some(u=>bare(u)===bare(t))))))return true;
    return{t:'ending',a:x,b:y,hard:true}}
   if(/^litter/.test(x)&&/^epistul/.test(y)||/^epistul/.test(x)&&/^litter/.test(y))return true;
   if(!X.length&&Y.length&&(undouble(x)===undouble(y)||lev(x,y)<=2&&suffix(x,y)>=3))return{t:'slip',a:x,b:y};
   if(X.length&&Y.length){
    if(sameLemma(X,Y))return{t:'ending',a:x,b:y,hard:true};
    if(prefix(x,y)>=3&&lev(x,y)<=2&&undouble(x)!==undouble(y))return{t:'ending',a:x,b:y,hard:true};
    if(defsOverlap(X,Y)||latinStem(x,y))return shareTag(X,Y)?true:{t:'synonym',a:x,b:y};
    return false;
   }
   return x.length>2&&y.length>2&&latinStem(x,y)?(suffix(x,y)>=2&&x.slice(-2)===y.slice(-2)&&suffix(x,y)>=4?true:{t:'synonym',a:x,b:y}):false};
  const reIs=/īs$/;const raw=words(ans.replace(/īs\b/g,'īs'));
  if(ea.length===1&&eb.length===1&&!(ea[0]==='quod'))return[...pairUp(a.filter(w=>w!==ea[0]),b.filter(w=>w!==eb[0]),kindLa,syn),{t:'ending',a:ea[0],b:eb[0]}];
  const longIs=new Set(ans.split(/\s+/).filter(w=>/īs[,.?]?$/.test(w)).map(w=>words(w)[0]));
  return pairUp(a,b,kindLa,syn).filter(c=>!(c.t==='ending'&&c.b.endsWith('es')&&c.a===c.b.slice(0,-2)+'is'&&longIs.has(c.a)));
 }
 const r=words(tidy(q.model)).filter(w=>!ART.has(w)),s=words(tidy(ans)).filter(w=>!ART.has(w));
 const src=latinWords(q.src).flatMap(w=>G[w]||[]);
 const syn=(x,y)=>{
  if(plural(x,y)||degBase(x)===degBase(y)&&(/(er|est)$/.test(x)!==/(er|est)$/.test(y)||x.slice(-2)!==y.slice(-2)))return false;
  const same=lemma(x).includes(y)||lemma(y).includes(x)||lemma(x).some(l=>lemma(y).includes(l));
  const ix=inflect(x),iy=inflect(y),present=i=>i==='ing'||i==='bare'||i==='s';
  if(same&&(ix==='past')!==(iy==='past'))return{t:'tense',a:x,b:y};
  if(same)return present(ix)&&present(iy)&&(ix==='ing'||iy==='ing')?true:false;
  if(!sameGroup(x,y)&&!src.some(e=>definedAs(e,x)&&definedAs(e,y)))return false;
  return ix===iy||present(ix)&&present(iy)&&(ix==='ing'||iy==='ing')?true:{t:'form',a:x,b:y}};
 return pairUp(s,r,kindEn,syn).filter(c=>!(c.t==='meaning'&&src.some(e=>definedAs(e,c.a))&&!src.some(e=>definedAs(e,c.b))));
}
function facts(s){
 const t=' '+words(tidy0(s)).join(' ')+' ',f=new Set();
 if(/ (will|shall|going to)\b|'ll /.test(t))f.add('future');
 if(/ had /.test(t))f.add('pluperfect');
 if(/ (was|were) (\w+ )?\w+ing |used to |would be \w+ing /.test(t)&&!/ were \w+ing .* would /.test(t)||/ (was|were) being /.test(t))f.add('imperfect');
 const r=t.replace(/ (is|are|am) going to /g,' ');
 if(/ (am|is|are) /.test(r))f.add('present');
 if(/ (was|were) /.test(r)&&!f.has('imperfect'))f.add('past');
 return f;
}
const isPassive=s=>/\b(am|is|are|was|were|be|been|being)\b.*\bby\b/.test(strip(s));
const NEG=/\b(not|never|no|nor|nothing|neither|don't|doesn't|didn't|won't)\b/;
const OPP=[['to','from'],['with','without'],['good','bad'],['good','evil'],['happy','sad'],['big','small'],['into','out']];
const opposite=(a,b)=>OPP.some(([x,y])=>a===x&&b===y||a===y&&b===x);
const show=c=>c.t==='added'?`"${c.a}" doesn't belong`:c.t==='missing'?`"${c.b}" is missing`:`"${c.a}" should be "${c.b}"`;
const reasonFrom=c=>c.length?'Check this: '+c.slice(0,3).map(show).join('; ')+'.':'This doesn’t match the reference.';
function codeVerdict(q,ans,c,G){
 const no=(reason)=>({got:false,reason}),yes={got:true,reason:''},types=c.map(x=>x.t);
 const every=(...t)=>c.length>0&&types.every(x=>t.includes(x));
if(q.e2l){
  const a=words(ans),r=words(q.model);
  if(q.topic==='genpart'&&c.length===2){const p=c.find(x=>x.t==='added'&&/^(e|ex)$/.test(x.a)),g=c.find(x=>x.t==='ending'),A=g&&(G[g.a]||[]),B=g&&(G[g.b]||[]);if(p&&g&&A.length&&B.length&&sameLemma(A,B)&&A.some(e=>e.t.some(t=>/\babl\b.*\bpl\b/.test(t)))&&B.some(e=>e.t.some(t=>/\bgen\b.*\bpl\b/.test(t))))return yes}
  if(q.topic==='imp'&&r.includes('ne')&&a.some(w=>w==='noli'||w==='nolite')){const pl=a.includes('nolite'),aa=a.filter(w=>w!=='noli'&&w!=='nolite'),rr=r.filter(w=>w!=='ne'),x=aa.filter(w=>!rr.includes(w)),y=rr.filter(w=>!aa.includes(w));if(x.length===1&&y.length===1&&sameLemma(G[x[0]]||[],G[y[0]]||[])&&(G[x[0]]||[]).some(e=>e.t.some(t=>/infinitive/.test(t)))&&(G[y[0]]||[]).some(e=>e.t.some(t=>new RegExp('imperative p2 '+(pl?'pl':'sg')).test(t))))return yes}
  if(q.topic==='sync'&&!c.length&&a.join(' ')!==r.join(' '))return no('Use the shortened form the exercise asks for.');
  if(c.some(x=>x.hard))return no(reasonFrom(c.filter(x=>x.hard)));
  if(q.topic==='ques'&&c.some(x=>x.t==='missing'&&x.b==='-ne')&&!a.some(w=>w==='num'||w==='nonne'))return no('A yes-or-no question needs -ne on its first word.');
  if(q.topic==='means'&&a.includes('cum')&&!r.includes('cum'))return no('Means takes the ablative alone, without cum.');
  if(/^indst/.test(q.topic)&&a.includes('quod'))return no('Use the accusative and infinitive, not quod.');
  if(q.topic==='purpose'&&!a.some(w=>['ut','ne','qui','quae','quod','ad','causa'].includes(w)))return no('A purpose clause needs ut, or an equivalent, with the subjunctive.');
  if(q.topic==='indcmd'&&!a.some(w=>['ut','ne'].includes(w)||w.startsWith('iub')||w.startsWith('iuss')))return no('An indirect command needs ut with the subjunctive.');
  if(a.includes('non')!==r.includes('non')&&!(q.topic==='fear'))return no('The negative doesn’t match the reference.');
  if(q.topic==='fear'&&(a.includes('ut')!==r.includes('ut')||a.includes('ne')!==r.includes('ne')||a.includes('non')!==r.includes('non')))return no('After a verb of fearing, nē means “that” and ut means “that not”.');
  if(STRICT.has(q.topic)&&c.some(x=>x.t==='added'||x.t==='missing'))return no('Use the construction the exercise asks for.');
  {const OK=new Set(['ego','tu','nos','vos','esse','et','-ne']),lost=c.filter(x=>x.t==='missing'&&!OK.has(x.b)),extra=c.filter(x=>x.t==='added');if(lost.length>extra.length)return no(`“${lost[0].b}” is missing.`)}
  if(every('ending'))return no(reasonFrom(c));
  if(every('slip')&&q.topic!=='sync')return yes;
  if(!c.length)return yes;
  if(every('synonym','slip')&&!/fut|fpas/.test(q.topic)&&c.filter(x=>x.t==='synonym').every(x=>x.a.slice(-2)===x.b.slice(-2)&&!/(ba|bi|bu|era|eri)[a-z]{0,3}$/.test(x.a)&&!/(ba|bi|bu|era|eri)[a-z]{0,3}$/.test(x.b)))return yes;
  return null;
 }
 const ar=words(tidy(ans)),rr=words(tidy(q.model));
 {const x=words(ans),y=words(q.model);if(x.length===y.length&&x.some((w,i)=>w!==y[i])&&x.every((w,i)=>w===y[i]||w.length>=5&&(undouble(w)===undouble(y[i])||swapped(w,y[i]))))return yes}
 const isQ=s=>/\?\s*$/.test(s)||/^(do|does|did|is|are|am|was|were|will|can|who|what|why|how|where)\b/i.test(s.trim());
 if(q.topic==='ques'&&isQ(q.model)&&!isQ(ans))return no('This must stay a question.');
 if(c.some(x=>x.t==='tense'))return no(reasonFrom(c.filter(x=>x.t==='tense')));
 if(c.some(x=>x.t==='degree')&&/comp|sup/.test(q.topic))return no(reasonFrom(c.filter(x=>x.t==='degree')));
 if(ar.some(w=>NEG.test(w))!==rr.some(w=>NEG.test(w)))return no('The negative doesn’t match the reference.');
 const bad=c.find(x=>x.t==='meaning'&&opposite(x.a,x.b));if(bad)return no(reasonFrom([bad]));
 const rel=w=>w.find(x=>x==='who'||x==='whom'||x==='whose');if(rel(ar)&&rel(rr)&&rel(ar)!==rel(rr))return no('The relative pronoun’s role changed.');
 const ly=c.find(x=>(x.t==='form'||x.t==='meaning'||x.t==='added'||x.t==='missing')&&(rr.some(w=>/ly$/.test(w)&&ar.includes(w.replace(/ily$/,'y').replace(/ly$/,'')))||ar.some(w=>/ly$/.test(w)&&rr.includes(w.replace(/ily$/,'y').replace(/ly$/,'')))));if(ly)return no('An adverb and an adjective aren’t the same here.');
 if(words(q.model).includes('back')&&!words(ans).includes('back')&&/\b(give|gives|gave|given|call|calls|called)\b/i.test(ans))return no('“Back” matters here: this is “give back” or “call back”.');
 if(q.topic==='hort'&&/^(let|may)\b/i.test(q.model.trim())&&!/^(let|may)\b/i.test(ans.trim()))return no('This is a wish or suggestion, so it needs “let” or “may”.');
 const FN=new Set('let may to of that the a an do does did is are was were be been being in on at by with for from it there this his her their its he she they we you i who whom whose which one ones up out away'.split(' '));
 const content=(t,k)=>c.filter(x=>x.t===t).map(x=>x[k]).filter(w=>!FN.has(w)&&!w.endsWith("'s"));
 const lost=content('missing','b'),extra=content('added','a');
 if(lost.length>extra.length)return no(`“${lost[0]}” is missing.`);
 {const QW=new Set(['why','how','when','where','who','whom','whose','what','which']),TW=new Set(['always','never','often','sometimes','rarely','seldom','today','tomorrow','yesterday','now','then','soon','later']);const p=c.find(x=>x.t==='meaning'&&(QW.has(x.a)&&QW.has(x.b)||TW.has(x.a)&&TW.has(x.b)));if(p)return no(`Check this: "${p.a}" should be "${p.b}".`)}
 if(adjMoved(q,ans,G))return no('The adjective describes a different noun here.');
 if(ofMoved(q,ans,G))return no('The “of” phrase belongs to a different noun here.');
 if(ar.includes('and')&&!rr.includes('and'))return no('“And” changes how this sentence fits together.');
 if(ar.includes('because')&&!rr.includes('because')&&q.topic!=='cause')return no('“Because” changes the meaning of this clause.');
 if(q.topic==='sup'&&ar.includes('very'))return no('“Very” isn’t the same as “most”: this is a superlative.');
 if(q.topic==='abs'&&!ar.includes('with')&&!ar.includes('having'))return no('Translate this literally: “with X having been …”.');
 if(/result/.test(q.topic)&&!ar.includes('so')&&!ar.includes('such'))return no('This must stay a result: “so … that”.');
 if(q.topic==='indq'&&rr.includes('why')&&!ar.includes('why'))return no('The question word must stay “why”.');
 const fa=facts(q.model),fb=facts(ans);
 for(const k of['future','pluperfect','imperfect'])if(fa.has(k)!==fb.has(k)&&!(q.topic==='cond'&&k==='imperfect'&&fb.has('future')===false&&fa.has('imperfect')&&fb.has('past')))return no(fa.has(k)?`The tense should be ${k}.`:`The tense shouldn’t be ${k}.`);
 if(fa.has('present')&&fb.has('past')&&!fb.has('present')||fa.has('past')&&fb.has('present')&&!fb.has('past')&&!fa.has('present'))return no('The tense doesn’t match the reference.');
 if(isPassive(q.model)&&!isPassive(ans))return no('The reference is passive, but this is active.');
 if(c.some(x=>x.t==='number'))return no(reasonFrom(c.filter(x=>x.t==='number')));
 if((!c.length||every('typo'))&&seqSame(q,ans,G))return yes;
 return null;
}
/* An adjective must stay on the noun it describes in the reference. */
function adjMoved(q,ans,G){
 const a=words(tidy(ans)).filter(w=>!ART.has(w)),b=words(tidy(q.model)).filter(w=>!ART.has(w));
 const adjE=latinWords(q.src).flatMap(w=>(G[w]||[])).filter(e=>e.t.some(t=>/^adj/.test(t))),nounE=latinWords(q.src).flatMap(w=>(G[w]||[])).filter(e=>e.t.some(t=>/^noun/.test(t)));
 const like=(x,y)=>x===y||x.length>=6&&lev(x,y)<=2||sameGroup(x,y)||lemma(x).some(l=>lemma(y).includes(l))||adjE.concat(nounE).some(e=>definedAs(e,x)&&definedAs(e,y));
 for(let i=0;i+1<b.length;i++){
  const w=b[i];if(!adjE.some(e=>definedAs(e,w))||nounE.some(e=>definedAs(e,w)))continue;
  const n=b[i+1];if(!nounE.some(e=>definedAs(e,n)))continue;
  const j=a.findIndex(x=>like(x,w));if(j<0)continue;
  if(j+1>=a.length||!like(a[j+1],n)&&b.includes(a[j+1]))return true;
 }
 return false;
}
function ofMoved(q,ans,G){
 const a=words(tidy(ans)).filter(w=>!ART.has(w)),b=words(tidy(q.model)).filter(w=>!ART.has(w)),src=latinWords(q.src).flatMap(w=>(G||{})[w]||[]);
 const like=(x,y)=>x===y||x.length>=6&&lev(x,y)<=2||sameGroup(x,y)||lemma(x).some(l=>lemma(y).includes(l))||src.some(e=>definedAs(e,x)&&definedAs(e,y));
 for(let i=1;i+1<b.length;i++){
  if(b[i]!=='of')continue;
  for(let j=1;j+1<a.length;j++)if(a[j]==='of'&&like(a[j+1],b[i+1])&&!like(a[j-1],b[i-1])&&b.includes(a[j-1]))return true;
 }
 return false;
}
function seqSame(q,ans,G){
 const ADV=w=>/ly$/.test(w)||['often','always','never','now','sometimes','soon','then','still','today'].includes(w);
 const a=words(tidy(ans)).filter(w=>!ART.has(w)&&!ADV(w)),b=words(tidy(q.model)).filter(w=>!ART.has(w)&&!ADV(w)),src=latinWords(q.src).flatMap(w=>(G||{})[w]||[]);
 if(a.length!==b.length)return false;
 return a.every((w,i)=>w===b[i]||!b.includes(w)&&(sameGroup(w,b[i])||lev(w,b[i])<=2||lemma(w).some(l=>lemma(b[i]).includes(l))||src.some(e=>definedAs(e,w)&&definedAs(e,b[i]))));
}
const lineFor=c=>c.t==='meaning'?`Does "${c.a}" mean the same as "${c.b}" here?`:c.t==='synonym'?`"${c.a}" and "${c.b}" are synonyms. Check only that tense and person match.`:c.t==='added'?`Student added "${c.a}".`:c.t==='missing'?`Student left out "${c.b}".`:c.t==='form'?`"${c.a}" replaces "${c.b}".`:`"${c.a}" replaces "${c.b}" (ending differs).`;
function leadingMessages(q,ans){
 const c=compare(q,ans),hint=HINT[familyOf[q.topic]]||'',extra=(TOPIC[q.topic]||['',''])[q.e2l?1:0];
 const sys=(q.e2l?'Check a student\'s Latin against a correct reference. Word order is free. A real Latin synonym is right: never reject a word only because it differs. Different constructions with the same meaning are right. A wrong ending, or any change in meaning, is wrong.'
  :'Check a student\'s English translation against a correct reference. A synonym is right: never reject a word only because it differs. Natural rephrasing with the same meaning is right. Any change to who does what, number, tense or voice is wrong.')
  +' Reply with JSON only: {"correct":true} or {"correct":false}.';
 const list=c.map(lineFor).join('\n')||(q.e2l?'':'The words match, but the order differs. Check who does what.');
 const user=`Exercise: ${q.src}\nReference: ${q.model}\nStudent: ${ans}\n${list}\nHint: ${hint}${extra?' '+extra:''}`;
 return [{role:'system',content:sys},{role:'user',content:user}];
}
/* Plain-English rendering of the student's Latin, so the model compares two sentences it can read. */
const latinWords=s=>strip(s).replace(/\([^)]*\)/g,' ').replace(/[^a-z ]+/g,' ').split(/\s+/).filter(Boolean);
function lookupWords(s){const o=[];for(const w of latinWords(s)){o.push(w);for(const e of['que','ne','ve'])if(w.length>e.length+2&&w.endsWith(e))o.push(w.slice(0,-e.length))}return o}
const ROLE={nom:'doer',acc:'receiver',gen:'of',dat:'to or for',abl:'by, with or from',voc:'addressed'};
const WHO={'p1 sg':'I','p2 sg':'you','p3 sg':'he or she','p1 pl':'we','p2 pl':'you all','p3 pl':'they'};
function gloss(e){return e.d.split(/[;,]/)[0].replace(/\([^)]*\)/g,'').trim().split(' ').slice(0,3).join(' ')}
function renderWord(w,G,hint){
 const E=G[w]||[];if(!E.length)return w;
 const e=(hint||[]).length&&E.find(x=>hint.some(h=>definedAs(x,h)))||E[0],g=gloss(e),t=e.t;
 const verb=t.find(x=>/^verb/.test(x));
 if(verb){const who=Object.keys(WHO).find(k=>verb.includes(k)),bits=[who?WHO[who]:'',(verb.match(/present|imperfect|future perfect|future|pluperfect|perfect/)||[''])[0],/passive/.test(verb)?'passive':'',/subjunctive/.test(verb)?'subjunctive':'',/infinitive/.test(verb)?'infinitive':'',/imperative/.test(verb)?'command':''].filter(Boolean).join(', ');return `${g} [${bits}]`}
 const cases=[...new Set(t.map(x=>(x.match(/\b(nom|acc|gen|dat|abl|voc)\b/)||[])[1]).filter(Boolean))].map(c=>ROLE[c]);
 if(cases.length){const pl=t.every(x=>/\bpl\b/.test(x));return `${g}${pl?' (plural)':''} [${cases.slice(0,2).join(' or ')}]`}
 return g;
}
/* Every form and meaning the dictionary gives, compressed, for words the model needs to weigh. */
const SHORT={present:'pres',imperfect:'impf',future:'fut',perfect:'perf',pluperfect:'plup','future perfect':'futperf',active:'act',passive:'pass',indicative:'ind',subjunctive:'subj',imperative:'imper',infinitive:'inf',noun:'noun',verb:'verb',adjective:'adj',participle:'part'};
function formsLine(t){
 const groups={};
 for(const tag of t){const m=tag.match(/^(\S+) (nom|acc|gen|dat|abl|voc|loc) ?(.*)$/);if(m){const k=[SHORT[m[1]]||m[1],m[3]].join(' ').trim();(groups[k]=groups[k]||[]).push(m[2])}else{const k=tag.replace(/future perfect|present|imperfect|future|pluperfect|perfect|active|passive|indicative|subjunctive|imperative|infinitive/g,w=>SHORT[w]).replace(/\bp(\d) (sg|pl)/,'$1$2');groups[k]=groups[k]||[]}}
 return Object.entries(groups).map(([k,c])=>c.length?`${k.split(' ')[0]} ${[...new Set(c)].join('/')} ${k.split(' ').slice(1).join(' ')}`.trim():k).slice(0,5).join('; ');
}
function meanings(e){return e.d.replace(/\*/g,'').split(/[;,]/).map(x=>x.replace(/\([^)]*\)/g,'').trim()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,6).join(', ')}
function fullWord(w,G){
 let E=(G[w]||[]);
 for(const e of['que','ne','ve'])if(!E.length&&w.endsWith(e))E=G[w.slice(0,-e.length)]||[];
 if(!E.length)return `${w}: not in the dictionary`;
 return `${w}: `+E.slice(0,3).map(e=>`${formsLine(e.t)} = ${meanings(e)}`).join(' OR ');
}
const KEY='Case key: nom = doer, acc = receiver, gen = of, dat = to or for, abl = by, with or from, voc = person addressed, loc = in or at. sg = one, pl = more than one. An adverb describes the action. An adjective describes a noun.';
const fullBlock=(s,G)=>latinWords(s).map(w=>fullWord(w,G)).join('\n');
/* Only the words code flagged, so the model gets the meanings it needs and nothing else. */
function helpLines(q,ans,G){
 const c=compare(q,ans,G),lines=[],seen=new Set();
 const add=w=>{if(seen.has(w))return;seen.add(w);const E=G[w]||[];if(E.length)lines.push(`${w} can mean: ${E.slice(0,2).map(meanings).join('; ')}`)};
 if(q.e2l){for(const x of c){if(x.a&&x.a[0]!=='-')add(x.a);if(x.b&&x.b[0]!=='-')add(x.b)}}
 else{const flagged=c.flatMap(x=>[x.a,x.b]).filter(Boolean);for(const w of latinWords(q.src))if((G[w]||[]).some(e=>flagged.some(f=>definedAs(e,f))))add(w)}
 return lines.slice(0,3);
}
function targetedMessages(q,ans,G){
 const m=meaningMessages(q,ans,G),h=helpLines(q,ans,G);
 if(!h.length)return m;
 return[{role:'system',content:m[0].content.replace(SAME,'Dictionary lines list accepted meanings of Latin words, and any listed meaning is right. '+SAME)},{role:'user',content:`Dictionary:\n${h.join('\n')}\n${m[1].content}`}];
}
const ERR='Reply with JSON only: {"error":"the exact words that are wrong"} or {"error":null}.';
function wrongMessages(q,ans,G){
 const extra=(TOPIC[q.topic]||['',''])[q.e2l?1:0],hint=extra?'\nNote: '+extra:'';
 if(q.e2l){
  const added=compare(q,ans,G).filter(c=>c.t==='added'||c.t==='missing').map(c=>c.t==='added'?`Extra word: ${c.a}.`:`Left out: ${c.b}.`).join(' ');
  return[{role:'system',content:'Sentence B is a word-by-word reading of a student\'s Latin. Each word shows its meaning and its role. Word order does not matter. Try to prove B wrong with a fact: a different doer or receiver, a different action, singular or plural, or tense. A synonym is not an error. Do not invent an error. '+ERR},{role:'user',content:`A: ${q.src}\nB: ${latinWords(ans).map(w=>renderWord(w,G,words(q.src))).join(' / ')}${added?'\n'+added:''}${hint}`}];
 }
 return[{role:'system',content:'A is a correct translation and B is a student\'s translation. Try to prove B wrong with a fact: a different doer or receiver, a different action, tense or direction, an adjective on a different noun, an adverb turned into an adjective, or a lost word that matters. Word order alone and synonyms are not errors. Do not invent an error. '+ERR},{role:'user',content:`A: ${q.model}\nB: ${ans}${hint}${oneWord(q,ans,G)}`}];
}
/* When one word is all that differs, say so, so a long sentence can't hide it. */
function oneWord(q,ans,G){
 if(q.e2l)return'';
 const c=compare(q,ans,G);
 return c.length===1&&c[0].t==='meaning'?`\nOnly difference: B has "${c[0].a}" where A has "${c[0].b}". Decide only whether these two words mean nearly the same here.`:'';
}
function rightMessages(q,ans,G){
 const m=meaningMessages(q,ans,G),c=q.e2l?[]:compare(q,ans,G),one=c.length===1&&c[0].t==='meaning';
 const user=one?`${m[1].content.replace(/\nNote:[^\n]*/,'')}\nThe only different word: "${c[0].b}" became "${c[0].a}". A close synonym is true. A different meaning is false.`:m[1].content;
 return[{role:'system',content:'Try to prove that B is correct. '+m[0].content},{role:'user',content:user}];
}
/* A proof only counts if the words it quotes are really in the sentences. */
function readProof(text,prompt){
 const t=String(text||'').replace(/<think>[\s\S]*?<\/think>/g,'');
 if(/"error"\s*:\s*null/i.test(t))return{found:false,quote:'',read:true};
 const m=t.match(/"error"\s*:\s*"([^"]*)/i);if(!m)return{found:false,quote:'',read:false};
 const q=strip(m[1]).replace(/\bvs\b\.?/g,' ').replace(/[^a-z' ]+/g,' ').trim(),hay=' '+strip(prompt).replace(/[^a-z' ]+/g,' ').replace(/\s+/g,' ')+' ';
 return{found:!!q&&q.split(/\s+/).every(w=>hay.includes(' '+w+' ')),quote:m[1],read:true};
}
function tieMessages(q,ans,G,quote){
 const m=meaningMessages(q,ans,G),body=m[1].content.split('\nNote:')[0];
 const ask=quote?`Look only at "${quote}". Does it change the meaning of B compared with A?`:'Is there one specific change in meaning between A and B?';
 return[{role:'system',content:`${ask} A synonym is not a change. Reply with JSON only: {"changes":true} or {"changes":false}.`},{role:'user',content:body}];
}
function readTie(text){const m=String(text||'').match(/"changes"\s*:\s*(true|false)/i);return m?m[1].toLowerCase()==='true':null}
/* DeepSeek can read Latin, so it gets the real sentences and the course rules. */
function serverMessages(q,ans){
 const rules='You grade a Latin course. Translations must be literal. The same doer, receiver, action, tense, voice, mood, number and case roles are required. An adjective must stay on the same noun and an adverb must stay an adverb. Superlatives need most or -est, and very is wrong. An ablative absolute stays literal: with X having been Y. Synonyms are right, and so are small spelling slips in a word stem. Wrong Latin endings are wrong. A yes-or-no Latin question needs -ne. A missing word is wrong. Output exactly one JSON object and no other text. Its "correct" field is true or false. If false, add a "reason" field of a few words.';
 const user=q.e2l?`English to translate: ${q.src}\nCorrect Latin: ${q.model}\nStudent's Latin: ${ans}`:`Latin to translate: ${q.src}\nCorrect English: ${q.model}\nStudent's English: ${ans}`;
 return[{role:'system',content:rules},{role:'user',content:user}];
}
/* The model sometimes thinks aloud in its reply, so its last complete answer is the one that counts. */
function readServer(text){
 const all=[...String(text||'').matchAll(/\{\s*"correct"\s*:\s*(true|false)\s*(?:,\s*"reason"\s*:\s*"([^"]*)"\s*)?\}/gi)].filter(m=>!/under 12 words/i.test(m[2]||''));
 if(!all.length)return{got:null,reason:''};
 const m=all[all.length-1];return{got:m[1].toLowerCase()==='true',reason:m[2]||''};
}
function fullMessages(q,ans,G){
 const extra=(TOPIC[q.topic]||['',''])[q.e2l?1:0],hint=extra?'\nNote: '+extra:'';
 if(q.e2l){
  const added=compare(q,ans,G).filter(c=>c.t==='added'||c.t==='missing').map(c=>c.t==='added'?`Extra word: ${c.a}.`:`Left out: ${c.b}.`).join(' ');
  return[{role:'system',content:'A student translated English A into Latin. The list shows every grammar form each student word could be, and all its meanings. Choose the forms that fit the sentence. Could the student\'s Latin mean the same as A: the same doer, receiver, action, singular or plural, and tense? Any listed meaning or a close synonym is fine. Word order does not matter. '+KEY+' '+SAME},{role:'user',content:`A: ${q.src}\nStudent's Latin:\n${fullBlock(ans,G)}${added?'\n'+added:''}${hint}`}];
 }
 return[{role:'system',content:'A is the correct translation of a Latin sentence, and B is a student\'s translation. The list shows every grammar form each Latin word could be, and all its meanings. Choose the forms that fit the sentence. Is B a correct translation? Any listed meaning or a close synonym is fine, and word order in B does not matter unless it changes who does what. B is wrong if the doer, the receiver, the action, or what an adverb or adjective describes changes, or if something is added or lost. '+KEY+' '+SAME},{role:'user',content:`Latin words:\n${fullBlock(q.src,G)}\nA: ${q.model}\nB: ${ans}${hint}`}];
}
const SAME='Reply with JSON only: {"same":true} or {"same":false}.';
function meaningMessages(q,ans,G){
 const extra=(TOPIC[q.topic]||['',''])[q.e2l?1:0],hint=extra?'\nNote: '+extra:'';
 if(q.e2l){
  const added=compare(q,ans,G).filter(c=>c.t==='added'||c.t==='missing').map(c=>c.t==='added'?`Extra word: ${c.a}.`:`Left out: ${c.b}.`).join(' ');
  return[{role:'system',content:'Sentence B is a word-by-word reading of a student\'s Latin. Each word shows its meaning and its role. Word order does not matter. Do A and B say the same thing: the same doer, the same receiver, the same action, the same singular or plural, and the same tense? Synonyms are fine. '+SAME},{role:'user',content:`A: ${q.src}\nB: ${latinWords(ans).map(w=>renderWord(w,G,words(q.src))).join(' / ')}${added?'\n'+added:''}${hint}`}];
 }
 return[{role:'system',content:'Do sentences A and B say the same thing? B may use different words with a similar meaning, and that counts as the same. Answer false only if a different person does the action, a different thing receives it, the action or a description becomes a different one, the direction changes, or something is added or lost. Examples: "The king rules the town" and "the king governs the town": true. "The slave touches the wall" and "the slave reaches the wall": true. "The god sees the man" and "the man sees the god": false. "The man has a new cup" and "the man has an old cup": false. '+SAME},{role:'user',content:`A: ${q.model}\nB: ${ans}${hint}`}];
}
function readGrade(text){
 const t=String(text||'').replace(/<think>[\s\S]*?<\/think>/g,'');
 const m=t.match(/"(?:same|correct)"\s*:\s*(true|false)/i);return{got:m?m[1].toLowerCase()==='true':null,reason:''};
}
function preGrade(q,ans,G){return codeVerdict(q,ans,compare(q,ans,G),G)}
function rejectReason(q,ans,G){return reasonFrom(compare(q,ans,G))}
const api={readServer,serverMessages,wrongMessages,rightMessages,readProof,tieMessages,readTie,targetedMessages,helpLines,fullMessages,meaningMessages,parseEntries,lookupWords,renderWord,readGrade,compare,familyOf,preGrade,rejectReason};
if(typeof module!=='undefined')module.exports=api;else root.leading=api;
})(this);
