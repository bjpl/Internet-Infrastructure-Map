#!/bin/bash
################################################################################
# Branch Protection Configuration Script
#
# Purpose: Automate GitHub branch protection rule configuration via GitHub CLI
# Requirements: gh CLI installed and authenticated
# Usage: ./scripts/configure-branch-protection.sh
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        echo "Install from: https://cli.github.com/"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated"
        echo "Run: gh auth login"
        exit 1
    fi

    log_info "Prerequisites check passed"
}

# Verify repository access
verify_repo_access() {
    log_info "Verifying repository access..."

    if ! gh repo view "${REPO_FULL}" &> /dev/null; then
        log_error "Cannot access repository: ${REPO_FULL}"
        exit 1
    fi

    log_info "Repository access verified"
}

# Configure main branch protection (STRICT)
configure_main_branch() {
    log_info "Configuring MAIN branch protection (STRICT)..."

    gh api repos/${REPO_FULL}/branches/main/protection \
        --method PUT \
        --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "security-scan",
      "dependency-audit",
      "build",
      "test"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF

    if [ $? -eq 0 ]; then
        log_info "✅ Main branch protection configured successfully"
    else
        log_error "❌ Failed to configure main branch protection"
        return 1
    fi
}

# Configure develop branch protection (MODERATE)
configure_develop_branch() {
    log_info "Configuring DEVELOP branch protection (MODERATE)..."

    # First, check if develop branch exists
    if ! gh api repos/${REPO_FULL}/branches/develop &> /dev/null; then
        log_warn "Develop branch does not exist, skipping configuration"
        return 0
    fi

    gh api repos/${REPO_FULL}/branches/develop/protection \
        --method PUT \
        --input - <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "security-scan",
      "build"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF

    if [ $? -eq 0 ]; then
        log_info "✅ Develop branch protection configured successfully"
    else
        log_error "❌ Failed to configure develop branch protection"
        return 1
    fi
}

# Main execution
main() {
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║         GitHub Branch Protection Configuration Script         ║"
    echo "║                Repository: ${REPO_FULL}        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    check_prerequisites
    verify_repo_access

    echo ""
    log_warn "This script will configure branch protection rules for:"
    echo "  • main branch (STRICT protection)"
    echo "  • develop branch (MODERATE protection)"
    echo ""
    read -p "Continue? (y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Configuration cancelled by user"
        exit 0
    fi

    echo ""
    configure_main_branch
    echo ""
    configure_develop_branch

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    Configuration Complete                      ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    log_info "Run ./scripts/verify-branch-protection.sh to verify the configuration"
}

# Execute main function
main "$@"
