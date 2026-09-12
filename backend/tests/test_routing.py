import pytest
import math
from unittest.mock import patch, MagicMock
from app.services.routing_service import RoutingService, haversine_distance, _route_cache

def test_haversine_distance():
    # Known distance test
    # Delhi to Mumbai approx 1148 km straight line
    delhi = (28.6139, 77.2090)
    mumbai = (19.0760, 72.8777)
    dist = haversine_distance(delhi[0], delhi[1], mumbai[0], mumbai[1])
    assert 1100 < dist < 1200

@patch("app.services.routing_service.requests.get")
def test_get_route_success(mock_get):
    # Mock a successful OSRM response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "code": "Ok",
        "routes": [
            {
                "distance": 13700, # 13.7 km
                "duration": 1860   # 31 mins
            }
        ]
    }
    mock_get.return_value = mock_response

    # Force a unique cache key
    _route_cache.clear()
    
    result = RoutingService.get_route(28.0, 77.0, 28.1, 77.1)
    
    assert result["distance_km"] == 13.7
    assert result["duration_minutes"] == 31.0
    assert result["status"] == "success"

@patch("app.services.routing_service.requests.get")
def test_get_route_fallback_on_failure(mock_get):
    # Mock a failed OSRM response
    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_get.return_value = mock_response

    _route_cache.clear()
    
    src = (28.0, 77.0)
    dest = (28.1, 77.1)
    result = RoutingService.get_route(src[0], src[1], dest[0], dest[1])
    
    expected_fallback = round(haversine_distance(src[0], src[1], dest[0], dest[1]), 2)
    
    assert result["distance_km"] == expected_fallback
    assert result["duration_minutes"] is None
    assert result["status"] == "fallback_haversine"

@patch("app.services.routing_service.requests.get")
def test_get_route_fallback_on_no_route(mock_get):
    # Mock a successful OSRM response but no routes found
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "code": "NoRoute"
    }
    mock_get.return_value = mock_response

    _route_cache.clear()
    
    src = (28.0, 77.0)
    dest = (28.1, 77.1)
    result = RoutingService.get_route(src[0], src[1], dest[0], dest[1])
    
    assert result["status"] == "fallback_haversine"
