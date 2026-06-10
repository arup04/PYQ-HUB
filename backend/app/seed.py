import asyncio
import os
import sys
from sqlalchemy import text

# Ensure backend directory is in python path to run seeder directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.models import User, Stream, Branch, Subject
from app.auth import get_password_hash
from sqlalchemy.ext.asyncio import create_async_engine

async def create_database_if_not_exists():
    if settings.DATABASE_URL.startswith("sqlite"):
        print("Using SQLite database. Table file will be created automatically.")
        return
    # Parse database name and default connection string
    # settings.DATABASE_URL looks like: postgresql+asyncpg://postgres:postgres@localhost:5432/pyq_hub
    try:
        base_url, db_name = settings.DATABASE_URL.rsplit('/', 1)
        # We need a clean db name in case of query parameters like ?ssl=require
        db_name_clean = db_name.split('?')[0]
        
        # Connect to 'postgres' default DB to execute CREATE DATABASE
        default_db_url = f"{base_url}/postgres"
        print(f"Connecting to default database to verify/create '{db_name_clean}'...")
        
        # We must use isolation_level="AUTOCOMMIT" because CREATE DATABASE cannot run in a transaction block
        temp_engine = create_async_engine(default_db_url, isolation_level="AUTOCOMMIT")
        async with temp_engine.connect() as conn:
            # Check if database exists
            check_query = text("SELECT 1 FROM pg_database WHERE datname = :dbname")
            result = await conn.execute(check_query, {"dbname": db_name_clean})
            exists = result.scalar()
            
            if not exists:
                print(f"Database '{db_name_clean}' does not exist. Creating...")
                await conn.execute(text(f"CREATE DATABASE {db_name_clean}"))
                print(f"Database '{db_name_clean}' created successfully.")
            else:
                print(f"Database '{db_name_clean}' already exists.")
        
        await temp_engine.dispose()
    except Exception as e:
        print(f"Warning/Error checking or creating database: {e}")
        print("Will attempt to proceed with standard table migrations...")

async def seed_data():
    # First, make sure database exists
    await create_database_if_not_exists()

    # Now drop and create tables
    async with engine.begin() as conn:
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("Creating default admin and contributor...")
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        contrib_user = User(
            username="contributor",
            hashed_password=get_password_hash("contrib123"),
            role="contributor"
        )
        db.add_all([admin_user, contrib_user])
        await db.flush()  # flush to generate IDs for users

        print("Creating streams...")
        btech = Stream(name="B.Tech")
        mba = Stream(name="MBA")
        db.add_all([btech, mba])
        await db.flush()

        print("Creating branches...")
        # B.Tech Branches
        ai_ds = Branch(stream_id=btech.id, name="Artificial Intelligence & Data Science")
        ece = Branch(stream_id=btech.id, name="Electronics & Communication Engineering (ECE)")
        ee = Branch(stream_id=btech.id, name="Electrical Engineering (EE)")
        civil = Branch(stream_id=btech.id, name="Civil Engineering")
        mech = Branch(stream_id=btech.id, name="Mechanical Engineering")
        aviation = Branch(stream_id=btech.id, name="Aviation Management")
        
        # MBA Programs
        finance = Branch(stream_id=mba.id, name="Finance")
        marketing = Branch(stream_id=mba.id, name="Marketing")
        hr = Branch(stream_id=mba.id, name="Human Resources")
        ops = Branch(stream_id=mba.id, name="Systems & Operations")
        analytics = Branch(stream_id=mba.id, name="Business Analytics")

        db.add_all([ai_ds, ece, ee, civil, mech, aviation, finance, marketing, hr, ops, analytics])
        await db.flush()

        print("Creating subjects...")
        subjects = []
        
        # AI & DS Subjects
        subjects.extend([
            Subject(branch_id=ai_ds.id, code="MA-101", name="Applied Mathematics I", semester=1),
            Subject(branch_id=ai_ds.id, code="PH-101", name="Engineering Physics", semester=1),
            Subject(branch_id=ai_ds.id, code="MA-102", name="Applied Mathematics II", semester=2),
            Subject(branch_id=ai_ds.id, code="CS-102", name="Introduction to Programming", semester=2),
            Subject(branch_id=ai_ds.id, code="DS-301", name="Data Structures & Algorithms", semester=3),
            Subject(branch_id=ai_ds.id, code="DS-302", name="Discrete Mathematics", semester=3),
            Subject(branch_id=ai_ds.id, code="DS-401", name="Database Management Systems", semester=4),
            Subject(branch_id=ai_ds.id, code="DS-402", name="Operating Systems", semester=4),
            Subject(branch_id=ai_ds.id, code="AI-501", name="Artificial Intelligence", semester=5),
            Subject(branch_id=ai_ds.id, code="AI-502", name="Machine Learning", semester=5),
            Subject(branch_id=ai_ds.id, code="AI-601", name="Deep Learning", semester=6),
            Subject(branch_id=ai_ds.id, code="AI-602", name="Natural Language Processing", semester=6),
            Subject(branch_id=ai_ds.id, code="DS-701", name="Big Data Analytics", semester=7),
            Subject(branch_id=ai_ds.id, code="AI-702", name="Computer Vision", semester=7),
            Subject(branch_id=ai_ds.id, code="AI-801", name="AI Ethics & Governance", semester=8),
            Subject(branch_id=ai_ds.id, code="CS-802", name="Cloud Computing", semester=8),
        ])

        # ECE Subjects
        subjects.extend([
            Subject(branch_id=ece.id, code="MA-101", name="Applied Mathematics I", semester=1),
            Subject(branch_id=ece.id, code="EC-102", name="Electronic Devices & Circuits", semester=1),
            Subject(branch_id=ece.id, code="EC-301", name="Network Theory", semester=3),
            Subject(branch_id=ece.id, code="EC-302", name="Digital Electronics", semester=3),
            Subject(branch_id=ece.id, code="EC-501", name="Analog Communication", semester=5),
            Subject(branch_id=ece.id, code="EC-502", name="Microprocessors & Microcontrollers", semester=5),
            Subject(branch_id=ece.id, code="EC-701", name="Wireless & Mobile Communication", semester=7),
            Subject(branch_id=ece.id, code="EC-801", name="Satellite Communication", semester=8),
        ])

        # Electrical Engineering Subjects
        subjects.extend([
            Subject(branch_id=ee.id, code="EE-101", name="Basic Electrical Engineering", semester=1),
            Subject(branch_id=ee.id, code="EE-301", name="Electrical Machines I", semester=3),
            Subject(branch_id=ee.id, code="EE-501", name="Power Systems I", semester=5),
            Subject(branch_id=ee.id, code="EE-701", name="Control Systems", semester=7),
        ])

        # Civil Engineering Subjects
        subjects.extend([
            Subject(branch_id=civil.id, code="CE-101", name="Engineering Mechanics", semester=1),
            Subject(branch_id=civil.id, code="CE-301", name="Fluid Mechanics", semester=3),
            Subject(branch_id=civil.id, code="CE-501", name="Structural Analysis I", semester=5),
            Subject(branch_id=civil.id, code="CE-701", name="Design of Concrete Structures", semester=7),
        ])

        # Mechanical Engineering Subjects
        subjects.extend([
            Subject(branch_id=mech.id, code="ME-101", name="Engineering Drawing", semester=1),
            Subject(branch_id=mech.id, code="ME-301", name="Thermodynamics", semester=3),
            Subject(branch_id=mech.id, code="ME-501", name="Machine Design I", semester=5),
            Subject(branch_id=mech.id, code="ME-701", name="Heat & Mass Transfer", semester=7),
        ])

        # Aviation Management Subjects
        subjects.extend([
            Subject(branch_id=aviation.id, code="AV-101", name="Introduction to Aviation Industry", semester=1),
            Subject(branch_id=aviation.id, code="AV-301", name="Airport Management", semester=3),
            Subject(branch_id=aviation.id, code="AV-501", name="Air Traffic Control", semester=5),
            Subject(branch_id=aviation.id, code="AV-701", name="Aviation Safety & Security", semester=7),
        ])

        # MBA General / Finance
        subjects.extend([
            Subject(branch_id=finance.id, code="MBA-101", name="Management Principles", semester=1),
            Subject(branch_id=finance.id, code="MBA-102", name="Organizational Behavior", semester=1),
            Subject(branch_id=finance.id, code="MBA-201", name="Financial Management", semester=2),
            Subject(branch_id=finance.id, code="MBA-202", name="Marketing Management", semester=2),
            Subject(branch_id=finance.id, code="FIN-301", name="Financial Derivatives", semester=3),
            Subject(branch_id=finance.id, code="FIN-302", name="Investment & Portfolio Management", semester=3),
            Subject(branch_id=finance.id, code="FIN-401", name="International Finance", semester=4),
            Subject(branch_id=finance.id, code="MBA-402", name="Business Ethics", semester=4),
        ])

        # MBA Marketing
        subjects.extend([
            Subject(branch_id=marketing.id, code="MBA-101", name="Management Principles", semester=1),
            Subject(branch_id=marketing.id, code="MKT-301", name="Consumer Behavior", semester=3),
            Subject(branch_id=marketing.id, code="MKT-302", name="Digital Marketing & Brands", semester=3),
            Subject(branch_id=marketing.id, code="MKT-401", name="Services Marketing", semester=4),
        ])

        db.add_all(subjects)
        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
