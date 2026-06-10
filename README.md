# PYQ Hub - Academic Repository Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Postgresql-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**PYQ Hub** is a premium, full-stack web application built to serve as a centralized hub for students and academic contributors to explore, download, and upload Previous Year Question (PYQ) papers. It provides an intuitive interface for drilling down through academic branches, semesters, and subjects to locate the relevant exam papers in seconds.

---

## 🚀 Key Features

*   **Dynamic Hierarchical Discovery:** Seamlessly browse papers via cascading filters: **Stream** (e.g., B.Tech, MBA) $\rightarrow$ **Branch/Specialization** $\rightarrow$ **Subject** $\rightarrow$ **Semester** (1 to 8).
*   **Role-Based Access Control (RBAC):** 
    *   `Admin`: Full system administration capabilities, metadata seeding, and category control.
    *   `Contributor`: Authenticated users who can upload and index question papers.
*   **Polymorphic File Storage:** Abstracted file upload service that switches easily between **Local Disk Storage** (development) and **AWS S3 Cloud Buckets** (production) using secure, short-lived presigned URLs.
*   **Async Processing Pipeline:** Designed with non-blocking database queries via **SQLAlchemy Asynchronous ORM** and async database drivers (`asyncpg` for Postgres, `aiosqlite` for SQLite).
*   **Production-Ready Containerization:** Standardized dev/prod environments orchestrated via **Docker Compose** featuring Nginx reverse-proxy caching.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Axios | Fast, modern client interface with smooth responsive styling |
| **Backend** | FastAPI, Python 3.11, Uvicorn | High-performance asynchronous API framework |
| **Database** | PostgreSQL, SQLAlchemy 2.0, Pydantic | Robust relational storage with typed async ORM models |
| **Security** | JWT Tokens, OAuth2, Passlib (bcrypt) | Stateless tokens & cryptographically hashed password security |
| **Storage** | AWS S3, Boto3, Local Storage | Flexible object storage for PDFs and document uploads |
| **Orchestrator** | Docker, Docker Compose, Nginx | Multi-container setups for database, backend, and static client |

---

## 📂 Project Structure

```text
PYQ website/
├── backend/
│   ├── app/
│   │   ├── routes/        # Router files (auth, streams, branches, subjects, papers)
│   │   ├── auth.py        # Token issuance and verification
│   │   ├── database.py    # Async DB session management
│   │   ├── models.py      # SQLAlchemy schemas (User, Stream, Branch, Subject, QuestionPaper)
│   │   ├── schemas.py     # Pydantic request/response serializers
│   │   ├── seed.py        # Database creation and mock data seeder
│   │   └── storage.py     # Abstract storage provider interface (Local/S3)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── tests/             # Automated test suite (pytest)
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (filters, grids, navbar)
│   │   ├── context/       # Auth and dynamic filter global React context
│   │   ├── pages/         # Page components (Home, Login, Upload)
│   │   └── services/      # Axios endpoints wrapper
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── .gitignore
```

---

## 📦 Setup and Installation

### Method 1: Using Docker (Quickest Setup)

Make sure you have Docker and Docker Compose installed.

1.  **Clone and enter the directory:**
    ```bash
    git clone https://github.com/arup04/PYQ-HUB.git
    cd PYQ-HUB
    ```

2.  **Spin up the infrastructure:**
    ```bash
    docker-compose up --build
    ```
    This command downloads, builds, and launches:
    *   **Database (PostgreSQL)** on port `5432`
    *   **Backend (FastAPI)** on port `8000` (API Docs at `http://localhost:8000/docs`)
    *   **Frontend (React/Nginx)** on port `80` (accessible at `http://localhost`)

---

### Method 2: Local Manual Setup

If you prefer to run the components locally without Docker:

#### 1. Backend Setup

1.  Navigate to the backend directory and create a virtual environment:
    ```bash
    cd backend
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Configure variables in a `.env` file (copy from `.env.example`):
    ```env
    DATABASE_URL=sqlite+aiosqlite:///./pyq_hub.db
    JWT_SECRET=your_jwt_secret_key_here
    STORAGE_TYPE=local
    UPLOAD_DIR=uploads
    ```

4.  **Seed the Database** (drops existing tables, creates schemas, and populates default streams, branches, subjects, and admin/contributor accounts):
    ```bash
    python app/seed.py
    ```

5.  Start the FastAPI server:
    ```bash
    uvicorn app.main:app --reload
    ```

---

#### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install packages:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🔑 Default Accounts (Created during Seeding)

When running `python app/seed.py` or building the application, the database is pre-seeded with two accounts for testing roles:

| Username | Password | Role | Access Level |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | `admin` | Full CRUD operations on categories, metadata & papers |
| **contributor** | `contrib123` | `contributor` | Can upload and manage files they uploaded |

---

## 🧪 Running Tests
The backend features integration and unit testing modules utilizing `pytest` and `anyio`.

To run the test suites locally:
```bash
cd backend
pytest
```
