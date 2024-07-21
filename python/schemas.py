from pydantic import BaseModel
from datetime import datetime as dt
from typing import Optional
# from enum import Enum


class Users(BaseModel):
    datetime:dt| None = None
    interval:int| None = None
    distance:int| None = None