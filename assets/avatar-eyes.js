/* Original Social Eyes cel-shaded human eye components.
 * All 10 pairs share the avatar's 300x390 coordinate space.
 * Brows are deliberately excluded: they are a separate customization layer.
 */
(function(root){
"use strict";
const styles=[
 {name:"Classic almond",w:11,h:5.5,tilt:0,iris:3.8,lash:1.6},
 {name:"Wide open",w:11.5,h:8.1,tilt:0,iris:4.4,lash:1.8},
 {name:"Soft round",w:9.2,h:7.4,tilt:0,iris:4.2,lash:1.5},
 {name:"Narrow",w:12,h:3.8,tilt:0.5,iris:3.1,lash:1.7},
 {name:"Upturned",w:11.3,h:5.7,tilt:-2.2,iris:3.7,lash:2},
 {name:"Downturned",w:11.5,h:5.6,tilt:2.1,iris:3.7,lash:1.8},
 {name:"Deep set",w:10.6,h:4.6,tilt:0,iris:3.5,lash:2.5},
 {name:"Large expressive",w:12.2,h:9,tilt:-.3,iris:5.1,lash:2},
 {name:"Hooded",w:12.4,h:4.5,tilt:0,iris:3.5,lash:2.9},
 {name:"Petite",w:8.4,h:4.7,tilt:.3,iris:3.1,lash:1.4}
];
function eye(x,y,style,irisColor,mirror,gender){
 const s=styles[Math.max(0,Math.min(styles.length-1,Math.trunc(style)||0))],w=s.w,h=s.h,side=mirror?-1:1,outer=x+side*w,inner=x-side*w;
 const lift=s.tilt*side,top=y-h,bottom=y+h;
 const lash=gender===1?1.6:gender===2?1.25:1;
 const upper='M'+inner+' '+y+' Q'+x+' '+(top-2)+' '+outer+' '+(y+lift);
 const lower='Q'+x+' '+(bottom+1)+' '+inner+' '+y+'Z';
 const pupil=s.iris*.46;
 return '<g class="avatar-eye" data-eye-style="'+style+'">'+
 '<path d="'+upper+' '+lower+'" fill="#f8f7f3" stroke="#263045" stroke-width="1.5" stroke-linejoin="round"/>'+
 '<circle cx="'+x+'" cy="'+y+'" r="'+s.iris+'" fill="'+irisColor+'" stroke="#293446" stroke-width=".9"/>'+
 '<circle cx="'+x+'" cy="'+y+'" r="'+pupil+'" fill="#172034"/>'+
 '<circle cx="'+(x-s.iris*.27)+'" cy="'+(y-s.iris*.30)+'" r="'+Math.max(.9,s.iris*.24)+'" fill="#fff" opacity=".95"/>'+
 '<path d="'+upper+'" fill="none" stroke="#20263a" stroke-width="'+(s.lash*lash)+'" stroke-linecap="round"/>'+
 (gender===1?'<path d="M'+outer+' '+(y+lift)+' l'+(side*3)+' -3" fill="none" stroke="#20263a" stroke-width="1.5" stroke-linecap="round"/>':'')+
 '</g>';
}
function pair(index,x,y,gap,irisColor,gender){
 return eye(x-gap,y,index,irisColor,false,gender)+eye(x+gap,y,index,irisColor,true,gender);
}
root.SocialEyesEyes=Object.freeze({names:Object.freeze(styles.map(s=>s.name)),pair});
})(typeof window!=="undefined"?window:globalThis);
