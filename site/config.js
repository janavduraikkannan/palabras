/* ---------- Palabras: everything about this site that isn't grammar ----------
   The shared code (index.html, keys.html, getkey.html, css/ and js/) is identical on every practice site.
   This folder, site/, holds what differs: this file (names, text, lists), cat.js (the tutor cat and its AI prompts),
   language.js (how the language behaves in the shared code), engine.js (sentences and grading), uses.js and theme.css. */
const SITE={
  id:"palabras", // the folder name; prefix for this language's saved progress (palabras.xp) and for keys like palabras-onboarded
  name:"Palabras", title:"Palabras · Spanish practice with Felicísimo",
  langKey:"es", // where this language's progress sits in the shared account document (Verba: null, the top level)
  cat:"Felicísimo", catDir:"felicisimo", catV:"1", // the tutor cat: name, img/<catDir>/, and the image version (bump it to refresh caches)
  proudFace:"fish", // the face shown when setup is done
  board:"boardes", otherBoard:"board", // this site's Firestore leaderboard, and the one checked before freeing a username
  acctIcon:"castle", // game-icons symbol on the Account button (the sprite in index.html has them all)
  limitDefault:false, // whether the bar's checkbox (#limit) starts ticked
  confetti:['#B23A26','#2D5193','#C8901A','#4E7A2E','#E9DEC7'],
  laurea:["Corona", "crown: completed AP Spanish"], honors:["Honores", "honors"], // [word, meaning] for the AP tag and the honors heading
  pageAccent:"#2D5193", pageButton:"#B23A26" // link and button colours on keys.html and getkey.html
};
const LANG_NAME="Spanish";
/* text the shared code drops into its messages; {word|meaning} marks a hover definition */
const TXT={
  onbHello:"{¡Hola!|hello!} I’m {Felicísimo|super happy (my name; feliz means happy)}, your Spanish tutor cat and Fēlix’s cousin. Let’s get you set up. It takes about 5 minutes.",
  onbAlso:" (Already use Verba for Latin? Your key and account work here too.)",
  onbLogin:"I have a Verba or Palabras account: log in",
  onbDone:"{¡Muy bien!|very good!} You’re all set. Here are a few tricks before you start.",
  onbTyping:"<li>Type accents with the buttons, or type ' after a vowel (a' → á) and ~ after n (n~ → ñ).</li>\n   ",
  onbBack:"{¡Hola otra vez!|hello again!} Log in and I’ll bring back your XP, streak and settings. Verba accounts work here too.",
  helloAgain:"{¡Hola otra vez!|hello again!}",
  useOf:"use of ",
  wellDone:"{¡Bien hecho!|well done!}",
  onFire:"{¡Olé!|bravo!}, you're on fire!",
  whoIsnt:"Palabras (and Verba)",
  loginHint:"Capital letters and accents don’t matter: “Sofía” can log in as “sofia”. Your Verba username works here too.",
  sameAccount:"This is the same account as Verba (Latin).",
  famous:"Famous figures",
  usernameHint:"Accents and capitals are fine: “Sofía” and “sofia” count as the same name. Your username is shared with Verba.",
  mottoEg:"e.g. Poco a poco se va lejos (little by little, you go far)",
  apToast:"{Corona|crown} earned! You finished AP Spanish. {¡Bien hecho!|well done!}",
  usePlaceholder:"Type the use, like “location” or “purpose”",
  xcHint:"Name why one word is used for bonus XP.",
  marks:"accents",
  markMatters:"the accent mark",
  diffForm:"a different form or word",
  anyOrder:"",
  award:()=>`<b>${LWS('Corona','crown')}</b><br>For completing AP Spanish Language. Your crown shows beside your name on the Spanish leaderboard and your profile.`
};
/* pieces of index.html (filled in by js/site-fill.js) */
const HTML={
  nav:"<a class=\"brand\" href=\"./\" aria-label=\"Palabras home\"><svg class=\"gi\" aria-hidden=\"true\"><use href=\"#gi-guitar\"/></svg><b class=\"lw\" data-en=\"words\">Palabras</b><span>Español</span></a><a class=\"langsw alllang\" href=\"../linguae/\" title=\"Linguae: every language site, with one account\">All languages</a><a class=\"langsw\" href=\"../verba/\" title=\"Same account, separate XP: practice Latin on Verba\">Latin ↗</a>",
  boardTitle:"Spanish leaderboard",
  heroP:"Sentences built fresh from Spanish I through AP Spanish. Earn XP, keep your streak alive, and ask Felicísimo when you're stuck.",
  heroBubble:"<span class=\"lw\" tabindex=\"0\" data-en=\"hello!\">¡Hola</span>! I'm <span class=\"lw\" tabindex=\"0\" data-en=\"super happy (my name; feliz means happy)\">Felicísimo</span>, Fēlix's Spanish cousin. Pick some topics and <span class=\"lw\" tabindex=\"0\" data-en=\"let's go!\">¡vamos!</span>",
  usesTab:"Why this form?",
  chartsTitle:"Charts for this sentence",
  usesHead:"Why this form? <span class=\"hint\">Uses of ser, estar, por, para, the preterite, the imperfect and the subjunctive. Closed on every new problem; opening one voids extra credit for it.</span>",
  macLabel:"Insert an accented letter",
  macHint:"or type ' after a vowel (a' → á) and ~ after n (n~ → ñ)",
  credits:"Icons by Lorc and Delapouite from <a href=\"https://game-icons.net\" target=\"_blank\" rel=\"noopener\">game-icons.net</a> (CC BY 3.0). Felicísimo is Fēlix from <a href=\"../verba/\">Verba</a>, dressed for Spanish class. Theme switch after Adam Argyle (web.dev, Apache 2.0) with Feather Icons. Confetti by <a href=\"https://github.com/catdad/canvas-confetti\" target=\"_blank\" rel=\"noopener\">canvas-confetti</a>.",
  limit:"<label title=\"Also use vosotros, the “you all” of Spain. Ustedes is always accepted.\"><input type=\"checkbox\" id=\"limit\"> Use vosotros (Spain)</label>"
};
/* ---------- courses and topics ---------- */
const LEVELS=[['I','Spanish I'],['II','Spanish II'],['III','Spanish III Honors'],['IV','Spanish IV Honors'],['AP','AP Spanish Language']];
/* topics covered in the class notes (Spanish I Honors and Spanish II Honors, Collierville High School) */
const TAUGHT=new Set(['art','plur','tricky','adj','poss','par','per','pir','ser','estar','serest','tener','stem','yogo','gustar','ques','hora','fecha','clima','nums','ropa',
  'presirr','pret','pretsp','pretirr','pretsc','pretiy','pperf','plup','refl','dop','pera','sabcon','likeg']);
const COURSE={I:'Spanish I',II:'Spanish II',III:'Spanish III Honors',IV:'Spanish IV Honors',AP:'AP Spanish Language'};
const COURSES=[['','Not set'],['I','Spanish I'],['I+','Spanish I – completed'],['II','Spanish II'],['II+','Spanish II – completed'],['III','Spanish III Honors'],['III+','Spanish III Honors – completed'],['IV','Spanish IV Honors'],['IV+','Spanish IV Honors – completed'],['AP','AP Spanish Language'],['AP+','AP Spanish Language – completed']];
const COURSE_SHORT={I:'Spanish I',II:'Spanish II',III:'Spanish III',IV:'Spanish IV',AP:'AP Spanish'};
/* ---------- ranks and badges ---------- */
const RANKS=[['Estudiante','student'],['Aprendiz','apprentice'],['Viajero','traveler'],['Explorador','explorer'],['Conversador','conversationalist'],['Narrador','storyteller'],['Poeta','poet'],['Sabio','sage'],['Maestro','master'],['Leyenda','legend']];
const RANK_INFO=['Every Spanish speaker starts here.','Learning the basics, one verb at a time.','Ready for a trip: you can order, ask and get around.','Off the beaten path, trying new tenses.','You can keep a real conversation going.','You can tell a whole story in the past.','Your Spanish has style.','You know why every form is the way it is.','A master of the language.','A legend, the top rank on Palabras. Levels keep going from here.'];
/* [icon, word, meaning, what earns it, earned?] for a profile's honors */
const BADGES=(r,place,wplace,lv,best)=>[['laurel-crown','Corona','crown','Completed AP Spanish',r.course==='AP+'],['trophy','Campeón de la semana','champion of the week','#1 on this week’s leaderboard',wplace===1],['trophy','Podio','podium','Top 3 of all time',place>0&&place<=3],
    ['castle','Conversador','conversationalist','Reached Level 5',lv>=5],['castle','Maestro','master','Reached Level 9',lv>=9],['laurel-crown','Leyenda','legend','Reached Level 10',lv>=10],
    ['fluffy-flame','Tres días','three days','A 3-day streak',best>=3],['fluffy-flame','Una semana','one week','A 7-day streak',best>=7],['fluffy-flame','Un mes','one month','A 30-day streak',best>=30],['fluffy-flame','Cien días','a hundred days','A 100-day streak',best>=100],
    ['round-star','Mil','a thousand','1,000 XP',r.xp>=1000],['round-star','Diez mil','ten thousand','10,000 XP',r.xp>=10000]];
/* ---------- profiles: animal names, pictures and banners ---------- */
const ANIMALS=[['Lobo','wolf'],['Zorro','fox'],['Oso','bear'],['Águila','eagle'],['León','lion'],['Caballo','horse'],['Cuervo','raven'],['Paloma','dove'],['Delfín','dolphin'],['Ciervo','stag'],['Búho','owl'],['Toro','bull'],['Liebre','hare'],['Ganso','goose'],['Gato','cat'],['Abeja','bee']];
/* Profile pictures: freely licensed photos from Wikimedia Commons (credits are loaded live from Commons), or your own upload. */
const PICS=[
  {id:'cervantes',n:'Miguel de Cervantes',g:'fig',f:['Cervates jauregui.jpg','Cervantes Jáuregui.jpg','Miguel de Cervantes.jpg'],pos:'50% 25%'},
  {id:'frida',n:'Frida Kahlo',g:'fig',f:['Frida Kahlo, by Guillermo Kahlo.jpg','Frida Kahlo, by Guillermo Kahlo 2.jpg'],pos:'50% 20%'},
  {id:'bolivar',n:'Simón Bolívar',g:'fig',f:['Simón Bolívar 2.jpg','Simon Bolivar.jpg'],pos:'50% 25%'},
  {id:'velazquez',n:'Diego Velázquez',g:'fig',f:['Diego Velázquez Autorretrato 45 x 38 cm - Colección Real Academia de Bellas Artes de San Fernando.jpg','Autorretrato de Diego Velázquez.jpg'],pos:'50% 30%'},
  {id:'sorjuana',n:'Sor Juana Inés de la Cruz',g:'fig',f:['Juana Inés de la Cruz.jpg','Sor Juana Inés de la Cruz (Miguel Cabrera).jpg'],pos:'50% 25%'},
  {id:'goya',n:'Francisco de Goya',g:'fig',f:['Vicente López Portaña - el pintor Francisco de Goya.jpg'],pos:'50% 25%'},
  {id:'quijote',n:'Don Quijote',g:'fig',f:['Honoré Daumier 017.jpg','Don Quijote and Sancho Panza.jpg'],pos:'50% 40%'},
  {id:'alhambra',n:'The Alhambra',g:'place',f:['Dawn Charles V Palace Alhambra Granada Andalusia Spain.jpg','Alhambra - Granada.jpg'],pos:'50% 50%'},
  {id:'sagrada',n:'Sagrada Família',g:'place',f:['Σαγράδα Φαμίλια 2941.jpg','Sagrada Familia 01.jpg'],pos:'50% 40%'},
  {id:'machupicchu',n:'Machu Picchu',g:'place',f:['Machu Picchu, Peru.jpg','80 - Machu Picchu - Juin 2009 - edit.jpg'],pos:'50% 50%'},
  {id:'chichen',n:'Chichén Itzá',g:'place',f:['Chichen Itza 3.jpg','Chichen-Itza-Castillo-Seen-From-East.JPG'],pos:'50% 50%'},
  {id:'plazamayor',n:'Plaza Mayor, Madrid',g:'place',f:['Plaza Mayor de Madrid 06.jpg','Plaza Mayor (Madrid) 01.jpg'],pos:'50% 50%'},
  {id:'teotihuacan',n:'Teotihuacan',g:'place',f:['Teotihuacan Pyramid of the Sun.jpg','Pirámide del Sol, Teotihuacán.jpg'],pos:'50% 50%'},
  {id:'havana',n:'Old Havana',g:'place',f:['Havana - Cuba - 0890.jpg','La Habana Vieja.jpg'],pos:'50% 50%'}];
const BANNERS=[['c:red','#B23A26','Rojo'],['c:gold','#C8901A','Oro'],['c:blue','#2D5193','Azul talavera'],['c:green','#3F7A3A','Verde'],['c:purple','#6B2D5C','Morado'],['c:stone','#8C8273','Piedra']];
