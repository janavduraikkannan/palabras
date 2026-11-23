/* SPDX-License-Identifier: AGPL-3.0-or-later AND CC-BY-SA-4.0
 * Copyright (C) 2026 janavduraikkannan and Linguae contributors */
/* ---------- Palabras's Practice Test mode: the pages it lists, the study guide, and the verb test with its answer checker ----------
   The mechanics (the tab, the page, check-as-you-go or check-at-the-end, the AI explanations) are in js/tests.js, which is the same on
   every practice site. This file holds what is specific to Spanish.

   PTESTS.groups   the groups the tab lists; each page is {id, kind:'test'|'guide', title, blurb}
   PTESTS.guide    id → the study guide page, as HTML
   PTESTS.tests    id → {title, intro, bank(), make(), grade(q, raw, strict), tutor, rules, describe(q)}
   Everything is inside one function so none of these names clash with the rest of the site. */
const PTESTS=(function(){
  /* ================= The verbs and the conjugation engine ================= */
  const PAST_STYLE='prog';
  const TENSE_NAME={pres:'present (presente)',fut:'future (futuro)',imp:'imperfect (imperfecto)'};
  const BE=['am','are','is','are','are','are'];
  const VERBS=[
    {inf:'hablar',kind:'-ar verb',gloss:'to speak',base:'speak',s3:'speaks',ing:'speaking',stem:'habl',fs:'hablar'},
    {inf:'comer',kind:'-er verb',gloss:'to eat',base:'eat',s3:'eats',ing:'eating',stem:'com',fs:'comer'},
    {inf:'vivir',kind:'-ir verb',gloss:'to live',base:'live',s3:'lives',ing:'living',stem:'viv',fs:'vivir'},
    {inf:'ser',kind:'irregular verb',gloss:'to be',base:'be',ing:'being',pres:['soy','eres','es','somos','sois','son'],fs:'ser',imp:['era','eras','era','éramos','erais','eran'],enPres:BE,enImp:['was','were','was','were','were','were']},
    {inf:'ir',kind:'irregular verb',gloss:'to go',base:'go',s3:'goes',ing:'going',pres:['voy','vas','va','vamos','vais','van'],fs:'ir',imp:['iba','ibas','iba','íbamos','ibais','iban']},
    {inf:'tener',kind:'irregular verb',gloss:'to have',base:'have',s3:'has',ing:'having',stem:'ten',pres:['tengo','tienes','tiene','tenemos','tenéis','tienen'],fs:'tendr',noProg:true,enImp:Array(6).fill('had')},
    {inf:'hacer',kind:'irregular verb',gloss:'to do, make',base:'make',s3:'makes',ing:'making',stem:'hac',pres:['hago','haces','hace','hacemos','hacéis','hacen'],fs:'har'},
    {inf:'poder',kind:'irregular verb',gloss:'to be able to, can',base:'be able to',s3:'is able to',ing:'being able to',stem:'pod',pres:['puedo','puedes','puede','podemos','podéis','pueden'],fs:'podr',
      enPres:Array(6).fill('can'),enFut:'be able to',enImp:Array(6).fill('could')}
  ];
  const PRES={'-ar verb':['o','as','a','amos','áis','an'],'-er verb':['o','es','e','emos','éis','en'],'-ir verb':['o','es','e','imos','ís','en']};
  const FUT_END=['é','ás','á','emos','éis','án'];
  const IMP_AR=['aba','abas','aba','ábamos','abais','aban'],IMP_ER=['ía','ías','ía','íamos','íais','ían'];
  function variants(v,t,p){
    if(t==='pres')return[v.pres?[[v.pres[p],'']]:[[v.stem,'s'],[PRES[v.kind][p],'e']]];
    if(t==='fut')return[[[v.fs,'s'],[FUT_END[p],'e']]];
    if(v.imp)return[[[v.imp[p],'']]];
    return[[[v.stem,'s'],[(v.kind==='-ar verb'?IMP_AR:IMP_ER)[p],'e']]];
  }
  /* a form is a list of [text, role] pieces: s stem, e ending, t tense sign, '' plain; every accepted spelling is a "variant" */
  const join=segs=>segs.map(x=>x[0]).join('');
  const forms=(v,t,p)=>variants(v,t,p).map(join);

  /* ================= Making a test ================= */
  const PERSON=['I','you (sing.)','he/she','we','you all','they'];
  const AM=['am','are','is','are','are','are'],WAS=['was','were','was','were','were','were'];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  function english(v,t,p){
    const s=p===2?pick(['he','she']):PERSON[p];
    if(t==='pres'){
      if(v.enPres)return s+' '+v.enPres[p];
      return v.noProg||Math.random()<.5?s+' '+(p===2?v.s3:v.base):s+' '+AM[p]+' '+v.ing;
    }
    if(t==='fut')return s+' will '+(v.enFut||v.base);
    if(v.enImp)return s+' '+v.enImp[p];
    return PAST_STYLE==='past'?s+' '+v.past:s+' '+WAS[p]+' '+v.ing;
  }
  const label=(t,p)=>TENSE_NAME[t]+', “'+PERSON[p]+'”';
  /* 18 questions: every person in every tense once, with the verbs shuffled so each is used before any repeats */
  function make(){
    const slots=[];
    ['pres','fut','imp'].forEach(t=>{for(let p=0;p<6;p++)slots.push([t,p])});
    const pool=shuffle(VERBS.concat(VERBS,VERBS));
    return shuffle(slots).map(([t,p])=>{const v=pool.pop();return{v,t,p,en:english(v,t,p),answers:forms(v,t,p)}});
  }

  /* ================= Checking an answer (code only; the AI never decides) ================= */
  /* the subject pronoun is optional; accents are checked, but a missing one only counts as a small slip */
  const clean=s=>(s||'').normalize('NFC').toLowerCase().replace(/[^a-záéíóúüñ ]/g,'').trim().replace(/\s+/g,' ')
    .replace(/^(yo|tú|tu|él|el|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes)\s+(?=\S)/,'');
  const bare=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
  /* which forms of this verb the student's spelling actually is, so the note can say what they wrote instead */
  function diagnose(q,raw){
    const b=bare(clean(raw)),hits=[];
    ['pres','fut','imp'].forEach(t=>{for(let p=0;p<6;p++){if(forms(q.v,t,p).some(f=>bare(f)===b))hits.push(label(t,p))}});
    return hits;
  }
  function grade(q,raw,strict){
    const c=clean(raw);
    if(!c)return{status:'bad',note:'No answer.'};
    if(q.answers.includes(c))return{status:'ok'};
    if(q.answers.some(a=>bare(a)===bare(c)))return{status:strict?'bad':'warn',note:'Right letters, but check the accents.'};
    const hits=diagnose(q,raw);
    return{status:'bad',note:hits.length?'That spelling is the '+hits.join(' or ')+' form of '+q.v.inf+'.':'That isn’t a form of '+q.v.inf+' in these tenses.'};
  }

  /* ================= What the AI is told ================= */
  const RULES=[
    'Subject pronouns: yo, tú, él / ella, nosotros, vosotros, ellos / ellas. The student may leave the pronoun out; only the verb form is graded.',
    'Present of regular verbs: drop -ar / -er / -ir and add endings. -ar: -o, -as, -a, -amos, -áis, -an (hablo ... hablan). -er: -o, -es, -e, -emos, -éis, -en (como ... comen). -ir: -o, -es, -e, -imos, -ís, -en (vivo ... viven).',
    'Irregular present: ser (soy, eres, es, somos, sois, son), ir (voy, vas, va, vamos, vais, van), tener (tengo, tienes, tiene, tenemos, tenéis, tienen), hacer (hago, haces, hace, hacemos, hacéis, hacen), poder (puedo, puedes, puede, podemos, podéis, pueden; the o becomes ue except in nosotros and vosotros).',
    'Future: the whole infinitive plus -é, -ás, -á, -emos, -éis, -án (hablaré, comerás, vivirá). Irregular future stems: tener tendr-, hacer har-, poder podr-; ser and ir keep their infinitive (seré, iré).',
    'Imperfect: -ar verbs drop -ar and add -aba, -abas, -aba, -ábamos, -abais, -aban (hablaba). -er and -ir verbs add -ía, -ías, -ía, -íamos, -íais, -ían (comía, vivía, tenía, hacía, podía). Only ser (era, eras, era, éramos, erais, eran) and ir (iba, ibas, iba, íbamos, ibais, iban) are irregular.'
  ].join('\n');
  const describe=(q,n,raw,note)=>({n,english:q.en,verb:q.v.inf+' ('+q.v.kind+')',target:label(q.t,q.p),student:raw||'(blank)',correct:q.answers.join(' or '),checker:note});

  const bank=()=>VERBS.map(v=>`<div><b class="la">${v.inf}</b> <i>(${v.gloss})</i></div>`).join('');

  const tests={
    pfi:{
      title:'Present, future & imperfect practice test',
      intro:'Write the Spanish for each phrase; the verb to use is shown beside it. Your answers are graded by code, and the AI then explains anything you missed.',
      bankTitle:'Verbs on this test',
      tutor:'You are a friendly Spanish tutor. A student took a practice test on the present, future and imperfect tenses.',
      rules:RULES,
      bank,make,grade,describe,hint:q=>q.v.inf
    }
  };

  /* ================= The study guide ================= */
  const persons=['yo','tú','él / ella','nosotros','vosotros','ellos / ellas'];
  const seg=([text,role])=>text?(role?`<span class="pt-${role}">${text}</span>`:text):'';
  const form=segs=>segs.map(seg).join('');
  const cell=(v,t,p)=>`<td class="f">${variants(v,t,p).map(form).join('<span class="or">or</span>')}</td>`;
  const byInf=inf=>VERBS.find(v=>v.inf===inf);
  /* one table: a tense, with a column per verb */
  function table(t,infs){
    const vs=infs.map(byInf);
    return`<div class="ptscroll"><table${vs.length<4?` class="narrow${vs.length}"`:''}><thead><tr><th></th>${vs.map(v=>`<th>${v.inf}<small>${v.head||v.gloss}</small></th>`).join('')}</tr></thead><tbody>`+
      persons.map((n,p)=>`<tr><th scope="row">${n}</th>${vs.map(v=>cell(v,t,p)).join('')}</tr>`).join('')+`</tbody></table></div>`;
  }
  const L=s=>`<i class="la">${s}</i>`;
  const note=(h,body)=>`<aside class="ptnote"><b>${h}</b>${body}</aside>`;
  const regV=['hablar','comer','vivir'],irrV=['ser','ir','tener','hacer','poder'];
  const guide=()=>`
<header class="pthero">
  <p class="lkick">Study guide · Spanish</p>
  <h1>Present, future &amp; imperfect verbs</h1>
  <p class="lblurb">Every form on the test is a stem plus an ending. Learn which stem and which endings each tense uses and you can build any verb.</p>
  <div class="ptanat" role="img" aria-label="habl, ábamos: we were speaking">
    <div><span class="pt-s">habl</span><small>stem</small></div><div><span class="pt-e">ábamos</span><small>ending</small></div>
    <p>nosotros hablábamos: we were speaking</p>
  </div>
  <nav class="ptjump" aria-label="Sections">${[['build','Building a form'],['present','Present'],['future','Future'],['imperfect','Imperfect'],['irregular','Irregular verbs'],['english','English to Spanish'],['traps','Traps']].map(([id,n])=>`<a href="#" data-jump="pt-${id}">${n}</a>`).join('')}</nav>
</header>

<section id="pt-build"><h2>Building any form</h2>
  <div class="ptpanel"><ol class="ptsteps">
    <li>Look at the <b>infinitive</b>: ${L('-ar')} (${L('hablar')}), ${L('-er')} (${L('comer')}), ${L('-ir')} (${L('vivir')}), or one of the irregular verbs below.</li>
    <li>Pick the <b>tense</b> from the English: simple (${L('I speak')}) is present, ${L('will')} is future, ${L('was ___ing')} is imperfect.</li>
    <li>Find the <b class="pt-s">stem</b> that tense uses, then add the <b class="pt-e">ending</b> for the person.</li>
  </ol></div>
  <p class="ptlegend"><span class="pt-s">stem</span><span class="pt-e">ending</span></p>
  <p>On the test you can write just the verb (${L('hablamos')}) or the pronoun too (${L('nosotros hablamos')}); both are graded the same way. Spanish usually leaves the pronoun out.</p>
</section>

<section id="pt-present"><h2>Present tense</h2>
  <p class="sub">“I speak, I am speaking.” Spanish has one present for both.</p>
  ${table('pres',regV)}
  ${note('Watch the vowel in -er and -ir.',`<p>${L('-er')} and ${L('-ir')} verbs share every ending except ${L('nosotros')} (${L('comemos')} vs. ${L('vivimos')}) and ${L('vosotros')} (${L('coméis')} vs. ${L('vivís')}).</p>`)}
</section>

<section id="pt-future"><h2>Future tense</h2>
  <p class="sub">“I will speak.” Keep the whole infinitive, then add the endings. They are the same for all three kinds of verb.</p>
  ${table('fut',regV)}
  <div class="ptpanel"><p>The endings carry the accent in every form except ${L('nosotros')}: ${L('hablaré, hablarás, hablará, hablaremos, hablaréis, hablarán')}.</p></div>
</section>

<section id="pt-imperfect"><h2>Imperfect tense</h2>
  <p class="sub">“I was speaking, I used to speak.”</p>
  <div class="ptpanel">
    <p class="ptrecipe"><span class="pt-s">stem</span><span class="plus">+</span><span class="pt-e">-aba</span> <span class="or">for -ar</span> <span class="plus">·</span> <span class="pt-s">stem</span><span class="plus">+</span><span class="pt-e">-ía</span> <span class="or">for -er and -ir</span></p>
  </div>
  ${table('imp',regV)}
  ${note('Only two verbs are irregular.',`<p>${L('ser')} (${L('era')}) and ${L('ir')} (${L('iba')}). Everything else, including ${L('tener, hacer, poder')}, is regular in the imperfect.</p>`)}
</section>

<section id="pt-irregular"><h2>Irregular verbs on the test</h2>
  <p class="sub">The present has to be learned. In the future only the stem changes; in the imperfect only ${L('ser')} and ${L('ir')} change.</p>
  <h3>Present</h3>${table('pres',irrV)}
  <h3>Future</h3>${table('fut',irrV)}
  <h3>Imperfect</h3>${table('imp',irrV)}
</section>

<section id="pt-english"><h2>Reading the English</h2>
  <p class="sub">The English wording tells you the tense before you write a letter.</p>
  <div class="ptscroll"><table class="plain"><thead><tr><th>English looks like</th><th>Tense</th><th>Example</th></tr></thead><tbody>
    <tr><td>I speak, I am speaking</td><td>present</td><td class="f">hablo</td></tr>
    <tr><td>will ___</td><td>future</td><td class="f">viviremos</td></tr>
    <tr><td>was / were ___ing</td><td>imperfect</td><td class="f">comían</td></tr>
  </tbody></table></div>
  <p>Then match the subject to the ending: <b>you (sing.)</b> is ${L('tú')}, <b>you all</b> is ${L('vosotros')}, <b>he / she</b> is ${L('él / ella')}.</p>
</section>

<section id="pt-traps"><h2>Easy points to lose</h2>
  <ul class="pttraps">
    <li><b>Future endings are added to the infinitive.</b> ${L('hablaré')}, not ${L('hablé')}. ${L('Hablé')} is the preterite, a different tense.</li>
    <li><b>The accent matters in the future.</b> ${L('hablará')} (he will speak) is not ${L('habla')}; ${L('hablaré')} is not ${L('hablare')}. A missing accent counts as a small slip unless you turn on the strict option.</li>
    <li><b>${L('tener, hacer, poder')} change their future stem.</b> ${L('tendré, haré, podré')}, not ${L('teneré')}.</li>
    <li><b>Imperfect -er and -ir verbs always have an accented í.</b> ${L('comía, vivíamos')}.</li>
    <li><b>Nosotros in the imperfect of -ar verbs is accented.</b> ${L('hablábamos')}, ${L('íbamos')}, ${L('éramos')}.</li>
    <li><b>${L('poder')} keeps the o in nosotros and vosotros.</b> ${L('podemos, podéis')}, but ${L('puedo, puedes, puede, pueden')}.</li>
    <li><b>${L('yo')} forms of ${L('tener')} and ${L('hacer')}.</b> ${L('tengo')} and ${L('hago')}.</li>
  </ul>
</section>`;

  return{
    groups:[{
      id:'pfi',title:'Present, future & imperfect verbs',blurb:'Spanish verb test',
      pages:[
        {id:'pfi-test',kind:'test',test:'pfi',title:'Practice Test',blurb:'18 phrases to write in Spanish: every person in the present, future and imperfect'},
        {id:'pfi-guide',kind:'guide',title:'Study Guide',blurb:'How each form is built, with the irregular verbs and the traps to avoid'}
      ]}],
    guide:{'pfi-guide':guide},
    tests,
    /* exposed so the checker can be tested without a browser */
    _engine:{forms,make,grade,VERBS}
  };
})();
