# SPA Routing Fix for Vercel Deployment

## Problem Summary
When refreshing nested routes (e.g., `/dashboard`, `/admin/pets`, `/pets/123`), Vercel returns a 404 error because it tries to find a physical file instead of serving `index.html` for SPA routing.

## Root Cause Analysis

### Issue 1: Overly Complex Rewrite Regex
**Original pattern:**
```json
"/((?!api|assets|.*\\..*).*)"
```

**Problems:**
- The negative lookahead is too strict and can fail to match valid SPA routes
- Excludes ALL files with extensions, but Vite outputs hashed filenames like `main.a1b2c3d4.js`
- The regex is fragile and has edge cases that cause false negatives

### Issue 2: Incorrect `outputDirectory`
**Original:**
```json
"outputDirectory": "dist"
```

**Problem:** This assumes `dist` is at the root level, but your build output is in `client/dist`

### Issue 3: Build Commands Not Scoped
**Original:**
```json
"buildCommand": "npm install && npm run build"
```

**Problem:** Runs in root, but your build happens in the `client` directory

## Solution Overview

### Key Changes Made

#### 1. **Fixed vercel.json Rewrites**

**Old approach (BROKEN):**
```json
"rewrites": [
  {
    "source": "/((?!api|assets|.*\\..*).*)",
    "destination": "/"
  }
]
```

**New approach (WORKING):**
```json
"rewrites": [
  {
    "source": "/api/:path*",
    "destination": "http://localhost:5000/api/:path*"
  },
  {
    "source": "/(?!api).*",
    "destination": "/index.html"
  }
]
```

**Why this works:**
- **First rule:** Explicitly routes all `/api/*` requests to your backend (preserves path with `:path*`)
- **Second rule:** Simple negative lookahead `(?!api)` catches everything EXCEPT `/api` paths and serves `index.html`
- **Result:** All non-API routes (including hashed assets, and SPA routes) are handled correctly

#### 2. **Updated Build Configuration**

```json
"buildCommand": "cd client && npm install && npm run build",
"outputDirectory": "client/dist",
```

**Why:** Ensures build happens in the correct directory and Vercel finds the output

#### 3. **Enhanced Vite Config**

Added explicit SPA build configuration:
```typescript
build: {
  rollupOptions: {
    input: path.resolve(__dirname, './index.html'),
  },
}
```

**Why:** Guarantees `index.html` is the entry point for Rollup, ensuring proper SPA bundling

## How SPA Routing Works

### Flow Before Fix (BROKEN ❌)
```
1. User navigates to /dashboard (client-side routing works)
2. User refreshes page
3. Browser requests GET /dashboard from Vercel
4. Vercel tries to match /dashboard against rewrite rules
5. Complex regex fails to match → no rewrite applied
6. Vercel looks for /dashboard file in dist/
7. File not found → 404 error ❌
```

### Flow After Fix (WORKING ✅)
```
1. User navigates to /dashboard (client-side routing works)
2. User refreshes page
3. Browser requests GET /dashboard from Vercel
4. Vercel matches /dashboard against rewrite rules
5. Simple regex /(?!api).* matches → rewrite applied
6. Vercel serves /index.html instead
7. index.html loads, React initializes
8. Wouter router matches /dashboard and renders correct component ✅
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Not Excluding API Routes
```json
// WRONG - rewrites ALL requests including API to index.html
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```
**Problem:** API calls return HTML instead of JSON, breaking your backend integration

### ❌ Mistake 2: Wrong Output Directory
```json
// WRONG - looking in wrong location
"outputDirectory": "dist"
// Should be:
"outputDirectory": "client/dist"
```
**Problem:** Vercel can't find your build output

### ❌ Mistake 3: Not Handling Monorepo Structure
```json
// WRONG - doesn't work for monorepos
"buildCommand": "npm run build"
// Should be:
"buildCommand": "cd client && npm run build"
```
**Problem:** Build fails or deploys wrong directory

### ❌ Mistake 4: Regex Edge Cases
```json
// RISKY - complex negative lookahead with multiple conditions
"source": "/((?!api|assets|_next|.*\\..*).*)"
```
**Problem:** Regex is fragile and can break with unexpected route patterns

### ✅ Correct Pattern
```json
"source": "/(?!api).*"
```
**Benefit:** Simple, maintainable, handles all non-API routes

### ❌ Mistake 5: Missing Path Preservation for API
```json
// WRONG - loses query parameters and path segments
"destination": "http://localhost:5000/api"
// Should be:
"destination": "http://localhost:5000/api/:path*"
```
**Problem:** API requests lose their path and query parameters

## Testing Checklist

After deployment, verify:

- [ ] **SPA Route Refresh:** Go to `https://yourdomain.com/dashboard` and refresh → Should work
- [ ] **Nested Admin Routes:** Go to `https://yourdomain.com/admin/pets` and refresh → Should work  
- [ ] **Pet Detail Routes:** Go to `https://yourdomain.com/pets/123` and refresh → Should work
- [ ] **API Calls:** Verify `/api/auth/login` still calls your backend, not returns HTML
- [ ] **Static Assets:** Ensure `.js`, `.css`, `.png` files load correctly
- [ ] **404 Page:** Navigate to `/nonexistent-route` → Should show your NotFound component

## Additional Resources

### SPA Routing Explanation
When a SPA refreshes on a non-root route, the browser makes an HTTP request to the server. Without proper rewrite rules, the server looks for a physical file matching that route. Since routes are managed client-side, no file exists → 404.

The solution rewrites all non-API requests to `index.html`, which contains your React app. React then:
1. Loads the HTML and JavaScript
2. Initializes the routing library (wouter)
3. Matches the current URL against defined routes
4. Renders the correct component

### Why Negative Lookahead?
`/(?!api).*` means:
- Match any path EXCEPT those starting with `/api`
- This ensures API calls go to your backend, not your frontend

## Deployment Steps

1. Push changes to your `main`/`develop` branch
2. Vercel automatically detects changes to `vercel.json`
3. Redeploy your project
4. Clear browser cache (hard refresh with Ctrl+Shift+R or Cmd+Shift+R)
5. Test SPA routes with page refreshes

---

**Last Updated:** 2024  
**Tested With:** Vite 5.3.1, React 18.3.1, Wouter 3.3.5, Vercel
