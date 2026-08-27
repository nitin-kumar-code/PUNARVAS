# Chamoli Risk Triage and Site Safety Toolkit

This project turns the supplied Chamoli habitation and candidate-site datasets into transparent, reproducible prioritisation outputs. It is a decision-support prototype for review by domain experts; it is **not** a disaster forecast, a replacement for field assessment, or an automated relocation decision.

## What is included

```
ai-ml/
├── data/          # Supplied inputs and generated intermediate CSVs
├── notebooks/     # Exploration and results walkthrough
├── src/           # Reusable scoring and explanation modules
├── tests/         # Scenario tests for model behaviour
└── outputs/       # Machine-readable scores generated from the supplied data
```

### Input lineage

| Project file | Source / purpose |
| --- | --- |
| `data/habitations.csv` | Copy of `chamoli_habitations_completed.csv` |
| `data/candidate_sites.csv` | Copy of `chamoli_school_capacity_with_healthcare_livelihood.csv` |
| `data/hazard_data.csv` | Generated compact hazard-feature extract |
| `data/processed_data.csv` | Generated habitation data with model components |

## Scoring method

All scores range from 0 to 100. Higher habitation scores mean a greater priority for review; higher site-safety scores mean stronger suitability.

| Output | Formula |
| --- | --- |
| Hazard component | 35% landslide score + 25% flood score + 20% capped historical events + 20% slope severity |
| Exposure component | 60% log-scaled population + 25% log-scaled population density + 15% log-scaled children aged 0–6 |
| Vulnerability component | 35% temporary housing + 35% dilapidated housing + 20% relative hospital distance + 10% limited healthcare capacity |
| Habitation risk | 45% hazard + 30% exposure + 25% vulnerability |
| Site safety | 40% hazard avoidance + 12% road access + 10% land capacity + 10% water + 10% power + 8% healthcare + 5% school + 5% livelihood access |
| Confidence | 50–100 based only on completeness of required inputs |

The candidate-file `safe` flag is retained for comparison but is deliberately **not** used as a model input. Any difference between it and the calculated recommendation is a cue for field verification, not an automatic override.

Capacity values use fixed, configurable review baselines (land 2,000; water 600; power 600; healthcare 50; school 150) rather than the current shortlist's minimum and maximum. This makes a site's capacity score stable when the shortlist changes. Confirm and adjust those baselines with relevant engineering and service-delivery specialists before operational use.

### Operational bands

The habitation bands are calibrated to this dataset’s observed score distribution, so they are prioritisation bands rather than fixed universal standards:

| Risk score | Triage |
| --- | --- |
| under 38 | Low |
| 38–47.99 | Moderate |
| 48–54.99 | High |
| 55 or higher | Critical |

Site safety is `Preferred` at 60 or above, `Conditional` from 50 to 59.99, and `Avoid` below 50. These are screening recommendations pending geotechnical, social, legal, and environmental review.

## Run it

From the `ai-ml` directory:

```powershell
python -m pip install -r requirements.txt
python -m src.preprocessing
python -m pytest -q
```

For a guided analysis, open and run `notebooks/exploration.ipynb`. It regenerates all intermediate data and output JSON files from the two CSV inputs.

## Output schema

- `outputs/habitation_scores.json`: identifier, location, three components, risk score, triage, confidence, and plain-language explanation for every habitation.
- `outputs/site_scores.json`: identifier, location, supplied hazard score, calculated safety and risk, site tier, confidence, retained source `safe` value, and explanation for every candidate site.

## Limitations and responsible use

The inputs include a 2009 reference year for habitation demographics and historical hazard proxies. Refresh these data before operational use, investigate the limited missing values before high-consequence decisions, and review all high/critical cases with local authorities and qualified disaster-risk, engineering, and social-sector specialists.
