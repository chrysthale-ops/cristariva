/* CRISTARIVA — illustrations des 56 arcanes mineurs depuis la planche WebP 7 × 8. */
(function(){
'use strict';
if(window.CR_TAROT_MINOR_IMAGES_READY)return;
window.CR_TAROT_MINOR_IMAGES=window.CR_TAROT_MINOR_IMAGES||{};
window.CR_TAROT_MINOR_IMAGES_READY=(async()=>{
  const parts=[];
  const rawBase='https://raw.githubusercontent.com/chrysthale-ops/cristariva/main/.cristariva-tarot78-sprite/';
  async function fetchPart(i){
    const name=`part-${String(i).padStart(2,'0')}`;
    const local=`./.cristariva-tarot78-sprite/${name}?v=20260924-r7`;
    try{
      const r=await fetch(local,{cache:'no-store'});
      if(r.ok)return await r.text();
    }catch(e){}
    const r=await fetch(rawBase+name+'?v=20260924-r7',{cache:'no-store',mode:'cors'});
    if(!r.ok)throw new Error('Partie de planche manquante '+i);
    return await r.text();
  }
  for(let i=0;i<4;i++)parts.push(await fetchPart(i));

  const encoded=parts.join('').replace(/\s+/g,'');
  const bin=atob(encoded);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));

  try{
    const img=await new Promise((resolve,reject)=>{
      const x=new Image();
      x.onload=()=>resolve(x);
      x.onerror=()=>reject(new Error('Planche Tarot mineur illisible'));
      x.src=url;
    });

    /* La planche réelle mesure 630 × 1080 px : 7 colonnes × 8 lignes,
       donc chaque carte mesure 90 × 135 px. L'ancien chargeur utilisait
       à tort 120 × 180 px, ce qui produisait les rectangles noirs. */
    const COLS=7, ROWS=8;
    const sourceW=img.naturalWidth||img.width;
    const sourceH=img.naturalHeight||img.height;
    if(sourceW%COLS!==0||sourceH%ROWS!==0){
      throw new Error(`Dimensions inattendues de la planche : ${sourceW}×${sourceH}`);
    }
    const W=sourceW/COLS;
    const H=sourceH/ROWS;

    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('Canvas indisponible');

    for(let id=23;id<=78;id++){
      const n=id-23;
      const x=(n%COLS)*W;
      const y=Math.floor(n/COLS)*H;
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(img,x,y,W,H,0,0,W,H);
      window.CR_TAROT_MINOR_IMAGES[id]=canvas.toDataURL('image/webp',0.94);
    }

    window.CR_TAROT_MINOR_SPRITE_INFO={width:sourceW,height:sourceH,cardWidth:W,cardHeight:H,count:56,version:'2026.09.24-r7'};
    return window.CR_TAROT_MINOR_IMAGES;
  }finally{
    URL.revokeObjectURL(url);
  }
})();
})();