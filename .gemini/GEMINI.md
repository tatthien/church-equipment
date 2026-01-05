# Church Equipment Management System - Codebase Documentation

## Project Overview
This project is a **Church Equipment Management System** designed to track equipment, brands, and departments. It features a Monorepo structure containing both the Backend API and Frontend Web Application.

## Technology Stack

### Core
- **Runtime**: [Bun](https://bun.sh) (v1.x)
- **Monorepo Manager**: Bun workspaces
- **Language**: TypeScript

### Backend (`packages/api`)
- **Framework**: Express.js
- **Database**: SQLite (via LibSQL)
- **ORM**: Prisma 7
    - **Adapter**: `@prisma/adapter-libsql` (Required for Bun + SQLite compatibility)
- **Authentication**: JWT (JSON Web Tokens)
- **Key Libraries**: `cors`, `dotenv`, `qrcode`
- Always use `bun` apis instead of node when possible

### Frontend (`packages/web`)
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Mantine UI (Core + Hooks + Dates + Notifications)
- **State/Data Fetching**: React Query (`@tanstack/react-query`)
- **HTTP Client**: Axios
- **Icons**: Tabler Icons React

## Architecture

### Directory Structure
```
/packages
  /api          # Backend Express Server
    /prisma     # Database Schema & Migrations
    /src
      /routes   # API Route Handlers
      /middleware # Auth & Error Middleware
      /db       # Prisma Client Singleton
  /web          # Frontend Next.js App
    /src
      /app      # App Router Pages
      /components # Reusable UI Components
      /hooks    # Custom React Query Hooks
      /lib      # API Client & Utilities
```

## Key Features & specialized Implementations

### 1. User Management & RBAC at `packages/api/src/routes`
- **Roles**: `admin`, `user` (Default).
- **Access Control**:
    - **Admin**: Full Access (CRUD on Equipment, Brands, Departments, Users).
    - **User**: Can only View/Edit/Delete equipment they *Created*.
- **Middleware**: `authMiddleware` injects `req.user`.

### 2. Public QR Access
- **Public API**: `GET /api/public/equipment/:id` (No Auth).
- **Frontend Page**: `/public/equipment/[id]` (Visitor View).
- **QR Generation**: Encodes URL `${FRONTEND_URL}/public/equipment/${id}`.

### 3. Database & Prisma
- **Schema**: `packages/api/prisma/schema.prisma`
- **Conventions**:
    - Models: `PascalCase` (e.g., `Equipment`).
    - Tables: `snake_case` mapped via `@@map` (e.g., `equipment`).
    - Fields: `camelCase` mapped via `@map` (e.g., `purchaseDate` -> `purchase_date`).
- **Bun Compatibility**: Uses `PrismaLibSQL` adapter in `src/db/prisma.ts`.

### 4. Frontend Data Fetching
- **Pattern**: Custom Hooks wrapping `useQuery` / `useMutation`.
- **Location**: `packages/web/src/hooks`.
- **Example**: `useGetEquipmentQuery`, `useCreateEquipmentMutation`.
- **API Client**: `packages/web/src/lib/api.ts` handles Axios instance and Interceptors.

## Setup & Development

### Environment Variables
**packages/api/.env**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

**packages/web/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Running the project
1.  **Install Dependencies**: `bun install`
2.  **Database Setup**:
    ```bash
    cd packages/api
    bun run db:generate # Generate Prisma Client
    bun run db:push     # Push schema to SQLite
    ```
3.  **Run Development**:
    ```bash
    bun run dev # Runs both API and Web
    ```

## Development History
- **Migration**: Moved from `better-sqlite3` raw queries to `Prisma ORM` for type safety.
- **Refactor**: Frontend migrated from `useEffect` data fetching to `React Query`.
- **Feature**: Added "Public QR Code" feature allowing unauthenticated equipment lookup.
