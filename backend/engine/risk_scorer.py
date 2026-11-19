class RiskScorer:
    WEIGHTS = {
        "CRITICAL": 18.0,
        "HIGH": 10.0,
        "MEDIUM": 4.0,
        "LOW": 1.0
    }

    @classmethod
    def calculate_posture(cls, findings: list, total_resources: int = 1) -> dict:
        """
        Calculates Cloud Security Posture Score (0-100), severity counts,
        risk grade, service breakdown, and threat matrix.
        """
        counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        service_counts = {
            "COS": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "total": 0},
            "VPC": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "total": 0},
            "IAM": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "total": 0},
            "ACTIVITY_TRACKER": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "total": 0}
        }

        total_penalty = 0.0

        for f in findings:
            sev = f.get("severity", "MEDIUM").upper()
            svc = f.get("service", "COS").upper()
            
            if sev in counts:
                counts[sev] += 1
                total_penalty += cls.WEIGHTS.get(sev, 4.0)

            if svc in service_counts and sev in service_counts[svc]:
                service_counts[svc][sev] += 1
                service_counts[svc]["total"] += 1

        # Posture Score calculation
        score = max(0.0, min(100.0, 100.0 - total_penalty))
        grade = cls._derive_grade(score)

        # Service-level scores (scaled per service)
        service_breakdown = {}
        for svc, s_data in service_counts.items():
            svc_penalty = (
                s_data["CRITICAL"] * cls.WEIGHTS["CRITICAL"] +
                s_data["HIGH"] * cls.WEIGHTS["HIGH"] +
                s_data["MEDIUM"] * cls.WEIGHTS["MEDIUM"] +
                s_data["LOW"] * cls.WEIGHTS["LOW"]
            )
            svc_score = max(0.0, min(100.0, 100.0 - svc_penalty * 1.5))
            service_breakdown[svc] = {
                "score": round(svc_score, 1),
                "grade": cls._derive_grade(svc_score),
                "critical": s_data["CRITICAL"],
                "high": s_data["HIGH"],
                "medium": s_data["MEDIUM"],
                "low": s_data["LOW"],
                "total_findings": s_data["total"]
            }

        # Threat Exposure Matrix Quadrants
        matrix = {
            "immediate_action": counts["CRITICAL"], # High impact, High likelihood
            "severe_exposure": counts["HIGH"],     # High impact, Medium likelihood
            "hygiene_hardening": counts["MEDIUM"], # Medium impact, Medium likelihood
            "informational": counts["LOW"]         # Low impact, Low likelihood
        }

        return {
            "posture_score": round(score, 1),
            "risk_grade": grade,
            "counts": counts,
            "total_findings": len(findings),
            "service_breakdown": service_breakdown,
            "threat_matrix": matrix
        }

    @staticmethod
    def _derive_grade(score: float) -> str:
        if score >= 95.0:
            return "A+"
        elif score >= 85.0:
            return "A"
        elif score >= 70.0:
            return "B"
        elif score >= 50.0:
            return "C"
        elif score >= 35.0:
            return "D"
        else:
            return "F"
