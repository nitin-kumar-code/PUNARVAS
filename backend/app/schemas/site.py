from pydantic import BaseModel

class SiteBase(BaseModel):
    pass

class SiteCreate(SiteBase):
    pass

class Site(SiteBase):
    class Config:
        from_attributes = True
