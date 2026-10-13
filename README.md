# AccessAtlas

> **Accessibility Intelligence & Navigation Platform**

AccessAtlas is an open-standard accessibility intelligence platform that maps and communicates granular physical accessibility attributes for venues, public infrastructure, and urban pathways. By moving beyond binary accessibility indicators, AccessAtlas enables dignified, barrier-free mobility for wheelchair users, people with sensory sensitivities, and parents with strollers.

---

## Current Status: Phase 0 (Governance & Contract Baseline)

AccessAtlas is currently in **Phase 0: Inception and Repository Governance Baseline**. 

Application runtime code and geospatial services have not yet been implemented. All engineering and security contracts are established first to ensure safety, reproducible agent collaboration, and zero credential leakage.

To understand the boundaries between current and planned capabilities, see [`docs/PRODUCT.md`](./docs/PRODUCT.md).

---

## Repository Governance & Architecture Contracts

All contributors (human engineers and AI agents) must adhere to the foundational contracts established in this repository:

| Document | Purpose |
| :--- | :--- |
| [**`AGENTS.md`**](./AGENTS.md) | Authoritative operating contract and guardrails for AI agents and automated tools. |
| [**`SECURITY.md`**](./SECURITY.md) | Security policy, zero-secret enforcement, and vulnerability reporting procedures. |
| [**`docs/PRODUCT.md`**](./docs/PRODUCT.md) | Product boundaries, user personas, and implementation status matrix. |
| [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md) | Confirmed architectural decisions (ADRs) vs. planned component candidates. |
| [**`docs/ENGINEERING.md`**](./docs/ENGINEERING.md) | Git workflow, branching conventions, PR guidelines, and Definition of Done. |
| [**`.github/pull_request_template.md`**](./.github/pull_request_template.md) | Standardized PR template with required hygiene and security checklist. |

---

## Engineering Quick Start & Workflow

AccessAtlas uses a trunk-based development flow with protected `main` and `dev` branches:
- **`main`**: Production release line.
- **`dev`**: Active integration trunk.
- **Task Branches**: Always branched from `dev` (`<type>/<description>`), submitted via Pull Request targeting `dev`.

```bash
# Clone the repository
git clone https://github.com/BP1202/AccessAtlas.git
cd AccessAtlas

# Sync integration branch
git switch dev
git pull origin dev

# Create a task branch
git switch -c feat/your-feature-name
```

> **Note**: `.env.local` is strictly ignored by Git. Never commit real credentials or private keys to the repository.

---

## Backend Development

The backend service is located in the [`backend/`](./backend/) directory and is built using FastAPI and Python 3.12+.

```powershell
# Navigate to backend
cd backend

# Run automated tests
pytest

# Run development server
uvicorn app.main:app --reload --port 8000
```

Verify availability via `GET /health`:
```json
{
  "status": "ok",
  "service": "accessatlas-backend"
}
```

See [`backend/README.md`](./backend/README.md) for full setup, virtual environment, and linting instructions.

---

## License

This project is licensed under the terms of the MIT License.
