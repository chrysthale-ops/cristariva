/* CRISTARIVA — illustrations des 56 arcanes mineurs depuis la planche WebP validée. */
(function(){
'use strict';
if(window.CR_TAROT_MINOR_IMAGES_READY)return;
window.CR_TAROT_MINOR_IMAGES=window.CR_TAROT_MINOR_IMAGES||{};
window.CR_TAROT_MINOR_IMAGES_READY=(async()=>{
  const rawBase='https://raw.githubusercontent.com/chrysthale-ops/cristariva/main/.cristariva-tarot78-sprite/';
  const names=['part-00a','part-00b','part-00c','part-01','part-02','part-03','part-04','part-05','part-06','part-07'];

  async function fetchPart(name){
    const local=`./.cristariva-tarot78-sprite/${name}?v=20260924-r8`;
    try{
      const r=await fetch(local,{cache:'no-store'});
      if(r.ok)return await r.text();
    }catch(e){}
    const r=await fetch(rawBase+name+'?v=20260924-r8',{cache:'no-store',mode:'cors'});
    if(!r.ok)throw new Error('Segment de planche manquant : '+name);
    return await r.text();
  }

  const parts=[];
  for(const name of names)parts.push(await fetchPart(name));
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

    const COLS=7,ROWS=8;
    const sourceW=img.naturalWidth||img.width;
    const sourceH=img.naturalHeight||img.height;
    if(sourceW%COLS!==0||sourceH%ROWS!==0){
      throw new Error(`Dimensions inattendues de la planche : ${sourceW}×${sourceH}`);
    }
    const W=sourceW/COLS,H=sourceH/ROWS;
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

    const count=Object.keys(window.CR_TAROT_MINOR_IMAGES).filter(k=>Number(k)>=23&&Number(k)<=78).length;
    if(count!==56)throw new Error(`Seulement ${count}/56 illustrations mineures ont été préparées.`);

    window.CR_TAROT_MINOR_SPRITE_INFO={width:sourceW,height:sourceH,cardWidth:W,cardHeight:H,count,version:'2026.09.24-r8'};
    return window.CR_TAROT_MINOR_IMAGES;
  }finally{
    URL.revokeObjectURL(url);
  }
})();
})();