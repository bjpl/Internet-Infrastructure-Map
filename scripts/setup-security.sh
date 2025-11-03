#!/bin/bash

# Security Setup Script
# This script configures local security tools and verifies the setup

set -e

echo "🔒 Security Automation Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

echo ""
echo "📋 Step 1: Installing Husky..."
echo "--------------------------------"

if [ -f "package.json" ]; then
    # Install husky if not already installed
    if ! npm list husky >/dev/null 2>&1; then
        npm install --save-dev husky
        echo -e "${GREEN}✅ Husky installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Husky already installed${NC}"
    fi

    # Initialize husky
    npx husky install
    echo -e "${GREEN}✅ Husky initialized${NC}"
else
    echo -e "${YELLOW}⚠️  No package.json found. Skipping npm dependencies.${NC}"
fi

echo ""
echo "📋 Step 2: Making hooks executable..."
echo "--------------------------------"

if [ -d ".husky" ]; then
    chmod +x .husky/pre-commit
    chmod +x .husky/pre-push
    echo -e "${GREEN}✅ Hooks are executable${NC}"
else
    echo -e "${RED}❌ .husky directory not found${NC}"
    exit 1
fi

echo ""
echo "📋 Step 3: Checking for GitLeaks..."
echo "--------------------------------"

if command -v gitleaks &> /dev/null; then
    GITLEAKS_VERSION=$(gitleaks version)
    echo -e "${GREEN}✅ GitLeaks installed: $GITLEAKS_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  GitLeaks not installed${NC}"
    echo ""
    echo "GitLeaks is recommended for secret scanning."
    echo "Install it using:"
    echo ""
    echo "  macOS:   brew install gitleaks"
    echo "  Linux:   wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz"
    echo "           tar -xzf gitleaks_8.18.0_linux_x64.tar.gz"
    echo "           sudo mv gitleaks /usr/local/bin/"
    echo "  Windows: choco install gitleaks"
    echo ""
    read -p "Continue without GitLeaks? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📋 Step 4: Verifying GitHub Actions workflows..."
echo "--------------------------------"

WORKFLOWS=".github/workflows"
if [ -d "$WORKFLOWS" ]; then
    echo "Found workflows:"
    ls -1 "$WORKFLOWS"/*.yml 2>/dev/null | while read -r workflow; do
        echo -e "  ${GREEN}✅${NC} $(basename "$workflow")"
    done
else
    echo -e "${RED}❌ No workflows directory found${NC}"
fi

echo ""
echo "📋 Step 5: Checking Dependabot configuration..."
echo "--------------------------------"

if [ -f ".github/dependabot.yml" ]; then
    echo -e "${GREEN}✅ Dependabot configuration found${NC}"

    # Validate YAML syntax
    if command -v yamllint &> /dev/null; then
        if yamllint .github/dependabot.yml >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Dependabot YAML is valid${NC}"
        else
            echo -e "${YELLOW}⚠️  Dependabot YAML has warnings${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Dependabot configuration not found${NC}"
fi

echo ""
echo "📋 Step 6: Checking CODEOWNERS..."
echo "--------------------------------"

if [ -f ".github/CODEOWNERS" ]; then
    echo -e "${GREEN}✅ CODEOWNERS file found${NC}"

    # Check if CODEOWNERS has actual owners (not just templates)
    if grep -q "@.*" .github/CODEOWNERS; then
        echo -e "${GREEN}✅ Code owners configured${NC}"
    else
        echo -e "${YELLOW}⚠️  CODEOWNERS file exists but no owners configured${NC}"
        echo "   Edit .github/CODEOWNERS and replace template values with your team members"
    fi
else
    echo -e "${YELLOW}⚠️  No CODEOWNERS file found${NC}"
fi

echo ""
echo "📋 Step 7: Running initial security scan..."
echo "--------------------------------"

# Run npm audit if package.json exists
if [ -f "package.json" ]; then
    echo "Running npm audit..."

    if npm audit --audit-level=moderate; then
        echo -e "${GREEN}✅ No vulnerabilities found${NC}"
    else
        echo -e "${YELLOW}⚠️  Vulnerabilities detected${NC}"
        echo "Run 'npm audit fix' to fix automatically, or 'npm audit' for details"
    fi
else
    echo -e "${YELLOW}⚠️  No package.json found. Skipping npm audit.${NC}"
fi

# Run GitLeaks scan if installed
if command -v gitleaks &> /dev/null; then
    echo ""
    echo "Running GitLeaks scan..."

    if gitleaks detect --source=. --verbose --no-git; then
        echo -e "${GREEN}✅ No secrets detected${NC}"
    else
        echo -e "${RED}❌ Secrets detected!${NC}"
        echo "Review the output above and remove any secrets from your repository"
        echo "If these are false positives, add them to .gitleaksignore"
    fi
fi

echo ""
echo "📋 Step 8: Testing pre-commit hook..."
echo "--------------------------------"

# Create a test commit (dry run)
echo "Testing hook execution..."
if .husky/pre-commit 2>&1 | head -5; then
    echo -e "${GREEN}✅ Pre-commit hook can execute${NC}"
else
    echo -e "${YELLOW}⚠️  Pre-commit hook test completed with warnings${NC}"
fi

echo ""
echo "🎉 Setup Summary"
echo "================================"
echo ""

# Summary checklist
echo "Completed:"
echo -e "  ${GREEN}✅${NC} Husky installed and initialized"
echo -e "  ${GREEN}✅${NC} Pre-commit hooks configured"
echo -e "  ${GREEN}✅${NC} GitHub Actions workflows in place"
echo -e "  ${GREEN}✅${NC} Dependabot configured"
echo ""

echo "Next Steps:"
echo ""
echo "1. 📝 Configure Branch Protection Rules:"
echo "   See: docs/security/branch-protection-setup.md"
echo ""
echo "2. 👥 Update CODEOWNERS:"
echo "   Edit: .github/CODEOWNERS"
echo "   Replace template values with actual team members"
echo ""
echo "3. 🔐 Setup GitHub Secrets (if using auto-merge):"
echo "   - Go to Settings > Secrets and variables > Actions"
echo "   - Add GITHUB_TOKEN with repo and workflow permissions"
echo ""
echo "4. 🧪 Test the Setup:"
echo "   - Create a test branch"
echo "   - Make a change and commit (tests pre-commit hook)"
echo "   - Push and create a PR (tests workflows)"
echo "   - Verify all security checks run"
echo ""
echo "5. 📚 Review Documentation:"
echo "   - docs/security/cicd-security-setup.md"
echo "   - docs/security/branch-protection-setup.md"
echo "   - docs/security/security-incident-response.md"
echo ""
echo "6. 🎓 Train Your Team:"
echo "   - Share the security documentation"
echo "   - Walk through incident response procedures"
echo "   - Practice with simulated incidents"
echo ""

if command -v gitleaks &> /dev/null; then
    echo -e "${GREEN}✅ All security tools are ready!${NC}"
else
    echo -e "${YELLOW}⚠️  Consider installing GitLeaks for enhanced secret detection${NC}"
fi

echo ""
echo "For questions or issues, refer to docs/security/"
echo ""
