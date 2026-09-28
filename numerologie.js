(function(root){
  'use strict';
  const masters=new Set([11,22,33]);
  function digitSum(n){return String(n).replace(/\D/g,'').split('').reduce((a,b)=>a+Number(b),0);}
  function reduce(n,keepMasters=true){while(n>9 && !(keepMasters&&masters.has(n)))n=digitSum(n);return n;}
  function dateParts(value){
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');
    if(!m)throw Error('Date invalide');
    const [y,mo,d]=m.slice(1).map(Number),check=new Date(Date.UTC(y,mo-1,d));
    if(y<1900||y>2100||check.getUTCFullYear()!==y||check.getUTCMonth()!==mo-1||check.getUTCDate()!==d)throw Error('Date invalide');
    return {y,mo,d};
  }
  function letters(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');}
  function nameNumbers(value){
    const name=letters(value);if(!name)throw Error('Nom requis');
    let all=0,soul=0,outer=0;
    for(const c of name){const n=(c.charCodeAt(0)-65)%9+1;all+=n;if('AEIOUY'.includes(c))soul+=n;else outer+=n;}
    return {expression:reduce(all),soul:reduce(soul),personality:reduce(outer)};
  }
  function lifePath(value){const {y,mo,d}=dateParts(value);return reduce(digitSum(y)+digitSum(mo)+digitSum(d));}
  function personalYear(value,year){const {mo,d}=dateParts(value);return reduce(digitSum(d)+digitSum(mo)+digitSum(year),false);}
  function personalMonth(value,year,month){if(!Number.isInteger(month)||month<1||month>12)throw Error('Mois invalide');return reduce(personalYear(value,year)+month,false);}
  function profile(date,name){const {d}=dateParts(date);return {life:lifePath(date),day:reduce(d),...(name?nameNumbers(name):{})};}
  const api={digitSum,reduce,dateParts,letters,nameNumbers,lifePath,personalYear,personalMonth,profile};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CristarivaNumerologie=api;
  const $=id=>root.document&&root.document.getElementById(id);
  const themes={fr:{1:'prendre une initiative',2:'écouter et coopérer',3:'exprimer une idée',4:'construire avec patience',5:'accueillir le changement',6:'prendre soin des liens',7:'chercher du sens',8:'agir avec discernement',9:'achever un cycle',11:'faire confiance à son intuition',22:'donner forme à une ambition',33:'mettre son attention au service des autres'},en:{1:'take an initiative',2:'listen and cooperate',3:'express an idea',4:'build patiently',5:'welcome change',6:'care for your relationships',7:'seek meaning',8:'act with discernment',9:'complete a cycle',11:'trust your intuition',22:'give shape to an ambition',33:'care for others'}};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lang=()=>document.documentElement.lang==='en'?'en':'fr';
  const tr=(fr,en)=>lang()==='en'?en:fr;
  let drawnAt=null,hasResult=false;
  // The timing card gives a symbolic window from the date of the reading.
  const days={116:1,117:3,118:7,119:15,120:21,121:30,122:42,123:60,124:90,125:180,126:270,127:365};
  function period(dateCard,anchor=new Date()){
    const id=dateCard&&Number(dateCard.id), span=days[id];
    if(!span)return null; // A season, trigger or indefinite card has no reliable calendar window.
    const start=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate());
    const end=new Date(start);end.setDate(end.getDate()+span);
    return {start,end,days:span};
  }
  api.period=period;
  function monthsInRange(window){
    const list=[],cursor=new Date(window.start.getFullYear(),window.start.getMonth(),1);
    while(cursor<=window.end){list.push({year:cursor.getFullYear(),month:cursor.getMonth()+1});cursor.setMonth(cursor.getMonth()+1);}
    return list;
  }
  api.monthsInRange=monthsInRange;
  if(!root.document)return;
  function readingParagraph(date){
    const card=typeof state!=='undefined'?state.date:null;
    const window=period(card,drawnAt||new Date());
    if(!window){const now=new Date(),y=now.getFullYear(),m=now.getMonth()+1,n=personalMonth(date,y,m);
      return tr(`Sans fenêtre calendaire précise, votre année personnelle ${personalYear(date,y)} et votre mois personnel ${n} invitent à ${themes.fr[n]}. La carte Datation garde son sens symbolique.`,`With no fixed calendar window, your personal year ${personalYear(date,y)} and personal month ${n} invite you to ${themes.en[n]}. The Timing card remains symbolic.`);}
    const locale=lang()==='en'?'en-GB':'fr-FR',fmt=new Intl.DateTimeFormat(locale,{day:'numeric',month:'long',year:'numeric'});
    const items=monthsInRange(window).map(({year,month})=>`${new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}).format(new Date(year,month-1,1))} : ${personalMonth(date,year,month)}`);
    return tr(`La carte Datation situe une fenêtre symbolique du ${fmt.format(window.start)} au ${fmt.format(window.end)}. Vos mois personnels sur cette période sont ${items.join(' ; ')}. Ils offrent un angle supplémentaire pour relire les cartes, sans garantir une échéance.`,`The Timing card suggests a symbolic window from ${fmt.format(window.start)} to ${fmt.format(window.end)}. Your personal months in this window are ${items.join('; ')}. They offer another way to read the cards, without guaranteeing a deadline.`);
  }
  function render(){
    const mode=$('numMode').value,date=$('numDate').value,name=$('numName').value.trim(),year=Number($('numYear').value),out=$('numResult'),en=lang()==='en';
    try{
      const p=profile(date,name);let html='';
      if(mode==='chemin'){
        if(!name)throw Error(tr('Indiquez vos prénoms et nom de naissance.','Enter your birth names.'));
        const labels=en?['Life path','Birth day','Expression','Inner desire','Personality']:['Chemin de vie','Jour de naissance','Expression','Aspiration intime','Personnalité'];
        html=`<h3>${tr('L’histoire racontée par vos nombres','The story told by your numbers')}</h3><div class="num-grid">${[p.life,p.day,p.expression,p.soul,p.personality].map((n,i)=>`<div><strong>${n}</strong><span>${labels[i]}</span></div>`).join('')}</div><p>${tr(`Votre chemin de vie invite à ${themes.fr[p.life]}. Votre expression et votre aspiration intime donnent deux nuances de ce parcours. Votre personnalité montre comment cet élan peut être perçu. Ces nombres éclairent des possibilités à confronter à votre expérience.`,`Your life path invites you to ${themes.en[p.life]}. Expression and inner desire give this path different shades. Personality suggests how this energy may be perceived. Compare these possibilities with your own experience.`)}</p>`;
      }else if(mode==='annee'){
        if(!Number.isInteger(year)||year<1900||year>2100)throw Error(tr('Année invalide.','Invalid year.'));
        const py=personalYear(date,year),locale=en?'en-GB':'fr-FR';
        html=`<h3>${tr('Votre année personnelle','Your personal year')} ${year} : ${py}</h3><p>${tr(`Cette année invite à ${themes.fr[py]}. Chaque mois colore ce mouvement différemment.`,`This year invites you to ${themes.en[py]}. Each month adds a different shade.`)}</p><div class="num-months">${Array.from({length:12},(_,i)=>`<div><span>${new Intl.DateTimeFormat(locale,{month:'long'}).format(new Date(2024,i,1))}</span><strong>${personalMonth(date,year,i+1)}</strong></div>`).join('')}</div>`;
      }else if(mode==='relation'){
        const q=profile($('numOtherDate').value,$('numOtherName').value.trim());
        html=`<h3>${tr('Nos nombres','Our numbers')}</h3><div class="num-grid"><div><strong>${p.life}</strong><span>${tr('Votre chemin','Your path')}</span></div><div><strong>${q.life}</strong><span>${tr('Son chemin','Their path')}</span></div></div><p>${p.life===q.life?tr('Vos chemins soulignent une aspiration semblable.','Your paths point to a similar aspiration.'):tr('Vos chemins suggèrent des rythmes différents.','Your paths suggest different rhythms.')} ${tr(`Le premier invite à ${themes.fr[p.life]}, le second à ${themes.fr[q.life]}. Ces tendances peuvent nourrir un échange sur vos besoins, sans prédire la réussite du lien.`,`The first invites you to ${themes.en[p.life]}, the second to ${themes.en[q.life]}. These tendencies can prompt a conversation about your needs without predicting the outcome of your relationship.`)}</p>`;
      }else{
        if(!(typeof state!=='undefined'&&state.draw&&state.draw.length))throw Error(tr('Effectuez d’abord un tirage de cartes.','Draw cards first.'));
        html=`<h3>${tr('Les nombres de mon tirage','The numbers in my reading')}</h3><p>${readingParagraph(date)}</p>`;
      }
      out.innerHTML=html;out.hidden=false;hasResult=true;
    }catch(e){out.innerHTML=`<p role="alert">${escape(e.message)}</p>`;out.hidden=false;hasResult=false;}
  }
  function translate(){
    document.querySelectorAll('[data-num-fr]').forEach(el=>{el.textContent=el.dataset[lang()==='en'?'numEn':'numFr'];});
    document.querySelectorAll('[data-num-placeholder-fr]').forEach(el=>{el.placeholder=el.dataset[lang()==='en'?'numPlaceholderEn':'numPlaceholderFr'];});
    if(hasResult)render();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if(!$('numForm'))return;
    $('numYear').value=new Date().getFullYear();
    $('numMode').addEventListener('change',()=>{$('numOtherFields').hidden=$('numMode').value!=='relation';$('numYearField').hidden=$('numMode').value!=='annee';});
    $('numForm').addEventListener('submit',e=>{e.preventDefault();render();});
    $('numUseBirth').addEventListener('click',()=>{const birth=$('birthdate');if(birth&&birth.value)$('numDate').value=birth.value;});
    $('numFromDraw').addEventListener('click',()=>{$('numMode').value='tirage';$('numMode').dispatchEvent(new Event('change'));$('numerologie').scrollIntoView({behavior:'smooth'});});
    $('drawBtn').addEventListener('click',()=>{drawnAt=new Date();});
    $('langBtn').addEventListener('click',()=>queueMicrotask(translate));
    translate();
  });
})(typeof window!=='undefined'?window:globalThis);
