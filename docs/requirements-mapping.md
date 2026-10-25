# Requirements-to-Feature Mapping: IntelliCRM AI

This document maps all IEEE-style requirements from the IntelliCRM AI SRS (`kelashFYP-SRS.docx`) to the technical modules and database entities.

| Req ID | SRS Description | Technical Module | Database Entities | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-4.1.1–8** | Tenant sign up, workspace registration, salted hash, verification | `auth` | `tenants`, `users`, `pipeline_stages` | High |
| **REQ-4.2.1–7** | Login, JWT issue, 5-attempt lockout (15m), password reset | `auth` | `users` | High |
| **REQ-4.3.1–5** | RBAC (Admin, Sales Agent, Account Manager), user management | `users` | `users` | High |
| **REQ-4.4.1–7** | Lead CRUD, source, budget, delay, stage, assignment, CSV import | `leads` | `leads` | High |
| **REQ-4.5.1–6** | Drag-and-drop Kanban board, stage value totals, update rollback | `pipeline` | `pipeline_stages`, `leads` | High |
| **REQ-4.6.1–7** | Predictive lead scoring (0-100%), Hot/Warm/Cold, factor breakdown | `ai/scoring` | `lead_scores`, `leads` | High |
| **REQ-4.7.1–5** | Convert lead to client, 360° client profile, churn risk badge | `clients` | `clients`, `leads` | High |
| **REQ-4.8.1–5** | Project management, milestones, tasks (TODO/IN_PROGRESS/DONE) | `projects` | `projects`, `milestones`, `tasks` | High |
| **REQ-4.9.1–5** | Communication logging (email, chat, call), chronological timeline | `communications` | `communications` | High |
| **REQ-4.10.1–5**| Sentiment classification (Positive/Neutral/Negative), urgency flag | `ai/sentiment` | `sentiment_results` | High |
| **REQ-4.11.1–5**| Churn risk indicators, automated manager alerts, resolution notes | `churn` | `churn_alerts`, `clients` | High |
| **REQ-4.12.1–6**| Meeting summarization, key requirements, action items | `ai/meetings` | `meetings`, `meeting_summaries` | High |
| **REQ-4.13.1–5**| Contextual email drafting from meeting notes, tone selection | `ai/drafts` | `email_drafts`, `meetings` | High |
| **REQ-4.14.1–5**| Real-time analytics dashboard, pipeline value, win rate charts | `reports` | Aggregated views | High |
| **REQ-4.15.1–6**| Multi-item invoice generation, subtotal/tax calculation, PDF export | `invoices` | `invoices`, `invoice_items`, `payments` | High |
| **REQ-4.16.1–4**| In-app notification center, unread counter, event triggers | `notifications` | `notifications` | Medium |
