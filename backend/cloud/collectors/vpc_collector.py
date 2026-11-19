import requests
import logging
from cloud.collectors.base import BaseCollector
from cloud.sandbox_data import SIMULATED_VPCS, SIMULATED_SECURITY_GROUPS

logger = logging.getLogger("risk_radar.collector.vpc")

class VPCCollector(BaseCollector):
    def __init__(self, auth_manager, region="us-south"):
        super().__init__(auth_manager, region)
        self.service_name = "VPC"
        self.vpc_api_version = "2024-01-01"
        self.base_url = f"https://{self.region}.iaas.cloud.ibm.com/v1"

    def collect(self) -> list:
        self.log_progress("Initiating IBM Cloud VPC & Security Group discovery...")
        resources = []

        if not self.auth.is_live:
            self.log_progress("Using High-Fidelity Simulated Cloud Lab for VPC inspection.")
            # Collect VPCs
            for vpc in SIMULATED_VPCS:
                resources.append({
                    "resource_id": vpc["crn"],
                    "name": vpc["name"],
                    "service": "VPC",
                    "resource_type": "vpc",
                    "region": self.region,
                    "status": vpc.get("status", "available"),
                    "raw_config": vpc
                })
            # Collect Security Groups
            for sg in SIMULATED_SECURITY_GROUPS:
                resources.append({
                    "resource_id": f"crn:v1:bluemix:public:is:{self.region}::::security-group:{sg['id']}",
                    "name": sg["name"],
                    "service": "VPC",
                    "resource_type": "security_group",
                    "region": self.region,
                    "status": "active",
                    "raw_config": sg
                })
            self.log_progress(f"Discovered {len(resources)} VPC & Security Group resources (Lab).")
            return resources

        # Live IBM Cloud VPC Collection
        try:
            token = self.auth.get_token()
            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json"
            }

            # 1. Fetch VPCs
            vpc_url = f"{self.base_url}/vpcs?version={self.vpc_api_version}&generation=2"
            v_resp = requests.get(vpc_url, headers=headers, timeout=12)
            vpcs = []
            if v_resp.status_code == 200:
                vpcs = v_resp.json().get("vpcs", [])
                for v in vpcs:
                    resources.append({
                        "resource_id": v.get("crn", v.get("id")),
                        "name": v.get("name"),
                        "service": "VPC",
                        "resource_type": "vpc",
                        "region": self.region,
                        "status": v.get("status", "available"),
                        "raw_config": v
                    })
                self.log_progress(f"Discovered {len(vpcs)} live IBM Cloud VPC(s).")

            # 2. Fetch Security Groups
            sg_url = f"{self.base_url}/security_groups?version={self.vpc_api_version}&generation=2"
            sg_resp = requests.get(sg_url, headers=headers, timeout=12)
            if sg_resp.status_code == 200:
                sgs = sg_resp.json().get("security_groups", [])
                for sg in sgs:
                    # Retrieve detailed rules for each security group
                    sg_id = sg.get("id")
                    rules_url = f"{self.base_url}/security_groups/{sg_id}/rules?version={self.vpc_api_version}&generation=2"
                    r_resp = requests.get(rules_url, headers=headers, timeout=8)
                    sg_rules = []
                    if r_resp.status_code == 200:
                        sg_rules = r_resp.json().get("rules", [])
                    
                    sg_full = dict(sg)
                    sg_full["rules"] = sg_rules

                    resources.append({
                        "resource_id": sg.get("crn", sg_id),
                        "name": sg.get("name"),
                        "service": "VPC",
                        "resource_type": "security_group",
                        "region": self.region,
                        "status": "active",
                        "raw_config": sg_full
                    })
                self.log_progress(f"Discovered {len(sgs)} live Security Group(s) with rule telemetry.")

            if not resources:
                self.log_progress("No live VPC resources returned. Falling back to Simulated Lab sample.")
                return self._fallback_lab_resources()

            return resources

        except Exception as e:
            logger.error(f"Live VPC Discovery failed: {str(e)}. Using Simulated Cloud Lab dataset.")
            return self._fallback_lab_resources()

    def _fallback_lab_resources(self) -> list:
        res = []
        for vpc in SIMULATED_VPCS:
            res.append({
                "resource_id": vpc["crn"],
                "name": vpc["name"],
                "service": "VPC",
                "resource_type": "vpc",
                "region": self.region,
                "status": vpc.get("status", "available"),
                "raw_config": vpc
            })
        for sg in SIMULATED_SECURITY_GROUPS:
            res.append({
                "resource_id": f"crn:v1:bluemix:public:is:{self.region}::::security-group:{sg['id']}",
                "name": sg["name"],
                "service": "VPC",
                "resource_type": "security_group",
                "region": self.region,
                "status": "active",
                "raw_config": sg
            })
        return res
