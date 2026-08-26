from typing import Protocol, List, runtime_checkable
from app.models.habitation import Habitation
from app.models.candidate_site import CandidateSite
from app.schemas.intelligence import OptimizationResult

@runtime_checkable
class RelocationOptimizerProtocol(Protocol):
    def optimize(self, source: Habitation, sites: List[CandidateSite]) -> OptimizationResult:
        ...
