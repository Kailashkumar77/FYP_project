# Use Case Descriptions — Midterm Release
## Project: IntelliCRM AI

This document provides IEEE-style Use Case Descriptions for all core workflows supported in the midterm build.

---

### UC-01: Authenticate (Login & Logout)
- **Primary Actor:** Sales Agent / Agency Admin.
- **Preconditions:** Registered user record in PostgreSQL with salted `bcrypt` password hash.
- **Postconditions:** User receives a valid JWT access token and is redirected to `/dashboard`.
- **Main Flow:**
  1. Actor navigates to the login screen (`/login`).
  2. Actor enters email and password and clicks "Sign In".
  3. Frontend validates format and sends `POST /api/v1/auth/login`.
  4. Backend checks if account is locked (`locked_until > now`).
  5. Backend verifies password against stored `bcrypt` hash.
  6. Backend resets `failed_login_attempts` to 0.
  7. Backend issues signed JWT containing user ID, tenant ID, and role.
  8. Frontend stores token in `localStorage`, initializes user context, and navigates to `/dashboard`.
- **Alternative Flows:**
  - *Invalid Credentials (4a):* Backend increments `failed_login_attempts`. If attempts $\ge 5$, sets `locked_until = now + 15 min`. Returns HTTP 401. Frontend displays error alert.
  - *Logout (4b):* User clicks "Sign Out" in header menu; frontend destroys stored token and routes back to `/login`.

---

### UC-02: Manage Personal Profile
- **Primary Actor:** Any Authenticated User.
- **Preconditions:** Active JWT bearer token.
- **Postconditions:** User's profile updates are persisted in PostgreSQL.
- **Main Flow:**
  1. Actor navigates to `/profile`.
  2. Frontend sends `GET /api/v1/users/me` with bearer token.
  3. Backend verifies token and returns user details.
  4. Actor edits Full Name and/or Contact Phone and clicks "Save Changes".
  5. Frontend sends `PATCH /api/v1/users/me` with validated payload.
  6. Backend updates the record in PostgreSQL within a transaction.
  7. Frontend displays green success toast: "Profile updated successfully in PostgreSQL database!".
- **Alternative Flows:**
  - *Validation Failure:* Empty name or invalid phone triggers inline field validation error.
  - *Unauthorized Cross-Tenant Attempt:* Backend verifies `User.tenant_id == token.tenant_id`, rejecting any cross-tenant tampering.

---

### UC-03: View Live Dashboard Metrics
- **Primary Actor:** Any Authenticated User.
- **Preconditions:** Active JWT session.
- **Postconditions:** Real database-calculated business indicators are rendered.
- **Main Flow:**
  1. Actor opens `/dashboard`.
  2. Frontend sends `GET /api/v1/dashboard/metrics`.
  3. Backend executes SQL aggregation queries:
     - `SELECT count(id) FROM leads WHERE is_archived = false`
     - `SELECT count(id) FROM clients WHERE is_archived = false`
     - `SELECT sum(budget) FROM leads WHERE is_archived = false`
     - Grouping count and value by `stage`
     - Retrieving latest 5 active leads and clients
  4. Frontend renders 4 KPI metric cards, stage distribution bar chart, and recent prospects table.

---

### UC-04: Manage Sales Leads (Complete CRUD)
- **Primary Actor:** Sales Agent / Admin.
- **Preconditions:** Active JWT session.
- **Postconditions:** Lead record is created, updated, or archived in PostgreSQL.
- **Main Flow:**
  1. **Create:** Actor navigates to `/leads/new`, fills form (Company, Contact, Email, Phone, Budget, Domain Fit, Clarity, Stage), and clicks "Save Lead". Backend computes initial heuristic score, commits record to PostgreSQL, and logs activity.
  2. **List / Search:** Actor browses `/leads`, types in search bar (e.g. "Fintech"), or filters by stage. Table filters live records from PostgreSQL.
  3. **Read Details:** Actor clicks on a lead row to open `/leads/[id]`, viewing complete opportunity parameters.
  4. **Update:** Actor modifies stage (e.g. from "Contacted" to "Proposal Sent") or budget and clicks "Save Changes". Backend commits update immediately.
  5. **Delete:** Actor clicks Delete icon; confirmation modal prompts user; upon confirmation, backend executes soft-delete (`is_archived = true`), removes lead from active queries, and displays toast notification.

---

### UC-05: Manage Client Accounts (Complete CRUD)
- **Primary Actor:** Account Manager / Admin.
- **Preconditions:** Active JWT session.
- **Postconditions:** Client record is created, updated, or archived in PostgreSQL.
- **Main Flow:**
  1. **Create:** Actor navigates to `/clients/new`, enters corporate profile and churn risk level, and submits form.
  2. **List:** Actor browses `/clients` directory with search filtering.
  3. **Update:** Actor opens `/clients/[id]` and modifies contact details or churn risk level.
  4. **Delete:** Actor archives client account via modal confirmation.
