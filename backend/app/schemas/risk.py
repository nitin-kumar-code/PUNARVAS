from pydantic import BaseModel

class RiskBase(BaseModel):
    pass

class RiskCreate(RiskBase):
    pass

class Risk(RiskBase):
    class Config:
        from_attributes = True
