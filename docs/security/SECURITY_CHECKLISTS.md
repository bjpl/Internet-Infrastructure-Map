# Security Checklists

> **Quick reference checklists for security operations**

**Last Updated:** November 3, 2025
**Version:** 2.0

---

## Table of Contents

- [Pre-Commit Security Checklist](#pre-commit-security-checklist)
- [Pre-Deployment Security Checklist](#pre-deployment-security-checklist)
- [Security Code Review Checklist](#security-code-review-checklist)
- [Dependency Update Checklist](#dependency-update-checklist)
- [API Key Rotation Checklist](#api-key-rotation-checklist)
- [Incident Response Quick Reference](#incident-response-quick-reference)

---

## Pre-Commit Security Checklist

**Use before every git commit to ensure security standards**

### Secrets & Configuration
- [ ] No hardcoded API keys or secrets in code
- [ ] No passwords or tokens in source files
- [ ] `.env` file not staged for commit (`git status` to verify)
- [ ] Sensitive configuration in environment variables only
- [ ] No database credentials in code
- [ ] No private keys or certificates in repository

**Quick check:**
```bash
# Check if .env is staged
git status | grep -E "\.env$|\.env\..*$"
# Should return nothing

# Scan for potential secrets
git diff --cached | grep -iE "(api[_-]?key|password|secret|token|private[_-]?key)" --color
# Review any matches carefully
```

### Code Security
- [ ] Input validation implemented for all user inputs
- [ ] Output sanitization for dynamic content
- [ ] No `eval()` or `Function()` with user data
- [ ] No `innerHTML` with unsanitized user data
- [ ] SQL queries use parameterized statements (if applicable)
- [ ] File uploads validated and restricted (if applicable)

### Dependencies
- [ ] No new dependencies without security review
- [ ] `npm audit` runs clean (no high/critical issues)
- [ ] Dependency licenses compatible with project
- [ ] Dependencies from trusted sources only

**Quick check:**
```bash
npm audit --audit-level=high
```

### Error Handling
- [ ] Errors don't expose sensitive information
- [ ] Stack traces not shown to users (production)
- [ ] Error messages are generic and user-friendly
- [ ] Detailed errors only logged server-side

### Logging
- [ ] No sensitive data in log statements
- [ ] API keys and tokens redacted in logs
- [ ] Personal data not logged
- [ ] Log levels appropriate (debug only in dev)

**Quick check:**
```bash
# Check for logging sensitive data
git diff --cached | grep -E "console\.(log|warn|error)" | grep -iE "(api[_-]?key|password|token|secret)"
```

### Authentication & Authorization
- [ ] Authentication checks in place
- [ ] Authorization verified for protected resources
- [ ] Session management secure
- [ ] No security bypass in code

### Comments & Documentation
- [ ] No TODO comments about security issues left unfixed
- [ ] Security decisions documented
- [ ] No sensitive information in comments
- [ ] API documentation updated

### Testing
- [ ] Security tests written for new features
- [ ] Tests for input validation
- [ ] Tests for XSS prevention
- [ ] All tests passing

**Quick check:**
```bash
npm test
```

---

## Pre-Deployment Security Checklist

**Complete before every production deployment**

### Pre-Deployment Verification

#### Environment Configuration
- [ ] Production environment variables configured
- [ ] API keys are production keys (not dev keys)
- [ ] All required secrets in deployment environment
- [ ] Environment variables validated

**GitHub Actions check:**
```bash
# Verify secrets are set in GitHub
# Go to: Settings → Secrets and variables → Actions
# Required secrets:
# - VITE_PEERINGDB_API_KEY
# - VITE_CLOUDFLARE_RADAR_TOKEN
```

#### Code Quality
- [ ] Code review completed and approved
- [ ] All tests passing
- [ ] Security tests passing
- [ ] Linting passes with no errors
- [ ] Type checking passes (if using TypeScript)

**Quick check:**
```bash
npm test && npm run lint && npm run build
```

#### Security Scanning
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Dependencies up to date
- [ ] No known security issues in dependencies
- [ ] Security advisory review completed

**Quick check:**
```bash
npm audit --audit-level=high
npm outdated
```

#### Configuration Review
- [ ] Debug mode disabled
- [ ] Source maps disabled or secured
- [ ] Error reporting production-ready
- [ ] Logging configured correctly
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

**Build configuration check:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: false, // or 'hidden' for internal use only
    minify: true,
  },
  // ...
});
```

### Production Readiness

#### Infrastructure
- [ ] SSL/TLS certificate valid and not expiring soon
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers configured
- [ ] Content Security Policy (CSP) configured
- [ ] Firewall rules configured (if self-hosted)
- [ ] DDoS protection enabled

**SSL check:**
```bash
# Check certificate expiry
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

#### Monitoring & Logging
- [ ] Application monitoring enabled
- [ ] Error tracking configured
- [ ] Security monitoring active
- [ ] Log aggregation working
- [ ] Alerts configured for critical issues

#### Backup & Recovery
- [ ] Backup strategy in place
- [ ] Recovery procedures documented
- [ ] Rollback plan ready
- [ ] Previous version can be restored

**GitHub Pages rollback:**
```bash
# Identify last good commit
git log --oneline -10

# Revert to previous version if needed
git revert <commit-hash>
git push origin main
```

#### Documentation
- [ ] CHANGELOG.md updated
- [ ] Deployment notes documented
- [ ] Known issues documented
- [ ] User-facing changes communicated

### Post-Deployment Verification

#### Smoke Testing
- [ ] Application loads successfully
- [ ] Core features work
- [ ] No JavaScript errors in console
- [ ] API integrations working
- [ ] No security header warnings

**Quick smoke test:**
```bash
# Check HTTP response
curl -I https://example.com

# Check for errors
curl https://example.com | grep -i error

# Verify security headers
curl -I https://example.com | grep -E "(X-Frame-Options|Content-Security-Policy|Strict-Transport-Security)"
```

#### Security Verification
- [ ] SSL/TLS working correctly
- [ ] Security headers present
- [ ] No mixed content warnings
- [ ] CSP not blocking resources
- [ ] No exposed secrets in source

**Security header check:**
```bash
# Use online tools:
# - https://securityheaders.com/
# - https://www.ssllabs.com/ssltest/
```

#### Monitoring Check
- [ ] Monitoring reports application healthy
- [ ] No error alerts triggered
- [ ] Performance metrics normal
- [ ] Logs being collected

---

## Security Code Review Checklist

**Use when reviewing pull requests for security issues**

### General Security

#### Authentication & Authorization
- [ ] Authentication required where needed
- [ ] Authorization checks in place
- [ ] Session management secure
- [ ] No authentication bypass
- [ ] Credentials never in code

#### Input Validation
- [ ] All user input validated
- [ ] Validation on server-side (if applicable)
- [ ] Whitelist validation used (not blacklist)
- [ ] Input length limits enforced
- [ ] Special characters handled correctly

#### Output Encoding
- [ ] HTML output sanitized
- [ ] XSS prevention in place
- [ ] URL encoding for URLs
- [ ] JSON properly escaped
- [ ] `textContent` used instead of `innerHTML` for user data

#### Injection Prevention
- [ ] No SQL injection vulnerabilities (if applicable)
- [ ] No command injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No eval() with user data
- [ ] Parameterized queries used (if database)

### Specific Patterns

#### Dangerous Functions
```javascript
// Check for these patterns:

// ❌ Dangerous
eval(userInput);
Function(userInput);
element.innerHTML = userInput;
setTimeout(userInput);
new Function(userInput)();

// ✅ Safe alternatives
JSON.parse(userInput); // For JSON only
element.textContent = userInput;
element.innerHTML = sanitizeHTML(userInput);
```

#### API Key Usage
```javascript
// ❌ Wrong
const apiKey = 'sk-abc123';
console.log('Using API key:', apiKey);

// ✅ Correct
const apiKey = import.meta.env.VITE_API_KEY;
console.log('Using API key:', '[REDACTED]');
```

#### Error Handling
```javascript
// ❌ Wrong - Exposes internal details
catch (error) {
  alert(error.stack);
  throw error;
}

// ✅ Correct - Generic message
catch (error) {
  console.error('Error details:', error); // Log only
  showUserMessage('An error occurred. Please try again.');
}
```

### Data Protection
- [ ] Sensitive data encrypted at rest (if stored)
- [ ] Sensitive data encrypted in transit (HTTPS)
- [ ] No sensitive data in localStorage
- [ ] No sensitive data in sessionStorage
- [ ] No sensitive data in URLs
- [ ] Personal data handling GDPR-compliant

### Dependencies
- [ ] New dependencies justified
- [ ] Dependencies from npm (official registry)
- [ ] Dependency security reviewed
- [ ] No known vulnerabilities
- [ ] License compatible

### Configuration
- [ ] No hardcoded secrets
- [ ] Environment variables used correctly
- [ ] Configuration externalized
- [ ] Default configuration secure

### Logging
- [ ] No sensitive data logged
- [ ] Appropriate log levels
- [ ] Error details not exposed to users
- [ ] Logs useful for debugging

### Testing
- [ ] Security tests included
- [ ] Input validation tested
- [ ] XSS prevention tested
- [ ] Edge cases tested
- [ ] Error conditions tested

---

## Dependency Update Checklist

**Use when updating npm dependencies**

### Before Update

#### Assessment
- [ ] Review CHANGELOG of dependency
- [ ] Check for breaking changes
- [ ] Review security advisories
- [ ] Check dependency compatibility
- [ ] Note current version

**Check current state:**
```bash
# Current versions
npm list <package-name>

# Check for updates
npm outdated

# Review package details
npm info <package-name>
```

#### Risk Assessment
- [ ] Is this a major version update? (Breaking changes likely)
- [ ] Is this package heavily used in the app?
- [ ] Does it have many dependents?
- [ ] Are there reported issues with new version?

### During Update

#### Update Process
```bash
# 1. Update specific package
npm update <package-name>

# OR update to specific version
npm install <package-name>@<version>

# 2. Check for security issues
npm audit

# 3. Verify package-lock.json changed
git diff package-lock.json
```

#### Testing
- [ ] All tests pass
- [ ] Security tests pass
- [ ] Manual testing of affected features
- [ ] No new console errors
- [ ] No runtime errors

```bash
# Run full test suite
npm test

# Build succeeds
npm run build

# Manual testing
npm run dev
```

### After Update

#### Verification
- [ ] Application works correctly
- [ ] No security regressions
- [ ] Performance not degraded
- [ ] All features work
- [ ] Documentation updated (if needed)

#### Commit
```bash
git add package.json package-lock.json
git commit -m "chore(deps): Update <package-name> to <version>

- Addresses security vulnerability CVE-XXXX
- Includes bug fixes and improvements
- All tests passing"
```

#### Deployment
- [ ] Deploy to staging first (if available)
- [ ] Monitor for issues
- [ ] Deploy to production
- [ ] Monitor production

---

## API Key Rotation Checklist

**Use when rotating API keys (recommended every 90 days)**

### Preparation
- [ ] Schedule rotation during low-traffic period
- [ ] Notify team of rotation
- [ ] Document current key last rotated date
- [ ] Prepare rollback plan

### Create New Keys

#### PeeringDB
1. [ ] Login to https://www.peeringdb.com/account/api_keys
2. [ ] Create new API key
3. [ ] Copy key to secure location
4. [ ] Do NOT delete old key yet

#### Cloudflare Radar
1. [ ] Login to https://dash.cloudflare.com/profile/api-tokens
2. [ ] Create new token with same permissions
3. [ ] Copy token to secure location
4. [ ] Do NOT delete old token yet

### Update Deployment

#### GitHub Secrets
1. [ ] Go to repository Settings → Secrets and variables → Actions
2. [ ] Update `VITE_PEERINGDB_API_KEY` with new key
3. [ ] Update `VITE_CLOUDFLARE_RADAR_TOKEN` with new token
4. [ ] Verify secrets updated

#### Deploy New Keys
```bash
# Trigger deployment with new keys
git commit --allow-empty -m "chore: Rotate API keys"
git push origin main

# Wait for deployment to complete
# Verify new deployment working
```

### Verification
- [ ] Application loads successfully
- [ ] Data fetching works
- [ ] No API errors in console
- [ ] Monitoring shows no issues

**Quick verification:**
```bash
# Check application
curl https://your-app.com

# Check browser console for API errors
# Should see successful API requests
```

### Cleanup
- [ ] Wait 24 hours for full propagation
- [ ] Verify no systems using old keys
- [ ] Delete old keys from API providers
- [ ] Update documentation with rotation date

**PeeringDB:**
- Go to https://www.peeringdb.com/account/api_keys
- Delete old key

**Cloudflare:**
- Go to https://dash.cloudflare.com/profile/api-tokens
- Revoke old token

### Documentation
```markdown
# API Key Rotation Log

## Date: 2025-11-03

### PeeringDB API Key
- Old Key: pk_...abc (deleted)
- New Key: pk_...xyz (created 2025-11-03)
- Next Rotation: 2026-02-01 (90 days)

### Cloudflare Radar Token
- Old Token: token_...def (revoked)
- New Token: token_...uvw (created 2025-11-03)
- Next Rotation: 2026-02-01 (90 days)

### Notes
- Rotation completed without issues
- All systems verified working
- Old credentials deleted after 24h grace period
```

---

## Incident Response Quick Reference

**Use when security incident occurs**

### Immediate Actions (First 15 minutes)

#### Severity Assessment
- [ ] P0 Critical - Data breach, system compromise
- [ ] P1 High - Unauthorized access, API compromise
- [ ] P2 Medium - Failed attacks, vulnerabilities found
- [ ] P3 Low - Security scanner alerts, minor issues

#### Initial Response
```bash
# 1. Document everything
echo "Incident detected at $(date)" > incident-$(date +%Y%m%d-%H%M%S).log

# 2. Notify team
# Post in security channel or call incident commander

# 3. Collect initial evidence
git log -10 > incident-git-log.txt
npm audit > incident-npm-audit.txt

# 4. Preserve logs (if self-hosted)
cp /var/log/nginx/access.log incident-access-$(date +%Y%m%d).log
cp /var/log/nginx/error.log incident-error-$(date +%Y%m%d).log
```

### Containment (First hour)

#### For Compromised API Keys
```bash
# 1. Revoke keys immediately at provider
# PeeringDB: https://www.peeringdb.com/account/api_keys
# Cloudflare: https://dash.cloudflare.com/profile/api-tokens

# 2. Deploy without keys (fallback mode)
# Remove secrets from GitHub temporarily
# Re-deploy

# 3. Generate new keys
# 4. Update deployment with new keys
```

#### For Code Compromise
```bash
# 1. Identify malicious commit
git log --all --oneline -20

# 2. Revert or reset
git revert <commit-hash>
# OR
git reset --hard <last-good-commit>

# 3. Force push (if not yet public)
git push origin main --force

# 4. Rebuild from clean state
rm -rf node_modules dist
npm ci
npm run build
```

#### For Active Attack
```bash
# Block attacking IP (if self-hosted)
echo "deny 123.45.67.89;" >> /etc/nginx/conf.d/blocklist.conf
nginx -s reload

# Enable rate limiting
# Update nginx/apache configuration

# Monitor logs
tail -f /var/log/nginx/access.log | grep "123.45.67.89"
```

### Investigation

#### Log Analysis
```bash
# Check for suspicious IPs
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# Find failed requests
grep " 40[1-4] " /var/log/nginx/access.log

# Find suspicious user agents
grep -i "bot\|crawler\|scanner" /var/log/nginx/access.log

# Check for SQL injection attempts
grep -i "union.*select\|concat\|script" /var/log/nginx/access.log
```

### Documentation
- [ ] Create incident ticket
- [ ] Document timeline
- [ ] Save all evidence
- [ ] Note all actions taken

### Post-Incident
- [ ] Write incident report
- [ ] Conduct lessons learned session
- [ ] Update security measures
- [ ] Implement preventive controls

---

## Additional Resources

### Security Tools
- **npm audit** - `npm audit`
- **Security Headers Check** - https://securityheaders.com/
- **SSL Test** - https://www.ssllabs.com/ssltest/
- **Git Secret Scanning** - https://github.com/awslabs/git-secrets

### Quick Commands

```bash
# Security scan
npm audit --audit-level=high

# Check for secrets
git diff --cached | grep -iE "(api[_-]?key|password|secret|token)"

# Build and test
npm test && npm run build

# Check SSL
echo | openssl s_client -connect example.com:443

# Monitor logs
tail -f /var/log/nginx/access.log

# Check security headers
curl -I https://example.com | grep -E "(X-Frame|CSP|HSTS)"
```

---

**Questions?** Contact security@internet-infrastructure-map.dev

**Related Documentation:**
- [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) - Comprehensive security guidelines
- [DEPLOYMENT_SECURITY.md](./DEPLOYMENT_SECURITY.md) - Production security
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - Detailed incident procedures
