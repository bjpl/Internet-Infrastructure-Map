#!/bin/bash
################################################################################
# Branch Protection Verification Script
#
# Purpose: Verify GitHub branch protection rules are configured correctly
# Requirements: gh CLI installed and authenticated, jq for JSON parsing
# Usage: ./scripts/verify-branch-protection.sh
#
# Created: 2025-11-03
# Repository: Internet-Infrastructure-Map
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
REPO_OWNER="bjpl"
REPO_NAME="Internet-Infrastructure-Map"
REPO_FULL="${REPO_OWNER}/${REPO_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        echo "Install from: https://cli.github.com/"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_warn "jq is not installed - output will be raw JSON"
        echo "Install jq for formatted output: https://stedolan.github.io/jq/"
        USE_JQ=false
    else
        USE_JQ=true
    fi

    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated"
        echo "Run: gh auth login"
        exit 1
    fi

    log_info "Prerequisites check passed"
}

# Verify main branch protection
verify_main_branch() {
    log_section "MAIN BRANCH PROTECTION"

    log_info "Fetching main branch protection rules..."

    if ! gh api repos/${REPO_FULL}/branches/main/protection > /tmp/main-protection.json 2>&1; then
        log_error "Failed to fetch main branch protection rules"
        log_warn "Branch protection may not be configured"
        return 1
    fi

    if [ "$USE_JQ" = true ]; then
        echo ""
        echo "Required Status Checks:"
        jq '.required_status_checks' /tmp/main-protection.json

        echo ""
        echo "Pull Request Reviews:"
        jq '.required_pull_request_reviews' /tmp/main-protection.json

        echo ""
        echo "Enforce Admins:"
        jq '.enforce_admins.enabled' /tmp/main-protection.json

        echo ""
        echo "Required Linear History:"
        jq '.required_linear_history.enabled' /tmp/main-protection.json

        echo ""
        echo "Allow Force Pushes:"
        jq '.allow_force_pushes.enabled' /tmp/main-protection.json

        echo ""
        echo "Allow Deletions:"
        jq '.allow_deletions.enabled' /tmp/main-protection.json

        echo ""
        echo "Required Conversation Resolution:"
        jq '.required_conversation_resolution.enabled' /tmp/main-protection.json
    else
        cat /tmp/main-protection.json
    fi

    log_info "✅ Main branch protection rules retrieved"
}

# Verify develop branch protection
verify_develop_branch() {
    log_section "DEVELOP BRANCH PROTECTION"

    # Check if develop branch exists
    if ! gh api repos/${REPO_FULL}/branches/develop &> /dev/null; then
        log_warn "Develop branch does not exist"
        return 0
    fi

    log_info "Fetching develop branch protection rules..."

    if ! gh api repos/${REPO_FULL}/branches/develop/protection > /tmp/develop-protection.json 2>&1; then
        log_error "Failed to fetch develop branch protection rules"
        log_warn "Branch protection may not be configured"
        return 1
    fi

    if [ "$USE_JQ" = true ]; then
        echo ""
        echo "Required Status Checks:"
        jq '.required_status_checks' /tmp/develop-protection.json

        echo ""
        echo "Pull Request Reviews:"
        jq '.required_pull_request_reviews' /tmp/develop-protection.json

        echo ""
        echo "Enforce Admins:"
        jq '.enforce_admins.enabled' /tmp/develop-protection.json
    else
        cat /tmp/develop-protection.json
    fi

    log_info "✅ Develop branch protection rules retrieved"
}

# Verify required status checks
verify_status_checks() {
    log_section "REQUIRED STATUS CHECKS"

    log_info "Verifying required status checks for main branch..."

    if [ "$USE_JQ" = true ]; then
        gh api repos/${REPO_FULL}/branches/main/protection/required_status_checks | jq '.'
    else
        gh api repos/${REPO_FULL}/branches/main/protection/required_status_checks
    fi

    log_info "✅ Status checks configuration retrieved"
}

# Check branch list
list_protected_branches() {
    log_section "PROTECTED BRANCHES"

    log_info "Listing all branches with protection rules..."

    if [ "$USE_JQ" = true ]; then
        gh api repos/${REPO_FULL}/branches --paginate | jq -r '.[] | select(.protected == true) | "• \(.name) (protected: \(.protected))"'
    else
        gh api repos/${REPO_FULL}/branches --paginate
    fi
}

# Generate verification report
generate_report() {
    log_section "VERIFICATION SUMMARY"

    echo "Repository: ${REPO_FULL}"
    echo "Verification Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # Check main branch
    if gh api repos/${REPO_FULL}/branches/main/protection &> /dev/null; then
        echo "✅ Main branch protection: CONFIGURED"
    else
        echo "❌ Main branch protection: NOT CONFIGURED"
    fi

    # Check develop branch
    if gh api repos/${REPO_FULL}/branches/develop &> /dev/null; then
        if gh api repos/${REPO_FULL}/branches/develop/protection &> /dev/null; then
            echo "✅ Develop branch protection: CONFIGURED"
        else
            echo "❌ Develop branch protection: NOT CONFIGURED"
        fi
    else
        echo "⚠️  Develop branch: DOES NOT EXIST"
    fi

    echo ""
    log_info "Full JSON reports saved to /tmp/main-protection.json and /tmp/develop-protection.json"
}

# Main execution
main() {
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║       GitHub Branch Protection Verification Script            ║"
    echo "║              Repository: ${REPO_FULL}        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    check_prerequisites

    verify_main_branch
    echo ""

    verify_develop_branch
    echo ""

    verify_status_checks
    echo ""

    list_protected_branches
    echo ""

    generate_report

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                  Verification Complete                         ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
}

# Execute main function
main "$@"
