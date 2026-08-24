/**
 * HEX — Shared UI Components
 * Nav, Ticker Strip, Compliance Modal, etc.
 */

// ===== Navigation =====
function renderNav(activePage) {
  const links = [
    { href: 'market.html',      label: 'Markets',     id: 'market' },
    { href: 'terminal.html',    label: 'Terminal',    id: 'terminal' },
    { href: 'ipo.html',         label: 'IPO Launchpad', id: 'ipo' },
    { href: 'human50.html',     label: 'Human 50',    id: 'human50' },
    { href: 'funds.html',       label: 'Funds',       id: 'funds' },
    { href: 'derivatives.html', label: 'F&O',         id: 'derivatives' },
    { href: 'compliance.html',  label: 'Compliance',  id: 'compliance' },
  ];

  const navHtml = `<nav class="nav" id="main-nav">
    <a href="market.html" class="nav-logo">
      <div class="hex-icon"></div>
      HEX
    </a>
    <div class="nav-links">
      ${links.map(l => `<a href="${l.href}" class="nav-link ${activePage === l.id ? 'active' : ''}">${l.label}</a>`).join('')}
    </div>
    <div class="nav-actions">
      <div class="live-dot"></div>
      <span class="mono" style="font-size:11px;color:var(--text-muted)">LIVE</span>
      <span class="badge badge-amber">DEMO MODE</span>
      <a href="login.html" class="btn btn-outline-green btn-sm">Sign In</a>
      <a href="kyc.html" class="btn btn-primary btn-sm">Launch IPO</a>
    </div>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', navHtml);
}

// ===== Ticker Strip =====
function renderTickerStrip() {
  const profiles = window.HEX.HUMAN_PROFILES;
  const fmt = window.HEX.fmt;
  
  function buildItems() {
    return profiles.concat(profiles).map(p => {
      const up = p.change24h >= 0;
      return `<div class="ticker-item">
        <span class="symbol">${p.id}</span>
        <span class="price">${fmt.currency(p.sharePrice)}</span>
        <span class="${up ? 'change-up' : 'change-down'}">${fmt.percent(p.change24h)}</span>
      </div>`;
    }).join('');
  }

  // Insert AFTER nav
  const nav = document.getElementById('main-nav');
  const stripHtml = `<div class="ticker-strip" id="ticker-strip">
    <div class="ticker-track" id="ticker-track">${buildItems()}</div>
  </div>`;
  if (nav) nav.insertAdjacentHTML('afterend', stripHtml);
  else document.body.insertAdjacentHTML('afterbegin', stripHtml);

  // Live updates every 2s
  setInterval(() => {
    window.HEX.simulatePriceTick();
    const track = document.getElementById('ticker-track');
    if (track) track.innerHTML = buildItems();
    updateNavIndexValue();
  }, 2000);
}

function updateNavIndexValue() {
  const el = document.getElementById('nav-index-value');
  const idx = window.HEX.HUMAN50_INDEX;
  if (el) {
    const up = idx.changePct >= 0;
    el.innerHTML = `<span style="color:var(--text-secondary);font-size:10px;margin-right:4px">H50</span>
      <span class="mono" style="font-weight:700">${idx.value.toLocaleString()}</span>
      <span style="color:${up?'var(--green)':'var(--red)'};font-size:11px">${up?'▲':'▼'}${Math.abs(idx.changePct).toFixed(2)}%</span>`;
  }
}

// ===== Compliance Modal =====
function showComplianceModal(onAccept) {
  const existing = document.getElementById('compliance-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'compliance-modal';
  modal.innerHTML = `
    <div class="modal">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <span style="font-size:28px">⚠️</span>
        <div>
          <div style="font-weight:700;font-size:16px;color:var(--amber)">Regulatory Notice</div>
          <div style="font-size:12px;color:var(--text-muted)">Required before proceeding</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px;font-family:var(--font-mono);background:var(--bg-secondary);padding:16px;border-radius:8px;border:1px solid var(--border)">
        ${window.HEX.COMPLIANCE.disclaimer}
      </div>
      <div style="display:grid;gap:8px;margin-bottom:24px">
        <div class="compliance-banner">📋 SEC Securities Act 1933 — Personal tokens may constitute unregistered securities</div>
        <div class="compliance-banner">📋 SEBI Act §11AA — Indian jurisdiction: possible CIS classification</div>
        <div class="compliance-banner">📋 Illinois ISA Law 2025 — Earnings share capped at 8% of monthly income</div>
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-primary" id="compliance-accept" style="flex:1">I Understand — Continue (Demo)</button>
        <button class="btn btn-ghost" id="compliance-reject">Cancel</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('open'), 10);

  document.getElementById('compliance-accept').onclick = () => {
    modal.classList.remove('open');
    setTimeout(() => modal.remove(), 300);
    if (onAccept) onAccept();
  };
  document.getElementById('compliance-reject').onclick = () => {
    modal.classList.remove('open');
    setTimeout(() => modal.remove(), 300);
  };
}

// ===== Profile Card =====
function renderProfileCard(profile, mini = false) {
  const { fmt } = window.HEX;
  const up = profile.change24h >= 0;
  if (mini) {
    return `
    <a href="terminal.html?id=${profile.id}" style="text-decoration:none">
    <div class="card" style="cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='var(--border-bright)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="width:42px;height:42px;border-radius:50%;background:var(--bg-elevated);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px">${profile.avatar}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px">${profile.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">${profile.id} · ${profile.sector}</div>
        </div>
        ${profile.verified ? '<span class="badge badge-green" style="font-size:9px">✓ KYC</span>' : '<span class="badge badge-amber" style="font-size:9px">⏳ KYC</span>'}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div class="stat-widget">
          <div class="stat-label">Share Price</div>
          <div class="stat-value" style="font-size:18px">${fmt.currency(profile.sharePrice)}</div>
          <div class="stat-change ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${fmt.percent(Math.abs(profile.change24h), false)}</div>
        </div>
        <div class="stat-widget">
          <div class="stat-label">Market Cap</div>
          <div class="stat-value" style="font-size:18px">${fmt.currency(profile.marketCap, true)}</div>
          <div style="font-size:10px;color:var(--text-muted)">DCF Valuation</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border)">
        <span style="font-size:11px;color:var(--text-muted)">Vol: ${fmt.currency(profile.volume, true)}</span>
        <span class="tag">${profile.sector}</span>
      </div>
    </div>
    </a>`;
  }
  return '';
}

// ===== Toast Notifications =====
function toast(msg, type = 'info') {
  const colors = { info: 'var(--blue)', success: 'var(--green)', error: 'var(--red)', warn: 'var(--amber)' };
  const icons  = { info: 'ℹ', success: '✓', error: '✕', warn: '⚠' };
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;
    background:var(--bg-elevated);border:1px solid ${colors[type]};
    color:${colors[type]};padding:12px 20px;border-radius:10px;font-size:13px;
    font-family:var(--font-mono);display:flex;align-items:center;gap:10px;
    box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:fadeIn 0.3s ease;
    max-width:360px;`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ===== Sparkline Helper =====
function renderSparklines() {
  requestAnimationFrame(() => {
    document.querySelectorAll('canvas[data-sparkline]').forEach(canvas => {
      const id = canvas.dataset.sparkline;
      const profile = window.HEX.HUMAN_PROFILES.find(p => p.id === id);
      if (!profile) return;
      const history = window.HEX.generatePriceHistory(profile.sharePrice * 0.85, 30, 0.025);
      const vals = history.map(d => d.close);
      const color = profile.change24h >= 0 ? '#00ff88' : '#ff3355';
      new HEXChart(canvas).drawSparkline(canvas, vals, color);
    });
  });
}

window.HEXComponents = { renderNav, renderTickerStrip, showComplianceModal, renderProfileCard, toast, renderSparklines };
