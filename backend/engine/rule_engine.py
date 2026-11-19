import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from config import Config

logger = logging.getLogger("risk_radar.engine")

class SecurityRuleEngine:
    def __init__(self, rules_dir=None):
        self.rules_dir = Path(rules_dir) if rules_dir else Config.RULES_DIR
        self.rules = {}
        self.load_all_rules()

    def load_all_rules(self):
        rule_files = ["cos_rules.json", "vpc_rules.json", "iam_rules.json", "tracker_rules.json"]
        self.rules = {}
        for fname in rule_files:
            fpath = self.rules_dir / fname
            if fpath.exists():
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        rule_list = json.load(f)
                        for r in rule_list:
                            self.rules[r["rule_id"]] = r
                except Exception as e:
                    logger.error(f"Failed to load rule definition {fname}: {e}")
        logger.info(f"Loaded {len(self.rules)} cloud security rules into Rule Engine.")

    def evaluate_all(self, resources: list) -> list:
        """
        Evaluates the full set of collected cloud resources against all registered security rules.
        Returns a list of finding dictionaries.
        """
        findings = []
        for res in resources:
            service = res.get("service")
            res_type = res.get("resource_type")
            cfg = res.get("raw_config", {})
            res_id = res.get("resource_id")
            res_name = res.get("name")

            if service == "COS" and res_type == "bucket":
                findings.extend(self._eval_cos_bucket(res_id, res_name, cfg))
            elif service == "VPC" and res_type == "security_group":
                findings.extend(self._eval_vpc_security_group(res_id, res_name, cfg))
            elif service == "VPC" and res_type == "vpc":
                findings.extend(self._eval_vpc_instance(res_id, res_name, cfg))
            elif service == "IAM" and res_type == "iam_policy":
                findings.extend(self._eval_iam_policy(res_id, res_name, cfg))
            elif service == "IAM" and res_type == "iam_account_settings":
                findings.extend(self._eval_iam_account_settings(res_id, res_name, cfg))
            elif service == "ACTIVITY_TRACKER" and res_type == "activity_tracker_route":
                findings.extend(self._eval_activity_tracker(res_id, res_name, cfg))

        return findings

    # --- COS Evaluation ---
    def _eval_cos_bucket(self, res_id, res_name, cfg) -> list:
        found = []
        # RR-COS-001: Public Storage Bucket
        is_public = cfg.get("public_access", False)
        for grant in cfg.get("acl", {}).get("grants", []):
            if "AllUsers" in grant.get("grantee", {}).get("uri", ""):
                is_public = True
        if is_public:
            found.append(self._create_finding("RR-COS-001", res_id, res_name, "COS", "bucket"))

        # RR-COS-002: Overly Permissive CORS
        for c in cfg.get("cors_rules", []):
            if "*" in c.get("allowed_origins", []):
                found.append(self._create_finding("RR-COS-002", res_id, res_name, "COS", "bucket"))
                break

        # RR-COS-003: Missing Key Protect / SSE-KP
        enc = cfg.get("encryption", {})
        if enc.get("type") != "SSE-KP" or not enc.get("key_protect_crn"):
            found.append(self._create_finding("RR-COS-003", res_id, res_name, "COS", "bucket"))

        # RR-COS-004: Missing Object Versioning
        ver = cfg.get("versioning", {}).get("status", "Disabled")
        if ver.lower() != "enabled":
            found.append(self._create_finding("RR-COS-004", res_id, res_name, "COS", "bucket"))

        # RR-COS-005: Read Data Events Auditing
        act = cfg.get("activity_tracking", {})
        if not act.get("read_data_events", False):
            found.append(self._create_finding("RR-COS-005", res_id, res_name, "COS", "bucket"))

        return found

    # --- VPC Evaluation ---
    def _eval_vpc_security_group(self, res_id, res_name, cfg) -> list:
        found = []
        rules = cfg.get("rules", [])
        is_default_sg = "default" in res_name.lower() or "default" in cfg.get("id", "").lower()

        ssh_found = False
        rdp_found = False
        db_found = False
        mgmt_found = False
        any_inbound_found = False

        db_ports = {3306, 5432, 1433, 27017, 6379, 1521}
        mgmt_ports = {8080, 8443, 9090, 8888, 10000}

        for r in rules:
            if r.get("direction") != "inbound":
                continue
            remote_cidr = r.get("remote", {}).get("cidr_block") or ""
            is_open = remote_cidr == "0.0.0.0/0"
            proto = r.get("protocol", "tcp")
            p_min = r.get("port_min")
            p_max = r.get("port_max")

            if is_open:
                if proto == "all":
                    any_inbound_found = True
                    ssh_found = True
                    rdp_found = True
                    db_found = True
                elif p_min is not None and p_max is not None:
                    # Check SSH (22)
                    if p_min <= 22 <= p_max:
                        ssh_found = True
                    # Check RDP (3389)
                    if p_min <= 3389 <= p_max:
                        rdp_found = True
                    # Check DB ports
                    for dbp in db_ports:
                        if p_min <= dbp <= p_max:
                            db_found = True
                            break
                    # Check Mgmt web ports
                    for mgp in mgmt_ports:
                        if p_min <= mgp <= p_max:
                            mgmt_found = True
                            break

        if ssh_found:
            found.append(self._create_finding("RR-VPC-001", res_id, res_name, "VPC", "security_group"))
        if rdp_found:
            found.append(self._create_finding("RR-VPC-002", res_id, res_name, "VPC", "security_group"))
        if db_found:
            found.append(self._create_finding("RR-VPC-003", res_id, res_name, "VPC", "security_group"))
        if is_default_sg and (any_inbound_found or len(rules) > 0):
            found.append(self._create_finding("RR-VPC-004", res_id, res_name, "VPC", "security_group"))
        if mgmt_found:
            found.append(self._create_finding("RR-VPC-005", res_id, res_name, "VPC", "security_group"))

        return found

    def _eval_vpc_instance(self, res_id, res_name, cfg) -> list:
        found = []
        if cfg.get("classic_access") is True:
            found.append(self._create_finding("RR-VPC-006", res_id, res_name, "VPC", "vpc"))
        return found

    # --- IAM Evaluation ---
    def _eval_iam_policy(self, res_id, res_name, cfg) -> list:
        found = []
        roles = [r.get("role_id", "").split(":")[-1] for r in cfg.get("roles", [])]
        resources = cfg.get("resources", [])

        has_wildcard_service = False
        has_wildcard_rg = False

        for res in resources:
            for attr in res.get("attributes", []):
                if attr.get("name") == "serviceType" and attr.get("value") == "*":
                    has_wildcard_service = True
                if attr.get("name") == "resourceGroupId" and attr.get("value") == "*":
                    has_wildcard_rg = True

        # RR-IAM-001: Wildcard Admin over all services
        if "Administrator" in roles and has_wildcard_service:
            found.append(self._create_finding("RR-IAM-001", res_id, res_name, "IAM", "iam_policy"))

        # RR-IAM-003: Service ID excessive manager scope
        subject = cfg.get("subject", {}).get("attributes", [])
        is_service_id = any("ServiceId" in a.get("value", "") for a in subject) or "service" in res_name.lower()
        if is_service_id and ("Manager" in roles or "Administrator" in roles) and has_wildcard_rg:
            found.append(self._create_finding("RR-IAM-003", res_id, res_name, "IAM", "iam_policy"))

        return found

    def _eval_iam_account_settings(self, res_id, res_name, cfg) -> list:
        found = []
        # RR-IAM-002: Missing Account MFA
        mfa_status = cfg.get("mfa", "NONE").upper()
        if mfa_status in ["NONE", "DISABLED", "TOTP_DISABLED"]:
            found.append(self._create_finding("RR-IAM-002", res_id, res_name, "IAM", "iam_account_settings"))

        # RR-IAM-004: Old unrotated API Keys (> 90 days)
        api_keys = cfg.get("api_keys", [])
        has_old_key = False
        now = datetime.now(timezone.utc)
        for k in api_keys:
            c_date_str = k.get("created_at")
            if c_date_str:
                try:
                    c_date = datetime.fromisoformat(c_date_str.replace("Z", "+00:00"))
                    if (now - c_date).days > 90:
                        has_old_key = True
                        break
                except Exception:
                    pass
        if has_old_key:
            found.append(self._create_finding("RR-IAM-004", res_id, res_name, "IAM", "iam_account_settings"))

        # RR-IAM-005: Allowed IP restrictions not configured
        allowed_ips = cfg.get("allowed_ip_addresses", [])
        if not allowed_ips:
            found.append(self._create_finding("RR-IAM-005", res_id, res_name, "IAM", "iam_account_settings"))

        return found

    # --- Activity Tracker Evaluation ---
    def _eval_activity_tracker(self, res_id, res_name, cfg) -> list:
        found = []
        # RR-TRK-001: Missing Route in active region
        gap_regions = cfg.get("monitoring_gap_regions", [])
        if gap_regions:
            found.append(self._create_finding("RR-TRK-001", res_id, res_name, "ACTIVITY_TRACKER", "activity_tracker_route"))

        # RR-TRK-002: Not archived to COS
        targets = cfg.get("targets", [])
        has_cos_target = any(t.get("type") == "cloud_object_storage" for t in targets)
        if not has_cos_target:
            found.append(self._create_finding("RR-TRK-002", res_id, res_name, "ACTIVITY_TRACKER", "activity_tracker_route"))

        # RR-TRK-003: Critical Event Alerts
        if not cfg.get("critical_event_alerts_configured", False):
            found.append(self._create_finding("RR-TRK-003", res_id, res_name, "ACTIVITY_TRACKER", "activity_tracker_route"))

        return found

    def _create_finding(self, rule_id, res_id, res_name, service, res_type) -> dict:
        r = self.rules.get(rule_id, {})
        return {
            "rule_id": rule_id,
            "title": r.get("title", f"Security Finding {rule_id}"),
            "severity": r.get("severity", "MEDIUM"),
            "cvss_score": r.get("cvss_score", 5.0),
            "service": service,
            "resource_type": res_type,
            "resource_id": res_id,
            "resource_name": res_name,
            "description": r.get("description", ""),
            "rationale": r.get("rationale", ""),
            "remediation_summary": r.get("remediation", {}).get("summary", ""),
            "ibmcloud_cli": r.get("remediation", {}).get("ibmcloud_cli", "").replace("<BUCKET_NAME>", res_name).replace("<SECURITY_GROUP_ID>", res_id.split(":")[-1]),
            "console_steps": r.get("remediation", {}).get("console_steps", ""),
            "iso27017_controls": r.get("compliance_mappings", {}).get("iso27017", []),
            "csa_star_controls": r.get("compliance_mappings", {}).get("csa_star", []),
            "status": "OPEN"
        }
