/**
 * HEX — Chart Engine (Canvas-based, no external deps)
 * Renders: Candlestick, Line/Area, Bar, Sparkline charts
 */

class HEXChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      padding: { top: 20, right: 60, bottom: 40, left: 70 },
      colors: {
        up: '#00ff88', down: '#ff3355', grid: 'rgba(30,30,48,0.8)',
        text: '#555577', border: '#1e1e30', area: 'rgba(0,255,136,0.08)',
        line: '#00ff88', blue: '#4d9fff', purple: '#a855f7',
      },
      font: '10px JetBrains Mono, monospace',
      ...options
    };
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;
    const W = parent ? parent.clientWidth || parent.getBoundingClientRect().width || 600 : 600;
    const H = this.canvas.clientHeight || parseInt(this.canvas.style.height) || 300;
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.ctx.scale(dpr, dpr);
    this.W = W;
    this.H = H;
  }

  get pad() { return this.options.padding; }
  get plotW() { return this.W - this.pad.left - this.pad.right; }
  get plotH() { return this.H - this.pad.top - this.pad.bottom; }

  clear() {
    this.ctx.clearRect(0, 0, this.W, this.H);
  }

  drawGrid(yMin, yMax, xCount = 5, yCount = 5) {
    const ctx = this.ctx;
    ctx.strokeStyle = this.options.colors.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 4]);
    ctx.font = this.options.font;
    ctx.fillStyle = this.options.colors.text;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yCount; i++) {
      const y = this.pad.top + (this.plotH / yCount) * i;
      const val = yMax - ((yMax - yMin) / yCount) * i;
      ctx.beginPath();
      ctx.moveTo(this.pad.left, y);
      ctx.lineTo(this.pad.left + this.plotW, y);
      ctx.stroke();
      ctx.fillText('$' + val.toFixed(2), this.pad.left - 6, y);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = this.options.colors.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.pad.left, this.pad.top, this.plotW, this.plotH);
  }

  scaleX(i, total) { return this.pad.left + (i / (total - 1)) * this.plotW; }
  scaleY(val, min, max) { return this.pad.top + this.plotH - ((val - min) / (max - min)) * this.plotH; }

  drawCandlestick(data) {
    if (!data || data.length === 0) return;
    this.clear();
    const prices = data.flatMap(d => [d.high, d.low]);
    const yMin = Math.min(...prices) * 0.998;
    const yMax = Math.max(...prices) * 1.002;
    this.drawGrid(yMin, yMax);

    const ctx = this.ctx;
    const candleW = Math.max(2, (this.plotW / data.length) * 0.6);
    const step = this.plotW / data.length;

    // Draw date labels (every nth candle)
    ctx.font = this.options.font;
    ctx.fillStyle = this.options.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelEvery = Math.max(1, Math.floor(data.length / 6));
    data.forEach((d, i) => {
      if (i % labelEvery === 0) {
        const x = this.pad.left + i * step + step / 2;
        const dateStr = d.date ? d.date.slice(5) : ''; // MM-DD
        ctx.fillText(dateStr, x, this.pad.top + this.plotH + 6);
      }
    });

    // Draw candles
    data.forEach((d, i) => {
      const x = this.pad.left + i * step + step / 2;
      const openY  = this.scaleY(d.open,  yMin, yMax);
      const closeY = this.scaleY(d.close, yMin, yMax);
      const highY  = this.scaleY(d.high,  yMin, yMax);
      const lowY   = this.scaleY(d.low,   yMin, yMax);
      const up = d.close >= d.open;
      const color = up ? this.options.colors.up : this.options.colors.down;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      ctx.fillStyle = up ? color : color;
      ctx.globalAlpha = up ? 0.9 : 0.85;
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(Math.abs(closeY - openY), 1);
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
      ctx.globalAlpha = 1;
    });
  }

  drawLine(data, field = 'close', color = null) {
    if (!data || data.length === 0) return;
    this.clear();
    const vals = data.map(d => d[field]);
    const yMin = Math.min(...vals) * 0.995;
    const yMax = Math.max(...vals) * 1.005;
    this.drawGrid(yMin, yMax);

    const ctx = this.ctx;
    const lineColor = color || this.options.colors.line;
    const step = this.plotW / (data.length - 1);

    // Area fill
    const grad = ctx.createLinearGradient(0, this.pad.top, 0, this.pad.top + this.plotH);
    grad.addColorStop(0, lineColor.replace(')', ', 0.25)').replace('rgb', 'rgba'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = this.pad.left + i * step;
      const y = this.scaleY(d[field], yMin, yMax);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(this.pad.left + this.plotW, this.pad.top + this.plotH);
    ctx.lineTo(this.pad.left, this.pad.top + this.plotH);
    ctx.closePath();
    ctx.fillStyle = this.options.colors.area;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    data.forEach((d, i) => {
      const x = this.pad.left + i * step;
      const y = this.scaleY(d[field], yMin, yMax);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Latest value dot
    const lastX = this.pad.left + (data.length - 1) * step;
    const lastY = this.scaleY(data[data.length - 1][field], yMin, yMax);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    // Date labels
    ctx.font = this.options.font;
    ctx.fillStyle = this.options.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelEvery = Math.max(1, Math.floor(data.length / 6));
    data.forEach((d, i) => {
      if (i % labelEvery === 0) {
        const x = this.pad.left + i * step;
        ctx.fillText(d.date ? d.date.slice(5) : '', x, this.pad.top + this.plotH + 6);
      }
    });
  }

  drawSparkline(canvas, values, color = '#00ff88', filled = true) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const min = Math.min(...values), max = Math.max(...values);
    const step = W / (values.length - 1);
    const scaleY = (v) => H - ((v - min) / (max - min || 1)) * H * 0.8 - H * 0.1;

    ctx.beginPath();
    values.forEach((v, i) => { i === 0 ? ctx.moveTo(0, scaleY(v)) : ctx.lineTo(i * step, scaleY(v)); });
    if (filled) {
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, color + '40'); g.addColorStop(1, color + '00');
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.beginPath();
    values.forEach((v, i) => { i === 0 ? ctx.moveTo(0, scaleY(v)) : ctx.lineTo(i * step, scaleY(v)); });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
  }

  drawBar(data, labelField, valueField, color = '#00ff88') {
    if (!data || data.length === 0) return;
    this.clear();
    const vals = data.map(d => d[valueField]);
    const maxVal = Math.max(...vals);
    const ctx = this.ctx;
    const barW = this.plotW / data.length * 0.7;
    const step = this.plotW / data.length;

    data.forEach((d, i) => {
      const x = this.pad.left + i * step + step * 0.15;
      const barH = (d[valueField] / maxVal) * this.plotH;
      const y = this.pad.top + this.plotH - barH;
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color); grad.addColorStop(1, color + '40');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = this.options.colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = d[labelField];
      ctx.fillText(label.length > 6 ? label.slice(0, 6) : label, x + barW / 2, this.pad.top + this.plotH + 4);
    });
  }

  drawProjection(baseIncome, growthRate, discountRate, years) {
    this.clear();
    const data = [];
    for (let t = 0; t <= years; t++) {
      const future = baseIncome * Math.pow(1 + growthRate, t);
      const pv = future / Math.pow(1 + discountRate, t);
      data.push({ year: t, nominal: future, pv: pv });
    }
    const maxVal = Math.max(...data.map(d => d.nominal));
    const minVal = 0;
    this.drawGrid(minVal, maxVal);

    const ctx = this.ctx;
    const step = this.plotW / (data.length - 1);

    // Nominal line
    ctx.beginPath();
    ctx.strokeStyle = this.options.colors.blue;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    data.forEach((d, i) => {
      const x = this.pad.left + i * step;
      const y = this.scaleY(d.nominal, minVal, maxVal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // PV line with area
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = this.pad.left + i * step;
      const y = this.scaleY(d.pv, minVal, maxVal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = this.options.colors.up;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill under PV
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = this.pad.left + i * step;
      const y = this.scaleY(d.pv, minVal, maxVal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(this.pad.left + this.plotW, this.pad.top + this.plotH);
    ctx.lineTo(this.pad.left, this.pad.top + this.plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,255,136,0.07)';
    ctx.fill();

    // Year labels
    ctx.font = this.options.font;
    ctx.fillStyle = this.options.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelEvery = Math.ceil(years / 6);
    data.forEach((d, i) => {
      if (i % labelEvery === 0) {
        ctx.fillText('Y' + d.year, this.pad.left + i * step, this.pad.top + this.plotH + 6);
      }
    });

    // Legend
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.options.colors.up;
    ctx.fillText('● PV (Discounted)', this.pad.left + 4, this.pad.top + 4);
    ctx.fillStyle = this.options.colors.blue;
    ctx.fillText('⋯ Nominal', this.pad.left + 4, this.pad.top + 18);
  }
}

window.HEXChart = HEXChart;
