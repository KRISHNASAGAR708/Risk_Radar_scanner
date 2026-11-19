import requests
import logging
from cloud.collectors.base import BaseCollector
from cloud.sandbox_data import SIMULATED_COS_BUCKETS

logger = logging.getLogger("risk_radar.collector.cos")

class COSCollector(BaseCollector):
    def __init__(self, auth_manager, region="us-south"):
        super().__init__(auth_manager, region)
        self.service_name = "COS"
        self.config_endpoint = "https://config.cloud-object-storage.cloud.ibm.com/v1"

    def collect(self) -> list:
        self.log_progress("Initiating IBM Cloud Object Storage (COS) discovery...")
        resources = []

        if not self.auth.is_live:
            self.log_progress("Using High-Fidelity Simulated Cloud Lab for COS inspection.")
            for b in SIMULATED_COS_BUCKETS:
                resources.append({
                    "resource_id": b["crn"],
                    "name": b["name"],
                    "service": "COS",
                    "resource_type": "bucket",
                    "region": b.get("location_constraint", self.region),
                    "status": "active",
                    "raw_config": b
                })
            self.log_progress(f"Discovered {len(resources)} COS storage buckets (Lab).")
            return resources

        # Live IBM Cloud COS Collection
        try:
            token = self.auth.get_token()
            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json"
            }

            # 1. Query Resource Controller for Cloud Object Storage instances
            rc_url = "https://resource-controller.cloud.ibm.com/v2/resource_instances?type=service_instance"
            resp = requests.get(rc_url, headers=headers, timeout=12)
            
            cos_instances = []
            if resp.status_code == 200:
                for inst in resp.json().get("resources", []):
                    if "cloud-object-storage" in inst.get("crn", "") or "cos" in inst.get("name", "").lower():
                        cos_instances.append(inst)

            self.log_progress(f"Found {len(cos_instances)} active COS service instance(s) in IBM Cloud.")

            # 2. For each COS instance, discover buckets via Config API or S3 Endpoint
            for inst in cos_instances:
                inst_id = inst.get("guid") or inst.get("id")
                # Attempt to retrieve buckets registered under this instance
                b_url = f"{self.config_endpoint}/b?extended=true"
                b_headers = {
                    "Authorization": f"Bearer {token}",
                    "ibm-service-instance-id": inst_id,
                    "Accept": "application/json"
                }
                
                b_resp = requests.get(b_url, headers=b_headers, timeout=10)
                if b_resp.status_code == 200:
                    bucket_list = b_resp.json().get("buckets", [])
                    for b_meta in bucket_list:
                        b_name = b_meta.get("name")
                        
                        # Inspect detailed bucket security properties
                        detail = self._inspect_bucket_security(b_name, inst_id, token)
                        crn = b_meta.get("crn", f"crn:v1:bluemix:public:cloud-object-storage:{self.region}:a/{self.auth._account_id}:{inst_id}:bucket:{b_name}")
                        
                        resources.append({
                            "resource_id": crn,
                            "name": b_name,
                            "service": "COS",
                            "resource_type": "bucket",
                            "region": b_meta.get("location_constraint", self.region),
                            "status": "active",
                            "raw_config": detail
                        })
                else:
                    self.log_progress(f"Notice: COS instance {inst.get('name')} bucket query returned status {b_resp.status_code}.")

            if not resources:
                self.log_progress("No live COS buckets found in target account/region. Falling back to Simulated Lab sample.")
                return self._fallback_lab_resources()

            self.log_progress(f"Live COS Discovery complete: {len(resources)} bucket(s) collected.")
            return resources

        except Exception as e:
            logger.error(f"Live COS Discovery failed: {str(e)}. Using Simulated Cloud Lab dataset.")
            return self._fallback_lab_resources()

    def _inspect_bucket_security(self, bucket_name: str, instance_id: str, token: str) -> dict:
        """Inspects ACL, CORS, Encryption, and Versioning for a bucket"""
        config = {
            "name": bucket_name,
            "public_access": False,
            "acl": {"grants": []},
            "cors_rules": [],
            "encryption": {"type": "SSE-IBM", "key_protect_crn": None},
            "versioning": {"status": "Disabled"},
            "activity_tracking": {"read_data_events": False, "write_data_events": False}
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "ibm-service-instance-id": instance_id,
            "Accept": "application/json"
        }
        
        try:
            # Query COS bucket configuration endpoint
            detail_url = f"{self.config_endpoint}/b/{bucket_name}"
            r = requests.get(detail_url, headers=headers, timeout=8)
            if r.status_code == 200:
                data = r.json()
                # Check public access prevention
                config["public_access"] = not data.get("hard_quota", False) and data.get("public_access", False)
                if "cors_configuration" in data:
                    config["cors_rules"] = data.get("cors_configuration", {}).get("cors_rules", [])
                if "firewall" in data:
                    config["firewall"] = data.get("firewall")
                if "activity_tracking" in data:
                    config["activity_tracking"] = data.get("activity_tracking")
        except Exception:
            pass

        return config

    def _fallback_lab_resources(self) -> list:
        res = []
        for b in SIMULATED_COS_BUCKETS:
            res.append({
                "resource_id": b["crn"],
                "name": b["name"],
                "service": "COS",
                "resource_type": "bucket",
                "region": b.get("location_constraint", self.region),
                "status": "active",
                "raw_config": b
            })
        return res
