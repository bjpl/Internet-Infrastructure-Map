# Deployment Security Guide

> **Production hardening and security best practices for deploying Internet Infrastructure Map**

**Last Updated:** November 3, 2025
**Version:** 2.0
**Audience:** DevOps Engineers, System Administrators, Deployment Teams

---

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Security Headers](#security-headers)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Incident Response](#incident-response)
- [Maintenance](#maintenance)

---

## Overview

This guide covers security considerations for deploying the Internet Infrastructure Map to production. Whether deploying to GitHub Pages, a CDN, or self-hosted infrastructure, following these guidelines ensures a secure production environment.

### Deployment Security Principles

1. **HTTPS Everywhere** - All traffic encrypted
2. **Least Privilege** - Minimal permissions
3. **Defense in Depth** - Multiple security layers
4. **Monitoring** - Continuous security monitoring
5. **Updates** - Regular security patches

---

## Pre-Deployment Checklist

### Essential Security Checks

Complete this checklist before every production deployment:

#### Code Security
- [ ] All dependencies updated (`npm update`)
- [ ] Security audit passes (`npm audit`)
- [ ] No high/critical vulnerabilities
- [ ] Code review completed
- [ ] Security tests passing
- [ ] No TODO/FIXME comments with security implications

#### Configuration Security
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured
- [ ] API keys rotated (if > 90 days)
- [ ] `.env` file not committed
- [ ] `.gitignore` includes all secret files
- [ ] Build artifacts cleaned

#### Production Settings
- [ ] Debug mode disabled
- [ ] Source maps disabled (or secured)
- [ ] Error messages generic (no stack traces)
- [ ] Logging configured securely
- [ ] Rate limiting enabled
- [ ] HTTPS enforced

#### Third-Party Services
- [ ] API keys have minimal permissions
- [ ] Rate limits configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Incident response plan ready

### Automated Pre-Deployment Script

```bash
#!/bin/bash
# scripts/pre-deploy-check.sh

echo "🔒 Running pre-deployment security checks..."

# 1. Check for uncommitted .env file
if git ls-files --error-unmatch .env 2>/dev/null; then
  echo "❌ ERROR: .env file is tracked by git!"
  exit 1
fi

# 2. Run security audit
echo "📦 Running npm audit..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "❌ Security vulnerabilities found!"
  exit 1
fi

# 3. Check for hardcoded secrets
echo "🔍 Scanning for hardcoded secrets..."
if grep -r -E "(api[_-]?key|password|secret|token)\s*=\s*['\"][^'\"]{10,}" src/; then
  echo "❌ Potential hardcoded secrets found!"
  exit 1
fi

# 4. Verify environment variables
echo "🔧 Checking environment configuration..."
if [ ! -f .env.example ]; then
  echo "❌ .env.example file missing!"
  exit 1
fi

# 5. Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

# 6. Build for production
echo "🏗️ Building for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ All pre-deployment checks passed!"
```

---

## Environment Configuration

### Production Environment Variables

**GitHub Secrets Configuration:**

```yaml
# Required secrets for GitHub Actions deployment
VITE_PEERINGDB_API_KEY=<production-key>
VITE_CLOUDFLARE_RADAR_TOKEN=<production-token>

# Optional
VITE_CORS_PROXY=<proxy-url-if-needed>
VITE_ENABLE_CACHE=true
VITE_AUTO_REFRESH=true
VITE_REFRESH_INTERVAL=300000
```

**Setting Secrets in GitHub:**

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:
   - Name: `VITE_PEERINGDB_API_KEY`
   - Value: Your production API key
4. Repeat for all secrets

### Environment Separation

**RULE:** Use different API keys for each environment.

```
Development  → dev-api-key   (limited rate, test data)
Staging      → stage-api-key (production-like, higher limits)
Production   → prod-api-key  (full access, monitored)
```

### Key Permissions

**RULE:** API keys should have minimal required permissions.

**PeeringDB:**
- ✅ Read access to data centers
- ✅ Read access to networks
- ❌ Write access (not needed)
- ❌ Admin access (not needed)

**Cloudflare Radar:**
- ✅ Read Radar data
- ❌ Account access
- ❌ Zone access

---

## GitHub Pages Deployment

### Secure GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: |
          npm audit --audit-level=high
          npm audit --json > audit-report.json

      - name: Upload audit report
        uses: actions/upload-artifact@v3
        with:
          name: security-audit
          path: audit-report.json

  build-and-deploy:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with environment variables
        env:
          VITE_PEERINGDB_API_KEY: ${{ secrets.VITE_PEERINGDB_API_KEY }}
          VITE_CLOUDFLARE_RADAR_TOKEN: ${{ secrets.VITE_CLOUDFLARE_RADAR_TOKEN }}
          VITE_ENABLE_CACHE: true
          NODE_ENV: production
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Notify deployment
        if: success()
        run: |
          echo "✅ Deployment successful!"
          echo "URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/"
```

### GitHub Pages Security Configuration

**Custom Domain Setup (Recommended):**

1. Add custom domain in repository Settings → Pages
2. Enable "Enforce HTTPS" (required)
3. Configure CAA DNS records:

```dns
example.com. CAA 0 issue "letsencrypt.org"
example.com. CAA 0 issuewild "letsencrypt.org"
```

**Security Headers (via `_headers` file in dist):**

```
# dist/_headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.cloudflare.com https://api.peeringdb.com https://raw.githubusercontent.com; font-src 'self';
```

---

## Self-Hosted Deployment

### Nginx Configuration

**Secure Nginx setup for self-hosting:**

```nginx
# /etc/nginx/sites-available/internet-infrastructure-map

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (requires HTTPS for all subsequent visits)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.cloudflare.com https://api.peeringdb.com https://raw.githubusercontent.com; font-src 'self';" always;

    # Document root
    root /var/www/internet-infrastructure-map/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML files - no caching
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ (\.env|\.git|package\.json|package-lock\.json) {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }

    # Access and error logs
    access_log /var/log/nginx/internet-infrastructure-map-access.log;
    error_log /var/log/nginx/internet-infrastructure-map-error.log warn;
}
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/internet-infrastructure-map.conf

<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com

    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com

    DocumentRoot /var/www/internet-infrastructure-map/dist

    # SSL configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem
    SSLProtocol -all +TLSv1.3 +TLSv1.2
    SSLHonorCipherOrder off

    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.cloudflare.com https://api.peeringdb.com"

    # Directory configuration
    <Directory /var/www/internet-infrastructure-map/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted

        # SPA fallback
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Block sensitive files
    <FilesMatch "^\.">
        Require all denied
    </FilesMatch>

    <FilesMatch "(\.env|package\.json|package-lock\.json)$">
        Require all denied
    </FilesMatch>

    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>

    # Caching
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType text/html "access plus 0 seconds"
    </IfModule>

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/internet-infrastructure-map-error.log
    CustomLog ${APACHE_LOG_DIR}/internet-infrastructure-map-access.log combined
</VirtualHost>
```

---

## Security Headers

### Content Security Policy (CSP)

**Strict CSP for production:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self'
    https://api.cloudflare.com
    https://api.peeringdb.com
    https://raw.githubusercontent.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

**Why these directives:**

- `default-src 'self'` - Only load resources from same origin
- `script-src 'unsafe-inline'` - Required for inline scripts (minimize in future)
- `connect-src` - Whitelist API domains
- `frame-ancestors 'none'` - Prevent clickjacking
- `upgrade-insecure-requests` - Auto-upgrade HTTP to HTTPS

### Complete Security Headers

```
# Comprehensive security headers for production

# Prevent clickjacking
X-Frame-Options: DENY

# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Enable XSS filter
X-XSS-Protection: 1; mode=block

# Referrer policy
Referrer-Policy: strict-origin-when-cross-origin

# Permissions policy (disable unnecessary features)
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()

# HSTS (only after testing!)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

# Content Security Policy (see above)
Content-Security-Policy: ...
```

---

## SSL/TLS Configuration

### Let's Encrypt Setup

**Automated SSL certificate with Certbot:**

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d example.com -d www.example.com

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal (cron already set up by certbot)
# Verify with: sudo systemctl status certbot.timer
```

### SSL Testing

**Test your SSL configuration:**

```bash
# Check certificate validity
openssl s_client -connect example.com:443 -servername example.com

# Test SSL configuration
curl -I https://example.com

# Use online tools
# - https://www.ssllabs.com/ssltest/
# - https://securityheaders.com/
# - https://observatory.mozilla.org/
```

**Target: A+ rating on SSL Labs**

---

## Monitoring & Logging

### Access Logging

**Log important security events:**

```nginx
# Nginx logging format
log_format security '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time '
                    '$ssl_protocol/$ssl_cipher';

access_log /var/log/nginx/security.log security;
```

### Security Monitoring

**Monitor for suspicious activity:**

```bash
# Monitor failed requests
tail -f /var/log/nginx/error.log | grep -E "(403|404|500)"

# Monitor rate limiting
tail -f /var/log/nginx/error.log | grep "limiting requests"

# Monitor SSL errors
tail -f /var/log/nginx/error.log | grep "SSL"

# Analyze access patterns
cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20
```

### Automated Monitoring

**Set up monitoring with a service:**

```yaml
# Example: Uptime monitoring configuration
monitors:
  - name: Internet Infrastructure Map
    url: https://example.com
    interval: 60 # seconds
    alerts:
      - type: email
        recipients: ["admin@example.com"]
      - type: slack
        webhook: "https://hooks.slack.com/..."

  - name: API Health Check
    url: https://example.com/api/health
    interval: 300
    expected_status: 200

security_checks:
  - type: ssl_expiry
    warn_days: 30
  - type: security_headers
    required:
      - Strict-Transport-Security
      - X-Frame-Options
      - Content-Security-Policy
```

---

## Incident Response

### Security Incident Checklist

**If a security incident occurs:**

1. **Immediate Actions (First 15 minutes)**
   - [ ] Assess severity and scope
   - [ ] Isolate affected systems if needed
   - [ ] Document everything
   - [ ] Notify security team

2. **Investigation (First hour)**
   - [ ] Review logs for indicators of compromise
   - [ ] Identify attack vector
   - [ ] Determine data/systems affected
   - [ ] Check for persistence mechanisms

3. **Containment (First 4 hours)**
   - [ ] Rotate all API keys and secrets
   - [ ] Block malicious IPs
   - [ ] Patch vulnerabilities
   - [ ] Deploy fixes

4. **Recovery (First 24 hours)**
   - [ ] Restore from clean backups if needed
   - [ ] Verify system integrity
   - [ ] Monitor for recurrence
   - [ ] Document incident

5. **Post-Incident (First week)**
   - [ ] Write incident report
   - [ ] Update security measures
   - [ ] Notify affected parties if required
   - [ ] Conduct lessons learned session

See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for detailed procedures.

---

## Maintenance

### Regular Security Tasks

#### Daily
- [ ] Review access logs for anomalies
- [ ] Check monitoring alerts
- [ ] Verify SSL certificate status

#### Weekly
- [ ] Run `npm audit`
- [ ] Review security advisories
- [ ] Check dependency updates
- [ ] Review error logs

#### Monthly
- [ ] Update dependencies
- [ ] Rotate API keys (if due)
- [ ] Review access controls
- [ ] Test backup restoration
- [ ] Review security headers

#### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review incident response plan
- [ ] Update security documentation
- [ ] Security training for team

### Automated Maintenance Script

```bash
#!/bin/bash
# scripts/security-maintenance.sh

echo "🔒 Running security maintenance checks..."

# 1. Check SSL certificate expiry
echo "📜 Checking SSL certificate..."
EXPIRY=$(echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
  echo "⚠️ SSL certificate expires in $DAYS_LEFT days!"
fi

# 2. Check for security updates
echo "📦 Checking for security updates..."
npm audit --audit-level=moderate --json > audit.json

# 3. Check dependency age
echo "📅 Checking dependency freshness..."
npm outdated

# 4. Test security headers
echo "🔐 Testing security headers..."
curl -I -s https://example.com | grep -E "(X-Frame-Options|Strict-Transport-Security|Content-Security-Policy)"

# 5. Check log size
echo "📝 Checking log sizes..."
du -sh /var/log/nginx/*.log

echo "✅ Maintenance check complete!"
```

---

## Resources

### Security Tools
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL configuration testing
- [Security Headers](https://securityheaders.com/) - HTTP security headers
- [Mozilla Observatory](https://observatory.mozilla.org/) - Overall security score
- [Cloudflare SSL Test](https://www.cloudflare.com/ssl/ssl-diagnostic-test/)

### Documentation
- [OWASP Deployment Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Security](https://nginx.org/en/docs/http/configuring_https_servers.html)

---

**Questions?** Contact security@internet-infrastructure-map.dev
