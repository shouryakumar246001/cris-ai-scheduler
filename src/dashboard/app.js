/**
 * CRIS AI Block Scheduler — Dashboard Application JS
 * Handles: clock, Chart.js renders, animations, interactions
 */

"use strict";

/* ══ Live Clock ══════════════════════════════════════════════ */
function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  el.textContent =
    `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
}
updateClock();
setInterval(updateClock, 1000);

/* ══ P_i Gauge (Protocol 3) ══════════════════════════════════ */
(function renderPiGauge() {
  const canvas = document.getElementById("piGauge");
  if (!canvas) return;

  const Pi = 8.7;
  const max = 10.0;
  const fraction = Pi / max;

  // Semi-circle gauge using Chart.js doughnut
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [fraction, 1 - fraction],
        backgroundColor: [
          createGradient(ctx, "#9b59b6", "#e91e8c"),
          "rgba(255,255,255,0.05)",
        ],
        borderWidth: 0,
        borderRadius: 6,
      }]
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: "72%",
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 1800, easing: "easeOutQuart" },
    },
    plugins: [{
      id: "gaugeShadow",
      beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.shadowColor  = "rgba(155,89,182,0.5)";
        ctx.shadowBlur   = 20;
        ctx.restore();
      }
    }]
  });

  function createGradient(ctx, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 220, 0);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
  }
})();

/* ══ Yield vs Penalty Chart (Protocol 4) ═════════════════════ */
(function renderYieldPenaltyChart() {
  const canvas = document.getElementById("yieldPenaltyChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["M_j (raw)", "M_j_effective", "λ·Σ(P_i·Δd_i)", "Net Objective"],
      datasets: [{
        label: "Value",
        data: [72.5, 87.73, 58.73, 29.0],
        backgroundColor: [
          "rgba(46,204,113,0.4)",
          "rgba(0,212,255,0.5)",
          "rgba(231,76,60,0.4)",
          "rgba(0,212,255,0.7)",
        ],
        borderColor: [
          "rgba(46,204,113,0.9)",
          "rgba(0,212,255,0.9)",
          "rgba(231,76,60,0.9)",
          "rgba(0,212,255,1.0)",
        ],
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 1500, easing: "easeOutBounce" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(5,10,20,0.95)",
          borderColor: "rgba(0,212,255,0.3)",
          borderWidth: 1,
          titleColor: "#00d4ff",
          bodyColor: "#7a9bb5",
          callbacks: {
            label: ctx => `  ${ctx.parsed.y.toFixed(2)} units`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#7a9bb5", font: { size: 10, family: "Space Mono" } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "#7a9bb5", font: { size: 10 } },
          beginAtZero: true,
        }
      }
    }
  });
})();

/* ══ Staggered card entrance animations ══════════════════════ */
(function animateCards() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, i) => {
    card.style.opacity    = "0";
    card.style.transform  = "translateY(28px)";
    card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
    setTimeout(() => {
      card.style.opacity   = "1";
      card.style.transform = "translateY(0)";
    }, 80 + i * 150);
  });
})();

/* ══ Animate Pi bars on load ══════════════════════════════════ */
(function animatePiBars() {
  const bars = document.querySelectorAll(".pi-bar");
  bars.forEach(bar => {
    const target = bar.style.width;
    bar.style.width = "0%";
    setTimeout(() => { bar.style.width = target; }, 400);
  });
})();

/* ══ Animate FI bars on load ══════════════════════════════════ */
(function animateFiBars() {
  const bars = document.querySelectorAll(".fi-bar");
  bars.forEach(bar => {
    const target = bar.style.width;
    bar.style.width = "0%";
    setTimeout(() => { bar.style.width = target; }, 600);
  });
})();

/* ══ Animate delay budget bar ════════════════════════════════ */
(function animateDelayBars() {
  const used = document.querySelector(".db-used");
  const rem  = document.querySelector(".db-remaining");
  if (!used || !rem) return;

  const usedW = used.style.width;
  const remW  = rem.style.width;

  used.style.width = "0%";
  rem.style.width  = "100%";

  setTimeout(() => {
    used.style.transition = "width 1.2s ease";
    rem.style.transition  = "width 1.2s ease";
    used.style.width = usedW;
    rem.style.width  = remW;
  }, 500);
})();

/* ══ Hover telemetry card glow ════════════════════════════════ */
document.querySelectorAll(".tele-card, .ms-item").forEach(el => {
  el.addEventListener("mouseenter", () => {
    el.style.boxShadow = "0 0 14px rgba(0,212,255,0.15)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.boxShadow = "";
  });
});

/* ══ Simulated live speed flicker ════════════════════════════ */
(function liveSpeedFlicker() {
  const el = document.querySelector(".tele-value.cyan");
  if (!el) return;
  const base = 112.4;

  setInterval(() => {
    const jitter = (Math.random() * 2 - 1).toFixed(1);
    const val    = (base + parseFloat(jitter)).toFixed(1);
    el.innerHTML = `${val}<span class="unit">km/h</span>`;
  }, 2500);
})();

/* ══ Simulated live tick on sequence number (console) ════════ */
let seq = 100842;
setInterval(() => {
  seq++;
}, 3000);

console.log(
  "%c🚆 CRIS AI Block Scheduler",
  "font-size:16px;font-weight:bold;color:#00d4ff"
);
console.log(
  "%cProtocols active: COA-2.1 · BDMS-3.0 · FOIS-ICMS-2.0 · MILP-XAI-1.0",
  "color:#7a9bb5"
);
console.log(
  "%cShadow Block SB-CR-20240815-007 → APPROVED · x_j=1 · Net Obj: +29.0",
  "color:#2ecc71;font-weight:bold"
);
