/* Social Eyes original facial feature geometry: ten independent styles per layer.
 * SVG fragments only; positions use the same 300x390 portrait coordinates.
 * Human-only, no markings, no external artwork or network requests.
 */
(function(root){
"use strict";
const brows=[
 ["Natural",0,0,2.7],["Straight",-1,0,3],["Soft arch",-3,-4,2.8],
 ["High arch",-5,-6,3],["Full",0,-2,4.5],["Fine",-2,-2,1.6],
 ["Angled",-3,3,3.7],["Rounded",-2,-5,3.1],["Low set",3,-1,3.7],
 ["Bold arch",-4,-5,5]
];
const noses=[
 ["Soft button",3,7,2],["Short",2,5,1.6],["Broad",7,8,2.4],
 ["Long",3,14,2],["Upturned",4,6,2],["Straight",3,11,1.6],
 ["Rounded",5,9,2.5],["Defined",3,13,2.5],["Wide bridge",6,8,2.7],
 ["Aquiline",4,12,2.3]
];
const mouths=[
 ["Soft smile",0,3,2.2],["Bright smile",4,5,2.4],["Full lips",0,6,3],
 ["Neutral",0,0,1.8],["Subtle grin",2,3,2],["Wide smile",4,4,2.5],
 ["Open smile",6,6,2.5],["Pout",-1,5,3],["Fine lips",0,1,1.5],
 ["Curved smile",3,5,3]
];
const validIndex=(v,len)=>Number.isFinite(v)?Math.max(0,Math.min(len-1,Math.trunc(v))):0;
const n=x=>Number(x.toFixed(2));
function eyebrow(index,x,y,color){
 const [name,lift,curve,weight]=brows[validIndex(index,brows.length)];
 return '<path data-brow="'+name+'" d="M'+n(x-12)+' '+n(y+3)+' Q'+n(x)+' '+n(y+lift+curve)+' '+n(x+12)+' '+n(y+lift)+'" fill="none" stroke="'+color+'" stroke-width="'+weight+'" stroke-linecap="round"/>';
}
function nose(index,x,y){
 const [name,w,h,weight]=noses[validIndex(index,noses.length)];
 return '<g data-nose="'+name+'"><path d="M'+n(x)+' '+n(y)+' Q'+n(x-w)+' '+n(y+h*.55)+' '+n(x)+' '+n(y+h)+' Q'+n(x+w)+' '+n(y+h+2)+' '+n(x+w+2)+' '+n(y+h-1)+'" fill="none" stroke="#70483d" stroke-opacity=".76" stroke-width="'+weight+'" stroke-linecap="round"/><path d="M'+n(x-3)+' '+n(y+h+1)+' Q'+n(x)+' '+n(y+h+3)+' '+n(x+3)+' '+n(y+h+1)+'" fill="none" stroke="#b97867" stroke-opacity=".35" stroke-width="1.2"/></g>';
}
function mouth(index,x,y,width){
 const [name,smile,lips,weight]=mouths[validIndex(index,mouths.length)];
 const left=n(x-width/2),right=n(x+width/2);
 return '<g data-mouth="'+name+'"><path d="M'+left+' '+n(y-smile/2)+' Q'+n(x)+' '+n(y+lips+smile)+' '+right+' '+n(y-smile/2)+'" fill="none" stroke="#813e4a" stroke-width="'+weight+'" stroke-linecap="round"/>'+
 (lips>=4?'<path d="M'+n(left+3)+' '+n(y+4)+' Q'+n(x)+' '+n(y+8+lips)+' '+n(right-3)+' '+n(y+4)+'" fill="none" stroke="#c27a83" stroke-width="1.5"/>':'')+'</g>';
}
root.SocialEyesFaceParts=Object.freeze({
 browNames:Object.freeze(brows.map(x=>x[0])),
 noseNames:Object.freeze(noses.map(x=>x[0])),
 mouthNames:Object.freeze(mouths.map(x=>x[0])),
 eyebrow,nose,mouth
});
})(typeof window!=="undefined"?window:globalThis);
