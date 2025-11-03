# Branch Protection Setup Guide

## Overview

This guide provides step-by-step instructions for configuring branch protection rules to enforce security and quality standards.

## Prerequisites

- Repository admin access
- All security workflows deployed and operational
- Team members familiar with PR process

## Step-by-Step Configuration

### 1. Access Branch Protection Settings

1. Navigate to your repository on GitHub
2. Click **Settings** (top menu)
3. Select **Branches** (left sidebar)
4. Click **Add branch protection rule**

### 2. Configure Branch Name Pattern

**For Production (`main`):**
```
Branch name pattern: main
```

**For Development (`develop`):**
```
Branch name pattern: develop
```

**For Release Branches:**
```
Branch name pattern: release/*
```

### 3. Require Pull Request Reviews

Enable and configure:

```
☑ Require a pull request before merging

Settings:
  Required number of approvals before merging: 1
  (For critical repos, consider 2)

  ☑ Dismiss stale pull request approvals when new commits are pushed

  ☑ Require review from Code Owners
  (Ensures domain experts review their areas)

  ☑ Require approval of the most recent reviewable push
  (Prevents approval of outdated code)

  ☐ Require approval of the most recent push
  (Optional - more strict)
```

### 4. Require Status Checks

Enable comprehensive CI/CD checks:

```
☑ Require status checks to pass before merging

Settings:
  ☑ Require branches to be up to date before merging
  (Prevents merge conflicts)

Status checks that are required:
  ☑ dependency-audit
  ☑ secret-scanning / TruffleHog Secret Scan
  ☑ secret-scanning / GitLeaks Secret Scan
  ☑ sast-codeql / CodeQL SAST Analysis (javascript)
  ☑ sast-semgrep / Semgrep SAST
  ☑ license-compliance / License Compliance Check
  ☑ pr-validation / PR Validation
  ☑ security-review-required / Security Review Check

  # Add your test jobs
  ☑ test / Unit Tests
  ☑ test / Integration Tests
  ☑ build / Build Project
```

**Note**: Status check names appear after the workflow runs at least once. Run workflows first, then add them here.

### 5. Require Conversation Resolution

```
☑ Require conversation resolution before merging
```

Ensures all review comments are addressed or explicitly resolved.

### 6. Require Signed Commits

```
☑ Require signed commits
```

**Benefits:**
- Verifies commit author identity
- Prevents commit spoofing
- Meets compliance requirements

**Setup for Team:**
See [GitHub's GPG commit signing guide](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

### 7. Require Linear History

```
☑ Require linear history
```

**Effect:**
- Prevents merge commits
- Enforces squash or rebase merging
- Maintains clean git history

### 8. Require Deployments to Succeed

```
☐ Require deployments to succeed before merging
```

Optional - Enable if you have staging deployment checks.

### 9. Lock Branch

```
☐ Lock branch
```

**When to use:**
- Archive branch for historical reference
- Prevent any changes to released versions
- Lock during security incidents

### 10. Do Not Allow Bypassing Settings

```
☑ Do not allow bypassing the above settings
```

**Critical**: Prevents admins from bypassing protections without proper justification.

### 11. Restrict Pushes

```
Restrict who can push to matching branches:
  ☐ Restrict pushes that create matching branches

  Who can push: (Leave empty to block all direct pushes)
```

**Recommended**: Leave empty to require all changes via PR.

### 12. Allow Force Pushes

```
☐ Allow force pushes
  Specify who can force push: (Leave empty)
```

**Security Note**: Keep disabled to prevent history rewriting.

### 13. Allow Deletions

```
☐ Allow deletions
```

**Security Note**: Keep disabled to prevent accidental branch deletion.

## Complete Configuration Example

### Production Branch (`main`)

```yaml
Branch Protection Rule: main

Require a pull request before merging: ✅
  Required approvals: 2
  Dismiss stale reviews: ✅
  Require review from Code Owners: ✅
  Require approval of most recent push: ✅

Require status checks to pass: ✅
  Require branches to be up to date: ✅
  Required checks:
    - dependency-audit
    - secret-scanning / TruffleHog Secret Scan
    - secret-scanning / GitLeaks Secret Scan
    - sast-codeql / CodeQL SAST Analysis
    - sast-semgrep / Semgrep SAST
    - license-compliance / License Compliance Check
    - test / Unit Tests
    - test / Integration Tests
    - build / Production Build

Require conversation resolution: ✅
Require signed commits: ✅
Require linear history: ✅
Require deployments to succeed: ✅ (staging)
Do not allow bypassing settings: ✅

Restrictions:
  Allow force pushes: ❌
  Allow deletions: ❌
  Restrict pushes: ✅ (no one can push directly)
```

### Development Branch (`develop`)

```yaml
Branch Protection Rule: develop

Require a pull request before merging: ✅
  Required approvals: 1
  Dismiss stale reviews: ✅
  Require review from Code Owners: ✅

Require status checks to pass: ✅
  Require branches to be up to date: ✅
  Required checks:
    - dependency-audit
    - secret-scanning / TruffleHog Secret Scan
    - secret-scanning / GitLeaks Secret Scan
    - sast-codeql / CodeQL SAST Analysis
    - sast-semgrep / Semgrep SAST
    - test / Unit Tests

Require conversation resolution: ✅
Require signed commits: ✅ (optional for dev)
Require linear history: ✅
Do not allow bypassing settings: ✅

Restrictions:
  Allow force pushes: ❌
  Allow deletions: ❌
```

## Verification

After configuring, verify protections work:

### Test 1: Direct Push
```bash
git checkout main
git commit -m "test" --allow-empty
git push origin main
```
**Expected**: ❌ Push rejected

### Test 2: PR Without Approval
1. Create PR to main
2. Try to merge without approval
**Expected**: ❌ Merge blocked

### Test 3: PR With Failing Checks
1. Create PR with security issue
2. Wait for checks to fail
3. Try to merge
**Expected**: ❌ Merge blocked

### Test 4: Force Push
```bash
git push --force origin main
```
**Expected**: ❌ Push rejected

## Exceptions and Emergency Procedures

### Temporary Bypass (Emergency Only)

1. **Document the emergency** in issue tracker
2. Admin temporarily disables specific check
3. Make emergency change
4. **Immediately re-enable** protection
5. Create follow-up issue for proper fix
6. Post-incident review required

### Permanent Exceptions

Some files may need to bypass certain checks:

**Example: Generated files**
```yaml
# In workflow, add conditional:
if: "!contains(github.event.head_commit.message, '[skip ci]')"
```

**Use sparingly and document thoroughly.**

## Monitoring Compliance

### Weekly Review
- Check for disabled protections
- Review bypass events
- Audit emergency access logs

### Monthly Audit
```bash
# List all protected branches
gh api repos/:owner/:repo/branches \
  --jq '.[] | select(.protected == true) | .name'

# Get protection details
gh api repos/:owner/:repo/branches/main/protection
```

### Automated Monitoring

Create workflow to verify protections:

```yaml
# .github/workflows/branch-protection-audit.yml
name: Branch Protection Audit

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Check branch protections
        uses: actions/github-script@v7
        with:
          script: |
            const branches = ['main', 'develop'];

            for (const branch of branches) {
              const { data } = await github.rest.repos.getBranchProtection({
                owner: context.repo.owner,
                repo: context.repo.repo,
                branch
              });

              console.log(`Protection status for ${branch}:`, data);

              // Verify required checks
              const requiredChecks = [
                'dependency-audit',
                'secret-scanning',
                'sast-codeql',
                'sast-semgrep'
              ];

              const missing = requiredChecks.filter(check =>
                !data.required_status_checks.contexts.includes(check)
              );

              if (missing.length > 0) {
                core.error(`Missing required checks for ${branch}: ${missing.join(', ')}`);
              }
            }
```

## Troubleshooting

### Issue: Required checks not appearing

**Solution:**
1. Ensure workflows have run at least once
2. Check workflow names match exactly
3. Verify workflow triggers include PR events

### Issue: Team members can't create PRs

**Cause**: Too restrictive fork settings

**Solution:**
```
Settings > Options > Enable "Allow merge commits" or "Allow squash merging"
```

### Issue: Dependabot PRs failing checks

**Solution:**
Add Dependabot permissions:
```yaml
# In workflow
permissions:
  pull-requests: write
  contents: write
```

### Issue: Admin bypass not working in emergency

**Temporary Solution:**
```
Settings > Branches > Edit rule >
Uncheck "Do not allow bypassing settings"
Make emergency change
IMMEDIATELY re-enable
```

## Team Training

### Required Knowledge
- [ ] How to create PRs
- [ ] Review process and expectations
- [ ] Responding to failed status checks
- [ ] Commit signing setup
- [ ] Emergency procedures

### Training Resources
- [Internal PR Process Doc](link-to-doc)
- [Security Review Checklist](../security/review-checklist.md)
- [Git Best Practices](../development/git-workflow.md)

## Rollout Strategy

### Phase 1: Development Branch (Week 1)
- Enable on `develop` branch
- Monitor for issues
- Gather team feedback

### Phase 2: Release Branches (Week 2-3)
- Apply to `release/*` branches
- Verify no deployment blockers

### Phase 3: Production Branch (Week 4)
- Enable full protections on `main`
- Communicate to all teams
- Monitor closely for first week

### Phase 4: Refinement (Ongoing)
- Adjust based on feedback
- Add additional checks as needed
- Regular compliance reviews

## Success Criteria

- ✅ Zero direct pushes to protected branches
- ✅ 100% of PRs reviewed before merge
- ✅ All security checks passing
- ✅ No force pushes in last 30 days
- ✅ Team trained and compliant
- ✅ Emergency procedures tested

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [CODEOWNERS Guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Status Check API](https://docs.github.com/en/rest/commits/statuses)

---

**Last Updated**: 2025-11-03
**Maintained By**: DevSecOps Team
**Review Schedule**: Quarterly
