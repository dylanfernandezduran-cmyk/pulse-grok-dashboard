// PULSE Señales: regla de predicción transparente (browser + node). Funciones puras.
(function(root){
function emaLast(v,n){if(v.length<n)return null;const k=2/(n+1);let e=v.slice(0,n).reduce((a,b)=>a+b,0)/n;for(let i=n;i<v.length;i++)e=v[i]*k+e*(1-k);return e}
function rsi(v,n=14){if(v.length<=n)return null;let g=0,l=0;for(let i=1;i<=n;i++){const d=v[i]-v[i-1];if(d>0)g+=d;else l-=d}g/=n;l/=n;for(let i=n+1;i<v.length;i++){const d=v[i]-v[i-1];g=(g*(n-1)+(d>0?d:0))/n;l=(l*(n-1)+(d<0?-d:0))/n}if(l===0)return g===0?50:100;return 100-100/(1+g/l)}
// Regla: 3 votos (+1 sube / -1 baja / 0 neutro)
//  1) EMA9 > EMA21 => +1 ; < => -1
//  2) RSI14 > 55 => +1 ; < 45 => -1 ; si no 0
//  3) Ratio taker-buy de la última vela cerrada > 0.52 => +1 ; < 0.48 => -1 ; si no 0 (sin dato => 0)
// Suma > 0 => UP ; < 0 => DOWN ; empate => dirección de la última vela cerrada (close>=open => UP).
// candles: [{o,h,l,c,v,tb}] cerradas, la más antigua primero. Requiere >= 22 velas.
function predict(candles){
  if(!candles||candles.length<22)return null;
  const cl=candles.map(x=>x.c),last=candles[candles.length-1];
  const e9=emaLast(cl,9),e21=emaLast(cl,21),r=rsi(cl,14);
  const vEma=e9>e21?1:e9<e21?-1:0;
  const vRsi=r==null?0:r>55?1:r<45?-1:0;
  const tr=(last.tb!=null&&last.v>0)?last.tb/last.v:null;
  const vTk=tr==null?0:tr>0.52?1:tr<0.48?-1:0;
  const score=vEma+vRsi+vTk;
  const dir=score>0?'UP':score<0?'DOWN':(last.c>=last.o?'UP':'DOWN');
  return {dir,score,ema9:e9,ema21:e21,rsi:r,taker:tr,votes:{ema:vEma,rsi:vRsi,taker:vTk}};
}
// Resultado real de una vela: UP si cierre > apertura, DOWN si <, null si igual (no cuenta).
function outcome(c){return c.c>c.o?'UP':c.c<c.o?'DOWN':null}
// Backtest: para cada i, predice con velas [0..i] y evalúa vela i+1.
function backtest(candles,warm=60){let hit=0,miss=0;for(let i=Math.max(warm,21);i<candles.length-1;i++){const p=predict(candles.slice(Math.max(0,i-299),i+1)),o=outcome(candles[i+1]);if(!p||!o)continue;p.dir===o?hit++:miss++}const n=hit+miss;return {hit,miss,n,acc:n?100*hit/n:null}}
// Binance kline -> vela
function fromBinance(k){return {t:+k[0],T:+k[6],o:+k[1],h:+k[2],l:+k[3],c:+k[4],v:+k[5],tb:+k[9]}}
const api={emaLast,rsi,predict,outcome,backtest,fromBinance};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SR=api;
})(typeof self!=='undefined'?self:this);
