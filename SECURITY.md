# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          | End of Support |
| ------- | ------------------ | -------------- |
| 2.0.x   | :white_check_mark: | TBD            |
| 1.0.x   | :x:                | 2025-10-07     |
| < 1.0   | :x:                | N/A            |

**Recommendation:** Always use the latest version for the best security and features.

---

## Reporting a Vulnerability

### ⚠️ DO NOT Report Security Issues Publicly

**DO NOT** create public GitHub issues for security vulnerabilities. This helps protect users while we develop and deploy fixes.

### How to Report

**Preferred Method: GitHub Security Advisories**
1. Go to [Security Advisories](https://github.com/bjpl/Internet-Infrastructure-Map/security/advisories)
2. Click "Report a vulnerability"
3. Fill in the details (see template below)

**Alternative: Private Email**
- Email: security@internet-infrastructure-map.dev
- Subject: `[SECURITY] Brief description`
- Use PGP encryption if possible (PGP key: https://keybase.io/internet-infra-map)

### Vulnerability Report Template

```markdown
**Summary**
Brief description of the vulnerability

**Type**
[ ] XSS (Cross-Site Scripting)
[ ] Injection
[ ] Authentication/Authorization
[ ] Data Exposure
[ ] CSRF
[ ] Other: _______

**Severity Assessment**
[ ] Critical - Remote code execution, data breach
[ ] High - Authentication bypass, privilege escalation
[ ] Medium - Information disclosure, DoS
[ ] Low - Minor information leak

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Affected Components**
- Files: list affected files
- Routes: list affected endpoints
- Dependencies: list vulnerable dependencies

**Impact**
Describe the potential impact if exploited

**Proposed Fix** (optional)
Your suggestions for fixing the issue

**Environment**
- Version: [e.g., 2.0.0]
- Browser: [if applicable]
- OS: [if applicable]

**Proof of Concept** (if safe to share)
Code or steps demonstrating the vulnerability
```

---

## Response Timeline

We take security seriously and aim to respond quickly:

| Stage | Timeline | Action |
|-------|----------|--------|
| **Acknowledgment** | Within 48 hours | Confirm receipt of report |
| **Initial Assessment** | Within 1 week | Assess severity and impact |
| **Status Update** | Every 2 weeks | Provide progress updates |
| **Fix Development** | 2-4 weeks | Develop and test fix |
| **Disclosure** | After fix deployed | Coordinate disclosure |

**Note:** Timeline depends on complexity and severity.

---

## Security Update Process

### 1. Triage
- Assess severity (Critical/High/Medium/Low)
- Determine affected versions
- Identify fix complexity

### 2. Fix Development
- Develop patch in private branch
- Test thoroughly
- Prepare security advisory

### 3. Deployment
- Release patched version
- Publish security advisory
- Notify users (if severe)

### 4. Public Disclosure
- Wait 7 days after patch release
- Publish details to security advisory
- Credit reporter (if desired)

---

## Security Best Practices for Users

### API Key Protection

**DO:**
- ✅ Store API keys in `.env` files
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use environment variables in deployment

**DON'T:**
- ❌ Commit API keys to Git
- ❌ Share keys in public forums
- ❌ Hardcode keys in source files
- ❌ Use production keys in development
- ❌ Share `.env` files

### Environment Configuration

**`.env` Example:**
```bash
# API Keys (keep secret!)
VITE_CLOUDFLARE_API_KEY=your_key_here
VITE_PEERINGDB_API_KEY=your_key_here
VITE_TELEGEOGRAPHY_API_KEY=your_key_here

# Don't commit this file!
# Use .env.example as template
```

**Verification:**
```bash
# Check if .env is ignored
git status

# Should NOT show .env file
# If it does, run:
git rm --cached .env
```

### Dependency Security

**Automated Scanning:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# View details
npm audit --json
```

**Regular Updates:**
```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update to latest (carefully!)
npm update --latest
```

### Secure Deployment

**GitHub Pages (Public):**
- No secrets in public repositories
- API keys in GitHub Secrets
- Environment variables in Actions

**Self-Hosted:**
- Use HTTPS only
- Set proper CORS headers
- Implement rate limiting
- Regular security updates
- Monitor access logs

---

## Common Security Concerns

### 1. API Key Exposure

**Risk:** API keys visible in client code
**Mitigation:**
- Keys in `.env` (build-time replacement)
- Proxy sensitive requests through backend
- Use read-only keys when possible
- Implement rate limiting

**Example - Proxy Setup:**
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        // API key added server-side
      }
    }
  }
}
```

### 2. Cross-Site Scripting (XSS)

**Risk:** Malicious scripts in user input
**Mitigation:**
- Sanitize all user inputs
- Use Content Security Policy (CSP)
- Escape output in templates
- No `innerHTML` with user data

**Example - Input Sanitization:**
```javascript
import DOMPurify from 'dompurify';

function displayUserContent(userInput) {
  const clean = DOMPurify.sanitize(userInput);
  element.innerHTML = clean;
}
```

### 3. Data Privacy

**Current Stance:**
- ✅ No personal data collected
- ✅ No user accounts (v2.0)
- ✅ All data from public sources
- ✅ No tracking cookies
- ✅ GDPR/CCPA compliant

**Future (if user accounts added):**
- Clear privacy policy
- Explicit consent for data collection
- Right to data export/deletion
- Encrypted data storage
- Minimal data collection

### 4. Third-Party Dependencies

**Risks:**
- Vulnerable packages
- Malicious packages
- License issues

**Mitigation:**
- Regular `npm audit`
- Automated Dependabot alerts
- Review all dependencies
- Pin versions in package-lock.json
- Minimal dependencies

### 5. Content Security Policy (CSP)

**Recommended Headers:**
```html
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        connect-src 'self'
          https://api.cloudflare.com
          https://www.peeringdb.com
          https://www.submarinecablemap.com;
        font-src 'self';
      ">
```

---

## Security Checklist

### For Developers

**Before Committing:**
- [ ] No hardcoded secrets or API keys
- [ ] Sensitive data in `.env` file
- [ ] `.env` in `.gitignore`
- [ ] Input validation present
- [ ] Output sanitization done
- [ ] No `eval()` or `innerHTML` with user data
- [ ] Dependencies up to date
- [ ] `npm audit` passes

**Before Deploying:**
- [ ] Production API keys in deployment environment
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting active
- [ ] Logging enabled (no sensitive data)
- [ ] Error messages don't leak info
- [ ] Backup/rollback plan ready

### For Users

**Setup:**
- [ ] Clone from official repository
- [ ] Verify package integrity (`npm audit`)
- [ ] Use `.env.example` as template
- [ ] Never commit `.env` file
- [ ] Use HTTPS for deployment

**Maintenance:**
- [ ] Update dependencies monthly
- [ ] Check for security advisories
- [ ] Rotate API keys quarterly
- [ ] Monitor API usage for anomalies

---

## Responsible Disclosure

We believe in responsible disclosure and follow these principles:

### Our Commitment to You
- **Acknowledgment** - We'll confirm your report promptly
- **Communication** - Regular updates on progress
- **Credit** - Recognition in security advisory (if desired)
- **Coordination** - Work together on disclosure timing
- **No Legal Action** - Against good-faith security researchers

### We Ask That You
- **Give us time** - Allow fix before public disclosure
- **Stay in scope** - Test only what's necessary
- **Don't harm** - No data destruction or privacy violations
- **Be professional** - Responsible disclosure protects users

### Disclosure Timeline
1. **Private report** to maintainers
2. **Fix developed** (2-4 weeks)
3. **Patch released** to affected versions
4. **7-day wait** for users to update
5. **Public disclosure** with credits

---

## Security Hall of Fame

We recognize security researchers who help make this project safer:

### 2025
- *Awaiting first security report*

**Want to be listed here?** Report a valid security vulnerability!

---

## Security Features in v2.0

### Built-in Security
- ✅ **Environment Variables** - Secrets not in code
- ✅ **API Fallback Chain** - Graceful degradation
- ✅ **Input Sanitization** - XSS protection
- ✅ **Rate Limiting** - DoS prevention (client-side)
- ✅ **Dependency Scanning** - Automated checks
- ✅ **No User Data Collection** - Privacy by design

### Planned Enhancements (v2.1+)
- [ ] Backend API proxy (hide keys completely)
- [ ] Server-side rate limiting
- [ ] Enhanced CSP headers
- [ ] Subresource Integrity (SRI)
- [ ] Security headers (HSTS, X-Frame-Options)

---

## Resources

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency scanning
- [Snyk](https://snyk.io/) - Continuous security monitoring
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common vulnerabilities
- [GitHub Security](https://github.com/security) - Platform security features

### Best Practices
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)
- [Google Security Best Practices](https://cloud.google.com/security/best-practices)

---

## Contact

- **Security Issues:** [GitHub Security Advisories](https://github.com/bjpl/Internet-Infrastructure-Map/security/advisories)
- **General Security Questions:** security@internet-infrastructure-map.dev
- **PGP Key:** https://keybase.io/internet-infra-map

---

**Last Updated:** October 8, 2025
**Next Review:** Quarterly (January 2026)
