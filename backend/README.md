# AccessAtlas — Backend Foundation

FastAPI service foundation for the AccessAtlas cultural discovery and participation-planning platform.

> **Status Notice**: This backend service currently implements the local process availability endpoint (`GET /health`) and configuration loading. Cultural discovery (Qloo), agent orchestration (LangGraph), database persistence, and external integrations are not yet operational.

---

## Technical Baseline

- **Python**: 3.12+ (tested with Python 3.13)
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Configuration**: Pydantic Settings
- **Testing**: Pytest & HTTPX
- **Linting & Formatting**: Ruff

---

## Local Development (Windows PowerShell)

All commands below are intended to be executed from the `backend/` directory in Windows PowerShell:

```powershell
# Navigate to the backend directory
cd C:\Pro\AccessAtlas\backend
```

### 1. Create and Activate Virtual Environment

```powershell
# Create a virtual environment using Python 3.12+
python -m venv .venv

# Activate the virtual environment in PowerShell
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

Install the backend package with development dependencies in editable mode:

```powershell
python -m pip install --upgrade pip
pip install -e ".[dev]"
```

Alternatively, if running against the installed Python environment:
```powershell
pip install -e .
```

### 3. Configuration

The application runs using safe development defaults (`APP_ENV=development`) without requiring any environment file.

To configure local overrides:
1. Refer to the root `.env.example` file for supported configuration keys (`APP_ENV`).
2. Create `.env.local` in either the repository root or `backend/.env.local`.
3. Never stage or commit `.env.local` to version control.

### 4. Run the Development Server

Start the Uvicorn ASGI server with hot reloading enabled:

```powershell
uvicorn app.main:app --reload --port 8000
```

### 5. Verify the Health Endpoint

Verify process availability by querying `GET /health` in another PowerShell terminal:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```

Expected JSON response:
```json
{
  "status": "ok",
  "service": "accessatlas-backend"
}
```

Interactive API documentation is available at `http://127.0.0.1:8000/docs` in non-production environments.

---

## Quality Tooling & Verification

### Run Automated Tests

Execute the Pytest test suite:

```powershell
pytest
```

Run tests with verbose output:

```powershell
pytest -v
```

### Run Ruff Linter

Check code for lint errors and style violations:

```powershell
ruff check .
```

### Run Ruff Formatter Check

Verify code formatting conforms to project style:

```powershell
ruff format --check .
```
