
/* Self-contained animated preview. For integration, set window.GARUDA_PREVIEW=false
   before this script, then call window.GarudaLoader.setProgress(0..100),
   and window.GarudaLoader.complete() when dashboard is ready. */
(()=>{
const canvas=document.querySelector('#network'),ctx=canvas.getContext('2d',{alpha:true});
const fill=document.querySelector('#fill'),percent=document.querySelector('#percent'),statusText=document.querySelector('#status-text');
let W=0,H=0,dpr=1,nodes=[],edges=[],born=performance.now(),progress=0,manualProgress=null;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const preview=false;
const rng=(()=>{let s=37271;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}})();
function rebuild(){
  dpr=1;W=innerWidth;H=innerHeight;
  canvas.width=Math.max(1,Math.round(W*dpr));canvas.height=Math.max(1,Math.round(H*dpr));canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  nodes=[];edges=[];
  const count=Math.max(30,Math.min(55,Math.round(W*H/26000)));
  for(let i=0;i<count;i++){
    let nx,ny,k=0;
    do {nx=.04+rng()*.92;ny=.065+rng()*.85;k++} while(k<35&&Math.abs(nx-.5)<(W>700?.235:.28)&&Math.abs(ny-.45)<(W>700?.125:.09));
    nodes.push({x:nx*W,y:ny*H,px:nx*W,py:ny*H,dx:(rng()-.5)*15,dy:(rng()-.5)*13,r:1.3+rng()*1.55,phase:rng()*Math.PI*2,tw:.6+rng()*.9});
  }
  const distance=(i,j)=>Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
  const maxEdge=Math.max(120,Math.min(240,W*.155));
  const seen=new Set();
  nodes.forEach((p,i)=>{
    const nearest=nodes.map((q,j)=>({j,d:distance(i,j)})).filter(x=>x.j!==i&&x.d<maxEdge).sort((a,b)=>a.d-b.d).slice(0,3);
    nearest.forEach(({j,d})=>{const a=Math.min(i,j),b=Math.max(i,j),key=a+'-'+b;if(!seen.has(key)){seen.add(key);edges.push({a,b,d,phase:rng(),speed:.10+rng()*.13})}});
  });
}
let lastF=0;
function draw(time){
  if(time-lastF<33){if(!reduced&&document.body.contains(canvas))requestAnimationFrame(draw);return}lastF=time;
  ctx.clearRect(0,0,W,H);
  const t=(time-born)/1000, cx=W*.5,cy=H*(W<700?.43:.45);
  let a=progress/100;
  const enter=Math.min(1,Math.max(0,t/1.5));
  nodes.forEach(n=>{n.px=n.x+Math.sin(t*.27+n.phase)*n.dx;n.py=n.y+Math.cos(t*.3+n.phase)*n.dy});
  edges.forEach(e=>{
    const p=nodes[e.a],q=nodes[e.b],fade=Math.max(.06,1-e.d/(Math.max(180,W*.26)));
    const midx=(p.px+q.px)/2, midy=(p.py+q.py)/2;
    const centerFade=(Math.abs(midx-cx)<W*.22&&Math.abs(midy-cy)<H*.105)?0.14:1;
    ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(q.px,q.py);ctx.strokeStyle=`rgba(56,159,221,${(.07+fade*.18)*centerFade*enter})`;ctx.lineWidth=.8;ctx.stroke();
    const k=((t*e.speed+e.phase)%1);const s=Math.sin(Math.PI*k);
    if(s>.06){const x=p.px+(q.px-p.px)*k,y=p.py+(q.py-p.py)*k;
      ctx.beginPath();ctx.arc(x,y,1.1+s*.85,0,Math.PI*2);ctx.fillStyle=`rgba(94,208,255,${s*.73*enter*centerFade})`;ctx.fill();}
  });
  nodes.forEach(n=>{
    const bright=(.5+.5*Math.sin(t*n.tw+n.phase));const cxGap=Math.abs(n.px-cx)<W*.215&&Math.abs(n.py-cy)<H*.097;
    ctx.beginPath();ctx.arc(n.px,n.py,n.r+(bright*.8),0,Math.PI*2);
    ctx.fillStyle=`rgba(91,201,246,${(.31+bright*.63)*(cxGap?.17:1)*enter})`;
    ctx.fill();
  });
  // Neural signals converge just outside the actual logo; nothing obscures its lettering.
  const orbitN=12, rx=Math.min(W*.352,475),ry=Math.min(H*.22,178);
  for(let i=0;i<orbitN;i++){
    let theta=i/ orbitN*Math.PI*2+.12;
    const x=cx+Math.cos(theta)*rx,y=cy+Math.sin(theta)*ry;
    const x2=cx+Math.cos(theta)*rx*.8,y2=cy+Math.sin(theta)*ry*.83;
    const tr=(t*.21+i/orbitN)%1, v=1-tr;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);
    ctx.strokeStyle=`rgba(40,135,206,${(0.06+.10*a)*enter})`;ctx.lineWidth=.65;ctx.stroke();
    const px=x+(x2-x)*tr,py=y+(y2-y)*tr;
    ctx.beginPath();ctx.arc(px,py,1.5,0,Math.PI*2);ctx.fillStyle=`rgba(94,213,255,${v*.40*enter})`;ctx.fill();
  }
  if(!reduced&&document.body.contains(canvas))requestAnimationFrame(draw);
}
function refreshProgress(now){
 const sec=(now-born)/1000;
 let p;
 if(preview){
   const span=6.4,u=sec%span;
   p=u<5.2?Math.round(5+95*(1-Math.pow(1-u/5.2,2.45))):100;
   if(sec>span&&sec%span<.08)born=now;
 }else p=manualProgress===null?Math.min(90,5+85*(1-Math.exp(-sec/2.2))):Math.max(manualProgress,Math.min(90,5+85*(1-Math.exp(-sec/2.2))));
 p=Math.min(100,Math.max(0,p));progress=p;fill.style.width=p+'%';percent.textContent=String(Math.round(p)).padStart(2,'0')+'%';
 statusText.textContent=p<26?'CONNECTING NODES':p<54?'SYNCHRONIZING SIGNALS':p<84?'PROCESSING INTELLIGENCE':p<100?'PREPARING WORKSPACE':'SYSTEM READY';
 if(!reduced&&document.body.contains(canvas))requestAnimationFrame(refreshProgress);
}
function restart(){born=performance.now();manualProgress=null;const b=document.querySelector('.brand');b.style.animation='none';void b.offsetWidth;b.style.animation='';}
window.GarudaLoader={setProgress(v){manualProgress=Number(v)||0},complete(){manualProgress=100;const loader=document.querySelector('#loader');setTimeout(()=>{loader.classList.add('done');setTimeout(()=>{loader.remove();},700);},400);},restart};
window.addEventListener('resize',rebuild,{passive:true});rebuild();requestAnimationFrame(draw);requestAnimationFrame(refreshProgress);
})();
