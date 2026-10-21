// PULSE Señales: UI. Lógica de la regla en senales_rule.js
(function(){
const $=id=>document.getElementById(id);
const MS={'5m':300000,'15m':900000},CB={'5m':300,'15m':900};
let iv=localStorage.getItem('senales_iv');if(!MS[iv])iv='5m';
let cur=null,loading=false,src='';
const K=()=>'senales_preds_'+iv;
const load=()=>{try{return JSON.parse(localStorage.getItem(K()))||[]}catch(e){return []}};
const save=a=>localStorage.setItem(K(),JSON.stringify(a.slice(-500)));
const fmt=n=>n==null?'—':n.toLocaleString('es-MX',{maximumFractionDigits:2});
const lbl=d=>d==='UP'?'SUBE ▲':'BAJA ▼';
function tfetch(u,ms){const c=typeof AbortController!=='undefined'?new AbortController():null;const t=setTimeout(function(){if(c)c.abort()},ms||9000);
  return fetch(u,{cache:'no-store',signal:c?c.signal:undefined}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return r.json()},function(e){clearTimeout(t);throw e})}
const SRC=[
 ['Binance',async()=>(await tfetch(`https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=${iv}&limit=1000`)).map(SR.fromBinance)],
 ['Coinbase',async()=>{const g=CB[iv];let out=[],end=Math.floor(Date.now()/1000);
   for(let p=0;p<4;p++){const st=end-300*g;const a=await tfetch(`https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=${g}&start=${new Date(st*1000).toISOString()}&end=${new Date(end*1000).toISOString()}`);if(!a.length)break;out=a.concat(out);end=st}
   return out.map(x=>({t:x[0]*1000,T:x[0]*1000+MS[iv]-1,o:+x[3],h:+x[2],l:+x[1],c:+x[4],v:+x[5],tb:null}))}],
 ['Kraken',async()=>{const j=await tfetch(`https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=${MS[iv]/60000}`);const k=Object.keys(j.result).filter(x=>x!=='last')[0];
   return j.result[k].map(x=>({t:x[0]*1000,T:x[0]*1000+MS[iv]-1,o:+x[1],h:+x[2],l:+x[3],c:+x[4],v:+x[6],tb:null}))}],
 ['Bybit',async()=>{const j=await tfetch(`https://api.bybit.com/v5/market/kline?category=spot&symbol=BTCUSDT&interval=${MS[iv]/60000}&limit=1000`);
   return j.result.list.map(x=>({t:+x[0],T:+x[0]+MS[iv]-1,o:+x[1],h:+x[2],l:+x[3],c:+x[4],v:+x[5],tb:null}))}]
];
async function fetchCandles(){const errs=[];
  for(const [name,fn] of SRC){try{const a=await fn();const m=new Map();a.forEach(c=>{if(isFinite(c.c))m.set(c.t,c)});const out=[...m.values()].sort((x,y)=>x.t-y.t).slice(-1000);
      if(out.length<30)throw new Error('pocas velas');src=name+(name==='Binance'?'':' (sin taker)');return out}
    catch(e){console.warn(name,e);errs.push(name+': '+(e&&e.name==='AbortError'?'timeout':(e&&e.message||e)))}}
  throw new Error(errs.join(' · '))}
async function refresh(){
  if(loading)return;loading=true;const myIv=iv;
  try{
    const all=await fetchCandles();if(myIv!==iv)return;const now=Date.now();
    const closed=all.filter(c=>c.T<now),open=all.find(c=>c.T>=now);
    const tOpen=closed.length?closed[closed.length-1].T+1:null;
    // calificar pendientes
    const preds=load(),byT=new Map(closed.map(c=>[c.t,c]));
    preds.forEach(p=>{if(p.res==null){const c=byT.get(p.t);if(c){const o=SR.outcome(c);p.res=o==null?'flat':(o===p.dir?'hit':'miss')}}});
    // nueva predicción para la vela en curso
    const pr=SR.predict(closed.slice(-300));
    if(pr&&tOpen&&!preds.some(p=>p.t===tOpen)){preds.push({t:tOpen,dir:pr.dir,score:pr.score,res:null});notify(pr)}
    save(preds);
    cur={t:tOpen,T:tOpen+MS[iv]-1,pr,open};
    const bt=SR.backtest(closed);
    $('btacc').textContent=bt.acc==null?'—':bt.acc.toFixed(1)+'%';$('btacc').className=bt.acc>=55?'up':bt.acc<50?'dn':'am';$('btn').textContent=bt.n;
    $('px').textContent=open?'$'+fmt(open.c):(closed.length?'$'+fmt(closed[closed.length-1].c):'—');$('src').textContent=src;
    $('status').style.display='none';$('upd').textContent='Act. '+new Date().toLocaleTimeString('es-MX');
    render();
  }catch(e){console.error(e);$('upd').textContent='Error de datos';if(!cur){const d=$('dir');d.textContent='Sin datos';d.className='dir gray err';}$('status').textContent='⚠ No se pudieron cargar velas ('+(e&&e.message||e)+'). Reintento en 30 s.';$('status').style.display='block'}
  finally{loading=false}
}
function render(){
  document.querySelectorAll('.ivsel button').forEach(b=>b.classList.toggle('on',b.dataset.iv===iv));$('ivl').textContent=iv;
  if(cur&&cur.pr){const d=$('dir');d.textContent=lbl(cur.pr.dir);d.className='dir '+cur.pr.dir;
    $('tgt').textContent=`Predicción vela ${iv} de ${new Date(cur.t).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})} (cierre vs apertura)`;
    const v=cur.pr.votes,s=x=>x>0?'+1':x<0?'−1':'0';
    $('votes').innerHTML=`<span>EMA9/21 ${s(v.ema)}</span><span>RSI ${cur.pr.rsi==null?'—':cur.pr.rsi.toFixed(1)} ${s(v.rsi)}</span><span>Taker ${cur.pr.taker==null?'—':cur.pr.taker.toFixed(2)} ${s(v.taker)}</span><span>Total ${cur.pr.score>0?'+':''}${cur.pr.score}</span>`}
  const ps=load(),h=ps.filter(p=>p.res==='hit').length,m=ps.filter(p=>p.res==='miss').length;
  $('hits').textContent=h;$('miss').textContent=m;$('acc').textContent=h+m?(100*h/(h+m)).toFixed(1)+'%':'—';
  $('hist').innerHTML=ps.filter(p=>p.res==='hit'||p.res==='miss').slice(-60).map(p=>`<i class="${p.res[0]}" title="${new Date(p.t).toLocaleString('es-MX')} ${lbl(p.dir)}"></i>`).join('');
}
function tick(){
  if(!cur||!cur.t)return;const left=cur.T+1-Date.now();
  if(left<=-3000){refresh();return}
  const s=Math.max(0,Math.ceil(left/1000));$('cd').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}
// avisos
let actx=null;
function beep(up){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=up?880:440;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.2,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.5);o.start();o.stop(actx.currentTime+.5)}catch(e){}}
function notify(pr){
  if(localStorage.getItem('senales_notif')!=='1')return;beep(pr.dir==='UP');
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const title=`BTC ${iv}: ${lbl(pr.dir)} (PAPER)`,opt={body:`Puntaje ${pr.score}. Educativo, no es consejo financiero.`,icon:'icon-192.png',tag:'senal'};
  if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,opt));else try{new Notification(title,opt)}catch(e){}
}
function notifBtn(){$('notif').textContent=localStorage.getItem('senales_notif')==='1'?'🔕 Desactivar avisos':'🔔 Activar avisos + sonido'}
$('notif').onclick=async()=>{
  if(localStorage.getItem('senales_notif')==='1'){localStorage.setItem('senales_notif','0');notifBtn();return}
  localStorage.setItem('senales_notif','1');beep(true);
  if('Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission()}catch(e){}}
  notifBtn();
};
$('reset').onclick=()=>{if(confirm('¿Borrar el marcador de '+iv+'?')){localStorage.removeItem(K());render()}};
document.querySelectorAll('.ivsel button').forEach(b=>b.onclick=()=>{iv=b.dataset.iv;localStorage.setItem('senales_iv',iv);cur=null;$('dir').textContent='Cargando…';$('dir').className='dir gray';$('votes').innerHTML='';render();loading=false;refresh()});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js?v=2',{updateViaCache:'none'}).catch(()=>{});
notifBtn();render();refresh();setInterval(tick,1000);setInterval(refresh,30000);
})();
