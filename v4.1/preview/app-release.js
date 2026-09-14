(()=>{
'use strict';
const P=window.DaxiaCombinedPlanner;
const $=id=>document.getElementById(id);
const KEY='daxiaCoachV41',V4KEY='daxiaCoachV4';
const parse=(x,d={})=>{try{return JSON.parse(x)||d}catch(e){return d}};
const todayKey=()=>P.dateKey(new Date());

let st=Object.assign({profile:{cardioPreference:'mixed',jumpRope:true,voice:true},history:[],active:null},parse(localStorage.getItem(KEY)));
st.profile=Object.assign({cardioPreference:'mixed',jumpRope:true,voice:true},st.profile||{});
st.history=Array.isArray(st.history)?st.history:[];

const v4=parse(localStorage.getItem(V4KEY));
v4.profile=Object.assign({calibrated:false,squat:'bodyweight',push:'inclineHigh',pull:'rowSub',row:'dumbbell'},v4.profile||{});
v4.loads=Object.assign({sq:0,rdl:0,rowLoad:0,carry:0},v4.loads||{});
v4.targets=v4.targets||{};
v4.history=Array.isArray(v4.history)?v4.history:[];
const vp=v4.profile,loads=v4.loads,targets=v4.targets;

let plan,steps=[],i=0,left=0,running=false,timer=null,last=0,elapsed=0,wakeLock=null,lastPersist=0;
const fmt=s=>{s=Math.max(0,Math.round(s));const m=Math.floor(s/60),r=s%60;return m?`${m}:${String(r).padStart(2,'0')}`:`${r}秒`};
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const saveV4=()=>localStorage.setItem(V4KEY,JSON.stringify(v4));
const say=t=>{if(!st.profile.voice||typeof speechSynthesis==='undefined')return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';u.rate=1.02;speechSynthesis.speak(u)}catch(e){}};
async function keepAwake(){try{if('wakeLock'in navigator&&!wakeLock)wakeLock=await navigator.wakeLock.request('screen')}catch(e){wakeLock=null}}
function releaseWake(){try{if(wakeLock)wakeLock.release()}catch(e){}wakeLock=null}

function history(){const m=new Map();v4.history.forEach(x=>x&&x.date&&m.set(x.date,x));st.history.forEach(x=>x&&x.date&&m.set(x.date,x));return[...m.values()].sort((a,b)=>a.date.localeCompare(b.date))}
function reason(){if(plan.dayType===P.DAY_TYPES.RECOVERY)return'近期负担偏高，今天主动降强度，让恢复成为训练的一部分。';if(plan.dayType===P.DAY_TYPES.LIGHT_COMBINED)return'你已经连续训练了几天，今天保留运动习惯，但减少力量负担。';if(plan.dayType===P.DAY_TYPES.CARDIO_BASE)return'上一轮力量刺激后，今天把重点交给心肺，同时让主要肌群恢复。';return'今天是主要力量日，同时配一段不过量的有氧；力量与心肺都推进，但不追求练狠。'}

const variants={
  squat:{chair:['椅子坐站',8,12,'缓慢坐向椅面，轻触后站起。膝盖跟随脚尖。'],bodyweight:['徒手深蹲',10,15,'臀部向后下坐，膝盖跟随脚尖，脚掌保持稳定。']},
  push:{wall:['墙面俯卧撑',12,20,'身体保持一条直线，胸口靠近墙面再推回。'],inclineHigh:['高台俯卧撑',8,15,'双手撑稳高台，头背臀保持一条直线。'],inclineLow:['低台俯卧撑',6,12,'支撑面必须稳固，肘部约45°，不要塌腰。'],standard:['标准俯卧撑',5,12,'头背臀保持一条直线，动作变形前停止。']},
  row:{dumbbell:['单臂背包 / 哑铃划船',8,12,'一手扶稳，背部平直，把肘部向后向腰拉；不要扭腰。'],band:['弹力带划船',8,15,'固定点必须可靠，先稳定肩胛，再把手拉向身体。']},
  pull:{band:['弹力带下拉',8,12,'固定点必须可靠，把肘部向身体两侧下拉。'],assisted:['辅助引体',5,10,'先稳定肩胛，再把肘部向下拉。'],pullup:['引体向上',3,8,'从稳定悬垂开始，不要摆腿借力。'],rowSub:['停顿版单臂划船',8,12,'作为垂直拉替代：顶端停2秒，慢慢放下，不要甩动。']}
};
const ladders={squat:['chair','bodyweight'],push:['wall','inclineHigh','inclineLow','standard']};

function ex(id){
  if(variants[id]){
    const a=variants[id][vp[id]]||Object.values(variants[id])[0];
    const n=Number(targets[id]&&targets[id].reps)||a[1];
    let load='自重';
    if(id==='squat'&&loads.sq)load=`${loads.sq} kg 总负重`;
    if((id==='row'||(id==='pull'&&vp.pull==='rowSub'))&&loads.rowLoad)load=`${loads.rowLoad} kg / 手`;
    return{id,name:a[0],min:a[1],max:a[2],reps:n,cue:a[3],load,rest:id==='squat'||id==='pull'?70:60};
  }
  if(id==='rdl')return{id,name:'罗马尼亚硬拉 RDL',min:8,max:12,reps:Number(targets.rdl&&targets.rdl.reps)||8,cue:'膝微屈，臀部向后推，背部保持中立。',load:loads.rdl?`${loads.rdl} kg 总负重`:'背包 / 暂不负重',rest:80};
  return{id,name:'农夫行走',seconds:Number(targets.carry&&targets.carry.seconds)||35,maxSeconds:45,cue:'双手各拿重量接近的物品，站直收紧核心，稳定行走。',load:loads.carry?`${loads.carry} kg / 手`:'两侧重量接近即可',rest:55};
}
function strengthIds(){if(!plan.strength)return[];return plan.strength.planKey==='A'?['squat','push','row','carry']:plan.strength.planKey==='B'?['rdl','pull','push','carry']:['squat','rdl','row','pull']}
function names(){return strengthIds().map(x=>ex(x).name)}
function item(icon,title,sub,goal){const d=document.createElement('div');d.className='planItem';d.innerHTML=`<div class="ico">${icon}</div><div><b>${title}</b><div class="mini">${sub}</div></div><div class="goal">${goal}</div>`;$('planList').appendChild(d)}

function renderSummary(){
  plan=P.buildTodayPlan({history:history(),profile:{cardioPreference:st.profile.cardioPreference,jumpRope:st.profile.jumpRope}});
  $('dayPill').textContent=$('dayLabel').textContent=plan.dayLabel;
  const d=new Date();$('dateText').textContent=`${d.getMonth()+1}月${d.getDate()}日 · 星期${'日一二三四五六'[d.getDay()]}`;
  $('totalMinutes').textContent=plan.totalMinutes;$('strengthMinutes').textContent=`${plan.strengthMinutes} 分钟`;$('cardioMinutes').textContent=`${plan.cardioMinutes} 分钟`;$('mobilityMinutes').textContent=`${plan.mobilityMinutes} 分钟`;
  $('strengthSummary').textContent=plan.strength?`${plan.strength.label} · 继承V4动作设置`:'今天不安排主要力量';$('cardioSummary').textContent=plan.cardio.name;$('whyText').textContent=reason();$('planMeta').textContent=`约 ${plan.totalMinutes} 分钟`;
  $('planList').innerHTML='';item('1','热身 / 活动','原地走、肩绕环、髋膝活动',`${plan.mobilityMinutes}分钟`);if(plan.strength)item('2',plan.strength.label,names().join(' · '),`约${plan.strengthMinutes}分钟`);item(plan.strength?'3':'2',plan.cardio.name,plan.cardio.talkTest,`${plan.cardioMinutes}分钟`);
}

const timed=(group,name,seconds,goal,cue,load,intensity,talk='',id=null)=>({kind:'timed',group,name,seconds,goal,cue,load,intensity,talk,id,result:null});
function build(){
  const a=[timed('warmup','热身 / 活动',plan.mobilityMinutes*60,'轻松活动身体','原地走动，配合肩绕环、徒手深蹲和髋铰链。身体热起来即可。','无需负重','轻松')];
  if(plan.strength){
    const ids=strengthIds(),sets=plan.strength.planKey==='LIGHT'?1:2;
    ids.forEach((id,k)=>{for(let s=1;s<=sets;s++){
      const m=ex(id);
      a.push(m.seconds?timed('strength',m.name,m.seconds,`第${s}/${sets}组 · ${m.seconds}秒`,m.cue,m.load,'保留余力','',id):{kind:'reps',group:'strength',id,name:m.name,goal:`第${s}/${sets}组 · ${m.reps}次`,cue:m.cue,load:m.load,intensity:'保留2–3次余力',result:null});
      if(!(k===ids.length-1&&s===sets))a.push(timed('rest','组间休息',plan.strength.planKey==='LIGHT'?45:m.rest,'呼吸恢复，准备下一组','放松肩膀，正常呼吸，不必刻意缩短休息。','休息','恢复'));
    }});
  }
  if(plan.cardio.mode==='jumpRopeIntervals'){
    a.push(timed('cardio','低冲击准备',180,'3分钟','原地快走和轻抬膝，让小腿脚踝进入状态。','跳绳先放在旁边','轻松','能轻松说话。'));
    for(let r=1;r<=8;r++){
      a.push(timed('cardio','跳绳',60,`第${r}/8轮 · 60秒`,'轻盈落地，手腕带绳，不追求速度；任何小腿、跟腱、膝踝不适立即停止。','跳绳','较高强度','只能说几个词即可，但不要做到力竭。'));
      a.push(timed('cardio','原地走恢复',30,'30秒恢复','继续走动，让呼吸逐渐回来。','无需器械','恢复','逐渐恢复到能说完整短句。'));
    }
    a.push(timed('cardio','轻松恢复走',180,'3分钟','逐渐降低速度，让呼吸平稳。','无需器械','轻松','恢复到可以完整说话。'));
  }else{
    const total=plan.cardioMinutes*60,parts=[['原地快走',.35,'自然摆臂，步频比散步快一些。'],['左右侧步',.25,'左右连续侧步，落地轻。'],['交替抬膝',.25,'左右交替抬膝，保持连续。'],['轻松恢复走',.15,'降低一点速度，让呼吸平稳。']];
    let used=0;parts.forEach((p,n)=>{const sec=n===3?total-used:Math.round(total*p[1]);used+=sec;a.push(timed('cardio',p[0],sec,fmt(sec),p[2],'无需器械',plan.cardio.intensity==='easy'?'轻松有氧':'中等有氧',plan.cardio.talkTest))});
  }
  return a;
}
function phase(s){return s.group==='warmup'?'热身':s.group==='strength'?'力量':s.group==='rest'?'休息':'有氧'}

function persistActive(){if(!steps.length||i>=steps.length){st.active=null;save();return}st.active={date:todayKey(),plan,steps,i,left,elapsed,updated:Date.now()};save()}
function restoreActive(){const a=st.active;if(!a||a.date!==todayKey()||!a.plan||!Array.isArray(a.steps)||a.i<0||a.i>=a.steps.length){st.active=null;save();return false}plan=a.plan;steps=a.steps;i=a.i;left=Math.max(0,Number(a.left||0));elapsed=Math.max(0,Number(a.elapsed||0));running=false;return true}

function renderStep(restored=false,silent=false){
  if(i>=steps.length)return finish(false);
  const s=steps[i];
  $('summaryCard').classList.add('hidden');$('planCard').classList.add('hidden');$('prefsCard').classList.add('hidden');$('coachCard').classList.add('show');$('sessionTop').classList.add('show');
  $('phase').textContent=phase(s);$('moveName').textContent=s.name;$('goalMain').textContent=s.goal;$('cueText').textContent=s.cue;$('talkTest').textContent=s.talk||'';$('talkTest').classList.toggle('hidden',!s.talk);$('loadTag').textContent=s.load;$('intensityTag').textContent=s.intensity;$('typeTag').textContent=phase(s);$('goalBox').classList.toggle('cardio',s.group==='cardio');$('stepCount').textContent=`${i+1} / ${steps.length}`;$('sessionElapsed').textContent=`已用 ${fmt(elapsed/1000)}`;
  if(s.kind==='reps'){
    $('timerLabel').textContent='目标';$('timerValue').textContent=(s.goal.match(/(\d+)次/)||[])[1]||'—';$('repActions').classList.remove('hidden');$('timedActions').classList.add('hidden');$('progressBar').style.width='0%';if(!silent)say(`${s.name}，${s.goal}。${s.cue}`);
  }else{
    $('repActions').classList.add('hidden');$('timedActions').classList.remove('hidden');
    if(!restored)left=s.seconds;else if(left<=0){i++;persistActive();return renderStep(false,silent)}
    $('timerLabel').textContent='剩余';$('timerValue').textContent=fmt(left);$('timedButton').textContent=restored?'继续这一段':'开始这一段';$('progressBar').style.width=`${Math.max(0,Math.min(100,(1-left/s.seconds)*100))}%`;if(!silent)say(`${s.name}。${s.goal}。${s.cue}`);
  }
  persistActive();
}
function completeTimedStep(){const s=steps[i];if(s&&s.group==='strength'&&s.id)s.result='hit';running=false;releaseWake();i++;left=0;persistActive();say('这一段完成');renderStep()}
function startTimer(){if(running)return;running=true;last=Date.now();lastPersist=last;$('timedButton').textContent='暂停';keepAwake();persistActive();timer=setInterval(()=>{const now=Date.now(),dt=Math.max(0,now-last);last=now;elapsed+=dt;left-=dt/1000;$('sessionElapsed').textContent=`已用 ${fmt(elapsed/1000)}`;const s=steps[i];$('timerValue').textContent=fmt(left);$('progressBar').style.width=`${Math.max(0,Math.min(100,(1-left/s.seconds)*100))}%`;if(now-lastPersist>=1000){lastPersist=now;persistActive()}if(left<=0){clearInterval(timer);timer=null;completeTimedStep()}},250)}
function stopTimer(){if(timer){clearInterval(timer);timer=null}running=false;releaseWake();$('timedButton').textContent='继续';persistActive()}
function rep(result){const s=steps[i];s.result=result;say(result==='hit'?'完成。保持这个动作质量。':result==='miss'?'可以，动作质量优先。':'已跳过，不把跳过当作失败。');i++;left=0;persistActive();renderStep()}

function syncV4Entry(e){const x={date:e.date,type:plan.dayLabel,planKey:e.planKey,partial:e.partial,rating:e.rating,reason:e.partial?'early':'complete',source:'v4.1',dayType:e.dayType,cardioMode:e.cardioMode,cardioIntensity:e.cardioIntensity};v4.history=v4.history.filter(h=>h.date!==e.date);v4.history.push(x);v4.history=v4.history.slice(-180);saveV4()}
function finish(partial){if(timer)stopTimer();releaseWake();$('coachCard').classList.remove('show');$('finishCard').classList.add('show');const e={date:todayKey(),dayType:plan.dayType,planKey:plan.strength&&plan.strength.planKey||null,cardioMode:plan.cardio.mode,cardioIntensity:plan.cardio.intensity,partial:!!partial,rating:null,elapsedMinutes:Math.round(elapsed/60000)};st.history=st.history.filter(x=>x.date!==e.date);st.history.push(e);st.history=st.history.slice(-180);st.active=null;save();syncV4Entry(e);$('finishText').textContent=partial?'今天提前结束也会保留记录，系统不会把它当作失败。':'力量、有氧和恢复节奏都记录好了。今天整体感觉如何？';$('savedText').textContent=`实际训练约 ${Math.max(1,e.elapsedMinutes)} 分钟 · ${plan.dayLabel}`;say(partial?'今天就到这里，已经记录。':'今天训练完成。')}
function savePrefs(){st.profile.cardioPreference=$('cardioPreference').value;st.profile.jumpRope=$('jumpRope').checked;st.profile.voice=$('voice').checked;save();renderSummary();say('设置已保存。')}

function targetFor(id,m){let t=targets[id];if(!t){t={reps:id==='carry'?null:m.min,seconds:id==='carry'?35:null,success:0,misses:0};targets[id]=t}return t}
function moveVariant(id,dir){const ladder=ladders[id];if(!ladder)return null;const cur=vp[id],n=ladder.indexOf(cur)+dir;if(n<0||n>=ladder.length)return null;vp[id]=ladder[n];delete targets[id];return ex(id).name}
function applyStrengthProgress(rate){
  if(!plan.strength)return'';
  if(plan.strength.planKey==='LIGHT')return'轻量力量日不推进难度';
  const done=steps.filter(s=>s.group==='strength'&&s.id&&s.result),ids=[...new Set(done.map(s=>s.id))],notes=[];
  ids.forEach(id=>{
    const m=ex(id),r=done.filter(s=>s.id===id).map(s=>s.result),hits=r.filter(x=>x==='hit').length,miss=r.filter(x=>x==='miss').length,skips=r.filter(x=>x==='skip').length,allHit=r.length>0&&hits===r.length&&!miss&&!skips,t=targetFor(id,m);
    if(id==='carry'){
      if(allHit&&rate!=='hard'){t.success=(t.success||0)+1;if(t.success>=2){const sec=Number(t.seconds||35);if(sec<45){t.seconds=Math.min(45,sec+5);t.success=0;notes.push('农夫行走：下次 +5秒')}else if(Number(loads.carry||0)>0){loads.carry=Math.round((Number(loads.carry)+.5)*2)/2;t.seconds=35;t.success=0;notes.push('农夫行走：下次每手小幅加重')}}}else if(miss||rate==='hard')t.success=0;
      return;
    }
    if(allHit&&rate!=='hard'){
      t.misses=0;t.success=(t.success||0)+1;const needed=rate==='easy'?1:2;
      if(t.success>=needed){
        if(Number(t.reps||m.min)<m.max){t.reps=Number(t.reps||m.min)+1;t.success=0;notes.push(`${m.name}：下次目标 +1次`)}
        else{
          const up=moveVariant(id,1);
          if(up)notes.push(`${m.name}：下次升级为${up}`);
          else{
            const loadKey=id==='squat'?'sq':id==='rdl'?'rdl':id==='row'?'rowLoad':null,inc=id==='row'?.5:1;
            if(loadKey&&Number(loads[loadKey]||0)>0){loads[loadKey]=Math.round((Number(loads[loadKey])+inc)*2)/2;t.reps=m.min;t.success=0;notes.push(`${m.name}：下次小幅加重`)}else t.success=0;
          }
        }
      }
    }else if(miss){
      t.success=0;t.misses=(t.misses||0)+1;
      if(t.misses>=2){if(Number(t.reps||m.min)>m.min){t.reps--;t.misses=0;notes.push(`${m.name}：下次目标 -1次`)}else{const down=moveVariant(id,-1);t.misses=0;if(down)notes.push(`${m.name}：下次调整为${down}`)}}
    }else if(rate==='hard')t.success=0;
  });
  saveV4();return notes.slice(0,3).join('；')||'力量目标保持不变';
}
function rateToday(rate){const e=[...st.history].reverse().find(x=>x.date===todayKey());if(!e)return;e.rating=rate;const note=applyStrengthProgress(rate);save();const h=[...v4.history].reverse().find(x=>x.date===todayKey());if(h)h.rating=rate;saveV4();$('savedText').textContent+=` · 明天会根据今天的感受自动调整。${note?` ${note}。`:''}`;document.querySelectorAll('.rate').forEach(x=>x.disabled=true)}

$('startSession').onclick=()=>{steps=build();i=0;left=0;elapsed=0;st.active=null;save();renderStep()};
$('timedButton').onclick=()=>running?stopTimer():startTimer();
$('hit').onclick=()=>rep('hit');$('miss').onclick=()=>rep('miss');$('skip').onclick=()=>rep('skip');
$('finishEarly').onclick=()=>finish(true);$('savePrefs').onclick=savePrefs;
document.querySelectorAll('.rate').forEach(b=>b.onclick=()=>rateToday(b.dataset.rate));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stopTimer()});
window.addEventListener('pagehide',()=>{if(running)stopTimer();else persistActive()});
window.addEventListener('beforeunload',()=>persistActive());

$('cardioPreference').value=st.profile.cardioPreference;
$('jumpRope').checked=st.profile.jumpRope;
$('voice').checked=st.profile.voice!==false;
renderSummary();
if(restoreActive())renderStep(true,true);
})();