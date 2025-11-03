# Rollback Procedure

**Purpose:** Emergency procedure to revert dependency updates if critical issues are discovered.

---

## Quick Rollback (Emergency)

If the application is broken after dependency updates:

```bash
# 1. Restore backup files
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# 2. Clean install
npm ci

# 3. Clear caches
rm -rf node_modules/.vite dist

# 4. Rebuild
npm run build

# 5. Verify
npm audit
npm run dev  # Test in development
```

**Time to recover:** ~3-5 minutes

---

## Detailed Rollback Steps

### Step 1: Identify the Problem

**Symptoms that require rollback:**
- Application fails to build
- Critical runtime errors in production
- Security issues introduced by updates
- Performance degradation
- Breaking changes affecting core functionality

**Symptoms that DON'T require rollback:**
- Minor console warnings
- Non-critical test failures
- Cosmetic issues
- Performance improvements needed

### Step 2: Stop Affected Services

```bash
# If running in development
pkill -f "vite"

# If deployed, follow your deployment rollback process
# Example for common platforms:
# - Vercel: revert deployment via dashboard
# - Netlify: rollback via CLI or dashboard
# - Docker: docker-compose down && restore previous image
```

### Step 3: Restore Package Files

```bash
# Check backup files exist
ls -lh *.backup

# Restore from backup
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Verify restoration
git diff package.json package-lock.json
# Should show the updates being reverted
```

### Step 4: Reinstall Dependencies

```bash
# Remove current node_modules
rm -rf node_modules

# Clean install from restored lock file
npm ci

# Verify correct versions installed
npm list --depth=0
```

### Step 5: Clear Build Caches

```bash
# Clear vite cache
rm -rf node_modules/.vite

# Clear build output
rm -rf dist

# Clear npm cache (optional, if experiencing issues)
npm cache clean --force
```

### Step 6: Rebuild Application

```bash
# Run build
npm run build

# Check build output
ls -lh dist/

# Verify no errors
echo "Build exit code: $?"  # Should be 0
```

### Step 7: Test Thoroughly

```bash
# Start development server
npm run dev

# In another terminal, run tests if available
npm test

# Manual testing checklist:
# ✓ Application loads
# ✓ No console errors
# ✓ Core features work
# ✓ Data loads correctly
# ✓ Interactions function
```

### Step 8: Verify Security Status

```bash
# Check npm audit
npm audit

# Should show the 2 moderate vulnerabilities again
# This is expected and acceptable for rollback scenario
```

### Step 9: Document the Rollback

```bash
# Create rollback report
cat > docs/security/rollback-report-$(date +%Y%m%d).md <<EOF
# Rollback Report

**Date:** $(date +%Y-%m-%d\ %H:%M:%S)
**Reason:** [Describe why rollback was necessary]
**Rolled back from:** vite@7.1.12
**Rolled back to:** vite@5.4.20

## Issues Encountered
[Describe the problems that led to rollback]

## Resolution Steps Taken
1. Restored package files from backup
2. Reinstalled dependencies via npm ci
3. Rebuilt application
4. Verified functionality

## Current State
- Application functional: YES/NO
- Known vulnerabilities: 2 moderate (esbuild)
- Build status: SUCCESS/FAILED

## Next Steps
- [Investigation needed]
- [Alternative update strategy]
- [Timeline for retry]
EOF
```

---

## Rollback from Git

If changes were committed to git:

```bash
# Find the commit before updates
git log --oneline -10

# Create a revert commit
git revert <commit-hash>

# Or reset to previous commit (destructive)
git reset --hard <commit-hash>

# Reinstall dependencies
npm ci

# Rebuild
npm run build
```

---

## Rollback from Automated Script

If using the safe update script:

```bash
# The script automatically creates timestamped backups
cd .dependency-backups/

# List available backups
ls -lh

# The script creates symlinks to the latest backup
# Restore from latest
cp package.json.latest ../../package.json
cp package-lock.json.latest ../../package-lock.json

# Or restore from specific timestamp
cp package.json.20251103_151500 ../../package.json
cp package-lock.json.20251103_151500 ../../package-lock.json

# Reinstall and rebuild
cd ../..
npm ci
npm run build
```

---

## Prevention for Future Updates

### Always Create Backups

```bash
# Manual backup before updates
cp package.json package.json.backup.$(date +%Y%m%d)
cp package-lock.json package-lock.json.backup.$(date +%Y%m%d)
```

### Test in Isolation

```bash
# Create a test branch
git checkout -b test/dependency-updates

# Make updates in the branch
npm update
npm run build
npm run dev

# Only merge if successful
git checkout main
git merge test/dependency-updates
```

### Use Staging Environment

1. Deploy updates to staging first
2. Run automated tests
3. Perform manual QA
4. Monitor for 24-48 hours
5. Deploy to production only if stable

### Gradual Rollout

1. Deploy to 10% of users
2. Monitor error rates
3. Increase to 50%
4. Monitor again
5. Full rollout only if metrics are good

---

## Rollback Checklist

Before considering rollback complete:

- [ ] Backup files restored
- [ ] Dependencies reinstalled (npm ci)
- [ ] Build completes successfully
- [ ] Application starts without errors
- [ ] Core features tested and working
- [ ] No critical console errors
- [ ] Previous functionality confirmed
- [ ] Rollback documented
- [ ] Team notified
- [ ] Monitoring alerts acknowledged

---

## Post-Rollback Actions

### Immediate (0-24 hours)
1. Notify team of rollback
2. Update status page if applicable
3. Monitor error logs
4. Verify user reports decrease

### Short-term (1-7 days)
1. Investigate root cause
2. Test updates in isolated environment
3. Identify specific breaking change
4. Plan alternative update strategy
5. Document lessons learned

### Long-term
1. Improve testing procedures
2. Add automated compatibility checks
3. Update rollback documentation
4. Schedule retry with fixes
5. Consider gradual update strategy

---

## Contact Information

**For rollback assistance:**
- Primary: Development Team Lead
- Secondary: DevOps Team
- Emergency: On-call Engineer

**Escalation path:**
1. Attempt automatic rollback (5 min)
2. Manual rollback following this guide (15 min)
3. Contact development team (30 min)
4. Escalate to senior engineering (1 hour)

---

## Backup File Locations

| File | Primary Location | Backup Location | Retention |
|------|-----------------|-----------------|-----------|
| package.json | ./ | ./package.json.backup | 7 days |
| package-lock.json | ./ | ./package-lock.json.backup | 7 days |
| Automated backups | N/A | ./.dependency-backups/ | 30 days |
| Git history | .git/ | Remote repository | Permanent |

---

## Known Safe Versions

If rolling back and needing known-good versions:

```json
{
  "devDependencies": {
    "vite": "^5.4.20"
  },
  "dependencies": {
    "marked": "^16.4.0",
    "globe.gl": "^2.44.0"
  }
}
```

**Last known stable state:** 2025-11-03 (before vite 7 upgrade)

---

## Success Criteria

Rollback is successful when:
- ✅ Application builds without errors
- ✅ Development server starts
- ✅ Core visualization features work
- ✅ No critical console errors
- ✅ Data loads and displays correctly
- ✅ User interactions function normally
- ✅ Performance is acceptable
- ✅ No new security vulnerabilities introduced

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-03
**Next Review:** After next dependency update cycle
