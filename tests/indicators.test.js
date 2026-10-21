const assert=require('node:assert');const I=require('../indicators.js');
const near=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
// EMA: constant series -> constant; known values
near(I.ema([5,5,5,5,5],3).at(-1),5);
const e=I.ema([1,2,3,4,5],3);assert.strictEqual(e[1],null);near(e[2],2);near(e[3],3);near(e[4],4);
assert.deepStrictEqual(I.ema([1,2],3),[]);
// RSI: monotonic up -> 100, down -> 0, flat -> 50
const up=Array.from({length:30},(_,i)=>i+1);near(I.rsi(up),100);near(I.rsi(up.slice().reverse()),0);near(I.rsi(new Array(30).fill(7)),50);
// Wilder RSI reference (classic 14-period dataset) ~ 70.46 at bar 15
const ref=[44.34,44.09,44.15,43.61,44.33,44.83,45.10,45.42,45.84,46.08,45.89,46.03,45.61,46.28,46.28];near(I.rsi(ref),70.46,0.05);
assert.strictEqual(I.rsi([1,2]),null);
// trend
assert.strictEqual(I.trend(Array.from({length:100},(_,i)=>100+i)),'BULLISH');
assert.strictEqual(I.trend(Array.from({length:100},(_,i)=>200-i)),'BEARISH');
assert.strictEqual(I.trend(new Array(100).fill(100)),'NEUTRAL');
assert.strictEqual(I.trend([1,2,3]),'NEUTRAL');
// alignment
assert.deepStrictEqual(I.alignment(['BULLISH','BULLISH','BEARISH','NEUTRAL','BULLISH','BULLISH']),{bull:4,bear:1,neutral:1,total:6});
// pressure
const p=I.pressure([[0,0,0,0,0,'10',0,0,0,'6'],[0,0,0,0,0,'10',0,0,0,'4']]);near(p.buyPct,50);near(p.sellPct,50);
assert.strictEqual(I.pressure([]),null);
// swings
const s=I.swings([1,2,3,9,3,2,1,2,3],[1,0.5,2,3,2,1,0,1,2],2);assert.strictEqual(s.swingHigh,9);assert.strictEqual(s.swingLow,0);
// --- PULSE signal levels ---
near(I.smaLast([1,2,3,4],2),3.5);assert.strictEqual(I.smaLast([1],2),null);
assert.deepStrictEqual(I.closedOnly([[0,0,0,0,0,0,99],[0,0,0,0,0,0,200]],150).length,1);
const upc=Array.from({length:300},(_,i)=>100+i);let l1=I.s1Levels(upc,50,300);assert.ok(l1.entry&&!l1.exit);near(l1.smaFast,374.5);near(l1.smaSlow,249.5);
l1=I.s1Levels(upc.slice().reverse(),50,300);assert.ok(!l1.entry&&l1.exit);assert.strictEqual(I.s1Levels(upc.slice(1),50,300),null);
// above slow but fast<slow -> no entry
const mix=[...new Array(250).fill(100),...new Array(50).fill(90)];mix[299]=200;l1=I.s1Levels(mix,50,300);assert.ok(!l1.entry&&l1.exit);
{const h=[5,6,7,8,9],l=[1,2,3,4,5],c=[3,4,5,6,10];const r=I.s3Levels(h,l,c,3,2);assert.strictEqual(r.hi,8);assert.ok(r.entry);assert.strictEqual(r.lo,3);assert.strictEqual(r.nextHi,9);assert.strictEqual(r.nextLo,4);
 const r2=I.s3Levels(h,l,[3,4,5,6,2.5],3,2);assert.ok(!r2.entry&&r2.exit);assert.strictEqual(I.s3Levels([1],[1],[1],3,2),null)}
const NOW=1e12;
assert.strictEqual(I.pulseAction({position:{entry_ts:NOW-3600e3,entry_px:1},signal:{}},NOW).action,'COMPRAR');
assert.strictEqual(I.pulseAction({position:{entry_ts:NOW-5*3600e3,entry_px:1},signal:{exit:false}},NOW).action,'MANTENER');
assert.strictEqual(I.pulseAction({position:{entry_ts:NOW-5*3600e3},signal:{exit:true}},NOW).action,'VENDER');
assert.strictEqual(I.pulseAction({position:null,signal:{}},NOW).action,'ESPERAR');
assert.strictEqual(I.pulseAction({position:null,signal:{}},NOW,true).action,'VENDER');
console.log('indicators.test.js: all tests passed');
