import json

with open("ai-ml/outputs/site_scores.json", "r") as f:
    data = json.load(f)

for site in data:
    safe = str(site.get("safe", "True")).lower() == "true"
    tier = str(site.get("site_tier", ""))
    if not safe or tier == "Avoid":
        # It's an ineligible site. Let's fix the explanation string.
        weaknesses = []
        if site.get("hazard_score", 0) >= 50:
            weaknesses.append(f"severe natural hazard exposure (Hazard Score: {site.get('hazard_score')})")
        if site.get("road_access", 100) < 50:
            weaknesses.append("insufficient road accessibility")
        
        if not weaknesses:
            weaknesses.append("failed safety inspections")
            
        site["explanation"] = f"Blocked due to {', '.join(weaknesses[:2])}."

with open("ai-ml/outputs/site_scores.json", "w") as f:
    json.dump(data, f, indent=2)

