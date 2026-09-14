const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../combined-planner.js');

const ROOT=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(ROOT,'preview/app-release.js'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'preview/index.html'),'utf8');
const planner=fs.readFileSync(path.join(ROOT,'combined-planner.js'),'utf8');

test('release build is self-contained for staging and production root copy',()=>{
  assert.match(html,/src="\.\/combined-planner\.js"/);
  assert.match(html,/src="\.\/app-release\.js"/);
  assert.ok(fs.existsSync(path.join(ROOT,'preview/combined-planner.js')));
  assert.ok(fs.existsSync(path.join(ROOT,'preview/app-release.js')));
});

test('V4.1 preserves V4 data compatibility',()=>{
  assert.match(app,/V4KEY='daxiaCoachV4'/);
  assert.match(app,/v4\.profile/);
  assert.match(app,/v4\.loads/);
  assert.match(app,/v4\.targets/);
  assert.match(app,/syncV4Entry/);
  assert.match(app,/saveV4/);
});

test('active workout persists and restores after refresh',()=>{
  assert.match(app,/active:null/);
  assert.match(app,/function persistActive\(/);
  assert.match(app,/function restoreActive\(/);
  assert.match(app,/if\(restoreActive\(\)\)renderStep\(true,true\)/);
  assert.match(app,/beforeunload/);
  assert.match(app,/pagehide/);
});

test('backgrounding pauses active timed work instead of silently consuming time',()=>{
  assert.match(app,/visibilitychange/);
  assert.match(app,/document\.hidden&&running/);
  assert.match(app,/stopTimer\(\)/);
});

test('screen wake lock is used during timed training where supported',()=>{
  assert.match(app,/wakeLock/);
  assert.match(app,/navigator\.wakeLock\.request\('screen'\)/);
  assert.match(app,/releaseWake/);
});

test('strength outcomes still drive conservative progression',()=>{
  assert.match(app,/applyStrengthProgress/);
  assert.match(app,/rate==='easy'\?1:2/);
  assert.match(app,/t\.reps=Number\(t\.reps\|\|m\.min\)\+1/);
  assert.match(app,/t\.misses>=2/);
  assert.match(app,/plan\.strength\.planKey==='LIGHT'/);
  assert.match(app,/const cur=vp\[id\],n=ladder\.indexOf\(cur\)\+dir/);
});

test('cardio remains home-first and jump rope is not daily default',()=>{
  assert.match(planner,/室内低冲击有氧/);
  assert.match(planner,/jumpRopeIntervals/);
  assert.match(planner,/if\(yesterday&&isRope\(yesterday\)\)return 'lowImpact'/);
});

test('normal day stays near forty minutes and recovery day stays lighter',()=>{
  const normal=P.buildTodayPlan({today:new Date('2026-09-14T12:00:00'),history:[],profile:{jumpRope:true,cardioPreference:'mixed'}});
  assert.equal(normal.totalMinutes,40);
  assert.equal(normal.strengthMinutes,22);
  assert.equal(normal.cardioMinutes,15);
  const recovery=P.prescriptionFor(P.DAY_TYPES.RECOVERY,'lowImpact');
  assert.equal(recovery.totalMinutes,30);
  assert.equal(recovery.cardioIntensity,'easy');
});

test('safety copy remains visible in the product',()=>{
  assert.match(html,/尖锐疼痛/);
  assert.match(html,/胸痛/);
  assert.match(html,/异常气短/);
  assert.match(html,/跟腱/);
});
