/* ---------- Spanish: the rest of the course's form uses, for the identify-the-use tab ----------
   Loaded after js/usemode.js. Each new use has a gen() that builds a sentence with exactly one word
   tagged with the use's id, starting from the course's own topic generators. */
const LANG_NAME='Spanish';
const useAsk=ty=>`Which use of ${USES[ty.c].word} is`;
const useOf=ty=>`use of ${USES[ty.c].word}`;
const XC_SKIP=()=>false;
const MORE_ID_TOPIC={si:['condHyp','isSi'],cond:['condPol','condFut'],sjimpf:['isPast'],reported:['condFut']};
/* topic generators return unfinished sentences; finish() builds the display text the drill shows */
function fromTopic(id){const t=TOPICS.find(x=>x.id===id);for(let i=0;i<30;i++){try{return finish(t.gen())}catch(e){}}throw new Error('no '+id+' sentence')}
function retag(x,test,id){const t=x.tokens.find(test);if(!t)throw new Error('no '+id);t.cids=[id,...t.cids];return x}
/* a plain conditional sentence, split at its verb; skipped when pronouns or "no" sit before the verb */
function condParts(){
  const x=fromTopic('cond'),i=x.tokens.findIndex(t=>t.vb&&t.t==='cond'),m=x.en.match(/^(.*?) would (.*)$/);
  if(i<0||!m||x.tokens.slice(0,i).some(t=>!['subj','art','noun','poss','adj','demo'].includes((t.cids||[])[0])))throw new Error('no plain conditional');
  return{x,i,v:x.tokens[i],rest:m[2]};
}
const SPEAKERS=[['Ana','Ana'],['Luis','Luis'],['mi madre','my mother'],['el profesor','the teacher'],['mi amigo','my friend']];

addUses('cond',{name:'Conditional',word:'the conditional',level:'III'},[
  {id:'condHyp',full:'a hypothetical result (conditional)',n:'Hypothetical result',syn:['hypothetical','hypothesis','result','unreal result','contrary to fact','if then','would happen if'],what:'what would happen if something else were true',la:'Si tuviera dinero, viajaría.',en:'If I had money, I would travel.',
    gen:()=>retag(fromTopic('si'),t=>t.cids.includes('siR')&&t.t==='cond','condHyp')},
  {id:'condPol',full:'a polite request or wish (conditional)',n:'Polite request or wish',syn:['polite','politeness','courtesy','request','polite request','softened','softening','would like'],what:'softens a wish or request (me gustaría, podría)',la:'Me gustaría un café.',en:'I would like a coffee.',
    gen:()=>{const{x,i,v,rest}=condParts();if(v.vb.refl)throw new Error('reflexive');
      const g=Object.assign(W('gustaría','gustar : to please (me gustaría: I would like)',['condPol','cond'],'conditional of gustar'),{enHint:['would like']});
      return finish(S([W('me','me : (to) me',['iop']),g,W(v.vb.inf,v.vocab,['inf']),...x.tokens.slice(i+1)],['I would like to '+rest]))}},
  {id:'condFut',full:'a future in the past (conditional)',n:'Future in the past',syn:['future in the past','future of the past','future past','reported','reported speech','indirect speech','said would'],what:'what someone said or thought would happen later',la:'Dijo que vendría.',en:'He said that he would come.',
    gen:()=>{const x=fromTopic('cond'),v=x.tokens.find(t=>t.vb&&t.t==='cond');if(!v)throw new Error('no conditional');v.cids=['condFut',...v.cids];
      const[sp,spE]=R(SPEAKERS);
      return finish(S([W(sp,null,['noun']),W('dijo','decir : to say',['pret']),SW('que',['que']),...x.tokens],[`${spE} said that ${x.en}`]))}}]);
addUses('isubj',{name:'Imperfect subjunctive',word:'the imperfect subjunctive',level:'IV'},[
  {id:'isPast',full:'an imperfect subjunctive after a past main verb',n:'After a past main verb',syn:['past main verb','past trigger','after a past verb','past tense trigger','sequence of tenses','sequence','past main clause'],what:'a subjunctive trigger (a wish, doubt or emotion) in a past-tense main clause',la:'Quería que vinieras.',en:'I wanted you to come.',
    gen:()=>retag(fromTopic('sjimpf'),t=>t.t==='simpf','isPast')},
  {id:'isSi',full:'an imperfect subjunctive in a si clause',n:'Si clause (contrary to fact)',syn:['si clause','if clause','contrary to fact','unreal condition','condition','hypothetical if','if'],what:'the if-part of something untrue or unlikely right now',la:'Si tuviera tiempo, iría.',en:'If I had time, I would go.',
    gen:()=>retag(fromTopic('si'),t=>t.cids[0]==='si'&&t.t==='simpf','isSi')}]);
