// PULSE Terminal indicator math (browser + node). Pure functions, no I/O.
(function(root){
function ema(v,n){if(!v||v.length<n)return [];const k=2/(n+1);let e=v.slice(0,n).reduce((a,b)=>a+b,0)/n;const o=new Array(n-1).fill(null);o.push(e);for(let i=n;i<v.length;i++){e=v[i]*k+e*(1-k);o.push(e)}return o}
function rsi(v,n=14){if(!v||v.length<=n)return null;let g=0,l=0;for(let i=1;i<=n;i++){const d=v[i]-v[i-1];if(d>0)g+=d;else l-=d}g/=n;l/=n;for(let i=n+1;i<v.length;i++){const d=v[i]-v[i-1];g=(g*(n-1)+(d>0?d:0))/n;l=(l*(n-1)+(d<0?-d:0))/n}if(l===0)return g===0?50:100;return 100-100/(1+g/l)}
// BULLISH if EMA20>EMA50 by > tol (fraction), BEARISH if below by > tol, else NEUTRAL
function trend(v,tol=0.0005){const a=ema(v,20),b=ema(v,50);if(!b.length)return 'NEUTRAL';const x=a[a.length-1],y=b[b.length-1],d=(x-y)/y;return d>tol?'BULLISH':d<-tol?'BEARISH':'NEUTRAL'}
function alignment(ts){const c={BULLISH:0,BEARISH:0,NEUTRAL:0};ts.forEach(t=>c[t]=(c[t]||0)+1);return {bull:c.BULLISH,bear:c.BEARISH,neutral:c.NEUTRAL,total:ts.length}}
// klines: Binance arrays; field 5 = volume, field 9 = taker buy base volume
function pressure(kl){let v=0,b=0;kl.forEach(k=>{v+=+k[5];b+=+k[9]});return v>0?{buyPct:100*b/v,sellPct:100*(v-b)/v}:null}
function swings(highs,lows,w=3){let sh=null,sl=null;for(let i=highs.length-1-w;i>=w;i--){const h=highs.slice(i-w,i+w+1),l=lows.slice(i-w,i+w+1);if(sh==null&&highs[i]===Math.max(...h))sh=highs[i];if(sl==null&&lows[i]===Math.min(...l))sl=lows[i];if(sh!=null&&sl!=null)break}return {swingHigh:sh,swingLow:sl}}

// ---- PULSE paper-strategy signal levels (replicates pulse_v9/bt.py + forward/fwd.py) ----
// closedOnly: Binance 4h klines -> only bars whose closeTime < now (fwd.py acts on closed 4h bars only)
function closedOnly(kl,now){return kl.filter(k=>+k[6]<now)}
function smaLast(v,n){if(!v||v.length<n)return null;let s=0;for(let i=v.length-n;i<v.length;i++)s+=v[i];return s/n}
// S1_trend(fast,slow): entry=(SMAf>SMAs)&(c>SMAs); exit=SMAf<SMAs  (evaluated on last closed bar)
function s1Levels(closes,fast=50,slow=300){const f=smaLast(closes,fast),s=smaLast(closes,slow);if(f==null||s==null)return null;const c=closes[closes.length-1];
 return {smaFast:f,smaSlow:s,close:c,entry:f>s&&c>s,exit:f<s}}
// S3_breakout(n,m): entry=c>max(h[-n-1..-2]); exit=c<min(l[-m-1..-2]) on last closed bar.
// next* = levels the NEXT closed bar must cross (window includes the latest closed bar).
function s3Levels(highs,lows,closes,n=100,m=40){const L=closes.length;if(L<Math.max(n,m)+1)return null;
 const mx=(a,i,j)=>Math.max(...a.slice(i,j)),mn=(a,i,j)=>Math.min(...a.slice(i,j));const c=closes[L-1];
 const hi=mx(highs,L-1-n,L-1),lo=mn(lows,L-1-m,L-1);
 return {close:c,hi,lo,entry:c>hi,exit:c<lo,nextHi:mx(highs,L-n,L),nextLo:mn(lows,L-m,L)}}
// Decide PULSE action. st = gist strategy object; lv = levels; now ms; prev = previous in_position (bool|undefined)
function pulseAction(st,now,prev){const BAR=4*3600e3;if(!st)return {action:'NA'};const pos=st.position,sig=st.signal||{};
 if(pos&&pos.entry_ts&&now-pos.entry_ts<BAR)return {action:'COMPRAR',ts:pos.entry_ts,px:pos.entry_px};
 if(pos)return {action:sig.exit?'VENDER':'MANTENER',px:pos.entry_px};
 if(prev===true)return {action:'VENDER'};
 return {action:'ESPERAR'}}
const api={ema,rsi,trend,alignment,pressure,swings,closedOnly,smaLast,s1Levels,s3Levels,pulseAction};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PI=api;
})(this);
