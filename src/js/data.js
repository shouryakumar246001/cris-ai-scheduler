/**
 * HEX — Core Data Engine
 * Simulates: market data, DCF valuations, price ticks, order books, indices
 */

// ===== DCF Valuation Engine (ported from C++) =====
function calculateHumanMarketCap(currentIncome, growthRate, discountRate, careerYears) {
  let marketCap = 0;
  for (let t = 1; t <= careerYears; t++) {
    const futureCF = currentIncome * Math.pow(1 + growthRate, t);
    marketCap += futureCF / Math.pow(1 + discountRate, t);
  }
  return Math.round(marketCap * 100) / 100;
}

// ===== Human Profiles Dataset =====
const HUMAN_PROFILES = [
  { id: 'AERA', name: 'Aera Patel', sector: 'Technology', role: 'AI Research Scientist', income: 280000, growthRate: 0.18, discountRate: 0.09, careerYears: 28, burnRate: 85000, netWorth: 1200000, shares: 1000000, avatar: '👩‍💻', change24h: 3.42, volume: 2845000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'RMKV', name: 'Rohan Mehta', sector: 'Finance', role: 'Hedge Fund Manager', income: 620000, growthRate: 0.12, discountRate: 0.08, careerYears: 22, burnRate: 220000, netWorth: 4500000, shares: 2000000, avatar: '👨‍💼', change24h: 1.87, volume: 5120000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'SVNL', name: 'Savannah Lee', sector: 'Sports', role: 'Pro Tennis Player', income: 1800000, growthRate: 0.08, discountRate: 0.12, careerYears: 12, burnRate: 450000, netWorth: 8200000, shares: 5000000, avatar: '🎾', change24h: -2.15, volume: 12400000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'DVKR', name: 'Dev Kumar', sector: 'Entrepreneurship', role: 'Serial Founder', income: 450000, growthRate: 0.25, discountRate: 0.15, careerYears: 30, burnRate: 180000, netWorth: 2800000, shares: 3000000, avatar: '🚀', change24h: 5.73, volume: 8900000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'MYIN', name: 'Maya Inoue', sector: 'Medicine', role: 'Neurosurgeon', income: 520000, growthRate: 0.07, discountRate: 0.06, careerYears: 25, burnRate: 130000, netWorth: 3100000, shares: 1500000, avatar: '🧠', change24h: 0.92, volume: 1900000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'LCST', name: 'Lucas Torres', sector: 'Entertainment', role: 'Film Director', income: 380000, growthRate: 0.14, discountRate: 0.11, careerYears: 26, burnRate: 150000, netWorth: 1750000, shares: 2500000, avatar: '🎬', change24h: -0.88, volume: 3200000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'PRYA', name: 'Priya Sharma', sector: 'Law', role: 'Corporate Attorney', income: 340000, growthRate: 0.09, discountRate: 0.07, careerYears: 24, burnRate: 110000, netWorth: 1400000, shares: 1200000, avatar: '⚖️', change24h: 2.34, volume: 1500000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'ZNXU', name: 'Zane Xu', sector: 'Technology', role: 'Blockchain Architect', income: 310000, growthRate: 0.20, discountRate: 0.13, careerYears: 32, burnRate: 95000, netWorth: 950000, shares: 1800000, avatar: '⛓️', change24h: 7.21, volume: 4600000, high52w: 0, low52w: 0, verified: false, kycStatus: 'PENDING' },
  { id: 'AMNA', name: 'Amna Al-Rashid', sector: 'Architecture', role: 'Principal Architect', income: 290000, growthRate: 0.08, discountRate: 0.07, careerYears: 20, burnRate: 100000, netWorth: 1100000, shares: 1000000, avatar: '🏛️', change24h: 1.12, volume: 980000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'KOLE', name: 'Kole Osei', sector: 'Sports', role: 'Marathon Runner', income: 850000, growthRate: 0.05, discountRate: 0.10, careerYears: 8, burnRate: 200000, netWorth: 2200000, shares: 4000000, avatar: '🏃', change24h: -1.44, volume: 6800000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'ELNA', name: 'Elena Vasquez', sector: 'Education', role: 'EdTech Founder', income: 195000, growthRate: 0.22, discountRate: 0.12, careerYears: 35, burnRate: 75000, netWorth: 600000, shares: 800000, avatar: '📚', change24h: 4.58, volume: 1200000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
  { id: 'NTSU', name: 'Nathan Suzuki', sector: 'Technology', role: 'Quant Developer', income: 420000, growthRate: 0.16, discountRate: 0.10, careerYears: 29, burnRate: 140000, netWorth: 1800000, shares: 2200000, avatar: '📊', change24h: 2.89, volume: 3100000, high52w: 0, low52w: 0, verified: true, kycStatus: 'VERIFIED' },
];

// Compute market caps and price data
HUMAN_PROFILES.forEach(p => {
  p.marketCap = calculateHumanMarketCap(p.income, p.growthRate, p.discountRate, p.careerYears);
  p.sharePrice = parseFloat((p.marketCap / p.shares * 100).toFixed(2));
  p.high52w = parseFloat((p.sharePrice * (1 + Math.random() * 0.35)).toFixed(2));
  p.low52w = parseFloat((p.sharePrice * (1 - Math.random() * 0.25)).toFixed(2));
  p.peRatio = parseFloat((p.marketCap / p.income).toFixed(1));
  p.earningsYield = parseFloat(((p.income / p.marketCap) * 100).toFixed(2));
});

// ===== Human 50 Index =====
const HUMAN50_INDEX = {
  name: 'HUMAN 50',
  value: 0,
  change: 0,
  changePct: 0,
  constituents: HUMAN_PROFILES.slice(0, 12),
};

function computeIndexValue() {
  const totalMarketCap = HUMAN50_INDEX.constituents.reduce((s, p) => s + p.marketCap, 0);
  HUMAN50_INDEX.value = Math.round(totalMarketCap / 1e4);
  HUMAN50_INDEX.change = Math.round((Math.random() - 0.45) * 120);
  HUMAN50_INDEX.changePct = parseFloat(((HUMAN50_INDEX.change / HUMAN50_INDEX.value) * 100).toFixed(2));
}
computeIndexValue();

// ===== Mutual Funds =====
const MUTUAL_FUNDS = [
  { id: 'tvf', name: 'Tech Visionaries Fund', icon: '💡', sector: 'Technology', nav: 2847.50, change: 3.21, aum: 48500000, holdings: 8, risk: 'High', members: ['AERA', 'ZNXU', 'NTSU', 'DVKR'] },
  { id: 'paf', name: 'Pro Athletes Fund', icon: '🏆', sector: 'Sports', nav: 1920.80, change: -1.02, aum: 92000000, holdings: 12, risk: 'Medium', members: ['SVNL', 'KOLE'] },
  { id: 'mf',  name: 'Medical Minds Fund', icon: '🧬', sector: 'Medicine', nav: 3120.00, change: 1.45, aum: 31000000, holdings: 6, risk: 'Low', members: ['MYIN'] },
  { id: 'ecf', name: 'Executive Class Fund', icon: '💼', sector: 'Finance & Law', nav: 4200.25, change: 0.89, aum: 67000000, holdings: 10, risk: 'Medium', members: ['RMKV', 'PRYA'] },
  { id: 'crf', name: 'Creative Rebels Fund', icon: '🎨', sector: 'Entertainment', nav: 1540.30, change: -0.33, aum: 22000000, holdings: 15, risk: 'High', members: ['LCST', 'ELNA'] },
];

// ===== Active IPOs =====
const ACTIVE_IPOS = [
  { id: 'ipo1', profileId: 'DVKR', name: 'Dev Kumar', role: 'Serial Founder', sector: 'Entrepreneurship', pricePerShare: 24.50, sharesOffered: 500000, raised: 8200000, target: 12250000, daysLeft: 4, earningsPct: 5.2, investors: 2841, minInvestment: 100, avatar: '🚀' },
  { id: 'ipo2', profileId: 'ELNA', name: 'Elena Vasquez', role: 'EdTech Founder', sector: 'Education', pricePerShare: 8.90, sharesOffered: 300000, raised: 1890000, target: 2670000, daysLeft: 11, earningsPct: 3.8, investors: 1205, minInvestment: 50, avatar: '📚' },
  { id: 'ipo3', profileId: 'ZNXU', name: 'Zane Xu', role: 'Blockchain Architect', sector: 'Technology', pricePerShare: 19.20, sharesOffered: 400000, raised: 5760000, target: 7680000, daysLeft: 2, earningsPct: 4.5, investors: 3920, minInvestment: 100, avatar: '⛓️' },
];

// ===== Derivatives =====
const DERIVATIVES = [
  { id: 'd1', underlying: 'SVNL', name: 'Savannah Lee', type: 'CALL', strike: 42.50, expiry: '2026-06-30', premium: 3.20, iv: 28.5, delta: 0.65, openInterest: 45000, avatar: '🎾' },
  { id: 'd2', underlying: 'DVKR', name: 'Dev Kumar', type: 'CALL', strike: 25.00, expiry: '2026-07-31', premium: 5.80, iv: 45.2, delta: 0.71, openInterest: 82000, avatar: '🚀' },
  { id: 'd3', underlying: 'RMKV', name: 'Rohan Mehta', type: 'PUT', strike: 38.00, expiry: '2026-06-30', premium: 2.10, iv: 18.3, delta: -0.38, openInterest: 28000, avatar: '👨‍💼' },
  { id: 'd4', underlying: 'AERA', name: 'Aera Patel', type: 'CALL', strike: 32.00, expiry: '2026-09-30', premium: 4.40, iv: 35.1, delta: 0.60, openInterest: 61000, avatar: '👩‍💻' },
  { id: 'd5', underlying: 'MYIN', name: 'Maya Inoue', type: 'PUT', strike: 44.00, expiry: '2026-06-30', premium: 1.75, iv: 14.8, delta: -0.28, openInterest: 18000, avatar: '🧠' },
];

// ===== Price History Generator =====
function generatePriceHistory(basePrice, days = 90, volatility = 0.02) {
  const history = [];
  let price = basePrice * (1 - days * volatility * 0.3);
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    price = Math.max(price + change, 0.01);
    const high = Math.max(open, price) * (1 + Math.random() * volatility * 0.5);
    const low  = Math.min(open, price) * (1 - Math.random() * volatility * 0.5);
    history.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 500000 + 100000),
    });
  }
  return history;
}

// ===== Order Book Generator =====
function generateOrderBook(midPrice, depth = 8) {
  const asks = [], bids = [];
  for (let i = 1; i <= depth; i++) {
    const spreadFactor = i * 0.003;
    asks.push({ price: parseFloat((midPrice * (1 + spreadFactor)).toFixed(2)), quantity: Math.floor(Math.random() * 50000 + 5000), total: 0 });
    bids.push({ price: parseFloat((midPrice * (1 - spreadFactor)).toFixed(2)), quantity: Math.floor(Math.random() * 60000 + 5000), total: 0 });
  }
  asks.sort((a, b) => a.price - b.price);
  bids.sort((a, b) => b.price - a.price);
  asks.forEach((a, i) => a.total = asks.slice(0, i + 1).reduce((s, x) => s + x.quantity, 0));
  bids.forEach((b, i) => b.total = bids.slice(0, i + 1).reduce((s, x) => s + x.quantity, 0));
  return { asks, bids };
}

// ===== Live Price Simulation =====
const priceState = {};
HUMAN_PROFILES.forEach(p => {
  priceState[p.id] = { price: p.sharePrice, prev: p.sharePrice };
});

function simulatePriceTick() {
  HUMAN_PROFILES.forEach(p => {
    const volatility = 0.005 + Math.random() * 0.008;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const delta = priceState[p.id].price * volatility * direction;
    priceState[p.id].prev = priceState[p.id].price;
    priceState[p.id].price = Math.max(parseFloat((priceState[p.id].price + delta).toFixed(2)), 0.01);
    p.sharePrice = priceState[p.id].price;
    p.change24h = parseFloat((((priceState[p.id].price - p.sharePrice) / p.sharePrice * 100) + p.change24h).toFixed(2));
  });
  computeIndexValue();
}

// ===== Formatters =====
const fmt = {
  currency: (n, compact = false) => {
    if (compact) {
      if (Math.abs(n) >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
      if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M';
      if (Math.abs(n) >= 1e3) return '$' + (n/1e3).toFixed(1) + 'K';
    }
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  percent: (n, sign = true) => (sign && n > 0 ? '+' : '') + n.toFixed(2) + '%',
  number: (n) => n.toLocaleString('en-US'),
  pct: (n) => (n * 100).toFixed(1) + '%',
};

// ===== Compliance Guardrails =====
const COMPLIANCE = {
  maxEarningsPct: 8.0,
  checkIPO: (earningsPct) => earningsPct > COMPLIANCE.maxEarningsPct
    ? { ok: false, msg: `Earnings share ${earningsPct}% exceeds the Illinois ISA cap of 8%. Please reduce.` }
    : { ok: true },
  disclaimer: `⚠ SIMULATION ONLY — All data, trades, and valuations on HEX are for educational demonstration purposes only. 
  No real money, securities, or legally binding contracts are involved. Personal tokenization may be regulated as a security 
  under SEC rules (Securities Act 1933) and as a Collective Investment Scheme under SEBI Act §11AA. Consult legal counsel before any real-world implementation.`,
};

// Export for pages
window.HEX = { HUMAN_PROFILES, HUMAN50_INDEX, MUTUAL_FUNDS, ACTIVE_IPOS, DERIVATIVES, 
  fmt, generatePriceHistory, generateOrderBook, simulatePriceTick, priceState, COMPLIANCE,
  calculateHumanMarketCap };
