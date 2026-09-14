(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DaxiaCombinedPlanner=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DAY_TYPES={
    STRENGTH_A:'STRENGTH_A',
    STRENGTH_B:'STRENGTH_B',
    CARDIO_BASE:'CARDIO_BASE',
    LIGHT_COMBINED:'LIGHT_COMBINED',
    RECOVERY:'RECOVERY'
  };

  const DEFAULT_PROFILE={
    cardioPreference:'mixed',
    jumpRope:true,
    safeStep:false,
    outdoorWalk:false
  };

  const LABELS={
    STRENGTH_A:'力量为主 A',
    STRENGTH_B:'力量为主 B',
    CARDIO_BASE:'有氧为主',
    LIGHT_COMBINED:'轻量综合日',
    RECOVERY:'恢复日'
  };

  function dateKey(d){
    const x=d instanceof Date?d:new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  }
  function dayDiff(a,b){const A=new Date(`${a}T12:00:00`),B=new Date(`${b}T12:00:00`);return Math.round((B-A)/86400000)}
  function normalizedHistory(history,today){const t=dateKey(today||new Date());return(Array.isArray(history)?history:[]).filter(x=>x&&x.date&&x.date<t).slice().sort((a,b)=>a.date.localeCompare(b.date))}
  function recent(history,today,days){const t=dateKey(today||new Date());return normalizedHistory(history,today).filter(x=>{const d=dayDiff(x.date,t);return d>=1&&d<=days})}
  function isMainStrength(x){return x&&(x.dayType===DAY_TYPES.STRENGTH_A||x.dayType===DAY_TYPES.STRENGTH_B||x.planKey==='A'||x.planKey==='B')}
  function isRope(x){return!!(x&&(x.cardioMode==='jumpRope'||x.cardioMode==='jumpRopeIntervals'))}
  function isVigorous(x){return!!(x&&(x.cardioIntensity==='vigorous'||isRope(x)))}
  function isHard(x){return!!(x&&x.rating==='hard')}
  function lastEntry(history,today){const h=normalizedHistory(history,today);return h.length?h[h.length-1]:null}
  function yesterdayEntry(history,today){const t=dateKey(today||new Date()),h=normalizedHistory(history,today);return[...h].reverse().find(x=>dayDiff(x.date,t)===1)||null}
  function consecutiveTrainingDays(history,today){const t=dateKey(today||new Date()),dates=new Set(normalizedHistory(history,today).map(x=>x.date));let n=0;for(let i=1;i<=14;i++){const d=new Date(`${t}T12:00:00`);d.setDate(d.getDate()-i);if(dates.has(dateKey(d)))n++;else break}return n}
  function lastMainStrengthType(history,today){const x=[...normalizedHistory(history,today)].reverse().find(isMainStrength);if(!x)return null;return x.dayType===DAY_TYPES.STRENGTH_A||x.planKey==='A'?DAY_TYPES.STRENGTH_A:DAY_TYPES.STRENGTH_B}

  function chooseDayType(input){
    const history=input&&input.history||[],today=input&&input.today||new Date(),h7=recent(history,today,7),y=yesterdayEntry(history,today),streak=consecutiveTrainingDays(history,today),strengthCount=h7.filter(isMainStrength).length,lastStrength=lastMainStrengthType(history,today);
    if(y&&isHard(y))return DAY_TYPES.RECOVERY;
    if(streak>=4)return DAY_TYPES.RECOVERY;
    if(streak>=3)return DAY_TYPES.LIGHT_COMBINED;
    if(y&&isMainStrength(y))return DAY_TYPES.CARDIO_BASE;
    if(strengthCount<3)return lastStrength===DAY_TYPES.STRENGTH_A?DAY_TYPES.STRENGTH_B:DAY_TYPES.STRENGTH_A;
    if(strengthCount>=4)return DAY_TYPES.CARDIO_BASE;
    const last=lastEntry(history,today);
    if(last&&last.dayType===DAY_TYPES.CARDIO_BASE)return lastStrength===DAY_TYPES.STRENGTH_A?DAY_TYPES.STRENGTH_B:DAY_TYPES.STRENGTH_A;
    return DAY_TYPES.CARDIO_BASE;
  }

  function normalizeProfile(profile){const p=Object.assign({},DEFAULT_PROFILE,profile||{});if(!['mixed','lowImpact','rope'].includes(p.cardioPreference))p.cardioPreference='mixed';p.jumpRope=!!p.jumpRope;p.safeStep=!!p.safeStep;p.outdoorWalk=!!p.outdoorWalk;return p}
  function chooseCardioMode(input){
    const history=input&&input.history||[],today=input&&input.today||new Date(),dayType=input&&input.dayType||chooseDayType(input||{}),profile=normalizeProfile(input&&input.profile),h7=recent(history,today,7),h2=recent(history,today,2),y=yesterdayEntry(history,today),ropeCount=h7.filter(isRope).length,vigorousCount=h7.filter(isVigorous).length;
    if(dayType===DAY_TYPES.RECOVERY||dayType===DAY_TYPES.LIGHT_COMBINED)return'lowImpact';
    if(!profile.jumpRope||profile.cardioPreference==='lowImpact')return'lowImpact';
    if(y&&isRope(y))return'lowImpact';
    if(h2.some(isHard))return'lowImpact';
    if(ropeCount>=2||vigorousCount>=2)return'lowImpact';
    if(dayType===DAY_TYPES.CARDIO_BASE&&(profile.cardioPreference==='mixed'||profile.cardioPreference==='rope'))return'jumpRopeIntervals';
    return'lowImpact';
  }

  function prescriptionFor(dayType,cardioMode){
    let base;
    switch(dayType){
      case DAY_TYPES.STRENGTH_A:
      case DAY_TYPES.STRENGTH_B:base={strengthMinutes:22,cardioMinutes:15,mobilityMinutes:3,cardioIntensity:'moderate'};break;
      case DAY_TYPES.CARDIO_BASE:base={strengthMinutes:0,cardioMinutes:32,mobilityMinutes:5,cardioIntensity:'moderate'};break;
      case DAY_TYPES.LIGHT_COMBINED:base={strengthMinutes:12,cardioMinutes:22,mobilityMinutes:4,cardioIntensity:'moderate'};break;
      default:base={strengthMinutes:0,cardioMinutes:25,mobilityMinutes:5,cardioIntensity:'easy'};
    }
    if(cardioMode==='jumpRopeIntervals'){base.cardioMinutes=18;base.cardioIntensity='vigorous';base.ropeWorkMinutes=8;base.lowImpactMinutes=10}
    base.totalMinutes=base.strengthMinutes+base.cardioMinutes+base.mobilityMinutes;return base;
  }

  function cardioDetails(mode,intensity,p){
    if(mode==='jumpRopeIntervals')return{name:'跳绳间歇 + 低冲击恢复',intensity,talkTest:'跳绳段只能说几个词即可；恢复段应能完整说话。不要做到力竭。',blocks:[{name:'低冲击热身',minutes:3},{name:'跳绳间歇累计',minutes:p.ropeWorkMinutes||8},{name:'原地快走/侧步恢复',minutes:Math.max(0,(p.lowImpactMinutes||10)-3)}]};
    return{name:intensity==='easy'?'轻松室内低冲击有氧':'室内低冲击有氧',intensity,talkTest:intensity==='easy'?'能轻松完整说话，呼吸只略微加快。':'呼吸明显加快，但仍能说完整短句。',blocks:[{name:'原地快走',share:.35},{name:'侧步',share:.25},{name:'交替抬膝',share:.25},{name:'轻松恢复走',share:.15}]};
  }
  function strengthDetails(dayType){if(dayType===DAY_TYPES.STRENGTH_A)return{planKey:'A',label:'力量 A',mode:'main'};if(dayType===DAY_TYPES.STRENGTH_B)return{planKey:'B',label:'力量 B',mode:'main'};if(dayType===DAY_TYPES.LIGHT_COMBINED)return{planKey:'LIGHT',label:'轻量力量',mode:'light'};return null}
  function buildTodayPlan(input){const today=input&&input.today||new Date(),history=input&&input.history||[],profile=normalizeProfile(input&&input.profile),dayType=chooseDayType({today,history}),cardioMode=chooseCardioMode({today,history,profile,dayType}),p=prescriptionFor(dayType,cardioMode);return{version:'4.1',date:dateKey(today),dayType,dayLabel:LABELS[dayType],totalMinutes:p.totalMinutes,strengthMinutes:p.strengthMinutes,cardioMinutes:p.cardioMinutes,mobilityMinutes:p.mobilityMinutes,strength:strengthDetails(dayType),cardio:Object.assign({mode:cardioMode,minutes:p.cardioMinutes},cardioDetails(cardioMode,p.cardioIntensity,p)),safety:'动作标准优先；不追求力竭。出现尖锐疼痛、胸痛、明显头晕或异常气短时停止训练。'}}

  return{DAY_TYPES,DEFAULT_PROFILE,dateKey,recent,chooseDayType,chooseCardioMode,prescriptionFor,buildTodayPlan,consecutiveTrainingDays};
});
