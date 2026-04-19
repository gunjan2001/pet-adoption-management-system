# 🔄 Switch from pnpm to npm - Complete Guide

## 📋 Overview

This guide will help you completely switch your project from pnpm to npm.

---

## Step 1: Clean Up pnpm Files

### Remove pnpm lock file and cache

```bash
# Remove pnpm lock file
rm pnpm-lock.yaml

# Remove pnpm cache and store (if exists)
rm -rf ~/.pnpm-store
rm -rf node_modules

# Remove pnpm from package.json if it's specified
# (Check package.json for "packageManager" field and remove it)
```

### Remove from both client and server directories

```bash
# In project root
rm -f pnpm-lock.yaml

# In server directory
cd server
rm -rf node_modules
rm -f pnpm-lock.yaml

# In client directory
cd ../client
rm -rf node_modules
rm -f pnpm-lock.yaml

# Back to root
cd ..
```

---

## Step 2: Generate npm Lock Files

### Install dependencies with npm

```bash
# In server directory
cd server
npm install

# This creates package-lock.json
# Verify it was created:
ls -la package-lock.json

# In client directory
cd ../client
npm install

# Verify package-lock.json was created
ls -la package-lock.json

# Back to root
cd ..
```

---

## Step 3: Test Locally

### Test that everything builds with npm

```bash
# Test server build
cd server
npm run build
# Should build successfully

# Test server start (optional)
npm start
# Should start without errors

# Test client build
cd ../client
npm run build
# Should build successfully

# Test client dev server (optional)
npm run dev
# Should start without errors

cd ..
```

---

## Step 4: Update package.json Scripts (if needed)

Check both `client/package.json` and `server/package.json`.

If any scripts reference pnpm, update them:

**BEFORE:**
```json
{
  "scripts": {
    "install:all": "pnpm install"
  }
}
```

**AFTER:**
```json
{
  "scripts": {
    "install:all": "npm install"
  }
}
```

---

## Step 5: Commit npm Lock Files

```bash
# Add the new npm lock files
git add package-lock.json
git add server/package-lock.json
git add client/package-lock.json

# Remove pnpm lock files from git
git rm pnpm-lock.yaml
git rm server/pnpm-lock.yaml 2>/dev/null || true
git rm client/pnpm-lock.yaml 2>/dev/null || true

# Commit the changes
git commit -m "chore: switch from pnpm to npm"
```

---

## Step 6: Update .gitignore (optional but recommended)

Make sure your `.gitignore` includes:

```
# Dependencies
node_modules/

# Lock files (keep the one you're using)
# pnpm-lock.yaml (old - now using npm)
package-lock.json (keep this)

# pnpm specific
.pnpm-debug.log
.pnpm-store/
```

---

## Step 7: Update Documentation

Update these files in your project:

1. **README.md** - Change installation instructions from `pnpm install` to `npm install`
2. **PROJECT_DOCUMENTATION.md** - Update "Package Manager: pnpm" to "Package Manager: npm"
3. **SETUP_DOCUMENTATION.md** - Update any setup commands

---

## ✅ Verification Checklist

Before pushing to GitHub, verify:

- [ ] `pnpm-lock.yaml` is deleted (root, server, client)
- [ ] `package-lock.json` exists in server and client directories
- [ ] Server builds: `cd server && npm run build`
- [ ] Client builds: `cd client && npm run build`
- [ ] No references to pnpm in package.json scripts
- [ ] .gitignore is updated
- [ ] Changes are committed

---

## 🚀 Push Changes

```bash
# Push the changes to GitHub
git push origin main

# GitHub Actions will now use npm (with the updated workflows)
```

---

## 📊 What This Changes

**File System:**
- ❌ Removes: `pnpm-lock.yaml`
- ✅ Adds: `package-lock.json` (in server and client)
- ✅ Keeps: All `package.json` files unchanged

**Commands:**
- ❌ Old: `pnpm install`, `pnpm run build`
- ✅ New: `npm install`, `npm run build`

**GitHub Actions:**
- Will now use npm workflows (provided separately)

---

## ⚠️ Important Notes

1. **Lock file in git**: Make sure to commit `package-lock.json` files to git for consistent installs
2. **npm version**: Use npm v8 or higher (check with `npm --version`)
3. **CI/CD**: Update all workflow files to use npm (provided separately)
4. **Team notification**: If working with a team, notify them to use npm instead of pnpm

---

## 🆘 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails with npm

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Conflicts between lock files

**Solution:**
```bash
# Make sure ALL pnpm-lock.yaml files are deleted
find . -name "pnpm-lock.yaml" -type f -delete

# Regenerate npm lock files
cd server && npm install
cd ../client && npm install
```

---

## 📝 Summary

After completing these steps:
- Your project uses npm exclusively
- All pnpm traces are removed
- npm lock files are generated and committed
- Ready for npm-based GitHub Actions workflows

**Next:** Use the npm-based workflow files I'll provide separately.
