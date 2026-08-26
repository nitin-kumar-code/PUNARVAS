from sqlalchemy import Column, String, Float, Text, CheckConstraint
from app.db.base import Base

class Hazard(Base):
    __tablename__ = "hazards"
    
    type = Column(String, index=True, nullable=False)
    severity = Column(Float, nullable=False) # 0-100
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    affected_area = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint('severity >= 0 AND severity <= 100', name='check_severity_range'),
        CheckConstraint('latitude >= -90 AND latitude <= 90', name='check_hazard_latitude_range'),
        CheckConstraint('longitude >= -180 AND longitude <= 180', name='check_hazard_longitude_range'),
    )
