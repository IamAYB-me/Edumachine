## 1. Architecture Design
```mermaid
graph TD
    subgraph "Frontend Layer"
        UI["React SPA (Vite)"]
        State["Zustand/Context API"]
        Router["React Router DOM"]
    end
    subgraph "Backend Layer (Simulated/Future)"
        API["REST/GraphQL API"]
        Auth["Authentication Service"]
    end
    subgraph "Data Layer"
        DB["PostgreSQL Database"]
    end
    UI --> State
    UI --> Router
    UI --> API
    API --> Auth
    API --> DB
```

## 2. Technology Description
- Frontend: React@18 + tailwindcss@3 + vite
- Routing: react-router-dom@6
- Icons: lucide-react
- Charts: recharts
- Initialization Tool: vite-init (npm create vite@latest)

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | Login / Authentication |
| /super-admin | Super Admin Dashboard |
| /admin | School Admin Dashboard |
| /teacher | Teacher Portal |
| /student | Student Portal |
| /parent | Parent Portal |
| /hr | HR Manager Portal |
| /hostel | Hostel Warden Portal |

## 4. API Definitions (if backend exists)
```typescript
interface User {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'HR' | 'WARDEN';
  email: string;
  avatar?: string;
}

interface KPI {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
}
```

## 5. Server Architecture Diagram (if backend exists)
```mermaid
graph TD
    A["API Controller"] --> B["Service Layer"]
    B --> C["Repository Layer"]
    C --> D["Database"]
```

## 6. Data Model (if applicable)
### 6.1 Data Model Definition
```mermaid
erDiagram
    SCHOOL ||--o{ USER : "has"
    USER ||--o{ ROLE : "assigned"
    SCHOOL ||--o{ CLASS : "contains"
    CLASS ||--o{ STUDENT : "enrolls"
    CLASS ||--o{ TEACHER : "taught by"
```

### 6.2 Data Definition Language
(Not fully applicable yet as we are focusing on the frontend dashboards setup)
