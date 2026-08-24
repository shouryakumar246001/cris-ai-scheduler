# 🚆 CRIS AI-Driven Block Scheduling System
### Indian Railways Backend Ingestion, Mathematical Optimizer & Multi-Page Platform

---

## 📁 Project Directory & File Structure

```text
dellu/
├── 📄 package.json                  # Node.js dependencies & run scripts (npm start, npm run validate)
├── 📄 tsconfig.json                 # TypeScript compiler configuration
├── 📄 server.js                     # Multi-page HTTP server on port 3030
├── ⚡ start.bat                     # Windows 1-click launcher (starts server & opens browser)
├── ⚡ validate.bat                  # Windows 1-click protocol validation runner
├── 📄 README.md                     # Complete project & architecture documentation
│
├── 🌐 index.html                    # Central Operations Command & CRIS Topology
│
├── 📂 pages/                        # Dedicated Module Pages
│   ├── coa.html                     # 🛰️ Protocol 1: COA Telemetry & Ingestion Lab
│   ├── bdms.html                    # 🏗️ Protocol 2: BDMS & Shadow Block Merge Engine
│   ├── fois.html                    # 📦 Protocol 3: FOIS & ICMS Priority Intelligence
│   ├── milp.html                    # 🧮 Protocol 4: MILP Optimizer & XAI Explanation Studio
│   └── analytics.html               # 📊 Real Dataset (2016–2025) & Reliability Analytics
│
└── 📂 src/
    ├── 📂 data/
    │   └── train_delays_2016_2025.csv # 100-record real historical dataset (10 trains x 10 years)
    │
    ├── 📂 models/
    │   └── railway_model_engine.ts  # Statistical parser, P_i & Δd_i calibration, & MILP Solver
    │
    ├── 📂 protocols/                # Complete CRIS Protocol Layer
    │   ├── index.ts                 # Barrel exports
    │   ├── 📂 types/
    │   │   ├── coa.types.ts         # TypeScript interfaces for COA telemetry
    │   │   ├── bdms.types.ts        # TypeScript interfaces for Shadow Block
    │   │   ├── fois-icms.types.ts   # TypeScript interfaces for Priority Metadata
    │   │   └── milp-xai.types.ts    # TypeScript interfaces for MILP & XAI Output
    │   └── 📂 samples/
    │       ├── coa.sample.json      # Sample COA Ingestion JSON
    │       ├── bdms.sample.json     # Sample BDMS Shadow Block JSON
    │       ├── fois-icms.sample.json# Sample FOIS/ICMS Priority JSON
    │       └── milp-xai.sample.json # Sample MILP & XAI Response JSON
    │
    ├── 📂 dashboard/
    │   ├── shared.js                # Client-side data engine, live solver, clock & nav
    │   ├── styles.css               # Global dark-theme design system
    │   └── app.js                   # Visual animations & chart utilities
    │
    └── 📄 run.ts                    # Backend TypeScript protocol & dataset validation script
```

---

## 🚀 How to Run the System

### Option 1: One-Click Windows Batch (Easiest)
- Double-click **`start.bat`** to start the web server and automatically open **http://localhost:3030** in your browser.
- Double-click **`validate.bat`** to run the backend mathematical validation in a terminal.

### Option 2: Using NPM Scripts
```powershell
# 1. Start the web server
npm start
# -> Opens server at http://localhost:3030

# 2. Run the TypeScript Protocol & Mathematical Model Validation
npm run validate
# -> Executes the model against all 100 historical data points
```

### Option 3: Direct Node / NPX Commands
```powershell
# Start Web Server
node server.js

# Run Validation
npx ts-node --project tsconfig.json src/run.ts
```

---

## 🌐 Web Application Endpoints

Once the server is running, access all dedicated module pages:

| Page | URL | Function & Protocol |
|---|---|---|
| **Operations Command** | [http://localhost:3030/](http://localhost:3030/) | Main executive dashboard, fleet overview table, live ticker, and delay vs priority summary charts. |
| **COA Telemetry Lab** | [http://localhost:3030/pages/coa.html](http://localhost:3030/pages/coa.html) | **Protocol 1 (COA-2.1)**: Live telemetry simulator for 10 trains, speed/brake gauges, ATP/signal status, track progression, berth matrix, and real-time JSON stream. |
| **Shadow Block Engine** | [http://localhost:3030/pages/bdms.html](http://localhost:3030/pages/bdms.html) | **Protocol 2 (BDMS-3.0)**: Multi-department request builder (Track, OHE, S&T), interactive 3-department merge visualizer, sync flags matrix, and efficiency gain calculator. |
| **Priority Intelligence** | [http://localhost:3030/pages/fois.html](http://localhost:3030/pages/fois.html) | **Protocol 3 (FOIS-ICMS-2.0)**: Dynamic priority ($P_i$) decomposition ($\alpha B_{\text{cat}} + \beta L_{\text{dist}} + \gamma V_{\text{vol}} + \delta C_{\text{casc}}$), delay budget ($\Delta d_i$) dials, passenger capacity, and revenue SLA penalty exposure. |
| **MILP Optimizer Studio** | [http://localhost:3030/pages/milp.html](http://localhost:3030/pages/milp.html) | **Protocol 4 (MILP-XAI-1.0)**: Interactive solver workbench with $\lambda$ penalty slider & time-offset slider, live $x_j \in \{0,1\}$ decision, yield vs penalty charts, and **Explainable AI (XAI)** audit logs with SHAP importances and 3 counterfactual what-if trees. |
| **Historical Analytics** | [http://localhost:3030/pages/analytics.html](http://localhost:3030/pages/analytics.html) | Complete 100-record dataset explorer (2016–2025), search & year filter, 10-year YoY delay trend line charts, punctuality rankings, and **One-Click CSV download**. |

---

## 🧮 Mathematical Model & Real 10-Train Dataset

The system parses the 100 historical observations across 10 trains:
1. `12301` — **Rajdhani Express** (Howrah &rarr; New Delhi)
2. `12002` — **Shatabdi Express** (New Delhi &rarr; Rani Kamlapati)
3. `15906` — **Vivek Express** (Dibrugarh &rarr; Kanyakumari · 4,198 km)
4. `12377` — **Garib Rath Express** (Kolkata &rarr; New Delhi)
5. `12238` — **Begampura Express** (Varanasi &rarr; Jammu Tawi)
6. `12229` — **Lucknow Mail** (Lucknow &rarr; New Delhi)
7. `15029` — **Gorakhpur–Pune Weekly Express** (Gorakhpur &rarr; Pune)
8. `12604` — **Chennai Express** (Mumbai CSMT &rarr; Chennai Central)
9. `12633` — **Kanyakumari Express** (Chennai Egmore &rarr; Kanyakumari)
10. `22832` — **Yesvantpur–Howrah Express** (Yesvantpur &rarr; Howrah)

### Priority Weight ($P_i$) Formulation:
$$P_i = \min\left(10.0, \, B_{\text{cat}} + \text{Factor}_{\text{distance}} + 0.6 \cdot \text{Factor}_{\text{volatility}} + 0.8 \cdot \text{Factor}_{\text{cascade}}\right)$$

### MILP Optimization Objective:
$$\max_{x_j \in \{0,1\}} \sum_j \left[ M_j^{\text{eff}} \cdot x_j \right] - \lambda \sum_i \left[ P_i \cdot \hat{d}_i \cdot z_i \right]$$
- $M_j^{\text{eff}} = M_j \times \text{UrgencyMultiplier}$
- $\lambda$ = Policy penalty weight (default 1.5)
- $x_j \in \{0, 1\}$ = Binary decision variable (1 = Approved, 0 = Rejected)
- XAI generates SHAP-style attribution scores and 3 counterfactual what-if scenarios.
