# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Pet Adoption Management System.

## 📁 Workflow Files

### 1. `ci.yml` - Continuous Integration
**Triggers:** Pull requests and pushes to main/develop

**What it does:**
- ✅ TypeScript type checking (backend + frontend)
- ✅ Build verification
- ✅ Security audit
- ✅ Secret detection scan

**Use case:** Runs automatically on every PR to ensure code quality

---

### 2. `deploy-fullstack.yml` - Full Stack Deployment
**Triggers:**
- Push to `main` when files in `client/`, `server/`, or `drizzle/` change
- Version tags (e.g., `v1.0.0`)
- Manual trigger with options

**What it does:**
- Deploys backend to Render
- Deploys frontend to Vercel
- Runs smoke tests
- Creates GitHub Release (for version tags)

**Use case:**
- Major releases
- Changes affecting both frontend and backend
- Manual deployment of entire stack

---
**Triggers:**
- Push to `main` branch
- Version tags (e.g., `v1.0.0`)
- Manual trigger with options

**What it does:**
- Deploys backend to Render
- Deploys frontend to Vercel
- Runs smoke tests
- Creates GitHub Release (for version tags)

**Use case:** 
- Major releases
- Changes affecting both frontend and backend
- Manual deployment of entire stack

---

### 5. `migrate-database.yml` - Database Migrations
**Triggers:** Manual only (for safety)

**What it does:**
- Validates confirmation
- Shows pending migrations
- Runs Drizzle migrations
- Verifies schema

**Use case:** Apply database schema changes to production

**⚠️ Important:** Requires typing "MIGRATE" to confirm

---

## 🚀 Quick Start

### First Time Setup

1. **Add Required Secrets** (Settings → Secrets → Actions):
   ```
   RENDER_API_KEY
   RENDER_SERVICE_ID
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   VITE_API_URL
   DATABASE_URL
   ```

2. **Enable Actions** (if not already enabled):
   - Go to repository Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"

3. **Push Workflow Files**:
   ```bash
   git add .github/
   git commit -m "ci: add GitHub Actions workflows"
   git push origin main
   ```

4. **Verify Setup**:
   - Go to "Actions" tab in GitHub
   - Workflows should appear in the sidebar
   - Try manual trigger to test

---

## 🎯 Common Use Cases

### Deploy Full Stack
```bash
# Automatic: Push any changes
git push origin main

# Manual: Via GitHub UI
Actions → "Deploy Full Stack" → Run workflow

# Manual: Via CLI
gh workflow run deploy-fullstack.yml
```

### Create Version Release
```bash
# Tag and push
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# This triggers full stack deployment + GitHub Release
```

### Run Database Migration
```bash
# Via GitHub UI ONLY (for safety)
Actions → "Run Database Migrations" → Run workflow
Select environment: production
Type "MIGRATE" to confirm
```

---

## 🔍 Monitoring Workflows

### View All Runs
```bash
gh run list
```

### Watch Active Run
```bash
gh run watch
```

### View Specific Run
```bash
gh run view <run-id> --log
```

### Cancel Running Workflow
```bash
gh run cancel <run-id>
```

### Re-run Failed Workflow
```bash
gh run rerun <run-id>
```

---

## 🐛 Troubleshooting

### Workflow Not Triggering

**Check:**
- File paths match trigger conditions
- Branch name is correct
- Actions are enabled in repo settings
- Workflow file syntax is valid

**Debug:**
```bash
# View workflow configuration
cat .github/workflows/deploy-fullstack.yml

# Validate YAML syntax
yamllint .github/workflows/
```

### Deployment Fails

**Backend:**
1. Check Render dashboard logs
2. Verify environment variables
3. Test build locally: `cd server && npm run build`
4. Check `RENDER_SERVICE_ID` is correct

**Frontend:**
1. Check Vercel deployment logs
2. Verify Vercel tokens/IDs
3. Test build locally: `cd client && npm run build`
4. Check `VITE_API_URL` is set

### Secrets Not Working

**Common Issues:**
- Secret name typo (case-sensitive)
- Secret value has extra spaces
- Old token expired
- Incorrect service ID

**Fix:**
1. Delete and recreate secret
2. Regenerate tokens if needed
3. Update all references

---

## 📊 Workflow Status Badges

Add these to your README to show build status:

```markdown
![CI](https://github.com/username/repo/workflows/CI%20Checks/badge.svg)
![Backend](https://github.com/username/repo/workflows/Deploy%20Backend%20to%20Render/badge.svg)
![Frontend](https://github.com/username/repo/workflows/Deploy%20Frontend%20to%20Vercel/badge.svg)
```

---

## 🔒 Security Notes

1. **Never commit secrets** - Always use GitHub Secrets
2. **Review PRs carefully** - Workflows run on PR events
3. **Limit workflow permissions** - Use least privilege principle
4. **Monitor workflow runs** - Set up failure notifications
5. **Audit regularly** - Review workflow activity logs

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
- [GitHub CLI](https://cli.github.com/)
- [Render API Docs](https://render.com/docs/api)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

---

**Last Updated:** April 18, 2026
**Version:** 1.0.0
