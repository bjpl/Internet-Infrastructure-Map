# Production Deployment Security Checklist

**Last Updated:** 2025-11-03
**Project:** Live Internet Infrastructure Map

---

## Pre-Deployment Security Checklist

### 1. Configuration Security

- [ ] **Source Maps Disabled**
  - Verify `sourcemap` is set to `false` or `process.env.NODE_ENV !== 'production'` in `vite.config.js`
  - Test: Check `dist/` folder for `.map` files - should not exist in production

- [ ] **Environment Variables**
  - All sensitive values in `.env.local` (not committed)
  - `.env.example` contains no real credentials
  - Production environment variables configured on hosting platform
  - API keys use least-privilege access

- [ ] **Dependency Security**
  ```bash
  npm audit
  npm audit fix
  npm outdated
  ```
  - No critical or high vulnerabilities
  - All dependencies up to date (or documented exceptions)

- [ ] **Console Statements Removed**
  - `drop_console: true` in terser options for production
  - Manual check: Search for `console.log` in production build

### 2. Security Headers

- [ ] **Content Security Policy (CSP)**
  - CSP meta tag present in `index.html`
  - All required domains whitelisted
  - No `unsafe-eval` directives
  - Tested with browser developer tools (no CSP violations)

- [ ] **X-Frame-Options**
  - Set to `DENY` to prevent clickjacking
  - Test: Try embedding site in iframe (should fail)

- [ ] **X-Content-Type-Options**
  - Set to `nosniff`
  - Prevents MIME-type confusion attacks

- [ ] **Referrer Policy**
  - Set to `strict-origin-when-cross-origin`
  - Balances privacy and functionality

- [ ] **Permissions Policy**
  - Unnecessary browser features disabled (camera, microphone, geolocation)

### 3. HTTPS and Transport Security

- [ ] **Force HTTPS**
  - `upgrade-insecure-requests` directive in CSP
  - HTTP redirects to HTTPS at server level
  - No mixed content warnings

- [ ] **HSTS Header (Server-Side)**
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  ```
  - Configured on web server (Nginx/Apache/Cloudflare)
  - Test: Check headers with browser developer tools

- [ ] **SSL/TLS Configuration**
  - Valid SSL certificate (not self-signed)
  - TLS 1.2 or higher
  - Strong cipher suites
  - Test: https://www.ssllabs.com/ssltest/

### 4. API Security

- [ ] **API Key Protection**
  - No API keys in client-side code
  - Keys stored in environment variables
  - Keys have appropriate rate limits
  - Keys rotated regularly (document last rotation date)

- [ ] **Rate Limiting**
  - Client-side rate limiting implemented
  - Server-side rate limiting configured
  - Documented limits per API endpoint

- [ ] **CORS Configuration**
  - Only necessary origins allowed
  - Credentials handling configured properly
  - Wildcard (`*`) not used in production

- [ ] **Input Validation**
  - All user inputs sanitized
  - URL parameters validated
  - File uploads (if any) validated

### 5. Data Protection

- [ ] **Sensitive Data**
  - No credentials in code
  - No PII (Personally Identifiable Information) exposed
  - Error messages don't leak sensitive information
  - Logging doesn't capture sensitive data

- [ ] **Session Management**
  - Session timeout configured (30 minutes default)
  - Session invalidation on logout
  - No sensitive data in localStorage/sessionStorage

### 6. Build and Deployment

- [ ] **Minification and Obfuscation**
  - JavaScript minified
  - Comments removed
  - Source code not easily readable

- [ ] **Asset Integrity**
  - Subresource Integrity (SRI) for CDN resources
  - Content hashes in asset filenames
  - Old assets cleaned up

- [ ] **Error Handling**
  - Generic error messages in production
  - No stack traces exposed to users
  - Errors logged securely for debugging

### 7. Monitoring and Logging

- [ ] **Error Tracking**
  - Error tracking service configured (e.g., Sentry)
  - Sensitive data redacted from error reports
  - Alerts configured for critical errors

- [ ] **Access Logs**
  - Web server logging enabled
  - Logs rotated and archived
  - Unusual access patterns monitored

- [ ] **CSP Violation Reports**
  - CSP report-uri configured (if applicable)
  - Violations monitored and investigated

### 8. Testing

- [ ] **Security Testing**
  - Manual security review completed
  - Automated security scan run
  - Penetration testing (if required)

- [ ] **Functional Testing**
  - All features work with security headers enabled
  - No broken functionality due to CSP
  - Cross-browser testing completed

- [ ] **Performance Testing**
  - No performance degradation from security measures
  - Load testing completed

### 9. Documentation

- [ ] **Security Documentation**
  - Security headers documented
  - Deployment procedures documented
  - Incident response plan available

- [ ] **User Documentation**
  - Privacy policy updated
  - Terms of service current
  - Security best practices for users

### 10. Compliance

- [ ] **Legal Compliance**
  - GDPR compliance (if applicable)
  - CCPA compliance (if applicable)
  - Accessibility standards met

- [ ] **Industry Standards**
  - OWASP Top 10 addressed
  - CWE/SANS Top 25 addressed
  - PCI DSS (if handling payments)

---

## Post-Deployment Verification

### Immediate Checks (Within 1 Hour)

- [ ] Site accessible via HTTPS
- [ ] No browser security warnings
- [ ] Security headers present (check with browser DevTools)
- [ ] CSP not blocking legitimate resources
- [ ] All API calls functioning
- [ ] Error tracking receiving events

### Within 24 Hours

- [ ] Monitor error logs for issues
- [ ] Check analytics for traffic patterns
- [ ] Verify backups working
- [ ] Test disaster recovery procedure

### Within 1 Week

- [ ] Review security logs
- [ ] Check for any CSP violations
- [ ] Verify rate limiting working
- [ ] User feedback review

---

## Testing Tools and Resources

### Security Header Testing
- **Security Headers Checker:** https://securityheaders.com/
- **Mozilla Observatory:** https://observatory.mozilla.org/
- **Hardenize:** https://www.hardenize.com/

### CSP Testing
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com/
- **CSP Tester:** https://cspvalidator.org/

### SSL/TLS Testing
- **SSL Labs:** https://www.ssllabs.com/ssltest/
- **SSL Checker:** https://www.sslshopper.com/ssl-checker.html

### Vulnerability Scanning
```bash
# NPM Security Audit
npm audit

# Check for known vulnerabilities
npx snyk test

# OWASP Dependency Check
npm install -g retire
retire --path ./
```

### Manual Testing
```bash
# Check security headers
curl -I https://yourdomain.com

# Test CSP
# Open browser DevTools Console and check for CSP violations

# Test rate limiting
# Use browser or curl to make rapid requests

# Test HTTPS redirect
curl -I http://yourdomain.com
```

---

## Common Issues and Solutions

### Issue: CSP Blocking Resources

**Symptom:** Console shows CSP violation errors
**Solution:**
1. Identify blocked resource in console
2. Add domain to appropriate CSP directive
3. Test thoroughly
4. Redeploy

### Issue: Mixed Content Warnings

**Symptom:** Browser shows "not secure" warning
**Solution:**
1. Find HTTP resources in code (search for `http://`)
2. Change to HTTPS or use protocol-relative URLs
3. Add `upgrade-insecure-requests` to CSP

### Issue: CORS Errors

**Symptom:** API calls failing with CORS errors
**Solution:**
1. Verify origin in server CORS configuration
2. Check preflight OPTIONS requests
3. Ensure credentials handled correctly

### Issue: Performance Degradation

**Symptom:** Slow page load after security changes
**Solution:**
1. Check SRI validation time
2. Verify external resources loading
3. Consider preconnect/prefetch hints
4. Review CSP complexity

---

## Emergency Rollback Procedure

If critical security issues are discovered post-deployment:

1. **Immediate Actions:**
   - Document the issue with timestamp
   - Notify stakeholders
   - Assess impact and risk

2. **Rollback Decision:**
   - If vulnerability is critical: Rollback immediately
   - If vulnerability is medium/low: Fix forward if possible

3. **Rollback Steps:**
   ```bash
   # Revert to previous deployment
   git revert <commit-hash>
   npm run build
   # Deploy previous version
   ```

4. **Post-Rollback:**
   - Fix security issue
   - Test thoroughly
   - Document changes
   - Redeploy

---

## Continuous Security Monitoring

### Daily
- Monitor error logs
- Check security alerts
- Review access logs for anomalies

### Weekly
- Review CSP violation reports
- Check dependency vulnerabilities
- Review rate limiting logs

### Monthly
- Run full security audit
- Update dependencies
- Review and update security documentation
- Test disaster recovery procedures

### Quarterly
- Penetration testing (if applicable)
- Security training for team
- Review and update security policies
- Third-party security assessment

---

## Security Contacts

**Internal Security Team:**
- Email: security@yourdomain.com
- Slack: #security-incidents

**External Resources:**
- Hosting Provider Support
- CDN Provider Security
- Security Consultant (if applicable)

**Vulnerability Disclosure:**
- security@yourdomain.com
- Responsible disclosure policy: /security-policy

---

## Sign-Off

Deployment to production should be signed off by:

- [ ] **Developer:** _____________________ Date: _____
- [ ] **Security Lead:** _________________ Date: _____
- [ ] **DevOps Engineer:** _______________ Date: _____
- [ ] **Product Owner:** _________________ Date: _____

---

**Notes:**
- This checklist should be completed for every production deployment
- Keep a copy of completed checklists for audit purposes
- Update this checklist as security requirements evolve
- Review and update checklist quarterly

---

**Next Review Date:** 2026-02-03
