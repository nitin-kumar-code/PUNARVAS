from pydantic import BaseModel

class RelocationBase(BaseModel):
    pass

class RelocationCreate(RelocationBase):
    pass

class Relocation(RelocationBase):
    class Config:
        from_attributes = True
