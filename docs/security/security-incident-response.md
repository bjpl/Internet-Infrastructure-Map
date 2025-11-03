# Security Incident Response Plan

## Overview

This document outlines procedures for responding to security incidents detected by our CI/CD security automation.

## Incident Classification

### Severity Levels

**Critical (P0)**
- Active exploit in progress
- Data breach confirmed
- Exposed credentials with active usage
- System compromise
- **Response Time**: Immediate (< 15 minutes)

**High (P1)**
- Critical vulnerability in production
- Secret leak in git history
- Privilege escalation vulnerability
- Authentication bypass
- **Response Time**: < 2 hours

**Medium (P2)**
- High severity dependency vulnerability
- License compliance violation
- SAST findings with exploitable conditions
- **Response Time**: < 24 hours

**Low (P3)**
- Informational security findings
- Minor dependency vulnerabilities
- Code quality issues with security implications
- **Response Time**: < 1 week

## Incident Response Workflow

### 1. Detection and Alerting

**Automated Detection:**
- GitHub Actions security workflow failures
- Dependabot security alerts
- CodeQL findings
- Secret scanning alerts
- Pre-commit hook violations

**Alert Channels:**
- GitHub Security tab notifications
- Email alerts (configured team members)
- Slack/Teams integration (if configured)
- PR comments and blocks

### 2. Initial Assessment (< 15 minutes)

**Incident Commander Actions:**

1. **Acknowledge the alert**
   ```bash
   # Document in incident tracking system
   INCIDENT_ID=$(date +%Y%m%d-%H%M%S)
   echo "Incident $INCIDENT_ID acknowledged by $(git config user.name)" >> incidents.log
   ```

2. **Determine severity** using classification above

3. **Assemble response team**
   - Security Engineer
   - System Administrator
   - Development Lead
   - Product Owner (for Critical/High)

4. **Create incident channel**
   - Dedicated Slack/Teams channel
   - Document all communications
   - Record all actions taken

### 3. Containment (Immediate for Critical/High)

#### For Secret Leaks:

**Step 1: Immediate Rotation**
```bash
# Revoke compromised credentials immediately
# AWS
aws iam delete-access-key --access-key-id AKIA...

# GitHub
gh auth refresh -s delete_repo

# Database
mysql -e "REVOKE ALL PRIVILEGES ON *.* FROM 'user'@'host';"

# API Keys - via provider console
# Document old and new values in secure vault
```

**Step 2: Assess Exposure**
```bash
# Check git history
git log --all --full-history -- "*secret*"

# Check if pushed to remote
git log --remotes --oneline | grep "<commit-hash>"

# Check access logs for usage
grep "LEAKED_KEY" /var/log/app/*.log
```

**Step 3: Clean Git History**
```bash
# For unpushed commits
git reset --soft HEAD~1
git reset HEAD <file-with-secret>

# For pushed commits - use BFG Repo-Cleaner
java -jar bfg.jar --delete-files sensitive.env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (coordinate with team!)
git push --force --all
git push --force --tags
```

**Step 4: Notify Affected Systems**
- Update all systems using the credential
- Verify rotation successful
- Monitor for unauthorized access attempts

#### For Dependency Vulnerabilities:

**Step 1: Assess Risk**
```bash
# Get vulnerability details
npm audit --json | jq '.vulnerabilities'

# Check if vulnerable code path is used
grep -r "vulnerable-function" src/

# Determine exploitability
# - Is it in production?
# - Is the vulnerable code path reachable?
# - Are there mitigating controls?
```

**Step 2: Immediate Mitigation**
```bash
# Try automatic fix
npm audit fix

# If not fixable, try force update
npm audit fix --force

# If still not fixable, consider:
# 1. Update to patched version manually
# 2. Find alternative package
# 3. Apply workaround patch
# 4. Temporary WAF rule to block exploit
```

**Step 3: Deploy Fix**
```bash
# Create hotfix branch
git checkout -b hotfix/CVE-2024-XXXXX

# Make fix
npm install package@safe-version

# Test thoroughly
npm test
npm run integration-test

# Deploy urgently
git commit -m "fix(security): patch CVE-2024-XXXXX"
git push origin hotfix/CVE-2024-XXXXX

# Emergency merge process
# (may bypass some branch protections with documented justification)
```

#### For Active Exploits:

**Step 1: Immediate Response**
```bash
# Block attack at WAF/firewall
# Add IP to blocklist
iptables -A INPUT -s ATTACKER_IP -j DROP

# Isolate affected systems
# Take offline if necessary
systemctl stop application

# Enable additional logging
export DEBUG=true
tail -f /var/log/app/security.log
```

**Step 2: Evidence Collection**
```bash
# Capture system state
ps aux > incident-$INCIDENT_ID-processes.txt
netstat -tulpn > incident-$INCIDENT_ID-network.txt
ls -laR /var/www > incident-$INCIDENT_ID-files.txt

# Copy logs before rotation
cp -r /var/log/app incident-$INCIDENT_ID-logs/

# Memory dump if needed (for forensics)
gcore <PID>
```

**Step 3: Restore Safe State**
```bash
# Restore from last known good backup
# Verify backup integrity first
sha256sum backup.tar.gz

# Restore
tar -xzf backup.tar.gz -C /var/www/

# Verify integrity
diff -r /var/www/ backup-reference/

# Restart services
systemctl start application

# Monitor closely
watch -n 5 'systemctl status application'
```

### 4. Eradication

**Root Cause Analysis:**
1. How did the vulnerability enter the system?
2. Why didn't existing controls prevent it?
3. What process gaps exist?
4. What technical controls were missing?

**Implement Permanent Fix:**
```bash
# Update dependencies
npm update

# Apply code fixes
git commit -m "fix(security): permanent fix for CVE-2024-XXXXX"

# Update security controls
# - Add to pre-commit hooks
# - Update SAST rules
# - Add regression test
```

**Verify Fix:**
```bash
# Run security scans
npm audit
semgrep scan --config auto
codeql analyze

# Manual verification
# Test exploit no longer works

# Peer review
gh pr create --title "Security fix: CVE-2024-XXXXX"
```

### 5. Recovery

**Step 1: Gradual Restoration**
```bash
# Deploy to staging first
gh workflow run deploy.yml -f environment=staging

# Smoke tests
curl -f https://staging.example.com/health

# Security verification
nmap -sV staging.example.com
```

**Step 2: Production Deployment**
```bash
# Deploy to production
gh workflow run deploy.yml -f environment=production

# Monitor closely
# - Error rates
# - Security logs
# - Performance metrics

# Gradual rollout if possible
# - 10% traffic
# - 50% traffic
# - 100% traffic
```

**Step 3: Verification**
```bash
# Confirm fix in production
npm audit --audit-level=high

# Verify no unauthorized access
grep "401\|403" /var/log/nginx/access.log

# Check security posture
gh security-analysis list
```

### 6. Post-Incident Review

**Within 48 Hours:**

1. **Incident Timeline Documentation**
   ```markdown
   ## Incident Timeline: $INCIDENT_ID

   - **Detection**: 2025-11-03 14:32 UTC - CodeQL alert
   - **Assessment**: 2025-11-03 14:35 UTC - Severity: High
   - **Containment**: 2025-11-03 14:45 UTC - Rotated credentials
   - **Eradication**: 2025-11-03 15:20 UTC - Deployed patch
   - **Recovery**: 2025-11-03 16:00 UTC - Full restoration
   - **Resolution**: 2025-11-03 16:30 UTC - Verified secure
   ```

2. **Root Cause Analysis**
   - Primary cause
   - Contributing factors
   - Why existing controls failed

3. **Action Items**
   - Technical improvements
   - Process improvements
   - Training needs
   - Policy updates

4. **Lessons Learned**
   - What went well
   - What could be improved
   - Knowledge sharing

**Template: Post-Incident Report**
```markdown
# Security Incident Report: $INCIDENT_ID

## Executive Summary
[Brief description of incident and resolution]

## Incident Details
- **Date/Time**: 2025-11-03 14:32 UTC
- **Severity**: High (P1)
- **Type**: Secret Leak / Vulnerability / Exploit
- **Detection Method**: GitHub Actions / Dependabot / Manual
- **Systems Affected**: [List]
- **Data Compromised**: None / [Details]

## Timeline
[Detailed chronological account]

## Root Cause
[Technical explanation]

## Resolution
[How it was fixed]

## Prevention Measures
[What we're doing to prevent recurrence]

## Action Items
- [ ] Technical: [Description] - Owner: @user - Due: Date
- [ ] Process: [Description] - Owner: @user - Due: Date
- [ ] Training: [Description] - Owner: @user - Due: Date

## Estimated Impact
- **Downtime**: X minutes
- **Data Exposure**: None / Limited / Extensive
- **Cost**: $X (if applicable)
- **Reputational**: Low / Medium / High

## Signatures
- Incident Commander: [Name]
- Security Lead: [Name]
- Engineering Lead: [Name]
- Date: 2025-11-03
```

## Communication Templates

### Internal Alert (Critical/High)

```
🚨 SECURITY INCIDENT ALERT

Severity: [CRITICAL/HIGH]
Incident ID: $INCIDENT_ID
Detected: [Time]

Issue: [Brief description]

Actions Required:
- Do not push to main/develop
- Do not deploy until cleared
- Join incident channel: #incident-$INCIDENT_ID

Incident Commander: @username
Status: Investigating / Contained / Resolved
```

### Customer Communication (if necessary)

```
Subject: Security Update - [Brief Description]

Dear [Customer],

We are writing to inform you of a security issue that may have
affected your account.

What Happened:
[Clear, non-technical explanation]

What We've Done:
[Actions taken to resolve]

What You Should Do:
[Required customer actions, if any]

How We're Preventing This:
[Improvements implemented]

Questions:
Contact security@example.com

We apologize for any concern this may cause.

Sincerely,
[Company] Security Team
```

## Escalation Paths

### P0 (Critical)
1. Security Engineer (immediate)
2. CTO / Security Director (< 15 min)
3. CEO (< 30 min)
4. Legal / PR (< 1 hour)

### P1 (High)
1. Security Engineer (immediate)
2. Engineering Manager (< 30 min)
3. CTO (< 2 hours)

### P2 (Medium)
1. Security Engineer (< 2 hours)
2. Engineering Manager (< 4 hours)

### P3 (Low)
1. Security Engineer (< 1 day)
2. Track in backlog for resolution

## Contact Information

**Security Team**
- Email: security@example.com
- Slack: #security-team
- On-call: +1-XXX-XXX-XXXX

**Incident Commander Rotation**
- Week 1: @user1
- Week 2: @user2
- Week 3: @user3

**External Resources**
- GitHub Support: https://support.github.com
- Security Vendor: [Contact info]
- Legal Counsel: [Contact info]

## Tools and Resources

**Incident Management:**
- Incident tracker: [URL]
- Runbooks: [URL]
- Playbooks: [URL]

**Security Tools:**
- GitHub Security: https://github.com/org/repo/security
- Dependabot: https://github.com/org/repo/security/dependabot
- CodeQL: https://github.com/org/repo/security/code-scanning
- Secret scanning: https://github.com/org/repo/security/secret-scanning

**Monitoring:**
- Application logs: [URL]
- Security logs: [URL]
- Metrics: [URL]

## Testing and Drills

**Quarterly Security Drills:**
- Simulated secret leak
- Simulated vulnerability disclosure
- Simulated active exploit

**Annual Tabletop Exercises:**
- Full incident response simulation
- Cross-team coordination practice
- Communication plan testing

---

**Last Updated**: 2025-11-03
**Owner**: Security Team
**Review Cycle**: Quarterly
**Next Review**: 2025-02-03
