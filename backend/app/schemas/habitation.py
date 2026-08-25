from pydantic import BaseModel

class HabitationBase(BaseModel):
    pass

class HabitationCreate(HabitationBase):
    pass

class Habitation(HabitationBase):
    class Config:
        from_attributes = True
