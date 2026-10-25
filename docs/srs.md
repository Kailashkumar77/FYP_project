# Software Requirements Specification (SRS) — Midterm Release
## Project: IntelliCRM AI (AI-Powered CRM Platform)
**Course / Level:** Final Year Project (FYP-I), Fall 2026 — Midterm Iteration (Weeks 8–9)  
**Institution:** Shaheed Zulfiqar Ali Bhutto Institute of Science and Technology (SZABIST), Karachi Campus  
**Department:** Faculty of Computing and Engineering Sciences  
**Authors:** Kailash Kumar (2212147), Iqra Muhammad Qasim (23802274)  
**Supervisor:** Asif Khalid Qureshi  
**Version:** 1.0 (Midterm Working Software Release)  

---

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for the midterm milestone of IntelliCRM AI. The purpose of this release is to deliver a functional, database-connected application demonstrating authentication, role-based access, personal profile management, and complete CRUD workflows for core CRM entities (Leads and Clients).

### 1.2 Scope
IntelliCRM AI is a multi-tenant B2B Customer Relationship Management web platform built for software development agencies and IT services firms.
- **Midterm In-Scope:**
  - Multi-tenant architecture and persistent database connectivity (PostgreSQL 16 via SQLAlchemy 2.x and Alembic).
  - JWT authentication, password hashing (`bcrypt`), and account lockout mechanisms.
  - Personal profile viewing and modification with database persistence.
  - Complete CRUD for Leads (company, contact, budget, domain fit, requirement clarity, pipeline stage).
  - Complete CRUD for Clients (company, primary contact, email, phone, industry vertical, churn risk level).
  - Real database-aggregated dashboard (KPI cards, pipeline stage distribution charts, recent activity).
- **Post-Midterm (FYP-I Final & FYP-II Scope):**
  - Interactive Kanban board drag-and-drop transitions.
  - Google Gemini AI integration (predictive lead scoring, sentiment & urgency classification, meeting summarization, follow-up email drafting).
  - Project milestone tracking and PDF invoice generation.

---

## 2. Overall Description
### 2.1 Product Perspective
IntelliCRM AI follows Clean Architecture with a distinct Next.js frontend (App Router, TypeScript, Tailwind CSS) communicating with a Python FastAPI REST API backend connected to a PostgreSQL database.

### 2.2 User Classes & Roles
1. **Admin / Agency Owner:** Full access to manage workspace leads, clients, system settings, and team users.
2. **Sales Agent / Business Developer:** Manages sales prospects, leads qualification, and client accounts.
3. **Account Manager:** Monitors client communication and churn risk.

---

## 3. Specific Functional Requirements (Midterm Deliverables)

### Module 1: Authentication & Session Management
- **FR-01 (Login):** The system shall allow users to log in using a registered email and password.
- **FR-02 (Password Hashing):** Passwords shall be stored as salted `bcrypt` hashes. Plaintext passwords shall never be persisted or logged.
- **FR-03 (Token Issuance):** Upon successful authentication, the system shall issue a signed JSON Web Token (JWT) embedding `user_id`, `tenant_id`, and `role`.
- **FR-04 (Lockout):** The system shall temporarily lock an account for 15 minutes after 5 consecutive failed login attempts.
- **FR-05 (Protected Routes):** Unauthenticated requests to dashboard endpoints shall be rejected with HTTP 401.
- **FR-06 (Logout):** The system shall allow users to log out, clearing client-side tokens and redirecting to the login screen.

### Module 2: User Profile Management
- **FR-07 (View Profile):** The system shall display the authenticated user's name, email, workspace role, and phone number.
- **FR-08 (Update Profile):** The system shall permit users to update their Full Name and Phone Number, immediately persisting updates to PostgreSQL.
- **FR-09 (Authorization Protection):** Users shall not be permitted to modify another user's profile or change their own assigned role without Admin authorization.

### Module 3: Lead Management (CRUD)
- **FR-10 (Create Lead):** Users shall be able to create new leads with mandatory company name, contact person, email, budget, domain fit (1-5), and initial pipeline stage.
- **FR-11 (List Leads):** The system shall render a searchable table of leads with real-time text filtering and stage selection dropdowns.
- **FR-12 (View Lead Details):** The system shall display lead attributes and predicted conversion scores.
- **FR-13 (Update Lead):** Users shall be able to edit lead stage, budget, contact information, and scope notes.
- **FR-14 (Archive Lead):** The system shall soft-delete leads upon user confirmation, archiving the record while preserving audit integrity.

### Module 4: Client Account Management (CRUD)
- **FR-15 (Create Client):** Users shall be able to register active client accounts with industry vertical and initial churn risk.
- **FR-16 (List Clients):** The system shall display active client records with search filtering.
- **FR-17 (Update Client):** Users shall be able to update corporate details and churn risk ratings (`LOW`, `MEDIUM`, `HIGH`).
- **FR-18 (Archive Client):** The system shall soft-delete client accounts with modal confirmation.

### Module 5: Real Dashboard Metrics
- **FR-19 (Live Metrics):** The dashboard shall compute Total Active Leads, Active Clients, Total Pipeline Value ($), and Win Conversion Rate (%) directly from database queries.
- **FR-20 (Stage Visualization):** The dashboard shall render a distribution chart showing opportunity counts across stages (`New`, `Contacted`, `Proposal Sent`, `Negotiation`, `Won`, `Lost`).
- **FR-21 (Recent Activity):** The dashboard shall display the most recently created leads and clients fetched from the database.

---

## 4. Non-Functional Requirements
- **NFR-01 (Performance):** Dashboard and CRUD endpoints shall respond within 500ms under normal demonstration load.
- **NFR-02 (Security):** All API communications shall use bearer JWT verification; SQL queries shall enforce `tenant_id` boundaries.
- **NFR-03 (Usability):** The interface shall follow a professional SaaS aesthetic with a clean white background, light gray surfaces, dark navy text, and blue-to-purple gradient primary action buttons.
- **NFR-04 (Reliability):** Database transactions shall ensure atomic commits and automatic rollbacks on errors.
