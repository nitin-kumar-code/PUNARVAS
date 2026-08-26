import pytest
from app.ml.baseline import BaselineRiskModel
from app.schemas.intelligence import RiskFeatures
from app.ml.interface import RiskModelProtocol

def test_risk_model_protocol_conformance():
    model = BaselineRiskModel()
    assert isinstance(model, RiskModelProtocol)

def test_baseline_risk_calculation():
    model = BaselineRiskModel()
    features = RiskFeatures(
        hazard_exposure=100.0,
        terrain_factor=100.0,
        population_vulnerability=100.0,
        infrastructure_vulnerability=100.0,
        accessibility_factor=100.0,
        historical_exposure=100.0
    )
    result = model.predict(features)
    assert result.overall_score == 100.0
    assert result.risk_level == "CRITICAL"
    assert result.primary_driver == "hazard_exposure"

def test_baseline_risk_classification():
    model = BaselineRiskModel()
    assert model._classify(24.9) == "LOW"
    assert model._classify(25.0) == "MEDIUM"
    assert model._classify(49.9) == "MEDIUM"
    assert model._classify(50.0) == "HIGH"
    assert model._classify(74.9) == "HIGH"
    assert model._classify(75.0) == "CRITICAL"
