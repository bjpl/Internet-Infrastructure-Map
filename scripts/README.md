# Branch Protection Scripts

This directory contains automation scripts for configuring and verifying GitHub branch protection rules.

## Quick Start

```bash
# 1. Configure branch protection
./scripts/configure-branch-protection.sh

# 2. Verify configuration
./scripts/verify-branch-protection.sh
```

## Prerequisites

### Required
- **GitHub CLI (gh)**: Install from https://cli.github.com/
- **Bash**: Available on Linux, macOS, and Git Bash on Windows
- **Authentication**: Run `gh auth login` before using scripts
- **Admin Access**: You must have admin access to the repository

### Optional
- **jq**: For pretty JSON output in verification script
  - Install: https://stedolan.github.io/jq/

## Scripts Overview

### configure-branch-protection.sh

Automates the configuration of branch protection rules via GitHub API.

**What it does:**
- Configures strict protection for `main` branch
- Configures moderate protection for `develop` branch
- Validates prerequisites before running
- Provides interactive confirmation
- Shows detailed progress and results

**Usage:**
```bash
./scripts/configure-branch-protection.sh
```

**Example Output:**
```
╔════════════════════════════════════════════════════════════════╗
║         GitHub Branch Protection Configuration Script         ║
║                Repository: bjpl/Internet-Infrastructure-Map    ║
╚════════════════════════════════════════════════════════════════╝

[INFO] Checking prerequisites...
[INFO] Prerequisites check passed
[INFO] Verifying repository access...
[INFO] Repository access verified

[WARN] This script will configure branch protection rules for:
  • main branch (STRICT protection)
  • develop branch (MODERATE protection)

Continue? (y/N) y

[INFO] Configuring MAIN branch protection (STRICT)...
[INFO] ✅ Main branch protection configured successfully

[INFO] Configuring DEVELOP branch protection (MODERATE)...
[INFO] ✅ Develop branch protection configured successfully

╔════════════════════════════════════════════════════════════════╗
║                    Configuration Complete                      ║
╚════════════════════════════════════════════════════════════════╝

[INFO] Run ./scripts/verify-branch-protection.sh to verify the configuration
```

### verify-branch-protection.sh

Verifies that branch protection rules are correctly configured.

**What it does:**
- Checks main branch protection settings
- Checks develop branch protection settings
- Verifies required status checks
- Lists all protected branches
- Generates verification summary
- Saves detailed JSON reports to /tmp

**Usage:**
```bash
./scripts/verify-branch-protection.sh
```

**Example Output:**
```
╔════════════════════════════════════════════════════════════════╗
║       GitHub Branch Protection Verification Script            ║
║              Repository: bjpl/Internet-Infrastructure-Map      ║
╚════════════════════════════════════════════════════════════════╝

[INFO] Checking prerequisites...
[INFO] Prerequisites check passed

═══════════════════════════════════════════════════════════════
MAIN BRANCH PROTECTION
═══════════════════════════════════════════════════════════════

[INFO] Fetching main branch protection rules...

Required Status Checks:
{
  "strict": true,
  "contexts": [
    "security-scan",
    "dependency-audit",
    "build",
    "test"
  ]
}

Pull Request Reviews:
{
  "required_approving_review_count": 1,
  "dismiss_stale_reviews": true,
  "require_code_owner_reviews": true,
  "require_last_push_approval": true
}

[INFO] ✅ Main branch protection rules retrieved

═══════════════════════════════════════════════════════════════
VERIFICATION SUMMARY
═══════════════════════════════════════════════════════════════

Repository: bjpl/Internet-Infrastructure-Map
Verification Date: 2025-11-03 14:30:45

✅ Main branch protection: CONFIGURED
✅ Develop branch protection: CONFIGURED

[INFO] Full JSON reports saved to /tmp/main-protection.json and /tmp/develop-protection.json

╔════════════════════════════════════════════════════════════════╗
║                  Verification Complete                         ║
╚════════════════════════════════════════════════════════════════╝
```

## Branch Protection Rules

### Main Branch (STRICT)

| Setting | Value |
|---------|-------|
| Required Status Checks | security-scan, dependency-audit, build, test |
| Strict Mode | Yes - branches must be up to date |
| Required Approvals | 1 |
| Code Owner Review | Required |
| Dismiss Stale Reviews | Yes |
| Last Push Approval | Required |
| Linear History | Required |
| Enforce Admins | Yes |
| Force Pushes | Blocked |
| Branch Deletion | Blocked |
| Conversation Resolution | Required |

### Develop Branch (MODERATE)

| Setting | Value |
|---------|-------|
| Required Status Checks | security-scan, build |
| Strict Mode | No - branches don't need to be up to date |
| Required Approvals | 1 |
| Code Owner Review | Not required |
| Dismiss Stale Reviews | Yes |
| Last Push Approval | Not required |
| Linear History | Not required |
| Enforce Admins | No - admins can bypass |
| Force Pushes | Blocked |
| Branch Deletion | Blocked |
| Conversation Resolution | Required |

## Troubleshooting

### Error: GitHub CLI not found

**Solution:**
```bash
# Install GitHub CLI
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
# Download from https://cli.github.com/ or use: winget install --id GitHub.cli
```

### Error: Not authenticated

**Solution:**
```bash
gh auth login
# Follow the prompts to authenticate
```

### Error: Permission denied

**Cause:** You don't have admin access to the repository.

**Solution:**
1. Contact repository owner (@bjpl)
2. Request admin access
3. Or use manual configuration: See `docs/security/MANUAL_BRANCH_PROTECTION_STEPS.md`

### Error: Develop branch not found

**Solution:**
```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Run configuration script again
./scripts/configure-branch-protection.sh
```

### Error: Status checks not found

**Cause:** GitHub Actions workflows haven't run yet.

**Solution:**
1. Go to repository Actions tab
2. Manually trigger workflows
3. Wait for successful completion
4. Run configuration script again

## Manual Configuration

If scripts cannot be used, follow the detailed manual guide:

See: `docs/security/MANUAL_BRANCH_PROTECTION_STEPS.md`

## Updating Protection Rules

### Method 1: Edit Script and Re-run

1. Edit `configure-branch-protection.sh`
2. Modify the JSON payload in the relevant section
3. Run the script: `./scripts/configure-branch-protection.sh`
4. Verify: `./scripts/verify-branch-protection.sh`

### Method 2: GitHub UI

1. Go to repository Settings → Branches
2. Click Edit on the branch protection rule
3. Modify settings
4. Save changes

### Method 3: GitHub API

```bash
# Example: Add a new required status check
gh api repos/bjpl/Internet-Infrastructure-Map/branches/main/protection \
  --method PUT \
  --input modified-config.json
```

## Emergency Override

### When Override is Necessary
- Critical security vulnerability requiring immediate fix
- Production outage
- Broken build blocking all development

### Override Process

```bash
# 1. Document emergency (create incident ticket)

# 2. Temporarily disable protection
gh api repos/bjpl/Internet-Infrastructure-Map/branches/main/protection \
  --method DELETE

# 3. Apply emergency fix
git push origin main

# 4. Re-enable protection immediately
./scripts/configure-branch-protection.sh

# 5. Create follow-up PR with proper review
# 6. Document what happened
```

## Best Practices

### For Script Usage
1. **Always verify after configuring**
   ```bash
   ./scripts/configure-branch-protection.sh && ./scripts/verify-branch-protection.sh
   ```

2. **Keep scripts in version control**
   - Track changes to protection rules
   - Document reasons for changes

3. **Test in non-production first**
   - Try on test repository
   - Verify expected behavior

### For Development Workflow
1. **Never bypass protection casually**
   - Follow the process
   - Get proper approvals

2. **Keep CI/CD workflows maintained**
   - Fix failing workflows promptly
   - Update dependencies regularly

3. **Review protection rules regularly**
   - Quarterly reviews
   - Adjust as team grows

## Security Considerations

### Script Security
- Scripts use GitHub CLI for authentication
- No credentials stored in scripts
- All API calls are logged by GitHub

### Protection Security
- Enforce admins enabled on main
- Code owner reviews required
- All changes require PR and review
- Force pushes blocked

### Audit Trail
- All protection changes logged in GitHub audit log
- All commits tracked with author info
- All PR approvals recorded

## Additional Resources

### Documentation
- [BRANCH_PROTECTION_CONFIGURED.md](../docs/security/BRANCH_PROTECTION_CONFIGURED.md) - Detailed configuration documentation
- [MANUAL_BRANCH_PROTECTION_STEPS.md](../docs/security/MANUAL_BRANCH_PROTECTION_STEPS.md) - Step-by-step manual guide

### GitHub Documentation
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub CLI](https://cli.github.com/manual/)

### Support
- Repository Issues: https://github.com/bjpl/Internet-Infrastructure-Map/issues
- GitHub CLI Issues: https://github.com/cli/cli/issues

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-03 | Initial release with main and develop branch protection |

## License

These scripts are part of the Internet-Infrastructure-Map repository and follow the same license.

---

**Questions or Issues?** Check the troubleshooting section or refer to the detailed documentation in `docs/security/`.
