# Entity Relationship Diagram (ERD) — Midterm Release
## Project: IntelliCRM AI

This document specifies the relational data model for the IntelliCRM AI Midterm build.

---

## 1. Mermaid Entity Relationship Diagram

```mermaid
erDiagram
    TENANTS ||--o{ USERS : "employs"
    TENANTS ||--o{ PIPELINE_STAGES : "configures"
    TENANTS ||--o{ LEADS : "manages"
    TENANTS ||--o{ CLIENTS : "maintains"
    TENANTS ||--o{ ACTIVITY_LOGS : "records"

    USERS ||--o{ LEADS : "assigned to"
    USERS ||--o{ CLIENTS : "account manager for"
    USERS ||--o{ ACTIVITY_LOGS : "performs"

    PIPELINE_STAGES ||--o{ LEADS : "categorizes"
    LEADS ||--o| CLIENTS : "converts to"

    TENANTS {
        string id PK "UUID"
        string name "Agency Workspace Name"
        string slug UK "Unique URL identifier"
        string plan "STARTER | PRO | ENTERPRISE"
        string logo_url "Optional logo URL"
        datetime created_at "UTC timestamp"
        datetime updated_at "UTC timestamp"
    }

    USERS {
        string id PK "UUID"
        string tenant_id FK "References tenants.id (CASCADE)"
        string full_name "User Full Name"
        string email UK "Login email address"
        string password_hash "Salted bcrypt hash"
        string role "ADMIN | SALES_AGENT | ACCOUNT_MANAGER"
        string phone "Contact number"
        boolean is_active "Active flag"
        boolean is_verified "Email verified flag"
        int failed_login_attempts "Lockout counter"
        datetime locked_until "Lockout expiration timestamp"
        datetime created_at
        datetime updated_at
    }

    PIPELINE_STAGES {
        string id PK "UUID"
        string tenant_id FK "References tenants.id (CASCADE)"
        string name "Stage Name (New, Contacted, etc.)"
        int position "Display ordering integer"
        boolean is_won_stage "True for Won stage"
        boolean is_lost_stage "True for Lost stage"
        datetime created_at
        datetime updated_at
    }

    LEADS {
        string id PK "UUID"
        string tenant_id FK "References tenants.id (CASCADE)"
        string stage_id FK "References pipeline_stages.id"
        string assigned_user_id FK "References users.id"
        string company_name "Company name"
        string contact_name "Primary contact name"
        string contact_email "Contact email"
        string contact_phone "Contact phone"
        float budget "Estimated contract value"
        int domain_fit "Rating 1 to 5"
        int requirement_clarity "Rating 1 to 5"
        string lead_source "Inbound, Referral, etc."
        string stage "Stage name string"
        float score "Predicted score 0 to 100"
        text notes "Discovery notes"
        boolean is_archived "Soft-delete flag"
        datetime created_at
        datetime updated_at
    }

    CLIENTS {
        string id PK "UUID"
        string tenant_id FK "References tenants.id (CASCADE)"
        string converted_from_lead_id FK "References leads.id"
        string account_manager_id FK "References users.id"
        string company_name "Client company name"
        string primary_contact "Primary contact person"
        string contact_email "Corporate contact email"
        string contact_phone "Phone number"
        string industry "Industry vertical"
        string address "Headquarters address"
        string churn_risk_level "LOW | MEDIUM | HIGH"
        boolean is_archived "Soft-delete flag"
        datetime created_at
        datetime updated_at
    }

    ACTIVITY_LOGS {
        string id PK "UUID"
        string tenant_id FK "References tenants.id (CASCADE)"
        string user_id FK "References users.id"
        string action "CREATE | UPDATE | DELETE | LOGIN"
        string entity_type "LEAD | CLIENT | USER"
        string entity_id "Target record ID"
        text details "Human-readable description"
        datetime created_at
        datetime updated_at
    }
```

---

## 2. Table Specifications & Constraints

1. **Multi-Tenant Isolation:**
   - Every tenant-owned table (`users`, `leads`, `clients`, `pipeline_stages`, `activity_logs`) has a `tenant_id` foreign key with an `ON DELETE CASCADE` constraint and an explicit B-tree index for query isolation.
2. **Primary Keys:**
   - Universal UUIDv4 strings (36 characters) indexed as primary keys across all tables.
3. **Audit Timestamps:**
   - `created_at` and `updated_at` timestamps stored in UTC (`DateTime(timezone=True)`).
4. **Soft Deletion:**
   - `leads.is_archived` and `clients.is_archived` boolean flags preserve historical reference integrity.
