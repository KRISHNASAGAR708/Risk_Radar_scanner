from abc import ABC, abstractmethod
import logging

logger = logging.getLogger("risk_radar.collector")

class BaseCollector(ABC):
    def __init__(self, auth_manager, region="us-south"):
        self.auth = auth_manager
        self.region = region
        self.service_name = "BASE"

    @abstractmethod
    def collect(self) -> list:
        """
        Gathers resources from the target IBM Cloud service.
        Returns a list of standardized resource dictionaries:
        [
          {
             "resource_id": str,
             "name": str,
             "service": str,
             "resource_type": str,
             "region": str,
             "raw_config": dict
          }
        ]
        """
        pass

    def log_progress(self, message: str):
        logger.info(f"[{self.service_name} Collector] {message}")
