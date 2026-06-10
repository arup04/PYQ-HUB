from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Stream
from app.schemas import StreamResponse

router = APIRouter(prefix="/streams", tags=["Streams"])

@router.get("", response_model=List[StreamResponse])
async def get_streams(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stream).order_by(Stream.name))
    streams = result.scalars().all()
    return streams
