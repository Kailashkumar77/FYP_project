# System Architecture: IntelliCRM AI

This document details the Clean Architecture of the IntelliCRM AI platform.

---

## 1. Architectural Layers (FastAPI Backend)

### Domain Layer (`app/domain/`)
- Contains pure Python domain entities and value objects.
- Defines business rules, scoring heuristics, and domain exceptions.
- Completely decoupled from frameworks, database drivers, and the Gemini SDK.

### Application Layer (`app/application/`)
- Contains application use cases, service orchestrators, and DTOs.
- Coordinates business workflows:
  - Lead qualification and pipeline stage advancement
  - Client conversion and 360-degree profile aggregation
  - Meeting transcript processing and email draft generation
  - Multi-line invoice calculation and payment recording
- Manages authorization checks and transactional boundaries.

### Infrastructure Layer (`app/infrastructure/`)
- Concrete repository implementations using SQLAlchemy 2.0.
- PostgreSQL database engine with connection pooling and aiosqlite support.
- Google GenAI SDK adapter (`GeminiAdapter`) with structured JSON schema outputs.
- ReportLab PDF generator service for invoice rendering.

### Presentation Layer (`app/presentation/`)
- FastAPI routers grouped by domain under `/api/v1/*`.
- Pydantic v2 schemas for request validation and response serialisation.
- JWT authentication dependency and multi-tenant data isolation enforcement.
- OpenAPI specification documentation.

---

## 2. Frontend Architecture (Next.js 14+ App Router)

- **`app/`**: Next.js App Router directory with `(auth)` and `(dashboard)` route groups.
- **`components/ui/`**: Reusable atomic UI elements (Buttons, Inputs, Cards, Modals, Badges, Tabs, Skeletons).
- **`features/`**: Feature-oriented modules (leads, clients, projects, tasks, communications, meetings, invoices, analytics).
- **`lib/`**: Centralized typed API client (`axios`), authentication token storage, and date/currency helpers.
