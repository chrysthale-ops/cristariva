/* CRISTARIVA — cohérence de l’analyse croisée de période v1.6
   L’analyse croisée n°2 réutilise les transits individuels retenus pour chacun.
   Une influence difficile chez l’un et porteuse chez l’autre produit une phase
   contrastée, jamais une conclusion globale du type « aucun soutien ».
*/
(function(){
  'use strict';
  if(window.__CRISTARIVA_RELATION_PERIOD_CONSISTENCY_V16__) return;
  window.__CRISTARIVA_RELATION_PERIOD_CONSISTENCY_V16__=true;

  const DAY=86400000;
  const isEn=()=>window.state?.lang==='en';
  const text=(fr,en)=>isEn()?en:fr;
  let rewriting=false;

  function dval(v){
    const d=v instanceof Date?v:new Date(v);
    return Number.isFinite(+d)?+d:0;
  }

  function dateLabel(v){
    const d=v instanceof Date?v:new Date(v);
    if(!Number.isFinite(+d)) return '';
    try{ if(typeof cr3Date==='function') return cr3Date(d,isEn()); }catch(e){}
    return new Intl.DateTimeFormat(isEn()?'en-GB':'fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d);
  }

  function intent(){
    try{ return typeof cr33Intent==='function'?cr33Intent():undefined; }catch(e){ return undefined; }
  }

  function profileHits(profile){
    if(!profile) return [];
    try{
      if(window.state?.date && typeof cr37RelevantWindows==='function' && typeof cr3DominantTheme==='function' && typeof cr3TimingWindow==='function' && typeof cr3ReadingMoment==='function'){
        return cr37RelevantWindows(
          profile,
          cr3DominantTheme(state.draw||[],isEn()),
          cr3TimingWindow(state.date,cr3ReadingMoment(),isEn()),
          intent()
        )||[];
      }
    }catch(e){ console.warn('CRISTARIVA cohérence période : lecture des transits',e); }
    return [];
  }

  function hitScore(h){
    try{ if(typeof cr33HitScore==='function') return cr33HitScore(h,intent()); }catch(e){}
    let score=h?.tone==='support'?12:h?.tone==='challenge'?8:6;
    score+=Math.max(0,6-(h?.bestOrb??h?.orb??6));
    return score;
  }

  function bestHits(profile,max=3){
    return profileHits(profile).slice().sort((a,b)=>hitScore(b)-hitScore(a)).slice(0,max);
  }

  function maxGapDays(){
    let label='';
    try{ label=String(typeof cardName==='function'?cardName(state.date):(state.date?.name||'')); }catch(e){ label=String(state.date?.name||''); }
    const n=parseInt((label.match(/\d+/)||[])[0]||'',10);
    if(/jour|day/i.test(label)&&Number.isFinite(n)) return Math.max(2,Math.min(7,n));
    if(/semaine|week/i.test(label)&&Number.isFinite(n)) return Math.max(4,Math.min(10,n*7));
    if(/mois|month/i.test(label)) return 10;
    return 7;
  }

  function near(a,b){
    const a0=dval(a?.first||a?.bestDate),a1=dval(a?.last||a?.bestDate),b0=dval(b?.first||b?.bestDate),b1=dval(b?.last||b?.bestDate);
    if(!a0||!b0) return false;
    if(Math.max(a0,b0)<=Math.min(a1||a0,b1||b0)) return true;
    return Math.abs(dval(a.bestDate)-dval(b.bestDate))<=maxGapDays()*DAY;
  }

  function pairDate(p){
    const a=dval(p.a?.bestDate),b=dval(p.b?.bestDate);
    if(!a) return b;
    if(!b) return a;
    return Math.round((a+b)/2);
  }

  function when(p){
    const a=dval(p.a?.bestDate),b=dval(p.b?.bestDate);
    if(!a&&!b) return text('Sur une même phase de la période','During the same phase of the period');
    if(!a||!b) return text(`Autour du ${dateLabel(a||b)}`,`Around ${dateLabel(a||b)}`);
    if(Math.abs(a-b)<=3*DAY) return text(`Autour du ${dateLabel(new Date((a+b)/2))}`,`Around ${dateLabel(new Date((a+b)/2))}`);
    return text(`Entre le ${dateLabel(new Date(Math.min(a,b)))} et le ${dateLabel(new Date(Math.max(a,b)))}`,`Between ${dateLabel(new Date(Math.min(a,b)))} and ${dateLabel(new Date(Math.max(a,b)))}`);
  }

  const TARGET_FR={
    Soleil:'vos repères personnels et votre manière de vous positionner',
    Lune:'votre sensibilité et vos réactions émotionnelles',
    Mercure:'votre pensée, vos échanges et vos décisions',
    'Vénus':'vos sentiments et votre manière de vous rapprocher',
    Mars:'votre initiative, votre désir et votre manière d’agir'
  };
  const TARGET_OTHER_FR={
    Soleil:'ses repères personnels et sa manière de se positionner',
    Lune:'sa sensibilité et ses réactions émotionnelles',
    Mercure:'sa pensée, ses échanges et ses décisions',
    'Vénus':'ses sentiments et sa manière de se rapprocher',
    Mars:'son initiative, son désir et sa manière d’agir'
  };
  const TARGET_EN={
    Soleil:'your personal bearings and way of positioning yourself',
    Lune:'your sensitivity and emotional reactions',
    Mercure:'your thinking, exchanges and decisions',
    'Vénus':'your feelings and way of moving closer',
    Mars:'your initiative, desire and way of acting'
  };
  const TARGET_OTHER_EN={
    Soleil:'their personal bearings and way of positioning themselves',
    Lune:'their sensitivity and emotional reactions',
    Mercure:'their thinking, exchanges and decisions',
    'Vénus':'their feelings and way of moving closer',
    Mars:'their initiative, desire and way of acting'
  };

  function target(h,other){
    const map=isEn()?(other?TARGET_OTHER_EN:TARGET_EN):(other?TARGET_OTHER_FR:TARGET_FR);
    return map[h?.na]||text(other?'son fonctionnement personnel':'votre fonctionnement personnel',other?'their personal functioning':'your personal functioning');
  }

  function effect(h,other=false){
    const planet=h?.tr||text('une influence','an influence');
    const t=target(h,other);
    if(isEn()){
      if(h?.tone==='support') return `${planet} supports ${t}`;
      if(h?.tone==='challenge') return `${planet} puts pressure on ${t}`;
      return `${planet} strongly activates ${t}`;
    }
    if(h?.tone==='support') return `${planet} soutient ${t}`;
    if(h?.tone==='challenge') return `${planet} met sous tension ${t}`;
    return `${planet} active fortement ${t}`;
  }

  function pairScore(a,b){
    const days=Math.abs(dval(a.bestDate)-dval(b.bestDate))/DAY;
    return hitScore(a)+hitScore(b)+Math.max(0,10-Math.min(days,10))+(a.tr&&b.tr&&a.tr===b.tr?4:0);
  }

  function sharedPairs(c,r){
    const out=[];
    for(const a of bestHits(c,4)) for(const b of bestHits(r,4)){
      if(!near(a,b)) continue;
      out.push({a,b,score:pairScore(a,b)});
    }
    return out.sort((x,y)=>y.score-x.score);
  }

  function pairTone(p){
    if(p.a?.tone==='support'&&p.b?.tone==='support') return 'support';
    if(p.a?.tone==='challenge'&&p.b?.tone==='challenge') return 'challenge';
    return 'mixed';
  }

  function pairNarrative(p){
    const tone=pairTone(p);
    const first=effect(p.a,false),second=effect(p.b,true);
    if(isEn()){
      let end='The two individual readings therefore describe different effects occurring at the same time. This is a contrasted phase, not an absence of support or a general blockage of the bond.';
      if(tone==='support') end='Both individual readings point toward a more supportive climate at the same time, which can make dialogue or movement in the bond easier without predetermining the outcome.';
      if(tone==='challenge') end='Both individual readings show a more demanding phase at the same time. This calls for more flexibility and clarity, without proving conflict or distancing between you.';
      return `${when(p)}, ${first}, while ${second}. ${end}`;
    }
    let end='Les deux lectures individuelles décrivent donc des effets différents au même moment. Il s’agit d’une phase contrastée, et non d’une absence de soutien ni d’un blocage global du lien.';
    if(tone==='support') end='Les deux lectures individuelles vont ici dans un sens plutôt porteur, ce qui peut rendre le dialogue ou le mouvement du lien plus facile sans prédéterminer son issue.';
    if(tone==='challenge') end='Les deux lectures individuelles montrent ici une phase plus exigeante. Elle demande davantage de souplesse et de clarté, sans prouver à elle seule un conflit ou un éloignement entre vous.';
    return `${when(p)}, ${first}, tandis que ${second}. ${end}`;
  }

  function separateNarrative(c,r){
    const a=bestHits(c,1)[0],b=bestHits(r,1)[0];
    if(!a&&!b) return text(
      'Sur cette période, aucun transit individuel suffisamment net n’est retenu pour construire une évolution croisée fiable.',
      'Over this period, no sufficiently clear individual transit is retained to build a reliable cross-development.'
    );
    if(isEn()){
      const parts=[];
      if(a) parts.push(`For you, around ${dateLabel(a.bestDate)}, ${effect(a,false)}.`);
      if(b) parts.push(`For the other person, around ${dateLabel(b.bestDate)}, ${effect(b,true)}.`);
      parts.push('These two individual rhythms are not synchronized closely enough to merge them into a single shared phase; they should therefore remain distinct rather than being forced into a positive or negative relationship verdict.');
      return parts.join(' ');
    }
    const parts=[];
    if(a) parts.push(`Pour vous, autour du ${dateLabel(a.bestDate)}, ${effect(a,false)}.`);
    if(b) parts.push(`Pour l’autre personne, autour du ${dateLabel(b.bestDate)}, ${effect(b,true)}.`);
    parts.push('Ces deux rythmes individuels ne sont pas assez synchronisés pour être fusionnés en une seule phase commune ; ils doivent donc rester distincts plutôt que d’être forcés dans une conclusion relationnelle positive ou négative.');
    return parts.join(' ');
  }

  function periodNarrative(c,r){
    const pairs=sharedPairs(c,r);
    if(!pairs.length) return separateNarrative(c,r);
    const selected=[],usedDates=[];
    for(const p of pairs){
      const d=pairDate(p);
      if(usedDates.some(x=>Math.abs(x-d)<=3*DAY)) continue;
      selected.push(p);usedDates.push(d);
      if(selected.length===2) break;
    }
    selected.sort((a,b)=>pairDate(a)-pairDate(b));
    return selected.map(pairNarrative).join(' ');
  }

  function synthesisComparison(c,r){
    const mine=bestHits(c,2),other=bestHits(r,2),pairs=sharedPairs(c,r);
    if(!mine.length&&!other.length) return text(
      'Sur la période retenue, aucun pic individuel suffisamment net ne ressort pour l’un ou l’autre thème ; le tirage ne permet pas d’isoler un moment commun.',
      'During the selected period, neither chart shows a sufficiently clear individual peak, so no shared moment can be isolated.'
    );
    const describe=(hits,person)=>{
      if(!hits.length)return text(
        person==='mine'?'aucun pic suffisamment net ne ressort sur votre thème':'aucun pic suffisamment net ne ressort sur le thème de l’autre personne',
        person==='mine'?'no sufficiently clear peak appears in your chart':'no sufficiently clear peak appears in the other person’s chart'
      );
      const labels=hits.map(h=>`${h.tr||''} ${h.name||''} ${h.na||''} ${text('natal','natal')} (${dateLabel(h.bestDate)})`);
      return text(
        `${person==='mine'?'votre thème':'le thème de l’autre personne'} retient ${labels.join(' et ')}`,
        `${person==='mine'?'your chart':'the other person’s chart'} shows ${labels.join(' and ')}`
      );
    };
    const intro=text('Sur la période du tirage,','During the reading period,');
    const conclusion=pairs.length
      ? text('Certains de ces moments se recouvrent, mais ils agissent différemment sur chaque thème et ne garantissent pas à eux seuls une évolution du lien.',
             'Some of these moments overlap, but they act differently in each chart and do not by themselves guarantee a relationship outcome.')
      : text('Ces indications individuelles ne forment pas un pic partagé suffisamment net ; il faut les lire séparément, sans en déduire une échéance certaine pour le lien.',
             'These individual indications do not form a sufficiently clear shared peak; they should be read separately, without inferring a definite relationship event.');
    return `${intro} ${describe(mine,'mine')}, ${text('tandis que','while')} ${describe(other,'other')}. ${conclusion}`;
  }

  function rewriteCrossPeriod(){
    if(rewriting) return;
    try{
      const box=document.getElementById('synthesis');
      const section=box?.querySelector('.cr-cross-transits');
      if(!section||!window.state?.astro||!window.state?.relationAstro||!window.state?.date) return;
      rewriting=true;
      const ps=section.querySelectorAll('p');
      const intro=text(
        'Cette seconde lecture met en regard les mêmes influences individuelles que celles décrites dans les deux analyses de période ci-dessus. Elle cherche les moments où vos deux rythmes astrologiques se rencontrent, sans transformer automatiquement une difficulté vécue par l’un en difficulté du lien tout entier.',
        'This second reading compares the same individual influences described in the two period analyses above. It looks for moments when both astrological rhythms meet, without automatically turning one person’s difficulty into a difficulty for the relationship as a whole.'
      );
      const body=periodNarrative(state.astro,state.relationAstro);
      if(ps[0]&&ps[0].textContent!==intro) ps[0].textContent=intro;
      if(ps[1]&&ps[1].textContent!==body) ps[1].textContent=body;
      section.dataset.periodConsistency='1.6';
      const synthesis=box.querySelector('.cr362-global');
      if(synthesis){
        let comparison=synthesis.querySelector('.cr-cross-summary');
        if(!comparison){comparison=document.createElement('p');comparison.className='cr-cross-summary';synthesis.appendChild(comparison);}
        const summary=synthesisComparison(state.astro,state.relationAstro);
        if(comparison.textContent!==summary)comparison.textContent=summary;
      }
    }catch(e){ console.warn('CRISTARIVA cohérence analyse croisée',e); }
    finally{ rewriting=false; }
  }

  function install(){
    if(typeof window.renderSynthesis!=='function') return false;
    if(!window.renderSynthesis.__cristarivaPeriodConsistencyV16){
      const base=window.renderSynthesis;
      const wrapped=function(){
        const out=base.apply(this,arguments);
        rewriteCrossPeriod();
        setTimeout(rewriteCrossPeriod,0);
        setTimeout(rewriteCrossPeriod,60);
        return out;
      };
      wrapped.__cristarivaPeriodConsistencyV16=true;
      window.renderSynthesis=wrapped;
    }
    const box=document.getElementById('synthesis');
    if(box&&!box.__cristarivaPeriodObserverV16){
      const observer=new MutationObserver(function(){ if(!rewriting) setTimeout(rewriteCrossPeriod,0); });
      observer.observe(box,{childList:true,subtree:true,characterData:true});
      box.__cristarivaPeriodObserverV16=observer;
    }
    rewriteCrossPeriod();
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){
      tries+=1;
      if(install()||tries>80) clearInterval(timer);
    },50);
  }
})();
