(function(root){
  'use strict';
  const key='cristariva-numerologie-context';
  const resultKey='cristariva-numerologie-last-reading';
  let context={},drawnAt=null;
  const currentLang=()=>document.documentElement.lang==='en'?'en':'fr';
  function translate(){
    const en=currentLang()==='en';
    document.querySelectorAll('[data-num-fr]').forEach(el=>{el.textContent=el.dataset[en?'numEn':'numFr'];});
    document.querySelectorAll('[data-num-aria-fr]').forEach(el=>{el.setAttribute('aria-label',el.dataset[en?'numAriaEn':'numAriaFr']);});
  }
  function watchNumerologyResult(){
    const out=document.getElementById('numResult');
    if(!out||typeof MutationObserver==='undefined')return;
    let last='';
    const save=()=>{
      if(out.hidden)return;
      const value=(out.textContent||'').replace(/\s+/g,' ').trim();
      if(!value||value===last)return;
      last=value;
      try{localStorage.setItem(resultKey,JSON.stringify({savedAt:Date.now(),drawnAt:context.drawnAt||null,text:value,mode:document.getElementById('numMode')?.value||''}));}catch(e){}
    };
    new MutationObserver(save).observe(out,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
    save();
  }
  root.CristarivaNumerologieContext=()=>context;
  document.addEventListener('DOMContentLoaded',()=>{
    const standalone=!!document.getElementById('numForm');
    const params=new URLSearchParams(location.search);
    if(standalone){
      try{context=JSON.parse(sessionStorage.getItem(key)||'{}')||{};sessionStorage.removeItem(key);}catch(e){context={};}
      if(!context.savedAt||Date.now()-context.savedAt>3600000)context={};
      let language=params.get('lang');
      try{language=language||localStorage.getItem('cristariva-lang');}catch(e){}
      document.documentElement.lang=language==='en'?'en':'fr';
      const button=document.getElementById('langBtn');
      function updateLanguage(){
        const language=currentLang();
        button.textContent=language==='en'?'FR':'EN';
        document.title=(language==='en'?'Numerology':'Numérologie')+' — CRISTARIVA';
        document.querySelectorAll('a[href]').forEach(a=>{
          const url=new URL(a.href,location.href);
          if(url.origin===location.origin){url.searchParams.set('lang',language);a.href=url.href;}
        });
        translate();
      }
      button.addEventListener('click',()=>{
        document.documentElement.lang=currentLang()==='fr'?'en':'fr';
        try{localStorage.setItem('cristariva-lang',currentLang());}catch(e){}
        updateLanguage();
      });
      updateLanguage();
      watchNumerologyResult();
      return;
    }
    const save=()=>{
      const reading=typeof state!=='undefined'?state:{};
      context={savedAt:Date.now(),hasDraw:!!reading.draw?.length,date:reading.date?{id:reading.date.id}:null,drawnAt:drawnAt||new Date().toISOString(),birthdate:document.getElementById('birthdate')?.value||''};
      try{sessionStorage.setItem(key,JSON.stringify(context));}catch(e){}
    };
    document.querySelectorAll('a[href="./numerologie.html"]').forEach(a=>{
      a.addEventListener('click',()=>{save();a.href='./numerologie.html?lang='+currentLang();});
    });
    document.getElementById('numFromDraw')?.addEventListener('click',()=>{
      save();location.href='./numerologie.html?mode=tirage&lang='+currentLang();
    });
    document.getElementById('drawBtn')?.addEventListener('click',()=>{drawnAt=new Date().toISOString();});
    document.getElementById('langBtn')?.addEventListener('click',()=>queueMicrotask(translate));
    translate();
  });
})(window);
