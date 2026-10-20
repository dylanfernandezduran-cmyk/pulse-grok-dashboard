# PULSE GROK dashboard
Static page; reads the box snapshot from a GitHub gist client-side every 60s. Paper trading only. No secrets.

## Terminal (2026-10-20)
`terminal.html` — terminal BTC informativo (PAPER): gráfico TradingView, precio/24h (Binance data-api, respaldo Coinbase), tendencia multi-TF (EMA20/50, RSI14), presión taker, niveles clave y estado PULSE desde el gist. Indicadores en `indicators.js`; tests: `node tests/indicators.test.js`. No es señal de trading.
