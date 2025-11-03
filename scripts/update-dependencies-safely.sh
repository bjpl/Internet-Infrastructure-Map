#!/bin/bash
# Safe Dependency Update Script
# Automatically creates backups, updates, tests, and rolls back on failure
#
# Usage: ./scripts/update-dependencies-safely.sh [--security-only] [--force]
#
# Options:
#   --security-only    Only run security updates (npm audit fix)
#   --force           Allow breaking changes (npm audit fix --force)
#   --check-only      Only check for updates, don't apply
#
# Exit codes:
#   0 - Success
#   1 - Build failed (rolled back)
#   2 - Tests failed (rolled back)
#   3 - Audit still has vulnerabilities
#   4 - Backup failed
#   5 - User cancelled

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR=".dependency-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SECURITY_ONLY=false
FORCE_UPDATE=false
CHECK_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --security-only)
            SECURITY_ONLY=true
            shift
            ;;
        --force)
            FORCE_UPDATE=true
            shift
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --help)
            head -n 15 "$0" | tail -n 13
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

create_backup() {
    log_info "Creating backups..."
    mkdir -p "$BACKUP_DIR"

    if [ ! -f package.json ] || [ ! -f package-lock.json ]; then
        log_error "package.json or package-lock.json not found!"
        exit 4
    fi

    cp package.json "$BACKUP_DIR/package.json.$TIMESTAMP"
    cp package-lock.json "$BACKUP_DIR/package-lock.json.$TIMESTAMP"

    # Create symlinks to latest backup
    ln -sf "package.json.$TIMESTAMP" "$BACKUP_DIR/package.json.latest"
    ln -sf "package-lock.json.$TIMESTAMP" "$BACKUP_DIR/package-lock.json.latest"

    log_success "Backups created at $BACKUP_DIR/"
}

restore_backup() {
    log_warning "Restoring from backup..."

    if [ -f "$BACKUP_DIR/package.json.latest" ] && [ -f "$BACKUP_DIR/package-lock.json.latest" ]; then
        cp "$BACKUP_DIR/package.json.latest" package.json
        cp "$BACKUP_DIR/package-lock.json.latest" package-lock.json
        npm ci --quiet
        log_success "Restored from backup successfully"
    else
        log_error "No backup found to restore!"
        exit 4
    fi
}

check_current_state() {
    log_info "Checking current state..."
    echo ""

    log_info "Current vulnerabilities:"
    npm audit || true
    echo ""

    log_info "Outdated packages:"
    npm outdated || true
    echo ""
}

update_dependencies() {
    log_info "Updating dependencies..."

    if [ "$SECURITY_ONLY" = true ]; then
        if [ "$FORCE_UPDATE" = true ]; then
            log_warning "Running npm audit fix --force (may include breaking changes)"
            npm audit fix --force
        else
            log_info "Running npm audit fix"
            npm audit fix
        fi
    else
        log_info "Running npm update"
        npm update

        log_info "Running npm audit fix"
        npm audit fix
    fi
}

run_build() {
    log_info "Building application..."

    # Clean previous build
    rm -rf dist node_modules/.vite

    if npm run build; then
        log_success "Build successful!"
        return 0
    else
        log_error "Build failed!"
        return 1
    fi
}

run_tests() {
    log_info "Running tests..."

    if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
        if npm test; then
            log_success "Tests passed!"
            return 0
        else
            log_warning "Tests failed!"
            return 2
        fi
    else
        log_warning "No test script found, skipping tests"
        return 0
    fi
}

check_vulnerabilities() {
    log_info "Checking for remaining vulnerabilities..."

    if npm audit --audit-level=moderate; then
        log_success "No moderate or high vulnerabilities found!"
        return 0
    else
        log_warning "Vulnerabilities still present"
        return 3
    fi
}

generate_report() {
    local status=$1
    local report_file="docs/security/update-report-${TIMESTAMP}.md"

    mkdir -p docs/security

    cat > "$report_file" <<EOF
# Dependency Update Report

**Date:** $(date +%Y-%m-%d\ %H:%M:%S)
**Status:** $status
**Script Version:** 1.0.0

## Update Summary

EOF

    if [ "$status" = "SUCCESS" ]; then
        cat >> "$report_file" <<EOF
✅ Update completed successfully

### Changes Applied
$(git diff "$BACKUP_DIR/package.json.latest" package.json || echo "No git available")

### Security Audit
$(npm audit)

### Package List
$(npm list --depth=0)

### Build Output
Build succeeded. Application is ready for deployment.

### Recommendations
1. Test application thoroughly in development
2. Deploy to staging environment
3. Monitor for 24-48 hours
4. Deploy to production

EOF
    else
        cat >> "$report_file" <<EOF
❌ Update failed and was rolled back

### Reason
$status

### Current State
Rolled back to previous working state.
Backup timestamp: $TIMESTAMP

### Recommendations
1. Review error logs above
2. Check for breaking changes in updated packages
3. Consider updating packages individually
4. Consult package changelogs

EOF
    fi

    log_info "Report generated: $report_file"
}

main() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Safe Dependency Update Script                  ║${NC}"
    echo -e "${BLUE}║  Backup → Update → Test → Rollback on Failure   ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check current state
    check_current_state

    # Exit if check-only mode
    if [ "$CHECK_ONLY" = true ]; then
        log_info "Check-only mode. Exiting without updates."
        exit 0
    fi

    # Confirm with user
    echo ""
    log_warning "This will update dependencies and test the build."
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled by user"
        exit 5
    fi

    # Create backup
    create_backup

    # Update dependencies
    if ! update_dependencies; then
        log_error "Update failed!"
        restore_backup
        generate_report "Dependency update command failed"
        exit 1
    fi

    # Run build
    if ! run_build; then
        log_error "Build failed after update!"
        restore_backup
        generate_report "Build failed"
        exit 1
    fi

    # Run tests
    if ! run_tests; then
        log_error "Tests failed after update!"

        # Ask user if they want to proceed anyway
        read -p "Tests failed. Rollback? (Y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            restore_backup
            generate_report "Tests failed"
            exit 2
        else
            log_warning "Proceeding despite test failures..."
        fi
    fi

    # Check vulnerabilities
    check_vulnerabilities || log_warning "Some vulnerabilities remain"

    # Success!
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Update Completed Successfully                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    log_success "Dependencies updated successfully!"
    log_info "Backup available at: $BACKUP_DIR/"

    # Show summary
    echo ""
    log_info "Updated packages:"
    npm outdated || log_success "All packages up to date!"

    echo ""
    log_info "Security status:"
    npm audit

    # Generate success report
    generate_report "SUCCESS"

    echo ""
    log_info "Next steps:"
    echo "  1. Review changes: git diff package.json package-lock.json"
    echo "  2. Test application: npm run dev"
    echo "  3. Commit changes: git add package*.json && git commit -m 'chore: update dependencies'"
    echo "  4. Remove backup: rm -rf $BACKUP_DIR/ (after verifying)"
    echo ""
}

# Run main function
main

# Exit successfully
exit 0
