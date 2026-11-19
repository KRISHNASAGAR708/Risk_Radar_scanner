import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "risk-radar-secret-key-cld-sec-2026")
    DATABASE_PATH = BASE_DIR / "risk_radar.db"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # IBM Cloud Defaults
    IBMCLOUD_API_KEY = os.getenv("IBMCLOUD_API_KEY", "")
    IBMCLOUD_REGION = os.getenv("IBMCLOUD_REGION", "us-south")
    IBMCLOUD_RESOURCE_GROUP_ID = os.getenv("IBMCLOUD_RESOURCE_GROUP_ID", "")
    
    # Scanner Operation Mode: 'LIVE_IBM_CLOUD' or 'SIMULATED_CLOUD_LAB'
    SCANNER_MODE = os.getenv("SCANNER_MODE", "SIMULATED_CLOUD_LAB")
    
    # Paths
    RULES_DIR = BASE_DIR / "engine" / "rules"
    COMPLIANCE_DIR = BASE_DIR / "compliance"
    REPORTS_DIR = BASE_DIR / "reports_output"
    
    # Create directories if not exist
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
