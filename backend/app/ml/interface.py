from typing import Protocol, runtime_checkable
from app.schemas.intelligence import RiskFeatures, RiskScoreResult

@runtime_checkable
class RiskModelProtocol(Protocol):
    def predict(self, features: RiskFeatures) -> RiskScoreResult:
        ...
