/* CRISTARIVA — illustrations des 56 arcanes mineurs depuis une planche WebP compactée. */
(function(){
'use strict';
if(window.CR_TAROT_MINOR_IMAGES_READY)return;
window.CR_TAROT_MINOR_IMAGES=window.CR_TAROT_MINOR_IMAGES||{};
window.CR_TAROT_MINOR_IMAGES_READY=(async()=>{
  const parts=[];
  for(let i=0;i<4;i++){
    const r=await fetch(`./.cristariva-tarot78-sprite/part-${String(i).padStart(2,'0')}?v=20260924-red2`,{cache:'no-store'});
    if(!r.ok)throw new Error('Partie de planche manquante '+i);
    parts.push(await r.text());
  }
  const bin=atob(parts.join('').trim());
  const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
  const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=url;});
  const W=120,H=180,COLS=7;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{alpha:false});
  for(let id=23;id<=78;id++){
    const n=id-23,x=(n%COLS)*W,y=Math.floor(n/COLS)*H;
    ctx.clearRect(0,0,W,H);ctx.drawImage(img,x,y,W,H,0,0,W,H);
    window.CR_TAROT_MINOR_IMAGES[id]=canvas.toDataURL('image/webp',0.9);
  }
  URL.revokeObjectURL(url);
  return window.CR_TAROT_MINOR_IMAGES;
})();
})();
