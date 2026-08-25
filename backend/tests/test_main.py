from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "project": "PUNARVAS",
        "status": "operational",
        "version": "0.1.0"
    }

def test_health_check():
    response = client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "punarvas-backend",
        "version": "0.1.0"
    }
