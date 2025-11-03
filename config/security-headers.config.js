/**
 * Security Headers Configuration
 *
 * This configuration defines security headers for the application.
 * Import and use in your server configuration or build process.
 *
 * @module security-headers
 */

/**
 * Content Security Policy (CSP) configuration
 * Prevents XSS, injection attacks, and unauthorized resource loading
 */
export const CSP_DIRECTIVES = {
  // Default fallback for all resource types
  'default-src': ["'self'"],

  // JavaScript sources
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite HMR and inline scripts
    'https://cdnjs.cloudflare.com' // Highlight.js
  ],

  // CSS sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    'https://fonts.googleapis.com',
    'https://cdnjs.cloudflare.com'
  ],

  // Font sources
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],

  // Image sources (including data URIs and blobs for canvas/globe)
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],

  // API and WebSocket connections
  'connect-src': [
    "'self'",
    'https://api.peeringdb.com',
    'https://api.cloudflare.com',
    'https://raw.githubusercontent.com'
  ],

  // Prevent embedding in frames (clickjacking protection)
  'frame-ancestors': ["'none'"],

  // Base tag restrictions
  'base-uri': ["'self'"],

  // Form submission restrictions
  'form-action': ["'self'"],

  // Upgrade insecure requests to HTTPS
  'upgrade-insecure-requests': []
};

/**
 * Convert CSP directives object to CSP header string
 * @param {Object} directives - CSP directives object
 * @returns {string} CSP header value
 */
export function buildCSPHeader(directives = CSP_DIRECTIVES) {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Permissions Policy (formerly Feature Policy) configuration
 * Disables unnecessary browser features
 */
export const PERMISSIONS_POLICY = {
  'geolocation': [],
  'microphone': [],
  'camera': [],
  'payment': [],
  'usb': [],
  'magnetometer': [],
  'gyroscope': [],
  'accelerometer': []
};

/**
 * Convert Permissions Policy object to header string
 * @param {Object} policy - Permissions policy object
 * @returns {string} Permissions Policy header value
 */
export function buildPermissionsPolicyHeader(policy = PERMISSIONS_POLICY) {
  return Object.entries(policy)
    .map(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        return `${feature}=()`;
      }
      return `${feature}=(${allowlist.join(' ')})`;
    })
    .join(', ');
}

/**
 * Complete security headers configuration
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': buildCSPHeader(),

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // XSS Protection (legacy, but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy - balance privacy and functionality
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': buildPermissionsPolicyHeader(),

  // Note: HSTS (Strict-Transport-Security) should be set server-side only
  // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

/**
 * Meta tags for HTML <head> section
 * Use when server-side headers cannot be configured
 */
export function generateSecurityMetaTags() {
  return `
    <!-- Security Headers via Meta Tags -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta name="referrer" content="strict-origin-when-cross-origin">

    <!-- Content Security Policy -->
    <meta http-equiv="Content-Security-Policy" content="${buildCSPHeader()}">

    <!-- Permissions Policy -->
    <meta http-equiv="Permissions-Policy" content="${buildPermissionsPolicyHeader()}">
  `.trim();
}

/**
 * Vite plugin to inject security headers as meta tags
 * @returns {Object} Vite plugin object
 */
export function viteSecurityHeadersPlugin() {
  return {
    name: 'inject-security-headers',
    transformIndexHtml(html) {
      const metaTags = generateSecurityMetaTags();
      return html.replace('</head>', `  ${metaTags}\n  </head>`);
    }
  };
}

/**
 * Express middleware to set security headers
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function expressSecurityHeaders(req, res, next) {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
}

/**
 * Cloudflare Workers headers configuration
 * @param {Response} response - Response object
 * @returns {Response} Response with security headers
 */
export function addCloudflareSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);

  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    newHeaders.set(header, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/**
 * Validate and sanitize CSP report
 * Use with a CSP report-uri endpoint
 * @param {Object} report - CSP violation report
 * @returns {Object} Sanitized report
 */
export function sanitizeCSPReport(report) {
  return {
    documentUri: report['document-uri'] || '',
    violatedDirective: report['violated-directive'] || '',
    effectiveDirective: report['effective-directive'] || '',
    blockedUri: report['blocked-uri'] || '',
    statusCode: report['status-code'] || 0,
    timestamp: new Date().toISOString()
  };
}

export default SECURITY_HEADERS;
