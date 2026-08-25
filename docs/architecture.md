# Architecture

The PUNARVAS system follows a modular architecture designed to separate concerns and allow independent development of the UI, API, AI/ML, and Optimization components.

## High-Level Data Flow

```
Frontend (React + Vite)
       ↓ (REST/JSON over HTTP)
FastAPI REST API (Backend)
       ↓ (SQLAlchemy)
PostgreSQL Database
```

## Backend Internals

The FastAPI backend acts as the central integration layer. It manages data access, handles API requests, and orchestrates the AI and Optimization engines.

```
FastAPI Backend
       ├── AI/ML Risk Engine
       └── Relocation Optimization Engine
```

### Module Separation
To ensure clean integration, the **AI/ML** and **Optimization** modules are developed independently. 
- The **Backend** will interface with these modules by importing their core functions or triggering independent processes.
- The **Frontend** is fully decoupled and only interacts with the Backend via standard REST APIs.
- The **Database** schema is strictly managed by the Backend using SQLAlchemy.
