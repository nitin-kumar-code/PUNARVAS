import enum

class RiskLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class PriorityLevel(str, enum.Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"

class EvacuationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ROUTING = "ROUTING"
    MONITORED = "MONITORED"
    COMPLETED = "COMPLETED"

class SiteStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    LIMITED = "LIMITED"
    UNSAFE = "UNSAFE"
    FULL = "FULL"

class Recommendation(str, enum.Enum):
    SAFE = "SAFE"
    RECOMMENDED = "RECOMMENDED"
    UNSAFE = "UNSAFE"
    REQUIRES_REVIEW = "REQUIRES_REVIEW"

class RelocationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    APPROVED = "APPROVED"
    EXECUTED = "EXECUTED"
