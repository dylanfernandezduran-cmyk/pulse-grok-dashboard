(function(){
const B='https://data-api.binance.vision/api/v3',O='dylanfernandezduran-cmyk',G='a2aef1f302ecb2680905497477cd051e';
const TFS=['1m','5m','15m','1h','4h','1d'],$=id=>document.getElementById(id);
const f=(x,d=2)=>x==null||isNaN(x)?'—':Number(x).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=x=>x==null||isNaN(x)?'—':(x>0?'+':'')+f(x)+'%';const cls=x=>x>0?'up':x<0?'dn':'mut';
const NA='<span class="mut">no disponible</span>';
async function J(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error(u+' '+r.status);return r.json()}
function tv(){const s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';s.async=true;
 s.text=JSON.stringify({autosize:true,symbol:'BINANCE:BTCUSDT',interval:'15',timezone:'America/Mexico_City',theme:'dark',style:'1',locale:'es',allow_symbol_change:true,backgroundColor:'#14171c',support_host:'https://www.tradingview.com'});
 return}
function spark(v){if(!v.length)return '';const mn=Math.min(...v),mx=Math.max(...v),w=120,h=26,r=mx-mn||1;
 const p=v.map((x,i)=>`${(i/(v.length-1)*w).toFixed(1)},${(h-(x-mn)/r*h).toFixed(1)}`).join(' ');const c=v.at(-1)>=v[0]?'#1fd17a':'#f0475c';
 return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline fill="none" stroke="${c}" stroke-width="1.5" points="${p}"/></svg>`}
async function ticker(){
 try{const t=await J(`${B}/ticker/24hr?symbol=BTCUSDT`);$('px').textContent='$'+f(+t.lastPrice);
  $('chg').innerHTML=`<span class="${cls(+t.priceChangePercent)}">${pct(+t.priceChangePercent)} (${f(+t.priceChange)}) 24h</span>`;
  $('h24').textContent='$'+f(+t.highPrice);$('l24').textContent='$'+f(+t.lowPrice);$('src').textContent='Fuente: Binance BTCUSDT';return}
 catch(e){console.warn('binance ticker',e)}
 try{const [t,s]=await Promise.all([J('https://api.exchange.coinbase.com/products/BTC-USD/ticker'),J('https://api.exchange.coinbase.com/products/BTC-USD/stats')]);
  const ch=(+t.price-+s.open)/+s.open*100;$('px').textContent='$'+f(+t.price);$('chg').innerHTML=`<span class="${cls(ch)}">${pct(ch)} 24h</span>`;
  $('h24').textContent='$'+f(+s.high);$('l24').textContent='$'+f(+s.low);$('src').textContent='Fuente: Coinbase BTC-USD (respaldo)'}
 catch(e){$('px').innerHTML=NA;$('chg').textContent='';$('h24').innerHTML=NA;$('l24').innerHTML=NA;$('src').textContent='Sin fuente de precio'}}
async function mtf(){const res=await Promise.all(TFS.map(tf=>J(`${B}/klines?symbol=BTCUSDT&interval=${tf}&limit=200`).catch(()=>null)));
 const tr=[];$('mtf').innerHTML=res.map((k,i)=>{if(!k)return `<tr><td>${TFS[i]}</td><td colspan="4">${NA}</td></tr>`;
  const c=k.map(x=>+x[4]),t=PI.trend(c),r=PI.rsi(c);tr.push(t);
  return `<tr><td>${TFS[i]}</td><td><span class="tag ${t}">${{BULLISH:'ALCISTA',BEARISH:'BAJISTA',NEUTRAL:'NEUTRAL'}[t]}</span></td><td class="${r>70?'dn':r<30?'up':''}">${f(r,1)}</td><td>$${f(c.at(-1))}</td><td>${spark(c.slice(-50))}</td></tr>`}).join('');
 const a=PI.alignment(tr);$('align').innerHTML=tr.length?`<span class="up">${a.bull}/${a.total} alcistas</span> · <span class="dn">${a.bear} bajistas</span> · <span class="mut">${a.neutral} neutrales</span>`:NA;
 const m=res[0];if(m){const p=PI.pressure(m.slice(-60));if(p){$('gbar').style.width=p.buyPct.toFixed(1)+'%';$('buy').textContent=f(p.buyPct,1)+'%';$('sell').textContent=f(p.sellPct,1)+'%'}}
 else{$('buy').innerHTML=NA;$('sell').innerHTML=NA}
 const h=res[3];if(h){const s=PI.swings(h.map(x=>+x[2]),h.map(x=>+x[3]),3);$('sh').textContent=s.swingHigh==null?'—':'$'+f(s.swingHigh);$('sl').textContent=s.swingLow==null?'—':'$'+f(s.swingLow)}
 else{$('sh').innerHTML=NA;$('sl').innerHTML=NA}}
async function pulse(){try{let s;try{s=await J(`https://gist.githubusercontent.com/${O}/${G}/raw/pulse_state.json?t=${Date.now()}`)}
  catch(e){const g=await J('https://api.github.com/gists/'+G);s=JSON.parse(g.files['pulse_state.json'].content)}
  const b=s.btc_fwd;if(!b||b.error)throw new Error('sin btc_fwd');const bh=b.benchmark||{};
  const rows=['S1_trend','S3_breakout'].map(id=>{const st=(b.strategies||[]).find(x=>x.id===id);if(!st)return `<div class="kv"><span>${id}</span>${NA}</div>`;const p=st.position;
   return `<div class="kv"><span><b>${id==='S1_trend'?'S1 Tendencia':'S3 Ruptura'}</b></span><span>$${f(st.balance)} <span class="${cls(st.roi)}">${pct(st.roi)}</span></span></div>
   <div class="kv"><span class="mut">Posición</span><span>${p?'LONG @ $'+f(p.entry_px):'FLAT'}</span></div>
   <div class="kv"><span class="mut">vs Buy&amp;Hold</span><span class="${cls(st.vs_bh)}">${st.vs_bh>0?"+":st.vs_bh<0?"−":""}$${f(Math.abs(st.vs_bh))}</span></div>`}).join('');
  $('pulse').innerHTML=rows+`<div class="kv"><span>Buy &amp; Hold</span><span>$${f(bh.equity)} <span class="${cls(bh.roi)}">${pct(bh.roi)}</span></span></div>`;
  const gen=(s.generated_at||(s.box_ms||0)/1000)*1000,age=(Date.now()-gen)/1000;
  $('pfresh').innerHTML=`${age<=240?'<span class="up">● en vivo</span>':'<span class="dn">● desactualizado</span>'} · ${new Date(gen).toLocaleTimeString('es-MX',{timeZone:'America/Mexico_City',hour12:false})} CT · PAPER`}
 catch(e){$('pulse').innerHTML='Estado PULSE '+NA;console.warn(e)}}
const COL={COMPRAR:'green',VENDER:'red',MANTENER:'blue',ESPERAR:'gray',NA:'gray'};
const ct=ms=>new Date(ms).toLocaleString('es-MX',{timeZone:'America/Mexico_City',hour12:false,day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' CT';
let lastAct={};
async function signal(){let s=null,kl=null;
 try{s=await J(`https://gist.githubusercontent.com/${O}/${G}/raw/pulse_state.json?t=${Date.now()}`)}catch(e){try{const g=await J('https://api.github.com/gists/'+G);s=JSON.parse(g.files['pulse_state.json'].content)}catch(e2){}}
 try{kl=PI.closedOnly(await J(`${B}/klines?symbol=BTCUSDT&interval=4h&limit=1000`),Date.now())}catch(e){}
 const b=s&&s.btc_fwd;if(!b||!b.strategies){$('sigS1').innerHTML=$('sigS3').innerHTML='<span class="act">—</span>Estado PULSE '+NA;return}
 const now=Date.now(),gen=(s.generated_at||(s.box_ms||0)/1000)*1000,age=(now-gen)/60000;
 $('sigupd').innerHTML=`última actualización ${ct(gen)} ${age>15?'<span class="dn">· desactualizado</span>':'<span class="up">· al día</span>'}${b.data_ok===false?' <span class="dn">· datos: '+b.data_note+'</span>':''}`;
 const c=kl&&kl.map(k=>+k[4]),h=kl&&kl.map(k=>+k[2]),l=kl&&kl.map(k=>+k[3]);
 for(const id of ['S1_trend','S3_breakout']){const st=b.strategies.find(x=>x.id===id),key=id.slice(0,2),el=$('sig'+key);
  let prev;try{prev=JSON.parse(localStorage.getItem('pulse_pos_'+id))}catch(e){}
  const a=PI.pulseAction(st,now,prev);if(st)try{localStorage.setItem('pulse_pos_'+id,JSON.stringify(!!st.position))}catch(e){}
  const p=st&&st.params||{},sig=st&&st.signal||{};let det='';
  if(id==='S1_trend'){const fa=p.fast||50,sl=p.slow||300,L=c&&PI.s1Levels(c,fa,sl);
   if(L)det=`SMA${fa} $${f(L.smaFast)} · SMA${sl} $${f(L.smaSlow)} · cierre 4h $${f(L.close)}<br>`+(st.position?`Vende si SMA${fa} cruza abajo de SMA${sl} (faltan ${f((L.smaFast-L.smaSlow)/L.smaSlow*100)}%)`:
    L.smaFast>L.smaSlow?`Compra si BTC cierra 4h arriba de $${f(L.smaSlow)}`:`Compra si SMA${fa} cruza arriba de SMA${sl} (diferencia ${f((L.smaFast-L.smaSlow)/L.smaSlow*100)}%) y cierre > SMA${sl}`)}
  else{const n=p.n||100,m=p.m||40,L=c&&PI.s3Levels(h,l,c,n,m);
   if(L)det=`cierre 4h $${f(L.close)} · máx ${n} velas $${f(L.nextHi)} · mín ${m} velas $${f(L.nextLo)}<br>`+(st.position?`Vende si BTC cierra 4h abajo de $${f(L.nextLo)}${st.position.stop?` · stop $${f(st.position.stop)}`:''}`:
    `Compra si BTC cierra 4h arriba de $${f(L.nextHi)} (${f((L.nextHi/L.close-1)*100)}% arriba)`)}
  if(!det)det='Niveles '+NA;
  const extra=a.action==='COMPRAR'?`Compra ${ct(a.ts)} @ $${f(a.px)}<br>`:a.action==='MANTENER'?`LONG desde @ $${f(a.px)}<br>`:a.action==='VENDER'&&a.px?`Salida activada (entrada @ $${f(a.px)})<br>`:'';
  el.className='sig '+COL[a.action];
  el.innerHTML=`<b>${id==='S1_trend'?'S1 Tendencia (50/300)':'S3 Ruptura (100/40)'}</b><span class="act">${a.action==='NA'?'—':a.action}</span>${extra}${det}<div class="mut">vela cerrada ${sig.bar||'—'} UTC${st&&st.paused?' · <span class="dn">PAUSADA</span>':''}</div>`;
  if(lastAct[id]&&lastAct[id]!==a.action)notify(`${id}: ${a.action}`);lastAct[id]=a.action}}
function notify(t){try{if(window.Notification&&Notification.permission==='granted')new Notification('Señal PULSE',{body:t});
 const x=new (window.AudioContext||window.webkitAudioContext)(),o=x.createOscillator();o.connect(x.destination);o.frequency.value=880;o.start();o.stop(x.currentTime+0.3)}catch(e){}}
$('notif').onclick=()=>{if(window.Notification)Notification.requestPermission().then(p=>$('notif').textContent=p==='granted'?'🔔 Avisos activos':'🔕 Avisos bloqueados')};
async function cycle(){await Promise.all([ticker(),mtf(),pulse(),signal()]);$('upd').textContent='Actualizado '+new Date().toLocaleTimeString('es-MX',{timeZone:'America/Mexico_City',hour12:false})+' CT'}
tv();cycle();setInterval(cycle,45000);
})();
