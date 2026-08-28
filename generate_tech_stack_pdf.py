import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (on pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "Centre for Railway Information Systems (CRIS) — SIH 26028")
            self.drawRightString(letter[0] - 54, letter[1] - 36, "Tech Stack, Architecture & System Workflow")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
        
        # Footer (on all pages)
        self.setFont("Helvetica", 8)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_text)
        self.drawString(54, 36, "INDIAN RAILWAYS / CRIS — DYNAMIC ETA & BLOCK SCHEDULING SPECIFICATION")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 46, letter[0] - 54, 46)
        
        self.restoreState()

def build_pdf():
    pdf_filename = "c:/Users/KIIT/OneDrive/Desktop/dellu/CRIS_AI_Tech_Stack_Architecture_and_Workflow.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Modern Palette
    PRIMARY = colors.HexColor("#0f172a")     # Deep Charcoal/Navy
    ACCENT = colors.HexColor("#db2777")      # CRIS Vibrant Pink
    SECONDARY = colors.HexColor("#1e293b")   # Slate Dark
    TEXT_COLOR = colors.HexColor("#334155")  # Body Slate
    BG_LIGHT = colors.HexColor("#f8fafc")    # Table Light Background
    BORDER_COL = colors.HexColor("#e2e8f0")  # Clean Border

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=PRIMARY,
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=ACCENT,
        spaceAfter=12
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_COLOR
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=TEXT_COLOR,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        fontName='Helvetica',
        fontSize=8.4,
        leading=12,
        textColor=TEXT_COLOR,
        leftIndent=10,
        spaceAfter=2.5
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        fontName='Helvetica-Oblique',
        fontSize=8.2,
        leading=11.5,
        textColor=PRIMARY
    )

    code_block_style = ParagraphStyle(
        'CodeBlock',
        fontName='Courier',
        fontSize=7.6,
        leading=10.5,
        textColor=colors.HexColor("#0f172a")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=10.5,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=PRIMARY
    )

    table_cell_mono = ParagraphStyle(
        'TableCellMono',
        fontName='Courier-Bold',
        fontSize=7.4,
        leading=9.5,
        textColor=colors.HexColor("#be185d")
    )

    story = []

    # 1. Title Banner
    story.append(Paragraph("CRIS AI Dynamic ETA & Block Scheduling Platform", title_style))
    story.append(Paragraph("System Tech Stack, Architectural Workflow & Gemini AI Handover Specification (SIH 26028)", subtitle_style))
    
    meta_text = """
    <b>Project:</b> Smart India Hackathon (SIH 26028) · <b>Organization:</b> Centre for Railway Information Systems (CRIS)<br/>
    <b>Core Technologies:</b> HTML5, CSS3 Luxury Theme, Vanilla JS (ES6+), Chart.js, Node.js, TypeScript, LightGBM (GBM-ETA-v3.2), MILP<br/>
    <b>Live Scope:</b> ISRO RTIS Live GPS Telemetry, BDMS TSR Track Restrictions, XAI Waterfall Decomposition, Multi-Channel Broadcast
    """
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=10))

    # 2. Executive Overview
    story.append(Paragraph("1. Executive Overview & Problem Context", h1_style))
    exec_summary = """
    Indian Railways operates over 13,000 passenger and freight trains daily across dense corridors. Delays caused by winter fog, track maintenance, speed restrictions, and junction bottlenecks easily propagate into massive cascading network disruptions. This platform solves three critical operational challenges:<br/>
    <b>1. Dynamic ETA Prediction:</b> Replaces static timetables with real-time arrival forecasts powered by live ISRO RTIS GPS telemetry, track speed restrictions (TSRs), and machine learning (<code>GBM-ETA-v3.2</code>).<br/>
    <b>2. Explainable AI (XAI) Delay Waterfall:</b> Provides complete transparency to controllers by decomposing the exact delay factors (Base Schedule + Weather + Congestion + TSR + Cascading Hub Waits).<br/>
    <b>3. Intelligent Shadow Block Merging & Controller Broadcast:</b> Merges multi-department track maintenance requests (Track, Electrical, Signaling) into unified non-conflicting windows and enables instant multi-channel passenger/station broadcasts (SMS, PA, PRS Boards, IR App).
    """
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 6))

    # 3. Tech Stack Matrix Table
    story.append(Paragraph("2. Technology Stack Breakdown", h1_style))
    
    tech_table_data = [
        [
            Paragraph("<b>Layer</b>", table_header_style),
            Paragraph("<b>Technologies & Libraries</b>", table_header_style),
            Paragraph("<b>Role & Purpose in Platform</b>", table_header_style)
        ],
        [
            Paragraph("<b>Frontend UI & Visuals</b>", table_cell_style),
            Paragraph("HTML5, Vanilla CSS3 (Custom Dark/Pink Theme, Glassmorphism), Vanilla JS (ES6+), Chart.js", table_cell_style),
            Paragraph("Ultra-responsive, accessible UI with zero heavy framework overhead for instant page load, interactive charts, and live gauges.", table_cell_style)
        ],
        [
            Paragraph("<b>Client API & State Bus</b>", table_cell_style),
            Paragraph("<code>src/dashboard/api.js</code><br/><code>src/dashboard/shared.js</code>", table_cell_mono),
            Paragraph("Centralized mock telemetry simulator, unified 10-train live registry, event subscription bus, and synchronized live navigation clock.", table_cell_style)
        ],
        [
            Paragraph("<b>Core Math & AI Engine</b>", table_cell_style),
            Paragraph("TypeScript, Node.js,<br/><code>railway_model_engine.ts</code>,<br/><code>GBM-ETA-v3.2</code>, MILP Solver", table_cell_mono),
            Paragraph("Calibrates priority weights (P_i), delay allowances (Delta d_i), calculates XAI SHAP importances, and solves optimal Shadow Block co-registration.", table_cell_style)
        ],
        [
            Paragraph("<b>Data & Historical Baseline</b>", table_cell_style),
            Paragraph("<code>train_delays_2016_2025.csv</code><br/>(100 historical winter records)", table_cell_mono),
            Paragraph("10-year empirical baseline for 10 flagship trains (Rajdhani, Vande Bharat, Freight) across Northern/Eastern fog-prone corridors.", table_cell_style)
        ],
        [
            Paragraph("<b>Reporting & Automation</b>", table_cell_style),
            Paragraph("Python 3, ReportLab PDF Engine,<br/><code>generate_pdf.py</code>", table_cell_mono),
            Paragraph("Automated generation of publication-grade architectural specifications, workflow diagrams, and compliance documentation.", table_cell_style)
        ],
        [
            Paragraph("<b>Hosting & Local Server</b>", table_cell_style),
            Paragraph("Node.js <code>server.js</code> (Port 3030),<br/>Netlify <code>_redirects</code>, <code>netlify.toml</code>", table_cell_mono),
            Paragraph("Multi-page HTTP local development server and edge-redirect production hosting configuration.", table_cell_style)
        ]
    ]

    t_tech = Table(tech_table_data, colWidths=[1.4*inch, 2.3*inch, 3.4*inch])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 8))

    # 4. 5-Stage System Architecture & Workflow
    story.append(Paragraph("3. End-to-End System Architecture (5 Stages)", h1_style))
    
    stages_data = [
        [
            Paragraph("<b>Stage</b>", table_header_style),
            Paragraph("<b>Component Name</b>", table_header_style),
            Paragraph("<b>Operational Mechanism & Data Transformation</b>", table_header_style)
        ],
        [
            Paragraph("<b>Stage 1</b>", table_cell_style),
            Paragraph("<b>Real-Time Data Ingestion</b><br/>(COA, RTIS, BDMS, FOIS)", table_cell_style),
            Paragraph("Streams loco GPS coordinates every 3s, speeds, signal aspects, active track speed restrictions (TSRs), weather conditions (fog visibility), and train manifests.", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 2</b>", table_cell_style),
            Paragraph("<b>Intelligence & ML Core</b><br/>(GBM-ETA-v3.2 & MILP)", table_cell_style),
            Paragraph("LightGBM model predicts dynamic ETA; XAI engine computes SHAP delay decomposition; MILP optimizer resolves multi-department track maintenance co-registration.", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 3</b>", table_cell_style),
            Paragraph("<b>Central State & API Bus</b><br/>(<code>src/dashboard/api.js</code>)", table_cell_style),
            Paragraph("Serves unified train registry, dynamic simulated clock, active TSR penalties, cascading network risks, and live pub/sub notification events.", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 4</b>", table_cell_style),
            Paragraph("<b>Controller Dashboard Suite</b><br/>(8 Specialized Interfaces)", table_cell_style),
            Paragraph("Provides section controllers with live command dashboards, telemetry simulator, TSR impact heatmaps, cascade graph diagrams, and web CLI terminal.", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 5</b>", table_cell_style),
            Paragraph("<b>Outbound Multi-Channel Broadcast</b>", table_cell_style),
            Paragraph("Section controllers broadcast critical delay alerts across SMS gateway, station PRS display boards, station PA audio, and IR passenger mobile applications.", table_cell_style)
        ]
    ]

    t_stages = Table(stages_data, colWidths=[0.9*inch, 2.2*inch, 4.0*inch])
    t_stages.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_stages)
    story.append(Spacer(1, 8))

    # Page Break for clean multi-page layout
    story.append(PageBreak())

    # 5. Step-by-Step Workflow (Journey of a Delay Prediction)
    story.append(Paragraph("4. Step-by-Step Workflow: The Lifecycle of a Delay Prediction", h1_style))
    story.append(Paragraph("The platform executes an automated 7-step sequence from track sensor ingestion to passenger broadcast:", body_style))
    
    workflow_steps = [
        "<b>Step 1 (RTIS Ingestion):</b> Every 3 seconds, train locos equipped with ISRO RTIS transmit speed, latitude, longitude, and throttle data directly into the system bus (<code>pages/coa.html</code>).",
        "<b>Step 2 (TSR Penalty Computation):</b> BDMS registers active speed restrictions (e.g. track work slowing train from 130 km/h to 30 km/h over 4.2 km). The system calculates the exact deceleration/acceleration time penalty (<code>pages/bdms.html</code>).",
        "<b>Step 3 (Priority & Cascade Assessment):</b> FOIS/ICMS evaluates dynamic train priority (P_i) and checks if a delay at a primary junction will trigger ripple delays for following trains (<code>pages/fois.html</code>).",
        "<b>Step 4 (ML Dynamic Prediction):</b> The LightGBM model (<code>GBM-ETA-v3.2</code>) consumes all multi-modal telemetry and computes the real-time arrival forecast.",
        "<b>Step 5 (XAI Factor Waterfall):</b> The prediction is broken down into intuitive components: <i>Final ETA = Scheduled Base + Delta Weather + Delta Congestion + Delta TSR + Delta Cascade</i> (<code>pages/milp.html</code>).",
        "<b>Step 6 (Shadow Block Optimization):</b> When maintenance is required, the MILP solver merges Track (P-Way), Electrical (OHE), and Signaling (S&T) requests into a single unified window, saving hundreds of train-delay minutes.",
        "<b>Step 7 (Controller Broadcast):</b> If a train exceeds a 15-minute delay threshold, an automated alert is routed to the Notification Center (<code>pages/notifications.html</code>). The controller selects broadcast channels and pushes notifications via SMS, Station PA, Display Boards, and Passenger Apps."
    ]
    for step in workflow_steps:
        story.append(Paragraph(f"• {step}", bullet_style))
    
    story.append(Spacer(1, 8))

    # 6. Complete Page Directory
    story.append(Paragraph("5. Interactive Page Directory & Feature Matrix", h1_style))
    
    pages_data = [
        [
            Paragraph("<b>Page Name</b>", table_header_style),
            Paragraph("<b>Route / Path</b>", table_header_style),
            Paragraph("<b>Core Tasks & Interactive Visual Features</b>", table_header_style)
        ],
        [
            Paragraph("<b>ETA Command Center</b>", table_cell_style),
            Paragraph("<code>index.html</code> (<code>/</code>)", table_cell_mono),
            Paragraph("Executive overview, Fleet KPIs (Punctuality %, Active TSRs, ML Confidence), Live Dynamic ETA Watchlist table, and weather vs corridor charts.", table_cell_style)
        ],
        [
            Paragraph("<b>RTIS Telemetry Lab</b>", table_cell_style),
            Paragraph("<code>pages/coa.html</code>", table_cell_mono),
            Paragraph("ISRO RTIS live GPS telemetry simulator (3s tick), speedometer, brake pressure gauge, signal aspect, and raw <code>rtis.gps-feed.v2</code> JSON stream viewer.", table_cell_style)
        ],
        [
            Paragraph("<b>TSR Track Impact</b>", table_cell_style),
            Paragraph("<code>pages/bdms.html</code>", table_cell_mono),
            Paragraph("Active Temporary Speed Restriction (TSR) registry, corridor impact cards, penalty bar chart, and affected trains list with adjusted ETAs.", table_cell_style)
        ],
        [
            Paragraph("<b>Cascade Network Risk</b>", table_cell_style),
            Paragraph("<code>pages/fois.html</code>", table_cell_mono),
            Paragraph("Interactive cascade chain visualizer, delay ripple propagation diagrams, amplification factor bar charts, and multi-train risk matrix.", table_cell_style)
        ],
        [
            Paragraph("<b>XAI Waterfall Studio</b>", table_cell_style),
            Paragraph("<code>pages/milp.html</code>", table_cell_mono),
            Paragraph("Animated waterfall delay factor breakdown, confidence gauge ring, SHAP feature importance chart, counterfactual 'What-If' scenarios, and MILP block solver.", table_cell_style)
        ],
        [
            Paragraph("<b>Historical Analytics</b>", table_cell_style),
            Paragraph("<code>pages/analytics.html</code>", table_cell_mono),
            Paragraph("100-record real dataset explorer (2016–2025 across 10 flagship trains), year/weather filters (Fog, Rain, Clear), corridor delay charts, and 1-click CSV download.", table_cell_style)
        ],
        [
            Paragraph("<b>Notification Center</b>", table_cell_style),
            Paragraph("<code>pages/notifications.html</code>", table_cell_mono),
            Paragraph("Section Controller broadcast interface, priority message feed (CRITICAL, HIGH, MEDIUM, INFO), channel selectors (PA, SMS, PRS, App), and auto-alert generator.", table_cell_style)
        ],
        [
            Paragraph("<b>Web CLI Terminal</b>", table_cell_style),
            Paragraph("<code>pages/terminal.html</code>", table_cell_mono),
            Paragraph("Interactive CLI with command history and tab autocompletion. Supports: <code>help</code>, <code>status</code>, <code>get-eta</code>, <code>list-trains</code>, <code>tsr-status</code>, <code>cascade-status</code>.", table_cell_style)
        ]
    ]

    t_pages = Table(pages_data, colWidths=[1.5*inch, 1.8*inch, 3.8*inch])
    t_pages.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_pages)
    story.append(Spacer(1, 8))

    # Page Break for Gemini Handover Prompt Section
    story.append(PageBreak())

    # 7. AI Handover & Gemini Prompt Guide
    story.append(Paragraph("6. Gemini AI Handover & Extension Prompt Guide", h1_style))
    story.append(Paragraph("Use the structured template below when delegating new features or backend integrations to Gemini or AI coding assistants:", body_style))
    
    prompt_box_content = [
        [
            Paragraph("<b>PROMPT TEMPLATE FOR GEMINI / AI CODING ASSISTANTS</b>", table_header_style)
        ],
        [
            Paragraph("""
            <b>Context:</b> You are working on the CRIS Indian Railways AI Platform (SIH 26028).<br/>
            <b>Architecture:</b> Vanilla HTML5/CSS3/JS frontend, Central API bus (<code>src/dashboard/api.js</code>), Node.js server (port 3030), LightGBM (<code>GBM-ETA-v3.2</code>) ML predictor, and MILP Shadow Block solver.<br/>
            <b>Current Features:</b> Operations Command, RTIS GPS Telemetry Lab, BDMS TSR Impact, Cascading Network Risk, XAI Waterfall Studio, Historical ML Analytics, Controller Notification Center, and Web CLI Terminal.<br/><br/>
            <b>Task / New Requirements:</b><br/>
            1. [Insert specific feature requirement, e.g. GIS Leaflet Map / FastAPI backend / WebSocket feed / Auth RBAC]<br/>
            2. Ensure all UI components follow the dark luxury aesthetic in <code>src/dashboard/styles.css</code>.<br/>
            3. Update <code>src/dashboard/api.js</code> and <code>src/dashboard/shared.js</code> to integrate the new functionality seamlessly.
            """, code_block_style)
        ]
    ]

    t_prompt = Table(prompt_box_content, colWidths=[7.1*inch])
    t_prompt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#f1f5f9")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, ACCENT),
    ]))
    story.append(t_prompt)
    story.append(Spacer(1, 10))

    # 8. Mathematical & Algorithmic Formulation Summary
    story.append(Paragraph("7. Mathematical & AI Formulations Summary", h1_style))
    
    math_points = [
        "<b>Dynamic ETA Prediction:</b> <code>ETA_pred = Scheduled_Base + Delta_Weather + Delta_Congestion + Delta_TSR + Delta_Cascade</code>",
        "<b>Train Dynamic Priority Index:</b> <code>P_i = alpha * B_cat + beta * L_dist + gamma * V_vol + delta * C_casc</code> (Where alpha=0.35, beta=0.20, gamma=0.25, delta=0.20).",
        "<b>Allowed Delay Budget:</b> <code>Delta_d_i = (1 - P_i) * D_max * S_zone</code> (Ensures high-priority trains have tight delay thresholds).",
        "<b>Shadow Block Maintenance Objective:</b> <code>min Sigma (W_unmerged - W_merged) + lambda * Sigma (P_i * Delay_i)</code> (Maximizes maintenance efficiency while penalizing train delays)."
    ]
    for mp in math_points:
        story.append(Paragraph(f"• {mp}", bullet_style))

    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.0, color=BORDER_COL, spaceAfter=8))
    story.append(Paragraph("<b>End of Specification Document</b> · Generated automatically via CRIS Architecture Reporting Engine.", meta_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {pdf_filename}")

if __name__ == "__main__":
    build_pdf()
