# Pet Adoption Backend – Complete API Reference

## Project Structure

```
backend/
├── .env.example
├── package.json
└── src/
    ├── index.ts                        ← Entry point / Express app
    ├── config/
    │   └── db.ts                       ← Drizzle ORM + pg pool
    ├── db/
    │   └── schema.ts                   ← Your Drizzle schema (JS version)
    ├── middleware/
    │   ├── auth.ts                     ← JWT authenticate + authorize()
    │   └── validate.ts                 ← Zod body/query validators
    ├── validators/
    │   └── schemas.ts                  ← All Zod schemas
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── pet.controller.ts
    │   └── adoption.controller.ts
    └── routes/
        ├── auth.routes.ts
        ├── pet.routes.ts
        └── adoption.routes.ts
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill values
cp .env.example .env

# 3. Run dev server (hot-reload via --watch)
npm run dev
```

---

## Auth Routes  `/api/auth`

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/register` | ❌ | name, email, password, phone?, address? |
| POST | `/login` | ❌ | email, password |
| GET | `/me` | ✅ user | — |
| PATCH | `/me` | ✅ user | name?, phone?, address? |

**Register** → returns `{ token, user }`  
**Login** → returns `{ token, user }`

---

## Pet Routes  `/api/pets`

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/` | ❌ | public |
| GET | `/:id` | ❌ | public |
| POST | `/` | ✅ | admin |
| PATCH | `/:id` | ✅ | admin |
| PATCH | `/:id/status` | ✅ | admin |
| DELETE | `/:id` | ✅ | admin |

**GET /** query params: `page`, `limit`, `status`, `species`, `gender`

---

## Adoption Routes  `/api/adoptions`

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/` | ✅ | user/admin |
| GET | `/my` | ✅ | user |
| GET | `/:id` | ✅ | owner or admin |
| DELETE | `/:id/withdraw` | ✅ | owner |
| GET | `/` | ✅ | admin |
| PATCH | `/:id/review` | ✅ | admin |

---

## Adoption Workflow

```
[User submits] → pet: available → pending
                 application: pending

[Admin approves] → pet: pending → adopted
                   application: pending → approved
                   other pending apps → rejected

[Admin rejects]  → pet: pending → available
                   application: pending → rejected

[User withdraws] → application deleted
                   pet: pending → available (if no other pending apps)
```

---

## JWT Usage

All protected routes require:
```
Authorization: Bearer <token>
```

Token payload: `{ userId, role, iat, exp }`

---

## Validation Rules

### Register
- `email` – valid email format
- `password` – min 8 chars, 1 uppercase, 1 number
- `name` – min 2 chars

### Create Application
- `reason` – min 20 characters (must explain motivation)
- `phone` – 7–20 chars
- No duplicate pending applications per user+pet

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "pagination": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```
