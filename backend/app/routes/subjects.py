from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Subject
from app.schemas import SubjectResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectResponse])
async def get_subjects(
    branch_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Subject)
    if branch_id is not None:
        query = query.where(Subject.branch_id == branch_id)
    if semester is not None:
        query = query.where(Subject.semester == semester)
    query = query.order_by(Subject.code)
    
    result = await db.execute(query)
    subjects = result.scalars().all()
    return subjects
