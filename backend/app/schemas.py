from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: str = Field(default="contributor", pattern="^(admin|contributor)$")

class UserResponse(UserBase):
    id: int
    role: str

    model_config = ConfigDict(from_attributes=True)

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Stream Schemas
class StreamBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)

class StreamCreate(StreamBase):
    pass

class StreamResponse(StreamBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Branch Schemas
class BranchBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    stream_id: int

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Subject Schemas
class SubjectBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=2, max_length=150)
    semester: int = Field(..., ge=1, le=8)
    branch_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Question Paper Schemas
class QuestionPaperCreate(BaseModel):
    subject_id: int
    year: int = Field(..., ge=1990, le=2100)
    exam_type: str = Field(..., pattern="^(Mid-Semester|End-Semester)$")
    file_url: str

class QuestionPaperResponse(BaseModel):
    id: int
    subject_id: int
    year: int
    exam_type: str
    file_url: str
    upload_timestamp: datetime
    uploaded_by: Optional[int] = None
    
    # Nested/Resolved fields for frontend UI
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    branch_name: Optional[str] = None
    stream_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Bulk Paper Filter Responses
class DashboardFilterOptions(BaseModel):
    streams: List[StreamResponse]
    branches: List[BranchResponse]
    subjects: List[SubjectResponse]
