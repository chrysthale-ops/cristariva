/* CRISTARIVA — réparation forcée du Tarot divinatoire 78 cartes — 2026-09-25. */
(function(){
  'use strict';

  const VERSION='20261006-reversal-inline-r3';
  let reversalLayoutObserver=null;
  let reversalLayoutScheduled=false;

  function appendScript(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Impossible de charger '+src));
      document.head.appendChild(s);
    });
  }

  function compactTarotReversalOption(){
    const option=document.getElementById('tarotReversalOption');
    const heading=document.querySelector('h3[data-i18n="s37"]');
    if(!option||!heading)return;

    option.classList.remove('cr-tarot-reversal-compact');

    let row=document.getElementById('crFormatReversalRow');
    if(!row){
      row=document.createElement('div');
      row.id='crFormatReversalRow';
      row.className='cr-format-reversal-row';
      heading.parentNode.insertBefore(row,heading);
    }
    if(heading.parentNode!==row)row.appendChild(heading);
    if(option.parentNode!==row)row.appendChild(option);

    const hint=document.getElementById('tarotReversalHint');
    const label=option.querySelector('label');
    if(hint){
      const fullHint=hint.textContent.trim();
      hint.hidden=true;
      if(label)label.title=fullHint;
      option.setAttribute('aria-description',fullHint);
    }

    if(!document.getElementById('cr-tarot-reversal-inline-style')){
      const style=document.createElement('style');
      style.id='cr-tarot-reversal-inline-style';
      style.textContent=`
        #crFormatReversalRow{
          display:flex!important;
          align-items:center!important;
          gap:14px!important;
          flex-wrap:nowrap!important;
          margin:1.35rem 0 .8rem!important;
          min-width:0;
        }
        #crFormatReversalRow>h3[data-i18n="s37"]{
          flex:0 0 auto;
          margin:0!important;
          line-height:1.15!important;
          white-space:nowrap;
        }
        #crFormatReversalRow .tarot-reversal-option{
          display:inline-flex!important;
          align-items:center!important;
          flex:0 0 auto;
          width:auto!important;
          max-width:100%;
          min-height:0!important;
          box-sizing:border-box!important;
          margin:0!important;
          padding:7px 12px!important;
          border-radius:999px!important;
          background:rgba(255,250,240,.96)!important;
          border:1px solid #d6c49f!important;
          box-shadow:0 6px 18px rgba(0,12,30,.12)!important;
        }
        #crFormatReversalRow .tarot-reversal-option[hidden]{display:none!important}
        #crFormatReversalRow .tarot-reversal-option label{
          display:inline-flex!important;
          align-items:center!important;
          gap:8px!important;
          margin:0!important;
          color:#172033!important;
          text-shadow:none!important;
          white-space:nowrap!important;
          font-size:.9rem!important;
          font-weight:750!important;
          line-height:1!important;
          cursor:pointer;
        }
        #crFormatReversalRow .tarot-reversal-option input{
          width:18px!important;
          height:18px!important;
          min-width:18px!important;
          margin:0!important;
          flex:0 0 18px!important;
          box-shadow:none!important;
        }
        #crFormatReversalRow .tarot-reversal-option small{display:none!important}
        @media(max-width:680px){
          #crFormatReversalRow{
            gap:9px!important;
            overflow-x:auto;
            padding-bottom:2px;
          }
          #crFormatReversalRow>h3[data-i18n="s37"]{font-size:1rem!important}
          #crFormatReversalRow .tarot-reversal-option{padding:6px 9px!important}
          #crFormatReversalRow .tarot-reversal-option label{font-size:.78rem!important}
        }
      `;
      document.head.appendChild(style);
    }
  }

  function scheduleCompactTarotReversalOption(){
    if(reversalLayoutScheduled)return;
    reversalLayoutScheduled=true;
    setTimeout(()=>{
      reversalLayoutScheduled=false;
      compactTarotReversalOption();
    },0);
  }

  function installTarotReversalLayoutGuard(){
    if(reversalLayoutObserver)return;
    const root=document.getElementById('tirage')||document.querySelector('.cr-reading-immersive')||document.body;
    if(!root)return;
    reversalLayoutObserver=new MutationObserver(mutations=>{
      if(!mutations.some(m=>m.type==='childList'))return;
      const option=document.getElementById('tarotReversalOption');
      const heading=document.querySelector('h3[data-i18n="s37"]');
      const row=document.getElementById('crFormatReversalRow');
      if(!option||!heading||!row||option.parentNode!==row||heading.parentNode!==row||option.classList.contains('cr-tarot-reversal-compact')){
        scheduleCompactTarotReversalOption();
      }
    });
    reversalLayoutObserver.observe(root,{childList:true,subtree:true});
    document.getElementById('oracleChoice')?.addEventListener('change',scheduleCompactTarotReversalOption);
    document.getElementById('domain')?.addEventListener('change',scheduleCompactTarotReversalOption);
  }

  async function activateTarot78(){
    try{
      if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main)){
        await appendScript('./tarot-divinatoire-data.js?v='+VERSION+'-base');
      }

      const majors=(window.TAROT_DATA?.main||[]).filter(c=>Number(c.id)>=1&&Number(c.id)<=22);
      window.TAROT_DATA={main:majors,all:majors.slice()};

      delete window.CR_TAROT_MINOR_IMAGES_READY;
      delete window.CR_TAROT_MINOR_SPRITE_INFO;
      window.CR_TAROT_MINOR_IMAGES={};
      await appendScript('./tarot-minor-sprite-loader.js?v='+VERSION);
      if(window.CR_TAROT_MINOR_IMAGES_READY)await window.CR_TAROT_MINOR_IMAGES_READY;

      const imageCount=Object.keys(window.CR_TAROT_MINOR_IMAGES||{}).filter(k=>Number(k)>=23&&Number(k)<=78).length;
      if(imageCount!==56){
        throw new Error('Seulement '+imageCount+'/56 illustrations mineures sont disponibles.');
      }

      window.CR_TAROT_MINOR_ROWS=[];
      for(const file of [
        'tarot-minors-data-batons.js',
        'tarot-minors-data-coupes.js',
        'tarot-minors-data-epees.js',
        'tarot-minors-data-deniers.js'
      ]){
        await appendScript('./'+file+'?v='+VERSION);
      }
      await appendScript('./tarot-minors-v1.js?v='+VERSION);

      if(!window.TAROT_DATA||window.TAROT_DATA.main.length!==78){
        throw new Error('Le Tarot reconstruit contient '+(window.TAROT_DATA?.main?.length||0)+' cartes au lieu de 78.');
      }

      delete window.__CRISTARIVA_TAROT_READY__;
      await appendScript('./tarot-divinatoire-integration-v78.js?v=20261008-all-thumbnails-r1');
      await appendScript('./tarot-story-fluid-v6.2.js?v=6.6-'+VERSION);
      installTarotReversalLayoutGuard();
      compactTarotReversalOption();

      window.CR_TAROT_HOTFIX_VERSION='2026.10.06-reversal-inline-r3';
      document.documentElement.dataset.cristarivaTarot='78';
      document.documentElement.dataset.cristarivaTarotImages='56';
      document.documentElement.dataset.cristarivaTarotStory='6.2';
    }catch(e){
      console.error('CRISTARIVA : impossible d’activer le Tarot 78 cartes.',e);
    }
  }

  installTarotReversalLayoutGuard();
  compactTarotReversalOption();
  activateTarot78();
})();