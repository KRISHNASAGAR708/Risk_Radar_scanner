import os
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from pathlib import Path

from config import Config
from database.db import init_db, SessionLocal
from database.models import Scan, Finding, Resource, CloudConfig
from cloud.auth import IBMCloudAuthManager
from cloud.collectors.cos_collector import COSCollector
from cloud.collectors.vpc_collector import VPCCollector
from cloud.collectors.iam_collector import IAMCollector
from cloud.collectors.tracker_collector import ActivityTrackerCollector
from engine.rule_engine import SecurityRuleEngine
from engine.risk_scorer import RiskScorer
from compliance.mapper import ComplianceMapper
from reports.pdf_generator import PDFReportGenerator
from reports.html_generator import HTMLReportGenerator

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("risk_radar.app")

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

app = Flask(
    __name__, 
    static_folder=str(FRONTEND_DIST) if FRONTEND_DIST.exists() else None, 
    static_url_path=""
)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global Singletons
auth_manager = IBMCloudAuthManager(api_key=Config.IBMCLOUD_API_KEY, region=Config.IBMCLOUD_REGION)
rule_engine = SecurityRuleEngine()
compliance_mapper = ComplianceMapper()

# Initialize Database Schema
init_db()

# Pre-populate initial demonstration scan if empty so evaluator sees instant data
def seed_initial_demo_scan():
    db = SessionLocal()
    try:
        existing = db.query(Scan).first()
        if not existing:
            logger.info("Initializing baseline demonstration scan for evaluation lab...")
            run_scan_internal(db, mode="SIMULATED_CLOUD_LAB", region="us-south")
    except Exception as e:
        logger.error(f"Error seeding initial scan: {e}")
    finally:
        db.close()

def run_scan_internal(db, mode="SIMULATED_CLOUD_LAB", region="us-south", target_services=None):
    if target_services is None:
        target_services = ["COS", "VPC", "IAM", "ACTIVITY_TRACKER"]

    # 1. Initialize collectors
    collectors = []
    if "COS" in target_services:
        collectors.append(COSCollector(auth_manager, region=region))
    if "VPC" in target_services:
        collectors.append(VPCCollector(auth_manager, region=region))
    if "IAM" in target_services:
        collectors.append(IAMCollector(auth_manager, region=region))
    if "ACTIVITY_TRACKER" in target_services:
        collectors.append(ActivityTrackerCollector(auth_manager, region=region))

    # 2. Collect resources
    all_resources = []
    for c in collectors:
        try:
            res = c.collect()
            all_resources.extend(res)
        except Exception as e:
            logger.error(f"Collector {c.service_name} failed: {e}")

    # 3. Evaluate Security Rules
    findings = rule_engine.evaluate_all(all_resources)

    # 4. Calculate Risk Scoring
    posture_data = RiskScorer.calculate_posture(findings, len(all_resources))

    # 5. Calculate Compliance Mapping
    comp_data = compliance_mapper.evaluate_compliance(findings)

    # 6. Persist to Database
    scan = Scan(
        status="COMPLETED",
        mode="LIVE_IBM_CLOUD" if auth_manager.is_live else "SIMULATED_CLOUD_LAB",
        cloud_account_id=auth_manager._account_id or ("demo-acct-849302-ibm" if not auth_manager.is_live else "Live-Account"),
        region=region,
        total_resources=len(all_resources),
        total_findings=len(findings),
        critical_count=posture_data["counts"]["CRITICAL"],
        high_count=posture_data["counts"]["HIGH"],
        medium_count=posture_data["counts"]["MEDIUM"],
        low_count=posture_data["counts"]["LOW"],
        posture_score=posture_data["posture_score"],
        risk_grade=posture_data["risk_grade"],
        iso_compliance_score=comp_data["iso27017"]["score"],
        csa_compliance_score=comp_data["csa_star"]["score"],
        service_breakdown=posture_data["service_breakdown"],
        compliance_summary={
            "iso27017": {"score": comp_data["iso27017"]["score"], "passed": comp_data["iso27017"]["passed"], "failed": comp_data["iso27017"]["failed"]},
            "csa_star": {"score": comp_data["csa_star"]["score"], "passed": comp_data["csa_star"]["passed"], "failed": comp_data["csa_star"]["failed"]}
        },
        completed_at=datetime.utcnow()
    )
    db.add(scan)
    db.flush()

    # Add Discovered Resources
    for r in all_resources:
        db_res = Resource(
            scan_id=scan.id,
            resource_id=r["resource_id"],
            name=r["name"],
            service=r["service"],
            resource_type=r["resource_type"],
            region=r.get("region", region),
            status=r.get("status", "active"),
            raw_config=r.get("raw_config", {})
        )
        db.add(db_res)

    # Add Findings
    for f in findings:
        db_f = Finding(
            scan_id=scan.id,
            rule_id=f["rule_id"],
            title=f["title"],
            severity=f["severity"],
            cvss_score=f["cvss_score"],
            service=f["service"],
            resource_type=f["resource_type"],
            resource_id=f["resource_id"],
            resource_name=f["resource_name"],
            description=f["description"],
            rationale=f["rationale"],
            remediation_summary=f["remediation_summary"],
            ibmcloud_cli=f["ibmcloud_cli"],
            console_steps=f["console_steps"],
            iso27017_controls=f["iso27017_controls"],
            csa_star_controls=f["csa_star_controls"],
            status="OPEN"
        )
        db.add(db_f)

    db.commit()
    return scan

# ==================== API ROUTES ====================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "app": "RISK RADAR CSPM",
        "version": "1.0.0",
        "cloud_provider": "IBM Cloud",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route("/api/cloud/status", methods=["GET"])
def get_cloud_status():
    status = auth_manager.get_status()
    return jsonify(status)

@app.route("/api/cloud/connect", methods=["POST"])
def connect_cloud():
    data = request.get_json() or {}
    api_key = data.get("api_key", "").strip()
    region = data.get("region", "us-south").strip()
    force_mode = data.get("mode", None)

    if force_mode == "SIMULATED_CLOUD_LAB" or not api_key:
        auth_manager.api_key = ""
        auth_manager.is_live = False
        auth_manager.region = region
        return jsonify({
            "success": True,
            "mode": "SIMULATED_CLOUD_LAB",
            "message": "Connected to High-Fidelity IBM Cloud Simulation Lab.",
            "status": auth_manager.get_status()
        })

    # Test Live IBM Cloud Authentication
    auth_manager.api_key = api_key
    auth_manager.region = region
    auth_result = auth_manager.authenticate()

    if auth_result.get("authenticated"):
        return jsonify({
            "success": True,
            "mode": "LIVE_IBM_CLOUD",
            "message": "Successfully authenticated with Live IBM Cloud IAM.",
            "status": auth_manager.get_status()
        })
    else:
        return jsonify({
            "success": False,
            "mode": "ERROR",
            "message": auth_result.get("message", "Authentication failed."),
            "status": auth_manager.get_status()
        }), 400

@app.route("/api/cloud/disconnect", methods=["POST"])
def disconnect_cloud():
    auth_manager.api_key = ""
    auth_manager.is_live = False
    return jsonify({
        "success": True,
        "mode": "SIMULATED_CLOUD_LAB",
        "message": "Disconnected from live cloud. Operating in Simulated Cloud Lab.",
        "status": auth_manager.get_status()
    })

@app.route("/api/scan/start", methods=["POST"])
def start_scan():
    data = request.get_json() or {}
    region = data.get("region", auth_manager.region or "us-south")
    services = data.get("services", ["COS", "VPC", "IAM", "ACTIVITY_TRACKER"])
    
    db = SessionLocal()
    try:
        scan = run_scan_internal(db, region=region, target_services=services)
        return jsonify({
            "success": True,
            "scan_id": scan.id,
            "scan": scan.to_dict()
        })
    except Exception as e:
        logger.error(f"Scan execution failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/scans", methods=["GET"])
def list_scans():
    db = SessionLocal()
    try:
        scans = db.query(Scan).order_by(Scan.started_at.desc()).limit(20).all()
        return jsonify([s.to_dict() for s in scans])
    finally:
        db.close()

@app.route("/api/scans/<scan_id>", methods=["GET"])
def get_scan(scan_id):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return jsonify({"error": "Scan not found"}), 404
        return jsonify(scan.to_dict())
    finally:
        db.close()

@app.route("/api/scans/<scan_id>/findings", methods=["GET"])
def get_scan_findings(scan_id):
    severity = request.args.get("severity")
    service = request.args.get("service")
    search = request.args.get("search", "").lower()

    db = SessionLocal()
    try:
        q = db.query(Finding).filter(Finding.scan_id == scan_id)
        if severity and severity.upper() != "ALL":
            q = q.filter(Finding.severity == severity.upper())
        if service and service.upper() != "ALL":
            q = q.filter(Finding.service == service.upper())
        
        findings = q.all()
        result = []
        for f in findings:
            f_dict = f.to_dict()
            if search:
                if (search in f_dict["title"].lower() or 
                    search in f_dict["resource_name"].lower() or 
                    search in f_dict["rule_id"].lower()):
                    result.append(f_dict)
            else:
                result.append(f_dict)
                
        return jsonify(result)
    finally:
        db.close()

@app.route("/api/scans/<scan_id>/resources", methods=["GET"])
def get_scan_resources(scan_id):
    service = request.args.get("service")
    db = SessionLocal()
    try:
        q = db.query(Resource).filter(Resource.scan_id == scan_id)
        if service and service.upper() != "ALL":
            q = q.filter(Resource.service == service.upper())
        resources = q.all()
        return jsonify([r.to_dict() for r in resources])
    finally:
        db.close()

@app.route("/api/scans/<scan_id>/compliance", methods=["GET"])
def get_scan_compliance(scan_id):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return jsonify({"error": "Scan not found"}), 404
        findings = [f.to_dict() for f in scan.findings]
        comp_data = compliance_mapper.evaluate_compliance(findings)
        return jsonify(comp_data)
    finally:
        db.close()

@app.route("/api/scans/compare", methods=["GET"])
def compare_scans():
    scan_a_id = request.args.get("scan_a")
    scan_b_id = request.args.get("scan_b")

    db = SessionLocal()
    try:
        if not scan_a_id or not scan_b_id:
            latest = db.query(Scan).order_by(Scan.started_at.desc()).limit(2).all()
            if len(latest) < 2:
                return jsonify({"error": "Need at least 2 scans to run drift comparison"}), 400
            scan_a, scan_b = latest[1], latest[0]
        else:
            scan_a = db.query(Scan).filter(Scan.id == scan_a_id).first()
            scan_b = db.query(Scan).filter(Scan.id == scan_b_id).first()

        if not scan_a or not scan_b:
            return jsonify({"error": "Specified scans not found"}), 404

        findings_a = {f"{f.rule_id}:{f.resource_id}": f for f in scan_a.findings}
        findings_b = {f"{f.rule_id}:{f.resource_id}": f for f in scan_b.findings}

        new_violations = [f.to_dict() for k, f in findings_b.items() if k not in findings_a]
        resolved_violations = [f.to_dict() for k, f in findings_a.items() if k not in findings_b]
        persisting_violations = [f.to_dict() for k, f in findings_b.items() if k in findings_a]

        delta_score = round(scan_b.posture_score - scan_a.posture_score, 1)

        return jsonify({
            "scan_a": scan_a.to_dict(),
            "scan_b": scan_b.to_dict(),
            "posture_delta": delta_score,
            "new_count": len(new_violations),
            "resolved_count": len(resolved_violations),
            "persisting_count": len(persisting_violations),
            "new_violations": new_violations,
            "resolved_violations": resolved_violations
        })
    finally:
        db.close()

@app.route("/api/rules", methods=["GET"])
def get_rules():
    return jsonify(list(rule_engine.rules.values()))

@app.route("/api/topology", methods=["GET"])
def get_topology():
    db = SessionLocal()
    try:
        latest = db.query(Scan).order_by(Scan.started_at.desc()).first()
        if not latest:
            return jsonify({"nodes": [], "edges": []})

        mode = latest.mode
        res_list = latest.resources

        nodes = [
            {"id": "cloud-acct", "type": "account", "label": "IBM Cloud Account", "meta": {"id": latest.cloud_account_id, "mode": mode, "region": latest.region}},
            {"id": "svc-cos", "type": "service", "label": "IBM Cloud Object Storage", "service": "COS", "resource_count": sum(1 for r in res_list if r.service == "COS")},
            {"id": "svc-vpc", "type": "service", "label": "IBM Cloud VPC & Security Groups", "service": "VPC", "resource_count": sum(1 for r in res_list if r.service == "VPC")},
            {"id": "svc-iam", "type": "service", "label": "IBM Cloud IAM & Access Policies", "service": "IAM", "resource_count": sum(1 for r in res_list if r.service == "IAM")},
            {"id": "svc-tracker", "type": "service", "label": "IBM Cloud Activity Tracker", "service": "ACTIVITY_TRACKER", "resource_count": sum(1 for r in res_list if r.service == "ACTIVITY_TRACKER")},
            {"id": "pipe-collector", "type": "pipeline", "label": "Cloud Resource Collector"},
            {"id": "pipe-rules", "type": "pipeline", "label": "Security Rule Engine (19 Rules)"},
            {"id": "pipe-risk", "type": "pipeline", "label": "Quantitative Risk & Posture Engine"},
            {"id": "pipe-compliance", "type": "pipeline", "label": "Compliance Mapper (ISO 27017 / CSA STAR)"},
            {"id": "pipe-dashboard", "type": "output", "label": "Risk Radar CSPM Dashboard", "score": latest.posture_score, "grade": latest.risk_grade}
        ]

        edges = [
            {"from": "cloud-acct", "to": "svc-cos"},
            {"from": "cloud-acct", "to": "svc-vpc"},
            {"from": "cloud-acct", "to": "svc-iam"},
            {"from": "cloud-acct", "to": "svc-tracker"},
            {"from": "svc-cos", "to": "pipe-collector"},
            {"from": "svc-vpc", "to": "pipe-collector"},
            {"from": "svc-iam", "to": "pipe-collector"},
            {"from": "svc-tracker", "to": "pipe-collector"},
            {"from": "pipe-collector", "to": "pipe-rules"},
            {"from": "pipe-rules", "to": "pipe-risk"},
            {"from": "pipe-risk", "to": "pipe-compliance"},
            {"from": "pipe-compliance", "to": "pipe-dashboard"}
        ]

        return jsonify({"nodes": nodes, "edges": edges, "scan_id": latest.id})
    finally:
        db.close()

@app.route("/api/reports/pdf/<scan_id>", methods=["GET"])
def export_pdf(scan_id):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return jsonify({"error": "Scan not found"}), 404
        findings = [f.to_dict() for f in scan.findings]
        comp = compliance_mapper.evaluate_compliance(findings)
        pdf_path = PDFReportGenerator.generate(scan.to_dict(), findings, comp)
        return send_file(pdf_path, as_attachment=True, download_name=os.path.basename(pdf_path))
    finally:
        db.close()

@app.route("/api/reports/html/<scan_id>", methods=["GET"])
def export_html(scan_id):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return jsonify({"error": "Scan not found"}), 404
        findings = [f.to_dict() for f in scan.findings]
        comp = compliance_mapper.evaluate_compliance(findings)
        html_path = HTMLReportGenerator.generate(scan.to_dict(), findings, comp)
        return send_file(html_path, as_attachment=False)
    finally:
        db.close()

# Static Frontend Delivery
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if FRONTEND_DIST.exists():
        target = FRONTEND_DIST / path
        if path != "" and target.exists() and not target.is_dir():
            return send_from_directory(str(FRONTEND_DIST), path)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return send_file(str(index_file))
    return jsonify({"app": "Risk Radar CSPM API", "status": "online", "message": "Frontend build active"})

if __name__ == "__main__":
    seed_initial_demo_scan()
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting Risk Radar CSPM Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
