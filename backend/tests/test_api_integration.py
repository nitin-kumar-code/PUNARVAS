import pytest
from uuid import uuid4
import uuid
from fastapi.testclient import TestClient
from app.core.config import settings
from app.services.json_data_service import json_data_service

def get_real_hab_id():
    habs = json_data_service.get_all_habitations()
    return str(habs[0]["id"])

def test_get_habitations(client):
    response = client.get(f"{settings.API_V1_PREFIX}/habitations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_habitation_by_id(client):
    hab_id = get_real_hab_id()
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

@pytest.mark.skip(reason="Relocation service not yet migrated to JSONDataService (Phase 2B)")
def test_relocation_recommendation(client):
    pass

@pytest.mark.skip(reason="Relocation service not yet migrated to JSONDataService (Phase 2B)")
def test_relocation_habitation_not_found(client):
    pass

@pytest.mark.skip(reason="Relocation service not yet migrated to JSONDataService (Phase 2B)")
def test_invalid_relocation_request(client):
    pass

@pytest.mark.skip(reason="Relocation service not yet migrated to JSONDataService (Phase 2B)")
def test_insufficient_safe_capacity(client):
    pass
