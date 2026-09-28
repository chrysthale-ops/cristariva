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
  if(!root.document)return;
  const $=id=>document.getElementById(id), themes={1:'prendre une initiative',2:'écouter et coopérer',3:'exprimer une idée',4:'construire avec patience',5:'accueillir le changement',6:'prendre soin des liens',7:'chercher du sens',8:'agir avec discernement',9:'achever un cycle',11:'faire confiance à son intuition',22:'donner forme à une ambition',33:'mettre son attention au service des autres'};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function lang(){return document.documentElement.lang==='en'?'en':'fr';}
  function render(){
    const mode=$('numMode').value, date=$('numDate').value, name=$('numName').value.trim(), year=Number($('numYear').value), out=$('numResult');
    try{
      const p=profile(date,name), py=personalYear(date,year);let html='';
      if(mode==='chemin'){
        if(!name)throw Error('Indiquez vos prénoms et nom de naissance.');
        html=`<h3>L’histoire racontée par vos nombres</h3><div class="num-grid">${[['Chemin de vie',p.life],['Jour de naissance',p.day],['Expression',p.expression],['Aspiration intime',p.soul],['Personnalité',p.personality]].map(([label,n])=>`<div><strong>${n}</strong><span>${label}</span></div>`).join('')}</div><p>Votre chemin de vie invite à ${themes[p.life]}. Votre expression donne une manière personnelle d'avancer, tandis que votre aspiration intime ${p.soul===p.expression?'va dans le même sens':'apporte une autre nuance à ce parcours'}. Votre personnalité représente la façon dont cet élan peut être perçu. Ces nombres éclairent des possibilités, à confronter à votre expérience.</p>`;
      }else if(mode==='annee'){
        html=`<h3>Votre année personnelle ${year} : ${py}</h3><p>Cette année invite à ${themes[py]}. Chaque mois colore ce mouvement différemment.</p><div class="num-months">${Array.from({length:12},(_,i)=>`<div><span>${new Intl.DateTimeFormat('fr',{month:'long'}).format(new Date(2024,i,1))}</span><strong>${personalMonth(date,year,i+1)}</strong></div>`).join('')}</div>`;
      }else if(mode==='relation'){
        const other=$('numOtherDate').value,q=profile(other,$('numOtherName').value.trim());
        html=`<h3>Nos nombres</h3><div class="num-grid"><div><strong>${p.life}</strong><span>Votre chemin</span></div><div><strong>${q.life}</strong><span>Son chemin</span></div></div><p>${p.life===q.life?'Vos chemins mettent en avant une aspiration semblable.':'Vos chemins apportent des rythmes différents à la relation.'} Le premier invite à ${themes[p.life]}, le second à ${themes[q.life]}. La rencontre de ces tendances peut ouvrir un dialogue sur vos besoins respectifs, sans mesurer ni prédire la réussite du lien.</p>`;
      }else{
        const drawn=typeof state!=='undefined'&&state.draw&&state.draw.length;
        if(!drawn)throw Error('Effectuez d’abord un tirage de cartes.');
        const now=new Date(), y=now.getFullYear(),m=now.getMonth()+1, month=personalMonth(date,y,m);
        html=`<h3>Les nombres de mon tirage</h3><p>Votre tirage aborde ${escape((state.domain||'votre question').toLowerCase())}. Pendant cette année personnelle ${personalYear(date,y)}, le mois ${month} invite à ${themes[month]}. Relisez les cartes dans cette perspective : leurs images décrivent la situation, tandis que ces nombres suggèrent une manière de l'aborder. La période d'une éventuelle carte Datation conserve son rôle propre.</p>`;
      }
      out.innerHTML=html;out.hidden=false;
    }catch(e){out.innerHTML=`<p role="alert">${escape(e.message)}</p>`;out.hidden=false;}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if(!$('numForm'))return;
    $('numYear').value=new Date().getFullYear();
    $('numMode').addEventListener('change',()=>{$('numOtherFields').hidden=$('numMode').value!=='relation';$('numYearField').hidden=$('numMode').value!=='annee';});
    $('numForm').addEventListener('submit',e=>{e.preventDefault();render();});
    $('numUseBirth').addEventListener('click',()=>{const birth=$('birthdate');if(birth&&birth.value)$('numDate').value=birth.value;});
    $('numFromDraw').addEventListener('click',()=>{$('numMode').value='tirage';$('numMode').dispatchEvent(new Event('change'));$('numerologie').scrollIntoView({behavior:'smooth'});});
  });
})(typeof window!=='undefined'?window:globalThis);
