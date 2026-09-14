import math
import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Basic in-memory cache to avoid repeated requests to OSRM
_route_cache: Dict[str, Dict[str, Any]] = {}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RoutingService:
    OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"

    @classmethod
    def get_route(cls, src_lat: float, src_lon: float, dest_lat: float, dest_lon: float) -> Dict[str, Any]:
        """
        Gets the road distance and travel time from OSRM.
        Falls back to Haversine if OSRM is unavailable or fails.
        """
        cache_key = f"{src_lat},{src_lon}-{dest_lat},{dest_lon}"
        if cache_key in _route_cache:
            return _route_cache[cache_key]

        fallback_dist = haversine_distance(src_lat, src_lon, dest_lat, dest_lon)
        fallback_result = {
            "distance_km": round(fallback_dist, 2),
            "duration_minutes": None,
            "status": "fallback_haversine"
        }

        try:
            # OSRM expects coordinates in lon,lat format
            url = f"{cls.OSRM_BASE_URL}/{src_lon},{src_lat};{dest_lon},{dest_lat}?overview=false"
            response = requests.get(url, timeout=3.0)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                    route = data["routes"][0]
                    # OSRM distance is in meters, duration is in seconds
                    distance_km = route["distance"] / 1000.0
                    duration_minutes = route["duration"] / 60.0
                    
                    result = {
                        "distance_km": round(distance_km, 2),
                        "duration_minutes": round(duration_minutes, 2),
                        "status": "success"
                    }
                    _route_cache[cache_key] = result
                    return result
                else:
                    logger.warning(f"OSRM returned no route: {data}")
            else:
                logger.warning(f"OSRM HTTP Error: {response.status_code}")
                
        except Exception as e:
            logger.warning(f"OSRM request failed: {e}")

        # Fallback
        _route_cache[cache_key] = fallback_result
        return fallback_result
