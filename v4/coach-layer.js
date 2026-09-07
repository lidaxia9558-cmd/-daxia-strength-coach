(()=>{
'use strict';
const VOICE_KEY='daxiaCoachV4Voice2';
const GUIDE={
 '椅子坐站':{steps:['双脚踩稳，脚尖自然向外','臀部向后坐，轻触椅面','脚掌发力，平稳站直'],tempo:'约3秒坐下 · 轻触 · 1–2秒站起',breath:'坐下吸气，站起呼气',avoid:'不要猛坐、借椅子反弹或让膝盖明显内扣。'},
 '徒手深蹲':{steps:['双脚约与肩同宽，脚掌踩稳','臀部向后下坐，膝盖跟随脚尖','保持躯干稳定，站回起始位'],tempo:'约3秒下蹲 · 短暂停 · 1–2秒站起',breath:'下蹲吸气，站起呼气',avoid:'不要塌腰、抬脚跟或为了蹲深牺牲稳定。'},
 '罗马尼亚硬拉 RDL':{steps:['站稳，膝盖保持轻微弯曲','臀部主动向后推，重量贴近腿','臀腿后侧有拉伸感后，用髋站直'],tempo:'约3秒下放 · 短暂停 · 1–2秒站起',breath:'下放吸气，站起呼气',avoid:'不要把动作做成弯腰够地，也不要在顶端过度后仰。'},
 '墙面俯卧撑':{steps:['双手撑墙，身体保持一条直线','胸口主动靠近墙面','手掌推墙，身体整体返回'],tempo:'约2–3秒靠近 · 短暂停 · 1–2秒推回',breath:'靠近时吸气，推回时呼气',avoid:'不要只动头和肩，也不要塌腰。'},
 '高台俯卧撑':{steps:['双手撑稳高台，身体成一直线','肘部约45°，胸口靠近支撑面','保持躯干稳定，推回起始位'],tempo:'约2–3秒下放 · 短暂停 · 1–2秒推起',breath:'下放吸气，推起呼气',avoid:'支撑面必须稳固；不要耸肩、塌腰。'},
 '低台俯卧撑':{steps:['确认桌沿稳固且不会滑动','全身收紧，胸口向桌沿靠近','肘部约45°，平稳推回'],tempo:'约2–3秒下放 · 短暂停 · 1–2秒推起',breath:'下放吸气，推起呼气',avoid:'不要为了完成次数缩短动作幅度或塌腰。'},
 '标准俯卧撑':{steps:['手掌稳稳撑地，头背臀一条线','肘部约45°，胸口主动下沉','保持躯干整体，推回起始位'],tempo:'约2–3秒下放 · 短暂停 · 1–2秒推起',breath:'下放吸气，推起呼气',avoid:'不要塌腰、耸肩或用脖子抢先向下。'},
 '单臂划船':{steps:['支撑稳固，躯干保持稳定','肩膀远离耳朵，肘部向后拉','顶端短暂停，再控制下放'],tempo:'约1–2秒拉起 · 停1秒 · 2–3秒下放',breath:'拉起呼气，下放吸气',avoid:'不要扭转躯干或用身体甩起重量。'},
 '弹力带划船':{steps:['确认固定点牢靠，肩膀放松','先稳住肩胛，再把手柄拉向身体','顶端短暂停，控制回程'],tempo:'约1–2秒拉 · 停1秒 · 2秒回',breath:'拉时呼气，回程吸气',avoid:'不要耸肩、后仰借力或让弹力带突然回弹。'},
 '弹力带下拉':{steps:['确认高位固定点绝对可靠','胸口微抬，肩膀远离耳朵','肘部向身体两侧下拉，再控制回程'],tempo:'约1–2秒下拉 · 停1秒 · 2–3秒回',breath:'下拉呼气，回程吸气',avoid:'不要只用手臂硬拽，也不要身体大幅后仰。'},
 '辅助引体':{steps:['握稳单杠，让身体先稳定','先收紧肩胛，再把肘部向下拉','平稳上升，再控制回到起始位'],tempo:'平稳拉起 · 短暂停 · 2–3秒下放',breath:'拉起呼气，下放吸气',avoid:'不要摆腿、蹬踏借力或突然掉下。'},
 '引体向上':{steps:['从稳定悬垂开始，躯干收紧','先收肩胛，再把肘部向下拉','胸口靠近杠后，控制下放'],tempo:'平稳拉起 · 短暂停 · 2–3秒下放',breath:'拉起呼气，下放吸气',avoid:'不要摆腿借力，也不要在肩膀失控时硬拉。'},
 '第二种划船（替代垂直拉）':{steps:['选择与主划船不同的握法或器械','肩胛稳定后把肘部向后拉','顶端停顿，慢慢回程'],tempo:'约1–2秒拉 · 停1秒 · 2–3秒回',breath:'拉时呼气，回程吸气',avoid:'不要追求大重量；这一项的目的只是补足拉力训练。'},
 '农夫行走':{steps:['左右手负重对称，站直身体','核心轻收紧，肩膀自然下沉','小步稳定行走，保持身体不歪'],tempo:'稳定连续行走，不追求速度',breath:'保持自然呼吸，不要憋气',avoid:'不要耸肩、左右摇摆或为了走快而失去姿势。'}
};
const VOICE_CUE={
 '椅子坐站':'脚掌踩稳，轻触椅面后再站起。',
 '徒手深蹲':'膝盖跟随脚尖，动作慢一点。',
 '罗马尼亚硬拉 RDL':'臀部向后推，不要弯腰去够地面。',
 '墙面俯卧撑':'身体保持一条直线。',
 '高台俯卧撑':'胸口主动靠近支撑面，不要塌腰。',
 '低台俯卧撑':'支撑面先确认稳固，肘部约四十五度。',
 '标准俯卧撑':'头背臀保持一条直线，动作不要抢。',
 '单臂划船':'躯干稳住，用肘部向后拉。',
 '弹力带划船':'肩膀放松，顶端停一下。',
 '弹力带下拉':'胸口微抬，把肘部向下拉。',
 '辅助引体':'先稳定肩胛，不要摆腿借力。',
 '引体向上':'先收肩胛，再平稳拉起。',
 '第二种划船（替代垂直拉）':'动作慢，顶端停一下。',
 '农夫行走':'站直，核心收紧，保持自然呼吸。'
};
function readPrefs(){try{return Object.assign({style:'coach'},JSON.parse(localStorage.getItem(VOICE_KEY)||'{}'))}catch(e){return{style:'coach'}}}
let prefs=readPrefs(), lastExercise='', restTenSpoken=false, wakeLock=null;
function savePrefs(){try{localStorage.setItem(VOICE_KEY,JSON.stringify(prefs))}catch(e){}}
function detectExercise(text=''){return Object.keys(VOICE_CUE).find(k=>text.includes(k))||''}
function expandVoice(text){if(prefs.style==='brief')return text;const ex=detectExercise(text);if(text.includes('开始热身'))return '大虾，开始两分钟热身。今天不用赶，先把身体活动开。';if(text.startsWith('热身完成'))return text+'。动作标准优先，做完这一组还应该能再做两到三次。'+(ex?VOICE_CUE[ex]:'');if(ex){const repeated=ex===lastExercise;lastExercise=ex;return repeated?text+'。保持刚才的节奏。':text+'。'+VOICE_CUE[ex]+' 保留两到三次余力。'}if(text.includes('达到三十分钟'))return '已经到三十分钟上限。今天到这里，不补课，不硬撑。';if(text.includes('训练完成'))return '训练完成。今天的力量已经存入。做得够了，剩下的交给恢复。';if(text.includes('动作校准完成'))return '动作校准完成。今天的训练已经替你安排好了。';return text}
function patchSpeech(){const synth=window.speechSynthesis;if(!synth||typeof synth.speak!=='function')return;try{const raw=synth.speak.bind(synth);synth.speak=function(u){try{if(u&&typeof u.text==='string'){const t=expandVoice(u.text);const x=new SpeechSynthesisUtterance(t);x.lang=u.lang||'zh-CN';x.rate=prefs.style==='coach'?.98:(u.rate||1.02);x.pitch=.98;return raw(x)}}catch(e){}return raw(u)};window.__v4RawSpeak=raw}catch(e){}}
function injectStyle(){const s=document.createElement('style');s.textContent=`
.coachGuide{display:none}.coachGuide.show{display:block}.coachGuide .guideHead{display:flex;justify-content:space-between;gap:10px;align-items:center}.coachGuide .listen{min-height:38px;padding:7px 11px;border:1px solid var(--line);background:#fff;border-radius:11px;font-weight:700}.motionFlow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:7px;align-items:center;margin-top:13px}.motionStep{background:var(--soft);border-radius:13px;padding:11px 9px;font-size:12px;line-height:1.45;min-height:72px;display:grid;place-items:center;text-align:center}.motionArrow{color:var(--g);font-weight:800}.coachFacts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.coachFact{border:1px solid var(--line);border-radius:13px;padding:10px;font-size:12px;line-height:1.5}.coachFact b{display:block;font-size:11px;color:var(--muted);margin-bottom:4px}.coachAvoid{margin-top:9px;background:var(--warm);border-radius:13px;padding:10px 11px;font-size:12px;line-height:1.5}.voice2{margin-top:10px;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}.voice2 select{min-height:42px;border:1px solid var(--line);border-radius:11px;background:#fff;padding:7px 9px;font-size:14px}.voice2 button{min-height:42px;padding:7px 11px;border:1px solid var(--line);border-radius:11px;background:#fff;font-weight:700}.coachGuide .micro{font-size:11px;color:var(--muted);margin-top:7px;line-height:1.45}@media(max-width:520px){.motionFlow{grid-template-columns:1fr;gap:5px}.motionArrow{transform:rotate(90deg);text-align:center}.motionStep{min-height:48px}.coachFacts{grid-template-columns:1fr}.coachGuide{margin-top:-2px}}
`;document.head.appendChild(s)}
function injectGuide(){const coach=document.getElementById('coach');if(!coach||document.getElementById('teachingCard'))return;const card=document.createElement('section');card.className='card coachGuide';card.id='teachingCard';card.innerHTML=`<div class="guideHead"><div><b>动作教练</b><div class="mini" id="teachVariant">当前动作</div></div><button class="listen" id="replayCue" type="button">再听一遍</button></div><div class="motionFlow"><div class="motionStep" id="step1"></div><div class="motionArrow">→</div><div class="motionStep" id="step2"></div><div class="motionArrow">→</div><div class="motionStep" id="step3"></div></div><div class="coachFacts"><div class="coachFact"><b>节奏</b><span id="teachTempo"></span></div><div class="coachFact"><b>呼吸</b><span id="teachBreath"></span></div></div><div class="coachAvoid"><b>最容易出错：</b><span id="teachAvoid"></span></div><div class="micro">动作标准优先于次数。某一下开始明显变形时，这一组就可以结束。</div>`;coach.insertAdjacentElement('afterend',card)}
function injectVoiceMode(){const settings=document.getElementById('settingsCard');if(!settings||document.getElementById('coachVoiceStyle'))return;const wrap=document.createElement('div');wrap.className='voice2';wrap.innerHTML=`<label class="field"><span class="mini">语音风格</span><select id="coachVoiceStyle"><option value="coach">教练模式（推荐）</option><option value="brief">精简播报</option></select></label><button id="voiceTest" type="button">试听</button>`;const row=settings.querySelector('.row');if(row)row.insertAdjacentElement('afterend',wrap);const sel=document.getElementById('coachVoiceStyle');sel.value=prefs.style;sel.onchange=()=>{prefs.style=sel.value;savePrefs()};document.getElementById('voiceTest').onclick=()=>coachSpeak(prefs.style==='coach'?'大虾，语音教练已经准备好。训练时我只提醒真正重要的事情。':'语音教练已开启。')}
function coachSpeak(text){const toggle=document.getElementById('voice');if(toggle&&!toggle.checked)return;try{const synth=window.speechSynthesis;if(!synth)return;synth.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.98;u.pitch=.98;(window.__v4RawSpeak||synth.speak.bind(synth))(u)}catch(e){}}
function currentGuide(){const name=(document.getElementById('name')?.textContent||'').trim();return GUIDE[name]?{name,data:GUIDE[name]}:null}
function updateGuide(){const card=document.getElementById('teachingCard'),setButtons=document.getElementById('setButtons');if(!card||!setButtons)return;const active=setButtons.style.display==='grid'&&document.getElementById('coach')?.style.display!=='none';const g=currentGuide();card.classList.toggle('show',!!(active&&g));if(!active||!g)return;document.getElementById('teachVariant').textContent=g.name;g.data.steps.forEach((x,i)=>document.getElementById('step'+(i+1)).textContent=x);document.getElementById('teachTempo').textContent=g.data.tempo;document.getElementById('teachBreath').textContent=g.data.breath;document.getElementById('teachAvoid').textContent=g.data.avoid}
function bindGuide(){const replay=document.getElementById('replayCue');if(replay)replay.onclick=()=>{const g=currentGuide();if(g)coachSpeak(`${g.name}。${VOICE_CUE[g.name]||''} ${g.data.breath}。`)};['name','setButtons','coach'].forEach(id=>{const el=document.getElementById(id);if(el)new MutationObserver(updateGuide).observe(el,{childList:true,attributes:true,subtree:true})});updateGuide()}
function bindRestCoach(){const rest=document.getElementById('restNum');if(!rest)return;new MutationObserver(()=>{const n=Number(rest.textContent||0),show=document.getElementById('rest')?.classList.contains('show');if(!show){restTenSpoken=false;return}if(n>10)restTenSpoken=false;if(n===10&&!restTenSpoken){restTenSpoken=true;const next=document.getElementById('nextText')?.textContent||'';coachSpeak('还有十秒。'+next.replace('下一组：','下一组，'))}}).observe(rest,{childList:true,subtree:true})}
async function requestWake(){if(!('wakeLock'in navigator)||document.hidden||!document.getElementById('app')?.classList.contains('training')||wakeLock)return;try{wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>wakeLock=null)}catch(e){wakeLock=null}}
async function releaseWake(){try{if(wakeLock)await wakeLock.release()}catch(e){}wakeLock=null}
function bindWakeLock(){const app=document.getElementById('app');if(!app)return;new MutationObserver(()=>{if(app.classList.contains('training'))requestWake();else releaseWake()}).observe(app,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseWake();else requestWake()});if(app.classList.contains('training'))requestWake()}
function bindIOSPolish(){['phase','nextText'].forEach(id=>document.getElementById(id)?.setAttribute('aria-live','polite'));const start=document.getElementById('start');if(start)start.addEventListener('click',()=>setTimeout(()=>{if(document.getElementById('app')?.classList.contains('training'))document.getElementById('coach')?.scrollIntoView({behavior:'smooth',block:'start'})},180));['hit','miss','skip','endRest'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>{try{navigator.vibrate?.(12)}catch(e){}}))}
function init(){injectStyle();injectGuide();injectVoiceMode();bindGuide();bindRestCoach();bindWakeLock();bindIOSPolish();window.__v4CoachLayer={GUIDE,VOICE_CUE,expandVoice,detectExercise,getPrefs:()=>({...prefs})}}
patchSpeech();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();