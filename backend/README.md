# AccessAtlas — Backend Foundation

FastAPI service foundation for the AccessAtlas cultural discovery and participation-planning platform.

> **Status Notice**: This backend service implements the local process availability endpoint (`GET /health`), configuration loading, Qloo cultural discovery integration (`app.qloo`), independently sourced venue evidence repository (`app.evidence`), deterministic Possibility Engine (`app.possibility`), LangGraph agent orchestration (`app.agent`), and the Discovery API (`POST /api/v1/discover`) for the Ahmedabad pilot. Persistent PostgreSQL storage and frontend are scheduled for subsequent stages.

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

### 6. Verify the Discovery API (Ahmedabad Pilot)

Execute a cultural discovery and participation planning query via `POST /api/v1/discover`:

```powershell
$body = @{
    city = "Ahmedabad"
    cultural_interests = @("textiles", "historic museum")
    requirements = @(
        @{
            requirement_id = "req_res"
            attribute = "reservation_required"
            scope = "venue"
            priority = "mandatory"
            operator = "equals"
            expected_value = $true
        }
    )
    max_candidates = 3
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/discover" -Method Post -ContentType "application/json" -Body $body
```

For complete API documentation, schema definitions, and error handling conventions, see [`docs/API.md`](../docs/API.md).

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

---

## Continuous Integration (CI)

GitHub Actions runs automated backend verification on pull requests targeting `dev` or `main` and on pushes affecting the `backend/` directory ([`.github/workflows/backend-ci.yml`](../.github/workflows/backend-ci.yml)).

The workflow executes on Python 3.12 with `contents: read` permissions:

1. **Dependency Installation**:
   ```bash
   pip install -e ".[dev]"
   ```
2. **Linting Check**:
   ```bash
   ruff check .
   ```
3. **Format Check**:
   ```bash
   ruff format --check .
   ```
4. **Test Suite**:
   ```bash
   pytest -v
   ```

---

## Qloo Cultural Discovery Integration

AccessAtlas integrates with the Qloo API to power cultural affinity and aggregate taste discovery signals.

### Integration Overview

- **Module**: `app.qloo` ([`app.qloo.client.QlooClient`](app/qloo/client.py))
- **Base URL**: `https://hackathon.api.qloo.com` (default)
- **Authentication**: `X-Api-Key` header
- **Supported Operations**:
  - **Entity Lookup**: `GET /search` with `query`, `types`, `take`, `page`
  - **Cross-Domain Insights**: `GET /v2/insights` with `filter.type`, `signal.interests.entities`, `take`, `page`
  - **Normalized Domain Models**: [`QlooEntity`](app/qloo/models.py), [`QlooSearchResult`](app/qloo/models.py), [`QlooInsightsResult`](app/qloo/models.py)

### Required Configuration Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `QLOO_API_KEY` | Optional at general startup, required when invoking `QlooClient` | `None` | Developer API key issued for the Qloo Hackathon |
| `QLOO_BASE_URL` | No | `https://hackathon.api.qloo.com` | Qloo API environment endpoint |

### Local Credential Setup

Per repository security rules (`SECURITY.md`), credentials must **never** be committed to version control.

1. Inspect `.env.example` at the repository root for the configuration template.
2. In your local development environment, create `.env.local` in the repository root (or `backend/.env.local`):
   ```ini
   QLOO_API_KEY=your_actual_hackathon_key_here
   QLOO_BASE_URL=https://hackathon.api.qloo.com
   ```
3. `.env.local` is strictly ignored by `.gitignore`. Do not stage or share this file.

### Running Mocked Automated Tests

The automated test suite uses `httpx.MockTransport` and runs completely offline without requiring a real API key or external network access:

```powershell
pytest tests/test_qloo.py -v
```

This tests:
- Valid entity search and normalization
- Valid cross-domain insights discovery
- Request authentication header construction without logging secret values
- Proper query parameter handling
- Empty results and HTTP 404 mapping
- Missing configuration validation
- HTTP 401 authentication error handling
- HTTP 429 rate limit handling
- Outbound timeout handling
- Malformed provider responses

### Optional Live Smoke Verification

An explicit opt-in smoke test script is provided for manual verification against the live Qloo Hackathon endpoint when authorized by the developer:

```powershell
python -m app.qloo.live_smoke_test
```

**Security & Privacy Guarantees**:
- The script uses runtime configuration and masks the API key (e.g., `abcd...1234`).
- It does **not** print or persist raw private provider JSON payloads.
- It is **not** run automatically in Pytest or CI.
- If `QLOO_API_KEY` is not configured, it exits safely with a skip notification.

### Known Limitations

- **Aggregate Affinity Only**: Qloo signals describe aggregate cultural affinities. They must never be treated as evidence of venue accessibility, operational hours, or event ticket availability.
- **Scope**: This integration implements low-level entity search and cross-domain insights. Agentic orchestration (LangGraph), multi-hop reasoning, and venue evidence integration are scheduled for subsequent issues.
- **Hackathon Sandbox**: Data availability is subject to the hackathon API coverage; empty results for uncommon entities are handled gracefully as empty lists.
