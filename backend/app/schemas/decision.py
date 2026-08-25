from pydantic import BaseModel

class DecisionBase(BaseModel):
    pass

class DecisionCreate(DecisionBase):
    pass

class Decision(DecisionBase):
    class Config:
        from_attributes = True
