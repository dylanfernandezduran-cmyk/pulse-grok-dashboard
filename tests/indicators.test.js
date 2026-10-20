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
console.log('indicators.test.js: all tests passed');
