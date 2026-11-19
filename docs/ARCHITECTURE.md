# RISK RADAR – System Architecture & Technical Specification

## Project Overview
**RISK RADAR** is an enterprise-grade Cloud Security Posture Management (CSPM) platform specifically engineered to audit, evaluate, and remediate cloud security misconfigurations across **IBM Cloud** infrastructure. It automates compliance benchmarking against **ISO/IEC 27017:2015** (Code of practice for information security controls based on ISO/IEC 27002 for cloud services) and the **Cloud Security Alliance Cloud Controls Matrix (CSA CCM v4)**.

---

## 1. Cloud Computing Shared Responsibility & CSPM Rationale
In public cloud computing (IaaS and PaaS), security is divided under the **Shared Responsibility Model**:
- **Cloud Service Provider (IBM Cloud):** Responsible for the security *OF* the cloud (physical data centers, hypervisors, hardware maintenance, global network cables).
- **Cloud Service Customer (Tenant):** Responsible for the security *IN* the cloud (identity management, IAM policies, virtual network firewalls, storage bucket ACLs, encryption keys, and audit logging).

Gartner estimates that over 99% of cloud security failures through 2025 are customer misconfigurations. **Risk Radar** addresses this operational gap by continuously discovering provisioned IBM Cloud assets and detecting drift from secure baselines.

---

## 2. High-Level Architectural Flow

```
[ IBM Cloud Account ]
       │
       ├─── IBM Cloud Object Storage (COS S3 / Config API)
       ├─── IBM Cloud VPC Gen 2 (Subnets & Security Groups)
       ├─── IBM Cloud Identity & Access Management (IAM & Policies)
       └─── IBM Cloud Activity Tracker (LogDNA & Event Routing)
       │
       ▼
[ Cloud Resource Collector ]
       │ (Normalizes raw JSON API responses into standardized models)
       ▼
[ Security Rule Engine ]
       │ (19 deterministic detection rules evaluating cloud security anti-patterns)
       ▼
[ Risk Scoring Engine ]
       │ (Quantitative CVSS-weighted CSPS 0-100% calculation & threat matrix)
       ▼
[ Compliance Mapping Engine ]
       │ (Clause-level cross-walk to ISO 27017 & CSA STAR CCM v4)
       ▼
[ Risk Radar Enterprise Dashboard & Reports ]
       │ (React/Tailwind UI, Executive PDF generator, Technical Audit HTML)
```

---

## 3. Core Modules Specification

### Module 1: Cloud Authentication & Session Management
- **Protocol:** IBM Cloud IAM OAuth 2.0 (`https://iam.cloud.ibm.com/identity/token`).
- **Token Exchange:** Exchanging user API key for short-lived bearer access token.
- **Dual-Mode Engine:**
  - `LIVE_IBM_CLOUD`: Issues live authenticated API calls to IBM Cloud endpoints.
  - `SIMULATED_CLOUD_LAB`: High-fidelity sandbox mimicking realistic multi-tier enterprise deployments.

### Module 2: Cloud Resource Discovery (Collectors)
1. **IBM Cloud Object Storage (`COSCollector`):**
   - Discovers storage buckets across regions.
   - Audits bucket public access permissions, `AllUsers` ACLs, CORS wildcard headers (`*`), SSE-KP Key Protect customer-managed keys, and object versioning status.
2. **IBM Cloud VPC Gen 2 (`VPCCollector`):**
   - Discovers VPCs, subnets, and security groups.
   - Evaluates inbound firewall rules for `0.0.0.0/0` exposure on SSH (port 22), RDP (port 3389), database ports (3306, 5432, 27017, 1433, 6379), administrative ports (8080, 8443, 9090), and Classic Access bridges.
3. **IBM Cloud IAM (`IAMCollector`):**
   - Evaluates access policies, roles, and Service IDs.
   - Flags wildcard Administrator assignments (`serviceType: *`), unrotated API keys (> 90 days), and missing account-level Multi-Factor Authentication (`MFA: NONE`).
4. **IBM Cloud Activity Tracker (`ActivityTrackerCollector`):**
   - Audits regional event routing coverage, unmonitored region gaps, and long-term immutable archiving targets in IBM Cloud Object Storage.

### Module 3: Security Scanning Engine & Rules
Deterministic policy-as-code engine loading 19 modular JSON rule specifications across `cos_rules.json`, `vpc_rules.json`, `iam_rules.json`, and `tracker_rules.json`.

### Module 4: Quantitative Risk Scoring
$$Posture = \max\left(0.0, \min\left(100.0, 100.0 - \sum \text{penalties}\right)\right)$$
- **Critical Finding:** -18.0 pts
- **High Finding:** -10.0 pts
- **Medium Finding:** -4.0 pts
- **Low Finding:** -1.0 pt

### Module 5: Compliance Cross-Walk Engine
Strictly evaluates assessed controls:
- **ISO/IEC 27017:2015:** CLD.6.3.1, CLD.8.1.5, CLD.9.5.1, CLD.9.5.2, CLD.12.1.5, CLD.12.4.5, CLD.13.1.4.
- **CSA STAR / CCM v4:** Domains IVS (Infrastructure & Virtualization), IAM (Identity & Access), DSP (Data Security), LOG (Logging & Monitoring), AIS (Application & Interface), BCR (Business Continuity), SEF (Security Incident Management).
