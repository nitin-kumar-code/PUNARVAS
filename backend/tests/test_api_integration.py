import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from app.core.config import settings

def test_get_habitations(client):
    response = client.get(f"{settings.API_V1_PREFIX}/habitations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_habitation_by_id(client):
    payload = {
        "name": "Integration Habitation",
        "state": "State",
        "district": "District",
        "block": "Block",
        "latitude": 20.0,
        "longitude": 80.0,
        "total_population": 500,
        "vulnerable_population": 100,
        "households": 120
    }
    create_resp = client.post(f"{settings.API_V1_PREFIX}/habitations/", json=payload)
    hab_id = create_resp.json()["id"]

    response = client.get(f"{settings.API_V1_PREFIX}/habitations/{hab_id}")
    assert response.status_code == 200
    assert response.json()["id"] == hab_id

def test_get_sites(client):
    response = client.get(f"{settings.API_V1_PREFIX}/sites/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_hazards(client):
    response = client.get(f"{settings.API_V1_PREFIX}/hazards/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_relocation_recommendation(client):
    # 1. Create a habitation
    hab_payload = {
        "name": "Source Hab",
        "state": "State",
        "district": "District",
        "block": "Block",
        "latitude": 20.0,
        "longitude": 80.0,
        "total_population": 1000,
        "vulnerable_population": 300,
        "households": 250
    }
    hab_resp = client.post(f"{settings.API_V1_PREFIX}/habitations/", json=hab_payload)
    hab_id = hab_resp.json()["id"]

    # 2. Create safe candidate sites
    site_payload = {
        "name": "Safe Candidate",
        "state": "State",
        "district": "District",
        "latitude": 20.1,
        "longitude": 80.1,
        "capacity_people": 2000,
        "available_capacity": 2000
    }
    client.post(f"{settings.API_V1_PREFIX}/sites/", json=site_payload)

    # 3. Request recommendation
    req_payload = {"habitation_id": hab_id}
    rec_resp = client.post(f"{settings.API_V1_PREFIX}/relocation/recommend", json=req_payload)
    
    assert rec_resp.status_code == 200
    data = rec_resp.json()
    assert data["source_habitation_id"] == hab_id
    assert data["source_population"] == 1000
    assert data["status"] == "FULLY_COVERED"

def test_relocation_habitation_not_found(client):
    req_payload = {"habitation_id": str(uuid4())}
    rec_resp = client.post(f"{settings.API_V1_PREFIX}/relocation/recommend", json=req_payload)
    assert rec_resp.status_code == 404
    assert rec_resp.json()["detail"] == "Habitation not found"

def test_invalid_relocation_request(client):
    req_payload = {"habitation_id": "not-a-uuid"}
    rec_resp = client.post(f"{settings.API_V1_PREFIX}/relocation/recommend", json=req_payload)
    assert rec_resp.status_code == 422 # Validation error for invalid UUID

def test_insufficient_safe_capacity(client):
    # 1. Create a large habitation
    hab_payload = {
        "name": "Large Hab",
        "state": "State",
        "district": "District",
        "block": "Block",
        "latitude": 20.0,
        "longitude": 80.0,
        "total_population": 10000,
        "vulnerable_population": 300,
        "households": 2500
    }
    hab_resp = client.post(f"{settings.API_V1_PREFIX}/habitations/", json=hab_payload)
    hab_id = hab_resp.json()["id"]

    # Request recommendation, expecting INSUFFICIENT_CAPACITY because existing sites won't cover 10,000
    req_payload = {"habitation_id": hab_id}
    rec_resp = client.post(f"{settings.API_V1_PREFIX}/relocation/recommend", json=req_payload)
    
    assert rec_resp.status_code == 200
    data = rec_resp.json()
    assert data["source_habitation_id"] == hab_id
    assert data["status"] == "INSUFFICIENT_CAPACITY"
