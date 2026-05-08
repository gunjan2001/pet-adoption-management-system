# Authentication Flow Documentation

## Overview

This document describes the complete authentication flow in the Pet Adoption Management System. The system uses **JWT (JSON Web Token) based authentication** with a React Context API on the frontend and Express.js middleware on the backend.

---

## Architecture Summary

### Technology Stack
- **Frontend**: React + TypeScript with Context API for state management
- **Backend**: Node.js/Express with JWT authentication
- **Password Hashing**: bcryptjs (12 salt rounds)
- **Token Algorithm**: HS256 (HMAC SHA-256)
- **Token Duration**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Storage**: JWT stored in localStorage on client-side

---

## Frontend Authentication Flow

### 1. AuthContext (`client/src/contexts/AuthContext.tsx`)

The `AuthContext` is the central state management hub for authentication.

#### State Management
```
- user: User | null           (Currently logged-in user)
- token: string | null        (JWT token)
- isLoading: boolean          (Initial load state)
- isAuthenticated: boolean    (Computed: token !== null)
- isAdmin: boolean            (Computed: user?.role === "admin")
```

#### Core Methods

**`persistAuth(token, user)`**
- Saves token and user to localStorage
- Updates React state
- Called after successful login/register

**`clearAuth()`**
- Removes token and user from localStorage
- Clears React state
- Called on logout or when token expires

**`login(data: LoginInput)`**
- Calls `authApi.login()` with email and password
- On success, persists token and user via `persistAuth()`
- On failure, throws error to be caught by caller

**`register(data: RegisterInput)`**
- Calls `authApi.register()` with user details
- On success, persists token and user via `persistAuth()`
- On failure, throws error to be caught by caller

**`logout()`**
- Immediately clears auth state
- User is redirected to login page by route guard

**`refreshUser()`**
- Calls `authApi.getProfile()` to fetch updated user data
- Updates localStorage and state
- On failure, calls `clearAuth()` (user likely token expired)

#### Session Rehydration
On initial app load, the context:
1. Checks localStorage for `TOKEN_KEY` and `USER_KEY`
2. If both exist and are valid JSON, restores them to state
3. Sets `isLoading: false` to signal readiness
4. If parsing fails, clears auth state

---

### 2. HTTP Client (`client/src/lib/api/httpClient.ts`)

Axios instance with automatic JWT injection and error handling.

#### Request Interceptor
- Reads JWT from localStorage (`TOKEN_KEY`)
- Adds `Authorization: Bearer <token>` header to all requests
- Silently skips if no token available

#### Response Interceptor Handles:
- **401 Unauthorized**: Detects expired/invalid tokens and triggers auto-logout
- **Network Errors**: Implements 5-second retry for NeonDB cold-start scenarios
- **Aborted Requests**: Silently ignores CancelledError (StrictMode cleanup)

---

### 3. Auth API Layer (`client/src/lib/api/auth.api.ts`)

Wrapper around HTTP client for authentication endpoints.

#### Endpoints

**`register(data: RegisterInput)`**
```
POST /auth/register
Body: { name, email, password, phone?, address? }
Returns: { success, token, user, message }
```

**`login(data: LoginInput)`**
```
POST /auth/login
Body: { email, password }
Returns: { success, token, user, message }
```

**`getProfile()`**
```
GET /auth/me
Headers: Authorization: Bearer <token>
Returns: { success, user }
```

**`updateProfile(data)`**
```
PATCH /auth/me
Body: { name?, phone?, address? }
Headers: Authorization: Bearer <token>
Returns: { success, user }
```

---

### 4. UI Components

#### LoginForm & RegisterForm
- Use `useAuth()` hook to access context
- Call `login()` or `register()` on form submission
- Handle validation errors from API
- Redirect to dashboard on success

#### Protected Routes
- Check `isAuthenticated` from context
- Redirect to login if not authenticated
- Render admin-only content based on `isAdmin` flag

---

## Backend Authentication Flow

### 1. Database Schema (`server/src/db/schema.ts`)

Users table includes:
```
- id: integer (primary key)
- email: string (unique)
- password: string (hashed)
- name: string
- phone: string (nullable)
- address: string (nullable)
- role: "user" | "admin"
- loginMethod: string
- lastSignedIn: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp
```

---

### 2. Auth Middleware (`server/src/middleware/auth.ts`)

#### `authenticate(req, res, next)`

**Flow:**
1. Checks `Authorization` header for `Bearer <token>` format
2. Verifies token signature using `JWT_SECRET`
3. Decodes JWT to extract `userId` and `role`
4. Fetches fresh user record from database (to get latest permissions/status)
5. Attaches user to `req.user` (as `AuthRequest.user`)
6. Calls `next()` to proceed to route handler

**Error Handling:**
- Missing/malformed header → 401 "Access token is missing or malformed"
- Invalid signature → 401 "Invalid token"
- Expired token → 401 "Token has expired — please log in again"
- User not found in DB → 401 "User account not found"
- Unexpected error → 500 "Internal server error"

#### `authorize(...allowedRoles)`

**Flow:**
1. Must be used AFTER `authenticate` middleware
2. Checks if `req.user.role` is in `allowedRoles` array
3. Calls `next()` if authorized

**Error Handling:**
- Not authenticated → 401 "Not authenticated"
- Wrong role → 403 "Access denied. Required role(s): [list]"

---

### 3. Auth Controller (`server/src/controllers/auth.controller.ts`)

#### `register(req, res)`

**Process:**
1. Validates request body (see validators/schemas.ts)
2. Checks if email already exists in database
   - If exists → 409 "Email already in use"
3. Hashes password using bcryptjs (12 rounds)
4. Inserts new user record with `role: "user"`
5. Generates JWT token using `signToken(userId, "user")`
6. Returns 201 with token + user object (password excluded)

**Security:**
- bcryptjs with 12 rounds prevents brute-force attacks
- Password never returned in response

#### `login(req, res)`

**Process:**
1. Validates request body
2. Queries user by email
3. Uses constant-time bcrypt comparison to prevent timing attacks
   - Even if user doesn't exist, comparison still happens with dummy hash
4. If valid, updates `lastSignedIn` timestamp
5. Generates JWT token using `signToken(userId, user.role)`
6. Returns 200 with token + user object

**Security:**
- Timing attack prevention with dummy hash comparison
- Generic error message ("Invalid email or password") prevents account enumeration

#### `getProfile(req, res)`

**Process:**
1. Requires authentication middleware
2. Returns user object from `req.user` (already validated by authenticate middleware)
3. Returns 200

#### `updateProfile(req, res)`

**Process:**
1. Requires authentication middleware
2. Updates name, phone, address for authenticated user
3. Returns updated user object

---

### 4. Auth Routes (`server/src/routes/auth.routes.ts`)

```
POST   /auth/register    → validateBody → register controller
POST   /auth/login       → validateBody → login controller
GET    /auth/me          → authenticate → getProfile controller
PATCH  /auth/me          → authenticate → validateBody → updateProfile controller
```

---

### 5. Token Generation (`signToken`)

```typescript
const signToken = (userId: number, role: "user" | "admin"): string =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
```

**Payload Structure:**
```json
{
  "userId": 42,
  "role": "user",
  "iat": 1234567890,
  "exp": 1241167890
}
```

---

## Data Flow Diagrams

### Registration Flow
```
User Form
    ↓
RegisterForm Component
    ↓
useAuth().register(email, password, ...)
    ↓
authApi.register() [POST /auth/register]
    ↓
HTTP Client [adds Authorization header if exists]
    ↓
Backend /auth/register
    ↓
Check email uniqueness → Hash password → Insert to DB
    ↓
Generate JWT → Return token + user
    ↓
AuthContext.persistAuth(token, user)
    ↓
localStorage.setItem(TOKEN_KEY, token)
localStorage.setItem(USER_KEY, JSON.stringify(user))
    ↓
Update React state
    ↓
Redirect to Dashboard
```

### Login Flow
```
User Form
    ↓
LoginForm Component
    ↓
useAuth().login(email, password)
    ↓
authApi.login() [POST /auth/login]
    ↓
HTTP Client
    ↓
Backend /auth/login
    ↓
Find user by email → Compare passwords (constant-time) → Update lastSignedIn
    ↓
Generate JWT → Return token + user
    ↓
AuthContext.persistAuth(token, user)
    ↓
localStorage + React state update
    ↓
Redirect to Dashboard
```

### Protected API Request Flow
```
Frontend Component
    ↓
Call authApi.getProfile()
    ↓
authApi calls api.get("/auth/me")
    ↓
HTTP Client Request Interceptor
    ↓
Reads TOKEN_KEY from localStorage
    ↓
Adds header: Authorization: Bearer <token>
    ↓
Sends request to Backend
    ↓
Backend receives request
    ↓
authenticate middleware
    ↓
Verifies token signature
    ↓
Decodes JWT → Fetches fresh user from DB
    ↓
Attaches to req.user
    ↓
Route handler (getProfile)
    ↓
Returns user from req.user
    ↓
Response comes back to client
    ↓
HTTP Client Response Interceptor
    ↓
Returns response to caller
    ↓
Component updates UI
```

### Logout Flow
```
User clicks Logout
    ↓
useAuth().logout()
    ↓
AuthContext.clearAuth()
    ↓
localStorage.removeItem(TOKEN_KEY)
localStorage.removeItem(USER_KEY)
    ↓
setToken(null)
setUser(null)
    ↓
isAuthenticated = false
    ↓
Route guard redirects to /login
```

### Token Expiration Handling
```
Frontend makes API request with expired token
    ↓
Backend receives request
    ↓
authenticate middleware
    ↓
jwt.verify() throws TokenExpiredError
    ↓
Returns 401 "Token has expired"
    ↓
HTTP Client Response Interceptor catches 401
    ↓
Calls clearAuth() to remove token/user
    ↓
Redirects user to /login
    ↓
User must login again to get new token
```

---

## Security Features

### 1. Password Security
- **Hashing**: bcryptjs with 12 salt rounds
- **Never Stored in Response**: Password excluded from all API responses
- **Never Logged**: Password never written to console/logs

### 2. Token Security
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: 7 days (JWT_EXPIRES_IN)
- **Storage**: localStorage (not httpOnly cookies due to frontend-only access needs)
- **Transmission**: Bearer token in Authorization header
- **Verification**: Server verifies on every protected request

### 3. Attack Prevention
- **Timing Attacks**: Constant-time bcrypt comparison prevents user enumeration
- **Brute Force**: bcryptjs 12 rounds makes password cracking slow
- **CSRF**: API uses stateless JWT (no session cookies)
- **Token Replay**: JWT expiration + signature verification
- **Account Enumeration**: Generic error messages ("Invalid email or password")

### 4. Role-Based Access Control (RBAC)
- User has `role: "user" | "admin"`
- `authorize(allowedRoles)` middleware enforces role checks
- Admin endpoints protected by `authenticate` + `authorize("admin")`

---

## Error Codes & Messages

| Status | Error | When It Occurs |
|--------|-------|---|
| 201 | ✓ Account created successfully | Registration succeeds |
| 200 | ✓ Login successful | Login succeeds |
| 200 | ✓ Returned user data | getProfile/updateProfile succeeds |
| 400 | Validation error | Request body fails schema validation |
| 401 | Access token is missing or malformed | No Bearer token in header |
| 401 | Invalid token | Token signature verification fails |
| 401 | Token has expired | Token exp > current time |
| 401 | User account not found | User ID not in database |
| 401 | Invalid email or password | Login credentials wrong |
| 401 | Not authenticated | Protected route, no valid token |
| 403 | Access denied. Required role(s): [list] | User role not authorized |
| 409 | Email already in use | Registration with duplicate email |
| 500 | Internal server error | Unexpected server error |

---

## Configuration

### Environment Variables Required
```
JWT_SECRET         - Secret key for signing tokens (must be strong)
JWT_EXPIRES_IN     - Token expiration time (default: "7d")
API_BASE_URL       - API endpoint URL (frontend)
```

### Constants
```
TOKEN_KEY = "token"        // localStorage key for JWT
USER_KEY = "user"          // localStorage key for user object
```

---

## Type Definitions

### Frontend Types (`client/src/types/index.ts`)
```typescript
interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: "user" | "admin";
}

interface AuthResponse {
  success: true;
  message: string;
  token: string;
  user: User;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}
```

### Backend Types (`server/src/types/index.ts`)
```typescript
interface JwtPayload {
  userId: number;
  role: "user" | "admin";
}

interface AuthRequest extends Request {
  user: AuthUser;
}

interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  phone: string | null;
  address: string | null;
}
```

---

## Usage Examples

### In React Components
```typescript
import { useAuth } from "@/_core/hooks/useAuth";

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### In Backend Routes (Protected)
```typescript
router.get("/admin/stats", authenticate, authorize("admin"), (req, res) => {
  const user = (req as AuthRequest).user;
  // user is guaranteed to be admin here
  res.json({ userId: user.id, role: user.role });
});
```

### Triggering Profile Refresh
```typescript
const { refreshUser } = useAuth();

// After user updates their profile
await updateProfile(data);
await refreshUser();  // Fetches latest user data from server
```

---

## Testing Checklist

- [ ] Register with new email → token created, user saved
- [ ] Register with existing email → 409 error
- [ ] Login with correct credentials → token created
- [ ] Login with wrong password → 401 generic error
- [ ] Login with non-existent email → 401 generic error
- [ ] Access protected route with valid token → success
- [ ] Access protected route with invalid token → 401 redirect to login
- [ ] Access protected route with expired token → 401 redirect to login
- [ ] Access protected route without token → 401 redirect to login
- [ ] Admin route with admin user → success
- [ ] Admin route with regular user → 403 forbidden
- [ ] Logout → token/user cleared from localStorage
- [ ] Refresh page after login → session restored from localStorage

---

## Troubleshooting

### User Stays Logged In After Page Refresh
**Expected Behavior**: User should remain logged in if token hasn't expired
**Root Cause**: localStorage keys might be wrong
**Solution**: Verify `TOKEN_KEY` and `USER_KEY` match between frontend and context

### 401 "Token has expired" But Token Should Be Valid
**Root Cause**: System clock might be out of sync
**Solution**: Check server time and client time match; JWT exp claim is in seconds

### Protected API Always Returns 401
**Root Cause**: Token not being attached to headers
**Solution**: Verify HTTP client interceptor is running; check TOKEN_KEY in localStorage

### User Can Access Admin Routes Without Admin Role
**Root Cause**: `authorize()` middleware not applied to route
**Solution**: Ensure route has both `authenticate` AND `authorize("admin")`

---

## Future Enhancements

- [ ] Implement refresh tokens (separate long-lived tokens for revalidation)
- [ ] Add multi-factor authentication (MFA)
- [ ] Implement email verification on registration
- [ ] Add password reset via email
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after N failed login attempts
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Session management (list active sessions, revoke sessions)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-08  
**Status**: Production Ready
