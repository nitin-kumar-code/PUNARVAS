from app.ml.interface import RiskModelProtocol
from app.schemas.intelligence import RiskFeatures, RiskScoreResult, RiskExplanation

class BaselineRiskModel(RiskModelProtocol):
    def __init__(self):
        self.weights = {
            "hazard_exposure": 0.25,
            "terrain_factor": 0.20,
            "population_vulnerability": 0.20,
            "infrastructure_vulnerability": 0.15,
            "accessibility_factor": 0.10,
            "historical_exposure": 0.10
        }

    def _classify(self, score: float) -> str:
        if score < 25:
            return "LOW"
        elif score < 50:
            return "MEDIUM"
        elif score < 75:
            return "HIGH"
        else:
            return "CRITICAL"

    def _get_severity(self, value: float) -> str:
        if value < 25: return "LOW"
        if value < 50: return "MEDIUM"
        if value < 75: return "HIGH"
        return "CRITICAL"

    def predict(self, features: RiskFeatures) -> RiskScoreResult:
        overall_score = 0.0
        explanations = []
        feature_dict = features.model_dump()
        
        # Calculate contributions
        for factor, weight in self.weights.items():
            value = feature_dict[factor]
            contribution = value * weight
            overall_score += contribution
            
            explanations.append(RiskExplanation(
                factor=factor,
                value=value,
                contribution=contribution,
                severity=self._get_severity(value)
            ))
            
        # Sort explanations by contribution descending to find primary drivers
        explanations.sort(key=lambda x: x.contribution, reverse=True)
        primary_driver = explanations[0].factor if explanations else "unknown"
        
        return RiskScoreResult(
            overall_score=round(overall_score, 2),
            risk_level=self._classify(overall_score),
            primary_driver=primary_driver,
            confidence_score=90.0, # Baseline dummy confidence
            explanation=explanations
        )
