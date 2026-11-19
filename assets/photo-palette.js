/* Deterministic, local-only palette sampler. This is NOT facial-feature inference. */
(function(root){
  'use strict';
  const skin=['#f9d9c4','#f0c4aa','#e8ad87','#d99a75','#b98261','#bf8158','#a36b4c','#87543e','#633e30','#43291f'];
  const hair=['#161725','#302323','#593d31','#794735','#aa5036','#cb7543','#d7b675','#b5bfcb','#a774db','#3bc7dd'];
  function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
  function distance(a,b){return a.reduce((sum,n,i)=>sum+(n-b[i])**2,0);}
  function nearest(sample,palette){let index=0,best=Infinity;palette.forEach((color,i)=>{const d=distance(sample,rgb(color));if(d<best){best=d;index=i;}});return index;}
  function average(data,width,height,region){const [x0,y0,x1,y1]=region;let r=0,g=0,b=0,n=0;for(let y=Math.floor(y0*height);y<Math.floor(y1*height);y+=2){for(let x=Math.floor(x0*width);x<Math.floor(x1*width);x+=2){const i=(y*width+x)*4,a=data[i+3];if(a<220)continue;r+=data[i];g+=data[i+1];b+=data[i+2];n++;}}return n>=10?[r/n,g/n,b/n]:null;}
  function suggest(imageData,width,height){if(!Number.isInteger(width)||!Number.isInteger(height)||width<32||height<32||!imageData||imageData.length!==width*height*4)throw Error('Invalid image sample');
    const center=average(imageData,width,height,[.39,.38,.61,.65]);
    const top=average(imageData,width,height,[.38,.08,.62,.22]);
    if(!center||!top)throw Error('Insufficient opaque pixels');
    return {version:1,method:'simple-region-colors',values:{'Skin tone':nearest(center,skin),'Hair color':nearest(top,hair)},confidence:'unverified',editable:true,warning:'Colors are approximate and may reflect lighting, background, or clothing. Review before saving.'};
  }
  root.SocialEyesPhotoPalette=Object.freeze({suggest});
})(typeof window!=='undefined'?window:globalThis);
