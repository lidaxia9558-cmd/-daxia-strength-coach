const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let script=fs.readFileSync(path.join(root,'engine.js'),'utf8');
function ok(c,m){if(!c)throw new Error(m)}
['id="start"','id="hit"','id="miss"','id="skip"','id="finishEarly"','id="elapsedTag"','id="history"','src="./engine.js"'].forEach(x=>ok(html.includes(x),'missing '+x));
ok(script.includes('硬上限30分钟'),'missing 30-min engine guard copy');
console.log('PASS static UI contract');
script=script.replace("syncInputs();render();if(mode==='work'||mode==='rest')resumeIfNeeded();",`globalThis.__v4={getState:()=>st,getPlan:()=>plan,target,prescribed,choosePlan,buildPlan,applyProgress,finishSession,complete,endRest,reset,setPlan:p=>plan=p,setMode:m=>mode=m,setPos:p=>pos=p,setSessionMs:v=>sessionMs=v};syncInputs();render();`);
function el(){return {textContent:'',innerHTML:'',value:'',checked:false,disabled:false,dataset:{},style:{},className:'',children:[],onclick:null,onchange:null,classList:{add(){},remove(){},toggle(){}},appendChild(x){this.children.push(x)},append(...xs){this.children.push(...xs)}}}
const ids=['app','dayType','dateText','progress','plan','eta','coach','phase','name','rightLabel','rightValue','bar','goalMain','cue','setTag','loadTag','elapsedTag','actions','start','reset','setButtons','hit','miss','skip','finishEarly','rest','restNum','nextText','endRest','finishEarlyRest','voice','sq','rdl','rowLoad','carry','history','finish','finishText','finishMeta','nextAdvice'];
const E={};ids.forEach(id=>E[id]=el());const rates=['easy','good','hard'].map(r=>{let x=el();x.dataset.rate=r;return x});const store=new Map();
const context={console,Math,JSON,Date,setInterval,clearInterval,setTimeout,clearTimeout,globalThis:null,localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()},document:{getElementById:id=>E[id]||(E[id]=el()),createElement:()=>el(),querySelectorAll:s=>s==='.rate'?rates:[],addEventListener(){}},window:{addEventListener(){}},speechSynthesis:undefined,SpeechSynthesisUtterance:function(){}};context.globalThis=context;vm.createContext(context);vm.runInContext(script,context,{timeout:5000});const v=context.__v4;
console.log('PASS engine boot with mocked DOM/storage');
let p=v.getPlan();ok(p.type==='正常日 A','first plan should A');ok(p.arr.length===8,'A should have 8 sets');
console.log('PASS initial plan');
let t=v.target('squat');t.reps=8;t.success=0;t.misses=0;p.arr.forEach(x=>{if(x.id==='squat')x.result='skip';else x.result=null});v.applyProgress('hard');ok(t.reps===8&&t.misses===0,'skip must not penalize');
console.log('PASS skip semantics');
p.arr.forEach(x=>{if(x.id==='squat')x.result='hit'});v.applyProgress('good');ok(t.reps===8&&t.success===1,'first good exposure must hold');v.applyProgress('good');ok(t.reps===9&&t.success===0,'second good exposure should progress');
console.log('PASS cautious progression');
t.reps=10;t.misses=0;t.success=0;p.arr.forEach(x=>{if(x.id==='squat')x.result='miss'});v.applyProgress('good');ok(t.reps===10&&t.misses===1,'one miss should hold');v.applyProgress('good');ok(t.reps===9&&t.misses===0,'two misses should reduce once');t.reps=8;t.misses=1;v.applyProgress('good');ok(t.reps===8,'must respect rep floor');
console.log('PASS miss handling');
t=v.target('row');t.reps=12;t.success=0;v.getState().loads.rowLoad=5;p.arr.forEach(x=>{if(x.id==='row')x.result='hit'});v.applyProgress('easy');ok(v.getState().loads.rowLoad===5.5,'row increment must be .5kg');ok(t.reps===8,'rep reset after load progression');
console.log('PASS bounded load progression');
v.setPlan({type:'轻量日',planKey:'LIGHT',light:true,recovery:false,arr:[{id:'squat',set:1,total:1,result:'hit'}]});t=v.target('squat');t.reps=9;t.success=1;v.applyProgress('easy');ok(t.reps===9&&t.success===1,'light day must not progress');
console.log('PASS light-day guard');
v.setPlan({type:'正常日 A',planKey:'A',light:false,recovery:false,arr:[{id:'squat',set:1,total:1,result:null}]});v.setMode('work');v.setSessionMs(30*60*1000);v.finishSession('cap');let h=v.getState().history.at(-1);ok(h.reason==='cap'&&h.partial===true,'cap must save partial session');ok(v.getState().active===null,'finish must clear active');
console.log('PASS 30-minute cap semantics');
console.log('ALL V4 ENGINE TESTS PASSED');
