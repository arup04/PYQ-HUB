import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Stream, Branch, Subject

@pytest.fixture
async def seed_data(db_session: AsyncSession):
    # Setup test mock courses
    btech = Stream(name="B.Tech")
    mba = Stream(name="MBA")
    db_session.add_all([btech, mba])
    await db_session.commit()

    ai_ds = Branch(stream_id=btech.id, name="Artificial Intelligence & Data Science")
    finance = Branch(stream_id=mba.id, name="Finance")
    db_session.add_all([ai_ds, finance])
    await db_session.commit()

    subject = Subject(branch_id=ai_ds.id, code="AI-601", name="Deep Learning", semester=6)
    db_session.add(subject)
    await db_session.commit()

    return {
        "btech_id": btech.id,
        "mba_id": mba.id,
        "aids_id": ai_ds.id,
        "finance_id": finance.id,
        "subject_id": subject.id
    }

async def test_get_streams(client: AsyncClient, seed_data):
    response = await client.get("/api/streams")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = [s["name"] for s in data]
    assert "B.Tech" in names
    assert "MBA" in names

async def test_get_branches_filtered(client: AsyncClient, seed_data):
    btech_id = seed_data["btech_id"]
    response = await client.get(f"/api/branches?stream_id={btech_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Artificial Intelligence & Data Science"

async def test_get_subjects_filtered(client: AsyncClient, seed_data):
    aids_id = seed_data["aids_id"]
    response = await client.get(f"/api/subjects?branch_id={aids_id}&semester=6")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["code"] == "AI-601"
    assert data[0]["name"] == "Deep Learning"
