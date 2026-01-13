# Church Equipment Management System

## Project Overview
This project is a **Church Equipment Management System** designed to track equipment, brands, and departments. It features a Monorepo structure containing both the Backend API and Frontend Web Application.

## Technology Stack

### Core
- **Runtime**: [Bun](https://bun.sh) (v1.x)
- **Monorepo Manager**: Bun workspaces
- **Language**: TypeScript

### Backend (`packages/api`)
- **Framework**: Express.js
- **Database**: PostgreSQL 
- **ORM**: Prisma 7
    - **Adapter**: `@prisma/adapter-pg` (Required for Bun + PostgreSQL compatibility)
- **Authentication**: JWT (JSON Web Tokens)
- **Key Libraries**: `cors`, `dotenv`, `qrcode`
- Always use `bun` apis instead of node when possible

### Frontend (`packages/web`)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Mantine UI 8 (Core + Hooks + Dates + Notifications)
- **State/Data Fetching**: React Query (`@tanstack/react-query`)
- **HTTP Client**: Axios
- **Icons**: Tabler Icons React