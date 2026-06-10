from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Branch
from app.schemas import BranchResponse

router = APIRouter(prefix="/branches", tags=["Branches"])

@router.get("", response_model=List[BranchResponse])
async def get_branches(
    stream_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Branch)
    if stream_id is not None:
        query = query.where(Branch.stream_id == stream_id)
    query = query.order_by(Branch.name)
    
    result = await db.execute(query)
    branches = result.scalars().all()
    return branches
