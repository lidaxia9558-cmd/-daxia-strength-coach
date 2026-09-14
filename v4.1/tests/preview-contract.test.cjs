const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('v4.1/preview/index.html','utf8');
const app=fs.readFileSync('v4.1/preview/app.js','utf8');

test('preview presents one combined daily workout',()=>{
  assert.match(html,/100岁运动教练/);
  assert.match(html,/开始今天训练/);
  assert.match(html,/力量/);
  assert.match(html,/有氧/);
  assert.match(html,/热身 \/ 活动/);
});

test('preview loads planner before app',()=>{
  const planner=html.indexOf('../combined-planner.js');
  const application=html.indexOf('./app.js');
  assert.ok(planner>0);
  assert.ok(application>planner);
});

test('preview inherits V4 strength profile and loads without mutating V4 key',()=>{
  assert.match(app,/V4KEY='daxiaCoachV4'/);
  assert.match(app,/v4\.profile/);
  assert.match(app,/v4\.loads/);
  assert.match(app,/v4\.targets/);
  assert.doesNotMatch(app,/localStorage\.setItem\(V4KEY/);
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

test('safety copy remains visible',()=>{
  assert.match(html,/尖锐疼痛/);
  assert.match(html,/胸痛/);
  assert.match(html,/异常气短/);
  assert.match(html,/不追求力竭/);
});
