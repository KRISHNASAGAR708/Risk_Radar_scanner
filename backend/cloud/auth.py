import time
import requests
import json
import logging
from datetime import datetime

logger = logging.getLogger("risk_radar.auth")

class IBMCloudAuthManager:
    IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"
    RESOURCE_CONTROLLER_URL = "https://resource-controller.cloud.ibm.com/v2/resource_instances"
    USER_PROFILE_URL = "https://iam.cloud.ibm.com/v2/users"
    
    def __init__(self, api_key: str = "", region: str = "us-south"):
        self.api_key = api_key.strip() if api_key else ""
        self.region = region
        self._access_token = None
        self._token_expires_at = 0
        self._account_id = None
        self._iam_id = None
        self._user_email = None
        self.is_live = False
        
        if self.api_key:
            self.authenticate()

    def authenticate(self) -> dict:
        """
        Exchanges an IBM Cloud API Key for an IAM OAuth Access Token.
        Returns account info or raises Exception on invalid key.
        """
        if not self.api_key:
            self.is_live = False
            return {
                "authenticated": False,
                "mode": "SIMULATED_CLOUD_LAB",
                "message": "No IBM Cloud API key configured. Operating in high-fidelity Simulated Cloud Lab mode."
            }

        try:
            logger.info("Authenticating with IBM Cloud IAM token endpoint...")
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }
            payload = {
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": self.api_key
            }
            
            resp = requests.post(self.IAM_TOKEN_URL, data=payload, headers=headers, timeout=12)
            
            if resp.status_code == 200:
                data = resp.json()
                self._access_token = data.get("access_token")
                expires_in = data.get("expires_in", 3600)
                self._token_expires_at = time.time() + expires_in - 120 # 2-minute safety buffer
                
                # Decode JWT payload safely without external crypto lib to extract IAM identity
                self._extract_jwt_claims(self._access_token)
                self.is_live = True
                
                # Fetch account information via Resource Controller or IAM profile
                account_info = self._fetch_account_info()
                
                return {
                    "authenticated": True,
                    "mode": "LIVE_IBM_CLOUD",
                    "account_id": self._account_id or account_info.get("account_id", "IBM-Cloud-Account"),
                    "user_email": self._user_email or "ibm-cloud-user",
                    "iam_id": self._iam_id,
                    "region": self.region,
                    "expires_in": expires_in,
                    "message": "Successfully authenticated with IBM Cloud IAM."
                }
            elif resp.status_code == 400:
                self.is_live = False
                return {
                    "authenticated": False,
                    "mode": "ERROR",
                    "status_code": 400,
                    "message": "Invalid IBM Cloud API Key. Please verify key credentials in Settings."
                }
            else:
                self.is_live = False
                return {
                    "authenticated": False,
                    "mode": "ERROR",
                    "status_code": resp.status_code,
                    "message": f"IBM Cloud IAM authentication rejected: {resp.text}"
                }
        except Exception as e:
            logger.warning(f"Connection to IBM Cloud IAM failed: {str(e)}. Falling back to Cloud Lab.")
            self.is_live = False
            return {
                "authenticated": False,
                "mode": "SIMULATED_CLOUD_LAB",
                "error": str(e),
                "message": "Could not establish live connection to IBM Cloud IAM. Operating in Simulated Cloud Lab."
            }

    def _extract_jwt_claims(self, token: str):
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                # Add base64 padding if required
                payload_part = parts[1]
                padding = 4 - (len(payload_part) % 4)
                if padding and padding != 4:
                    payload_part += "=" * padding
                import base64
                payload_bytes = base64.urlsafe_b64decode(payload_part)
                claims = json.loads(payload_bytes)
                self._account_id = claims.get("account", {}).get("bss") or claims.get("account_id")
                self._iam_id = claims.get("iam_id")
                self._user_email = claims.get("email") or claims.get("preferred_username")
        except Exception as e:
            logger.debug(f"JWT claim extraction notice: {e}")

    def _fetch_account_info(self) -> dict:
        if not self._access_token:
            return {}
        try:
            headers = {
                "Authorization": f"Bearer {self._access_token}",
                "Accept": "application/json"
            }
            # Query Resource Controller for high-level resource group / account probe
            probe_resp = requests.get(
                f"{self.RESOURCE_CONTROLLER_URL}?limit=1",
                headers=headers,
                timeout=8
            )
            if probe_resp.status_code == 200:
                data = probe_resp.json()
                return {"account_probe": "OK", "resources_accessible": True}
        except Exception:
            pass
        return {}

    def get_token(self) -> str:
        """Returns valid IAM token, refreshing if necessary"""
        if self.is_live and self.api_key:
            if time.time() >= self._token_expires_at:
                self.authenticate()
            return self._access_token
        return ""

    def get_status(self) -> dict:
        masked_key = ""
        if self.api_key:
            masked_key = self.api_key[:4] + "*" * (len(self.api_key) - 8) + self.api_key[-4:] if len(self.api_key) > 8 else "***"
            
        return {
            "mode": "LIVE_IBM_CLOUD" if self.is_live else "SIMULATED_CLOUD_LAB",
            "is_connected": self.is_live,
            "api_key_masked": masked_key,
            "region": self.region,
            "account_id": self._account_id or ("demo-acct-849302-ibm" if not self.is_live else "Unknown"),
            "account_name": "Production Academic IBM Cloud Tenant" if self.is_live else "Risk Radar Cloud Security Lab",
            "user_email": self._user_email or "cloud-admin@riskradar.ibm.sec",
            "supported_services": [
                {"name": "IBM Cloud Object Storage", "code": "cos", "status": "active"},
                {"name": "IBM Cloud VPC", "code": "vpc", "status": "active"},
                {"name": "IBM Cloud IAM", "code": "iam", "status": "active"},
                {"name": "IBM Cloud Activity Tracker", "code": "tracker", "status": "active"}
            ]
        }
