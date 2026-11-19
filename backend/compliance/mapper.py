import json
import logging
from pathlib import Path
from config import Config

logger = logging.getLogger("risk_radar.compliance")

class ComplianceMapper:
    def __init__(self, compliance_dir=None):
        self.comp_dir = Path(compliance_dir) if compliance_dir else Config.COMPLIANCE_DIR
        self.iso_controls = []
        self.csa_controls = []
        self.load_frameworks()

    def load_frameworks(self):
        iso_path = self.comp_dir / "iso27017.json"
        csa_path = self.comp_dir / "csa_star.json"

        if iso_path.exists():
            with open(iso_path, "r", encoding="utf-8") as f:
                self.iso_controls = json.load(f)
        if csa_path.exists():
            with open(csa_path, "r", encoding="utf-8") as f:
                self.csa_controls = json.load(f)

    def evaluate_compliance(self, findings: list) -> dict:
        """
        Calculates compliance status for ISO 27017 and CSA STAR (CCM v4).
        Only assesses controls that have defined automated rules.
        """
        # Map findings by rule_id
        active_violations_by_rule = {}
        for f in findings:
            r_id = f.get("rule_id")
            if r_id not in active_violations_by_rule:
                active_violations_by_rule[r_id] = []
            active_violations_by_rule[r_id].append(f)

        # 1. Evaluate ISO 27017
        iso_results = []
        iso_passed = 0
        iso_failed = 0
        iso_gaps = []

        for ctrl in self.iso_controls:
            c_id = ctrl["control_id"]
            mapped_rules = ctrl.get("rules_mapped", [])
            failing_findings = []
            for r in mapped_rules:
                if r in active_violations_by_rule:
                    failing_findings.extend(active_violations_by_rule[r])

            is_compliant = len(failing_findings) == 0
            if is_compliant:
                iso_passed += 1
            else:
                iso_failed += 1
                iso_gaps.append({
                    "framework": "ISO/IEC 27017",
                    "control_id": c_id,
                    "title": ctrl["title"],
                    "domain": ctrl.get("domain", ""),
                    "description": ctrl["description"],
                    "violations_count": len(failing_findings),
                    "affected_resources": list(set([f["resource_name"] for f in failing_findings]))
                })

            iso_results.append({
                "control_id": c_id,
                "clause": ctrl.get("clause", ""),
                "title": ctrl["title"],
                "domain": ctrl.get("domain", ""),
                "description": ctrl["description"],
                "status": "PASS" if is_compliant else "FAIL",
                "violations_count": len(failing_findings),
                "failing_findings": [f["title"] for f in failing_findings]
            })

        iso_score = (iso_passed / len(self.iso_controls) * 100.0) if self.iso_controls else 100.0

        # 2. Evaluate CSA STAR / CCM v4
        csa_results = []
        csa_passed = 0
        csa_failed = 0
        csa_gaps = []
        csa_domains = {}

        for ctrl in self.csa_controls:
            c_id = ctrl["control_id"]
            domain = ctrl.get("domain", "General")
            mapped_rules = ctrl.get("rules_mapped", [])
            failing_findings = []
            for r in mapped_rules:
                if r in active_violations_by_rule:
                    failing_findings.extend(active_violations_by_rule[r])

            is_compliant = len(failing_findings) == 0
            if is_compliant:
                csa_passed += 1
            else:
                csa_failed += 1
                csa_gaps.append({
                    "framework": "CSA STAR (CCM v4)",
                    "control_id": c_id,
                    "title": ctrl["title"],
                    "domain": domain,
                    "description": ctrl["description"],
                    "violations_count": len(failing_findings),
                    "affected_resources": list(set([f["resource_name"] for f in failing_findings]))
                })

            # Domain aggregation
            if domain not in csa_domains:
                csa_domains[domain] = {"total": 0, "passed": 0, "failed": 0}
            csa_domains[domain]["total"] += 1
            if is_compliant:
                csa_domains[domain]["passed"] += 1
            else:
                csa_domains[domain]["failed"] += 1

            csa_results.append({
                "control_id": c_id,
                "domain": domain,
                "title": ctrl["title"],
                "description": ctrl["description"],
                "status": "PASS" if is_compliant else "FAIL",
                "violations_count": len(failing_findings),
                "failing_findings": [f["title"] for f in failing_findings]
            })

        csa_score = (csa_passed / len(self.csa_controls) * 100.0) if self.csa_controls else 100.0

        # Domain percentage
        domain_summary = {}
        for d, vals in csa_domains.items():
            domain_summary[d] = {
                "total": vals["total"],
                "passed": vals["passed"],
                "failed": vals["failed"],
                "score": round((vals["passed"] / vals["total"] * 100.0), 1) if vals["total"] else 100.0
            }

        return {
            "iso27017": {
                "score": round(iso_score, 1),
                "total_controls": len(self.iso_controls),
                "passed": iso_passed,
                "failed": iso_failed,
                "controls": iso_results,
                "gaps": iso_gaps
            },
            "csa_star": {
                "score": round(csa_score, 1),
                "total_controls": len(self.csa_controls),
                "passed": csa_passed,
                "failed": csa_failed,
                "domain_summary": domain_summary,
                "controls": csa_results,
                "gaps": csa_gaps
            },
            "combined_gap_analysis": iso_gaps + csa_gaps
        }
