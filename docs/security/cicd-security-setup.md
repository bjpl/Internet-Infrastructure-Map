# CI/CD Security Automation Setup

## Overview

This document describes the comprehensive security automation implemented for this project through GitHub Actions, Dependabot, and pre-commit hooks.

## Security Workflows

### 1. Security Scanning Workflow (`.github/workflows/security.yml`)

Runs comprehensive security scans on every push, pull request, and daily at 2 AM UTC.

#### Components:

**A. Dependency Audit (`dependency-audit`)**
- Runs `npm audit` to identify vulnerabilities
- Fails builds on high/critical severity issues
- Posts audit results as PR comments
- Uploads detailed audit reports as artifacts

**B. Secret Scanning (`secret-scanning`)**
- **TruffleHog**: Detects secrets, API keys, tokens
- **GitLeaks**: Additional secret pattern detection
- Scans entire repository history
- Prevents accidental credential commits

**C. SAST - Static Application Security Testing**
- **CodeQL**: Advanced semantic code analysis
  - Queries: `security-extended`, `security-and-quality`
  - Detects: SQL injection, XSS, command injection, etc.
  - Uploads results to GitHub Security tab

- **Semgrep**: Fast, configurable SAST
  - Auto-detects security patterns
  - Language-specific security rules
  - Generates SARIF reports for GitHub

**D. License Compliance (`license-compliance`)**
- Scans all dependency licenses
- Fails on forbidden licenses (GPL-2.0, GPL-3.0, AGPL)
- Generates license distribution reports
- Posts summary in PR comments

**E. Dependency Review (`dependency-review`)**
- Reviews new dependencies in PRs
- Checks for known vulnerabilities
- Validates license compatibility
- Automatic approval for safe updates

#### Triggering Events:
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:       # Manual trigger
```

### 2. Dependabot Configuration (`.github/dependabot.yml`)

Automated dependency updates with security focus.

#### Update Schedule:
- **Frequency**: Weekly (Mondays at 9 AM ET)
- **npm packages**: Up to 10 concurrent PRs
- **GitHub Actions**: Up to 5 concurrent PRs
- **Docker images**: Up to 3 concurrent PRs

#### Grouping Strategy:
```yaml
groups:
  patch-updates:      # All patch updates together
    update-types: ["patch"]

  minor-updates:      # All minor updates together
    update-types: ["minor"]

  development-dependencies:  # Dev deps bundled
    dependency-type: "development"
```

#### Auto-merge Rules:
- **Patch updates**: Auto-approved and merged
- **Minor updates**: Auto-approved, manual merge
- **Major updates**: Manual review required

### 3. Dependabot Auto-Merge (`.github/workflows/auto-merge-dependabot.yml`)

Automatically handles safe Dependabot PRs.

#### Workflow:
1. Identifies Dependabot PRs
2. Extracts update metadata
3. Waits for all status checks
4. Auto-approves patch/minor updates
5. Auto-merges patch updates
6. Comments on major updates requiring review

#### Safety Checks:
- All CI tests must pass
- Security scans must succeed
- No merge conflicts
- Branch protection rules enforced

## Pre-Commit Hooks

Located in `.husky/` directory, these hooks run locally before commits/pushes.

### Pre-Commit Hook (`.husky/pre-commit`)

Runs before every commit:

1. **Secret Scanning**
   - GitLeaks scan on staged files
   - Blocks commits with detected secrets

2. **Sensitive File Detection**
   - Pattern matching: `.env`, `.pem`, `.key`, `credentials`
   - Prevents accidental sensitive file commits

3. **Hardcoded Secret Detection**
   - Regex patterns for `password=`, `api_key=`, etc.
   - Enforces environment variable usage

4. **File Size Check**
   - Maximum 5MB per file
   - Prevents large binary/data file commits

5. **Security TODO Detection**
   - Warns on security-related TODOs
   - Encourages issue tracking

### Pre-Push Hook (`.husky/pre-push`)

Runs before pushing to remote:

1. **Full Test Suite**
   - Runs all tests including security tests
   - Blocks push on test failures

2. **Security Audit**
   - `npm audit --audit-level=high`
   - Prevents pushing with known vulnerabilities

3. **Merge Conflict Check**
   - Detects conflict markers
   - Ensures clean code

4. **Debug Code Detection**
   - Warns on `console.log`, `debugger`, etc.
   - Optional bypass with confirmation

## Installation & Setup

### 1. Install Husky

```bash
npm install --save-dev husky
npx husky install
```

### 2. Make Hooks Executable

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### 3. Install GitLeaks (Optional but Recommended)

**macOS:**
```bash
brew install gitleaks
```

**Linux:**
```bash
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Windows:**
```bash
choco install gitleaks
```

### 4. Configure Branch Protection

Navigate to: **Settings > Branches > Add Rule**

## Branch Protection Rules

### Required Protections for `main` and `develop`:

#### Status Checks
- ✅ **Require status checks to pass before merging**
  - `dependency-audit`
  - `secret-scanning`
  - `sast-codeql`
  - `sast-semgrep`
  - `license-compliance`

#### Code Review
- ✅ **Require pull request reviews before merging**
  - Required approvals: **1** (minimum)
  - Dismiss stale reviews on new commits
  - Require review from code owners

#### Additional Protections
- ✅ **Require signed commits** (recommended)
- ✅ **Require linear history**
- ✅ **Include administrators** in restrictions
- ✅ **Do not allow bypassing the above settings**

#### Merge Restrictions
- ❌ **Prevent force pushes**
- ❌ **Prevent deletion**
- ✅ **Require conversation resolution before merging**

### Branch Protection Configuration Details:

```yaml
Branch Protection Settings:
  Branch name pattern: main

  Protect matching branches:
    ☑ Require pull request before merging
      Required approvals: 1
      ☑ Dismiss stale pull request approvals when new commits are pushed
      ☑ Require review from Code Owners
      ☑ Require approval of the most recent reviewable push

    ☑ Require status checks to pass before merging
      ☑ Require branches to be up to date before merging
      Status checks required:
        - dependency-audit
        - secret-scanning / TruffleHog Secret Scan
        - secret-scanning / GitLeaks Secret Scan
        - sast-codeql / CodeQL SAST Analysis (javascript)
        - sast-semgrep / Semgrep SAST
        - license-compliance / License Compliance Check

    ☑ Require conversation resolution before merging
    ☑ Require signed commits
    ☑ Require linear history
    ☑ Do not allow bypassing the above settings

    Rules applied to administrators:
      ☑ Include administrators

    Restrictions:
      ☐ Allow force pushes: Nobody
      ☐ Allow deletions: Nobody
```

## Security Scan Results

### Where to Find Results:

1. **GitHub Security Tab**
   - Navigate to: `Security > Code scanning alerts`
   - View: CodeQL and Semgrep findings
   - Track: Alert status and remediation

2. **Pull Request Comments**
   - Automatic comments with:
     - Dependency audit summary
     - License compliance report
     - Vulnerability counts

3. **Workflow Artifacts**
   - `npm-audit-results`: Detailed vulnerability data
   - `semgrep-results`: SAST findings
   - `license-report`: Full license analysis

4. **Workflow Logs**
   - Complete scan output
   - Debug information
   - Error traces

## Handling Security Issues

### High/Critical Vulnerabilities

1. **Review the Alert**
   - Check severity and exploitability
   - Understand the vulnerable code path

2. **Immediate Actions**
   ```bash
   # Run audit to see details
   npm audit

   # Try automatic fix
   npm audit fix

   # For unfixable issues
   npm audit fix --force  # Use cautiously
   ```

3. **Manual Remediation**
   - Update to patched version
   - Find alternative packages
   - Implement workarounds
   - Document exceptions if necessary

### Secret Leaks

1. **Immediate Rotation**
   - Rotate exposed credentials immediately
   - Revoke compromised API keys
   - Update all systems using the secret

2. **Clean Git History**
   ```bash
   # For recent commits (not pushed)
   git reset --soft HEAD~1
   git reset HEAD <file>

   # For historical commits
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch PATH-TO-FILE" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Prevent Future Leaks**
   - Add pattern to `.gitignore`
   - Update pre-commit hooks
   - Team training

### License Violations

1. **Assess Impact**
   - Review license terms
   - Consult legal if necessary
   - Document decisions

2. **Remediation Options**
   - Replace with compatible library
   - Obtain proper licensing
   - Remove functionality
   - Implement in-house alternative

## Monitoring & Maintenance

### Weekly Tasks
- ✅ Review Dependabot PRs
- ✅ Address security alerts
- ✅ Update ignored vulnerabilities list

### Monthly Tasks
- ✅ Audit license compliance
- ✅ Review branch protection rules
- ✅ Update security tooling
- ✅ Team security training

### Quarterly Tasks
- ✅ Security policy review
- ✅ Incident response drill
- ✅ Third-party security audit
- ✅ Update threat model

## Metrics & Reporting

### Key Performance Indicators:

1. **Mean Time to Remediate (MTTR)**
   - Target: < 7 days for high severity
   - Target: < 24 hours for critical

2. **Security Debt**
   - Track open security issues
   - Measure age of vulnerabilities

3. **Coverage Metrics**
   - % of dependencies with known issues
   - % of code covered by SAST
   - Secret detection false positive rate

4. **Compliance Metrics**
   - Branch protection compliance
   - Policy violation rate
   - Security training completion

## Troubleshooting

### Common Issues:

**1. GitLeaks False Positives**
```bash
# Add to .gitleaksignore
some-file-with-false-positive.txt:line-number
```

**2. Dependabot PR Conflicts**
```bash
# Update Dependabot PR
@dependabot rebase

# Recreate PR
@dependabot recreate
```

**3. CodeQL Timeout**
- Reduce code complexity
- Increase runner resources
- Split into multiple jobs

**4. Pre-commit Hook Issues**
```bash
# Bypass hooks (emergency only)
git commit --no-verify

# Update hooks
npx husky install
chmod +x .husky/*
```

## Security Contacts

- **Security Team**: security@example.com
- **Incident Response**: incident-response@example.com
- **Vulnerability Disclosure**: security-disclosures@example.com

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Semgrep Rules](https://semgrep.dev/explore)

---

**Last Updated**: 2025-11-03
**Document Owner**: DevSecOps Team
**Review Cycle**: Quarterly
