# Branch Protection Configuration Documentation

**Repository:** Internet-Infrastructure-Map
**Owner:** bjpl
**Last Updated:** 2025-11-03
**Status:** Ready for Configuration

## Overview

This document details the branch protection rules configured for the repository to ensure code quality, security, and proper review processes.

## Branch Protection Rules

### Main Branch (STRICT Protection)

The `main` branch has the highest level of protection to ensure production stability.

#### Configuration Details

| Setting | Value | Description |
|---------|-------|-------------|
| **Required Status Checks** | Enabled (Strict) | All checks must pass before merging |
| **Status Check Contexts** | security-scan, dependency-audit, build, test | Four mandatory automated checks |
| **Enforce Admins** | Yes | Even admins must follow the rules |
| **Required Reviews** | 1 approval | At least one approving review required |
| **Dismiss Stale Reviews** | Yes | Reviews dismissed on new commits |
| **Require Code Owner Review** | Yes | CODEOWNERS must approve changes |
| **Require Last Push Approval** | Yes | Prevents self-approval after changes |
| **Required Linear History** | Yes | No merge commits, rebase only |
| **Allow Force Pushes** | No | Prevents history rewriting |
| **Allow Deletions** | No | Branch cannot be deleted |
| **Conversation Resolution** | Required | All PR comments must be resolved |
| **Fork Syncing** | Allowed | Forks can sync from upstream |

#### Required Status Checks

1. **security-scan**: SAST scanning with CodeQL
2. **dependency-audit**: Dependency vulnerability scanning
3. **build**: Project build verification
4. **test**: Automated test suite execution

### Develop Branch (MODERATE Protection)

The `develop` branch has moderate protection for active development.

#### Configuration Details

| Setting | Value | Description |
|---------|-------|-------------|
| **Required Status Checks** | Enabled (Non-strict) | Checks required but not strict |
| **Status Check Contexts** | security-scan, build | Two mandatory checks |
| **Enforce Admins** | No | Admins can bypass in emergencies |
| **Required Reviews** | 1 approval | At least one approving review |
| **Dismiss Stale Reviews** | Yes | Reviews dismissed on new commits |
| **Require Code Owner Review** | No | Any team member can approve |
| **Required Linear History** | No | Merge commits allowed |
| **Allow Force Pushes** | No | Prevents history rewriting |
| **Allow Deletions** | No | Branch cannot be deleted |
| **Conversation Resolution** | Required | All PR comments must be resolved |

## Configuration Scripts

### Automated Configuration

Use the provided script to configure branch protection via GitHub CLI:

```bash
# Navigate to repository root
cd /path/to/Internet-Infrastructure-Map

# Make script executable
chmod +x scripts/configure-branch-protection.sh

# Run configuration script
./scripts/configure-branch-protection.sh
```

**Prerequisites:**
- GitHub CLI installed and authenticated (`gh auth login`)
- Repository admin access
- Internet connection

### Verification

Verify the configuration was applied correctly:

```bash
# Make verification script executable
chmod +x scripts/verify-branch-protection.sh

# Run verification script
./scripts/verify-branch-protection.sh
```

The verification script will:
- Check main branch protection settings
- Check develop branch protection settings
- Verify required status checks
- List all protected branches
- Generate a summary report

## Manual Configuration Steps

If you prefer manual configuration or the script fails, see [MANUAL_BRANCH_PROTECTION_STEPS.md](./MANUAL_BRANCH_PROTECTION_STEPS.md) for detailed GitHub UI instructions.

## Emergency Override Procedures

### When Override is Necessary

Branch protection can be temporarily bypassed in true emergencies:
- Critical security vulnerability requiring immediate hotfix
- Production outage requiring urgent fix
- Broken build blocking all development

### Override Process

1. **Document the Emergency**
   - Create incident ticket
   - Document reason for override
   - Get stakeholder approval

2. **Perform Override**
   - Admin temporarily disables branch protection
   - Apply critical fix
   - Re-enable protection immediately

3. **Post-Emergency**
   - Create follow-up PR with proper review
   - Document what happened
   - Conduct post-mortem

### Override Command (Admins Only)

```bash
# Temporarily disable protection
gh api repos/bjpl/Internet-Infrastructure-Map/branches/main/protection \
  --method DELETE

# Apply emergency fix
git push origin main

# Re-enable protection
./scripts/configure-branch-protection.sh
```

## Updating Protection Rules

### Via Script

1. Edit `scripts/configure-branch-protection.sh`
2. Modify the JSON payload for desired settings
3. Run the script to apply changes
4. Verify with verification script

### Via GitHub UI

1. Navigate to repository Settings → Branches
2. Click "Edit" on the branch protection rule
3. Modify settings as needed
4. Click "Save changes"

## Status Check Integration

### GitHub Actions Workflows

The required status checks correspond to GitHub Actions workflows:

| Status Check | Workflow File | Purpose |
|--------------|---------------|---------|
| security-scan | `.github/workflows/security.yml` | CodeQL security scanning |
| dependency-audit | `.github/workflows/security.yml` | Dependency vulnerability check |
| build | `.github/workflows/ci.yml` | Build verification |
| test | `.github/workflows/ci.yml` | Test suite execution |

### Adding New Status Checks

1. Create/modify GitHub Actions workflow
2. Update branch protection configuration
3. Test the workflow runs successfully
4. Update this documentation

## Code Owners

The repository uses CODEOWNERS to enforce specific reviewers for certain files. See `.github/CODEOWNERS` for details.

**Current Code Owners:**
- All files: @bjpl (repository owner)
- Security files: @bjpl
- CI/CD files: @bjpl
- Documentation: @bjpl

## Troubleshooting

### Common Issues

#### Issue: Status checks failing

**Solution:**
1. Check GitHub Actions tab for workflow failures
2. Review workflow logs for specific errors
3. Fix the underlying issue
4. Re-run failed checks

#### Issue: Cannot merge due to stale reviews

**Solution:**
1. Request fresh review from code owner
2. Address any new feedback
3. Merge once approved

#### Issue: Script fails with permission error

**Solution:**
1. Verify GitHub CLI authentication: `gh auth status`
2. Ensure you have admin access to repository
3. Re-authenticate if needed: `gh auth login`

#### Issue: Develop branch doesn't exist

**Solution:**
1. Create develop branch: `git checkout -b develop`
2. Push to remote: `git push -u origin develop`
3. Run configuration script again

## Best Practices

### For Developers

1. **Always work in feature branches**
   - Never commit directly to main or develop
   - Use descriptive branch names

2. **Keep PRs small and focused**
   - Easier to review
   - Faster to merge
   - Reduces merge conflicts

3. **Write clear PR descriptions**
   - Explain what and why
   - Link related issues
   - Add testing notes

4. **Respond to review feedback promptly**
   - Address all comments
   - Resolve conversations
   - Request re-review

### For Reviewers

1. **Review thoroughly but efficiently**
   - Check for security issues
   - Verify tests are adequate
   - Ensure code quality

2. **Provide constructive feedback**
   - Be specific about issues
   - Suggest improvements
   - Approve when satisfied

3. **Use the review tools effectively**
   - Request changes for blockers
   - Comment for suggestions
   - Approve when ready

## Compliance and Audit

### Audit Trail

GitHub maintains a complete audit trail of:
- All commits and their authors
- All PR reviews and approvals
- All status check results
- All override actions

### Compliance Reports

Generate compliance reports using GitHub CLI:

```bash
# List all PRs merged to main in last 30 days
gh pr list --state merged --base main --limit 100

# Check who has admin access
gh api repos/bjpl/Internet-Infrastructure-Map/collaborators | jq '.[] | select(.permissions.admin == true)'
```

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-03 | Initial branch protection configuration | System Architect |

## Support

For issues or questions about branch protection:
1. Check this documentation
2. Review troubleshooting section
3. Check GitHub documentation
4. Contact repository administrators
