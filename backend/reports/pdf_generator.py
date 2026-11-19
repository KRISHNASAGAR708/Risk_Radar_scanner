import os
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from config import Config

class PDFReportGenerator:
    @staticmethod
    def generate(scan_dict: dict, findings: list, compliance_data: dict, output_filename: str = None) -> str:
        """
        Generates an enterprise-grade CSPM Executive PDF Report using ReportLab.
        """
        if not output_filename:
            ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            output_filename = f"RiskRadar_CSPM_Audit_{scan_dict.get('id', 'scan')[:8]}_{ts}.pdf"

        out_path = Path(Config.REPORTS_DIR) / output_filename
        doc = SimpleDocTemplate(
            str(out_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Brand Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0F172A")
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0284C7")
        )
        heading2_style = ParagraphStyle(
            "Heading2Custom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "BodyCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        table_cell = ParagraphStyle(
            "TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#1E293B")
        )
        table_cell_bold = ParagraphStyle(
            "TableCellBold",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#1E293B")
        )

        elements = []

        # --- Header Banner ---
        elements.append(Paragraph("RISK RADAR – IBM CLOUD CSPM", subtitle_style))
        elements.append(Paragraph("Automated Cloud Misconfiguration & Compliance Audit Report", title_style))
        elements.append(Spacer(1, 6))

        mode_label = "LIVE IBM CLOUD AUDIT" if scan_dict.get("mode") == "LIVE_IBM_CLOUD" else "SIMULATED CLOUD LAB AUDIT"
        meta_text = (
            f"<b>Scan Target:</b> IBM Cloud Account ({scan_dict.get('cloud_account_id', 'ibm-cloud')}) | "
            f"<b>Region:</b> {scan_dict.get('region', 'us-south')} | "
            f"<b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | "
            f"<b>Execution Mode:</b> <font color='#0284C7'><b>{mode_label}</b></font>"
        )
        elements.append(Paragraph(meta_text, body_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=14, spaceBefore=8))

        # --- Executive Summary Box ---
        elements.append(Paragraph("1. Executive Summary & Security Posture", heading2_style))
        
        posture = scan_dict.get("posture_score", 100.0)
        grade = scan_dict.get("risk_grade", "A+")
        iso_score = scan_dict.get("iso_compliance_score", 100.0)
        csa_score = scan_dict.get("csa_compliance_score", 100.0)

        summary_data = [
            [
                Paragraph("<b>Overall Posture Score</b>", table_cell_bold),
                Paragraph(f"<b><font size='14' color='{'#10B981' if posture >= 80 else '#EF4444'}'>{posture}% (Grade {grade})</font></b>", table_cell),
                Paragraph("<b>Total Cloud Resources</b>", table_cell_bold),
                Paragraph(str(scan_dict.get("total_resources", 0)), table_cell)
            ],
            [
                Paragraph("<b>Critical Findings</b>", table_cell_bold),
                Paragraph(f"<font color='#EF4444'><b>{scan_dict.get('critical_count', 0)}</b></font>", table_cell),
                Paragraph("<b>ISO 27017 Compliance</b>", table_cell_bold),
                Paragraph(f"<b>{iso_score}%</b>", table_cell)
            ],
            [
                Paragraph("<b>High / Med / Low Findings</b>", table_cell_bold),
                Paragraph(f"{scan_dict.get('high_count', 0)} / {scan_dict.get('medium_count', 0)} / {scan_dict.get('low_count', 0)}", table_cell),
                Paragraph("<b>CSA STAR (CCM v4)</b>", table_cell_bold),
                Paragraph(f"<b>{csa_score}%</b>", table_cell)
            ]
        ]
        summary_table = Table(summary_data, colWidths=[130, 130, 140, 140])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 14))

        # --- Scope of Cloud Services ---
        elements.append(Paragraph("2. Scope of IBM Cloud Services Assessed", heading2_style))
        services_text = (
            "This automated CSPM audit evaluated four core IBM Cloud foundational pillars: "
            "<b>(1) IBM Cloud Object Storage</b>: public access ACLs, permissive CORS, Key Protect customer-managed SSE-KP, and versioning. "
            "<b>(2) IBM Cloud VPC & Security Groups</b>: ingress firewall rules opening ports 22 (SSH), 3389 (RDP), databases (3306, 5432) to 0.0.0.0/0, and Classic Access boundary bypasses. "
            "<b>(3) IBM Cloud IAM</b>: account-level MFA enforcement, wildcard Administrator policies, broad Service IDs, and stale API keys. "
            "<b>(4) IBM Cloud Activity Tracker</b>: control-plane event routes, regional audit coverage gaps, and immutable COS archiving."
        )
        elements.append(Paragraph(services_text, body_style))
        elements.append(Spacer(1, 12))

        # --- Detailed Findings Table ---
        elements.append(Paragraph(f"3. Security Findings & Vulnerabilities ({len(findings)} Total)", heading2_style))
        
        findings_table_data = [
            [
                Paragraph("<b>Sev</b>", table_cell_bold),
                Paragraph("<b>Rule ID</b>", table_cell_bold),
                Paragraph("<b>Vulnerability Title & Resource</b>", table_cell_bold),
                Paragraph("<b>Service</b>", table_cell_bold),
                Paragraph("<b>CVSS</b>", table_cell_bold),
                Paragraph("<b>Compliance Mapping</b>", table_cell_bold)
            ]
        ]

        sev_colors = {
            "CRITICAL": "#EF4444",
            "HIGH": "#F97316",
            "MEDIUM": "#F59E0B",
            "LOW": "#3B82F6"
        }

        for f in findings[:25]: # Render top 25 findings in executive PDF
            sev = f.get("severity", "MEDIUM")
            sev_color = sev_colors.get(sev, "#64748B")
            rule_id = f.get("rule_id", "")
            title = f.get("title", "")
            res_name = f.get("resource_name", "")
            service = f.get("service", "")
            cvss = f.get("cvss_score", 5.0)
            iso_ctrls = ", ".join(f.get("iso27017_controls", []))
            csa_ctrls = ", ".join(f.get("csa_star_controls", []))

            findings_table_data.append([
                Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", table_cell),
                Paragraph(rule_id, table_cell),
                Paragraph(f"<b>{title}</b><br/><font color='#64748B'>Resource: {res_name}</font>", table_cell),
                Paragraph(service, table_cell),
                Paragraph(str(cvss), table_cell),
                Paragraph(f"ISO: {iso_ctrls}<br/>CSA: {csa_ctrls}", table_cell)
            ])

        f_table = Table(findings_table_data, colWidths=[55, 65, 230, 50, 40, 100])
        f_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(f_table)
        elements.append(Spacer(1, 14))

        # --- Compliance Gap Analysis Section ---
        elements.append(Paragraph("4. Compliance Gap Analysis (ISO 27017 & CSA STAR)", heading2_style))
        gap_text = (
            f"Audit verified <b>{iso_score}% compliance with ISO/IEC 27017:2015</b> and "
            f"<b>{csa_score}% compliance with CSA STAR / CCM v4</b> across implemented checks. "
            "Controls marked as failed indicate technical non-compliance requiring remediation before official external certification audits."
        )
        elements.append(Paragraph(gap_text, body_style))
        elements.append(Spacer(1, 8))

        # Build document
        doc.build(elements)
        logger_msg = f"Generated Executive PDF Report at: {out_path}"
        return str(out_path)
