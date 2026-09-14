const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('v4.1/preview/index.html','utf8');
const app=fs.readFileSync('v4.1/preview/app-release.js','utf8');

test('preview presents one combined daily workout',()=>{
  assert.match(html,/100岁运动教练/);
  assert.match(html,/开始今天训练/);
  assert.match(html,/力量/);
  assert.match(html,/有氧/);
  assert.match(html,/热身 \/ 活动/);
});

test('preview loads local planner before release runtime',()=>{
  const planner=html.indexOf('./combined-planner.js');
  const application=html.indexOf('./app-release.js');
  assert.ok(planner>0);
  assert.ok(application>planner);
});

test('preview inherits V4 strength profile and safely writes compatible progress back',()=>{
  assert.match(app,/V4KEY='daxiaCoachV4'/);
  assert.match(app,/v4\.profile/);
  assert.match(app,/v4\.loads/);
  assert.match(app,/v4\.targets/);
  assert.match(app,/saveV4/);
  assert.match(app,/syncV4Entry/);
});

test('home cardio includes low-impact sequence and controlled rope intervals',()=>{
  for(const name of ['原地快走','左右侧步','交替抬膝','轻松恢复走'])assert.match(app,new RegExp(name));
  assert.match(app,/for\(let r=1;r<=8;r\+\+\)/);
  assert.match(app,/跳绳/);
  assert.match(app,/跟腱/);
});

test('preview records combined history and perceived effort',()=>{
  assert.match(app,/cardioMode/);
  assert.match(app,/cardioIntensity/);
  assert.match(app,/rating:null/);
  assert.match(html,/偏轻松/);
  assert.match(html,/刚刚好/);
  assert.match(html,/偏吃力/);
});

test('preview can restore an interrupted workout',()=>{
  assert.match(app,/persistActive/);
  assert.match(app,/restoreActive/);
  assert.match(app,/visibilitychange/);
});

test('safety copy remains visible',()=>{
  assert.match(html,/尖锐疼痛/);
  assert.match(html,/胸痛/);
  assert.match(html,/异常气短/);
  assert.match(html,/不追求力竭/);
});
