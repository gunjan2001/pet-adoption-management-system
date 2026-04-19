# Pet Adoption Management System - Complete Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Features & Functionality](#features--functionality)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Critical Fixes & Troubleshooting](#critical-fixes--troubleshooting)
- [Key Implementation Details](#key-implementation-details)
- [Migration History](#migration-history)
- [Production Checklist](#production-checklist)
- [Future Enhancements](#future-enhancements)
- [Team & Contact](#team--contact)
- [License](#license)
- [Changelog](#changelog)

---

## Project Overview

A full-stack pet adoption platform that connects pets with their forever homes. Users can browse available pets, submit adoption applications, and track their status. Admins manage pet listings and review applications through a dedicated dashboard.

**Key Highlights:**
- Modern, warm amber/terracotta design aesthetic
- Real-time application tracking
- Role-based access control (User/Admin)
- Responsive mobile-first design
- Production-grade error handling
- Server-side filtering and pagination
- JWT-based authentication
- No-flicker loading states

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** React Hooks + Context API
- **Forms:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS v4 (pure utility classes, no UI library)
- **Build Tool:** Vite
- **HTTP Client:** Axios with JWT interceptors
- **Notifications:** Sonner (toast notifications)
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **UI Components:** Custom components with Radix UI primitives

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod schemas
- **Password Hashing:** bcryptjs
- **Development:** tsx (TypeScript execution)
- **CORS:** Cross-origin resource sharing

### Development Tools
- **Package Manager:** pnpm
- **TypeScript:** tsx for server development
- **Database Migrations:** Drizzle Kit
- **Code Quality:** Prettier
- **Monorepo:** Individual package.json files for client/server

---

## Project Structure

```
pet-adoption-management-system/
├── client/                                    # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx                 # Main + Admin nav with mobile support
│   │   │   ├── LoginForm.tsx                  # Login form component
│   │   │   ├── RegisterForm.tsx               # Registration form component
│   │   │   ├── AIChatBox.tsx                  # AI chat component
│   │   │   ├── ErrorBoundary.tsx              # Error boundary component
│   │   │   └── ui/                            # Reusable UI components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx                # Authentication context & provider
│   │   │   └── ThemeContext.tsx               # Theme context (future use)
│   │   ├── hooks/
│   │   │   ├── usePets.ts                     # Pet data fetching with server-side filters
│   │   │   ├── useAdoptions.ts                # Adoption application hooks
│   │   │   ├── useMobile.tsx                  # Mobile detection hook
│   │   │   └── useComposition.ts              # Composition utilities
│   │   ├── lib/
│   │   │   ├── httpClient.ts                  # Axios instance with JWT interceptor
│   │   │   ├── api/
│   │   │   │   ├── auth.api.ts                # Auth service layer
│   │   │   │   ├── pets.api.ts                # Pet CRUD operations
│   │   │   │   └── adoptions.api.ts           # Adoption API calls
│   │   │   ├── utils.ts                       # cn() helper for Tailwind
│   │   │   └── errorHandler.ts                # Error message extraction
│   │   ├── pages/
│   │   │   ├── Home.tsx                       # Landing page (6 sections)
│   │   │   ├── PetListing.tsx                 # Browse pets with advanced filters
│   │   │   ├── PetDetail.tsx                  # Pet details + application form
│   │   │   ├── UserDashboard.tsx              # User's applications
│   │   │   ├── AdminDashboard.tsx             # Admin overview with stats
│   │   │   ├── AdminManagePets.tsx            # Pet CRUD with slide-in panel
│   │   │   ├── AdminApplications.tsx          # Review applications
│   │   │   ├── ComponentShowcase.tsx          # UI component showcase
│   │   │   ├── Login.tsx                      # Login page
│   │   │   ├── Register.tsx                   # Registration page
│   │   │   └── NotFound.tsx                   # 404 page
│   │   ├── types/
│   │   │   └── index.ts                       # TypeScript interfaces
│   │   ├── _core/
│   │   │   ├── hooks/                         # Core hooks
│   │   │   └── errors.ts                      # Error definitions
│   │   ├── const.ts                           # Constants
│   │   ├── main.tsx                           # App entry point
│   │   └── App.tsx                            # Root component with routing
│   ├── vite.config.ts                         # Vite config with proxy
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── package.json
├── server/                                    # Express REST backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts             # Auth endpoints
│   │   │   ├── pet.controller.ts              # Pet CRUD endpoints
│   │   │   ├── adoption.controller.ts         # Adoption endpoints
│   │   │   └── index.ts                       # Express app setup
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── pet.routes.ts
│   │   │   └── adoption.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts                        # authenticate + authorize
│   │   │   └── validate.ts                    # Zod validation middleware
│   │   ├── validators/
│   │   │   └── schemas.ts                     # All Zod schemas
│   │   ├── config/
│   │   │   └── db.ts                          # Drizzle + pg.Pool setup
│   │   ├── db/
│   │   │   └── schema.ts                      # Database schema (users, pets, applications)
│   │   ├── types/
│   │   │   └── index.ts                       # AuthRequest, JwtPayload, etc.
│   │   └── index.ts                           # Express app entry
│   ├── seed-pets.js                           # Sample data seeder
│   ├── migrate.js                             # Migration runner
│   ├── API_REFERENCE.md                        # API documentation
│   ├── package.json
│   └── tsconfig.json
├── drizzle/
│   ├── schema.ts                               # Database schema definition
│   └── migrations/                             # Generated SQL migrations
├── shared/
│   ├── const.ts                                # Shared constants
│   └── types.ts                                # Shared type definitions
├── drizzle.config.ts                          # Drizzle Kit configuration
├── REFACTORING_PLAN.md                        # Frontend refactoring documentation
├── SETUP_DOCUMENTATION.md                     # Setup and troubleshooting guide
├── README.md                                  # Project README
├── .gitignore
├── .prettierrc
├── .prettierignore
├── pnpm-lock.yaml
└── tsconfig.json                              # Root TypeScript config
```

---

## Project Overview

A full-stack pet adoption platform that connects pets with their forever homes. Users can browse available pets, submit adoption applications, and track their status. Admins manage pet listings and review applications through a dedicated dashboard.

**Key Highlights:**
- Modern, warm amber/terracotta design aesthetic
- Real-time application tracking
- Role-based access control (User/Admin)
- Responsive mobile-first design
- Production-grade error handling

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** React Hooks + Context API
- **Forms:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS (pure utility classes, no UI library)
- **Build Tool:** Vite
- **HTTP Client:** Axios with JWT interceptors
- **Notifications:** Sonner (toast notifications)
- **Date Handling:** date-fns

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod schemas
- **Password Hashing:** bcrypt

### Development Tools
- **Package Manager:** npm
- **TypeScript:** tsx for server development
- **Database Migrations:** Drizzle Kit
- **Monorepo:** Root orchestrator with concurrently

---

## Project Structure

```
pet-adoption-management-system/
├── client/                                    # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx                 # Main + Admin nav with mobile support
│   │   │   ├── LoginForm.tsx                  # Login form component
│   │   │   └── RegisterForm.tsx               # Registration form component
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx                # Authentication context & provider
│   │   │   └── ThemeContext.tsx               # Theme context (if needed)
│   │   ├── hooks/
│   │   │   ├── usePets.ts                     # Pet data fetching (isLoading vs isFetching)
│   │   │   └── useAdoptions.ts                # Adoption application hooks
│   │   ├── lib/
│   │   │   ├── httpClient.ts                  # Axios instance with JWT interceptor
│   │   │   ├── api/
│   │   │   │   ├── auth.api.ts                # Auth service layer
│   │   │   │   ├── pets.api.ts                # Pet CRUD operations
│   │   │   │   └── adoptions.api.ts           # Adoption API calls
│   │   │   ├── utils.ts                       # cn() helper for Tailwind
│   │   │   └── errorHandler.ts                # Error message extraction
│   │   ├── pages/
│   │   │   ├── Home.tsx                       # Landing page (6 sections)
│   │   │   ├── PetListing.tsx                 # Browse pets with filters
│   │   │   ├── PetDetail.tsx                  # Pet details + application form
│   │   │   ├── UserDashboard.tsx              # User's applications
│   │   │   ├── AdminDashboard.tsx             # Admin overview with stats
│   │   │   ├── AdminManagePets.tsx            # Pet CRUD with slide-in panel
│   │   │   └── AdminApplications.tsx          # Review applications
│   │   ├── types/
│   │   │   └── index.ts                       # TypeScript interfaces
│   │   ├── main.tsx                           # App entry point
│   │   └── App.tsx                            # Root component with routing
│   ├── vite.config.ts                         # Vite config with proxy
│   ├── tsconfig.json
│   └── package.json
├── server/                                    # Express REST backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts             # Auth endpoints
│   │   │   ├── pet.controller.ts              # Pet CRUD endpoints
│   │   │   └── adoption.controller.ts         # Adoption endpoints
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── pet.routes.ts
│   │   │   └── adoption.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts                        # authenticate + authorize
│   │   │   └── validate.ts                    # Zod validation middleware
│   │   ├── validators/
│   │   │   └── schemas.ts                     # All Zod schemas
│   │   ├── config/
│   │   │   └── db.ts                          # Drizzle + pg.Pool setup
│   │   ├── db/
│   │   │   └── schema.ts                      # Database schema (users, pets, applications)
│   │   ├── types/
│   │   │   └── index.ts                       # AuthRequest, JwtPayload, etc.
│   │   └── index.ts                           # Express app entry
│   ├── seed-pets.js                           # Sample data seeder
│   ├── migrate.js                             # Migration runner
│   ├── package.json
│   └── .env                                   # DATABASE_URL, JWT_SECRET, PORT
├── drizzle/
│   └── migrations/                            # Generated SQL migrations
├── drizzle.config.ts                          # Drizzle Kit configuration
├── package.json                               # Root orchestrator
└── .gitignore
```

---

## Design System

### Color Palette (Warm Amber Theme)
The entire application uses a cohesive warm, organic aesthetic that feels natural and trustworthy for a pet adoption platform.

#### Primary Colors
- **Amber 500:** `#F59E0B` - Primary actions, CTAs, active states
- **Amber 600:** `#D97706` - Hover states
- **Amber 50:** `#FFFBEB` - Light backgrounds, subtle highlights

#### Status Colors
- **Green 500:** `#22C55E` - Available pets, approved applications
- **Yellow/Amber 500:** `#F59E0B` - Pending status
- **Gray 400:** `#9CA3AF` - Adopted pets, neutral states
- **Red 500:** `#EF4444` - Rejected applications, destructive actions

#### Neutral Palette
- **Gray 900:** `#111827` - Primary text, headings
- **Gray 600:** `#4B5563` - Body text
- **Gray 400:** `#9CA3AF` - Muted text
- **White:** `#FFFFFF` - Card backgrounds
- **Gray 50:** `#F9FAFB` - Page backgrounds

### Typography
- **Headings:** `font-black` (900 weight) for maximum impact
- **Subheadings:** `font-bold` (700 weight)
- **Body:** `font-medium` (500) or `font-normal` (400)
- **Labels:** `text-xs font-semibold uppercase tracking-widest` for section headers

### Component Patterns

#### Buttons
```tsx
// Primary CTA
className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all"

// Secondary
className="px-7 py-3.5 rounded-2xl border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold transition-all"

// Outline
className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:text-amber-600"
```

#### Cards
```tsx
// Standard card
className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"

// Card with image
className="bg-white rounded-2xl overflow-hidden border border-gray-100"
```

#### Forms
```tsx
// Input field
className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"

// Error state
className="border-red-300 focus:ring-red-400"
```

#### Status Badges
```tsx
// Available
className="bg-green-100 text-green-800"

// Pending
className="bg-amber-100 text-amber-800"

// Adopted/Rejected
className="bg-gray-100 text-gray-600"
```

### Layout Principles
1. **Generous spacing:** Large padding/margins for breathing room
2. **Rounded corners:** `rounded-2xl` (16px) for major elements, `rounded-xl` (12px) for smaller
3. **Shadows:** Subtle `shadow-sm` by default, `shadow-lg` for elevation
4. **Gradients:** `from-amber-50/60 to-white` for page backgrounds
5. **Responsive:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints

---

## Features & Functionality

### Public Features (No Auth Required)
✅ **Browse Available Pets**
- Grid view with filters (species, breed, age, status, search)
- Expandable filter panel with active count badge
- Pagination with ellipsis pattern
- Pet cards with image, status badge, key details
- No-flicker loading (old cards stay visible during refetch)

✅ **View Pet Details**
- Full pet profile with large image
- Stat cards (age, gender, species, adoption fee)
- Description in amber-tinted box
- Status-aware CTA (Apply/Login/Not Available)

✅ **User Registration & Login**
- Form validation with inline errors
- JWT-based authentication
- Persistent session (localStorage)

### User Features (Authenticated Users)
✅ **Submit Adoption Applications**
- Multi-step form with validation
- Pre-filled from user profile
- Required fields: name, email, phone, address, reason
- Optional: home type, yard, other pets, experience
- Success state with confirmation banner
- Redirect to dashboard after submission

✅ **Application Dashboard**
- View all submitted applications
- Status pills with icons (Pending/Approved/Rejected)
- Coloured top stripe for quick status scanning
- Stat pills showing counts by status
- Application details: pet info, submission date, home details
- View admin notes on reviewed applications
- Withdraw pending applications with confirmation

✅ **Profile Management**
- User info displayed in navigation
- Logout functionality

### Admin Features (Admin Role Only)
✅ **Admin Dashboard (Overview)**
- Stat cards: Total pets, Available, Pending, Adopted, Total Apps, Pending Review
- Quick-action cards linking to Pets and Applications
- Recent applications list with applicant→pet flow
- Admin-specific navigation with mobile menu

✅ **Manage Pets**
- Full CRUD operations (Create, Read, Update, Delete)
- Slide-in panel for add/edit forms (no modal)
- Image URL preview
- Search pets by name/species
- Delete with confirmation dialog
- Status management (Available/Pending/Adopted)

✅ **Review Applications**
- View all applications with filters (All/Pending/Approved/Rejected)
- Pagination (10 per page)
- Detailed application cards with applicant info
- Review modal with approve/reject toggle
- Add admin notes for applicant
- Visual feedback with status-coloured tinted boxes

✅ **Admin Navigation**
- Distinct dark navigation bar
- Mobile hamburger menu with dropdown
- User avatar with role indicator
- Logout from dropdown

### System Features
✅ **Role-Based Access Control**
- Public routes: Home, Browse Pets, Pet Details, Login, Register
- User routes: Dashboard
- Admin routes: Admin Dashboard, Manage Pets, Applications
- Route guards with automatic redirects

✅ **Error Handling**
- API error extraction and display
- Form validation errors inline
- Toast notifications for actions
- Retry mechanisms for failed requests
- 401 auto-redirect to login

✅ **Responsive Design**
- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Collapsible mobile menus
- Responsive grids (1→2→3→4 columns)
- Mobile filters toggle

---

## API Reference

All endpoints return:
```json
{
  "success": true,
  "message": "...",
  "data": {...},
  "pagination": {...}  // for list endpoints
}
```

Error responses:
```json
{
  "success": false,
  "message": "...",
  "errors": [{"field": "...", "message": "..."}]
}
```

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.
```typescript
Body: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}
Response: {
  success: true;
  data: { token: string; user: User };
}
```

#### POST `/api/auth/login`
Login existing user.
```typescript
Body: { email: string; password: string; }
Response: {
  success: true;
  data: { token: string; user: User };
}
```

#### GET `/api/auth/me`
Get current user profile. **Auth required.**
```typescript
Response: {
  success: true;
  data: User;
}
```

#### PATCH `/api/auth/me`
Update user profile. **Auth required.**
```typescript
Body: {
  name?: string;
  phone?: string;
  address?: string;
}
Response: {
  success: true;
  data: User;
}
```

### Pet Endpoints

#### GET `/api/pets`
List pets with optional filters. **Public.**
```typescript
Query: {
  page?: number;      // default: 1
  limit?: number;     // default: 12
  status?: "available" | "pending" | "adopted";
  species?: string;
  gender?: "male" | "female" | "unknown";
  search?: string;    // search by pet name
  breed?: string;     // filter by breed
  minAge?: number;    // minimum age in months
  maxAge?: number;    // maximum age in months
}
Response: {
  success: true;
  data: Pet[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### GET `/api/pets/:id`
Get single pet by ID. **Public.**
```typescript
Response: {
  success: true;
  data: Pet;
}
```

#### POST `/api/pets`
Create a new pet. **Admin only.**
```typescript
Body: {
  name: string;
  species: string;
  breed?: string;
  age?: number;       // in months
  gender?: "male" | "female" | "unknown";
  description?: string;
  imageUrl?: string;
  status?: "available" | "pending" | "adopted";
  adoptionFee?: number;
}
Response: {
  success: true;
  data: Pet;
}
```

#### PATCH `/api/pets/:id`
Update a pet. **Admin only.**
```typescript
Body: Partial<CreatePetInput>
Response: {
  success: true;
  data: Pet;
}
```

#### PATCH `/api/pets/:id/status`
Update pet status only. **Admin only.**
```typescript
Body: {
  status: "available" | "pending" | "adopted";
}
Response: {
  success: true;
  data: Pet;
}
```

#### DELETE `/api/pets/:id`
Delete a pet. **Admin only.**
```typescript
Response: {
  success: true;
  message: "Pet deleted successfully";
}
```

### Adoption Application Endpoints

#### POST `/api/adoptions`
Submit adoption application. **Auth required (user role).**
```typescript
Body: {
  petId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  homeType?: "house" | "apartment" | "condo" | "townhouse" | "other";
  hasYard?: boolean;
  otherPets?: string;
  experience?: string;
  reason: string;   // min 20 chars
}
Response: {
  success: true;
  data: ApplicationWithPet;
}
```

#### GET `/api/adoptions/my`
Get current user's applications. **Auth required.**
```typescript
Response: {
  success: true;
  data: ApplicationWithPet[];
}
```

#### GET `/api/adoptions/:id`
Get single application. **Auth required (owner or admin).**
```typescript
Response: {
  success: true;
  data: ApplicationWithPetAndApplicant;
}
```

#### DELETE `/api/adoptions/:id/withdraw`
Withdraw pending application. **Auth required (owner only).**
```typescript
Response: {
  success: true;
  message: "Application withdrawn";
}
```

#### GET `/api/adoptions`
Get all applications with pagination. **Admin only.**
```typescript
Query: {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
}
Response: {
  success: true;
  data: ApplicationWithPetAndApplicant[];
  pagination: PaginationMeta;
}
```

#### PATCH `/api/adoptions/:id/review`
Approve or reject application. **Admin only.**
```typescript
Body: {
  status: "approved" | "rejected";
  adminNotes?: string;
}
Response: {
  success: true;
  data: ApplicationWithPetAndApplicant;
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  loginMethod VARCHAR(64),
  role role DEFAULT 'user' NOT NULL,  -- 'user' | 'admin'
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Pets Table
```sql
CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(255),
  age INTEGER,  -- in months
  gender gender DEFAULT 'unknown',  -- 'male' | 'female' | 'unknown'
  description TEXT,
  imageUrl VARCHAR(500),
  pet_status pet_status DEFAULT 'available' NOT NULL,  -- 'available' | 'pending' | 'adopted'
  adoptionFee NUMERIC(10, 2),
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Adoption Applications Table
```sql
CREATE TABLE adoption_applications (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  petId INTEGER NOT NULL REFERENCES pets(id),
  adoption_status adoption_status DEFAULT 'pending' NOT NULL,  -- 'pending' | 'approved' | 'rejected'
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  homeType VARCHAR(100),  -- 'house' | 'apartment' | 'condo' | 'townhouse' | 'other'
  hasYard BOOLEAN DEFAULT FALSE,
  otherPets TEXT,
  experience TEXT,
  reason TEXT,
  adminNotes TEXT,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Enums
```sql
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE pet_status AS ENUM ('available', 'adopted', 'pending');
CREATE TYPE adoption_status AS ENUM ('pending', 'approved', 'rejected');
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Environment Variables

**Server (.env in `/server`):**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pet_adoption
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Client (.env in `/client`):**
```env
# Leave commented to use Vite proxy
# VITE_API_URL=http://localhost:5000/api
```

### Installation Steps

1. **Clone and Install**
```bash
git clone <repository>
cd pet-adoption-management-system

# Install client dependencies
cd client && pnpm install && cd ..

# Install server dependencies
cd server && pnpm install && cd ..
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb -U postgres pet_adoption

# Run migrations
cd server && pnpm run db:migrate

# Seed sample pets (optional)
cd server && node seed-pets.js
```

3. **Start Development**
```bash
# Start backend (from server directory)
cd server && pnpm run dev

# Start frontend (from client directory, in new terminal)
cd client && pnpm run dev
```

4. **Access Application**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Vite proxy forwards `/api/*` to backend automatically

### Scripts Reference

**Client package.json:**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit"
}
```

**Server package.json:**
```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:migrate": "node migrate.js",
  "db:seed": "node seed-pets.js"
}
```

### Port Configuration
- **Backend**: 5000 (or PORT env variable)
- **Frontend**: 5173 (Vite default)
- **Database**: 5432 (PostgreSQL default)

---

## Critical Fixes & Troubleshooting

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

### Common Issues & Solutions

#### Issue: "Port 5000 already in use"
**Solution**: Check for lingering Node processes or use PORT env variable
```bash
PORT=5001 pnpm run dev
```

#### Issue: Database connection refused
**Solution**:
- Ensure PostgreSQL service is running
- Verify DATABASE_URL in .env is correct
- Create database: `createdb -U postgres pet_adoption`

#### Issue: 500 errors on API calls
**Solution**: Check server console for detailed error messages

#### Issue: "Cannot find module 'postgres'"
**Solution**: Run `pnpm install` in server directory

#### Issue: CORS errors
**Solution**: Update ALLOWED_ORIGINS in `.env` or CORS configuration in `server/src/index.ts`

### Validation Rules
#### Register
- name: 2-100 chars
- email: valid email format
- password: 8-72 chars, min 1 uppercase, min 1 digit
- phone: optional, max 20 chars
- address: optional, max 500 chars

#### Login
- email: required, valid format
- password: required

#### Create Adoption Application
- petId: required, positive integer
- fullName: 2-255 chars
- email: valid email format
- phone: 7-20 chars
- address: 5-500 chars
- reason: 20-2000 chars (why adopting)
- others: optional

### Client Authentication Context
Located: `client/src/contexts/AuthContext.tsx`
- Manages user login state
- Persists token/user to localStorage
- Provides `useAuthContext()` hook for components
- Includes refresh user method for profile updates

### Debugging Tips
1. Check browser console for client-side errors
2. Check server console (pnpm run dev) for backend errors
3. Enable network tab in browser DevTools to inspect API requests
4. Use `console.error()` logs already added to API functions
5. Database errors will appear in server console during operations

### Important Files to Remember
- Entry point: `server/src/index.ts`
- Auth logic: `server/src/controllers/auth.controller.ts`
- Auth routes: `server/src/routes/auth.routes.ts`
- Auth middleware: `server/src/middleware/auth.ts`
- DB schema: `drizzle/schema.ts`
- HTTP client: `client/src/lib/api/httpClient.ts`
- Auth API: `client/src/lib/api/auth.api.ts`
- Auth Context: `client/src/contexts/AuthContext.tsx`

### Testing Register Flow
```bash
# With curl (from server directory)
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

---

## Key Implementation Details

### Authentication Flow

1. **Registration/Login:**
   - User submits credentials
   - Backend validates, hashes password (bcrypt), creates JWT
   - Token returned to frontend
   - Token stored in `localStorage`

2. **Authenticated Requests:**
   - Axios interceptor adds `Authorization: Bearer <token>` header
   - Backend `authenticate` middleware verifies token
   - User object attached to `req.user`

3. **Role-Based Authorization:**
   - `authorize(role)` factory middleware checks `req.user.role`
   - Routes protected with `authenticate` + `authorize('admin')`

4. **Token Expiry:**
   - JWT expires in 7 days
   - 401 response auto-redirects to `/login` (Axios interceptor)

### Hooks Architecture

#### `usePets` - Pet Fetching with Server-Side Filters
```typescript
// Returns: { pets, totalPages, isLoading, isFetching, error, refetch }
// Accepts: { limit?, page?, search?, species?, breed?, status?, minAge?, maxAge? }
// All filters are sent to backend API for server-side processing
```

**Server-Side Filtering Benefits:**
- No client-side data limitations
- Efficient database queries with proper indexing
- Consistent pagination across all filter combinations
- Better performance for large datasets

#### `useAllApplications` - Admin Applications
```typescript
// Returns: { applications, total, totalPages, isLoading, error, refetch }
// Accepts: { status?, page?, limit? }
// Uses adoptionsApi.getAll() → GET /api/adoptions
```

#### `useMyApplications` - User's Applications
```typescript
// Returns: { applications, isLoading, error, refetch }
// Uses adoptionsApi.getMine() → GET /api/adoptions/my
```

### Validation Strategy

**Frontend:** React Hook Form + Zod
```typescript
const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  reason: z.string().min(20, "Min 20 characters"),
});
```

**Backend:** Zod schemas + middleware
```typescript
// validateBody(schema) middleware parses and validates req.body
router.post("/", authenticate, validateBody(createPetSchema), createPet);
```

**Double validation** prevents malicious requests and provides better UX (instant feedback on frontend, security on backend).

### Error Handling

**HTTP Client (Axios):**
```typescript
// 401 → Auto-redirect to /login and clear auth
// Other errors → Extract message from { success, message } or { errors }
```

**Components:**
```typescript
try {
  await api.call();
  toast.success("Action completed");
} catch (err) {
  toast.error(getErrorMessage(err)); // Extracts from response.data.message
}
```

**Backend:**
```typescript
try {
  // ... operation
  res.status(200).json({ success: true, data });
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
}
```

### File Upload Strategy

**Current:** Image URLs only (user provides URL string)
**Reason:** Simplicity, no file storage setup needed
**Future:** Could integrate Cloudinary/S3 for actual file uploads

### CORS Configuration

```typescript
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
```

Development proxy (Vite) handles `/api` forwarding, so frontend makes same-origin requests.

---

## Migration History

### tRPC → REST API Migration

**Why Migrate?**
1. REST is more universal and easier to integrate with external tools
2. Better separation of concerns (routes, controllers, middleware)
3. Explicit validation layers
4. Standard HTTP semantics

**What Changed:**

| Layer | Before (tRPC) | After (REST) |
|---|---|---|
| **Frontend Hooks** | `trpc.pets.list.useQuery()` | `usePets()` hook calling `petsApi.getAll()` |
| **API Layer** | tRPC client procedures | Axios service files in `lib/api/` |
| **Backend Routes** | tRPC routers with `.query/.mutation` | Express routes with controllers |
| **Validation** | Zod schemas in tRPC router | Zod middleware on Express routes |
| **Auth** | tRPC context with `ctx.user` | Express middleware with `req.user` |

**Migration Steps Completed:**
1. ✅ Created Express REST endpoints (auth, pets, adoptions)
2. ✅ Added middleware layer (authenticate, authorize, validate)
3. ✅ Built Axios service layer (`auth.api`, `pets.api`, `adoptions.api`)
4. ✅ Created React hooks wrapping service calls (`usePets`, `useAdoptions`)
5. ✅ Migrated all pages to use new hooks (no tRPC imports)
6. ✅ Removed tRPC dependencies

**Critical Fixes During Migration:**
- Removed `.js` extensions from TypeScript imports (tsx in CJS mode)
- Renamed `api.ts` → `httpClient.ts` (conflict with `api/` folder)
- Fixed `DATABASE_URL` schema parameter (removed `?schema=public`)
- Added types file to break circular dependencies
- Created missing middleware files

### UI Component Library → Pure Tailwind

**Why Remove shadcn/ui?**
1. More control over exact styling and behavior
2. Smaller bundle size (no component library overhead)
3. Consistent design language across all pages
4. Easier customization without fighting component defaults

**What Changed:**
- Removed: `Button`, `Input`, `Card`, `Badge`, `Skeleton`, `Select`, etc.
- Replaced with: Pure Tailwind utility classes
- Pattern: Created reusable class strings for consistency

**Example:**
```typescript
// Before
<Button variant="outline" size="lg">Click</Button>

// After
<button className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">Click</button>
```

### Design Evolution

**Phase 1:** Generic component library aesthetics
**Phase 2:** Custom amber/warm theme applied to all pages
**Final Result:** Cohesive, organic, pet-friendly design throughout

Key design decisions:
- Warm amber primary color (pet-friendly, trustworthy)
- Generous spacing and large touch targets
- Rounded corners everywhere (`rounded-2xl`)
- Subtle shadows and smooth transitions
- Mobile-first responsive approach
- Status colors that match (green/amber/gray)

### Client-Side → Server-Side Filtering Migration

**Why Migrate to Server-Side Filtering?**
1. **Performance:** No client-side data limitations for large datasets
2. **Scalability:** Database handles filtering efficiently with proper indexing
3. **Consistency:** Same filtering logic across all users and sessions
4. **Real-time:** Filters work immediately without loading all data first
5. **Accuracy:** Server-side pagination ensures consistent results

**What Changed:**

| Aspect | Before (Client-Side) | After (Server-Side) |
|---|---|---|
| **Data Fetching** | Fetch all pets, filter in memory | Send filters to API, get filtered results |
| **Pagination** | Client-side slice after filtering | Server-side LIMIT/OFFSET with filtered count |
| **Filter Options** | Limited by loaded data | All database records searchable |
| **Performance** | Slow with large datasets | Fast database queries |
| **State Management** | Complex client state | Simple server requests |

**Implementation Details:**
1. ✅ Updated backend `paginationSchema` to include all filter parameters
2. ✅ Modified `getAllPets` controller to handle search, breed, age range filters
3. ✅ Updated `PetFilters` TypeScript interface
4. ✅ Modified `usePets` hook to send all filters to backend
5. ✅ Updated PetListing component with server-side filter UI
6. ✅ Removed client-side filtering logic and pagination calculations

**Benefits Achieved:**
- Unlimited dataset size support
- Faster initial page loads
- Consistent user experience
- Better database performance
- Simplified frontend logic

---

## Production Checklist

### Before Deployment

**Environment:**
- [ ] Set production `DATABASE_URL`
- [ ] Generate secure `JWT_SECRET` (min 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origins to production domain

**Security:**
- [ ] Enable HTTPS
- [ ] Set secure cookie flags if using cookies
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection protection (Drizzle handles this)
- [ ] XSS protection (React handles this)
- [ ] CSRF tokens if needed

**Database:**
- [ ] Run migrations on production DB
- [ ] Set up automated backups
- [ ] Connection pooling configured
- [ ] Indexes on frequently queried columns

**Frontend:**
- [ ] Build with `npm run build`
- [ ] Set correct `VITE_API_URL` for production
- [ ] Test all routes in production build
- [ ] Verify image optimization

**Backend:**
- [ ] Build with `npm run build`
- [ ] Use PM2 or similar process manager
- [ ] Set up logging (Winston/Pino)
- [ ] Health check endpoint
- [ ] Graceful shutdown handling

**Monitoring:**
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database query monitoring
- [ ] Uptime monitoring

---

## Future Enhancements

### Planned Features
- [ ] Email notifications for application status changes
- [ ] Pet search with Algolia/Elasticsearch
- [ ] Image upload with Cloudinary/S3
- [ ] Advanced filters (location, size, temperament)
- [ ] Favorites/watchlist for pets
- [ ] Pet availability alerts
- [ ] Multi-image galleries per pet
- [ ] Admin analytics dashboard
- [ ] PDF export for applications
- [ ] Pagination with infinite scroll option

### Technical Improvements
- [ ] Redis for session management
- [ ] Background job queue for emails (Bull/BullMQ)
- [ ] Rate limiting with Redis
- [ ] API versioning (`/api/v1/...`)
- [ ] OpenAPI/Swagger documentation
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment config

---

## Team & Contact

**Developer:** Gunjan (Junior Software Engineer)
**Company:** Atyantik Technologies
**Experience:** 2.5 years ReactJS development
**Stack Focus:** React, TypeScript, GraphQL, Next.js

---

## License

Gunjan Dalwadi

---

## Changelog

### v1.1.0 (Current)
- ✅ **Server-Side Filtering Implementation**
  - Migrated from client-side to server-side filtering for pets
  - Added search by name, breed filtering, age range filtering
  - Improved performance with database-level queries
  - Unlimited dataset support with proper pagination
- ✅ **Enhanced Pet Listing Page**
  - Advanced filter panel with search, species, breed, status, age range
  - Server-side pagination with proper page reset on filter changes
  - Improved mobile filter toggle experience
- ✅ **Backend API Enhancements**
  - Extended pet filtering API with new parameters
  - Updated Zod validation schemas for all filters
  - Optimized database queries with proper indexing support

### v1.0.0 (Previous)
- ✅ Complete migration from tRPC to REST API
- ✅ Amber/warm design theme implementation
- ✅ Full CRUD for pets (admin)
- ✅ Adoption application flow
- ✅ User dashboard with application tracking
- ✅ Admin dashboard with stats and review system
- ✅ Mobile-responsive navigation
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ Form validation with Zod
- ✅ Error handling and toast notifications
- ✅ No-flicker loading states

---

**Last Updated:** April 18, 2026
**Documentation Version:** 1.1.0
