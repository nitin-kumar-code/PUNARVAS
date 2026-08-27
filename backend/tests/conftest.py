import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.core.database import get_db

SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://localhost:5433/punarvas_test"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    Base.metadata.create_all(bind=engine)
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

import pytest
from app.services.json_data_service import json_data_service

@pytest.fixture(autouse=True)
def mock_capacity_for_tests():
    """Bypass strict ML data requirements during tests."""
    json_data_service._test_mode_capacity_override = True
    yield
    json_data_service._test_mode_capacity_override = False
