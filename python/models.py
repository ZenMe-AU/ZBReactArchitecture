from sqlalchemy import Column, Integer, String, Numeric, Text, Sequence, DateTime, Enum
from sqlalchemy.sql import func

from db import Base

# Define model
class Location(Base):
    __tablename__ = "location"

    id       = Column(Integer, primary_key=True, index=True)
    topic_id = Column(String, index=True)
    tid      = Column(String)
    lat      = Column(Numeric)
    lon      = Column(Numeric)
    response = Column(Text)
    time     = Column(DateTime, default=func.now())