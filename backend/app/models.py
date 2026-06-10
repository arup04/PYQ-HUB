from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="contributor")  # admin, contributor

    # Relationships
    papers = relationship("QuestionPaper", back_populates="uploader")


class Stream(Base):
    __tablename__ = "streams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # B.Tech, MBA

    # Relationships
    branches = relationship("Branch", back_populates="stream", cascade="all, delete-orphan")


class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    stream_id = Column(Integer, ForeignKey("streams.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)

    # Constraints: name should be unique within a stream
    __table_args__ = (UniqueConstraint("stream_id", "name", name="uq_stream_branch_name"),)

    # Relationships
    stream = relationship("Stream", back_populates="branches")
    subjects = relationship("Subject", back_populates="branch", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    code = Column(String, nullable=False)  # CS-101
    name = Column(String, nullable=False)  # Mathematics
    semester = Column(Integer, nullable=False)  # 1 to 8

    # Constraints: code should be unique within a branch
    __table_args__ = (UniqueConstraint("branch_id", "code", name="uq_branch_subject_code"),)

    # Relationships
    branch = relationship("Branch", back_populates="subjects")
    papers = relationship("QuestionPaper", back_populates="subject", cascade="all, delete-orphan")


class QuestionPaper(Base):
    __tablename__ = "question_papers"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    exam_type = Column(String, nullable=False)  # Mid-Semester, End-Semester
    file_url = Column(String, nullable=False)
    upload_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    subject = relationship("Subject", back_populates="papers")
    uploader = relationship("User", back_populates="papers")
