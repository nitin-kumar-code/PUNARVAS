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

@pytest.mark.skip(reason="Write operations disabled for immutable ML dataset")
def test_create_and_read_habitation(client):
    # Test valid data
    payload = {
        "name": "Test Village",
        "state": "Test State",
        "district": "Test District",
        "block": "Test Block",
        "latitude": 20.0,
        "longitude": 80.0,
        "total_population": 500,
        "vulnerable_population": 100,
        "households": 120
    }
    response = client.post(f"{settings.API_V1_PREFIX}/habitations/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Village"
    hab_id = data["id"]
    
    # Test get
    response = client.get(f"{settings.API_V1_PREFIX}/habitations/{hab_id}")
    assert response.status_code == 200
    assert response.json()["id"] == hab_id

@pytest.mark.skip(reason="Write operations disabled for immutable ML dataset")
def test_invalid_habitation_creation(client):
    # Test validation: vulnerable > total
    payload = {
        "name": "Invalid Village",
        "state": "Test State",
        "district": "Test District",
        "block": "Test Block",
        "latitude": 20.0,
        "longitude": 80.0,
        "total_population": 100,
        "vulnerable_population": 500,  # Invalid
        "households": 20
    }
    response = client.post(f"{settings.API_V1_PREFIX}/habitations/", json=payload)
    assert response.status_code == 400

def test_create_and_read_candidate_site(client):
    payload = {
        "name": "Test Site",
        "state": "Test State",
        "district": "Test District",
        "latitude": 21.0,
        "longitude": 81.0,
        "capacity_people": 1000,
        "available_capacity": 1000
    }
    response = client.post(f"{settings.API_V1_PREFIX}/sites/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Site"

def test_invalid_site_creation(client):
    payload = {
        "name": "Invalid Site",
        "state": "Test State",
        "district": "Test District",
        "latitude": 21.0,
        "longitude": 81.0,
        "capacity_people": 500,
        "available_capacity": 1000  # Invalid
    }
    response = client.post(f"{settings.API_V1_PREFIX}/sites/", json=payload)
    assert response.status_code == 400

def test_dashboard_aggregation(client):
    # This will return empty since the test DB is freshly created and mostly empty
    # But it verifies the endpoint works and the structure is correct
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
