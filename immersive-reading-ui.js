/* CRISTARIVA — espace de tirage immersif — 2026-10-05. */
(function(){
  'use strict';

  const VERSION='20261006-oracle-description-r11';

  const ORACLE_DESCRIPTIONS={
    fr:{
      cristariva:{title:'Jeu actif : Oracle CRISTARIVA',text:'130 cartes pour une lecture symbolique, relationnelle, professionnelle ou spirituelle, complétée par les cartes de relation et de datation.'},
      amour:{title:'Jeu actif : Oracle sentimental CRISTARIVA',text:'80 cartes consacrées aux liens, aux émotions, aux attirances, aux obstacles et aux évolutions sentimentales.'},
      tarot:{title:'Jeu actif : Tarot divinatoire CRISTARIVA',text:'78 cartes : 22 arcanes majeurs et 56 arcanes mineurs · Bâtons, Coupes, Épées et Deniers.'}
    },
    en:{
      cristariva:{title:'Active deck: CRISTARIVA Oracle',text:'130 cards for symbolic, relationship, professional or spiritual readings, complemented by relationship and timing cards.'},
      amour:{title:'Active deck: CRISTARIVA Love Oracle',text:'80 cards devoted to bonds, emotions, attraction, obstacles and romantic developments.'},
      tarot:{title:'Active deck: CRISTARIVA Divinatory Tarot',text:'78 cards: 22 Major Arcana and 56 Minor Arcana · Wands, Cups, Swords and Pentacles.'}
    }
  };

  function hideLegacyTarotContext(){
    const legacy=document.getElementById('tarotContext');
    if(!legacy)return;
    if(!legacy.hidden)legacy.hidden=true;
    if(legacy.getAttribute('aria-hidden')!=='true')legacy.setAttribute('aria-hidden','true');
    if(legacy.style.getPropertyValue('display')!=='none'||legacy.style.getPropertyPriority('display')!=='important'){
      legacy.style.setProperty('display','none','important');
    }
  }

  function updateOracleDescription(){
    const oracle=document.getElementById('oracleChoice');
    if(!oracle)return;
    const parent=oracle.parentElement;
    if(!parent)return;

    let context=document.getElementById('oracleContext');
    if(!context){
      context=document.createElement('p');
      context.id='oracleContext';
      context.className='cr-oracle-description';
      context.setAttribute('aria-live','polite');
      parent.appendChild(context);
    }else if(context.parentElement!==parent){
      parent.appendChild(context);
    }

    const lang=(document.documentElement.lang||'fr').toLowerCase().startsWith('en')?'en':'fr';
    const selected=oracle.value||'cristariva';
    const selectedLabel=oracle.selectedOptions?.[0]?.textContent?.trim()||selected;
    const copy=ORACLE_DESCRIPTIONS[lang][selected]||{
      title:lang==='en'?`Active deck: ${selectedLabel}`:`Jeu actif : ${selectedLabel}`,
      text:lang==='en'?'This deck is used for the current reading.':'Ce jeu est utilisé pour le tirage en cours.'
    };
    context.hidden=false;
    context.removeAttribute('aria-hidden');
    context.innerHTML=`<b>${copy.title}</b><br>${copy.text}`;
    hideLegacyTarotContext();
  }

  window.CR_UPDATE_ORACLE_DESCRIPTION=updateOracleDescription;

  function scheduleOracleDescriptionRefresh(){
    updateOracleDescription();
    setTimeout(updateOracleDescription,0);
    setTimeout(updateOracleDescription,80);
  }

  function enhance(){
    const question=document.getElementById('question');
    if(!question)return;

    let panel=question.closest('.panel');
    if(!panel){
      const title=[...document.querySelectorAll('h1,h2,h3')].find(el=>/espace de tirage|reading space/i.test(el.textContent||''));
      panel=title?.closest('section,main,article,div')||question.closest('section,main,article,div');
    }
    if(!panel||panel.dataset.crImmersiveReading===VERSION)return;

    panel.dataset.crImmersiveReading=VERSION;
    panel.classList.add('cr-reading-immersive');

    const title=panel.querySelector('[data-i18n="s29"]')||panel.querySelector('h2');
    if(title){
      title.classList.add('cr-reading-immersive-title');
      if(!panel.querySelector('.cr-reading-immersive-subtitle')){
        const subtitle=document.createElement('p');
        subtitle.className='cr-reading-immersive-subtitle';
        const isEn=(document.documentElement.lang||'').toLowerCase().startsWith('en');
        subtitle.textContent=isEn
          ? 'Ask your question and let the cards guide you through the Reflections of the Lake.'
          : 'Posez votre question et laissez les cartes vous guider au cœur des Reflets du Lac.';
        title.insertAdjacentElement('afterend',subtitle);
      }
    }

    const steps=panel.querySelector('.steps,.stepper,[aria-label*="étape" i],[aria-label*="step" i]');
    if(steps)steps.classList.add('cr-immersive-steps');

    question.parentElement?.classList.add('cr-immersive-question-field');

    const domain=document.getElementById('domain');
    const oracle=document.getElementById('oracleChoice');
    const selectParents=[domain?.parentElement,oracle?.parentElement].filter(Boolean);
    selectParents.forEach(el=>el.classList.add('cr-immersive-select-field'));
    if(selectParents.length===2&&selectParents[0].parentElement===selectParents[1].parentElement){
      selectParents[0].parentElement.classList.add('cr-immersive-select-grid');
    }
    scheduleOracleDescriptionRefresh();
    oracle?.addEventListener('change',scheduleOracleDescriptionRefresh);
    domain?.addEventListener('change',scheduleOracleDescriptionRefresh);

    const spreads=[...panel.querySelectorAll('.choice[data-group="format"]')];
    spreads.forEach(el=>el.classList.add('cr-immersive-spread-choice'));
    if(spreads.length>1&&spreads.every(el=>el.parentElement===spreads[0].parentElement)){
      spreads[0].parentElement.classList.add('cr-immersive-spread-grid');
    }

    [...panel.querySelectorAll('button,a')].forEach(el=>{
      if(/m[ée]langer|tirer|shuffle|draw/i.test(el.textContent||''))el.classList.add('cr-reading-immersive-cta');
    });

    if(document.getElementById('cr-reading-immersive-styles'))return;
    const style=document.createElement('style');
    style.id='cr-reading-immersive-styles';
    style.textContent=`
      #approche.panel{
        padding-top:8px!important;
        padding-bottom:8px!important;
      }
      #approche h2{
        font-size:clamp(1.55rem,2vw,1.8rem)!important;
        margin:0 0 2px!important;
        line-height:1.04!important;
      }
      #approche .muted{
        font-size:clamp(.84rem,1.05vw,.92rem)!important;
        margin:0!important;
        line-height:1.22!important;
      }
      .cr-reading-immersive{
        --cr-night:#071b35;
        --cr-night-2:#0c3157;
        --cr-ivory:#fff8e8;
        --cr-gold:#e5ad55;
        --cr-gold-light:#ffd98d;
        position:relative!important;
        isolation:isolate;
        overflow:hidden;
        padding-top:clamp(24px,2.2vw,32px)!important;
        padding-bottom:clamp(24px,2.2vw,32px)!important;
        color:var(--cr-ivory)!important;
        background:
          linear-gradient(180deg,rgba(5,23,45,.48),rgba(5,24,48,.72)),
          url('./accueil-cristariva.png') center 52%/cover no-repeat!important;
        border:1px solid rgba(229,173,85,.82)!important;
        border-radius:30px!important;
        box-shadow:0 28px 75px rgba(0,12,30,.35)!important;
      }
      .cr-reading-immersive::before{
        content:"";
        position:absolute;
        inset:0;
        z-index:-1;
        background:
          radial-gradient(circle at 83% 12%,rgba(255,190,93,.20),transparent 27%),
          linear-gradient(90deg,rgba(4,20,40,.18),rgba(8,36,66,.08) 46%,rgba(4,20,40,.20));
        pointer-events:none;
      }
      .cr-reading-immersive > *{position:relative;z-index:1}
      .cr-reading-immersive-title{
        max-width:900px;
        margin-left:auto!important;
        margin-right:auto!important;
        text-align:center!important;
        color:#fff6dc!important;
        font-family:Cinzel,Georgia,'Times New Roman',serif!important;
        font-weight:500!important;
        letter-spacing:.01em;
        text-shadow:0 2px 20px rgba(0,10,25,.8);
      }
      .cr-reading-immersive-title::after{
        content:"✧  ◇  ✧";
        display:block;
        margin:.2rem auto .28rem;
        color:var(--cr-gold-light);
        font-size:.72em;
        letter-spacing:.38em;
      }
      .cr-reading-immersive-subtitle{
        max-width:820px;
        margin:-.05rem auto .7rem!important;
        text-align:center;
        color:rgba(255,248,232,.90)!important;
        font-size:clamp(.95rem,1.35vw,1.1rem);
        line-height:1.38;
        text-shadow:0 2px 14px rgba(0,10,25,.82);
      }
      .cr-reading-immersive label,
      .cr-reading-immersive legend,
      .cr-reading-immersive h3,
      .cr-reading-immersive h4{
        color:#fff9eb!important;
        text-shadow:0 2px 12px rgba(0,10,25,.78);
      }
      .cr-reading-immersive input,
      .cr-reading-immersive textarea,
      .cr-reading-immersive select{
        background:rgba(255,255,255,.95)!important;
        color:#14243b!important;
        border:1px solid rgba(255,224,170,.58)!important;
        box-shadow:0 8px 24px rgba(2,16,35,.13)!important;
      }
      .cr-reading-immersive textarea{
        min-height:74px!important;
      }
      .cr-reading-immersive input:focus,
      .cr-reading-immersive textarea:focus,
      .cr-reading-immersive select:focus{
        border-color:var(--cr-gold-light)!important;
        outline:3px solid rgba(255,211,129,.22)!important;
        outline-offset:1px;
      }
      #tarotContext{display:none!important;}
      .cr-reading-immersive .cr-oracle-description{
        display:block!important;
        margin:8px 2px 0!important;
        color:rgba(255,248,232,.96)!important;
        font-size:clamp(.76rem,1vw,.84rem)!important;
        line-height:1.35!important;
        text-shadow:0 2px 12px rgba(0,10,25,.82);
      }
      .cr-reading-immersive .cr-oracle-description b{
        color:#fff1c9!important;
        font-weight:750!important;
      }
      .cr-reading-immersive .cr-immersive-steps,
      .cr-reading-immersive .steps{
        justify-content:center!important;
        gap:.5rem!important;
        flex-wrap:wrap!important;
        margin-bottom:12px!important;
      }
      .cr-reading-immersive .step{
        color:rgba(255,248,232,.92)!important;
        background:rgba(7,30,58,.54)!important;
        border:1px solid rgba(255,255,255,.15)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
        backdrop-filter:blur(12px) saturate(115%);
        -webkit-backdrop-filter:blur(12px) saturate(115%);
      }
      .cr-reading-immersive .step.active,
      .cr-reading-immersive .step[aria-current="step"]{
        color:#11213a!important;
        background:linear-gradient(135deg,#ffe19a,#dda247)!important;
        border-color:#ffe3a3!important;
        box-shadow:0 0 0 3px rgba(255,218,142,.13),0 8px 24px rgba(0,15,38,.24)!important;
      }
      .cr-reading-immersive .cr-immersive-select-grid{
        gap:.75rem!important;
      }
      .cr-reading-immersive .cr-immersive-spread-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:.75rem!important;
      }
      .cr-reading-immersive .cr-immersive-spread-choice{
        min-height:92px;
        padding:12px 14px!important;
        color:#fff8e8!important;
        background:linear-gradient(180deg,rgba(8,40,72,.66),rgba(6,29,56,.60))!important;
        border:1px solid rgba(255,255,255,.27)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 10px 26px rgba(0,12,30,.18)!important;
        backdrop-filter:blur(12px) saturate(112%);
        -webkit-backdrop-filter:blur(12px) saturate(112%);
        transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease;
      }
      .cr-reading-immersive .cr-immersive-spread-choice:hover{
        transform:translateY(-2px);
        border-color:rgba(255,218,142,.72)!important;
      }
      .cr-reading-immersive .cr-immersive-spread-choice.selected,
      .cr-reading-immersive .cr-immersive-spread-choice[aria-pressed="true"]{
        color:#fffaf0!important;
        background:linear-gradient(180deg,rgba(31,57,84,.82),rgba(28,45,69,.82))!important;
        border-color:var(--cr-gold-light)!important;
        box-shadow:0 0 0 2px rgba(255,218,142,.20),0 10px 30px rgba(0,12,30,.26)!important;
      }
      .cr-reading-immersive .cr-immersive-spread-choice *,
      .cr-reading-immersive .cr-immersive-spread-choice small{
        color:inherit!important;
      }
      .cr-reading-immersive .cr-reading-immersive-cta{
        margin-top:0!important;
        color:#12223b!important;
        background:linear-gradient(135deg,#ffe09a 0%,#e6ad56 58%,#d4933f 100%)!important;
        border:1px solid rgba(255,232,181,.9)!important;
        box-shadow:0 10px 28px rgba(3,20,42,.28),inset 0 1px 0 rgba(255,255,255,.48)!important;
        transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;
      }
      .cr-reading-immersive .cr-reading-immersive-cta:hover{
        transform:translateY(-2px);
        filter:brightness(1.04);
        box-shadow:0 14px 34px rgba(3,20,42,.34),inset 0 1px 0 rgba(255,255,255,.55)!important;
      }
      .cr-reading-immersive .cr-reading-immersive-cta:focus-visible,
      .cr-reading-immersive .cr-immersive-spread-choice:focus-visible,
      .cr-reading-immersive .step:focus-visible{
        outline:3px solid rgba(255,224,154,.85)!important;
        outline-offset:3px!important;
      }
      @media (max-width:860px){
        #approche.panel{
          padding-top:7px!important;
          padding-bottom:7px!important;
        }
        #approche h2{
          font-size:1.4rem!important;
          margin-bottom:2px!important;
          line-height:1.04!important;
        }
        #approche .muted{
          font-size:.82rem!important;
          line-height:1.2!important;
        }
        .cr-reading-immersive{
          padding-top:20px!important;
          padding-bottom:20px!important;
          border-radius:22px!important;
          background-position:58% center!important;
        }
        .cr-reading-immersive .cr-immersive-spread-grid{
          grid-template-columns:1fr!important;
        }
        .cr-reading-immersive .cr-immersive-spread-choice{
          min-height:76px;
          padding:10px 12px!important;
        }
        .cr-reading-immersive .cr-immersive-steps,
        .cr-reading-immersive .steps{
          justify-content:flex-start!important;
          flex-wrap:nowrap!important;
          overflow-x:auto;
          scrollbar-width:thin;
          padding-bottom:.3rem;
          margin-bottom:11px!important;
        }
        .cr-reading-immersive .step{flex:0 0 auto}
      }
      @media (prefers-reduced-motion:reduce){
        .cr-reading-immersive .cr-immersive-spread-choice,
        .cr-reading-immersive .cr-reading-immersive-cta{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function positionReadingEntry(behavior='smooth'){
    const target=document.getElementById('approche')||document.getElementById('tirage');
    if(!target)return;
    const topbar=document.querySelector('.topbar');
    const topbarHeight=topbar&&getComputedStyle(topbar).position==='sticky'
      ? topbar.getBoundingClientRect().height
      : 0;
    const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-topbarHeight-12);
    window.scrollTo({top,behavior});
  }

  function installReadingEntryPositioning(){
    document.addEventListener('click',event=>{
      const link=event.target.closest('a[href]');
      if(!link)return;
      let url;
      try{url=new URL(link.getAttribute('href'),window.location.href);}catch(e){return;}
      if(url.hash!=='#tirage'||url.origin!==window.location.origin||url.pathname!==window.location.pathname)return;
      event.preventDefault();
      if(window.location.hash==='#tirage')history.replaceState(null,'','#tirage');
      else history.pushState(null,'','#tirage');
      requestAnimationFrame(()=>requestAnimationFrame(()=>positionReadingEntry('smooth')));
    });

    window.addEventListener('hashchange',()=>{
      if(window.location.hash==='#tirage')requestAnimationFrame(()=>requestAnimationFrame(()=>positionReadingEntry('smooth')));
    });

    if(window.location.hash==='#tirage'){
      requestAnimationFrame(()=>requestAnimationFrame(()=>positionReadingEntry('auto')));
    }
  }

  function updateSubtitle(){
    const subtitle=document.querySelector('.cr-reading-immersive-subtitle');
    if(subtitle)subtitle.textContent=(document.documentElement.lang||'').toLowerCase().startsWith('en')
      ? 'Ask your question and let the cards guide you through the Reflections of the Lake.'
      : 'Posez votre question et laissez les cartes vous guider au cœur des Reflets du Lac.';
    scheduleOracleDescriptionRefresh();
  }
  new MutationObserver(updateSubtitle).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  const legacyObserver=new MutationObserver(mutations=>{
    if(!mutations.some(m=>m.type==='childList'||(m.type==='attributes'&&m.target?.id==='tarotContext')))return;
    hideLegacyTarotContext();
  });
  legacyObserver.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style','class']});

  installReadingEntryPositioning();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();
})();
