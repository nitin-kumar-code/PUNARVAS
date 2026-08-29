from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

print("Testing GET /api/v1/habitations?limit=2000 ...")
response = client.get(f"{settings.API_V1_PREFIX}/habitations?limit=2000")
habs = response.json()
print(f"Total Habitation Records: {len(habs)}")

print("\nTesting GET /api/v1/sites?limit=2000 ...")
response = client.get(f"{settings.API_V1_PREFIX}/sites?limit=2000")
sites = response.json()
print(f"Total Site Records: {len(sites)}")
