# Pet Adoption Management System - Setup & Troubleshooting Documentation

## Project Overview
A full-stack pet adoption platform built with:
- **Frontend**: React + Vite + TypeScript (client/)
- **Backend**: Express.js + TypeScript (server/)
- **Database**: PostgreSQL with Drizzle ORM
- **Monorepo**: Root package.json manages both client and server

## Directory Structure
```
pet-adoption-management-system/
├── client/                 # React Vite frontend app
│   ├── src/
│   │   ├── components/     # React UI components
│   │   ├── contexts/       # AuthContext, ThemeContext
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/api/        # HTTP client & API functions
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── server/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Route handler logic
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Authentication, validation
│   │   ├── validators/     # Zod schemas
│   │   ├── config/         # Database config
│   │   ├── db/             # Drizzle schema
│   │   ├── types/          # TypeScript interfaces
│   │   └── index.ts        # Express app entry point
│   ├── migrate.js          # Database migration script
│   ├── package.json
│   └── tsconfig.json
├── drizzle/                # Database migrations & schema
│   ├── schema.ts           # Database schema definition
│   └── migrations/         # SQL migration files
├── shared/                 # Shared types & utilities
└── package.json            # Root monorepo config
```

## Key Technologies
- **Express.js** - Web framework
- **Drizzle ORM** - Type-safe database layer
- **Zod** - Schema validation
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Axios** - HTTP client (frontend)
- **React Context** - State management (frontend)

## Database Schema
### Users Table
- id (PK), name, email, password (hashed), phone, address
- loginMethod (email|oauth), role (user|admin)
- createdAt, updatedAt, lastSignedIn

### Pets Table
- id (PK), name, species, breed, age (months), gender
- description, imageUrl, status (available|adopted|pending)
- adoptionFee, createdAt, updatedAt

### Adoption Applications Table
- id (PK), userId, petId, status (pending|approved|rejected)
- fullName, email, phone, address, homeType, hasYard
- otherPets, experience, reason, adminNotes
- createdAt, updatedAt

## Critical Fixes Applied

### 1. Server Entry Point (server/src/index.ts)
**Issue**: Was missing Express app setup - contained only old type definitions
**Fix**: Created proper Express app with:
- CORS configuration
- JSON middleware
- Route mounting (`/api/auth`, `/api/pets`, `/api/adoptions`)
- Health check endpoint (`/health`)
- Global error handler
- Server listening on configured PORT

### 2. Database Connection (.env)
**Issue**: `?schema=public` parameter caused PostgreSQL connection errors (error code 42704)
**Fix**: Changed connection string to:
```env
DATABASE_URL="postgresql://postgres:Kross2001@localhost:5432/pet_adoption"
```

### 3. Path Extensions in Imports
**Issue**: TypeScript files importing with `.js` extensions caused module resolution failures
**Fix**: Removed `.js` from all import statements:
```typescript
// Before
import authRoutes from "./routes/auth.routes.js";

// After
import authRoutes from "./routes/auth.routes";
```

### 4. Migration Script Configuration
**Issue**: `migrate.js` used incorrect relative path for migrations folder
**Fix**: Updated migrations folder path:
```javascript
await migrate(db, {
  migrationsFolder: '../drizzle/migrations',
});
```

### 5. Circular Module Dependency (CRITICAL)
**Issue**: `auth.controller.ts` and `auth.ts` imported types from `../index.js` (entry point)
This created circular dependency: index → routes → controllers → index
**Fix**: Changed to import types from `../types` instead:
```typescript
// Before
import { AuthRequest } from "../index.js";

// After
import type { AuthRequest } from "../types";
```

### 6. Server Package Scripts
**Issue**: `npm run db:migrate` command was missing
**Fix**: Added to `server/package.json`:
```json
"scripts": {
  "db:migrate": "node migrate.js"
}
```

### 7. Missing Postgres Package Dependency
**Issue**: `migrate.js` imports `postgres` but package wasn't installed
**Fix**: Added to `server/package.json` dependencies:
```json
"postgres": "^3.4.7"
```

### 8. HTTP Client Error Handling (client/src/lib/api/httpClient.ts)
**Issue**: Minimal error logging made debugging difficult
**Fix**: Enhanced response interceptor:
```typescript
(error: AxiosError) => {
  console.error("API Error:", error.response?.status, error.response?.data || error.message);
  // ... rest of handler
}
```

### 9. Auth API Error Handling (client/src/lib/api/auth.api.ts)
**Issue**: Register function caught errors but logged incorrectly (logged null), swallowed errors
**Fix**: Proper error handling with logging in all auth functions:
- Try-catch blocks that re-throw errors
- Proper console.error statements
- Consistent error propagation to callers

## Setup Instructions

### 1. Install Dependencies
```bash
npm install              # Root
cd client && npm install # Client
cd ../server && npm install # Server
```

### 2. Environment Setup
Copy and configure `.env` file in server/:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pet_adoption"
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Database Setup
```bash
# Ensure PostgreSQL is running and database exists
createdb -U postgres pet_adoption

# Run migrations
npm run db:migrate   # From root or server directory
```

### 4. Start Development
```bash
# From root directory (runs both concurrently)
npm run dev

# Or separately:
npm run dev:server   # Terminal 1 - Backend on :5000
npm run dev:client   # Terminal 2 - Frontend on :5173
```

## Available Scripts

### Root Level
```bash
npm run dev              # Start both client & server concurrently
npm run dev:client      # Start frontend only
npm run dev:server      # Start backend only
npm run build           # Build both projects
npm run build:client    # Build frontend
npm run build:server    # Build backend
npm run db:generate     # Generate Drizzle migrations
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with pet data
npm run db:studio       # Open Drizzle Studio GUI
```

### Server Level
```bash
npm run dev             # Start server with hot-reload
npm run build           # Compile TypeScript to JavaScript
npm run start           # Run compiled JavaScript
npm run db:migrate      # Run migrations
```

## Port Configuration
- **Backend**: 5000 (or PORT env variable)
- **Frontend**: 5173 (Vite default)
- **Database**: 5432 (PostgreSQL default)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)
- `PATCH /api/auth/me` - Update profile (requires JWT)

### Pets
- `GET /api/pets` - List all pets with pagination/filters
- `POST /api/pets` - Create pet (admin only)
- `GET /api/pets/:id` - Get pet details
- `PATCH /api/pets/:id` - Update pet (admin only)
- `PATCH /api/pets/:id/status` - Change pet status (admin only)
- `DELETE /api/pets/:id` - Delete pet (admin only)

### Adoption Applications
- `POST /api/adoptions` - Submit application (authenticated users)
- `GET /api/adoptions/my` - Get user's applications (authenticated)
- `GET /api/adoptions/:id` - Get application details (authenticated)
- `DELETE /api/adoptions/:id/withdraw` - Withdraw application (authenticated)
- `GET /api/adoptions` - List all applications (admin only)
- `PATCH /api/adoptions/:id/review` - Review application (admin only)

## Authentication Flow
1. User registers with email/password
2. Server hashes password with bcryptjs (12 rounds)
3. JWT token created with userId + role
4. Token stored in localStorage (`pat_token`)
5. All subsequent requests include `Authorization: Bearer <token>` header
6. Middleware verifies token and fetches fresh user from DB
7. On 401 error, client automatically clears token and redirects to login

## Type System
- Shared types in `client/src/types/index.ts`
- Server types in `server/src/types/index.ts`
- Zod schemas in `server/src/validators/schemas.ts` generate TypeScript types automatically
- Database types generated from Drizzle schema

## Common Issues & Solutions

### Issue: "Port 5000 already in use"
**Solution**: Check for lingering Node processes or use PORT env variable
```bash
PORT=5001 npm run dev:server
```

### Issue: Database connection refused
**Solution**: 
- Ensure PostgreSQL service is running
- Verify DATABASE_URL in .env is correct
- Create database: `createdb -U postgres pet_adoption`

### Issue: 500 errors on API calls
**Solution**: Check server console for detailed error messages

### Issue: "Cannot find module 'postgres'"
**Solution**: Run `npm install` in server directory

### Issue: CORS errors
**Solution**: Update ALLOWED_ORIGINS in `.env` or CORS configuration in `server/src/index.ts`

## Validation Rules
### Register
- name: 2-100 chars
- email: valid email format
- password: 8-72 chars, min 1 uppercase, min 1 digit
- phone: optional, max 20 chars
- address: optional, max 500 chars

### Login
- email: required, valid format
- password: required

### Create Adoption Application
- petId: required, positive integer
- fullName: 2-255 chars
- email: valid email format
- phone: 7-20 chars
- address: 5-500 chars
- reason: 20-2000 chars (why adopting)
- others: optional

## Client Authentication Context
Located: `client/src/contexts/AuthContext.tsx`
- Manages user login state
- Persists token/user to localStorage
- Provides `useAuthContext()` hook for components
- Includes refresh user method for profile updates

## Debugging Tips
1. Check browser console for client-side errors
2. Check server console (npm run dev:server) for backend errors
3. Enable network tab in browser DevTools to inspect API requests
4. Use `console.error()` logs already added to API functions
5. Database errors will appear in server console during operations

## Important Files to Remember
- Entry point: `server/src/index.ts`
- Auth logic: `server/src/controllers/auth.controller.ts`
- Auth routes: `server/src/routes/auth.routes.ts`
- Auth middleware: `server/src/middleware/auth.ts`
- DB schema: `drizzle/schema.ts`
- HTTP client: `client/src/lib/api/httpClient.ts`
- Auth API: `client/src/lib/api/auth.api.ts`
- Auth Context: `client/src/contexts/AuthContext.tsx`

## Testing Register Flow
```bash
# With curl (from root directory)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "1234567890",
    "address": "123 Main St"
  }'
```

## Next Steps
1. Ensure all services are running (PostgreSQL)
2. Run migrations: `npm run db:migrate`
3. Start dev environment: `npm run dev`
4. Test register endpoint
5. Monitor console for any errors
6. Implement remaining features as needed

---
Last Updated: April 12, 2026
