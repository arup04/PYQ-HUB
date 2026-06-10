from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.database import get_db
from app.models import QuestionPaper, Subject, Branch, Stream, User
from app.schemas import QuestionPaperResponse
from app.storage import get_storage_service, StorageService
from app.auth import get_current_contributor

router = APIRouter(prefix="/papers", tags=["Question Papers"])

def map_paper_to_response(paper: QuestionPaper) -> QuestionPaperResponse:
    return QuestionPaperResponse(
        id=paper.id,
        subject_id=paper.subject_id,
        year=paper.year,
        exam_type=paper.exam_type,
        file_url=paper.file_url,
        upload_timestamp=paper.upload_timestamp,
        uploaded_by=paper.uploaded_by,
        subject_code=paper.subject.code if paper.subject else None,
        subject_name=paper.subject.name if paper.subject else None,
        branch_name=paper.subject.branch.name if paper.subject and paper.subject.branch else None,
        stream_name=paper.subject.branch.stream.name if paper.subject and paper.subject.branch and paper.subject.branch.stream else None,
    )

@router.get("", response_model=List[QuestionPaperResponse])
async def get_papers(
    subject_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(QuestionPaper)
        .where(QuestionPaper.subject_id == subject_id)
        .options(
            joinedload(QuestionPaper.subject)
            .joinedload(Subject.branch)
            .joinedload(Branch.stream)
        )
        .order_by(QuestionPaper.year.desc(), QuestionPaper.exam_type)
    )
    result = await db.execute(query)
    papers = result.scalars().all()
    return [map_paper_to_response(paper) for paper in papers]

@router.get("/filter", response_model=List[QuestionPaperResponse])
async def filter_papers(
    stream_id: Optional[int] = None,
    branch_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(QuestionPaper).options(
        joinedload(QuestionPaper.subject)
        .joinedload(Subject.branch)
        .joinedload(Branch.stream)
    )
    
    # Apply cascading filters
    if subject_id is not None:
        query = query.where(QuestionPaper.subject_id == subject_id)
    elif branch_id is not None or stream_id is not None or semester is not None:
        query = query.join(QuestionPaper.subject)
        if semester is not None:
            query = query.where(Subject.semester == semester)
        if branch_id is not None:
            query = query.where(Subject.branch_id == branch_id)
        elif stream_id is not None:
            query = query.join(Subject.branch)
            query = query.where(Branch.stream_id == stream_id)
            
    query = query.order_by(QuestionPaper.year.desc(), QuestionPaper.exam_type)
    result = await db.execute(query)
    papers = result.scalars().all()
    
    return [map_paper_to_response(p) for p in papers]

@router.post("/upload", response_model=QuestionPaperResponse, status_code=status.HTTP_201_CREATED)
async def upload_paper(
    subject_id: int = Form(...),
    year: int = Form(...),
    exam_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_contributor),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service)
):
    # Validate subject exists
    sub_res = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = sub_res.scalars().first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
        
    # Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
        
    # Upload file using the storage service
    folder = f"subject_{subject_id}"
    file_url = await storage.upload_file(file, folder=folder)
    
    # Save to db
    new_paper = QuestionPaper(
        subject_id=subject_id,
        year=year,
        exam_type=exam_type,
        file_url=file_url,
        uploaded_by=current_user.id
    )
    db.add(new_paper)
    await db.commit()
    await db.refresh(new_paper)
    
    # Reload with joint loading parameters to resolve response fields
    query = (
        select(QuestionPaper)
        .where(QuestionPaper.id == new_paper.id)
        .options(
            joinedload(QuestionPaper.subject)
            .joinedload(Subject.branch)
            .joinedload(Branch.stream)
        )
    )
    result = await db.execute(query)
    updated_paper = result.scalars().first()
    
    return map_paper_to_response(updated_paper)
