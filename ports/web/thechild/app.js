import createRunner from './butterscotch.mjs';
import {prepareDataWin} from './data-loader.js';
const canvas=document.querySelector('#canvas'),touch=document.querySelector('#touch'),stick=document.querySelector('#stick'),knob=document.querySelector('#stickKnob');
let runner,running=false,stickPointer=null;
const held=new Map(),logs=[],audioContexts=new Set(),gameLogs=new Map();
let showGameLogs=false;
function captureGameLog(line){
 if(!line.startsWith('Game: ')||/^Game:\s*(?:error|fatal|exception|warning)\b/i.test(line))return false;
 const key=line.replace(/\s+[-+]?(?:\d+(?:\.\d+)?|\.\d+)$/,'');
 gameLogs.set(key,line);
 if(gameLogs.size>128)gameLogs.delete(gameLogs.keys().next().value);
 if(showGameLogs)console.debug(line);
 return true;
}
function rememberLog(line){logs.push(line);if(logs.length>300)logs.shift()}
const log=(...parts)=>{const line=parts.join(' ');const room=line.match(/Room loaded: (\S+) \(room \d+\)/);if(room&&window.portDiagnostics?.audio){window.portDiagnostics.audio.room=room[1];console.info('The Child: audio em',room[1])}if(captureGameLog(line))return;rememberLog(line);console.log(line)};
const logError=(...parts)=>{const line=parts.join(' ');if(captureGameLog(line))return;rememberLog(line);console.error(line)};
window.portDiagnostics={logs,gameLogs,get showGameLogs(){return showGameLogs},set showGameLogs(value){showGameLogs=Boolean(value)},get running(){return running},get inputKeys(){return [...held.keys()]}};
const NativeAudioContext=window.AudioContext||window.webkitAudioContext;
const audioProbe={room:'desconhecida',history:[],latest:null,intervalMs:1000,_gain:1,_lastWarning:0,get gain(){return this._gain},set gain(value){const n=Number(value);if(Number.isFinite(n)&&n>=0&&n<=1)this._gain=n;else throw new RangeError('gain deve estar entre 0 e 1')},report(seconds=10){return this.history.slice(-Math.max(1,Math.min(120,Number(seconds)||10)))} };
let audioWindow={start:0,sum:0,samples:0,peak:0,above:0,near:0,invalid:0};
function processAudioProbe(event){
 const out=event.outputBuffer;
 if(!out||!out.numberOfChannels)return;
 const gain=audioProbe.gain,now=performance.now(),samples=out.length,channels=out.numberOfChannels;
 if(!audioWindow.start)audioWindow.start=now;
 for(let ch=0;ch<channels;ch++){
  const data=out.getChannelData(ch);
  for(let i=0;i<samples;i++){
   const v=data[i];
   if(!Number.isFinite(v)){
    audioWindow.invalid++;
    if(gain!==1)data[i]=0;
    continue;
   }
   if(gain!==1)data[i]=v*gain;
   if((i&3)!==0)continue;
   const a=Math.abs(v);
   audioWindow.samples++;
   audioWindow.sum+=v*v;
   if(a>audioWindow.peak)audioWindow.peak=a;
   if(a>1)audioWindow.above++;
   if(a>=.98)audioWindow.near++;
  }
 }
 if(now-audioWindow.start>=audioProbe.intervalMs){
  const rms=Math.sqrt(audioWindow.sum/Math.max(1,audioWindow.samples));
  const snapshot={room:audioProbe.room,at:new Date().toLocaleTimeString(),rmsDb:rms>0?Math.round(20*Math.log10(rms)*10)/10:-120,peak:Math.round(audioWindow.peak*1000)/1000,over100pct:audioWindow.above,near100pct:audioWindow.near,sampled:audioWindow.samples,nonFinite:audioWindow.invalid,gain};
  audioProbe.latest=snapshot;
  audioProbe.history.push(snapshot);
  if(audioProbe.history.length>120)audioProbe.history.shift();
  if((snapshot.over100pct||snapshot.nonFinite||snapshot.rmsDb>-3||snapshot.near100pct>audioWindow.samples*.08)&&now-audioProbe._lastWarning>5000){
   console.warn('The Child: possivel saturacao PCM (ANTES de ganho manual)',snapshot);
   audioProbe._lastWarning=now;
  }
  audioWindow={start:now,sum:0,samples:0,peak:0,above:0,near:0,invalid:0};
 }
}
window.portDiagnostics.audio=audioProbe;
const OriginalAudioContext=window.AudioContext||window.webkitAudioContext;
if(OriginalAudioContext){
 window.AudioContext=class extends OriginalAudioContext{
  constructor(...args){super(...args);audioContexts.add(this)}
  createScriptProcessor(...args){
   const node=super.createScriptProcessor(...args);
   queueMicrotask(()=>node.addEventListener('audioprocess',processAudioProbe));
   return node;
  }
 };
}

const resumeAudio=()=>{for(const context of audioContexts)if(context.state==='suspended')context.resume().catch(()=>{})};
window.addEventListener('pointerdown',resumeAudio,{capture:true});window.addEventListener('keydown',resumeAudio,{capture:true});
const openDB=()=>new Promise((resolve,reject)=>{const q=indexedDB.open('thechild-ptbr-saves-v1',1);q.onupgradeneeded=()=>q.result.createObjectStore('files');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
async function readSaves(){const db=await openDB();return await new Promise((resolve,reject)=>{const q=db.transaction('files').objectStore('files').get('snapshot');q.onsuccess=()=>resolve(q.result||{});q.onerror=()=>reject(q.error)})}
async function saveSaves(){if(!running)return;try{const files={};for(const name of runner.FS.readdir('/saves')){if(name==='.'||name==='..')continue;try{files[name]=runner.FS.readFile('/saves/'+name)}catch{}}const db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(files,'snapshot');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}catch(e){console.warn('Saves:',e)}}
function keyDown(key,source){if(!running)return;const set=held.get(key)||new Set();if(!set.size)runner._onKeyDown(key);set.add(source);held.set(key,set)}
function keyUp(key,source){const set=held.get(key);if(!set)return;set.delete(source);if(!set.size){runner?._onKeyUp(key);held.delete(key)}}
function resetStick(){stickPointer=null;knob.style.transform='translate(-50%,-50%)';stick.classList.remove('active');for(const key of [37,38,39,40])keyUp(key,'stick')}
function releaseAll(){for(const key of held.keys())runner?._onKeyUp(key);held.clear();resetStick();document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'))}
function moveStick(e){if(e.pointerId!==stickPointer)return;const r=stick.getBoundingClientRect(),radius=r.width/2;const dx=e.clientX-r.left-radius,dy=e.clientY-r.top-radius,distance=Math.hypot(dx,dy),travel=Math.min(distance,radius*.6),unitX=dx/(distance||1),unitY=dy/(distance||1);knob.style.transform=`translate(calc(-50% + ${unitX*travel}px),calc(-50% + ${unitY*travel}px))`;const live=distance>radius*.23;for(const[key,on]of [[39,live&&unitX>.382683],[37,live&&unitX<-.382683],[38,live&&unitY<-.382683],[40,live&&unitY>.382683]]){if(on)keyDown(key,'stick');else keyUp(key,'stick')}}
stick.addEventListener('pointerdown',e=>{if(stickPointer!==null||!running)return;e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);stick.classList.add('active');moveStick(e)});stick.addEventListener('pointermove',moveStick);
for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,e=>{if(e.pointerId===stickPointer)resetStick()});
for(const button of document.querySelectorAll('[data-key]')){const key=Number(button.dataset.key);button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('pressed');keyDown(key,'pointer:'+e.pointerId)});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>{button.classList.remove('pressed');keyUp(key,'pointer:'+e.pointerId)})}
const gmKey=e=>e.code==='ShiftLeft'?160:e.code==='ShiftRight'?161:e.keyCode;
window.addEventListener('keydown',e=>{if(!running)return;e.preventDefault();if(!e.repeat)keyDown(gmKey(e),'keyboard:'+e.code)});window.addEventListener('keyup',e=>{if(running)e.preventDefault();keyUp(gmKey(e),'keyboard:'+e.code)});
window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();saveSaves()}});
function mousePosition(e){const r=canvas.getBoundingClientRect();runner._onMouseMove((e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height)}
canvas.addEventListener('pointermove',e=>{if(running)mousePosition(e)});canvas.addEventListener('pointerdown',e=>{if(!running)return;canvas.focus();mousePosition(e);runner._onMouseDown(1);canvas.setPointerCapture(e.pointerId)});for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>runner?._onMouseUp(1));
function readIni(name){try{return runner.FS.readFile('/saves/'+name,{encoding:'utf8'})}catch{return ''}}
function syncControls(){if(!running)return;const enabled=!!Number(readIni('ptbr_web.ini').match(/^touch\s*=\s*"?([\d.]+)/m)?.[1]||0);if(touch.hidden===enabled){touch.hidden=!enabled;releaseAll()}const english=/current\s*=\s*"?en\b/.test(readIni('ptbr_language.ini'));for(const button of touch.querySelectorAll('[data-key]'))button.textContent=({'160':english?'RUN':'CORRER','90':english?'POWER':'DOM','32':english?'ACTION':'A\u00c7\u00c3O','9':'MENU'})[button.dataset.key];touch.classList.toggle('dialogue',!!Number(readIni('ptbr_web_ui.ini').match(/^dialogue\s*=\s*"?([\d.]+)/m)?.[1]||0))}
function argv(strings){const encoder=new TextEncoder();const pointers=strings.map(s=>{const bytes=encoder.encode(s+'\0'),ptr=runner._malloc(bytes.length);runner.HEAPU8.set(bytes,ptr);return ptr});const ptr=runner._malloc(pointers.length*4),view=new DataView(runner.HEAPU8.buffer);for(let i=0;i<pointers.length;i++)view.setUint32(ptr+i*4,pointers[i],true);return{ptr,pointers}}
async function start(){
 document.title='Carregando The Child...';
 try{
  runner=await createRunner({canvas,print:log,printErr:logError});window.portDiagnostics.runner=runner;runner.FS.mkdir('/game');runner.FS.mkdir('/saves');
  try{for(const[name,content]of Object.entries(await readSaves()))if(!name.includes('/')&&!name.includes('..'))runner.FS.writeFile('/saves/'+name,content)}catch(e){console.warn(e)}
  if(!readIni('ptbr_web.ini'))runner.FS.writeFile('/saves/ptbr_web.ini',new TextEncoder().encode('[options]\ntouch='+Number(matchMedia('(pointer:coarse)').matches)+'\n'));
  await prepareDataWin(runner);
  const args=['/game/data.win','--save-folder','/saves','--lazy-textures','--lazy-rooms','--lazy-audio','--disable-log-colors'],memory=argv(args);running=true;document.title='The Child';canvas.focus();const saves=setInterval(saveSaves,5000),controls=setInterval(()=>{syncControls()},200);
  await runner.ccall('startRunner','number',['number','number'],[args.length,memory.ptr],{async:true});clearInterval(saves);clearInterval(controls);releaseAll();running=false;
 }catch(e){running=false;log('Falha:',e?.stack||e);document.title='The Child - erro';console.error('Falha ao iniciar The Child:', e)}
}
start();
