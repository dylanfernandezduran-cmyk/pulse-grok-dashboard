const assert=require('node:assert');const S=require('../senales_rule.js');
const mk=(cs,tbr=0.5)=>cs.map((c,i)=>({o:i?cs[i-1]:c,h:c,l:c,c,v:10,tb:10*tbr}));
const up=Array.from({length:60},(_,i)=>100+i),dn=up.slice().reverse();
let p=S.predict(mk(up,0.7));assert.strictEqual(p.dir,'UP');assert.strictEqual(p.score,3);
p=S.predict(mk(dn,0.3));assert.strictEqual(p.dir,'DOWN');assert.strictEqual(p.score,-3);
assert.strictEqual(S.predict(mk(up).slice(0,21)),null);
// taker sin dato => voto 0
p=S.predict(mk(up).map(c=>({...c,tb:null})));assert.strictEqual(p.votes.taker,0);
// empate => dirección última vela
const flat=new Array(40).fill(100).map(c=>({o:100,h:100,l:100,c:100,v:1,tb:0.5}));
flat[39]={o:99,h:100,l:99,c:100,v:1,tb:0.5};assert.strictEqual(S.predict(flat).dir,'UP');
flat[39]={o:101,h:101,l:100,c:100,v:1,tb:0.5};assert.strictEqual(S.predict(flat).dir,'DOWN');
// tendencia alcista + ventas agresivas: 2 votos a favor, 1 en contra => UP
p=S.predict(mk(up,0.2));assert.strictEqual(p.dir,'UP');assert.strictEqual(p.score,1);
// outcome
assert.strictEqual(S.outcome({o:1,c:2}),'UP');assert.strictEqual(S.outcome({o:2,c:1}),'DOWN');assert.strictEqual(S.outcome({o:1,c:1}),null);
// backtest: tendencia perfecta => 100%
const bt=S.backtest(mk(Array.from({length:120},(_,i)=>100+i),0.7));assert.strictEqual(bt.acc,100);assert.ok(bt.n>0);
// fromBinance
const k=S.fromBinance([1,'1','2','0.5','1.5','10',2,'0',0,'6','0','0']);assert.strictEqual(k.tb,6);assert.strictEqual(k.c,1.5);
console.log('senales tests OK');
