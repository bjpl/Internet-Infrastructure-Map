# Quick Security Reference Guide

**Last Updated:** 2025-11-03
**Project:** Internet Infrastructure Map

---

## Quick Access Commands

### Security Testing

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated

# Build for production (with security hardening)
NODE_ENV=production npm run build

# Verify no source maps in production
ls -la dist/*.map  # Should return "No such file"

# Check security headers
curl -I https://yourdomain.com
```

### Testing Security Headers

**Online Tools (Quick Check):**
- Security Headers: https://securityheaders.com/?q=yourdomain.com
- Mozilla Observatory: https://observatory.mozilla.org/analyze/yourdomain.com
- SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

**Browser DevTools:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on main document request
5. Check "Response Headers" section

---

## Security Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `vite.config.js` | Build security, dev server | Root |
| `index.html` | Security headers (meta tags) | Root |
| `.env.example` | Environment template | Root |
| `security-headers.config.js` | Reusable headers module | `config/` |
| `nginx-security.conf` | Nginx production config | `config/` |
| `apache-security.conf` | Apache production config | `config/` |

---

## Environment Variables Quick Reference

### Development (.env.local)
```bash
# API Keys (keep secret!)
VITE_PEERINGDB_API_KEY=your_actual_key_here
VITE_CLOUDFLARE_RADAR_TOKEN=your_actual_token_here

# Development settings
VITE_DEBUG=true
VITE_ENABLE_LOGGING=true
NODE_ENV=development
```

### Production (.env.production)
```bash
# Security
VITE_SECURITY_HEADERS_ENABLED=true
VITE_FORCE_HTTPS=true
VITE_ENABLE_SRI=true
VITE_ENABLE_PRODUCTION_LOGGING=false

# Session
VITE_SESSION_TIMEOUT=1800000

# Error tracking
VITE_SENTRY_DSN=https://your-sentry-dsn

# Environment
NODE_ENV=production
```

---

## Security Headers Checklist

Quick verification checklist for production:

- [ ] `Content-Security-Policy` - Present and strict
- [ ] `X-Frame-Options: DENY` - Prevents clickjacking
- [ ] `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- [ ] `X-XSS-Protection: 1; mode=block` - XSS protection
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` - Privacy
- [ ] `Permissions-Policy` - Browser features disabled
- [ ] `Strict-Transport-Security` - HSTS (server-side only)

---

## CSP Directives Quick Reference

```
default-src 'self'
  └─ Fallback for all resource types

script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com
  └─ Where JavaScript can load from

style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com
  └─ Where CSS can load from

font-src 'self' https://fonts.gstatic.com
  └─ Where fonts can load from

img-src 'self' data: https: blob:
  └─ Where images can load from

connect-src 'self' https://api.peeringdb.com https://api.cloudflare.com https://raw.githubusercontent.com
  └─ Where AJAX/fetch requests can go

frame-ancestors 'none'
  └─ Prevents embedding in iframes

base-uri 'self'
  └─ Restricts <base> tag

form-action 'self'
  └─ Where forms can submit to

upgrade-insecure-requests
  └─ Automatically upgrade HTTP to HTTPS
```

---

## Common Issues & Quick Fixes

### CSP Blocking Resources

**Error:** `Refused to load... because it violates the following Content Security Policy directive`

**Fix:**
1. Identify blocked resource domain in console
2. Add domain to appropriate CSP directive in `index.html`
3. Test and redeploy

**Example:**
```html
<!-- Add new domain to connect-src -->
<meta http-equiv="Content-Security-Policy" content="
  ...
  connect-src 'self' https://new-api-domain.com;
  ...
">
```

### Mixed Content Warning

**Error:** `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource`

**Fix:**
1. Find HTTP resource (search codebase for `http://`)
2. Change to HTTPS or protocol-relative URL
3. Verify `upgrade-insecure-requests` in CSP

### CORS Error

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix (Development):**
- Already configured in `vite.config.js` proxy

**Fix (Production):**
- Configure CORS on API server
- Or use serverless proxy function

### Source Maps in Production

**Issue:** Source code visible in browser DevTools

**Fix:**
```javascript
// In vite.config.js, verify:
sourcemap: process.env.NODE_ENV !== 'production'

// Then rebuild:
NODE_ENV=production npm run build
```

---

## Deployment Quick Commands

### Nginx

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### Apache

```bash
# Test configuration
sudo apachectl configtest

# Restart Apache
sudo systemctl restart apache2

# View error logs
sudo tail -f /var/log/apache2/error.log

# View access logs
sudo tail -f /var/log/apache2/access.log
```

### Static Hosting (Netlify, Vercel, etc.)

Most headers configured via platform UI or config files:

**Netlify (_headers file):**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; ...
```

**Vercel (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## Emergency Procedures

### Critical Security Issue Discovered

1. **Immediate:**
   - Document issue with timestamp
   - Assess severity (Critical/High/Medium/Low)
   - Notify stakeholders

2. **If Critical:**
   - Take site offline or rollback immediately
   - Fix vulnerability
   - Test thoroughly
   - Redeploy

3. **If High/Medium:**
   - Schedule emergency fix
   - Deploy within 24 hours
   - Monitor closely

4. **Post-Incident:**
   - Document root cause
   - Update security procedures
   - Implement preventive measures

### Rollback Procedure

```bash
# 1. Identify last good commit
git log --oneline

# 2. Revert to safe version
git revert <commit-hash>

# 3. Rebuild
npm run build

# 4. Deploy
# (Follow your deployment procedure)

# 5. Verify
curl -I https://yourdomain.com
```

---

## Security Monitoring

### What to Monitor Daily

- [ ] Error logs (unexpected errors)
- [ ] Access logs (unusual patterns)
- [ ] Rate limiting violations
- [ ] Failed requests (4xx, 5xx errors)
- [ ] Unusual traffic spikes

### What to Check Weekly

- [ ] CSP violation reports
- [ ] Dependency vulnerabilities (`npm audit`)
- [ ] SSL certificate expiration
- [ ] Security header compliance
- [ ] External resource availability

### What to Review Monthly

- [ ] Full security configuration
- [ ] Update dependencies
- [ ] Review security documentation
- [ ] Test disaster recovery
- [ ] Security training materials

---

## Key Contacts

**Internal:**
- Security Team: security@yourdomain.com
- DevOps: devops@yourdomain.com
- On-Call: oncall@yourdomain.com

**External:**
- Hosting Provider Support
- CDN Provider Security
- Security Consultant

**Vulnerability Disclosure:**
- Email: security@yourdomain.com
- Policy: https://yourdomain.com/security-policy

---

## Quick Links

**Documentation:**
- [Configuration Hardening Report](./configuration-hardening.md)
- [Deployment Checklist](./production-deployment-checklist.md)
- [Security Guidelines](./SECURITY_GUIDELINES.md)
- [Code Security Analysis](./code-security-analysis.md)

**External Resources:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Vite Documentation](https://vitejs.dev/)

**Testing Tools:**
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-03 | 1.0.0 | Initial security hardening |

---

**Keep this document updated as security procedures evolve.**

Last reviewed: 2025-11-03
Next review: 2025-12-03
