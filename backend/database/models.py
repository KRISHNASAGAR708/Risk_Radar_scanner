import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database.db import Base

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="RUNNING") # RUNNING, COMPLETED, FAILED
    mode = Column(String(30), default="SIMULATED_CLOUD_LAB") # LIVE_IBM_CLOUD, SIMULATED_CLOUD_LAB
    cloud_account_id = Column(String(64), nullable=True)
    region = Column(String(30), default="us-south")
    
    total_resources = Column(Integer, default=0)
    total_findings = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    
    posture_score = Column(Float, default=100.0) # 0.0 to 100.0
    risk_grade = Column(String(4), default="A+") # A+, A, B, C, D, F
    iso_compliance_score = Column(Float, default=100.0)
    csa_compliance_score = Column(Float, default=100.0)
    
    service_breakdown = Column(JSON, default=dict)
    compliance_summary = Column(JSON, default=dict)
    
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="scan", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "status": self.status,
            "mode": self.mode,
            "cloud_account_id": self.cloud_account_id,
            "region": self.region,
            "total_resources": self.total_resources,
            "total_findings": self.total_findings,
            "critical_count": self.critical_count,
            "high_count": self.high_count,
            "medium_count": self.medium_count,
            "low_count": self.low_count,
            "posture_score": round(self.posture_score, 1),
            "risk_grade": self.risk_grade,
            "iso_compliance_score": round(self.iso_compliance_score, 1),
            "csa_compliance_score": round(self.csa_compliance_score, 1),
            "service_breakdown": self.service_breakdown,
            "compliance_summary": self.compliance_summary
        }

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    rule_id = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(16), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    cvss_score = Column(Float, default=5.0)
    service = Column(String(32), nullable=False) # COS, VPC, IAM, ACTIVITY_TRACKER
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(255), nullable=False)
    resource_name = Column(String(255), nullable=False)
    
    description = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    remediation_summary = Column(Text, nullable=True)
    ibmcloud_cli = Column(Text, nullable=True)
    console_steps = Column(Text, nullable=True)
    
    iso27017_controls = Column(JSON, default=list)
    csa_star_controls = Column(JSON, default=list)
    status = Column(String(16), default="OPEN") # OPEN, RESOLVED, SUPPRESSED
    
    scan = relationship("Scan", back_populates="findings")

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "rule_id": self.rule_id,
            "title": self.title,
            "severity": self.severity,
            "cvss_score": self.cvss_score,
            "service": self.service,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "resource_name": self.resource_name,
            "description": self.description,
            "rationale": self.rationale,
            "remediation_summary": self.remediation_summary,
            "ibmcloud_cli": self.ibmcloud_cli,
            "console_steps": self.console_steps,
            "iso27017_controls": self.iso27017_controls or [],
            "csa_star_controls": self.csa_star_controls or [],
            "status": self.status
        }

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    resource_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    service = Column(String(32), nullable=False)
    resource_type = Column(String(64), nullable=False)
    region = Column(String(32), default="us-south")
    status = Column(String(32), default="active")
    raw_config = Column(JSON, default=dict)
    
    scan = relationship("Scan", back_populates="resources")

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "resource_id": self.resource_id,
            "name": self.name,
            "service": self.service,
            "resource_type": self.resource_type,
            "region": self.region,
            "status": self.status,
            "raw_config": self.raw_config
        }

class CloudConfig(Base):
    __tablename__ = "cloud_configs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    api_key_masked = Column(String(64), default="")
    region = Column(String(32), default="us-south")
    resource_group_id = Column(String(64), default="")
    active_mode = Column(String(32), default="SIMULATED_CLOUD_LAB")
    account_id = Column(String(64), default="Demo-IBM-Cloud-Account")
    account_name = Column(String(128), default="Academic Demo Cloud Tenant")
    last_connected_at = Column(DateTime, nullable=True)
    is_connected = Column(Integer, default=1)

    def to_dict(self):
        return {
            "id": self.id,
            "api_key_masked": self.api_key_masked,
            "region": self.region,
            "resource_group_id": self.resource_group_id,
            "active_mode": self.active_mode,
            "account_id": self.account_id,
            "account_name": self.account_name,
            "last_connected_at": self.last_connected_at.isoformat() if self.last_connected_at else None,
            "is_connected": bool(self.is_connected)
        }
