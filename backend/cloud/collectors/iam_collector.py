import requests
import logging
from cloud.collectors.base import BaseCollector
from cloud.sandbox_data import SIMULATED_IAM_POLICIES, SIMULATED_IAM_ACCOUNT_SETTINGS

logger = logging.getLogger("risk_radar.collector.iam")

class IAMCollector(BaseCollector):
    def __init__(self, auth_manager, region="us-south"):
        super().__init__(auth_manager, region)
        self.service_name = "IAM"
        self.iam_base = "https://iam.cloud.ibm.com"

    def collect(self) -> list:
        self.log_progress("Initiating IBM Cloud IAM policies & access configuration discovery...")
        resources = []

        if not self.auth.is_live:
            self.log_progress("Using High-Fidelity Simulated Cloud Lab for IAM inspection.")
            # 1. IAM Policies
            for pol in SIMULATED_IAM_POLICIES:
                resources.append({
                    "resource_id": f"crn:v1:bluemix:public:iam::::policy:{pol['id']}",
                    "name": pol.get("description", pol["id"]),
                    "service": "IAM",
                    "resource_type": "iam_policy",
                    "region": "global",
                    "status": "active",
                    "raw_config": pol
                })
            # 2. IAM Account Settings & MFA Configuration
            resources.append({
                "resource_id": f"crn:v1:bluemix:public:iam::::account-settings:{SIMULATED_IAM_ACCOUNT_SETTINGS['account_id']}",
                "name": "IAM Global Account Security & MFA Configuration",
                "service": "IAM",
                "resource_type": "iam_account_settings",
                "region": "global",
                "status": "active",
                "raw_config": SIMULATED_IAM_ACCOUNT_SETTINGS
            })
            self.log_progress(f"Discovered {len(resources)} IAM policy & account configuration resources (Lab).")
            return resources

        # Live IBM Cloud IAM Collection
        try:
            token = self.auth.get_token()
            account_id = self.auth._account_id
            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json"
            }

            # 1. Fetch IAM Access Policies for Account
            if account_id:
                pol_url = f"{self.iam_base}/v1/policies?account_id={account_id}"
                p_resp = requests.get(pol_url, headers=headers, timeout=12)
                if p_resp.status_code == 200:
                    policies = p_resp.json().get("policies", [])
                    for pol in policies:
                        resources.append({
                            "resource_id": pol.get("id"),
                            "name": pol.get("description") or f"IAM Policy {pol.get('id')[:12]}",
                            "service": "IAM",
                            "resource_type": "iam_policy",
                            "region": "global",
                            "status": "active",
                            "raw_config": pol
                        })
                    self.log_progress(f"Discovered {len(policies)} live IAM access policies.")

                # 2. Fetch Account MFA and Identity settings
                settings_url = f"{self.iam_base}/v1/accounts/{account_id}/settings"
                s_resp = requests.get(settings_url, headers=headers, timeout=8)
                settings_data = {}
                if s_resp.status_code == 200:
                    settings_data = s_resp.json()
                else:
                    settings_data = {"account_id": account_id, "mfa": "UNKNOWN_RESTRICTED"}

                # 3. Fetch API Keys
                keys_url = f"{self.iam_base}/v1/api_keys?account_id={account_id}"
                k_resp = requests.get(keys_url, headers=headers, timeout=8)
                api_keys = []
                if k_resp.status_code == 200:
                    api_keys = k_resp.json().get("api_keys", [])
                settings_data["api_keys"] = api_keys

                resources.append({
                    "resource_id": f"crn:v1:bluemix:public:iam::::account-settings:{account_id}",
                    "name": "IAM Global Account Security & MFA Configuration",
                    "service": "IAM",
                    "resource_type": "iam_account_settings",
                    "region": "global",
                    "status": "active",
                    "raw_config": settings_data
                })

            if not resources:
                self.log_progress("Notice: Insufficient IAM permissions to enumerate all account policies. Using Lab sample.")
                return self._fallback_lab_resources()

            return resources

        except Exception as e:
            logger.error(f"Live IAM Discovery failed: {str(e)}. Using Simulated Cloud Lab dataset.")
            return self._fallback_lab_resources()

    def _fallback_lab_resources(self) -> list:
        res = []
        for pol in SIMULATED_IAM_POLICIES:
            res.append({
                "resource_id": f"crn:v1:bluemix:public:iam::::policy:{pol['id']}",
                "name": pol.get("description", pol["id"]),
                "service": "IAM",
                "resource_type": "iam_policy",
                "region": "global",
                "status": "active",
                "raw_config": pol
            })
        res.append({
            "resource_id": f"crn:v1:bluemix:public:iam::::account-settings:{SIMULATED_IAM_ACCOUNT_SETTINGS['account_id']}",
            "name": "IAM Global Account Security & MFA Configuration",
            "service": "IAM",
            "resource_type": "iam_account_settings",
            "region": "global",
            "status": "active",
            "raw_config": SIMULATED_IAM_ACCOUNT_SETTINGS
        })
        return res
