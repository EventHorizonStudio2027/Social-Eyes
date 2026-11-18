/* Social Eyes original modular head-shape geometry.
 * Shared 300x390 avatar canvas. Heads are centered at x=150; features remain independent.
 * Ten deliberately distinct human silhouettes; no raster crops or third-party artwork.
 */
(function(root){
"use strict";
const shapes=[
 {name:"Classic oval",crown:.82,temple:.91,cheek:1.0,jaw:.70,chin:4},
 {name:"Soft round",crown:.94,temple:1.02,cheek:1.09,jaw:.91,chin:-6},
 {name:"Heart",crown:.90,temple:.96,cheek:1.13,jaw:.48,chin:12},
 {name:"Strong square",crown:.83,temple:.97,cheek:1.01,jaw:.98,chin:-7},
 {name:"Long oval",crown:.73,temple:.80,cheek:.83,jaw:.62,chin:15},
 {name:"Diamond",crown:.71,temple:.82,cheek:1.18,jaw:.53,chin:8},
 {name:"Pear",crown:.75,temple:.83,cheek:.91,jaw:1.10,chin:-2},
 {name:"Petite tapered",crown:.83,temple:.85,cheek:.88,jaw:.49,chin:10},
 {name:"Broad rounded",crown:.99,temple:1.08,cheek:1.13,jaw:.96,chin:-4},
 {name:"Angular narrow",crown:.76,temple:.81,cheek:.92,jaw:.62,chin:14}
];
function path(index,centerX,top,halfWidth,halfHeight){
 const s=shapes[Math.max(0,Math.min(shapes.length-1,Math.trunc(index)||0))];
 const x=centerX,y=top,h=halfHeight,w=halfWidth;
 const crown=w*s.crown,temple=w*s.temple,cheek=w*s.cheek,jaw=w*s.jaw;
 const sideY=y+h*1.05,bottom=y+h*2;
 const n=v=>Number(v.toFixed(2));
 return [
 'M',n(x),' ',n(y),
 ' C',n(x+crown*.65),' ',n(y-3),' ',n(x+temple),' ',n(y+h*.20),' ',n(x+temple),' ',n(y+h*.54),
 ' C',n(x+cheek),' ',n(y+h*.82),' ',n(x+cheek),' ',n(sideY),' ',n(x+cheek*.98),' ',n(y+h*1.26),
 ' Q',n(x+cheek*.95),' ',n(y+h*1.68),' ',n(x+jaw),' ',n(bottom-10),
 ' Q',n(x),' ',n(bottom+s.chin),' ',n(x-jaw),' ',n(bottom-10),
 ' Q',n(x-cheek*.95),' ',n(y+h*1.68),' ',n(x-cheek*.98),' ',n(y+h*1.26),
 ' C',n(x-cheek),' ',n(sideY),' ',n(x-cheek),' ',n(y+h*.82),' ',n(x-temple),' ',n(y+h*.54),
 ' C',n(x-temple),' ',n(y+h*.20),' ',n(x-crown*.65),' ',n(y-3),' ',n(x),' ',n(y),'Z'
 ].join('');
}
root.SocialEyesHeadShapes=Object.freeze({names:Object.freeze(shapes.map(s=>s.name)),path});
})(typeof window!=="undefined"?window:globalThis);
