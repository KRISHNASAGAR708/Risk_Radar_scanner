# Cloud Compliance Cross-Walk: ISO 27017 & CSA STAR

This document details the compliance cross-walk implemented within Risk Radar, aligning automated cloud security misconfiguration checks to the requirements of **ISO/IEC 27017:2015** and **CSA STAR (Cloud Controls Matrix CCM v4)**.

---

## 1. ISO/IEC 27017:2015 Cloud Security Controls

| Control ID | Clause | Control Title | Mapped Risk Radar Rules |
|---|---|---|---|
| **CLD.6.3.1** | 6.3.1 | Information Security Awareness, Education & Training | `RR-IAM-001`, `RR-IAM-002` |
| **CLD.8.1.5** | 8.1.5 | Removal & Deletion of Cloud Service Customer Assets | `RR-COS-003` |
| **CLD.9.5.1** | 9.5.1 | Segregation in Virtual Computing Environments | `RR-COS-001`, `RR-COS-002`, `RR-VPC-001`, `RR-VPC-002`, `RR-VPC-003`, `RR-VPC-004`, `RR-VPC-006`, `RR-IAM-001`, `RR-IAM-002`, `RR-IAM-003`, `RR-IAM-004` |
| **CLD.9.5.2** | 9.5.2 | Virtual Machine and OS Hardening | `RR-VPC-001`, `RR-VPC-002`, `RR-VPC-005` |
| **CLD.12.1.5** | 12.1.5 | Shared Resource Management in Cloud Services | `RR-COS-001`, `RR-COS-003`, `RR-COS-004`, `RR-VPC-003`, `RR-IAM-001`, `RR-IAM-003` |
| **CLD.12.4.5** | 12.4.5 | Information Security Event Logging for Cloud | `RR-COS-005`, `RR-TRK-001`, `RR-TRK-002`, `RR-TRK-003` |
| **CLD.13.1.4** | 13.1.4 | Protection of Cloud Network Environments & Boundaries | `RR-COS-001`, `RR-COS-002`, `RR-VPC-001`, `RR-VPC-002`, `RR-VPC-003`, `RR-VPC-004`, `RR-VPC-005`, `RR-VPC-006`, `RR-IAM-005` |

---

## 2. CSA STAR / Cloud Controls Matrix (CCM v4)

| Domain | Control ID | Control Title | Mapped Detection Rules |
|---|---|---|---|
| **IVS** | `IVS-01` | Network Architecture & Isolation | `RR-VPC-006` |
| **IVS** | `IVS-06` | Network Security & Ingress Filtering | `RR-COS-001`, `RR-COS-002`, `RR-VPC-001`, `RR-VPC-002`, `RR-VPC-003`, `RR-VPC-004`, `RR-VPC-005`, `RR-VPC-006`, `RR-IAM-005` |
| **IVS** | `IVS-07` | Default Security Group Zero-Trust | `RR-VPC-001`, `RR-VPC-002`, `RR-VPC-004` |
| **IAM** | `IAM-01` | User Access Entitlements & Role Definition | `RR-IAM-001` |
| **IAM** | `IAM-02` | Privileged User Management & Separation | `RR-IAM-001`, `RR-IAM-003` |
| **IAM** | `IAM-03` | Multi-Factor Authentication (MFA) | `RR-IAM-002` |
| **IAM** | `IAM-04` | Credential Lifecycle & Key Rotation | `RR-IAM-004` |
| **IAM** | `IAM-05` | Access Restriction & Source Verification | `RR-VPC-001`, `RR-VPC-002`, `RR-IAM-001`, `RR-IAM-002`, `RR-IAM-003`, `RR-IAM-005` |
| **DSP** | `DSP-01` | Data Inventory & Public Access Prevention | `RR-COS-001` |
| **DSP** | `DSP-03` | Data Integrity, Backup & Versioning | `RR-COS-004` |
| **DSP** | `DSP-07` | Sensitive Data Boundaries | `RR-COS-001`, `RR-VPC-003` |
| **DSP** | `DSP-08` | Data at Rest Encryption | `RR-COS-003` |
| **DSP** | `DSP-17` | Cryptographic Key Lifecycle Management | `RR-COS-003`, `RR-IAM-004` |
| **LOG** | `LOG-01` | Audit Trail Provisioning & Region Coverage | `RR-COS-005`, `RR-TRK-001` |
| **LOG** | `LOG-02` | Audit Log Scope & Integrity | `RR-TRK-001` |
| **LOG** | `LOG-04` | Immutable Log Storage & Archiving | `RR-COS-005`, `RR-TRK-002` |
| **SEF** | `SEF-02` | Incident Detection & Tamper Alerting | `RR-TRK-003` |
| **AIS** | `AIS-04` | API & Interface Perimeter Protection | `RR-COS-002`, `RR-VPC-005`, `RR-IAM-003` |
| **BCR** | `BCR-01` | Business Continuity & Resilience | `RR-COS-004` |
