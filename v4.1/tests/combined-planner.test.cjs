const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../combined-planner.js');

const TODAY=new Date('2026-09-14T12:00:00');
const e=(date,dayType,extra={})=>Object.assign({date,dayType,rating:'good'},extra);

test('fresh start begins with main strength A',()=>{
  assert.equal(P.chooseDayType({today:TODAY,history:[]}),P.DAY_TYPES.STRENGTH_A);
});

test('main strength is not scheduled on back-to-back days by default',()=>{
  const h=[e('2026-09-13',P.DAY_TYPES.STRENGTH_A)];
  assert.equal(P.chooseDayType({today:TODAY,history:h}),P.DAY_TYPES.CARDIO_BASE);
});

test('after cardio day, strength alternates A to B',()=>{
  const h=[
    e('2026-09-12',P.DAY_TYPES.STRENGTH_A),
    e('2026-09-13',P.DAY_TYPES.CARDIO_BASE)
  ];
  assert.equal(P.chooseDayType({today:TODAY,history:h}),P.DAY_TYPES.STRENGTH_B);
});

test('hard rating yesterday triggers recovery day',()=>{
  const h=[e('2026-09-13',P.DAY_TYPES.CARDIO_BASE,{rating:'hard'})];
  assert.equal(P.chooseDayType({today:TODAY,history:h}),P.DAY_TYPES.RECOVERY);
});

test('three consecutive training days trigger light combined day',()=>{
  const h=[
    e('2026-09-11',P.DAY_TYPES.STRENGTH_A),
    e('2026-09-12',P.DAY_TYPES.CARDIO_BASE),
    e('2026-09-13',P.DAY_TYPES.STRENGTH_B)
  ];
  assert.equal(P.consecutiveTrainingDays(h,TODAY),3);
  assert.equal(P.chooseDayType({today:TODAY,history:h}),P.DAY_TYPES.LIGHT_COMBINED);
});

test('four consecutive training days trigger recovery',()=>{
  const h=[
    e('2026-09-10',P.DAY_TYPES.STRENGTH_A),
    e('2026-09-11',P.DAY_TYPES.CARDIO_BASE),
    e('2026-09-12',P.DAY_TYPES.STRENGTH_B),
    e('2026-09-13',P.DAY_TYPES.CARDIO_BASE)
  ];
  assert.equal(P.chooseDayType({today:TODAY,history:h}),P.DAY_TYPES.RECOVERY);
});

test('rope intervals are reserved for suitable cardio-focused days',()=>{
  const mode=P.chooseCardioMode({
    today:TODAY,
    history:[],
    dayType:P.DAY_TYPES.CARDIO_BASE,
    profile:{jumpRope:true,cardioPreference:'mixed'}
  });
  assert.equal(mode,'jumpRopeIntervals');
});

test('rope is not scheduled on consecutive days',()=>{
  const h=[e('2026-09-13',P.DAY_TYPES.CARDIO_BASE,{cardioMode:'jumpRopeIntervals',cardioIntensity:'vigorous'})];
  const mode=P.chooseCardioMode({
    today:TODAY,
    history:h,
    dayType:P.DAY_TYPES.CARDIO_BASE,
    profile:{jumpRope:true,cardioPreference:'rope'}
  });
  assert.equal(mode,'lowImpact');
});

test('rope exposure is capped conservatively when already used twice in seven days',()=>{
  const h=[
    e('2026-09-09',P.DAY_TYPES.CARDIO_BASE,{cardioMode:'jumpRopeIntervals',cardioIntensity:'vigorous'}),
    e('2026-09-11',P.DAY_TYPES.CARDIO_BASE,{cardioMode:'jumpRopeIntervals',cardioIntensity:'vigorous'})
  ];
  const mode=P.chooseCardioMode({today:TODAY,history:h,dayType:P.DAY_TYPES.CARDIO_BASE,profile:{jumpRope:true,cardioPreference:'mixed'}});
  assert.equal(mode,'lowImpact');
});

test('strength days use low-impact moderate cardio by default',()=>{
  const mode=P.chooseCardioMode({today:TODAY,history:[],dayType:P.DAY_TYPES.STRENGTH_A,profile:{jumpRope:true,cardioPreference:'rope'}});
  assert.equal(mode,'lowImpact');
});

test('recovery day is easy, low-impact and about 30 minutes total',()=>{
  const p=P.prescriptionFor(P.DAY_TYPES.RECOVERY,'lowImpact');
  assert.equal(p.cardioIntensity,'easy');
  assert.equal(p.strengthMinutes,0);
  assert.equal(p.totalMinutes,30);
});

test('normal combined strength plan stays near the 40-minute default budget',()=>{
  const plan=P.buildTodayPlan({today:TODAY,history:[],profile:{jumpRope:true,cardioPreference:'mixed'}});
  assert.equal(plan.dayType,P.DAY_TYPES.STRENGTH_A);
  assert.equal(plan.totalMinutes,40);
  assert.equal(plan.strengthMinutes,22);
  assert.equal(plan.cardioMinutes,15);
  assert.equal(plan.cardio.intensity,'moderate');
});

test('cardio-focused rope day remains inside normal daily time range',()=>{
  const p=P.prescriptionFor(P.DAY_TYPES.CARDIO_BASE,'jumpRopeIntervals');
  assert.ok(p.totalMinutes>=20&&p.totalMinutes<=50);
  assert.equal(p.ropeWorkMinutes,8);
  assert.equal(p.cardioIntensity,'vigorous');
});
