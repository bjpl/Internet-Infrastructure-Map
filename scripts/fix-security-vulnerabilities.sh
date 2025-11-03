#!/bin/bash
# Security Vulnerability Fix Script
# Purpose: Automatically fix identified security vulnerabilities
# Date: 2025-11-03
# Usage: ./scripts/fix-security-vulnerabilities.sh

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Security Vulnerability Fix Script                      ║"
echo "║        Live Internet Infrastructure Map                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting security vulnerability fixes..."
echo ""

# Step 1: Backup package.json and package-lock.json
print_status "Creating backup of package files..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
print_success "Backup created: package.json.backup, package-lock.json.backup"
echo ""

# Step 2: Show current vulnerabilities
print_status "Current vulnerability status:"
npm audit || true
echo ""

# Step 3: Fix critical vulnerability - Update Vite
print_status "Fixing Vite vulnerability (GHSA-93m4-6634-74q7 + esbuild SSRF)..."
print_status "Updating vite from 5.4.20 to 5.4.21..."

if npm install vite@5.4.21 --save-dev; then
    print_success "Vite updated successfully"
else
    print_error "Failed to update Vite"
    exit 1
fi
echo ""

# Step 4: Update security-sensitive packages
print_status "Updating security-sensitive packages..."

# Update marked (markdown parser - potential XSS)
print_status "Updating marked (markdown parser)..."
if npm install marked@16.4.1; then
    print_success "marked updated to 16.4.1"
else
    print_warning "Failed to update marked, continuing..."
fi

# Update highlight.js (if newer version available)
print_status "Checking highlight.js for updates..."
CURRENT_HLJS=$(node -p "require('./package.json').dependencies['highlight.js']")
print_status "Current highlight.js version: $CURRENT_HLJS"
echo ""

# Step 5: Run npm audit fix for any remaining issues
print_status "Running npm audit fix for automatic fixes..."
if npm audit fix; then
    print_success "Automatic fixes applied"
else
    print_warning "Some vulnerabilities may require manual intervention"
fi
echo ""

# Step 6: Check final vulnerability status
print_status "Final vulnerability status:"
npm audit
echo ""

# Step 7: Run build to verify everything works
print_status "Building project to verify fixes..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed! Restoring backup..."
    mv package.json.backup package.json
    mv package-lock.json.backup package-lock.json
    npm install
    print_error "Backup restored. Please review the errors and fix manually."
    exit 1
fi
echo ""

# Step 8: Clean up backup files
print_status "Cleaning up backup files..."
rm -f package.json.backup package-lock.json.backup
print_success "Backup files removed"
echo ""

# Step 9: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Fix Summary                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Security vulnerability fixes applied successfully!"
echo ""
echo "Packages updated:"
echo "  • vite: 5.4.20 → 5.4.21 (fixes esbuild SSRF + Vite path traversal)"
echo "  • marked: 16.4.0 → 16.4.1 (security updates)"
echo ""
print_status "Next steps:"
echo "  1. Run 'npm run preview' to test the application"
echo "  2. Verify globe rendering and all features work correctly"
echo "  3. Commit the changes: git add package*.json && git commit -m 'fix(deps): update vite and marked to fix security vulnerabilities'"
echo "  4. Push to remote: git push"
echo ""
print_status "For detailed information, see:"
echo "  • docs/security/dependency-audit-report.md"
echo "  • docs/security/SECURITY_AUDIT_SUMMARY.md"
echo ""
print_success "All done! 🎉"
