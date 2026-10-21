# PULSE GROK dashboard
Static page; reads the box snapshot from a GitHub gist client-side every 60s. Paper trading only. No secrets.

## Terminal (2026-10-20)
`terminal.html` — terminal BTC informativo (PAPER): gráfico TradingView, precio/24h (Binance data-api, respaldo Coinbase), tendencia multi-TF (EMA20/50, RSI14), presión taker, niveles clave y estado PULSE desde el gist. Indicadores en `indicators.js`; tests: `node tests/indicators.test.js`. No es señal de trading.

## Señales (`senales.html`) — PAPER / educativo

Página móvil (instalable con "Añadir a pantalla de inicio": `manifest.json`, `icon-*.png`, `sw.js` mínimo sin caché) que predice SUBE/BAJA para la vela BTCUSDT de 5m o 15m en curso (intervalo guardado en localStorage). Datos: `data-api.binance.vision` (respaldo Coinbase Exchange, sin dato taker).

**Regla** (`senales_rule.js`, con velas cerradas): votos EMA9 vs EMA21 (±1), RSI14 >55 / <45 (±1, si no 0), ratio taker-buy de la última vela >0.52 / <0.48 (±1, si no 0). Suma >0 → SUBE, <0 → BAJA, empate → dirección de la última vela. Cada predicción se califica sola al cerrar la vela (acierto si cierre vs apertura coincide; cierre = apertura no cuenta) y se guarda en localStorage. La página muestra además un backtest de la misma regla sobre las últimas 1000 velas. ~50% = moneda al aire; con comisiones hace falta >~53-55%. Avisos del navegador + sonido opcionales. No es consejo financiero, sin dinero real.

Tests: `node tests/senales.test.js`.
