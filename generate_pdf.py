import os
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
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "Centre for Railway Information Systems (CRIS) — AI Block Scheduling Platform")
            self.drawRightString(letter[0] - 54, letter[1] - 36, "Architecture & Page Specification")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — INDIAN RAILWAYS / CRIS AI ARCHITECTURE")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 46, letter[0] - 54, 46)
        
        self.restoreState()

def build_pdf():
    pdf_filename = "c:/Users/KIIT/OneDrive/Desktop/dellu/CRIS_AI_Block_Scheduler_Architecture_and_Page_Specification.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette Styles
    PRIMARY = colors.HexColor("#0f172a")     # Deep Charcoal/Navy
    ACCENT = colors.HexColor("#ec4899")      # CRIS Pink Accent
    SECONDARY = colors.HexColor("#1e293b")   # Dark Slate
    TEXT_COLOR = colors.HexColor("#334155")  # Slate Gray Text
    BG_LIGHT = colors.HexColor("#f8fafc")    # Light Inset
    BORDER_COL = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceAfter=14
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
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_COLOR,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_COLOR,
        leftIndent=12,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=PRIMARY
    )

    story = []

    # Title Banner
    story.append(Paragraph("CRIS AI Block Scheduler", title_style))
    story.append(Paragraph("System Architecture, Operational Workflows & Comprehensive Page Specifications", subtitle_style))
    
    meta_text = """
    <b>Author:</b> CRIS AI Systems Architecture · <b>Protocols:</b> COA-2.1, BDMS-3.0, FOIS-ICMS-2.0, MILP-XAI-1.0<br/>
    <b>Network Scope:</b> 8,990 Stations · 5,208 Trains · 10 Winter Years (2016–2025 Dataset Calibration)<br/>
    <b>Mathematical Formulation:</b> Mixed Integer Linear Programming (HiGHS Exact Solver) with Explainable AI (XAI)
    """
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=14))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary & Problem Context", h1_style))
    exec_summary = """
    The <b>Centre for Railway Information Systems (CRIS) AI Block Scheduler</b> is a mission-critical platform engineered for Indian Railways (IR) to solve the complex mathematical trade-off between infrastructure maintenance (Track P-Way, Electrical OHE, and S&T Signaling) and train punctuality. By unifying fragmented data streams across Control Office Application (COA), Block & Disruption Management System (BDMS), Freight Operations Information System (FOIS), and Integrated Coaching Management System (ICMS), the system automates multi-department <b>"Shadow Block" synthesis</b> and delivers mathematically optimal maintenance decisions via Mixed Integer Linear Programming (MILP).
    """
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 8))

    # Master Table of Pages
    story.append(Paragraph("2. Page Inventory & Operational Directory", h1_style))
    
    table_data = [
        [
            Paragraph("<b>#</b>", table_header_style),
            Paragraph("<b>Page Name</b>", table_header_style),
            Paragraph("<b>Route / URL</b>", table_header_style),
            Paragraph("<b>Core Operational Task & Engine</b>", table_header_style),
            Paragraph("<b>Protocol</b>", table_header_style)
        ],
        [
            Paragraph("1", table_cell_style),
            Paragraph("<b>Operations Command</b>", table_cell_style),
            Paragraph("<code>/</code> (index.html)", table_cell_style),
            Paragraph("Network-wide topology overview, protocol health aggregation, fleet punctuality tracking, and visual trend spectra.", table_cell_style),
            Paragraph("System Hub", table_cell_style)
        ],
        [
            Paragraph("2", table_cell_style),
            Paragraph("<b>Dataset & Analytics</b>", table_cell_style),
            Paragraph("<code>/analytics</code>", table_cell_style),
            Paragraph("10-Year historical delay exploration (2016–2025), multi-filter data inspection, YoY line analysis, and CSV dataset export.", table_cell_style),
            Paragraph("Data Baseline", table_cell_style)
        ],
        [
            Paragraph("3", table_cell_style),
            Paragraph("<b>BDMS Shadow Block</b>", table_cell_style),
            Paragraph("<code>/bdms</code>", table_cell_style),
            Paragraph("Multi-department engineering block co-registration (Track, OHE, Signaling) synthesizing single unified disruption windows.", table_cell_style),
            Paragraph("BDMS-3.0", table_cell_style)
        ],
        [
            Paragraph("4", table_cell_style),
            Paragraph("<b>MILP Optimizer Studio</b>", table_cell_style),
            Paragraph("<code>/milp</code>", table_cell_style),
            Paragraph("HiGHS MIP solver evaluating binary decisions (x_j in {0,1}), parameter sensitivity tuning (lambda), SHAP attribution, and XAI audits.", table_cell_style),
            Paragraph("MILP-XAI-1.0", table_cell_style)
        ],
        [
            Paragraph("5", table_cell_style),
            Paragraph("<b>COA Live Telemetry</b>", table_cell_style),
            Paragraph("<code>/coa</code>", table_cell_style),
            Paragraph("100ms real-time locomotive telemetry, speedometer, traction current, KAVACH ATP link, line berth occupancy, and station logs.", table_cell_style),
            Paragraph("COA-2.1", table_cell_style)
        ],
        [
            Paragraph("6", table_cell_style),
            Paragraph("<b>FOIS Priority Matrix</b>", table_cell_style),
            Paragraph("<code>/fois</code>", table_cell_style),
            Paragraph("Dynamic priority formula (P_i in [1,10]) decomposition, cascading delay budgets (Delta d_i), and financial SLA revenue risk modeling.", table_cell_style),
            Paragraph("FOIS-ICMS-2.0", table_cell_style)
        ],
        [
            Paragraph("7", table_cell_style),
            Paragraph("<b>Operations Terminal</b>", table_cell_style),
            Paragraph("<code>/terminal</code>", table_cell_style),
            Paragraph("Interactive CLI console for dispatchers: status health checks, batch corridor optimization, fleet dumps, and latency diagnostics.", table_cell_style),
            Paragraph("CLI Dispatch", table_cell_style)
        ]
    ]

    t = Table(table_data, colWidths=[20, 100, 75, 235, 74])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COL),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    # Page Break for Detailed Sections
    story.append(PageBreak())

    # Detailed Breakdown of All 7 Pages
    story.append(Paragraph("3. Detailed Technical Breakdown by Page", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10))

    # Page 1: Operations Command
    story.append(Paragraph("Page 1: Operations Command & CRIS Network Topology (index.html)", h2_style))
    p1_desc = """
    <b>Core Purpose:</b> Serves as the executive gateway and overall network health dashboard, displaying live IR network status, summary KPIs across all 4 protocols, and comprehensive fleet monitoring.<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p1_desc, body_style))
    story.append(Paragraph("• <b>Network Scope Telemetry:</b> Displays 8,990 Stations, 5,208 Trains, 10-Year historical delay baseline, and HiGHS MIP optimality status.", bullet_style))
    story.append(Paragraph("• <b>Flagship Fleet Monitoring Table:</b> Interactive table rendering 10 flagship train services enriched with Zone, Route, Stops, 10-Yr Mean Delay, Dynamic Priority (P_i), Allowed Delay Threshold (Delta d_i), Sensitivity band, and Punctuality percentage.", bullet_style))
    story.append(Paragraph("• <b>10-Year Historical Mean Delay Chart:</b> Bar visualizer illustrating average winter operational delays per service (ranging from 19.8m to 62.3m).", bullet_style))
    story.append(Paragraph("• <b>Priority vs. Delay Threshold Bubble Chart:</b> Dynamic 2D spectrum plotting train delay tolerances against priority weights.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 2: Dataset & Historical Analytics
    story.append(Paragraph("Page 2: Real Dataset & Historical Delay Analytics (pages/analytics.html)", h2_style))
    p2_desc = """
    <b>Core Purpose:</b> Deep statistical analytics studio for the 100 historical winter delay records across 10 flagship trains (2016–2025).<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p2_desc, body_style))
    story.append(Paragraph("• <b>100-Record Observation Explorer:</b> Complete historical log displaying Train ID, Name, Number, Route, Year, Scheduled Arrival, Actual Arrival, Delay Minutes, and Punctuality Classification.", bullet_style))
    story.append(Paragraph("• <b>Live Multi-Parameter Filtering:</b> Real-time search bar and year selector (All Years or individual years 2016–2025) with instant record count updates.", bullet_style))
    story.append(Paragraph("• <b>Year-over-Year Trajectory Line Chart:</b> 10-year comparative line chart tracking punctuality fluctuations over 10 winter seasons.", bullet_style))
    story.append(Paragraph("• <b>CSV Dataset Export:</b> One-click generation and browser download of the complete 100-row standard CSV dataset.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 3: BDMS Shadow Block Engine
    story.append(Paragraph("Page 3: BDMS & Shadow Block Synchronization Engine (pages/bdms.html)", h2_style))
    p3_desc = """
    <b>Core Purpose:</b> Protocol 2 engine that merges multi-department maintenance requests into unified Shadow Blocks, preventing redundant corridor shutdowns.<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p3_desc, body_style))
    story.append(Paragraph("• <b>Corridor Candidate Selection:</b> Interactive dropdown for 4 real IR corridors (Northern Trunk, Central Grand Trunk, Southern Ocean Trunk, Eastern Coal Corridor).", bullet_style))
    story.append(Paragraph("• <b>Multi-Department Co-Registration:</b> Synchronizes Track (P-Way), Electrical (OHE), and Signaling (S&T) into a single non-conflicting time window.", bullet_style))
    story.append(Paragraph("• <b>Efficiency Gain Calculation:</b> Computes saved train-minutes (e.g. 840 train-minutes saved by merging 390 total requested minutes into a 165m window).", bullet_style))
    story.append(Paragraph("• <b>Affected Fleet Impact Table:</b> Identifies trains operating through the section and calculates their priority and delay budget.", bullet_style))
    story.append(Paragraph("• <b>Live BDMS JSON Stream:</b> Generates validated <code>cris.bdms.block-request.v3</code> payloads with one-click clipboard copying.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 4: MILP Optimizer & XAI Studio
    story.append(Paragraph("Page 4: MILP Optimizer & Explainable AI Studio (pages/milp.html)", h2_style))
    p4_desc = """
    <b>Core Purpose:</b> Mathematical optimization and Explainable AI (XAI) transparent audit workbench.<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p4_desc, body_style))
    story.append(Paragraph("• <b>Exact HiGHS Solver Execution:</b> Evaluates maintenance yield M_j_eff against total disruption penalty lambda * sum(P_i * Delta d_i) to produce binary decision x_j in {0, 1}.", bullet_style))
    story.append(Paragraph("• <b>Interactive Sensitivity Workbench:</b> Sliders for Penalty Scaling (lambda: 0.1 to 5.0) and Traffic Window Offset (+0h to +4h) with real-time recalculation of decision and net objective value.", bullet_style))
    story.append(Paragraph("• <b>Per-Train Disruption Impact Table:</b> Granular table showing individual train delay minutes, SLA financial exposure (INR), and penalty contributions.", bullet_style))
    story.append(Paragraph("• <b>SHAP Feature Attribution:</b> Transparent natural language and metric breakdown explaining why the decision was approved or rejected.", bullet_style))
    story.append(Paragraph("• <b>Counterfactual 'What-If' Scenarios:</b> Automatic evaluation of alternative maintenance timing windows.", bullet_style))
    story.append(Paragraph("• <b>Live MILP JSON Stream:</b> Outputs <code>cris.milp.optimizer-output.v1</code> schema.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 5: COA Live Telemetry Lab
    story.append(Paragraph("Page 5: COA Live Telemetry & Ingestion Lab (pages/coa.html)", h2_style))
    p5_desc = """
    <b>Core Purpose:</b> Protocol 1 high-frequency telemetry ingestion lab simulating real-time train describer data.<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p5_desc, body_style))
    story.append(Paragraph("• <b>Locomotive Cockpit Gauges:</b> Real-time animated speedometer (km/h) with live jitter, Traction Current (A), Brake Pressure (5.0 bar), ATP status, and GSM-R link.", bullet_style))
    story.append(Paragraph("• <b>Route Topology & Section Berths:</b> Real-time track progression bar and section line berth matrix (Main UP: Occupied, Main DOWN: Clear, Loop Line: Reserved).", bullet_style))
    story.append(Paragraph("• <b>Station Event Log & Punctuality Tracker:</b> Live station log tracking scheduled vs. actual arrival/departure and crew changes.", bullet_style))
    story.append(Paragraph("• <b>Live COA JSON Stream:</b> Emits <code>cris.coa.train-telemetry.v2</code> payloads at 100ms ingestion intervals.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 6: FOIS Priority Matrix
    story.append(Paragraph("Page 6: FOIS & ICMS Dynamic Priority Intelligence (pages/fois.html)", h2_style))
    p6_desc = """
    <b>Core Purpose:</b> Protocol 3 intelligence module computing dynamic priority weights and cascading delay budgets.<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p6_desc, body_style))
    story.append(Paragraph("• <b>Dynamic Priority Decomposition:</b> Computes P_i = alpha*B_cat + beta*L_dist + gamma*V_vol + delta*C_casc (alpha+beta+gamma+delta = 1.0).", bullet_style))
    story.append(Paragraph("• <b>Delay Budget (Delta d_i) Allocation:</b> Calculates allowable tolerance limits before exponential penalty scaling is incurred.", bullet_style))
    story.append(Paragraph("• <b>Financial SLA Risk Modeling:</b> Computes passenger load, PNR revenue (INR Lakhs), and SLA penalty breach rates (up to Rs 15,000/min).", bullet_style))
    story.append(Paragraph("• <b>10-Train Priority Spectrum Chart:</b> Dual-axis bar chart comparing P_i and Delta d_i across the entire fleet.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 7: Operations Terminal
    story.append(Paragraph("Page 7: CRIS Central CLI & Operations Terminal (pages/terminal.html)", h2_style))
    p7_desc = """
    <b>Core Purpose:</b> Low-latency operational terminal and command-line dispatch console for system controllers.<br/>
    <b>Key Tasks & Live Functions:</b>
    """
    story.append(Paragraph(p7_desc, body_style))
    story.append(Paragraph("• <b>Interactive CLI Shell:</b> Supports commands: <code>status</code> (protocol diagnostics), <code>solve</code> (batch MILP solver), <code>fleet</code> (dump priority matrix), <code>telemetry</code> (force GPS refresh), <code>ping</code> (server latency), and <code>clear</code>.", bullet_style))
    story.append(Paragraph("• <b>One-Click Quick Actions:</b> GUI buttons to execute instant operational dispatch routines.", bullet_style))
    story.append(Spacer(1, 14))

    # Architectural Highlights Box
    story.append(KeepTogether([
        Paragraph("4. Architectural Standards & Design Enforcement", h1_style),
        HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8),
        Paragraph("• <b>Strict 100% Crisp White Typography:</b> All chart bars, bubble points, axis labels, legend titles, and table cells utilize #ffffff and #f1f5f9 for maximum legibility over dark glassmorphic backdrops.", bullet_style),
        Paragraph("• <b>Clean Plain Pink Branding:</b> Navigational active states and badges are rendered in flat plain pink (#ec4899) without glowing neon blooming.", bullet_style),
        Paragraph("• <b>Original Full-Color High-Resolution Train Photography:</b> Page backdrops utilize full-saturation train photographs (High-speed HST, WDP4D diesel locomotive, Vande Bharat, etc.) with dark obsidian glass overlays (rgba(10, 13, 22, 0.88)).", bullet_style),
        Paragraph("• <b>Cache-Busting Netlify Deployment:</b> All CSS assets and background images enforce versioned query parameters (?v=3) for instant CDN refresh upon deployment.", bullet_style)
    ]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {pdf_filename}")

if __name__ == "__main__":
    build_pdf()
