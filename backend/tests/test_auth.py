import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.auth import get_password_hash

@pytest.fixture(autouse=True)
async def seed_admin(db_session: AsyncSession):
    # Seed a testing admin in transactional scope
    admin = User(
        username="admin_test",
        hashed_password=get_password_hash("adminpw"),
        role="admin"
    )
    db_session.add(admin)
    await db_session.commit()

async def test_login_success(client: AsyncClient):
    # Perform standard OAuth2 login call
    response = await client.post(
        "/api/auth/login",
        data={"username": "admin_test", "password": "adminpw"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "admin_test"
    assert data["role"] == "admin"

async def test_login_invalid_credentials(client: AsyncClient):
    # Perform login call with wrong password
    response = await client.post(
        "/api/auth/login",
        data={"username": "admin_test", "password": "wrongpassword"}
    )
    assert response.status_code == 401

async def test_register_contributor_authorized(client: AsyncClient):
    # Log in as admin to get bearer token
    login_resp = await client.post(
        "/api/auth/login",
        data={"username": "admin_test", "password": "adminpw"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register contributor
    reg_resp = await client.post(
        "/api/auth/register",
        json={"username": "contrib_test", "password": "contribpw", "role": "contributor"},
        headers=headers
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["username"] == "contrib_test"
    assert data["role"] == "contributor"

async def test_register_unauthorized_missing_token(client: AsyncClient):
    # Attempt registration without token
    reg_resp = await client.post(
        "/api/auth/register",
        json={"username": "hacker", "password": "hackerpw", "role": "admin"}
    )
    assert reg_resp.status_code == 401
