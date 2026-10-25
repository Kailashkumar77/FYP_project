# FYP-I Midterm Defense Presentation & Demonstration Guide
## Project: IntelliCRM AI — AI-Powered CRM Platform
**Students:** Kailash Kumar (2212147), Iqra Muhammad Qasim (23802274)  
**Supervisor:** Asif Khalid Qureshi  
**Institution:** SZABIST Karachi Campus  

---

## 1. Presentation Structure (Slide by Slide)

### Slide 1: Title & Team
- **Title:** IntelliCRM AI: AI-Powered Multi-Tenant CRM Platform for Software Houses
- **Presenters:** Kailash Kumar & Iqra Muhammad Qasim
- **Supervisor:** Asif Khalid Qureshi
- **Milestone:** FYP-I Midterm Evaluation (Weeks 8–9)

### Slide 2: Problem Statement & Motivation
- B2B software houses face high client churn and long sales cycles due to fragmented tools.
- Generic CRMs lack software agency domain alignment, automated meeting summarization, and predictive churn detection.
- **Midterm Goal:** Build a solid, database-connected application foundation with working authentication, user profile management, complete CRM CRUD operations, and a live dashboard.

### Slide 3: System Architecture (Clean Architecture)
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts.
- **Backend:** Python FastAPI, SQLAlchemy 2.x async engine, Pydantic v2 validation.
- **Database:** PostgreSQL 16 relational database with multi-tenant isolation.
- **AI Readiness:** Decoupled Google GenAI adapter prepared for post-midterm integration.

### Slide 4: Database Design & ERD
- Walk through the core ERD entities: `tenants`, `users`, `leads`, `clients`, `pipeline_stages`, `activity_logs`.
- Highlight multi-tenancy enforcement: every table is indexed on `tenant_id`.

### Slide 5: Midterm Implemented Features
1. **Authentication & Security:** Salted `bcrypt` hashing, JWT access tokens, 15-minute lockout protection after 5 failed attempts.
2. **User Profile Management:** Viewing and editing user profile with immediate PostgreSQL persistence.
3. **Leads Management (CRUD):** Creation, real-time search, stage filtering, inline updates, and archiving.
4. **Clients Management (CRUD):** Directory, search, and churn risk tracking.
5. **Real Dashboard:** Live metric calculations from actual database queries (no fake numbers).

### Slide 6: Live Demonstration Workflow
*(Follow the step-by-step demo script in Section 2 below)*

### Slide 7: Verification & Test Results
- Automated integration test suite (`pytest`) covering:
  - Root & database health diagnostics
  - Authentication success and invalid password rejection
  - User profile management
  - Complete Leads CRUD lifecycle
  - Complete Clients CRUD lifecycle
  - Real database dashboard metrics
- Result: **9 of 9 automated integration tests passing (100% success rate)**.

### Slide 8: Post-Midterm Roadmap (Remaining FYP-I & FYP-II)
- Interactive drag-and-drop Kanban board stage transitions.
- Predictive lead scoring with Google Gemini feature attribution.
- Customer message sentiment analysis and churn escalation alerts.
- Meeting summarization and automated email drafting.

---

## 2. Live Demonstration Script for Evaluators

1. **Step 1: Application Launch & Diagnostics**
   - Show terminal running FastAPI backend on `http://localhost:8000`.
   - Open browser to `http://localhost:8000/docs` to demonstrate interactive Swagger OpenAPI documentation.
   - Show `http://localhost:8000/api/v1/health/db` returning `{"status": "healthy", "database": "connected"}`.

2. **Step 2: Authentication & Protected Routes**
   - Open frontend at `http://localhost:3000`.
   - Attempt to access `/dashboard` directly without logging in $\rightarrow$ observe automatic redirect to `/login`.
   - Demonstrate the "Admin Demo" quick-fill button (`admin@intellicrm.ai`).
   - Click "Sign In" $\rightarrow$ observe instant verification, JWT issuance, and redirection to `/dashboard`.

3. **Step 3: Real Database Dashboard**
   - Point out the 4 KPI cards: Total Leads (6), Active Clients (3), Total Pipeline Value, and Conversion Rate.
   - Point out that every number is calculated from actual PostgreSQL records inserted by the database seeder.
   - Show the Sales Pipeline Stage Breakdown chart rendering real opportunity counts across stages.

4. **Step 4: Lead Management (CRUD Demonstration)**
   - Click **Leads** in the sidebar.
   - **Search:** Type `Robotics` $\rightarrow$ watch list filter in real time.
   - **Stage Filter:** Click `Won` or `Proposal Sent` $\rightarrow$ observe filtered results.
   - **Create:** Click "Add New Lead", fill in a new agency prospect (e.g. `Apex Mobile AI`, Budget `$48,000`), submit form $\rightarrow$ show green toast notification.
   - **Update:** Click Edit on the created lead, change stage to `Negotiation`, click Save $\rightarrow$ show persisted update.
   - **Delete:** Click Delete on a lead $\rightarrow$ modal confirmation dialog appears $\rightarrow$ confirm archive $\rightarrow$ lead is soft-deleted.

5. **Step 5: Client Management (CRUD Demonstration)**
   - Click **Clients** in the sidebar.
   - Demonstrate active clients (`Nexus Financial`, `BioHealth Diagnostics`, `OmniRetail Global`).
   - Click "Add New Client" $\rightarrow$ create client $\rightarrow$ observe persistence.

6. **Step 6: User Profile Management**
   - Click **My Profile** in the user menu.
   - Show current user details (`Kailash Kumar`).
   - Edit Full Name to `Kailash Kumar (Updated)` and phone number $\rightarrow$ click Save.
   - Show green toast notification and observe that the user header menu updates immediately.
   - Refresh the page to prove that changes were saved directly in the PostgreSQL database.

7. **Step 7: Sign Out**
   - Click user avatar in top-right $\rightarrow$ click "Sign Out".
   - Token is wiped from `localStorage`, and user is returned safely to the login screen.
