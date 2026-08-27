import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "project": "PUNARVAS",
        "status": "operational",
        "version": "0.1.0"
    }

def test_health_check(client):
    response = client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "punarvas-backend",
        "version": "0.1.0"
    }

def test_create_habitation_forbidden(client):
    payload = {
        "name": "Test Village",
        "latitude": 20.0,
        "longitude": 80.0,
        "total_population": 500
    }
    response = client.post(f"{settings.API_V1_PREFIX}/habitations/", json=payload)
    assert response.status_code == 403
    assert "Write operations disabled" in response.json()["detail"]
    
def test_create_candidate_site_forbidden(client):
    payload = {
        "name": "Test Site",
        "latitude": 21.0,
        "longitude": 81.0,
        "capacity_people": 1000, "available_capacity": 1000
    }
    response = client.post(f"{settings.API_V1_PREFIX}/sites/", json=payload)
    assert response.status_code == 403
    assert "Write operations disabled" in response.json()["detail"]

def test_dashboard_aggregation(client):
    response = client.get(f"{settings.API_V1_PREFIX}/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_habitations" in data
    assert "critical_habitations" in data

def test_map_endpoints(client):
    response = client.get(f"{settings.API_V1_PREFIX}/map/habitations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    response = client.get(f"{settings.API_V1_PREFIX}/map/sites")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
