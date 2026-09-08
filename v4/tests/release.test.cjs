const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let engine=fs.readFileSync(path.join(root,'engine.js'),'utf8');
const coach=fs.readFileSync(path.join(root,'coach-layer.js'),'utf8');
function ok(c,m){if(!c)throw new Error(m)}

// Production-smoke contract
ok(html.includes('src="./coach-layer.js"'),'coach layer missing');
ok(html.includes('src="./engine.js"'),'engine missing');
ok(html.indexOf('src="./coach-layer.js"')<html.indexOf('src="./engine.js"'),'coach layer must load before engine');
ok(engine.includes("LEGACY='daxiaCoachOnlineV1'"),'legacy migration key missing');
ok(engine.includes('MAX_MS=30*60*1000'),'30-minute hard cap missing');
ok(engine.includes("document.addEventListener('visibilitychange'"),'background/resume listener missing');
ok(engine.includes("mode='warm-paused'"),'long-background warm pause missing');
ok(engine.includes('BG_PAUSE_MS=90*1000'),'background guard missing');
ok(coach.includes("VOICE_KEY='daxiaCoachV4Voice2'"),'voice prefs key missing');
ok(coach.includes("value=\"brief\""),'brief voice mode missing');
ok(coach.includes("id=\"replayCue\""),'replay control missing');
ok(coach.includes("if(toggle&&!toggle.checked)return"),'voice master toggle guard missing');
console.log('PASS release static contract');

// Export engine internals for regression testing.
const hook="syncInputs();render();if(st.profile.calibrated&&(mode==='work'||mode==='rest'))resumeIfNeeded();";
ok(engine.includes(hook),'engine boot hook changed');
engine=engine.replace(hook,`globalThis.__release={getState:()=>st,getRuntime:()=>({mode,pos,sessionMs,plan}),setMode:m=>mode=m,setPos:p=>pos=p,setPlan:p=>plan=p,setSessionMs:v=>sessionMs=v,persist,finishSession,saveCalibration,recalibrate};syncInputs();render();`);

function el(){return {textContent:'',innerHTML:'',value:'',checked:false,disabled:false,dataset:{},style:{},className:'',children:[],onclick:null,onchange:null,classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(x){this.children.push(x)},append(...xs){this.children.push(...xs)},setAttribute(){},addEventListener(){},insertAdjacentElement(){}}}
const ids=['app','dayType','calibration','saveCalibration','calSquat','calPush','calPull','calRow','todayCard','settingsCard','dateText','progress','plan','eta','coach','phase','name','rightLabel','rightValue','bar','goalMain','cue','setTag','loadTag','variantTag','elapsedTag','actions','start','reset','setButtons','hit','miss','skip','finishEarly','rest','restNum','nextText','endRest','finishEarlyRest','voice','sq','rdl','rowLoad','carry','variantSummary','recalibrate','history','finish','finishText','finishMeta','nextAdvice'];
function boot(store){
 const E={};ids.forEach(id=>E[id]=el());
 E.calSquat.value='bodyweight';E.calPush.value='inclineHigh';E.calPull.value='band';E.calRow.value='dumbbell';
 const rates=['easy','good','hard'].map(r=>{let x=el();x.dataset.rate=r;return x});
 const listeners={};
 const context={console,Math,JSON,Date,setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout,globalThis:null,
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()},
  document:{hidden:false,getElementById:id=>E[id]||(E[id]=el()),createElement:()=>el(),querySelectorAll:s=>s==='.rate'?rates:[],addEventListener:(n,f)=>listeners[n]=f},
  window:{addEventListener:(n,f)=>listeners['window:'+n]=f},speechSynthesis:undefined,SpeechSynthesisUtterance:function(){}};
 context.globalThis=context;vm.createContext(context);vm.runInContext(engine,context,{timeout:5000});
 return {v:context.__release,E,listeners,context};
}

// V3 -> V4 migration regression.
const store=new Map();
store.set('daxiaCoachOnlineV1',JSON.stringify({loads:{sq:7.5,rdl:12,row:6,carry:8},sessions:[{date:'2026-09-01',rating:'good'}]}));
let b=boot(store),st=b.v.getState();
ok(st.loads.sq===7.5&&st.loads.rdl===12&&st.loads.rowLoad===6&&st.loads.carry===8,'V3 loads did not migrate');
ok(st.history.some(x=>x.date==='2026-09-01'&&x.source==='v3'),'V3 session history did not migrate');
ok(st.profile.calibrated===false,'migration must still require one-time calibration');
console.log('PASS V3 -> V4 data migration');

// Calibration reset / re-calibration regression.
b.E.calSquat.value='bodyweight';b.E.calPush.value='inclineHigh';b.E.calPull.value='band';b.E.calRow.value='dumbbell';
b.v.saveCalibration();
ok(b.v.getState().profile.calibrated===true,'calibration save failed');
b.v.setMode('ready');b.v.recalibrate();
ok(b.v.getState().profile.calibrated===false,'re-calibration reset failed');
console.log('PASS calibration reset / re-calibration');

// Refresh persistence regression.
b.v.getState().profile.calibrated=true;
const p={type:'正常日 A',planKey:'A',light:false,recovery:false,arr:[{id:'squat',set:1,total:1,result:null}]};
b.v.setPlan(p);b.v.setMode('work');b.v.setPos(0);b.v.setSessionMs(345000);b.v.persist();
ok(JSON.parse(store.get('daxiaCoachV4')).active.mode==='work','active session not persisted');
const b2=boot(store),rt=b2.v.getRuntime();
ok(rt.mode==='work'&&rt.pos===0&&rt.sessionMs===345000,'refresh did not restore active workout');
console.log('PASS refresh / resume persistence');

// 30-minute boundary regression.
b2.v.setPlan({type:'正常日 A',planKey:'A',light:false,recovery:false,arr:[{id:'squat',set:1,total:1,result:null}]});
b2.v.setMode('work');b2.v.setSessionMs(30*60*1000);b2.v.finishSession('cap');
const h=b2.v.getState().history.at(-1);
ok(h.reason==='cap'&&h.partial===true,'30-minute boundary must save partial workout');
ok(b2.v.getState().active===null,'cap finish must clear active workout');
console.log('PASS 30-minute boundary');

// Background/resume implementation contract (runtime listener is registered).
ok(typeof b2.listeners.visibilitychange==='function','visibilitychange listener not registered');
console.log('PASS background / resume listener registration');

// Voice behavior contract.
ok(coach.includes("prefs.style==='brief'"),'brief voice path missing');
ok(coach.includes("document.getElementById('voiceTest').onclick"),'voice test/replay path missing');
ok(coach.includes("replay.onclick"),'exercise replay path missing');
console.log('PASS voice toggle / concise / replay contract');

console.log('ALL V4 RELEASE REGRESSION TESTS PASSED');
