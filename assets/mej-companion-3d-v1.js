/* Native WebGL Omani 3D companion. No external libraries; works offline. */
(function(){
"use strict";
if(window.MEJCompanion3D)return;
const find=id=>document.getElementById(id);
const learner=()=>{try{return typeof active==="function"?active():null}catch(e){return null}};
const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
let root,host,canvas,gl,program,buffer,indexBuffer,n=0,U={},ready=false,raf=0,clock=0,last=0,action="idle",until=0,identity="";
const style=document.createElement("style");
style.textContent="#mej-study-companion.mej-webgl{width:84px;bottom:max(65px,env(safe-area-inset-bottom) + 54px);right:3px;z-index:1290}#mej-study-companion.mej-webgl .mej-mascot{width:84px;height:117px;animation:none!important;transform:none!important}#mej-study-companion.mej-webgl .mej-mascot-stage{height:121px}#mej-study-companion.mej-webgl canvas{width:100%;height:100%;display:block}#mej-study-companion.mej-webgl .mej-companion-bubble{bottom:124px;font-size:12px}#mej-study-companion.mej-webgl .mej-mascot-tools{top:-8px}@media(max-width:650px){#mej-study-companion.mej-webgl{width:67px}#mej-study-companion.mej-webgl .mej-mascot{width:67px;height:94px}#mej-study-companion.mej-webgl .mej-mascot-stage{height:98px}#mej-study-companion.mej-webgl .mej-companion-bubble{bottom:103px}}";
document.head.append(style);
const vertex="attribute vec3 xyz;attribute vec3 norm;uniform vec3 pos,scale,angle;varying float lit;void main(){vec3 p=xyz*scale;float c=cos(angle.z),s=sin(angle.z);p=vec3(p.x*c-p.y*s,p.x*s+p.y*c,p.z);c=cos(angle.y);s=sin(angle.y);p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);vec3 q=p+pos;gl_Position=vec4(q.x*.72,q.y*.67,q.z*.15,1.0-q.z*.09);lit=.48+.52*max(0.0,dot(normalize(norm),normalize(vec3(-.3,.7,1.0))));}";
const fragment="precision mediump float;uniform vec4 tint;varying float lit;void main(){gl_FragColor=vec4(tint.rgb*lit,tint.a);}";
function sh(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function init(){
 root=find("mej-study-companion");host=root?.querySelector(".mej-mascot");
 if(!host)return false;
 if(ready&&canvas?.isConnected)return true;
 canvas=document.createElement("canvas");canvas.width=168;canvas.height=244;
 gl=canvas.getContext("webgl",{alpha:true,depth:true,antialias:true,powerPreference:"low-power"});
 if(!gl)return false;
 try{
  program=gl.createProgram();gl.attachShader(program,sh(gl.VERTEX_SHADER,vertex));gl.attachShader(program,sh(gl.FRAGMENT_SHADER,fragment));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error("WebGL program");
  gl.useProgram(program);for(const k of ["pos","scale","angle","tint"])U[k]=gl.getUniformLocation(program,k);
  const vertices=[],indices=[],rings=12,segments=20;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
   const a=j*Math.PI/rings,b=i*2*Math.PI/segments;
   vertices.push(Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b));
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
   const x=j*(segments+1)+i;indices.push(x,x+segments+1,x+1,x+1,x+segments+1,x+segments+2);
  }
  n=indices.length;
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const stride=12,xyz=gl.getAttribLocation(program,"xyz"),norm=gl.getAttribLocation(program,"norm");
  gl.enableVertexAttribArray(xyz);gl.vertexAttribPointer(xyz,3,gl.FLOAT,false,stride,0);
  gl.enableVertexAttribArray(norm);gl.vertexAttribPointer(norm,3,gl.FLOAT,false,stride,0);
  indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  gl.viewport(0,0,canvas.width,canvas.height);
  canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();ready=false;stop();root.classList.remove("mej-webgl")});
  canvas.addEventListener("webglcontextrestored",()=>{ready=false;init();refresh()});
  host.replaceChildren(canvas);root.classList.add("mej-webgl");ready=true;return true;
 }catch(e){console.warn("3D companion fallback:",e);root.classList.remove("mej-webgl");return false}
}
function ellipsoid(x,y,z,a,b,c,color,rot=0,yaw=0){
 gl.uniform3f(U.pos,x,y,z);gl.uniform3f(U.scale,a,b,c);gl.uniform3f(U.angle,0,yaw,rot);gl.uniform4fv(U.tint,color);
 gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_SHORT,0);
}
const white=[.96,.96,1,1],skin=[.97,.73,.53,1],hijab=[.50,.22,.48,1],purple=[.68,.37,.62,1],dark=[.17,.15,.20,1],eye=[1,1,1,1],gold=[1,.78,.20,1],shoe=[.30,.22,.22,1],pink=[.9,.43,.45,1];
function draw(now){
 raf=0;
 const user=learner();if(!ready||!user?.companion?.kind||document.hidden||root?.hidden)return;
 const motion=!(reduced()||root.classList.contains("mej-no-motion"));
 if(now>until)action="idle";
 clock+=Math.min(.05,(now-last||33)/1000);last=now;
 const t=clock,pace=action==="run"?17:action==="walk"?9:2;
 const wave=motion?Math.sin(t*pace):0;
 const hop=motion?(["jump","celebrate"].includes(action)?Math.abs(Math.sin(t*9))*.30:action==="run"?Math.abs(wave)*.09:Math.sin(t*2)*.012):0;
 const girl=user.companion.kind==="girl",dress=girl?hijab:white;
 const lead=action==="run"?.10:0;
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 // Depth-tested 3D primitives, lit by a directional light.
 const y=hop-.10;
 const nod=action==="nod"&&motion?Math.sin(t*10)*.035:0;
 ellipsoid(-.26,y+.05,-.34,.26,.37,.20,[.48,.29,.17,1]);
 ellipsoid(-.19+wave*.10,y-.76,.05,.15,.35,.16,dress,wave*.10);
 ellipsoid(.19-wave*.10,y-.76,.05,.15,.35,.16,dress,-wave*.10);
 ellipsoid(-.20+wave*.11,y-1.02,.17,.22,.12,.26,shoe);
 ellipsoid(.20-wave*.11,y-1.02,.17,.22,.12,.26,shoe);
 ellipsoid(0,y-.08,.03,.47,.57,.34,dress,lead);
 ellipsoid(0,y-.28,.32,.37,.028,.045,girl?gold:[.68,.82,.95,1]);
 const happy=["jump","celebrate","clap"].includes(action);
 const raise=happy?.32:action==="wave"?.30:action==="point"?.16:0;
 ellipsoid(-.52,y+.14,.09,.19,.42,.20,dress,happy?-.6:wave*.08);
 ellipsoid(.52,y+.14,.09,.19,.42,.20,dress,happy?.6:action==="point"?.32:wave*.08);
 ellipsoid(-.59,y-.16+(happy?.30:0),.20,.15,.15,.14,skin);
 ellipsoid(.59,y-.16+raise,.20,.15,.15,.14,skin);
 if(girl){
  ellipsoid(0,y+.87,-.08,.52,.56,.42,purple);
  ellipsoid(-.39,y+.70,.03,.18,.47,.26,purple);
  ellipsoid(.39,y+.70,.03,.18,.47,.26,purple);
  ellipsoid(0,y+.90+nod,.24,.36,.41,.29,skin);
  ellipsoid(0,y+1.23,.18,.41,.13,.32,white);
 }else{
  ellipsoid(0,y+.89+nod,.01,.45,.47,.39,skin);
  ellipsoid(0,y+1.28,.00,.48,.17,.42,white);
  ellipsoid(0,y+1.34,.35,.40,.035,.09,purple);
  for(let i=-2;i<=2;i++)ellipsoid(i*.15,y+1.36,.39,.035,.028,.026,gold);
 }
 const z=girl?.53:.39;
 for(const x of [-.16,.16]){
  ellipsoid(x,y+.94+nod,z,.098,.12,.055,eye);
  ellipsoid(x+.013,y+.94+nod,z+.048,.054,.075,.022,dark);
  ellipsoid(x+.026,y+.966+nod,z+.065,.016,.017,.010,eye);
  ellipsoid(x,y+1.10+nod,z,.12,.03,.03,dark,x<0?.08:-.08);
  ellipsoid(x*1.48,y+.75,z-.036,.09,.05,.028,pink);
 }
 ellipsoid(0,y+.77+nod,z+.065,.065,.051,.049,skin);
 ellipsoid(0,y+.65+nod,z+.005,.19,.058,.043,[.60,.24,.25,1]);
 ellipsoid(0,y+.682+nod,z+.044,.14,.020,.025,eye);
 ellipsoid(.19,y+.07,.37,.10,.10,.05,gold);
 ellipsoid(.19,y+.07,.414,.035,.065,.025,[.13,.43,.66,1],.35);
 if(!find("feedback")?.closest("#app")&&motion){root.style.transform="translateX("+Math.round(Math.sin(t*.65)*23)+"px)"}else root.style.transform="";
 raf=requestAnimationFrame(draw);
}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
function start(){if(raf||!ready||document.hidden||root?.hidden)return;last=0;raf=requestAnimationFrame(draw)}
function play(which,ms=1600){action=which;until=performance.now()+ms;if(ready){root.hidden=false;start()}}
function refresh(){
 const user=learner(),c=user?.companion,app=find("app");
 root=find("mej-study-companion");
 if(!user?.id||!c?.kind||!c?.name){if(root)root.hidden=true;stop();return}
 const onQuiz=!!find("feedback")?.closest("#app"),onLearner=!!app?.querySelector(".journey-dashboard,.levels,.skill-center,.quiz,.learning-page");
 if(!onLearner){if(root)root.hidden=true;stop();return}
 if(!init())return;
 const currentPage=onQuiz?"quiz":app.querySelector(".levels")?"levels":app.querySelector(".skill-center")?"skills":app.querySelector(".journey-dashboard")?"journey":"other";
 const key=user.id+":"+c.kind;
 if(identity!==key){identity=key;action="wave";until=performance.now()+1500;clock=0}
 if(previousPage!==currentPage){previousPage=currentPage;if(currentPage!=="quiz"){action="walk";until=performance.now()+1800}else{action="run";until=performance.now()+900}}
 root.setAttribute("aria-label","رفيق رحلتي: "+c.name);
 const saying=!!root.querySelector(".mej-companion-bubble.mej-show");
 root.hidden=onQuiz&&!saying;
 if(root.hidden)stop();else start();
}
function wrap(){
 const old=window.MEJCompanion;
 if(!old||old.__webglHook||typeof old.react!=="function")return;
 const orig=old.react;
 old.react=function(success,preview){
  const val=orig.apply(this,arguments);
  play(success?"celebrate":"nod",2700);
  return val;
 };
 old.__webglHook=true;
}
function boot(){
 wrap();const app=find("app");
 if(app)new MutationObserver(()=>{wrap();refresh()}).observe(app,{childList:true,subtree:false});
 window.addEventListener("mej-companion-change",()=>{identity="";refresh();play("wave",1800)});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else refresh()});
 refresh();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.MEJCompanion3D={play,refresh,actions:["idle","walk","run","jump","wave","clap","point","celebrate","nod"]};
})();