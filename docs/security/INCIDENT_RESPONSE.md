# Security Incident Response Plan

> **Comprehensive procedures for handling security incidents in Internet Infrastructure Map**

**Last Updated:** November 3, 2025
**Version:** 2.0
**Classification:** Internal Use

---

## Table of Contents

- [Overview](#overview)
- [Incident Classification](#incident-classification)
- [Response Team](#response-team)
- [Response Procedures](#response-procedures)
- [Incident Types](#incident-types)
- [Communication Plan](#communication-plan)
- [Post-Incident Activities](#post-incident-activities)
- [Appendices](#appendices)

---

## Overview

This Incident Response Plan defines procedures for detecting, responding to, and recovering from security incidents affecting the Internet Infrastructure Map application.

### Objectives

1. **Detect** incidents quickly and accurately
2. **Contain** threats to prevent further damage
3. **Eradicate** root causes from the environment
4. **Recover** systems to normal operations
5. **Learn** from incidents to improve security

### Scope

This plan covers:
- Web application security incidents
- API compromises and abuse
- Data breaches or unauthorized access
- Infrastructure compromises
- Third-party service incidents
- Supply chain attacks (dependency compromises)

---

## Incident Classification

### Severity Levels

#### Critical (P0)
**Response Time:** Immediate (15 minutes)
**Escalation:** All hands on deck

**Examples:**
- Active data breach with user data exposed
- Complete service compromise
- Ransomware or destructive attack
- Multiple systems compromised
- Active exploitation of zero-day vulnerability

**Actions:**
- Immediate notification to all response team members
- Isolate affected systems
- Engage external incident response if needed
- Prepare for public disclosure

#### High (P1)
**Response Time:** 1 hour
**Escalation:** Security team + on-call engineer

**Examples:**
- Unauthorized access to administrative systems
- API key compromise
- Successful injection attack
- Partial data exposure
- Denial of service attack

**Actions:**
- Notify security team and project maintainers
- Begin investigation immediately
- Contain threat
- Rotate credentials

#### Medium (P2)
**Response Time:** 4 hours
**Escalation:** Security team

**Examples:**
- Failed attack attempts (logged)
- Vulnerable dependency discovered
- Security misconfiguration found
- Suspicious access patterns
- Rate limiting triggered repeatedly

**Actions:**
- Document incident
- Investigate root cause
- Apply patches/fixes
- Monitor for escalation

#### Low (P3)
**Response Time:** 24 hours
**Escalation:** Security team (during business hours)

**Examples:**
- Security scanner alerts
- Minor configuration issues
- Outdated dependencies (no known exploits)
- Failed login attempts (expected)

**Actions:**
- Create ticket for remediation
- Schedule fix in next sprint
- Update documentation

---

## Response Team

### Roles and Responsibilities

#### Incident Commander
**Primary:** Lead maintainer
**Backup:** Senior contributor

**Responsibilities:**
- Overall incident coordination
- Make critical decisions
- Authorize system changes
- Coordinate communications
- Declare incident closed

#### Technical Lead
**Primary:** Senior developer
**Backup:** DevOps engineer

**Responsibilities:**
- Technical investigation
- Implement containment measures
- Develop and deploy fixes
- System recovery
- Technical documentation

#### Communications Lead
**Primary:** Project manager
**Backup:** Community manager

**Responsibilities:**
- Internal communications
- External communications (if needed)
- Stakeholder notifications
- Media relations (if applicable)
- Status updates

#### Security Analyst
**Primary:** Security-focused contributor
**Backup:** Technical lead

**Responsibilities:**
- Log analysis
- Threat intelligence
- Forensic analysis
- Indicator of compromise (IOC) identification
- Security tool operation

### Contact Information

```
# Emergency Contact List (Keep Updated)

Incident Commander:
  Name: [Primary]
  Email: incident-commander@example.com
  Phone: +1-XXX-XXX-XXXX
  Backup: [Secondary]

Technical Lead:
  Name: [Primary]
  Email: technical-lead@example.com
  Phone: +1-XXX-XXX-XXXX

Security Analyst:
  Name: [Primary]
  Email: security@internet-infrastructure-map.dev

External Resources:
  Hosting Provider: [Contact info]
  CDN Provider: [Contact info]
  Incident Response Firm: [Contact info if contracted]
```

---

## Response Procedures

### Phase 1: Detection and Analysis (First 15 minutes)

#### 1.1 Incident Detection

**Detection Sources:**
- Automated monitoring alerts
- Security scanner findings
- User reports
- Third-party notifications (GitHub, dependency alerts)
- Log analysis
- Anomaly detection

**Initial Assessment Checklist:**
- [ ] What was detected?
- [ ] When was it first noticed?
- [ ] What systems are affected?
- [ ] Is it still ongoing?
- [ ] What is the potential impact?
- [ ] What is the severity level?

#### 1.2 Incident Declaration

**When to declare an incident:**
- Confirmed security event with potential impact
- Suspicious activity requiring investigation
- Better safe than sorry - err on side of caution

**Declaration Process:**
1. Document initial findings
2. Assign severity level
3. Notify response team
4. Create incident ticket
5. Start incident log

**Incident Ticket Template:**
```markdown
# Incident: [Brief Description]

**Severity:** P0/P1/P2/P3
**Status:** Active/Contained/Resolved
**Detected:** YYYY-MM-DD HH:MM UTC
**Detector:** [Name/System]

## Summary
Brief description of the incident

## Impact
- Systems affected:
- Data affected:
- Users affected:
- Service availability:

## Timeline
- [Time] - Event occurred
- [Time] - Detected
- [Time] - Response initiated

## Response Team
- Incident Commander: [Name]
- Technical Lead: [Name]
- Security Analyst: [Name]

## Actions Taken
- [ ] Initial assessment
- [ ] Containment
- [ ] Eradication
- [ ] Recovery
- [ ] Post-incident review

## Notes
[Ongoing investigation notes]
```

#### 1.3 Initial Analysis

**Key Questions:**
- What is the attack vector?
- How did the attacker gain access?
- What actions did the attacker take?
- What data was accessed/modified/exfiltrated?
- Are there other compromised systems?
- Is the attacker still present?

**Evidence Collection:**
```bash
# Collect system state
date > incident-$(date +%Y%m%d-%H%M%S).log
echo "=== System State ===" >> incident.log

# Web server logs
cp /var/log/nginx/access.log incident-access-$(date +%Y%m%d).log
cp /var/log/nginx/error.log incident-error-$(date +%Y%m%d).log

# Application logs (if self-hosted)
journalctl -u internet-infrastructure-map > incident-app-$(date +%Y%m%d).log

# Network connections (if applicable)
netstat -tulpn >> incident.log

# Recent file changes
find /var/www -type f -mtime -1 -ls > incident-files-$(date +%Y%m%d).log

# Hash critical files
sha256sum /var/www/internet-infrastructure-map/dist/*.js > incident-hashes.txt
```

---

### Phase 2: Containment (First 1 hour)

#### 2.1 Short-term Containment

**Immediate actions to stop the bleeding:**

**For Compromised API Keys:**
```bash
# 1. Revoke compromised keys immediately
# PeeringDB - login and revoke at https://www.peeringdb.com/account/api_keys
# Cloudflare - revoke at https://dash.cloudflare.com/profile/api-tokens

# 2. Remove from environment
unset VITE_PEERINGDB_API_KEY
unset VITE_CLOUDFLARE_RADAR_TOKEN

# 3. Update GitHub Secrets
# Go to repository Settings → Secrets → Delete compromised secrets

# 4. Deploy without keys (use fallback data)
npm run build
# Deploy fallback version
```

**For Active Attacks:**
```bash
# Block attacking IP addresses (if self-hosted)
# Nginx
echo "deny 123.45.67.89;" >> /etc/nginx/conf.d/blocklist.conf
nginx -s reload

# Apache
echo "Require not ip 123.45.67.89" >> /etc/apache2/conf-available/blocklist.conf
a2enconf blocklist
systemctl reload apache2

# Cloudflare (if using)
# Use Cloudflare dashboard to add IP Access Rules
```

**For Compromised System:**
```bash
# Take snapshot before any changes (if VM/container)
# Then isolate from network
# Keep system running for forensics

# If GitHub Pages
# 1. Go to repository Settings
# 2. Pages → Unpublish site (if needed)
# 3. Deploy clean version from known good commit
```

#### 2.2 Long-term Containment

**System Hardening:**
```bash
# 1. Update all dependencies
npm update
npm audit fix

# 2. Rebuild from clean source
git checkout main
git pull origin main
rm -rf node_modules dist
npm ci
npm run build

# 3. Redeploy with new credentials
# Update GitHub Secrets with new API keys
git push origin main
```

---

### Phase 3: Eradication (First 4 hours)

#### 3.1 Remove Threat

**Identify and remove all traces of the threat:**

**For Malicious Code:**
```bash
# 1. Identify affected files
git log --all --full-history -- "*.js"
git diff main..suspicious-commit

# 2. Remove malicious commits
git revert <commit-hash>
# OR if not pushed to others
git reset --hard <last-good-commit>

# 3. Scan for backdoors
npm audit
# Manual code review of recently changed files
grep -r "eval\|Function\|require.*http" src/

# 4. Rebuild from clean state
rm -rf node_modules dist
npm ci
npm run build
```

**For Compromised Dependencies:**
```bash
# 1. Identify compromised package
npm audit --json | jq '.vulnerabilities'

# 2. Remove compromised version
npm uninstall <package>

# 3. Install secure version
npm install <package>@<secure-version>

# 4. Verify integrity
npm audit
```

#### 3.2 Close Attack Vectors

**Patch vulnerabilities that allowed the incident:**

```javascript
// Example: Fix XSS vulnerability
// Before (vulnerable)
element.innerHTML = userInput;

// After (secure)
import { sanitizeHTML } from './utils/sanitizer';
element.innerHTML = sanitizeHTML(userInput);
```

**Deploy fixes:**
```bash
# 1. Create security branch
git checkout -b security-fix-incident-123

# 2. Apply fixes
# ... make code changes ...

# 3. Test thoroughly
npm test
npm run build

# 4. Fast-track security PR
git add .
git commit -m "security: Fix vulnerability from incident #123"
git push origin security-fix-incident-123

# 5. Merge and deploy immediately
# Get emergency approval and merge
# Deploy to production
```

---

### Phase 4: Recovery (First 24 hours)

#### 4.1 System Restoration

**Return systems to normal operations:**

```bash
# 1. Deploy patched version
npm run build
# Deploy to production

# 2. Restore any corrupted data from backups
# (If applicable)

# 3. Re-enable disabled features
# Update configuration
# Re-enable rate limiting
# Restore normal monitoring

# 4. Verify system integrity
npm audit
npm test
# Manual smoke testing

# 5. Monitor closely
tail -f /var/log/nginx/access.log
# Watch for recurrence
```

#### 4.2 Verification

**Ensure the threat is completely removed:**

- [ ] All backdoors removed
- [ ] All compromised credentials rotated
- [ ] All patches deployed
- [ ] All systems verified clean
- [ ] Monitoring re-enabled
- [ ] No suspicious activity detected

**Monitoring Enhancement:**
```javascript
// Add extra logging temporarily
console.log('[SECURITY] API request:', {
  endpoint: url,
  timestamp: Date.now(),
  source: 'post-incident-monitoring'
});
```

---

### Phase 5: Post-Incident Activities (First week)

#### 5.1 Incident Report

**Write comprehensive incident report:**

```markdown
# Incident Report: [Incident ID]

**Date:** YYYY-MM-DD
**Severity:** P0/P1/P2/P3
**Status:** Resolved

## Executive Summary
Brief overview of what happened

## Timeline
| Time (UTC) | Event |
|------------|-------|
| 2025-11-03 10:00 | Incident detected |
| 2025-11-03 10:15 | Response team notified |
| 2025-11-03 10:30 | Containment measures applied |
| 2025-11-03 12:00 | Threat eradicated |
| 2025-11-03 14:00 | Systems restored |
| 2025-11-03 16:00 | Incident declared resolved |

## Impact Assessment
- **Systems Affected:** [List]
- **Data Compromised:** [Yes/No - Details]
- **Downtime:** [Duration]
- **Users Affected:** [Number/Scope]
- **Financial Impact:** [If applicable]

## Root Cause Analysis
Detailed explanation of how the incident occurred

## Attack Vector
How the attacker gained access

## Actions Taken
1. [Action 1]
2. [Action 2]
...

## What Went Well
- Quick detection
- Effective containment
- Good team coordination

## What Needs Improvement
- Monitoring gaps identified
- Documentation unclear
- Communication delays

## Lessons Learned
Key takeaways from this incident

## Preventive Measures
Changes implemented to prevent recurrence:
1. [Measure 1]
2. [Measure 2]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Appendices
- Logs and evidence
- Technical details
- Communications sent
```

#### 5.2 Lessons Learned Session

**Conduct post-incident review:**

**Agenda:**
1. Timeline walkthrough
2. What went well
3. What could be improved
4. Action items for improvement
5. Update incident response plan

**Key Questions:**
- Were detection mechanisms effective?
- Was the response timely?
- Were procedures followed correctly?
- What training is needed?
- What tools are needed?
- What documentation needs updating?

#### 5.3 Remediation Tracking

**Create tickets for improvements:**
```markdown
- [ ] Update monitoring to detect similar attacks
- [ ] Add security test for vulnerability
- [ ] Update documentation
- [ ] Conduct security training
- [ ] Review similar code for same vulnerability
- [ ] Update incident response plan
```

---

## Incident Types

### API Key Compromise

**Detection:**
- Unusual API usage patterns
- Rate limit exceeded
- API provider notification
- Key found in public repository

**Response:**
1. Revoke compromised key immediately
2. Generate new key with minimal permissions
3. Update deployment secrets
4. Review API usage logs
5. Assess data accessed
6. Implement key rotation schedule

**Prevention:**
- Never commit keys to repository
- Use environment variables
- Rotate keys every 90 days
- Monitor usage patterns
- Set up usage alerts

---

### Data Breach

**Detection:**
- Unauthorized data access logged
- User report of leaked data
- Data found on breach sites
- Anomalous database queries

**Response:**
1. Identify scope of breach
2. Preserve evidence
3. Contain access
4. Notify affected parties
5. Offer remediation (if applicable)
6. Report to authorities (if required)

**Legal Requirements:**
- GDPR: 72-hour notification
- CCPA: Notify California residents
- Breach notification laws vary by jurisdiction

---

### Dependency Compromise

**Detection:**
- GitHub Dependabot alert
- npm audit finding
- Security advisory published
- Unusual package behavior

**Response:**
1. Assess impact of compromised dependency
2. Check if vulnerable version in use
3. Update to patched version
4. Review recent changes from package
5. Rebuild and redeploy
6. Notify users if needed

**Example:**
```bash
# Received alert about compromised package
npm audit
# Shows: lodash@4.17.20 | Prototype Pollution

# Update to secure version
npm update lodash
npm audit
# Verify fix applied

# Rebuild and deploy
npm run build
git add package*.json
git commit -m "security: Update lodash to fix CVE-XXXX"
git push
```

---

### Denial of Service

**Detection:**
- High traffic from single source
- Service unavailable
- Performance degradation
- Resource exhaustion

**Response:**
1. Identify attack source
2. Enable rate limiting
3. Block attacking IPs
4. Contact hosting provider
5. Consider CDN/DDoS protection
6. Scale resources if needed

**For GitHub Pages:**
- Limited options, rely on GitHub's infrastructure
- Consider moving to Cloudflare for DDoS protection

**For Self-Hosted:**
```bash
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=ddos:10m rate=10r/s;

location / {
    limit_req zone=ddos burst=20 nodelay;
    limit_req_status 429;
}
```

---

## Communication Plan

### Internal Communication

**Slack/Chat Template:**
```
🚨 SECURITY INCIDENT - P[0/1/2/3]

Brief Description: [1-2 sentences]
Status: [Active/Contained/Resolved]
Incident Commander: [@person]

Current Actions:
- [Action 1]
- [Action 2]

Do Not:
- [Things to avoid]

Updates will be posted every [30min/1hr/4hr]
```

### External Communication

**For Public Incidents:**

**Template - GitHub Issue:**
```markdown
## Security Advisory: [Brief Description]

**Status:** Resolved
**Severity:** High
**Affected Versions:** v2.0.0 - v2.0.5
**Fixed Version:** v2.0.6

### Summary
Brief description of the vulnerability

### Impact
What users/systems are affected

### Remediation
Steps users need to take:
1. Update to v2.0.6 or later
2. Rotate API keys
3. Clear browser cache

### Timeline
- 2025-11-03 10:00 UTC: Vulnerability discovered
- 2025-11-03 14:00 UTC: Fix deployed
- 2025-11-03 16:00 UTC: Public disclosure

### Credits
Thanks to [Researcher] for responsible disclosure

### Contact
security@internet-infrastructure-map.dev
```

**When to Notify Publicly:**
- User data potentially compromised
- Significant service disruption
- Vulnerability affects other users
- Legal requirement
- High severity incident

**When to Keep Private:**
- Incident contained before impact
- No user data affected
- Low severity configuration issue
- Under active investigation

---

## Post-Incident Activities

### Security Improvements

**Action Items Template:**
```markdown
# Post-Incident Improvements - Incident #123

## Immediate (This Sprint)
- [ ] Patch vulnerability in [component]
- [ ] Add monitoring for [attack type]
- [ ] Update documentation for [process]
- [ ] Conduct team training on [topic]

## Short-term (Next Month)
- [ ] Implement [security control]
- [ ] Review similar code for [vulnerability]
- [ ] Add security tests for [scenario]
- [ ] Update incident response plan

## Long-term (Next Quarter)
- [ ] Invest in [security tool]
- [ ] Conduct penetration testing
- [ ] Hire security consultant
- [ ] Implement [architecture change]
```

### Metrics and KPIs

**Track incident response effectiveness:**

- **Mean Time to Detect (MTTD):** Time from incident start to detection
- **Mean Time to Respond (MTTR):** Time from detection to response start
- **Mean Time to Contain (MTTC):** Time from response to containment
- **Mean Time to Recover (MTTR):** Time from containment to full recovery

**Target Goals:**
- MTTD: < 15 minutes
- MTTR: < 30 minutes
- MTTC: < 1 hour
- MTTR: < 4 hours

---

## Appendices

### Appendix A: Incident Log Template

```markdown
# Incident Log - [Incident ID]

| Time (UTC) | Person | Action | Result |
|------------|--------|--------|--------|
| 10:00 | Alice | Detected unusual API traffic | Opened incident |
| 10:05 | Bob | Checked logs | Found suspicious IP |
| 10:10 | Alice | Blocked IP address | Traffic stopped |
| 10:15 | Charlie | Reviewed code | Found vulnerability |
| ... | ... | ... | ... |
```

### Appendix B: Evidence Collection

**What to collect:**
- Server logs (access, error, application)
- Network logs (firewall, IDS/IPS)
- System logs (auth, system events)
- Database logs (queries, changes)
- Application logs (user actions, API calls)
- Git history (code changes)
- Screenshots (admin panels, logs)
- Network captures (if applicable)

**How to preserve:**
```bash
# Create evidence directory
mkdir incident-$(date +%Y%m%d)-evidence
cd incident-$(date +%Y%m%d)-evidence

# Collect logs
cp /var/log/nginx/*.log .
cp /var/log/syslog .
journalctl -u internet-infrastructure-map > app.log

# Hash everything
sha256sum * > checksums.txt

# Package securely
tar czf evidence.tar.gz *
gpg --encrypt --recipient security@example.com evidence.tar.gz

# Store securely (encrypted)
```

### Appendix C: Forensics Tools

**Useful tools for investigation:**
- `grep`, `awk`, `sed` - Log analysis
- `jq` - JSON log parsing
- `wireshark` - Network analysis
- `tcpdump` - Packet capture
- `git log` - Code history
- `diff` - Compare files
- `strings` - Extract strings from binaries
- `file` - Identify file types

### Appendix D: Contact Directory

```yaml
# External Contacts

Hosting/Infrastructure:
  GitHub:
    Support: https://support.github.com/
    Security: security@github.com

API Providers:
  Cloudflare:
    Support: https://support.cloudflare.com/
    Security: security@cloudflare.com
  PeeringDB:
    Support: support@peeringdb.com

Security Resources:
  CERT:
    Website: https://www.cert.org/
    Email: cert@cert.org

Law Enforcement:
  FBI IC3: https://www.ic3.gov/

Legal:
  Legal Counsel: [If applicable]
  Data Protection Officer: [If applicable]
```

---

## Document Control

- **Owner:** Security Team
- **Review Frequency:** Quarterly
- **Last Reviewed:** November 3, 2025
- **Next Review:** February 3, 2026
- **Version:** 2.0

**Change History:**
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-03 | 2.0 | Comprehensive rewrite | Security Team |
| 2025-01-15 | 1.0 | Initial version | Security Team |

---

**Questions?** Contact security@internet-infrastructure-map.dev
