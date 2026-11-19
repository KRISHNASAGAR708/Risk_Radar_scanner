# RISK RADAR – Automated Cloud Misconfiguration Scanner (CSPM)
### Compliance Mapping to ISO/IEC 27017 and CSA STAR on IBM Cloud

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![IBM Cloud](https://img.shields.io/badge/IBM%20Cloud-Platform-1261FE?logo=ibm&logoColor=white)](https://cloud.ibm.com)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2027017%20%7C%20CSA%20STAR-10B981)](#compliance-framework-alignment)

---

## 📌 Executive Summary & Academic Project Scope
**Risk Radar** is an enterprise-grade **Cloud Security Posture Management (CSPM)** solution specifically built to assess, quantify, and remediate cloud security misconfigurations in **IBM Cloud** enterprise environments.

Unlike generic host vulnerability scanners, Risk Radar is purpose-built for the **Cloud Computing Shared Responsibility Model**, directly collecting control-plane and data-plane configurations via IBM Cloud APIs across four foundational pillars:
1. **IBM Cloud Object Storage (COS)**
2. **IBM Cloud Virtual Private Cloud (VPC Gen 2)**
3. **IBM Cloud Identity & Access Management (IAM)**
4. **IBM Cloud Activity Tracker (LogDNA / Event Routing)**

Risk Radar evaluates configurations against **19 deterministic policy-as-code rules**, calculates a quantitative **Cloud Security Posture Score (0–100%)**, maps findings directly to **ISO/IEC 27017:2015** and **CSA STAR (CCM v4)** controls, and delivers actionable remediation playbooks with copyable IBM Cloud CLI commands.

---

## ☁️ Core IBM Cloud Services Evaluated

| Cloud Service | Scope of Automated Inspection | Key Detected Misconfigurations |
|---|---|---|
| **IBM Cloud Object Storage (COS)** | S3 APIs, Bucket ACLs, CORS policies, Server-Side Encryption, Object Versioning, Activity Tracking | Public `AllUsers` ACLs, wildcard CORS (`*`), unencrypted buckets (missing Key Protect SSE-KP), disabled versioning. |
| **IBM Cloud VPC Gen 2** | Virtual Private Clouds, Subnets, Security Groups, Ingress/Egress Firewalls, Classic Access | Internet-open administrative ports (SSH `22`, RDP `3389`), exposed databases (`3306`, `5432`, `27017`), permissive default SG `ANY:ANY`. |
| **IBM Cloud IAM** | IAM Policies, Service IDs, Account Identity Settings, API Keys, MFA Enforcement | Wildcard Administrator roles (`serviceType: *`), account root MFA disabled (`NONE`), unrotated API keys (> 90 days). |
| **IBM Cloud Activity Tracker** | Event Routes, Audit Targets, Regional Logging Coverage, Threat Alerting | Missing Activity Tracker route in active region, audit logs not archived to immutable COS target, disabled tamper alerts. |

---

## 🛡️ Dual-Mode Architecture (Live Cloud vs. Simulation Lab)

Risk Radar is built with a dual-mode engine:
1. **LIVE IBM CLOUD:** When an IBM Cloud IAM API Key is supplied, Risk Radar performs live OAuth 2.0 token exchange (`https://iam.cloud.ibm.com/identity/token`) and queries live IBM Cloud REST APIs and SDKs.
2. **SIMULATED CLOUD LAB:** When operating offline or in an academic presentation without active cloud billable assets, Risk Radar loads a high-fidelity enterprise banking deployment scenario containing authentic IBM Cloud CRNs, topologies, and misconfigurations.
> **Transparency Rule:** Every screen, metric card, and exported report prominently displays whether data originates from `[LIVE IBM CLOUD]` or `[SIMULATED CLOUD LAB]`.

---

## 🚀 Quick Start Guide

### Option A: One-Click Launcher (Windows)
Double-click `start_risk_radar.bat` in the root folder (`D:\Risk Radar`).
The batch script will launch the backend server and web application on **`http://localhost:5000`**.

### Option B: Manual Execution
#### 1. Backend:
```powershell
cd "D:\Risk Radar\backend"
python app.py
```
Backend runs on `http://localhost:5000`.

#### 2. Frontend Development (with hot reloading):
```powershell
cd "D:\Risk Radar\frontend"
npm run dev
```
Access the Vite dev server at `http://localhost:3000`.

---

## 📊 10 Core Application Modules

1. **Session Login / Evaluator Quick Start:** One-click instant evaluator access or direct IAM API Key authentication.
2. **Main Security Dashboard:** Real-time Posture Score Gauge (0-100%, Grade A+ to F), severity distribution, service-level risk ratings, and threat exposure matrix.
3. **Cloud Architecture Visualizer:** Interactive SVG pipeline diagram connecting IBM Cloud Account ➔ Services ➔ Collector ➔ Rules ➔ Risk ➔ Compliance ➔ Dashboard.
4. **Resource Discovery Catalog:** Filterable inventory of discovered buckets, security groups, subnets, and IAM policies with raw JSON inspection.
5. **Security Scanner Console:** Multi-service selection, region targeting, compliance profile selector, and live terminal logging stream.
6. **Vulnerability Findings:** Categorized finding cards with CVSS scores, threat rationales, and deep-dive drawer.
7. **Compliance Center:** Formal mapping to ISO 27017 and CSA STAR (CCM v4) with clause status and downloadable Gap Analysis matrix (CSV).
8. **Remediation Center:** Authorization-safe remediation playbooks with step-by-step console instructions and copyable IBM Cloud CLI commands (`ibmcloud cos`, `ibmcloud is security-group-rule-delete`).
9. **Scan History & Drift Analysis:** Timeline of historical audits, posture trend graphs, and side-by-side Before-and-After differential drift analysis.
10. **Reports & Exports:** One-click generation of certified **Executive PDF reports**, printable **Technical Audit HTML dossiers**, and machine-readable JSON datasets.

---

## 📜 Compliance Framework Alignment

- **ISO/IEC 27017:2015:** CLD.6.3.1, CLD.8.1.5, CLD.9.5.1, CLD.9.5.2, CLD.12.1.5, CLD.12.4.5, CLD.13.1.4.
- **CSA Cloud Controls Matrix (CCM v4):** Domains IVS (Infrastructure & Virtualization), IAM (Identity & Access), DSP (Data Security), LOG (Logging & Monitoring), AIS (Application & Interface), BCR (Business Continuity), SEF (Security Incident Management).

---

## 👥 Authors & Academic Context
Developed as an Academic Major Project in **Cloud Computing & Cloud Security**, highlighting the practical application of CSPM engineering, deterministic cloud policy enforcement, and regulatory compliance mapping on IBM Cloud infrastructure.
