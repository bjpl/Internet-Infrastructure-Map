# Manual Branch Protection Configuration Guide

**Repository:** Internet-Infrastructure-Map
**Owner:** bjpl
**Last Updated:** 2025-11-03

## Overview

This guide provides step-by-step instructions for manually configuring branch protection rules through the GitHub web interface. Use this guide if:
- Automated scripts cannot be used
- You prefer manual configuration
- Scripts fail due to permission issues
- You need to understand each setting in detail

## Prerequisites

Before you begin:
- [ ] You have admin access to the repository
- [ ] You are logged into GitHub.com
- [ ] You have reviewed the [Branch Protection Configuration](./BRANCH_PROTECTION_CONFIGURED.md)

## Step 1: Navigate to Branch Protection Settings

1. Open your web browser and go to: `https://github.com/bjpl/Internet-Infrastructure-Map`

2. Click the **Settings** tab (far right in the repository menu)
   - If you don't see Settings, you don't have admin access

3. In the left sidebar, click **Branches** under "Code and automation"

4. You should now see the "Branch protection rules" section

## Step 2: Configure Main Branch Protection (STRICT)

### Create Protection Rule

1. Click the **Add branch protection rule** button

2. In the "Branch name pattern" field, enter: `main`

### Required Status Checks Configuration

3. **Enable** the checkbox: ☑️ **Require status checks to pass before merging**

4. **Enable** the checkbox: ☑️ **Require branches to be up to date before merging**

5. In the search box that appears, add these status checks one by one:
   - Type `security-scan` and select it
   - Type `dependency-audit` and select it
   - Type `build` and select it
   - Type `test` and select it

   **Note:** If these status checks don't appear, you need to run the corresponding GitHub Actions workflows at least once.

### Pull Request Review Configuration

6. **Enable** the checkbox: ☑️ **Require a pull request before merging**

7. This will reveal additional options. Configure them as follows:
   - ☑️ **Require approvals**: Set to **1**
   - ☑️ **Dismiss stale pull request approvals when new commits are pushed**
   - ☑️ **Require review from Code Owners**
   - ☑️ **Require approval of the most recent reviewable push**
   - ☐ **Require conversation resolution before merging** - We'll enable this separately

### Additional Protection Settings

8. **Enable** the checkbox: ☑️ **Require conversation resolution before merging**

9. **Enable** the checkbox: ☑️ **Require linear history**

10. **Enable** the checkbox: ☑️ **Include administrators**
    - This ensures even admins follow the rules

11. **Disable** (keep unchecked): ☐ **Allow force pushes**

12. **Disable** (keep unchecked): ☐ **Allow deletions**

### Save Main Branch Configuration

13. Scroll to the bottom and click **Create** (or **Save changes** if editing existing rule)

14. You should see a success message confirming the rule was created

### Verification Checklist for Main Branch

Verify all these settings are correct:
- [ ] Branch name pattern: `main`
- [ ] Require status checks: ✅ (security-scan, dependency-audit, build, test)
- [ ] Require branches up to date: ✅
- [ ] Require pull request: ✅
- [ ] Required approvals: 1
- [ ] Dismiss stale reviews: ✅
- [ ] Require code owner reviews: ✅
- [ ] Require last push approval: ✅
- [ ] Require conversation resolution: ✅
- [ ] Require linear history: ✅
- [ ] Include administrators: ✅
- [ ] Allow force pushes: ❌
- [ ] Allow deletions: ❌

## Step 3: Configure Develop Branch Protection (MODERATE)

### Check if Develop Branch Exists

1. Before configuring, verify the develop branch exists:
   - Go to the repository's main page
   - Click the branch dropdown (shows "main" by default)
   - Look for "develop" in the list

2. If develop doesn't exist:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

### Create Protection Rule

3. Click **Add branch protection rule** button again

4. In the "Branch name pattern" field, enter: `develop`

### Required Status Checks Configuration

5. **Enable** the checkbox: ☑️ **Require status checks to pass before merging**

6. **Disable** the checkbox: ☐ **Require branches to be up to date before merging**
   - Note: Different from main branch (non-strict)

7. In the search box that appears, add these status checks:
   - Type `security-scan` and select it
   - Type `build` and select it
   - Do NOT add dependency-audit or test (lighter checks for develop)

### Pull Request Review Configuration

8. **Enable** the checkbox: ☑️ **Require a pull request before merging**

9. Configure the review options:
   - ☑️ **Require approvals**: Set to **1**
   - ☑️ **Dismiss stale pull request approvals when new commits are pushed**
   - ☐ **Require review from Code Owners** - Leave unchecked (more flexible)
   - ☐ **Require approval of the most recent reviewable push** - Leave unchecked

### Additional Protection Settings

10. **Enable** the checkbox: ☑️ **Require conversation resolution before merging**

11. **Disable** the checkbox: ☐ **Require linear history**
    - Merge commits allowed on develop

12. **Disable** the checkbox: ☐ **Include administrators**
    - Admins can bypass in emergencies

13. **Disable** (keep unchecked): ☐ **Allow force pushes**

14. **Disable** (keep unchecked): ☐ **Allow deletions**

### Save Develop Branch Configuration

15. Scroll to the bottom and click **Create**

16. Verify the success message appears

### Verification Checklist for Develop Branch

Verify all these settings are correct:
- [ ] Branch name pattern: `develop`
- [ ] Require status checks: ✅ (security-scan, build only)
- [ ] Require branches up to date: ❌ (non-strict)
- [ ] Require pull request: ✅
- [ ] Required approvals: 1
- [ ] Dismiss stale reviews: ✅
- [ ] Require code owner reviews: ❌
- [ ] Require last push approval: ❌
- [ ] Require conversation resolution: ✅
- [ ] Require linear history: ❌
- [ ] Include administrators: ❌
- [ ] Allow force pushes: ❌
- [ ] Allow deletions: ❌

## Step 4: Verify Configuration

### Visual Verification

1. Go to **Settings → Branches**

2. You should see two branch protection rules:
   - `main` - with a green shield icon
   - `develop` - with a green shield icon

3. Click **Edit** on each rule to review settings

### Test Protection with a PR

1. Create a test branch:
   ```bash
   git checkout -b test-branch-protection
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "test: verify branch protection"
   git push -u origin test-branch-protection
   ```

2. Go to GitHub and create a PR to merge into `main`

3. Verify you see:
   - ❌ Status checks must pass (if workflows haven't run)
   - ❌ Review required from code owners
   - ⚠️ Cannot merge until requirements are met

4. Try to merge - it should be blocked

5. Close and delete the test PR/branch

## Step 5: Configure CODEOWNERS

The CODEOWNERS file is already configured in `.github/CODEOWNERS` with the repository owner (@bjpl) as the default owner for all files.

To verify:
1. Go to `.github/CODEOWNERS` in the repository
2. Confirm it contains `* @bjpl`
3. When creating PRs, @bjpl will automatically be requested for review

## Step 6: Set Up Required Status Checks

For the status checks to work, the corresponding GitHub Actions workflows must exist and run successfully at least once.

### Verify Workflows Exist

1. Go to the **Actions** tab in your repository

2. You should see these workflows:
   - Security Scan (CodeQL)
   - CI/CD Pipeline (contains build and test)

### Initial Workflow Run

3. If workflows haven't run yet, trigger them manually:
   - Click on the workflow name
   - Click "Run workflow" dropdown
   - Select the main branch
   - Click "Run workflow"

4. Wait for workflows to complete

5. Once complete, the status checks will be available for branch protection

## Troubleshooting

### Issue: Status checks don't appear in search

**Cause:** Workflows haven't run yet on this repository.

**Solution:**
1. Push a commit to trigger workflows
2. Or manually run workflows from Actions tab
3. After first successful run, checks will appear

### Issue: Cannot save branch protection rule

**Cause:** Insufficient permissions or invalid configuration.

**Solution:**
1. Verify you have admin access
2. Check all required fields are filled
3. Try disabling "Include administrators" temporarily
4. Contact repository owner if needed

### Issue: PRs can still be merged despite protection

**Cause:** Protection rules may not be saved correctly.

**Solution:**
1. Go to Settings → Branches
2. Click Edit on the branch rule
3. Verify all settings are correct
4. Save again
5. Try creating a test PR to verify

### Issue: Code owner reviews not required

**Cause:** CODEOWNERS file not properly configured.

**Solution:**
1. Verify `.github/CODEOWNERS` exists
2. Check file syntax is correct
3. Ensure GitHub usernames are valid (start with @)
4. File must be in `.github/` directory

### Issue: Workflows failing and blocking PRs

**Cause:** New code introduced test failures or security issues.

**Solution:**
1. Fix the failing tests/issues
2. Push new commits to PR
3. Workflows will re-run automatically
4. Merge once all checks pass

## Best Practices

### For Administrators

1. **Review settings quarterly**
   - Ensure protection rules are still appropriate
   - Update as team grows

2. **Monitor override usage**
   - Track when protection is disabled
   - Ensure it's re-enabled immediately

3. **Keep workflows maintained**
   - Update dependencies regularly
   - Fix failing workflows promptly

### For Team Members

1. **Test locally before pushing**
   - Run tests locally: `npm test`
   - Check security: `npm audit`

2. **Keep PRs small**
   - Easier to review
   - Faster to merge

3. **Respond to reviews promptly**
   - Address feedback quickly
   - Keep PRs moving

## Quick Reference Card

Print or bookmark this quick reference:

```
MAIN BRANCH (STRICT)
====================
✅ Status checks (4): security-scan, dependency-audit, build, test
✅ Branches must be up to date (strict mode)
✅ 1 required approval
✅ Code owner review required
✅ Dismiss stale reviews
✅ Require last push approval
✅ Linear history only
✅ Include administrators
✅ Conversation resolution required
❌ No force pushes
❌ No deletions

DEVELOP BRANCH (MODERATE)
=========================
✅ Status checks (2): security-scan, build
❌ Branches don't need to be up to date (non-strict)
✅ 1 required approval
❌ Code owner review not required
✅ Dismiss stale reviews
❌ Last push approval not required
❌ Linear history not required
❌ Administrators can bypass
✅ Conversation resolution required
❌ No force pushes
❌ No deletions
```

## Screenshots Reference

**Note:** GitHub UI may change. As of 2025-11-03, the layout described in this guide is accurate. If you notice differences, refer to GitHub's official documentation.

### Where to find Settings → Branches:

```
Repository Page
  └─ Settings tab (top right)
      └─ Branches (left sidebar, under "Code and automation")
          └─ Branch protection rules section
```

### Branch Protection Rule Form Sections:

```
1. Branch name pattern (text input)
2. Protect matching branches section:
   ├─ Require status checks to pass before merging
   ├─ Require a pull request before merging
   ├─ Require conversation resolution before merging
   ├─ Require signed commits
   ├─ Require linear history
   ├─ Include administrators
   ├─ Allow force pushes
   └─ Allow deletions
3. Create/Save button (bottom)
```

## Support and Documentation

- **GitHub Branch Protection Docs:** https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **CODEOWNERS Docs:** https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- **Status Checks Docs:** https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks

## Completion Checklist

After completing this guide, verify:
- [ ] Main branch has strict protection configured
- [ ] Develop branch has moderate protection configured (if exists)
- [ ] CODEOWNERS file is properly configured
- [ ] GitHub Actions workflows run successfully
- [ ] Test PR was blocked as expected
- [ ] Documentation is updated
- [ ] Team members are notified of new rules

---

**Configuration Complete!** Your repository now has enterprise-grade branch protection. 🎉
